# Workzy - On-Demand Skilled Worker & Service Booking Platform

Workzy is a full-stack, enterprise-grade on-demand service marketplace platform that connects customers with verified, skilled workers. Built with TypeScript, React, Express, MongoDB Atlas, Redis, Socket.IO, Docker, and an Nginx reverse proxy.

---

## 🚀 Key Features

### 👤 Customer Portal
* **Geolocation & Search:** Search, filter, and discover local service providers by category and location using interactive Mapbox GL integration.
* **Interactive Booking:** Live slot scheduling, multi-step checkout, and real-time status tracking.
* **Real-time Communication:** 1-on-1 real-time chat and instantaneous status notifications powered by Socket.IO.
* **Secure Payments:** Secure payment processing with Stripe and webhook-based automated settlement.
* **Ratings & Reviews:** Verified reviews and star ratings for service transparency.

### 👷 Worker / Provider Portal
* **Onboarding & KYC:** Secure worker registration with document verification (AWS S3 presigned upload workflow).
* **Schedule & Availability:** Custom working day configuration, time-slot management, and leave requests.
* **Booking Pipeline:** Accept, manage, reschedule, and complete incoming client booking requests.
* **Wallet & Payouts:** Earnings breakdown, transaction logs, and payout requests.

### 🛡️ Admin Dashboard
* **User & Worker Governance:** Worker KYC review and verification, user status management, and blocking controls.
* **Service & Category Management:** Dynamic creation, configuration, and document gating per category.
* **Dispute Resolution:** Built-in dispute ticket management and automated transaction audits.
* **Platform Metrics:** Real-time analytics on revenue, active bookings, and system health.

### 🏗️ Architecture & Engineering
* **Clean Architecture & SOLID:** Modular layers with decoupled interfaces, repository pattern, unit-of-work transactions, and InversifyJS dependency injection.
* **Containerized Infrastructure:** Production multi-stage Docker builds with lean Alpine images.
* **High-Performance Reverse Proxy:** Nginx with SPA routing, WebSocket upgrade proxies, upload buffers up to 25MB, and gzip compression.
* **High-Speed Caching:** Redis for token blacklisting, presence tracking, and API rate limiting.
* **Enterprise Database:** MongoDB Atlas with replica set support for transactional consistency.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Redux Toolkit, TanStack Query, Mapbox GL, Socket.IO Client |
| **Backend** | Node.js, Express 5, TypeScript, InversifyJS, Socket.IO, Winston Logger (Daily Rotate File) |
| **Database & Cache** | MongoDB Atlas (Mongoose with transactions), Redis 7 (Alpine) |
| **Cloud & Media** | AWS S3 (Presigned URLs), Stripe API & Webhooks |
| **DevOps & Proxy** | Docker, Docker Compose, Nginx Alpine, Multi-Stage Builds |

---

## 🐳 Quick Start with Docker

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
* [Git](https://git-scm.com/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/mhdshamshad/workzy.git
cd workzy
```

### 2. Configure Environment Variables
Ensure `backend/.env` is set up with your secrets:
```env
PORT=3001
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost
REDIS_URL=redis://redis:6379

# AWS S3 (for profile & document uploads)
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket
AWS_S3_ACCESSKEY=your_access_key
AWS_S3_SECRET=your_secret_key

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT & Authentication
ACCESS_TOKEN=your_access_token_secret
REFRESH_TOKEN=your_refresh_token_secret
```

### 3. Launch the Stack
Run from the project root directory:

```bash
docker compose up --build -d
```

### 4. Access the Services
* **Frontend Web App:** [http://localhost](http://localhost)
* **Backend API (Nginx Reverse Proxy):** [http://localhost/api](http://localhost/api)
* **Backend API (Direct):** [http://localhost:3001/api](http://localhost:3001/api)

---

## 💻 Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
workzy/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Logger, Passport
│   │   ├── constants/       # Enums, statuses, messages, status codes
│   │   ├── controllers/     # HTTP route controllers
│   │   ├── core/            # Interfaces, DI types, repositories
│   │   ├── middlewares/     # Auth, error handling, rate limiting, logging
│   │   ├── models/          # Mongoose schemas & models
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic & unit of work
│   │   ├── socket/          # Real-time WebSocket event handlers
│   │   └── utils/           # Helper functions, S3 uploaders, crypto
│   ├── Dockerfile           # Multi-stage production backend Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components & design system (Shadcn UI)
│   │   ├── context/         # Socket context & global providers
│   │   ├── features/        # Auth, bookings, chat, worker, profile modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Axios instance & utility functions
│   │   ├── routes/          # React Router v7 routes & protected guards
│   │   └── store/           # Redux Toolkit store & slices
│   ├── Dockerfile           # Multi-stage frontend Dockerfile (Vite -> Nginx)
│   ├── nginx.conf           # Production Nginx reverse proxy configuration
│   └── package.json
└── docker-compose.yml       # Production multi-service orchestration
```

---

## 📜 License

This project is licensed under the ISC License.
