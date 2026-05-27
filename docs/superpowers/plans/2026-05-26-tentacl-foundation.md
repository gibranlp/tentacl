# Tentacl Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Tentacl Go backend, setup Docker SDK connectivity, and implement the initial Container List API.

**Architecture:** Clean architecture with handlers, services, and repository layers. Go backend serves a REST API and static frontend assets.

**Tech Stack:** Go 1.22+, Docker SDK for Go, Echo (web framework), bbolt (embedded DB).

---

### Task 1: Project Initialization

**Files:**
- Create: `go.mod`
- Create: `main.go`
- Create: `backend/api/router.go`

- [ ] **Step 1: Initialize Go module**
Run: `go mod init github.com/gibranlp/tentacl`

- [ ] **Step 2: Create basic main.go**
```go
package main

import (
	"fmt"
	"net/http"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Tentacl Active")
	})
	e.Logger.Fatal(e.Start(":8080"))
}
```

- [ ] **Step 3: Run tidy to fetch dependencies**
Run: `go mod tidy`

- [ ] **Step 4: Commit**
```bash
git add go.mod main.go
git commit -m "chore: initialize go project"
```

### Task 2: Docker SDK Integration

**Files:**
- Create: `backend/docker/client.go`
- Modify: `main.go`

- [ ] **Step 1: Create Docker client wrapper**
```go
package docker

import (
	"context"
	"github.com/docker/docker/client"
)

func NewClient() (*client.Client, error) {
	return client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
}
```

- [ ] **Step 2: Initialize client in main.go**
```go
// Add to main.go
cli, err := docker.NewClient()
if err != nil {
    panic(err)
}
defer cli.Close()
```

- [ ] **Step 3: Commit**
```bash
git add backend/docker/client.go main.go
git commit -m "feat: add docker sdk client"
```

### Task 3: Container List API

**Files:**
- Create: `backend/handlers/container.go`
- Modify: `backend/api/router.go`

- [ ] **Step 1: Implement Container List handler**
```go
package handlers

import (
	"context"
	"net/http"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type ContainerHandler struct {
	Docker *client.Client
}

func (h *ContainerHandler) List(c echo.Context) error {
	containers, err := h.Docker.ContainerList(context.Background(), container.ListOptions{All: true})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, containers)
}
```

- [ ] **Step 2: Register route**
```go
// In router.go
e.GET("/api/containers", containerHandler.List)
```

- [ ] **Step 3: Commit**
```bash
git add backend/handlers/container.go backend/api/router.go
git commit -m "feat: add container list api"
```
