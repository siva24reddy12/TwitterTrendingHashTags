const request = require('supertest');
const app = require('../index');

describe('Scaling Features', () => {
    
    // Test high volume processing
    it('should handle high volume of tweets efficiently', async () => {
        const startTime = Date.now();
        const tweets = [];
        
        // Generate 100 unique tweets
        for (let i = 0; i < 100; i++) {
            tweets.push({
                tweet: `High volume test tweet ${i} #performance #scaling #test${i % 10}`
            });
        }
        
        // Process all tweets
        const responses = await Promise.all(
            tweets.map(tweet => 
                request(app).post('/tweet').send(tweet)
            )
        );
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        // All should succeed (200 status)
        responses.forEach(res => {
            expect([200, 429]).toContain(res.statusCode); // Accept rate limit responses
        });
        
        // Should complete within reasonable time (10 seconds)
        expect(processingTime).toBeLessThan(10000);
        
        console.log(`Processed ${tweets.length} tweets in ${processingTime}ms`);
        
        // Verify data was processed correctly
        const metricsRes = await request(app).get('/metrics');
        expect(metricsRes.body.tweets.total).toBeGreaterThan(0);
    }, 15000);

    // Test concurrent requests
    it('should handle concurrent requests', async () => {
        const concurrentRequests = 20;
        const requests = [];
        
        // Create concurrent requests
        for (let i = 0; i < concurrentRequests; i++) {
            requests.push(
                request(app)
                    .post('/tweet')
                    .send({ tweet: `Concurrent test ${i} #concurrent #load${i}` })
            );
        }
        
        // Execute all concurrently
        const responses = await Promise.all(requests);
        
        // Count successful vs rate limited
        const successful = responses.filter(res => res.statusCode === 200);
        const rateLimited = responses.filter(res => res.statusCode === 429);
        
        console.log(`Concurrent test: ${successful.length} successful, ${rateLimited.length} rate limited`);
        
        // Should have some successful requests
        expect(successful.length).toBeGreaterThan(0);
        
        // Total should equal our request count
        expect(successful.length + rateLimited.length).toBe(concurrentRequests);
    }, 10000);

    // Test memory efficiency
    it('should maintain reasonable memory usage', async () => {
        // Get initial memory
        const initialMetrics = await request(app).get('/metrics');
        const initialMemory = initialMetrics.body.memory.heapUsed;
        
        // Process a batch of tweets
        const tweets = [];
        for (let i = 0; i < 50; i++) {
            tweets.push({ tweet: `Memory test ${i} #memory #efficiency #test${i}` });
        }
        
        await Promise.all(
            tweets.map(tweet => request(app).post('/tweet').send(tweet))
        );
        
        // Get final memory
        const finalMetrics = await request(app).get('/metrics');
        const finalMemory = finalMetrics.body.memory.heapUsed;
        
        // Memory increase should be reasonable (less than 100MB)
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
        
        console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    }, 10000);

    // Test trending hashtags performance under load
    it('should return trending hashtags quickly under load', async () => {
        // Submit some tweets first
        const tweets = [
            'Performance test #nodejs #express #scaling',
            'Another test #nodejs #performance #api',
            'Load testing #express #scaling #performance',
            'API testing #nodejs #api #testing'
        ];
        
        await Promise.all(
            tweets.map(tweet => request(app).post('/tweet').send({ tweet }))
        );
        
        // Test trending hashtags response time
        const startTime = Date.now();
        const res = await request(app).get('/trending-hashtags');
        const responseTime = Date.now() - startTime;
        
        expect(res.statusCode).toBe(200);
        expect(res.body.hashtags).toBeInstanceOf(Array);
        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        
        console.log(`Trending hashtags response time: ${responseTime}ms`);
    });

    // Test health endpoint under load
    it('should maintain health status under load', async () => {
        // Generate some load
        const loadPromises = [];
        for (let i = 0; i < 30; i++) {
            loadPromises.push(
                request(app).post('/tweet').send({ 
                    tweet: `Health test under load ${i} #health #monitoring` 
                })
            );
        }
        
        // Execute load and health check concurrently
        const [healthRes] = await Promise.all([
            request(app).get('/health'),
            ...loadPromises
        ]);
        
        expect(healthRes.statusCode).toBe(200);
        expect(healthRes.body.status).toBe('healthy');
        expect(healthRes.body).toHaveProperty('uptime');
        expect(healthRes.body).toHaveProperty('memory');
        expect(healthRes.body.memory.rss).toMatch(/\d+MB/);
    }, 10000);

    // Test data consistency
    it('should maintain data consistency during concurrent operations', async () => {
        const testHashtag = '#consistency';
        const initialCount = 5;
        
        // Submit initial tweets with the test hashtag
        for (let i = 0; i < initialCount; i++) {
            await request(app).post('/tweet').send({ 
                tweet: `Consistency test ${i} ${testHashtag}` 
            });
        }
        
        // Get initial count
        const initialRes = await request(app).get('/trending-hashtags');
        const initialHashtagData = initialRes.body.hashtags.find(h => h.tag === testHashtag);
        const initialHashtagCount = initialHashtagData ? initialHashtagData.count : 0;
        
        // Submit more tweets concurrently
        const additionalCount = 10;
        const concurrentPromises = [];
        for (let i = 0; i < additionalCount; i++) {
            concurrentPromises.push(
                request(app).post('/tweet').send({ 
                    tweet: `Concurrent consistency test ${i} ${testHashtag}` 
                })
            );
        }
        
        await Promise.all(concurrentPromises);
        
        // Check final count
        const finalRes = await request(app).get('/trending-hashtags');
        const finalHashtagData = finalRes.body.hashtags.find(h => h.tag === testHashtag);
        const finalHashtagCount = finalHashtagData ? finalHashtagData.count : 0;
        
        // Count should have increased by the number of successful submissions
        expect(finalHashtagCount).toBeGreaterThanOrEqual(initialHashtagCount);
        expect(finalHashtagCount).toBeLessThanOrEqual(initialHashtagCount + additionalCount);
        
        console.log(`Hashtag count: ${initialHashtagCount} -> ${finalHashtagCount}`);
    }, 10000);
});