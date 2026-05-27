# Tentacl

A lightweight, license-free Docker management dashboard for personal VPS users.

## Features
- **Containers**: List, Start, Stop, Logs, Stats.
- **Images**: List, Pull, Remove.
- **Networks**: List, Create, Inspect.
- **Volumes**: List, Create, Remove.
- **Terminal UI**: Dark mode, monospace, fast.

## Tech Stack
- **Backend**: Go + Docker SDK + Echo
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: BoltDB

## Getting Started

### Docker Compose (Recommended)

1. Clone repo.
2. Run with Compose:
   ```bash
   docker-compose up -d --build
   ```
3. Access at `http://localhost:8095`.

### Nginx Reverse Proxy Example

To host Tentacl behind Nginx, use this configuration:

```nginx
server {
    listen 80;
    server_name tentacl.example.com;

    location / {
        proxy_pass http://127.0.0.1:8095;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Warning
Tentacl requires access to `/var/run/docker.sock` to manage your containers. This gives the application root-level access to your Docker host. **Always run Tentacl behind a secure reverse proxy with authentication.**

---
<p align="right"><sub>creator: gibranlp</sub></p>
