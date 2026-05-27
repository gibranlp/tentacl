# Tentacl Design Specification
Date: 2026-05-26
Status: Approved

## Overview
Tentacl is a lightweight, license-free Docker management dashboard designed for single-VPS users. It provides a "Terminal/Dark" aesthetic and focuses on managing local Docker resources via the Unix socket.

## Goals
- **Unlimited:** No feature gates or commercial licensing.
- **Fast:** Compiled Go backend and optimized React frontend.
- **Simple:** Single-binary or single-container deployment.

## Technical Stack
- **Backend:** Go 1.22+
  - Docker SDK for engine communication.
  - Echo or Gin for REST API.
  - BoltDB (bbolt) for embedded persistence.
- **Frontend:** React (TypeScript)
  - Tailwind CSS for styling.
  - Lucide-React for icons.
  - Vite for build tooling.
- **Deployment:** Docker (mounting `/var/run/docker.sock`).

## Feature Scope (MVP)
### 1. Dashboard
- Overview of system resources (CPU, RAM).
- Quick stats: Total containers (running/stopped), total images.

### 2. Container Management
- List all containers with status and port mappings.
- Actions: Start, Stop, Restart, Remove.
- Detailed view: Logs (streaming), Inspect data, Resource stats.

### 3. Image Management
- List local images with sizes and tags.
- Actions: Pull new images, Remove unused images.

### 4. Network Management
- List all Docker networks.
- Actions: Create network, Remove network, Inspect network (see attached containers).

### 5. Volume Management
- List local volumes.
- Actions: Create, Remove.

## UI/UX Design
- **Theme:** Dark/Terminal.
- **Typography:** Monospace fonts (JetBrains Mono or similar).
- **Colors:** Deep blacks, dark grays, neon green/blue accents for status.

## Architecture
- `backend/`: Go source code.
- `frontend/`: React source code.
- `cmd/tentacl/`: Entry point.
- Assets: Frontend built and embedded into Go binary using `go:embed`.
