const request = require('supertest');
const app = require('../index');

describe('Hashtag API', () => {

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
});