# Task Tracker App

Task Tracker is a full-stack task management application. It includes authenticated task CRUD, role-based access control, MySQL persistence, real-time task notifications, automated backend tests, Docker Compose containerization, GitHub Actions CI/CD, and deployment to an Oracle Cloud Free VM.

## Tech Stack

- Backend: Node.js, Express, TypeScript
- Database: MySQL
- ORM: Prisma 7 with MariaDB adapter
- Frontend: React, Vite, TypeScript, Material UI
- Realtime: Socket.IO
- Auth: JWT access token and refresh token in an HttpOnly cookie
- Testing: Vitest and Supertest
- Containerization: Docker Compose
- CI/CD: GitHub Actions
- Deployment: Oracle Cloud Free VM using Docker Compose

## Key Features

- User registration and login.
- Public registration always creates normal `USER` accounts.
- Admin accounts are intentionally not creatable through the public registration endpoint for security reasons.
- Admin users are created through the seed script, not public registration.
- `USER` can create, view, update, and delete only their own tasks.
- `ADMIN` can view and manage all tasks.
- `ADMIN` can assign tasks to users.
- Task CRUD with statuses: `TODO`, `IN_PROGRESS`, `COMPLETED`.
- Pagination and filtering by status.
- Admin-only filtering by assigned user.
- Admin-only users list endpoint for task assignment/filtering.
- Real-time task notifications with Socket.IO.
- Stacked frontend notifications.
- Accordion-based frontend task list.
- Admin UI shows assigned user names.
- Normal user UI hides assigned-user/owner controls.

## Local URLs

- Backend: `http://localhost:5001`
- API base URL: `http://localhost:5001/api`
- Frontend: `http://localhost:5173`
- Socket.IO: `http://localhost:5001`

## Project Structure

```text
task-tracker-app/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- modules/
|   |   |-- middlewares/
|   |   |-- realtime/
|   |   |-- tests/
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- Dockerfile
|   |-- .env.example
|   |-- .env.test.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- package.json
|-- postman/
|   |-- Task_Tracker_API.postman_collection.json
|   `-- Task_Tracker_Local.postman_environment.json
|-- .github/
|   `-- workflows/
|       |-- ci.yml
|       `-- deploy.yml
|-- docker-compose.yml
`-- README.md
```

## Environment Variables

Runtime environment files are ignored by git. Copy the examples and replace placeholder values locally:

```bash
cd backend
cp .env.example .env
cp .env.test.example .env.test
```

Backend variables:

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
```

Use `backend/.env.test` for backend tests and point it to a separate test database, for example `task_tracker_test`.

Frontend variables:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Do not commit real `.env` or `.env.test` files.

## Local Setup

1. Clone the repository.

```bash
git clone <repository-url>
cd task-tracker-app
```

2. Install backend dependencies.

```bash
cd backend
npm install
```

3. Configure backend environment.

```bash
cp .env.example .env
```

Set `PORT=5001` and update `DATABASE_URL` for your local MySQL database.

4. Create/sync the database and Prisma client.

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_tracker;"
npx prisma generate
npx prisma db push
```

5. Start the backend.

```bash
npm run dev
```

6. Install frontend dependencies in a second terminal.

```bash
cd frontend
npm install
```

7. Configure frontend environment if needed.

```bash
printf "VITE_API_URL=http://localhost:5001/api\nVITE_SOCKET_URL=http://localhost:5001\n" > .env
```

8. Start the frontend.

```bash
npm run dev
```

Open `http://localhost:5173`.

## Seed Script

The seed script creates demo users and sample tasks. Because public registration creates `USER` accounts only, this is the intended local/demo path for creating an `ADMIN` account.

```bash
cd backend
npm run seed
```

Demo credentials:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `password123` |
| User | `user@test.com` | `password123` |
| User | `jane@test.com` | `password123` |

## Testing

Backend tests are passing and cover:

- Auth flows
- Health endpoint
- Users API
- Task RBAC
- Task filtering and pagination

Run tests and build:

```bash
cd backend
npm test
npm run build
```

## Docker Compose

Docker Compose starts:

- MySQL
- Backend API
- Frontend served by Nginx

From the project root:

```bash
docker compose up --build
```

Local Docker URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/health`

Stop containers:

```bash
docker compose down
```

Stop containers and remove volumes:

```bash
docker compose down -v
```

For production, MySQL should remain internal to Docker and should not be exposed publicly.

## API Overview

Base URL:

```text
http://localhost:5001
```

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `GET /api/auth/me`

Users:

- `GET /api/users` - admin only

Tasks:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Health:

- `GET /health`

Task list query parameters:

- `page`
- `limit`
- `status`
- `ownerId` - admin-only owner filtering; normal users can only access their own tasks

Task list response shape:

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

## Authentication and Authorization

- Login/register returns a JWT access token in the JSON response.
- Refresh token is stored in an HttpOnly cookie.
- Protected API requests use `Authorization: Bearer <accessToken>`.
- Refresh sessions are stored in the `AuthSession` table.
- Public registration creates `USER` accounts only.
- Admin accounts are created through seed/admin-controlled setup only.

RBAC summary:

- `USER`: manage own tasks only.
- `ADMIN`: view/manage all tasks and assign tasks to users.

## Realtime Updates

Socket.IO runs on `http://localhost:5001`.

The frontend connects with the current access token and listens for:

- `task:created`
- `task:updated`
- `task:deleted`

Events are sent to the task owner and admins. The frontend displays stacked notifications and reloads the current task list when events are received.

## Postman

The Postman collection and local environment are included:

- `postman/Task_Tracker_API.postman_collection.json`
- `postman/Task_Tracker_Local.postman_environment.json`

Import both files into Postman, select the `Task Tracker Local` environment, and run requests against the local backend.

## CI

GitHub Actions CI is defined in `.github/workflows/ci.yml` and has been verified successfully.

CI runs on pushes and pull requests for `main` and `dev` and checks:

- Backend dependency install
- Prisma client generation
- Test database sync
- Backend tests
- Backend build
- Frontend dependency install
- Frontend lint
- Frontend build

## Deployment

The app was deployed to an Oracle Cloud Free VM using Docker Compose.

- Frontend: `http://140.245.223.254`
- Backend health: `http://140.245.223.254:5001/health`

Production deployment uses:

- Docker Compose
- Production deployment uses a server-side `docker-compose.prod.yml` override file for public IP and port configuration.
- Frontend on port `80`
- Backend API and Socket.IO on port `5001`
- MySQL inside Docker only

Required open ports:

- `22` for SSH
- `80` for frontend
- `5001` for backend API and Socket.IO

Deployment command on the server:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Seed command on the deployed server:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npm run seed
```

## CD

GitHub Actions deployment is defined in `.github/workflows/deploy.yml`.

The deployment workflow:

- Runs after CI passes on `main`.
- Connects to the Oracle server over SSH.
- Resets the server repository to `origin/main`.
- Rebuilds and restarts Docker Compose using the production override file.

Required GitHub Secrets:

- `ORACLE_HOST`
- `ORACLE_USER`
- `ORACLE_SSH_KEY_BASE64`
- `ORACLE_PROJECT_PATH`

## Security Notes

- Public registration creates `USER` accounts only.
- Admin accounts are created through seed/admin-controlled setup only.
- Refresh tokens are stored in HttpOnly cookies.
- Access tokens are sent as Bearer tokens.
- Secrets are stored in GitHub Secrets.
- MySQL is not exposed publicly in production.

## Future Improvements

- Add frontend unit/integration tests and end-to-end tests.
- Add access-token refresh handling for active Socket.IO connections.
- Add task search, sorting, and richer audit history.
- Add CI coverage reporting.
