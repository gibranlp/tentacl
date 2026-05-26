package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestHealthCheck(t *testing.T) {
	// Setup
	e := echo.New()
	RegisterRoutes(e, nil)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

	// Assertions
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "Tentacl Active", rec.Body.String())
}

func TestRouter_ContainerListRoute(t *testing.T) {
	e := echo.New()
	RegisterRoutes(e, nil)

	// Check if the route is registered
	found := false
	for _, route := range e.Routes() {
		if route.Path == "/api/containers" && route.Method == http.MethodGet {
			found = true
			break
		}
	}
	assert.True(t, found, "Container list route should be registered")
}
