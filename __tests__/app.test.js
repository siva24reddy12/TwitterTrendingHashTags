const request = require('supertest');
const app = require('../index');

describe('Hashtag API', () => {

    // Clear rate limit before each test to avoid interference
    beforeEach(() => {
        if (app.clearRateLimitStore) {
            app.clearRateLimitStore();
        }
    });

    it('should accept a tweet', async () => {
        const res = await request(app)
            .post('/tweet')
            .send({ tweet: 'Testing #CI #NodeJS'});

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Tweet processed');
    });

    it('should return trending hashtags', async () => {
        const res = await request(app).get('/trending-hashtags');

        expect(res.statusCode).toEqual(200);
        expect(res.body.hashtags).toBeInstanceOf(Array);
    });

    // Health check endpoint tests
    it('should return health status', async () => {
        const res = await request(app).get('/health');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('memory');
        expect(res.body).toHaveProperty('stats');
        expect(res.body).toHaveProperty('timestamp');
    });

    // Metrics endpoint tests
    it('should return metrics', async () => {
        const res = await request(app).get('/metrics');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('tweets');
        expect(res.body).toHaveProperty('hashtags');
        expect(res.body).toHaveProperty('memory');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body.tweets).toHaveProperty('total');
        expect(res.body.tweets).toHaveProperty('unique');
        expect(res.body.tweets).toHaveProperty('duplicates');
    });

    // Rate limiting tests
    it('should apply rate limiting after multiple requests', async () => {
        const requests = [];
        
        // In test environment, we have higher limits, so send more requests
        const requestCount = process.env.NODE_ENV === 'test' ? 1100 : 105;
        
        // Send multiple requests rapidly (more than rate limit)
        for (let i = 0; i < requestCount; i++) {
            requests.push(
                request(app)
                    .post('/tweet')
                    .send({ tweet: `Rate limit test tweet ${i} #test${i}` })
            );
        }

        const responses = await Promise.all(requests);
        
        // Some requests should be rate limited (429 status)
        const rateLimitedResponses = responses.filter(res => res.statusCode === 429);
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
        
        // Rate limited responses should have proper error message
        if (rateLimitedResponses.length > 0) {
            expect(rateLimitedResponses[0].body).toHaveProperty('error', 'Rate limit exceeded');
            expect(rateLimitedResponses[0].body).toHaveProperty('retryAfter');
        }
    }, 15000); // Increase timeout for this test

    // Duplicate tweet handling
    it('should handle duplicate tweets correctly', async () => {
        const tweetText = 'Duplicate test #unique #test';
        
        // First submission
        const res1 = await request(app)
            .post('/tweet')
            .send({ tweet: tweetText });
        
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.message).toBe('Tweet processed');

        // Second submission (duplicate)
        const res2 = await request(app)
            .post('/tweet')
            .send({ tweet: tweetText });
        
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.message).toBe('Duplicate tweet ignored');
    });

    // Error handling
    it('should return error for missing tweet', async () => {
        const res = await request(app)
            .post('/tweet')
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Tweet is required');
    });

    // Statistics validation
    it('should track statistics correctly', async () => {
        // Submit a test tweet
        await request(app)
            .post('/tweet')
            .send({ tweet: 'Stats test #statistics #tracking' });

        const res = await request(app).get('/metrics');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.tweets.total).toBeGreaterThan(0);
        expect(res.body.hashtags.unique).toBeGreaterThan(0);
        expect(res.body.hashtags.total).toBeGreaterThan(0);
    });
});