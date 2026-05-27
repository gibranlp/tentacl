# Tentacl Expansion Design: Container Creation Wizard

## 1. Overview
This specification details the design for a multi-step container deployment wizard that provides "maximum control" for container creation, including advanced configuration and file-based deployment.

## 2. Architecture
- **API:**
    - `POST /api/containers/create`: For manual manual deployment (config mapping).
    - `POST /api/images/build`: Handles Dockerfile uploads and triggers build.
    - `POST /api/stacks/deploy`: Handles `docker-compose.yml` deployment.
- **Data Flow:** Multi-step UI collects JSON or files -> Backend parses/validates -> Docker SDK executes deployment.

## 3. UI/UX
- **Wizard Modal:** Multi-step interface with a progress tracker.
- **Sections:**
    - **Basic:** Image selection/build, Container Name.
    - **Advanced:** Ports, Env Vars, Volumes, Restart Policy, Network selection, Resource Limits (CPU/RAM).
    - **File Upload:** Upload area for `Dockerfile`, `docker-compose.yml`, and `.env` files.
- **Interaction:** Floating "+" button in the dashboard/views.

## 4. Key Functionality
- **File Parsing:** Backend handles `.env` parsing to auto-populate Env Vars.
- **Build/Deploy:** Backend triggers Docker build/stack deployment.
- **Validation:** Strict server-side validation of deployment configurations.

## 5. Implementation Strategy
- **Backend:** Create new handlers for stacks and builds; extend container handlers.
- **Frontend:** Implement multi-step component state machine for the wizard modal.
