@echo off
setlocal enabledelayedexpansion

echo Sending tweets to /tweet endpoint...

set tweets[0]=Loving the #NodeJS ecosystem and #JavaScript evolution!
set tweets[1]=Frontend power with #ReactJS and #JavaScript.
set tweets[2]=Diving into #MachineLearning and #Python.
set tweets[3]=Data visualization with #D3JS and #JavaScript.
set tweets[4]=#NodeJS makes API development so smooth.
set tweets[5]=Learning about #Microservices and #Docker.
set tweets[6]=Cloud development on #AWS and #GCP.
set tweets[7]=Exploring #NoSQL databases like #MongoDB.
set tweets[8]=Writing scalable apps with #NodeJS.
set tweets[9]=Deploying containers with #Docker and #Kubernetes.
set tweets[10]=Setting up #CI/CD pipelines with #GitHubActions.
set tweets[11]=Writing tests with #Jest for #JavaScript.
set tweets[12]=Analyzing data using #Pandas in #Python.
set tweets[13]=#TypeScript makes #JavaScript dev easier.
set tweets[14]=#ReactJS vs #VueJS? Both are great.
set tweets[15]=Exploring #GraphQL and its power.
set tweets[16]=Handling async calls in #JavaScript with #Promises.
set tweets[17]=Scaling systems with #Redis and #Kafka.
set tweets[18]=Learning #SpringBoot with #Java.
set tweets[19]=#Kubernetes makes deployment simple.
set tweets[20]=#Java is still strong in enterprise dev.
set tweets[21]=Using #PostgreSQL for relational data.
set tweets[22]=Managing state in #Redux and #ReactJS.
set tweets[23]=Debugging #NodeJS apps with ease.
set tweets[24]=#SaaS applications built on #NodeJS.
set tweets[25]=Writing clean code with #SOLID principles.
set tweets[26]=#ExpressJS simplifies routing in #NodeJS.
set tweets[27]=Understanding #OAuth2 and #JWT for security.
set tweets[28]=#ElasticSearch powers fast search.
set tweets[29]=Caching strategies using #Redis.
set tweets[30]=#Kafka for real-time stream processing.
set tweets[31]=Running background jobs with #BullMQ.
set tweets[32]=#GitOps for managing infrastructure.
set tweets[33]=#DockerHub is useful for pushing images.
set tweets[34]=Container orchestration with #Kubernetes.
set tweets[35]=#Firebase helps with quick backend setup.
set tweets[36]=Using #NextJS for server-side rendering.
set tweets[37]=Authentication in #NodeJS using #PassportJS.
set tweets[38]=Streaming logs with #Fluentd and #Elasticsearch.
set tweets[39]=Monitoring with #Prometheus and #Grafana.
set tweets[40]=Building apps with #NestJS and #TypeScript.
set tweets[41]=Data pipelines with #ApacheAirflow.
set tweets[42]=Scaling #NodeJS apps horizontally.
set tweets[43]=Secure apps using #HelmetJS in #ExpressJS.
set tweets[44]=#OpenAPI is great for API documentation.
set tweets[45]=Deploying with #Vercel and #Netlify.
set tweets[46]=Building webhooks with #NodeJS.
set tweets[47]=Optimizing performance with #Lighthouse.
set tweets[48]=Learning #Rust for systems programming.
set tweets[49]=Monitoring APIs with #Postman.

for /L %%i in (0,1,49) do (
  set tweet=!tweets[%%i]!
  curl -s -X POST http://localhost:3000/tweet -H "Content-Type: application/json" -d "{\"tweet\": \"!tweet!\"}" >nul
)

echo.
echo Retrieving top 25 hashtags (with counts) in pretty JSON format:
powershell -Command "Invoke-RestMethod -Uri http://localhost:3000/trending-hashtags | ConvertTo-Json -Depth 3"

endlocal
pause
