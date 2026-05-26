package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

// We can't easily mock *client.Client without changing the handler to use an interface.
// For now, let's just test that the route is registered and returns 500 if Docker is nil.
func TestContainerList_NilDocker(t *testing.T) {
	e := echo.New()
	h := &ContainerHandler{Docker: nil}
	
	req := httptest.NewRequest(http.MethodGet, "/api/containers", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.List(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "docker client is not initialized")
}
