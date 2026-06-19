# PLSP Backend

Backend API for the **PLSP (Perceptual Learning Style Preference Questionnaire)** system — a NestJS application that manages questionnaires, anonymous guest submissions, result calculation, reporting exports, and audit logging.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 (Express) |
| Language | TypeScript |
| Database | MySQL 8 + TypeORM |
| Cache | Redis 7 (via `ioredis`) |
| API docs | Swagger UI (`/api-docs`) |
| Validation | class-validator / class-transformer |

## Project structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Environment-based configuration
│   ├── typeorm.config.ts
│   ├── redis.config.ts
│   └── cors.config.ts
├── common/                 # Shared utilities
│   └── redis/              # Global Redis module
│       ├── redis.ts        #   RedisService + CacheKeys
│       └── redis.module.ts #   @Global module registration
├── exceptions/
├── interceptors/
└── modules/                # Feature modules
    ├── audit-log/
    ├── category/
    ├── classification/
    ├── employee/
    ├── question/
    ├── questionnaire/
    ├── result/
    ├── status/
    └── submission/
```

## Prerequisites

- **Node.js** 22 (matches Dockerfile)
- **npm** 9+
- **MySQL** 8.0
- **Redis** 7 (optional — app gracefully falls back to MySQL if unavailable)
- **Docker & Docker Compose** (optional, for containerized setup)

## Step-by-step: run locally

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd PLSP-Project
npm install
```

### 2. Configure environment variables

Copy the example env file and adjust values for your machine:

```bash
cp .env.example .env
```

Minimum required variables:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=plsp_user
DB_PASSWORD=plsp_password
DB_DATABASE=plsp_db

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start MySQL and Redis

**Option A — Docker (recommended)**

```bash
docker compose up db redis -d
```

This starts:
- MySQL on port `3306` (database: `plsp_db`, user: `plsp_user`, password: `plsp_password`)
- Redis on port `6379`

**Option B — local installs**

Ensure MySQL and Redis are running on your machine and match the values in `.env`.

### 4. Run the application

**Development (watch mode):**

```bash
npm run start:dev
```

**Production build:**

```bash
npm run build
npm run start:prod
```

### 5. Verify the API

| Resource | URL |
|----------|-----|
| API base | http://localhost:8080 |
| Swagger docs | http://localhost:8080/api-docs |

---

## Step-by-step: run with Docker Compose (full stack)

Runs the NestJS app, MySQL, and Redis together.

### 1. Create `.env`

```bash
cp .env.example .env
```

When running inside Docker, point the app at the compose service names:

```env
PORT=8080
DB_HOST=db
DB_PORT=3306
DB_USERNAME=plsp_user
DB_PASSWORD=plsp_password
DB_DATABASE=plsp_db

REDIS_HOST=redis
REDIS_PORT=6379
```

### 2. Start all services

```bash
docker compose up --build
```

### 3. Access the API

- App: http://localhost:8080
- Swagger: http://localhost:8080/api-docs

---

## Redis helper

Redis is provided as a global NestJS service in `src/common/redis/redis.ts`.

### Features

- **Connection lifecycle** — connects on startup, closes on shutdown
- **Graceful degradation** — if Redis is down or disabled, the app continues using MySQL
- **Read-through cache** — `getOrSet()` loads from DB on cache miss
- **Centralized keys** — `CacheKeys` keeps naming consistent

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_ENABLED` | `true` | Set to `false` to disable Redis entirely |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Optional password |
| `REDIS_DB` | `0` | Redis database index |
| `REDIS_TTL` | `3600` | Default cache TTL (seconds) |
| `REDIS_SESSION_TTL` | `86400` | Submission session key TTL (seconds) |
| `REDIS_KEY_PREFIX` | `plsp:` | Key prefix for all cache entries |

### Modules using Redis

| Module | Use case |
|--------|----------|
| **Submission** | Fast duplicate-session check for anonymous submissions |
| **Result** | Cache classification rules per category during score calculation |
| **Question** | Cache questions by questionnaire; invalidate on create/update/delete |
| **Questionnaire** | Cache status lookup map (draft/open/close) |
| **Status** | Invalidate status cache on create / update / delete (so questionnaires see fresh statuses) |
| **Classification** | Invalidate rule cache when rules are created, updated, or deleted |

### Usage in a service

```typescript
import { CacheKeys, RedisService } from 'src/common/redis/redis';

@Injectable()
export class ExampleService {
  constructor(private readonly redis: RedisService) {}

  async getData(id: string) {
    return this.redis.getOrSet(
      CacheKeys.questionsByQuestionnaire(id),
      () => this.repository.find({ where: { id } }),
    );
  }
}
```

`RedisModule` is registered globally in `app.module.ts`, so you can inject `RedisService` in any module without importing it again.

---

## Available npm scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start` | Start once |
| `npm run start:prod` | Run compiled output from `dist/` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier formatting |

---

## API modules overview

| Module | Responsibility |
|--------|----------------|
| **Questionnaire** | Create and manage questionnaires, open/close scheduling |
| **Question** | Manage questions linked to questionnaires and categories |
| **Category** | Learning-style categories |
| **Classification** | Score-range rules that map results to labels |
| **Submission** | Anonymous guest submissions with fingerprint-based sessions |
| **Result** | Score calculation, search, bulk delete, PDF/Excel/CSV export |
| **Status** | Questionnaire lifecycle statuses (draft, open, closed) |
| **Employee** | Admin user records |
| **Audit log** | Cross-cutting audit trail for create/update/delete/export actions |

---

## Documentation

Additional project documentation lives in `/documentation`:

- `PLSP_Project_SRS_Documentation.md` — software requirements
- `Data Dictionary.md` — database field reference
- `ER-Diagram.md` — entity relationships

---

## Notes

- TypeORM `synchronize: true` is enabled in development — set to `false` in production and use migrations instead.
- Authentication is not yet implemented; `getCurrentUser` in `src/common/middleware/curr_user.ts` is a stub.
- Redis is optional — when unavailable the app gracefully falls back to MySQL queries for all cached data.
- The Dockerfile uses a **Debian-based** `node:22` image (not Alpine) because the `canvas` native module (used for chart generation in result exports) requires Python and build tools.
- The `.env.example` file contains the full list of configurable environment variables.