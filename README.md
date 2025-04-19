# Twitter Trending Hashtags Service

A light weight, scalable NodeJS REST API that ingests tweet related messages and tracks trending hashtags in real-time. Built for learning, testing, and showcasign basic systems engineering skills with in-memory processing, and automated testing.

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

✅Fast in-memory access
✅State persisted to disk to survive restarts.


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
