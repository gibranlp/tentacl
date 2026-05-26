// Package api provides the HTTP API for the Tentacl application.
package api

import (
	"net/http"

	"github.com/docker/docker/client"
	"github.com/gibranlp/tentacl/backend/handlers"
	"github.com/labstack/echo/v4"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo, dockerClient *client.Client) {
	containerHandler := &handlers.ContainerHandler{Docker: dockerClient}

	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Tentacl Active")
	})

	e.GET("/api/containers", containerHandler.List)
}
