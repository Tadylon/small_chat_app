# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Start all services**: `docker-compose up --build`
- **Stop all services**: `docker-compose down`
- **Restart specific service**: `docker-compose up --build backend`
- **Backend development**: `cd backend && npm run dev`
- **Frontend development**: `cd frontend && npm run dev`
- **Build frontend**: `cd frontend && npm run build`
- **Preview frontend build**: `cd frontend && npm run preview`
- **Start backend production**: `cd backend && npm start`
- **Check database tables**: `docker exec chat_app_db mysql -u root -prootpassword chat_app -e "SHOW TABLES;"`

## Architecture Overview

The application follows a three-service architecture managed by Docker Compose:

1. **Backend Service**:
   - Node.js + Express REST API at `/api/*`
   - MySQL database connection via `backend/config/`
   - Session management with `express-session` and MySQL store
   - Main API routes: `/api/auth`, `/api/chat`, `/api/file`, `/api/group`
   - File uploads stored in `backend/uploads/`
   - Container runs on port 3000

2. **Frontend Service**:
   - Vue 3 application using Pinia (`src/stores/`)
   - API calls centralized in `src/services/api.js`
   - Client-side routing via Vue Router (`src/router/index.js`)
   - Component structure in `src/components/` and page structure in `src/pages/`
   - Container runs on port 8080
   - Uses Vite for development and building

3. **Database Service**:
   - MySQL 8.0 initialized with schema in `db/init.sql`
   - Tables: users, messages, files, groups, group_members, group_messages
   - Container runs on port 3306
   - Persistent data stored in Docker volume `db_data`

Services communicate via Docker network `app_network`:
- Frontend connects to backend via `http://backend:3000`
- Backend connects to database via `db` hostname

## Development Workflow

1. Start all services: `docker-compose up --build`
2. Backend changes: edit `backend/` files (nodemon auto-restarts)
3. Frontend changes: edit `frontend/` files (Vite auto-reloads)
4. Database changes: update `db/init.sql` and restart services

## Environment Configuration

- Backend environment: Configured via docker-compose.yml environment variables
- Frontend environment: Uses `.env` file (gitignored) for local development
- Database credentials: Hardcoded in docker-compose.yml for development
- Session secret: Configured via `SESSION_SECRET` environment variable

## Key Integration Points

- Authentication flow: frontend `api.js` → backend `auth` routes → MySQL sessions
- File handling: Multer middleware for uploads, stored in backend/uploads/
- Docker networking: service names (`backend`, `db`) used as hostnames
- Database initialization: SQL scripts mounted at `/docker-entrypoint-initdb.d/init.sql`

`docker-compose.yml` - 容器编排文件
- **核心功能**: 使用 Docker Compose 编排和管理整个项目的三个服务（`backend`、`frontend`、`db`）。通过这个文件，可以一键启动、停止和管理整个应用环境。

### 代码风格与注释
- **代码风格**: 请遵循 JavaScript 和 **Vue** 的通用最佳实践。
- **注释习惯**: **养成良好的注释习惯**，使用中文注释，在代码中适当添加注释，以便他人（包括未来的你）理解。
- **复杂功能**: 对于任何**复杂的功能、算法或非常规的实现**，请务必添加详细的注释来解释其工作原理、设计思路和注意事项。这有助于代码的可读性和后续维护。

### 版本控制
- **工具**: 使用 **Git** 进行版本控制。请确保所有代码提交都遵循一致的提交信息规范。
- **Git 工作流**: 建议使用**功能分支工作流 (Feature Branch Workflow)**。
    - **主分支**: `main` 或 `master` 分支始终保持稳定，用于部署。
    - **开发分支**: `develop` 分支用于日常开发集成。
    - **功能分支**: 新功能开发从 `develop` 拉取，完成后合并回 `develop`。
- **提交信息**: 遵循**约定式提交 (Conventional Commits)** 规范。例如：`feat: add user authentication endpoint` 或 `fix: correct database connection bug`。
- **忽略文件**: 以下文件和目录不应被版本控制，请确保它们被添加到 `.gitignore` 文件中：
    - `node_modules/`: 所有的依赖库目录。
    - `.env`: 环境变量配置文件，包含敏感信息。
    - `dist/` 或 `build/`: 前端项目的构建输出目录。
    - 任何本地生成的日志文件、缓存文件等。

### 在完成任何任务后，我会立即重新检查整个工作流，以确保：
**命名一致性**：检查所有变量、函数、类和文件的命名是否一致、清晰，并遵循项目规范。
**即时纠正**：如果发现任何命名或代码不一致的问题，我会立即进行修正，而不是等到您再次指出。
**引用同步**：确保所有对变量或函数的引用都与最新的命名保持同步，杜绝前后不一致的情况。