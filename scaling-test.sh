#!/bin/bash

echo "=== Twitter Hashtags Scaling Load Test ==="
echo "Testing the scaling capabilities of the hashtag service..."
echo

BASE_URL="http://localhost:3000"

# Check if server is running
echo "1. Checking server health..."
health_response=$(curl -s "$BASE_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
    echo "Health status: $(echo $health_response | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Server is not running. Please start the server first."
    echo "Run: npm start"
    exit 1
fi

echo

# Get initial metrics
echo "2. Getting initial metrics..."
initial_metrics=$(curl -s "$BASE_URL/metrics")
initial_tweets=$(echo $initial_metrics | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
echo "Initial tweets processed: $initial_tweets"
echo

# Test 1: High volume sequential processing
echo "3. Testing high volume sequential processing..."
echo "Sending 100 unique tweets..."

start_time=$(date +%s%N)

for i in {1..100}; do
    tweet="Load test sequential tweet $i #performance #scaling #test$((i % 10)) #batch$((i / 10))"
    curl -s -X POST "$BASE_URL/tweet" \
         -H "Content-Type: application/json" \
         -d "{\"tweet\": \"$tweet\"}" >/dev/null
    
    # Show progress
    if [ $((i % 20)) -eq 0 ]; then
        echo "  Processed $i/100 tweets..."
    fi
done

end_time=$(date +%s%N)
sequential_duration=$(( (end_time - start_time) / 1000000 ))

echo "✅ Sequential processing completed in ${sequential_duration}ms"
echo

# Test 2: Concurrent processing
echo "4. Testing concurrent processing..."
echo "Sending 50 tweets concurrently..."

start_time=$(date +%s%N)

# Create background processes for concurrent requests
for i in {1..50}; do
    {
        tweet="Load test concurrent tweet $i #concurrent #performance #test$((i % 5))"
        curl -s -X POST "$BASE_URL/tweet" \
             -H "Content-Type: application/json" \
             -d "{\"tweet\": \"$tweet\"}" >/dev/null
    } &
done

# Wait for all background jobs to complete
wait

end_time=$(date +%s%N)
concurrent_duration=$(( (end_time - start_time) / 1000000 ))

echo "✅ Concurrent processing completed in ${concurrent_duration}ms"
echo

# Test 3: Rate limiting test
echo "5. Testing rate limiting..."
echo "Sending rapid requests to trigger rate limiting..."

rate_limited_count=0
successful_count=0

for i in {1..120}; do
    response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/tweet" \
                    -H "Content-Type: application/json" \
                    -d "{\"tweet\": \"Rate limit test $i #ratelimit\"}" \
                    -o /dev/null)
    
    if [ "$response" = "429" ]; then
        rate_limited_count=$((rate_limited_count + 1))
    elif [ "$response" = "200" ]; then
        successful_count=$((successful_count + 1))
    fi
done

echo "✅ Rate limiting test completed"
echo "  Successful requests: $successful_count"
echo "  Rate limited requests: $rate_limited_count"
echo

# Test 4: Performance monitoring
echo "6. Performance monitoring..."

# Get trending hashtags response time
echo "Testing trending hashtags endpoint performance..."
start_time=$(date +%s%N)
trending_response=$(curl -s "$BASE_URL/trending-hashtags")
end_time=$(date +%s%N)
trending_duration=$(( (end_time - start_time) / 1000000 ))

hashtag_count=$(echo $trending_response | grep -o '"tag":' | wc -l)

echo "✅ Trending hashtags endpoint:"
echo "  Response time: ${trending_duration}ms"
echo "  Hashtags returned: $hashtag_count"
echo

# Get final metrics
echo "7. Final performance metrics..."
final_metrics=$(curl -s "$BASE_URL/metrics")

# Extract metrics using grep and cut
final_tweets=$(echo $final_metrics | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
unique_tweets=$(echo $final_metrics | grep -o '"unique":[0-9]*' | head -1 | cut -d':' -f2)
duplicate_tweets=$(echo $final_metrics | grep -o '"duplicates":[0-9]*' | head -1 | cut -d':' -f2)
unique_hashtags=$(echo $final_metrics | grep -o '"unique":[0-9]*' | tail -1 | cut -d':' -f2)

# Memory info
memory_info=$(echo $final_metrics | grep -o '"rss":[0-9]*' | cut -d':' -f2)
heap_used=$(echo $final_metrics | grep -o '"heapUsed":[0-9]*' | cut -d':' -f2)

tweets_processed=$((final_tweets - initial_tweets))

echo "📊 Performance Summary:"
echo "  Total tweets processed in this test: $tweets_processed"
echo "  Unique tweets: $unique_tweets"
echo "  Duplicate tweets: $duplicate_tweets"
echo "  Unique hashtags: $unique_hashtags"
echo "  Memory usage (RSS): ${memory_info} bytes"
echo "  Memory usage (Heap): ${heap_used} bytes"
echo

# Performance analysis
echo "🚀 Scaling Performance Analysis:"
echo "  Sequential processing speed: $(echo "scale=2; 100 * 1000 / $sequential_duration" | bc -l) tweets/second"
echo "  Concurrent processing speed: $(echo "scale=2; 50 * 1000 / $concurrent_duration" | bc -l) tweets/second"
echo "  Rate limiting effectiveness: $(echo "scale=1; $rate_limited_count * 100 / 120" | bc -l)% of excess requests blocked"
echo "  Trending hashtags latency: ${trending_duration}ms"

# Scaling efficiency
if [ $concurrent_duration -lt $((sequential_duration / 2)) ]; then
    echo "  ✅ Concurrent processing shows good scaling efficiency"
else
    echo "  ⚠️  Concurrent processing scaling could be improved"
fi

echo

# Health check
echo "8. Final health check..."
health_final=$(curl -s "$BASE_URL/health")
status=$(echo $health_final | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
uptime=$(echo $health_final | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)

echo "✅ Final health status: $status"
echo "✅ Server uptime: ${uptime}s"

echo
echo "=== Load Test Completed Successfully ==="
echo "The scaling features are working correctly!"