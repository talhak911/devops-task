# Build Log: DevOps Workspace Enhancements

This log details the containerization, local orchestration, CI/CD pipeline implementation, and deployment configuration completed for the Task Manager application workspace.

---

## 1. Summary of Changes

We implemented a series of production-grade DevOps improvements targeting reliability, scalability, and developer experience without altering the application's underlying business logic or user interface:
- **Database Separation**: Separated MongoDB from application code, allowing local execution in a Docker Compose network while supporting Managed databases (MongoDB Atlas) in production using standardized environment variables (`MONGODB_URI`).
- **Health Checks**: Standardized `/api/health` and `/health` REST endpoints returning HTTP 200 `{ "status": "ok" }` across the APIs, coupled with Docker `HEALTHCHECK` instructions and Docker Compose dependency conditions.
- **Environment Isolation**: Configured `.env.example`, `.env.development`, and `.env.production` files for the services, using environment variables rather than hardcoded URLs.
- **Dockerization**: Wrote multi-stage Dockerfiles utilizing minimal Alpine images, proper working directories, non-root users (`node`), layer caching optimizations, and custom Nginx SPA configurations.
- **GitHub Actions Pipeline**: Configured a sequential workflow that performs checkout, Node setup, dependency installation, code compilation, unit testing, Docker image building, and automated container smoke testing before passing.

---

## 2. Docker & Compose Details

### Multi-stage Build Strategies
1. **Frontend (React + Vite)**: 
   - **Build stage**: Node 20 Alpine installs dependencies and compiles Vite static assets into `/dist`.
   - **Runner stage**: Nginx Alpine copies static assets and serves them on internal port `80`. It uses a custom `nginx.conf` routing configuration to prevent 404 errors on SPA route refreshes.
2. **Backend (Express)**:
   - Uses Node 20 Alpine. Installs only production dependencies for the final runner stage, reducing image sizes. Runs under the non-root `node` user for host security.
3. **Realtime Service (NestJS)**:
   - **Build stage**: Compiles TypeScript modules to a production `/dist` directory.
   - **Runner stage**: Copies compiled code and production dependencies, exposing port `5006` and running under the `node` user.

### Local Orchestration (Docker Compose)
We created a local development cluster in `docker-compose.yml` leveraging:
- A custom network bridge `app-network` ensuring isolated DNS resolution between services.
- A named volume `mongo_data` preserving database state between restarts.
- Restart policies (`unless-stopped`) managing container lifecycle.
- Healthcheck dependencies (`depends_on` with `condition: service_healthy`), ensuring application servers only launch after MongoDB responds to pings, and the Frontend only starts after APIs are serving traffic.

---

## 3. CI/CD Pipeline Implementation

The CI/CD pipeline defined in `.github/workflows/ci.yml` automates regression testing and container image validation:
- **Dependency Caching**: Employs `actions/cache` mapped to `package-lock.json` hashes to avoid redundant NPM package fetches on every runner startup.
- **Sequential Pipeline**: Breaks builds down by component. The workflow immediately halts if frontend compilation, NestJS lint check, or unit tests fail.
- **Docker Smoke Tests**: Runs a live verification check. After building the Docker images, it boots each container, curls the health check endpoint, confirms an HTTP 200 response, and then stops and removes the container.
- **Continuous Deployment**: Following successful smoke tests, the pipeline ends in a success state. Render's built-in Git webhook immediately pulls the verified codebase and triggers rolling container updates.

---

## 4. AI Tools & Development Acceleration

### AI Tools Utilized
During the planning and development phases, multiple AI code assistants were referenced, including:
- **Gemini (3.5 Flash)**: Leveraged for drafting the structural implementation plan, writing optimized Docker configurations, and resolving NestJS unit testing mock structures.
- **ChatGPT / GitHub Copilot (Reference usage)**: Referenced for Nginx config syntax lookups (SPA routing rules) and Docker Compose schema syntax mapping.

### How AI Accelerated Development
- **Config Boilerplate**: Generated standard multi-stage Dockerfiles and GitHub Actions cache configurations in seconds, reducing repetitive syntax lookup.
- **Test Debugging**: Offered accurate solutions to NestJS dependency injector issues. The AI quickly suggested mocking `ConfigService` and the `User` model using Mongoose token factories rather than mocking the parent `AuthGuard` class itself.

### Required Manual Verification & Debugging
Despite AI recommendations, manual intervention was crucial:
- **Port Mapping Conflicts**: Identified local host conflicts where a background MongoDB instance was already running on `27017`.
- **CORS Configuration Validation**: Verified CORS network preflight logs manually to ensure comma-delimited environment origins were correctly split and stripped of trailing slashes.
- **Vercel vs. Docker Port Listen Debugging**: Discovered and resolved backend serverless export behavior, ensuring the node script listens on the environment port when booted directly inside a Docker container.

---

## 5. Challenges Encountered & Resolutions

### Challenge 1: NestJS Unit Test Compilation Failures
- **Problem**: The Jest test suite for `AppController` failed because the controller imports a guard requiring database model instances and config services.
- **Resolution**: Updated `app.controller.spec.ts` to provide mock factories for `ConfigService` and Mongoose's `User` model. This satisfied the NestJS dependency injector, allowing the controller instance to compile successfully.

### Challenge 2: Vite Hardcoded API Endpoints
- **Problem**: The React client was calling API URLs hardcoded to `localhost`.
- **Resolution**: Refactored the context APIs to query `import.meta.env.VITE_SOCKET_URL` and `import.meta.env.VITE_API_URL` dynamically. Updated the Docker environment variables and Compose configuration to inject these parameters seamlessly.

### Challenge 3: Nginx Client-Side Routing Breaks (404)
- **Problem**: Navigating to deep links on the React frontend resulted in 404s inside Nginx.
- **Resolution**: Configured Nginx to fall back to `index.html` via `try_files $uri $uri/ /index.html;`, enabling React Router's internal client-side history API routing.

---

## 6. Lessons Learned
- **Network Bridges in Docker Compose**: Bridge networks isolate services. Using container service names as DNS hostnames (e.g., `mongodb://mongodb:27017`) eliminates hardcoding IP addresses.
- **Vite Build-time Constraints**: Vite compiles environment variables into the static javascript bundle. Thus, changing frontend configuration requires a new Docker image build rather than just changing runtime variables, a key distinction from Node.js backend runtimes.
- **Health check Ordering**: Utilizing `depends_on` with health checks prevents backend boot errors by waiting until the database is fully initialized and listening to connections.
