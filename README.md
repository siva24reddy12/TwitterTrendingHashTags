# Twitter Trending Hashtags Service

A light weight, **scalable** NodeJS REST API that ingests tweet related messages and tracks trending hashtags in real-time. Built for learning, testing, and showcasing basic systems engineering skills with in-memory processing, clustering, and automated testing.

## 🚀 **NEW: Scaling Features**

This service now includes comprehensive scaling capabilities:
- **Clustering**: Horizontal scaling with multiple worker processes
- **Rate Limiting**: DoS protection and load management  
- **Performance Monitoring**: Health checks and real-time metrics
- **Load Testing**: Comprehensive test suite for validation

📖 **[Read the full Scaling Documentation](./SCALING.md)**

---

## Technologies Used

- **Node.js** - JS runtime env.
- **Express.js** - Web framework for building REST APIs
- **Supertest** - Utility for HTTP assertions used in the tests.
- **PowerShell/ bash** - Scripts to simulate the tweet ingestion for windows and Unix systems.
- **Postman** - Tool to manually test REST API endpoints.


---

## API Endpoints

### POST `/tweet`

**Description:** Accepts a tweet containing hashtags.

- **Request Body:**
```json
{
    "tweet": "Hello Friends welcome to #NodeJS class"
}
```

- **Response:**
```json
{
    "message": "Tweet processed"
}
```

✅ Duplicate tweets are ignored to prevent reprocessing.
✅ Rate limited to prevent abuse (100 requests/minute/IP).

---

### GET `/trending-hashtags`

**Description:** Returns the top 25 hashtags based on frequency, sorted in descending order.

- **Response:**
```json
{
    "hashtags": [
        {
            "tag": "#java",
            "count": 2
        },
        {
            "tag": "#nodejs",
            "count": 1
        }
    ]
}
```

✅ Fast in-memory access
✅ State persisted to disk to survive restarts.

---

### GET `/health`

**Description:** Health check endpoint for monitoring service status.

- **Response:**
```json
{
    "status": "healthy",
    "worker": 1,
    "uptime": 18.5,
    "memory": {
        "rss": "52MB",
        "heapUsed": "6MB",
        "heapTotal": "7MB"
    },
    "stats": {
        "totalTweets": 150,
        "uniqueTweets": 120
    },
    "timestamp": "2025-07-16T23:22:52.401Z"
}
```

---

### GET `/metrics`

**Description:** Performance metrics for monitoring and scaling decisions.

- **Response:**
```json
{
    "tweets": {
        "total": 150,
        "unique": 120,
        "duplicates": 30
    },
    "hashtags": {
        "unique": 45,
        "total": 200
    },
    "memory": {
        "rss": 53944320,
        "heapUsed": 6171464
    },
    "uptime": 25.36,
    "worker": 3
}
```


### Postman Collection

Test the API using this postman collection:

📂 [Download TwitterHashtags.postman_collections.json](./TwitterHashtags.postman_collection.json)

To use:

1. Open Postman
2. Import the downloaded file.
3. Set the variable `{{baseUrl}}` to `http://localhost:3000`.
4. Run the requests for `/tweet` and `/trending-hashtags`.

---

## Getting started

### 1. **Clone the Repository**

```bash
git clone https://github.com/siva24reddy12/TwitterTrendingHashTags.git
cd TwitterTrendingHashTags
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. ***Run the Application**

```bash
npm run dev
```

The server will start on:
```
http://localhost:3000
```

---

## Testing the Service

### ✅ Automated Testing

Run the built in tests in `jest`:

```bash
npm test
```

Includes tests for:
- `/tweet` POSTING
- `/tweet-hashtags` GET responses

---

## Run GitHub Actions workflows Manually

This project uses **GitHub Actions** to run the automated tests. The workflow does not run automatically on every push - Instead it can be triggered manually via GitHub:

### Steps to Trigger Manually:

1. Got to GitHub repo.
2. Click on the **Actions** tab
3. Select **"Hashtag API Test Suite"**
4. Click **"Run WorkFlow"** on the top-right corner

✅ This will run the latest test suite in the pipeline.

---
## Scripts for Load testing

### Windows (My device)

```bash
double click tweets.bat
```

### macOS/Linux

```bash
chmod +x tweets.sh
./tweets.sh
```

✅These scripts simulate 50 unique tweets to fill the trending list.

### **NEW: Scaling Load Test**

Test the new scaling features:

```bash
chmod +x scaling-test.sh
./scaling-test.sh
```

✅ Comprehensive load testing with performance analysis and scaling validation.

---


## Persistence and Durability

- Tweets and hashtag counts are cached in the memory.
- Data is persisted to a local file `storage.json`
- on restart the app auto-loads previous state (no data loss)



## Contributions

If any contributions
1. Fork the repo
2. Make changes
3. Submit the PR. I will review and merge.

---

## Author

**Siva Prasad Reddy Nalamaru**
