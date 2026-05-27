package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestHealthCheck(t *testing.T) {
	// Setup
	e := echo.New()
	RegisterRoutes(e, nil, nil, nil)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

	// Assertions
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "Tentacl Active", rec.Body.String())
}

func TestRouter_ContainerListRoute(t *testing.T) {
	e := echo.New()
	RegisterRoutes(e, nil, nil, nil)

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

func TestStaticAssets(t *testing.T) {
	e := echo.New()
	mockFS := fstest.MapFS{
		"index.html": {Data: []byte("index content")},
		"test.js":    {Data: []byte("js content")},
	}
	RegisterRoutes(e, nil, nil, http.FS(mockFS))

	// Test exact file
	req := httptest.NewRequest(http.MethodGet, "/test.js", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "js content", rec.Body.String())

	// Test fallback for non-existent file
	req = httptest.NewRequest(http.MethodGet, "/non-existent", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "index content", rec.Body.String())

	// Test root fallback
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "index content", rec.Body.String())
}

func TestAPIRouteLeak(t *testing.T) {
	e := echo.New()
	mockFS := fstest.MapFS{
		"index.html": {Data: []byte("index content")},
	}
	RegisterRoutes(e, nil, nil, http.FS(mockFS))

	// Missing API route should be intercepted by JWT middleware and return 401
	// or 404 if the route isn't defined, but the middleware runs first.
	req := httptest.NewRequest(http.MethodGet, "/api/not-found", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.NotEqual(t, "index content", rec.Body.String())
}
