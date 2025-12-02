# Website Analytics API

A scalable backend API for tracking website and mobile app events (clicks, visits, referrers, device info, etc.).  
The API supports API key–based ingestion, aggregation endpoints, and can be integrated with any frontend.

> **Tech stack:** Node.js, Express, MongoDB (Atlas), Mongoose, JWT Auth

---

## Features

- **API Key Management**
  - Register apps/websites and generate API keys
  - List API keys for a user
  - Revoke API keys
- **Event Collection**
  - Collect events like clicks, visits, referrers, device details, metadata
  - API key authentication via `x-api-key` header
- **Analytics & Reporting**
  - Event summary: total count, unique users, device split
  - User stats: total events, last device/browser/os, last IP
- **Security & Scaling**
  - JWT-based user auth (email-based in this implementation, can be swapped with Google OAuth)
  - Clean separation of concerns (routes, controllers, models, middleware)
  - Ready to deploy on cloud (Railway)

---

## Architecture Overview

- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (managed)
- **ORM:** Mongoose
- **Auth for dashboard users:** JWT (simulated Google login endpoint)
- **Auth for apps/websites:** API keys stored per app
- **Structure:**

  ```text
  src/
    config/       # DB connection
    controllers/  # auth + analytics logic
    middleware/   # JWT auth, API key auth
    models/       # User, App, ApiKey, Event
    routes/       # auth routes, analytics routes
    server.js     # app bootstrap
    app.js        # express app setup
