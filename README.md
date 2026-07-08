# Task Tracker App

Task Tracker is a full-stack task management application. It provides authenticated task CRUD, role-based access control, paginated and filtered task listing, MySQL persistence through Prisma, and real-time task update notifications with Socket.IO.

The backend runs on `http://localhost:5001`, the frontend runs on `http://localhost:5173`, the frontend REST API base URL is `http://localhost:5001/api`, and the Socket.IO URL is `http://localhost:5001`.

## Tech Stack

### Backend

- Node.js, Express, TypeScript
- MySQL
- Prisma 7 with `@prisma/adapter-mariadb`
- JWT access tokens
- HttpOnly refresh token cookie
- Socket.IO
- Zod validation
- Vitest and Supertest

### Frontend

- React, Vite, TypeScript
- Material UI
- Axios
- React Router
- Socket.IO Client

## Key Features

- User registration, login, logout, logout all, refresh token, and current user lookup.
- Refresh sessions persisted in the `AuthSession` table.
- Task CRUD with ownership rules.
- RBAC for `USER` and `ADMIN` roles.
- Paginated task listing.
- Filtering by task status.
- Filtering by owner for admins.
- Admin-only user list endpoint for assigning/filtering normal users.
- Frontend task list with accordion task details and inline editing.
- Real-time task notifications for create, update, and delete events.
- Centralized validation and meaningful JSON error responses.
- Backend automated test coverage for auth, RBAC, filtering, pagination, users, and health.

## Project Structure

```text
task-tracker-app/
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- config/
|   |   |   `-- prisma.ts
|   |   |-- middlewares/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- tasks/
|   |   |   `-- users/
|   |   |-- realtime/
|   |   |   `-- socket.ts
|   |   |-- tests/
|   |   `-- utils/
|   |-- .env.example
|   |-- .env.test.example
|   |-- package.json
|   |-- prisma.config.ts
|   |-- tsconfig.json
|   `-- vitest.config.ts
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- realtime/
|   |   |-- routes/
|   |   |-- theme/
|   |   |-- types/
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- package.json
|   `-- vite.config.ts
|-- postman/
|   |-- Task_Tracker_API.postman_collection.json
|   `-- Task_Tracker_Local.postman_environment.json
|-- .gitignore
`-- README.md
```

Local `node_modules`, `.env`, `.env.test`, build outputs, and OS files are intentionally excluded from the structure above.

## Environment Variables

Environment files are ignored by git. Copy the provided backend examples and replace placeholder values with local values:

```bash
cd backend
cp .env.example .env
cp .env.test.example .env.test
```

Use `backend/.env` for development:

```env
PORT=5001
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/task_tracker"

JWT_ACCESS_SECRET="replace_with_a_strong_secret"
ACCESS_TOKEN_EXPIRES_IN="15m"

REFRESH_TOKEN_EXPIRES_IN_DAYS=7
REFRESH_TOKEN_COOKIE_NAME="refreshToken"
REFRESH_TOKEN_PEPPER="replace_with_a_refresh_token_pepper"

CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

Use `backend/.env.test` for tests and point it to a separate database, for example `task_tracker_test`.

The frontend also uses an ignored `.env` file. Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Do not commit real `.env` or `.env.test` files.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` with your MySQL credentials and set `PORT=5001`.

Create the development database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_tracker;"
```

Apply Prisma migrations and generate the Prisma client:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:5001/health
```

## Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Database Setup with MySQL and Prisma

The Prisma schema defines:

- `User`
- `Task`
- `AuthSession`
- `Role` enum: `USER`, `ADMIN`
- `TaskStatus` enum: `TODO`, `IN_PROGRESS`, `COMPLETED`

Development database setup:

```bash
cd backend
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_tracker;"
npx prisma migrate dev
```

For non-development environments, use the committed migrations:

```bash
npx prisma migrate deploy
```

## Test Database Setup

Backend tests use `.env.test`, loaded from `backend/.env.test.example`.

```bash
cd backend
cp .env.test.example .env.test
```

Edit `DATABASE_URL` in `.env.test` so it points to a dedicated test database:

```env
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/task_tracker_test"
```

Create and sync the test database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_tracker_test;"
npm run db:push:test
```

The test setup clears `AuthSession`, `Task`, and `User` data before each test, so do not point `.env.test` at a database containing data you need to keep.

## Running Backend Tests

```bash
cd backend
npm test
```

The current backend test suite is under `backend/src/tests` and covers auth flows, refresh sessions, task RBAC, task filtering, pagination, admin user listing, and the health endpoint.

## Running the Frontend

Run the backend first on port `5001`, then:

```bash
cd frontend
npm run dev
```

Useful frontend scripts:

```bash
npm run lint
npm run build
npm run preview
```

## Authentication

Authentication uses a short-lived JWT access token and a refresh token stored in an HttpOnly cookie.

1. `POST /api/auth/register` and `POST /api/auth/login` return the user and access token in the JSON response.
2. The refresh token is sent as an HttpOnly cookie named `refreshToken` by default.
3. Protected REST endpoints require `Authorization: Bearer <accessToken>`.
4. `POST /api/auth/refresh-token` reads the refresh cookie, validates the stored `AuthSession`, rotates the refresh token, and returns a new access token.
5. `POST /api/auth/logout` revokes the current refresh session when a refresh cookie is present.
6. `POST /api/auth/logout-all` revokes all active sessions for the authenticated user.

Refresh token hashes, selectors, expiry dates, revocation timestamps, user agent, and IP metadata are stored in `AuthSession`.

## RBAC

The app supports two roles:

- `USER`
  - Can create tasks for themselves.
  - Can view, update, and delete only their own tasks.
  - Cannot filter tasks by another owner.
  - Cannot change a task owner.

- `ADMIN`
  - Can view all tasks.
  - Can create tasks for selected users.
  - Can update, delete, and reassign any task.
  - Can filter tasks by owner.
  - Can call the admin-only users endpoint.

The backend enforces RBAC in the task and user service/controller layers, not only in the frontend.

## Main API Endpoints

Base URL:

```text
http://localhost:5001
```

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | API health check. |
| POST | `/api/auth/register` | No | Register a user and create a refresh session. |
| POST | `/api/auth/login` | No | Login and create a refresh session. |
| POST | `/api/auth/refresh-token` | Refresh cookie | Rotate refresh token and return a new access token. |
| POST | `/api/auth/logout` | Refresh cookie | Revoke the current refresh session and clear cookie. |
| POST | `/api/auth/logout-all` | Bearer token | Revoke all sessions for the current user. |
| GET | `/api/auth/me` | Bearer token | Return the authenticated user. |
| GET | `/api/users` | Admin bearer token | Return normal users as `{ id, name }` for assignment/filtering. |
| POST | `/api/tasks` | Bearer token | Create a task. Admins may provide `ownerId`. |
| GET | `/api/tasks` | Bearer token | List tasks with pagination and filters. |
| GET | `/api/tasks/:id` | Bearer token | Get a task by ID. |
| PATCH | `/api/tasks/:id` | Bearer token | Update a task. Admins may update `ownerId`. |
| DELETE | `/api/tasks/:id` | Bearer token | Delete a task. |

Task list query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Positive integer. Defaults to `1`. |
| `limit` | Positive integer up to `100`. Defaults to `10`. |
| `status` | Optional `TODO`, `IN_PROGRESS`, or `COMPLETED`. |
| `ownerId` | Optional owner filter. Admins can filter by any user; normal users can only use their own ID. |

## Task List Response Shape

`GET /api/tasks` returns tasks in `data` and pagination metadata in `pagination`.

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Example task",
      "description": "Task description",
      "status": "TODO",
      "dueDate": "2026-12-31T00:00:00.000Z",
      "ownerId": 1,
      "owner": {
        "id": 1,
        "name": "Example User",
        "email": "user@example.com",
        "role": "USER"
      },
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## Realtime Socket.IO

Socket.IO runs on the backend server:

```text
http://localhost:5001
```

The frontend connects with the current access token:

```ts
io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: accessToken
  }
});
```

The backend validates the access token during the Socket.IO handshake. Each connected user joins a private `user:<id>` room. Admin users also join the `admins` room.

Events emitted by the backend:

| Event | Trigger | Recipients |
| --- | --- | --- |
| `task:created` | Task creation | Task owner and admins |
| `task:updated` | Task update | Task owner and admins |
| `task:deleted` | Task deletion | Task owner and admins |

The frontend listens for these events, displays notifications, and reloads the current task list.

## Postman Collection

The Postman collection and local environment are included under `postman/`:

- `postman/Task_Tracker_API.postman_collection.json`
- `postman/Task_Tracker_Local.postman_environment.json`

Import both files into Postman, select the `Task Tracker Local` environment, and run the requests against the local backend on `http://localhost:5001`.

The environment includes variables such as:

- `baseUrl`: `http://localhost:5001`
- `apiUrl`: `http://localhost:5001/api`
- `userAccessToken`
- `adminAccessToken`
- `taskId`
- `ownerId`

The collection covers the implemented health, authentication, users, and task CRUD endpoints. Access token variables are intended for local testing only and should not contain real secrets when committed.

## CI Pipeline

A GitHub Actions workflow is included at `.github/workflows/ci.yml`.

The workflow runs on pushes and pull requests targeting `main` and `dev`. It has separate backend and frontend jobs:

- Backend job: starts a MySQL 8 service, installs backend dependencies, syncs the test database, runs backend tests, and builds the backend.
- Frontend job: installs frontend dependencies, runs frontend linting, and builds the frontend.

The CI workflow has been added, but final verification on GitHub Actions is pending.

## Assumptions Made

- A local MySQL server is available for development.
- The backend is configured to run on `PORT=5001`.
- The frontend communicates with `http://localhost:5001/api` and `http://localhost:5001`.
- `.env` and `.env.test` files are local-only and should be copied from the provided examples.
- Backend tests use a dedicated MySQL test database and can safely clear test data before each test.
- Admin users can currently be created through the registration API by sending an admin role to the backend; a production system should restrict admin creation.
- Real-time task events are sent to the task owner and admins.
- The CI workflow exists in the repository, but its final GitHub Actions run still needs to be verified.

## Future Improvements

- Verify and, if needed, refine the GitHub Actions workflow after its first run in GitHub Actions.
- Restrict admin creation to a seed script, invitation flow, or protected admin-only endpoint.
- Add frontend unit/integration tests and end-to-end tests.
- Add token refresh handling for active Socket.IO connections when an access token expires.
- Add task search, sorting, and richer audit history.
- Keep the Postman collection updated as endpoints evolve.
- Add Docker Compose for consistent local MySQL, backend, and frontend startup.
