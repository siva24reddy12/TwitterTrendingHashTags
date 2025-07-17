const express = require('express');
const cluster = require('cluster');
const os = require('os');
const trendingService = require('./trendingService');

const app = express();
app.use(express.json());

// Rate limiting store for in-memory tracking
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = process.env.NODE_ENV === 'test' ? 1000 : 100; // Higher limit for tests

// Rate limiting middleware
function rateLimit(req, res, next) {
    // Skip rate limiting for health and metrics endpoints
    if (req.path === '/health' || req.path === '/metrics' || req.path === '/trending-hashtags') {
        return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Clean old entries
    for (const [ip, requests] of rateLimitStore.entries()) {
        rateLimitStore.set(ip, requests.filter(time => time > windowStart));
        if (rateLimitStore.get(ip).length === 0) {
            rateLimitStore.delete(ip);
        }
    }
    
    // Check current IP
    const requests = rateLimitStore.get(clientIP) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded', 
            retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
        });
    }
    
    recentRequests.push(now);
    rateLimitStore.set(clientIP, recentRequests);
    next();
}

app.use(rateLimit);

app.post('/tweet', (req, res) => {
    const tweet = req.body.tweet;
    if (!tweet) return res.status(400).json({ error: 'Tweet is required' });

    const added = trendingService.processTweet(tweet);
    res.status(200).json({
        message: added ? 'Tweet processed' : 'Duplicate tweet ignored'
    });
});

app.get('/trending-hashtags', (req, res) => {
    const hashtags = trendingService.getTopHashtags();
    res.json({ hashtags });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const stats = trendingService.getStats();
    
    res.json({
        status: 'healthy',
        worker: cluster.worker ? cluster.worker.id : 'master',
        uptime: uptime,
        memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        },
        stats: stats,
        timestamp: new Date().toISOString()
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    const stats = trendingService.getStats();
    const memUsage = process.memoryUsage();
    
    res.json({
        tweets: {
            total: stats.totalTweets,
            unique: stats.uniqueTweets,
            duplicates: stats.totalTweets - stats.uniqueTweets
        },
        hashtags: {
            unique: stats.uniqueHashtags,
            total: stats.totalHashtagCount
        },
        memory: memUsage,
        uptime: process.uptime(),
        worker: cluster.worker ? cluster.worker.id : 'master'
    });
});

if (require.main === module) {
    const numCPUs = os.cpus().length;
    const CLUSTER_WORKERS = process.env.CLUSTER_WORKERS || Math.min(numCPUs, 4); // Max 4 workers

    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
        console.log(`Starting ${CLUSTER_WORKERS} workers...`);

        // Fork workers
        for (let i = 0; i < CLUSTER_WORKERS; i++) {
            cluster.fork();
        }

        // Handle worker exit
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
            console.log('Starting a new worker...');
            cluster.fork();
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('Master received SIGINT, shutting down workers...');
            for (const id in cluster.workers) {
                cluster.workers[id].kill();
            }
            process.exit();
        });

        process.on('SIGTERM', () => {
            console.log('Master received SIGTERM, shutting down workers...');
            for (const id in cluster.workers) {
                cluster.workers[id].kill();
            }
            process.exit();
        });

    } else {
        // Worker process
        trendingService.loadData();

        // On shutdown, save data (only from one worker to avoid conflicts)
        process.on('SIGINT', () => {
            if (cluster.worker.id === 1) { // Only worker 1 saves data
                trendingService.saveData();
            }
            process.exit();
        });

        process.on('SIGTERM', () => {
            if (cluster.worker.id === 1) { // Only worker 1 saves data
                trendingService.saveData();
            }
            process.exit();
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Worker ${process.pid} started server on http://localhost:${PORT}`);
        });
    }
}
process.on('SIGINT', () => {
    if (!cluster.isMaster && cluster.worker.id === 1) {
        trendingService.saveData();
    }
    process.exit();
});

process.on('SIGTERM', () => {
    if (!cluster.isMaster && cluster.worker.id === 1) {
        trendingService.saveData();
    }
    process.exit();
});

module.exports = app;

// Export rate limit functions for testing
module.exports.clearRateLimitStore = () => rateLimitStore.clear();
module.exports.getRateLimitStore = () => rateLimitStore;
