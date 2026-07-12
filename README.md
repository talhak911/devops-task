# Task Manager - Production-Ready DevOps Workspace

This repository contains the containerized and CI/CD-integrated Task Manager application, separated into three primary services:
1. **Frontend**: React (Vite) single-page application served via Nginx.
2. **Backend**: Express REST API service.
3. **Realtime Service**: NestJS microservice managing WebSockets and push notifications.

---

## 1. System Architecture

The application separates concerns by isolating client assets, API logic, real-time message streams, and the database.

### Local Development Architecture
During local execution, the environment is self-contained. All services and the database run inside the same network namespaces:
- **Client (Frontend)**: Runs locally (or in container exposed on host port `8080`).
- **Core APIs (Backend)**: Runs on port `5005` communicating with a local MongoDB container.
- **WebSockets (Realtime Service)**: Runs on port `5006` communicating with the local MongoDB container.
- **Database (MongoDB)**: Exposes port `27017` locally, mapping directory data to a named volume `mongo_data`.

### Production Deployment Architecture
In production, the database is removed from the application network and moved to a managed cluster (such as MongoDB Atlas or Render Managed MongoDB) to guarantee high availability and data durability.
- **Frontend**: Render Docker Web Service (built with Vite and hosted via Nginx, listening on standard port `80`).
- **Backend**: Render Docker Web Service.
- **Realtime Service**: Render Docker Web Service.
- **Database**: Managed MongoDB (Atlas).

```
GitHub (Version Control)
   ↓
GitHub Actions (CI Pipeline: Lint, Test, Build, Image Smoke Tests)
   ↓
Render Cloud Deployment (Continuous Deployment)
   ↓
   ├── Frontend (Nginx serving React/Vite build on Port 80)
   ├── Backend (Express REST APIs)
   └── Realtime Service (NestJS WebSockets)
         ↓
   Managed MongoDB (MongoDB Atlas / Render Managed Cluster)
```

---

## 2. Environment Variables Configuration

The application uses specific files to separate environments:
- `.env.example`: Sample configuration template.
- `.env.development`: Pre-configured settings for local Docker Compose execution.
- `.env.production`: Template variables mapped during production deployment.

### Required Keys Checklist

| Variable Name | Service | Local Value (Compose) | Production Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend / Realtime | `5005` / `5006` | Internal container port (Render assigns dynamically). |
| `NODE_ENV` | Backend / Realtime | `development` | Set to `production` in live environments. |
| `MONGODB_URI` | Backend / Realtime | `mongodb://mongodb:27017/teacommerce` | Connection string to MongoDB instance. |
| `JWT_SECRET` | Backend / Realtime | `your_super_secret_jwt_key_...` | Cryptographic signature secret for auth tokens. |
| `CORS_ORIGINS` | Backend / Realtime | `http://localhost:5173,http://localhost:8080` | Allowed origins (set to the Frontend production URL). |
| `VITE_API_URL` | Frontend | `http://localhost:5005` | Endpoint URL of the Backend API. |
| `VITE_SOCKET_URL` | Frontend | `http://localhost:5006` | Endpoint URL of the Realtime WebSockets service. |

---

## 3. Local Development Instructions

### Running Bare-Metal (Without Docker)

1. **Prerequisites**: Ensure MongoDB is running locally on `mongodb://localhost:27017`.
2. **Setup Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
3. **Setup Realtime Service**:
   ```bash
   cd ../realtime-service
   cp .env.example .env
   npm install
   npm run start:dev
   ```
4. **Setup Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Access the UI at `http://localhost:5173`.

### Running Containerized (Docker Compose)

The entire workspace can be run with a single command:
```bash
docker compose up --build -d
```
Verify container status:
```bash
docker compose ps
```
- **Frontend Dashboard**: `http://localhost:8080`
- **Backend Health Check**: `http://localhost:5005/api/health`
- **Realtime Health Check**: `http://localhost:5006/health`

To stop the environment:
```bash
docker compose down -v
```

---

## 4. CI/CD Pipeline Workflow

The automated workflow is configured via GitHub Actions under `.github/workflows/ci.yml`.

### Pipeline Execution Order

```
[Git Push / PR to main]
          ↓
[GitHub Actions VM Starts]
          ↓
[Install dependencies -> Lint -> Run Tests -> Build Code] (Sequentially for all services)
          ↓
[Build Docker Images] (Backend, Realtime, Frontend)
          ↓
[Docker Image Verification] (Starts each image, queries /health, stops & cleans up)
          ↓
[CI Success State reached]
          ↓
[Render Deploy Webhook Triggered] (Continuous Deployment)
          ↓
[Live Cloud Application Updated]
```

---

## 5. Render Production Deployment Guide

1. **Database Setup**: Create a MongoDB Atlas cluster and copy the Connection String (`mongodb+srv://...`).
2. **Backend Service Setup**:
   - Create a new **Web Service** on Render, linking your GitHub Repository.
   - Set the runtime environment to **Docker**.
   - Add environment variables:
     - `MONGODB_URI`: *Your MongoDB connection string*
     - `JWT_SECRET`: *A secure random string*
     - `NODE_ENV`: `production`
     - `CORS_ORIGINS`: *Your Frontend production URL*
3. **Realtime Service Setup**:
   - Create a new **Web Service** on Render, linking your GitHub Repository.
   - Specify the root directory as `realtime-service` (or use the root Dockerfile).
   - Set the environment variables:
     - `MONGODB_URI`: *Your MongoDB connection string*
     - `JWT_SECRET`: *The same secret configured above*
     - `NODE_ENV`: `production`
     - `CORS_ORIGINS`: *Your Frontend production URL*
4. **Frontend Service Setup**:
   - Create a new **Web Service** on Render, linking your GitHub Repository.
   - Specify the root directory as `frontend`.
   - Set the environment variables:
     - `VITE_API_URL`: *Your Backend production URL*
     - `VITE_SOCKET_URL`: *Your Realtime service production URL*

---

## 6. Troubleshooting

### Common Local Docker Compose Issues
- **Ports Already in Use**: If ports `8080`, `5005`, `5006`, or `27017` are bound by host services, the compose launch will fail. Stop local web servers or MongoDB, or modify port mapping configurations in `docker-compose.yml`.
- **Database Connection Fails**: Ensure `MONGODB_URI` points to `mongodb://mongodb:27017/teacommerce` (leveraging Docker Compose's DNS resolver naming) rather than `localhost`.

### Common Production Deployment Issues
- **CORS Blocked Errors**: Occurs if the backend's `CORS_ORIGINS` does not match the frontend's live Render domain. Double-check environment variables in the Render backend dashboard.
- **WebSocket Reconnection Failures**: Confirm that the frontend's `VITE_SOCKET_URL` uses the HTTPS scheme (e.g. `https://service.onrender.com`) matching Render's TLS router, which automatically handles WebSocket handshakes.
- **Vite Build Missing Environment Variables**: Vite embeds environment variables in client files during compile-time. If you change variables on Render, you must trigger a fresh rebuild of the frontend Docker image.
