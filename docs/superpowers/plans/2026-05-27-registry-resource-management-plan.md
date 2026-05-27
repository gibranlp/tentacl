# Registry & Resource Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement user-scoped registry management, image pulling, and a universal resource creation wizard.

**Architecture:**
- **Registry Management:** BoltDB storage (user-scoped) with encrypted tokens.
- **API:** New `/api/registries` endpoints.
- **Frontend:** Integrated UI with registry-aware search and a global "Create Resource" wizard.

**Tech Stack:** Go, Echo, BoltDB, React, TypeScript.

---

### Task 1: Registry Database Layer
**Files:**
- Modify: `backend/db/db.go`
- Create: `backend/api/registry.go` (models/logic)

- [ ] **Step 1: Add registry schema to `db/db.go`**
  Add `Registry` struct and helper methods to fetch/save/delete registries.

- [ ] **Step 2: Implement Encryption helper**
  Add `crypto/encrypt.go` to handle token encryption/decryption.

### Task 2: Registry API Endpoints
**Files:**
- Create: `backend/handlers/registry.go`
- Modify: `backend/api/router.go`

- [ ] **Step 1: Create `RegistryHandler`**
  Implement `List`, `Add`, `Remove` endpoints.

- [ ] **Step 2: Update `router.go`**
  Register routes:
  - `POST /api/registries`
  - `GET /api/registries`
  - `DELETE /api/registries/:id`

### Task 3: Frontend Registry Management
**Files:**
- Modify: `frontend/src/views/` (Registry integration)
- Create: `frontend/src/api/registry.ts`

- [ ] **Step 1: Create API client for registries**
- [ ] **Step 2: Update UI to show Registry sidebar in Images view**

### Task 4: Image Pulling Integration
**Files:**
- Modify: `backend/handlers/image.go`
- Modify: `frontend/src/views/`

- [ ] **Step 1: Update `ImageList` to trigger pull**
  Add POST endpoint `/api/images/pull` with registry credentials.

- [ ] **Step 2: Connect frontend to pull functionality**

### Task 5: Creation Wizard
**Files:**
- Create: `frontend/src/components/CreateResourceWizard.tsx`
- Modify: `frontend/src/App.tsx` (Add button + modal state)

- [ ] **Step 1: Build the wizard component**
- [ ] **Step 2: Integrate global button and state**
