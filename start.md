# Tentacl - Project Roadmap

## 🚀 Mission
Create a license-free, lightweight Portainer alternative ("Tentacl") optimized for personal VPS management with a terminal-inspired aesthetic.

## 🛠 Technology Stack
- **Backend:** Go (Golang) + Docker SDK
- **Frontend:** React + TypeScript + Tailwind CSS (Terminal Theme)
- **Database:** BoltDB (Embedded K/V)
- **Deployment:** Single Docker container (mounting `docker.sock`)

## 📋 Features (v0.1.0 MVP) - COMPLETED ✅
1. **Authentication:** Secure login and setup flow using JWT and BoltDB.
2. **Containers:** List, Start, Stop, Restart, Remove.
3. **Live Logs:** Real-time, auto-scrolling log streaming.
4. **Terminal:** Interactive xterm.js shell access to running containers.
5. **Inspection:** View raw JSON configurations for Containers, Images, Networks, and Volumes.
6. **Images/Networks/Volumes:** List and Remove functionality.
7. **Dashboard:** Live CPU, Memory, and Uptime stats from the host VPS.

---

## 📅 Next Steps (Phase 4: Expansion)
To be tackled tomorrow:

### 1. Resource Creation & Pulling
- [x] Add the ability to `docker pull` new images via the UI.
- [x] Create simple forms to instantiate new Networks and Volumes.

### 2. Container Creation (Advanced)
- [x] Design a wizard to deploy new containers from images (Ports, Env Vars, Volumes).
- [ ] Explore parsing basic `docker-compose.yml` strings to deploy stacks.

### 3. Bulk Actions & UX Polish
- [x] Add checkboxes to tables for bulk deletion/starting of resources.
- [x] Implement toast notifications for successful actions (e.g., "Container started successfully").
- [x] Mobile responsiveness polish for the terminal and split-pane views.

### 4. Admin Management
- [x] Add a "Settings" view to manage admin passwords and create additional users.

