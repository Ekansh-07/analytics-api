📊 Website Analytics API

A scalable backend API that allows websites and mobile apps to track analytics events such as clicks, visited pages, device info, referrer, browser metadata, and user interactions.
The system supports API keys, JWT authentication, event aggregation, and cloud deployment.

🔗 Live Deployment: https://analytics-api-562o.onrender.com

📁 GitHub Repository: https://github.com/Ekansh-07/analytics-api

🚀 Features
Category	Included
User authentication (JWT)	✔
App registration	✔
API key generation	✔
API key revocation	✔
Event tracking & ingestion	✔
Event analytics (summary)	✔
User analytics (based on userId)	✔
Rate limiting (anti-spam)	✔
Production deployment	✔
🛠️ Tech Stack
Layer	Technology
Language	Node.js (JavaScript)
Framework	Express.js
Database	MongoDB Atlas (Cloud)
ORM	Mongoose
Hosting	Render
Auth	JWT tokens for users + API Key for apps
Security	Helmet, CORS, rate limiting
📦 Project Structure
src/
  app.js
  server.js
  config/db.js
  controllers/
  middleware/
  models/
  routes/

🔐 Authentication Design
Purpose	Method
Dashboard/login users	JWT token (via /api/auth/google)
Apps/websites sending analytics	API Key (sent via x-api-key header)
🧪 API Endpoints
🔹 1. Auth & API Key Management
Login

POST /api/auth/google

Body:

{
  "email": "test@example.com",
  "name": "Test User"
}


Response:

{
  "token": "<JWT_TOKEN>",
  "user": { "id": "...", "email": "...", "name": "..." }
}

Register an App (generate API key)

POST /api/auth/register
Headers: Authorization: Bearer <token>

{
  "name": "My Test App",
  "description": "Testing analytics",
  "expiresInDays": 30
}


Response includes:

{ "apiKey": "<API_KEY>" }

List API Keys

GET /api/auth/api-key
Headers: Authorization: Bearer <token>

Revoke API Key

POST /api/auth/revoke
Headers: Authorization: Bearer <token>

{ "apiKeyId": "<id>" }

🔹 2. Event Collection
Collect analytics event

POST /api/analytics/collect
Headers: x-api-key: <API_KEY>

{
  "event": "login_form_cta_click",
  "url": "https://example.com/page",
  "referrer": "https://google.com",
  "device": "mobile",
  "ipAddress": "127.0.0.1",
  "timestamp": "2025-02-20T12:34:56Z",
  "metadata": {
    "browser": "Chrome",
    "os": "Windows"
  },
  "userId": "user789"
}

🔹 3. Analytics Endpoints
Event Summary

GET /api/analytics/event-summary?event=login_form_cta_click
Headers: Authorization: Bearer <token>

Example response:

{
  "event": "login_form_cta_click",
  "count": 123,
  "uniqueUsers": 42,
  "deviceData": { "mobile": 90, "desktop": 33 }
}

User Stats

GET /api/analytics/user-stats?userId=user789
Headers: Authorization: Bearer <token>

Example response:

{
  "userId": "user789",
  "totalEvents": 18,
  "deviceDetails": {
    "browser": "Chrome",
    "os": "Windows"
  },
  "ipAddress": "127.0.0.1"
}

⚙️ Running Locally
1️⃣ Clone repo
git clone https://github.com/Ekansh-07/analytics-api.git
cd analytics-api

2️⃣ Install dependencies
npm install

3️⃣ Create .env
PORT=4000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<any-strong-secret>

4️⃣ Start server
npm run dev


Server runs at: http://localhost:4000

🌐 Deployment (Render)

Environment variables configured on Render:

Variable	Value
PORT	4000 (optional — Render injects a dynamic port)
MONGO_URI	MongoDB Atlas connection string
JWT_SECRET	Secret key for JWT
🧠 Rate Limiting

To prevent abuse:

Endpoint	Limit
/api/auth/google	10 requests/min per IP
/api/analytics/collect	200 events/min per IP

Implemented using express-rate-limit.

🚧 Future Enhancements

Swagger documentation

Dashboard UI for charts

Redis caching for summary queries

Time-series charts (daily / hourly event aggregation)

🏁 Challenges & Learnings

PostgreSQL setup and Docker caused installation issues → switched to MongoDB Atlas to avoid local overhead and simplify deployment.

Implemented API key–based ingestion separate from user authentication, similar to Mixpanel and Amplitude.

Encountered network error on Render → fixed by whitelisting 0.0.0.0/0 in MongoDB Atlas.

Learned the importance of clear route modularity and environment variables for cloud services.

👨‍💻 Author

Developer: Ekansh Saxena
If you want to extend this project and build a UI dashboard or SaaS version, feel free to fork and iterate!

⭐ Support the Project

If you found this helpful or inspiring, please consider ⭐ starring the repository!
