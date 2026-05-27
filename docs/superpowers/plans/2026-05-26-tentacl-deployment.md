# Tentacl Phase 3: Deployment & Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package Tentacl into a single Docker container where the Go backend serves the React frontend, ready for deployment behind the user's Nginx proxy.

**Architecture:** 
- **Multi-stage Dockerfile**: Builds the React frontend (Vite), then the Go backend, embedding the static assets into the binary using `go:embed`.
- **Runtime**: A single container running the Go binary, mounting the host's `/var/run/docker.sock`.
- **Nginx Integration**: The container will expose a port (e.g., 8080) which the host's Nginx will proxy to (matching the user's provided config pattern).

**Tech Stack:** Docker, Docker Compose, Go (Embedding), React (Vite build).

---

### Task 1: Go Backend Asset Embedding

**Files:**
- Modify: `backend/api/router.go`
- Modify: `main.go`

- [ ] **Step 1: Create embedding logic in Go**
Update the backend to serve static files from a `dist` directory if the route isn't an `/api` route.

- [ ] **Step 2: Update main.go to use embedded assets**
```go
// Example logic for main.go
//go:embed dist/*
var staticContent embed.FS
// ... setup echo to serve staticContent ...
```

- [ ] **Step 3: Commit**
```bash
git add backend/ main.go
git commit -m "feat: enable static asset embedding in go backend"
```

### Task 2: Multi-stage Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Define Frontend Build Stage**
Use `node:22` to build the React app.

- [ ] **Step 2: Define Backend Build Stage**
Use `golang:1.22` to build the Go binary, copying the `dist` from the frontend stage.

- [ ] **Step 3: Define Runtime Stage**
Use a minimal image (like `alpine` or `distroless`) to run the final binary.

- [ ] **Step 4: Commit**
```bash
git add Dockerfile .dockerignore
git commit -m "chore: add multi-stage dockerfile for tentacl"
```

### Task 3: Docker Compose & Instructions

**Files:**
- Create: `docker-compose.yml`
- Modify: `README.md`

- [ ] **Step 1: Create docker-compose.yml**
Include the `/var/run/docker.sock` volume mount and port mapping.

- [ ] **Step 2: Update README.md with Nginx configuration example**
Provide the specific `proxy_pass` configuration needed to match the user's environment.

- [ ] **Step 3: Commit**
```bash
git add docker-compose.yml README.md
git commit -m "docs: add deployment instructions and compose file"
```
