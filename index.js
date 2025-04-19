const express = require('express');
const trendingService = require('./trendingService');
//const fs = require('fs');

const app = express();
app.use(express.json());

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

if (require.main === module) {

    trendingService.loadData();

    // On shutdown, save data
    process.on('SIGINT', () => {
        trendingService.saveData();
        process.exit();
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}



module.exports = app;