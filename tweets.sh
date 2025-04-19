#!/bin/bash

echo "Sending tweets to /tweet endpoint..."

tweets=(
  "Loving the #NodeJS ecosystem and #JavaScript evolution!"
  "Frontend power with #ReactJS and #JavaScript."
  "Diving into #MachineLearning and #Python."
  "Data visualization with #D3JS and #JavaScript."
  "#NodeJS makes API development so smooth."
  "Learning about #Microservices and #Docker."
  "Cloud development on #AWS and #GCP."
  "Exploring #NoSQL databases like #MongoDB."
  "Writing scalable apps with #NodeJS."
  "Deploying containers with #Docker and #Kubernetes."
  "Setting up #CI/CD pipelines with #GitHubActions."
  "Writing tests with #Jest for #JavaScript."
  "Analyzing data using #Pandas in #Python."
  "#TypeScript makes #JavaScript dev easier."
  "#ReactJS vs #VueJS? Both are great."
  "Exploring #GraphQL and its power."
  "Handling async calls in #JavaScript with #Promises."
  "Scaling systems with #Redis and #Kafka."
  "Learning #SpringBoot with #Java."
  "#Kubernetes makes deployment simple."
  "#Java is still strong in enterprise dev."
  "Using #PostgreSQL for relational data."
  "Managing state in #Redux and #ReactJS."
  "Debugging #NodeJS apps with ease."
  "#SaaS applications built on #NodeJS."
  "Writing clean code with #SOLID principles."
  "#ExpressJS simplifies routing in #NodeJS."
  "Understanding #OAuth2 and #JWT for security."
  "#ElasticSearch powers fast search."
  "Caching strategies using #Redis."
  "#Kafka for real-time stream processing."
  "Running background jobs with #BullMQ."
  "#GitOps for managing infrastructure."
  "#DockerHub is useful for pushing images."
  "Container orchestration with #Kubernetes."
  "#Firebase helps with quick backend setup."
  "Using #NextJS for server-side rendering."
  "Authentication in #NodeJS using #PassportJS."
  "Streaming logs with #Fluentd and #Elasticsearch."
  "Monitoring with #Prometheus and #Grafana."
  "Building apps with #NestJS and #TypeScript."
  "Data pipelines with #ApacheAirflow."
  "Scaling #NodeJS apps horizontally."
  "Secure apps using #HelmetJS in #ExpressJS."
  "#OpenAPI is great for API documentation."
  "Deploying with #Vercel and #Netlify."
  "Building webhooks with #NodeJS."
  "Optimizing performance with #Lighthouse."
  "Learning #Rust for systems programming."
  "Monitoring APIs with #Postman."
)

for tweet in "${tweets[@]}"
do
  curl -s -X POST http://localhost:3000/tweet \
       -H "Content-Type: application/json" \
       -d "{\"tweet\": \"$tweet\"}" > /dev/null
done

echo -e "\nRetrieving top 25 hashtags (with counts):"
curl -s http://localhost:3000/trending-hashtags | jq .
