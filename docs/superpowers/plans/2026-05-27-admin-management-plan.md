# Admin Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Settings view for user management, password updates, and Role-Based Access Control (RBAC).

**Architecture:**
- **Database:** Expand `db.User` with a `Role` field (`admin` | `readonly`).
- **Backend API:** Add endpoints for user management (`GET /api/users`, `DELETE /api/users/:username`, `PATCH /api/users/me/password`).
- **Middleware:** Inject role into JWT claims and implement RBAC middleware to protect mutation endpoints.
- **Frontend:** Create `SettingsView` and use `AuthContext` to manage UI visibility based on the user's role.

**Tech Stack:** Go (Echo, bbolt), React, TypeScript.

---

### Task 1: Database & Model Updates
**Files:**
- Modify: `backend/db/db.go`

- [ ] **Step 1: Update User Struct**
  Add `Role string` to the `User` struct. Update `CreateUser` to accept a role parameter (defaulting to `admin` if empty for backward compatibility).

- [ ] **Step 2: Add User Management Methods**
  Implement `GetUsers() ([]User, error)` to list all users (excluding passwords in the return data).
  Implement `DeleteUser(username string) error`.
  Implement `UpdatePassword(username, newPassword string) error`.

### Task 2: Auth Handler & JWT Updates
**Files:**
- Modify: `backend/handlers/auth.go`

- [ ] **Step 1: Update JWT Generation**
  Modify `generateTokenResponse` to include the user's `role` in the JWT claims.

- [ ] **Step 2: Implement User Management Handlers**
  Add `ListUsers`, `DeleteUser`, and `ChangePassword` methods to `AuthHandler`.
  Update `CreateUser` handler to accept a `role` field from the request body.

### Task 3: RBAC Middleware & Routing
**Files:**
- Modify: `backend/api/router.go`

- [ ] **Step 1: Create RBAC Middleware**
  Implement a middleware function that checks the JWT claims for `role == "admin"`. If not admin, return 403 Forbidden.

- [ ] **Step 2: Register Routes & Protect Mutations**
  Register the new user management routes.
  Apply the RBAC middleware to all `POST`, `DELETE`, and `PATCH` routes (except for login/setup and changing own password).

### Task 4: Frontend API & Context Updates
**Files:**
- Create: `frontend/src/api/users.ts`
- Modify: `frontend/src/context/AuthContext.tsx`
- Modify: `frontend/src/api/client.ts`

- [ ] **Step 1: Create User API Client**
  Implement functions to fetch users, delete users, create users, and change password.

- [ ] **Step 2: Decode JWT in AuthContext**
  Install `jwt-decode` (or write a simple base64 decoder). Update `AuthContext` state to include the user's `role`. Expose `role` from `useAuth`.

### Task 5: Settings View Implementation
**Files:**
- Create: `frontend/src/views/SettingsView.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Build SettingsView UI**
  Implement the "Change Password" section.
  Implement the "User Management" section (visible only if `role === 'admin'`).

- [ ] **Step 2: Integrate into App**
  Add "SETTINGS" to `Sidebar` (only visible to admins, or visible to all but showing only password change for read-only).
  Add the `SettingsView` route to `App.tsx`.

### Task 6: Frontend RBAC Enforcement
**Files:**
- Modify: All Table components and `App.tsx`

- [ ] **Step 1: Hide mutation UI for read-only users**
  Use the `role` from `useAuth` to conditionally render the floating "+" button, bulk action headers, and the "ACTIONS" columns in tables if the user is `readonly`.
