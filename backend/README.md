# Task Manager API v2

A production-ready RESTful API built with **Node.js + Express**, featuring **MongoDB** persistence, **JWT authentication**, **input validation**, and **Swagger documentation**.

---

## 🚀 Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js                            |
| Framework  | Express.js                         |
| Database   | MongoDB + Mongoose                 |
| Auth       | JWT + bcryptjs                     |
| Validation | express-validator                  |
| Docs       | swagger-ui-express + swagger-jsdoc |
| Dev Tool   | nodemon                            |

---

## 📦 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local instance or MongoDB Atlas)

### Installation

```bash
# 1. Clone / enter the project
cd task-manager-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env   # then edit values

# 4. Start development server
npm run dev
```

### Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

### Available Scripts

| Script      | Command       | Description                      |
| ----------- | ------------- | -------------------------------- |
| Development | `npm run dev` | Start with nodemon (auto-reload) |
| Production  | `npm start`   | Start with node                  |

---

## 📚 API Documentation

Once the server is running, visit:

```
http://localhost:5000/api-docs
```

Swagger UI allows you to explore and test every endpoint directly from the browser.  
Use the **Authorize** button to enter your JWT token (prefix: `Bearer <token>`).

---

## 📘 API Reference

### Base URL

```
http://localhost:5000
```

### Response Format

Every endpoint returns a consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Human-readable message"
}
```

---

### 🔐 Auth Endpoints

#### Register a new user

```http
POST /api/users/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "64f...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Account created successfully"
}
```

---

#### Login

```http
POST /api/users/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:** Same structure as register with a new JWT token.

---

#### Get current user profile

```http
GET /api/users/me
Authorization: Bearer <token>
```

---

### ✅ Task Endpoints

> All task routes require `Authorization: Bearer <token>` header.

#### Get all tasks

```http
GET /api/tasks
GET /api/tasks?title=learn        ← filter by title
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "64f...",
        "title": "Learn Express",
        "description": "",
        "completed": false,
        "user": "64f...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  },
  "message": "Tasks fetched successfully"
}
```

---

#### Get task by ID

```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

---

#### Create a task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Learn Mongoose",
  "description": "Study schemas and models",
  "completed": false
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "64f...",
      "title": "Learn Mongoose",
      "description": "Study schemas and models",
      "completed": false,
      "user": "64f..."
    }
  },
  "message": "Task created successfully"
}
```

---

#### Update a task

```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):

```json
{
  "title": "Learn Mongoose (updated)",
  "completed": true
}
```

---

#### Delete a task

```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully"
}
```

---

#### Task Statistics

```http
GET /api/tasks/stats
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 4,
    "pending": 6
  },
  "message": "Task statistics fetched successfully"
}
```

---

## 🗂️ Project Structure

```
src/
├── config/
│   └── db.js               ← MongoDB connection
├── controllers/
│   ├── authController.js   ← register, login, getMe
│   └── taskController.js   ← CRUD + stats
├── docs/
│   └── swagger.js          ← Swagger/OpenAPI config
├── middleware/
│   ├── auth.js             ← JWT protect middleware
│   └── validateRequest.js  ← express-validator error handler
├── models/
│   ├── User.js             ← Mongoose User schema
│   └── Task.js             ← Mongoose Task schema
├── routes/
│   ├── authRoutes.js       ← /api/users/*
│   └── taskRoutes.js       ← /api/tasks/*
└── server.js               ← Express app entry point
```

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens with configurable expiry
- `password` field excluded from all DB queries by default (`select: false`)
- Per-user data isolation — users can only access their own tasks
- Validation on all input fields

---

## ⚠️ HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Resource created                     |
| 400  | Bad request                          |
| 401  | Unauthorized (missing/invalid token) |
| 404  | Resource not found                   |
| 409  | Conflict (duplicate email)           |
| 422  | Validation failed                    |
| 500  | Internal server error                |
