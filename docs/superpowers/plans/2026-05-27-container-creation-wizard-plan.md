# Container Creation Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a multi-step container creation wizard with support for manual configuration and file uploads (Dockerfile, docker-compose).

**Architecture:**
- **Backend:** New handlers for image builds, stack deployment, and container creation.
- **Frontend:** Multi-step wizard modal integrated globally.
- **Tech Stack:** Go (Docker SDK), React (State Machine).

---

### Task 1: Backend API Expansion
**Files:**
- Create: `backend/handlers/build.go`
- Create: `backend/handlers/stack.go`
- Modify: `backend/handlers/container.go` (Add Create handler)
- Modify: `backend/api/router.go`

- [ ] **Step 1: Implement `BuildHandler`**
  Add `POST /api/images/build` to process Dockerfile uploads.

- [ ] **Step 2: Implement `StackHandler`**
  Add `POST /api/stacks/deploy` to process docker-compose.yml files.

- [ ] **Step 3: Implement Container Create Handler**
  Add `POST /api/containers/create` to process manual configuration.

- [ ] **Step 4: Update `router.go`**
  Register the new endpoints.

### Task 2: Frontend Wizard Foundation
**Files:**
- Create: `frontend/src/components/Wizard/` (Directory)
- Create: `frontend/src/components/Wizard/CreateResourceWizard.tsx`
- Create: `frontend/src/components/Wizard/Steps/` (Step components)

- [ ] **Step 1: Create wizard state machine context**
  Manage `currentStep`, `formData`, `files`.

- [ ] **Step 2: Build Multi-step UI shell**
  Implement the progress tracker and step switching logic.

### Task 3: Wizard Step Implementation
**Files:**
- Modify: `frontend/src/components/Wizard/`

- [ ] **Step 1: Implement Image/File Upload step**
- [ ] **Step 2: Implement Advanced Config step** (Ports, Env, Volumes, Resource Limits)

### Task 4: Integration
**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Connect wizard to backend API**
- [ ] **Step 2: Add toast notifications for deployment success/failure**
