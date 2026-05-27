package handlers

import (
	"net/http"

	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type NetworkHandler struct {
	Docker *client.Client
}

func (h *NetworkHandler) List(c echo.Context) error {
	if h.Docker == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "docker client is not initialized"})
	}
	networks, err := h.Docker.NetworkList(c.Request().Context(), network.ListOptions{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, networks)
}

func (h *NetworkHandler) Remove(c echo.Context) error {
	id := c.Param("id")
	if err := h.Docker.NetworkRemove(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
