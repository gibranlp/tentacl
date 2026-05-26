// Package api provides the HTTP API for the Tentacl application.
package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo) {
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Tentacl Active")
	})
}
