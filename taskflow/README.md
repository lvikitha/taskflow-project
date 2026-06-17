# TaskFlow - AI Powered Task Management Portal

> A full-stack task management application built with Spring Boot,React + Vite + Tailwind CSS,PostgreSQL,JWT Auth,Google Gemini AI, and a blockchain-inspired audit trail.

## Screenshots
<img width="1347" height="592" alt="Screenshot 2026-06-17 190337" src="https://github.com/user-attachments/assets/f54b945b-c30a-452c-9c68-0bfb708a18af" />
<img width="1014" height="584" alt="Screenshot 2026-06-17 190844" src="https://github.com/user-attachments/assets/82e96764-7632-44c0-a85f-a8f8bfc557f2" />
<img width="1328" height="587" alt="Screenshot 2026-06-17 190534" src="https://github.com/user-attachments/assets/60a17bf5-5125-41d2-a486-f20dc2eebc8f" />
<img width="1336" height="593" alt="Screenshot 2026-06-17 190440" src="https://github.com/user-attachments/assets/89395006-4410-4dca-9803-6d85e6569c91" />
<img width="1331" height="556" alt="Screenshot 2026-06-17 190354" src="https://github.com/user-attachments/assets/c81d0d2e-36e6-429b-be76-a5ff07c9e7ec" />

---

#Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│              React 18 + Vite + TypeScript + Tailwind             │
│           Zustand (state) · Axios (HTTP) · React Router          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / REST (JWT Bearer)
┌──────────────────────────────▼──────────────────────────────────┐
│                    Spring Boot 3.2 Backend                       │
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │  Controller  │→ │    Service     │→ │     Repository       │ │
│  │  Layer       │  │    Layer       │  │     Layer (JPA)      │ │
│  └──────────────┘  └────────────────┘  └──────────────────────┘ │
│         │                  │                      │              │
│  Spring Security      AI Service           PostgreSQL DB         │
│  JWT Filter           (Gemini API)         (Entities)            │
│  BCrypt               Blockchain Hash                            │
│  GlobalException      (SHA-256)                                  │
└─────────────────────────────────────────────────────────────────┘
```

#Layered Architecture (Backend)

| Layer | Responsibility |
|---|---|
| Controller | HTTP request/response, input validation, route mapping |
| Service| Business logic, AI calls, blockchain hashing |
| Repository | Database queries via Spring Data JPA |
| Entity | JPA-managed database table models |
| DTO | API request/response shape, decoupled from entities |
| Security | JWT filter, BCrypt password hashing, Spring Security config |
| Exception | Centralized error handling via `@RestControllerAdvice` |

---

#Tech Stack

#Backend
| Technology | Purpose |
|---|---|
| Java 17 | Language |
| Spring Boot 3.2 | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | ORM / database abstraction |
| JWT (jjwt 0.11) | Stateless authentication tokens |
| BCryptPasswordEncoder | Secure password hashing |
| WebFlux WebClient | HTTP client for Gemini AI API |
| SpringDoc OpenAPI | Swagger UI documentation |
| Lombok | Boilerplate reduction |

#Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| TypeScript | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| React Router v6 | Client-side routing |
| Zustand | Lightweight state management |
| Axios | HTTP client with interceptors |
| React Hot Toast | User notifications |
| date-fns | Date formatting |

#Database
- PostgreSQL — relational database for users and tasks

#AI
- Google Gemini 1.5 Flash — task generation & productivity summaries

#DevOps
- Docker + Docker Compose** — containerized deployment
- Nginx — serves React build & reverse-proxies API calls

---

#Project Structure

```
taskflow/
├── backend/
│   ├── src/main/java/com/taskflow/
│   │   ├── TaskFlowApplication.java      # Entry point
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       # Spring Security + CORS + JWT
│   │   │   └── OpenApiConfig.java        # Swagger configuration
│   │   ├── controller/
│   │   │   ├── AuthController.java       # /api/auth/**
│   │   │   ├── TaskController.java       # /api/tasks/**
│   │   │   └── AiController.java         # /api/ai/**
│   │   ├── dto/
│   │   │   └── TaskFlowDTOs.java         # All request/response DTOs
│   │   ├── entity/
│   │   │   ├── User.java                 # User JPA entity
│   │   │   └── Task.java                 # Task JPA entity
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── EmailAlreadyExistsException.java
│   │   │   └── UnauthorizedAccessException.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   └── TaskRepository.java       # Custom JPQL queries
│   │   ├── security/
│   │   │   ├── JwtUtil.java              # Token generation & validation
│   │   │   └── JwtAuthenticationFilter.java
│   │   └── service/
│   │       ├── AuthService.java          # Registration & login logic
│   │       ├── TaskService.java          # CRUD + stats
│   │       ├── AiService.java            # Gemini API integration
│   │       ├── TaskBlockchainService.java # SHA-256 audit hashing
│   │       └── CustomUserDetailsService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Layout.tsx         # Sidebar + nav
│   │   │   └── tasks/
│   │   │       ├── TaskCard.tsx          # Individual task card
│   │   │       └── TaskForm.tsx          # Create/Edit modal (with AI)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx         # Stats + recent tasks
│   │   │   ├── TasksPage.tsx             # Full CRUD + search + filter
│   │   │   └── AiPage.tsx               # AI generator + summarizer
│   │   ├── services/
│   │   │   ├── api.ts                    # Axios instance + interceptors
│   │   │   ├── authService.ts
│   │   │   ├── taskService.ts
│   │   │   └── aiService.ts
│   │   ├── store/
│   │   │   └── authStore.ts              # Zustand auth state
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript interfaces
│   │   ├── App.tsx                       # Routes + guards
│   │   ├── main.tsx
│   │   └── index.css                     # Tailwind + custom components
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

#Database Schema (ER Diagram)

```
┌─────────────────────────────┐       ┌─────────────────────────────────┐
│           users             │       │             tasks                │
├─────────────────────────────┤       ├─────────────────────────────────┤
│ id          BIGSERIAL PK    │───┐   │ id              BIGSERIAL PK    │
│ full_name   VARCHAR(100)    │   │   │ title           VARCHAR(200)    │
│ email       VARCHAR UNIQUE  │   └──→│ user_id         BIGINT FK       │
│ password    VARCHAR (hash)  │       │ description     TEXT            │
│ role        VARCHAR (ENUM)  │       │ priority        VARCHAR (ENUM)  │
│ created_at  TIMESTAMP       │       │ status          VARCHAR (ENUM)  │
└─────────────────────────────┘       │ due_date        DATE            │
                                      │ estimated_effort VARCHAR        │
                                      │ task_hash       VARCHAR(64) ←── Blockchain
                                      │ created_at      TIMESTAMP       │
                                      │ updated_at      TIMESTAMP       │
                                      └─────────────────────────────────┘

Enums:
  priority → LOW | MEDIUM | HIGH | CRITICAL
  status   → TODO | IN_PROGRESS | DONE
  role     → USER | ADMIN
```

---

#API Endpoints

#Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Register new user |
| `POST` | `/api/auth/login` | ❌ Public | Login, receive JWT |

#Tasks (`/api/tasks`) — all require JWT
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks?page=0&size=10` | Get tasks (paginated) |
| `GET` | `/api/tasks/{id}` | Get task by ID |
| `GET` | `/api/tasks/search?keyword=...` | Search tasks |
| `GET` | `/api/tasks/stats` | Dashboard statistics |
| `PUT` | `/api/tasks/{id}` | Full task update |
| `PATCH` | `/api/tasks/{id}/status?status=DONE` | Quick status update |
| `DELETE` | `/api/tasks/{id}` | Delete a task |

# AI Features (`/api/ai`) — all require JWT
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate-task` | Generate task details from title |
| `GET` | `/api/ai/summary` | Get productivity summary |

#Docs
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api/v3/api-docs`

---

#AI Integration Explanation

> Google Gemini 1.5 Flash API

The app integrates three AI features via the Gemini REST API:

#### Feature A — Task Description Generator
- Trigger: User enters a task title on the New Task form and clicks "✨ AI Fill"
- Flow: `title → POST /api/ai/generate-task → Gemini API → JSON response`
- Output: Description, Priority, Estimated Effort, Reasoning
- Prompt strategy: Structured JSON-only prompt with explicit field instructions

#Feature B — Productivity Summarizer
- Trigger: User clicks "Generate Summary" on the AI page
- Flow: Fetch all user tasks → build stats → send to Gemini → parse response
- Output: Overall summary, key insight, 3 personalized recommendations

#Graceful Fallback
If the Gemini API is unavailable (no key / rate limit), both features return a sensible fallback response — the app never crashes due to AI failure.

```java
// In AiService.java
try {
    String aiResponse = callGeminiApi(prompt);
    return parseTaskGenerationResponse(aiResponse, taskTitle);
} catch (Exception e) {
    log.error("AI failed: {}", e.getMessage());
    return buildFallbackTaskDetails(taskTitle); // ← always works
}
```

---

#Blockchain Implementation

> Lightweight Immutable Audit Trail

Every task mutation (create / update) generates a **SHA-256 hash** of the task's full state and stores it in the `task_hash` column.

```java
// TaskBlockchainService.java
private String buildTaskStateString(Task task) {
    return String.format(
        "id=%s|title=%s|desc=%s|status=%s|priority=%s|due=%s|user=%s|ts=%s",
        task.getId(), task.getTitle(), task.getDescription(),
        task.getStatus(), task.getPriority(), task.getDueDate(),
        task.getUser().getId(), LocalDateTime.now().withSecond(0).withNano(0)
    );
}
```

> It works like blockchain:
- Each state change produces a new unique fingerprint
- The hash is stored alongside the record for verification
- Any unauthorized modification to `title`, `description`, `status`, or `priority` would produce a different hash
- Visible as a truncated hash on every TaskCard: `🔗 a3f8c1d2…9e4b7f01`

In a production system, these hashes would be chained (each hash includes the previous) and published to an Ethereum testnet or IPFS.

---

# Local Setup

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 14+
- Maven 3.8+
- (Optional) Docker & Docker Compose

#Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# 2. Set your Gemini API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your-key

# 3. Start everything
docker-compose up --build

# App is live at:
# Frontend → http://localhost:5173
# Backend  → http://localhost:8080/api
# Swagger  → http://localhost:8080/api/swagger-ui.html
```

#Option 2: Manual Setup

**Backend:**
```bash
cd backend

# Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE taskflow;"

# Set environment variables (or edit application.properties)
export DATABASE_URL=jdbc:postgresql://localhost:5432/taskflow
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=your-secret-key-here
export GEMINI_API_KEY=your-gemini-api-key

# Run the backend
mvn spring-boot:run
```

Frontend:
```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8080/api

npm install
npm run dev
# → http://localhost:5173
```

---

#Deployment

#Frontend → Vercel / Netlify
```bash
cd frontend
npm run build
# Deploy /dist folder
# Set env var: VITE_API_URL=https://your-backend-url/api
```

# Backend → Render / Railway
- Connect your GitHub repo
- Set build command: `mvn clean package -DskipTests`
- Set start command: `java -jar target/taskflow-backend-1.0.0.jar`
- Add environment variables from `.env.example`

#Database → Neon / Supabase / Render
- Create a free PostgreSQL instance
- Copy the connection URL to `DATABASE_URL`

---

#Security Measures

| Concern | Solution |
|---|---|
| Password storage | BCrypt hashing (strength 10) |
| Authentication | Stateless JWT (HS256, 24h expiry) |
| Authorization | Per-user data isolation (all queries filter by userId) |
| Input validation | `@Valid` + Bean Validation on all DTOs |
| SQL Injection | Spring Data JPA parameterized queries |
| CORS | Configured in SecurityConfig |
| Secrets | Environment variables, never hardcoded |

---

#Optional Enhancements Implemented

- ✅ **Pagination** — Tasks paginated with `page` and `size` parameters
- ✅ **Search/Filter** — Keyword search + status filter tabs
- ✅ **Docker setup** — Full `docker-compose.yml` with multi-stage builds
- ✅ **Swagger/OpenAPI** — Full API documentation at `/swagger-ui.html`
- ✅ **Role-based** — `USER` and `ADMIN` roles on User entity (extendable)

---

# Assumptions

1. The AI API key (Gemini) is provided via environment variable. Without it, AI features use graceful fallback responses — the app remains fully functional.
2. The blockchain feature is a mock ledger (SHA-256 hashes) rather than an actual on-chain implementation, which is appropriate for the scope of this assignment.
3. Due date validation uses `@Future` on creation only — existing tasks can have past due dates (they're marked as overdue instead).
4. Passwords are hashed with BCrypt; plain text passwords are never stored or logged.
