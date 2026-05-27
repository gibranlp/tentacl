# Tentacl Expansion Design: Registry & Resource Management

## 1. Overview
This specification details the expansion of the Tentacl project to include user-scoped registry management, image pulling functionality, and a universal resource creation wizard.

## 2. Registry Management
### 2.1 Storage
- **Backend:** BoltDB stores registry entities associated with `user_id`.
- **Entity Schema:**
  - `ID`: UUID
  - `URL`: Registry domain (e.g., `ghcr.io`)
  - `UserID`: Reference to the owner
  - `Token`: AES-encrypted access token
- **Security:** Tokens will be encrypted at rest in BoltDB.

### 2.2 API
- `POST /api/registries`: Register a new registry.
- `GET /api/registries`: List registries for the authenticated user.
- `DELETE /api/registries/:id`: Remove a registry.

## 3. Image Pulling
- **UI:** Integrated into the existing two-pane UI (sidebar: Registry selection + Catalog; main: Search + Pull actions).
- **Backend:** Pull requests leverage the Docker SDK, injecting credentials stored in the database if the selected registry requires authentication.

## 4. Resource Creation Wizard
- **UI:** A floating "Create Resource" button that triggers a universal modal.
- **Workflow:** 
  - User selects resource type: Network, Volume, or Container.
  - Wizard adjusts input fields accordingly (e.g., Name/Driver for Volumes).

## 5. Implementation Strategy
- **Backend:** Extend `backend/handlers` and `backend/db`.
- **Frontend:** Extend the two-pane view and add a global "Create" component.
