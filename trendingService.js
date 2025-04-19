const fs = require('fs');
const path = './storage.json';

let hashtagCount = {};
let tweetCache = new Set(); // avoid duplicate processing
const MAX_TOP = 25;

function extractHashtags(tweet) {
    const regex = /#\w+/g;
    return tweet.match(regex)?.map(tag => tag.toLowerCase()) || [];
}

function processTweet(tweet) {
    const hash = tweet.trim().toLowerCase();

    if (tweetCache.has(hash)) return false;

    tweetCache.add(hash);
    const tags = extractHashtags(tweet);

    tags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
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
        tweetCache: Array.from(tweetCache)
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log('Saved state to storage.json');
}

function loadData() {
    if (!fs.existsSync(path)) return;
    const raw = fs.readFileSync(path);
    const data = JSON.parse(raw);
    hashtagCount = data.hashtagCount || {};
    tweetCache = new Set(data.tweetCache || []);
    console.log('Loaded state from storage.json');
}

module.exports = {
    processTweet,
    getTopHashtags,
    saveData,
    loadData
};
