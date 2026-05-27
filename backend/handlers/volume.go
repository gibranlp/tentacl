package handlers

import (
	"net/http"

	"github.com/docker/docker/api/types/volume"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type VolumeHandler struct {
	Docker *client.Client
}

func (h *VolumeHandler) List(c echo.Context) error {
	if h.Docker == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "docker client is not initialized"})
	}
	volumes, err := h.Docker.VolumeList(c.Request().Context(), volume.ListOptions{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, volumes.Volumes)
}

func (h *VolumeHandler) Remove(c echo.Context) error {
	name := c.Param("name")
	if err := h.Docker.VolumeRemove(c.Request().Context(), name, true); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
