# Team Task Tracker API

Backend REST API for a team-based task tracker built as part of the SDE II Take Home Assignment.

## Features

### Authentication & Authorization

- JWT Authentication
- Access Token + Refresh Token Rotation
- Role-Based Access Control (RBAC)

Roles:

- ADMIN
- MANAGER
- MEMBER

Permissions:

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to users, projects, and tasks |
| MANAGER | Manage projects/tasks, assign members |
| MEMBER | View and update assigned tasks only |

---

## Task Management

Task fields:

- title
- description
- priority (`LOW`, `MEDIUM`, `HIGH`)
- status
- assignee
- dueDate
- projectId

### Task Status Workflow

```text
TODO
 ↓
IN_PROGRESS
 ↓
IN_REVIEW
 ↓
DONE
```

Blocked status:

```text
TODO → BLOCKED
IN_PROGRESS → BLOCKED
IN_REVIEW → BLOCKED
```

Server-side validation prevents invalid transitions.

Examples:

❌ TODO → DONE

❌ TODO → IN_REVIEW

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- JWT
- Docker
- Swagger/OpenAPI
- Zod Validation

---

## API Documentation

Swagger UI:

```bash
http://localhost:5000/api-docs
```

---

## Setup Instructions

### Prerequisites

Install:

- Docker Desktop

---

### Run Application

Clone repository:

```bash
git clone <your-github-repo-url>
```

Move into project:

```bash
cd team-task-tracker
```

Start application:

```bash
docker compose up --build
```

Server will run at:

```bash
http://localhost:5000
```

Swagger:

```bash
http://localhost:5000/api-docs
```

---

## Environment Variables

Used in Docker:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://mongodb:27017/team-task-tracker

REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=my_access_secret
JWT_REFRESH_SECRET=my_refresh_secret

ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

---

## Database Design Decision

### Why MongoDB References?

Tasks reference:

- User (`assignee`)
- Project (`projectId`)

Using MongoDB references avoids data duplication and keeps relationships normalized.

### Indexes Added

Indexes added on:

- `status`
- `assignee`
- `dueDate`

Reason:

These fields are frequently queried for:

- filtering
- task listing
- assignee-specific queries
- overdue task checks

This improves query performance.

---

## Redis Caching Strategy

Task list endpoint:

```http
GET /api/tasks
```

is cached per assignee.

### Cache Flow

First request:

```text
Redis Miss
↓
MongoDB Query
↓
Cache Result
↓
Response
```

Next requests:

```text
Redis Hit
↓
Fast Response
```

### Cache Invalidation Strategy

Cache is cleared whenever:

- task created
- task updated
- task deleted
- task status updated

This prevents stale task data.

---

## Validation

Input validation implemented using Zod.

Example validation response:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "due_date must be a future date"
}
```

---

## API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Projects

```http
POST /api/projects
GET /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```http
POST /api/tasks
GET /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
PATCH /api/tasks/:id/status
```

---

## Postman Collection

Included in repository:

```text
postman_collection.json
```

---

## Future Improvements

Given more time, I would add:

- Unit & integration testing (Jest + Supertest)
- WebSocket/SSE notifications for task status changes
- Analytics endpoint (overdue tasks + average completion time)
- Centralized logging and error handling
- CI/CD pipeline
- Rate limiting for API security

---

## Author

Sai Kumar kola