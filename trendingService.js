const fs = require('fs');
const path = './storage.json';

let hashtagCount = {};
let tweetCache = new Set(); // avoid duplicate processing
const MAX_TOP = 25;

// Statistics tracking
let stats = {
    totalTweets: 0,
    uniqueTweets: 0,
    uniqueHashtags: 0,
    totalHashtagCount: 0,
    startTime: Date.now()
};

function extractHashtags(tweet) {
    const regex = /#\w+/g;
    return tweet.match(regex)?.map(tag => tag.toLowerCase()) || [];
}

function processTweet(tweet) {
    const hash = tweet.trim().toLowerCase();
    stats.totalTweets++;

    if (tweetCache.has(hash)) return false;

    tweetCache.add(hash);
    stats.uniqueTweets++;
    
    const tags = extractHashtags(tweet);

    tags.forEach(tag => {
        if (!hashtagCount[tag]) {
            stats.uniqueHashtags++;
        }
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        stats.totalHashtagCount++;
    });

    return true;
}

function getTopHashtags() {
    return Object.entries(hashtagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_TOP)
        .map(([tag, count]) => ({ tag, count }));
}


function saveData() {
    const data = {
        hashtagCount,
        tweetCache: Array.from(tweetCache),
        stats
    };
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        console.log('Saved state to storage.json');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function loadData() {
    if (!fs.existsSync(path)) return;
    try {
        const raw = fs.readFileSync(path);
        const data = JSON.parse(raw);
        hashtagCount = data.hashtagCount || {};
        tweetCache = new Set(data.tweetCache || []);
        
        // Load stats or recalculate if missing
        if (data.stats) {
            stats = { ...stats, ...data.stats };
        } else {
            // Recalculate stats from existing data
            stats.uniqueTweets = tweetCache.size;
            stats.uniqueHashtags = Object.keys(hashtagCount).length;
            stats.totalHashtagCount = Object.values(hashtagCount).reduce((sum, count) => sum + count, 0);
        }
        
        console.log('Loaded state from storage.json');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function getStats() {
    return {
        ...stats,
        uptime: Date.now() - stats.startTime,
        cacheSize: tweetCache.size,
        hashtagTypes: Object.keys(hashtagCount).length
    };
}

module.exports = {
    processTweet,
    getTopHashtags,
    saveData,
    loadData,
    getStats
};
