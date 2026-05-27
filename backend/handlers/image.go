package handlers

import (
	"net/http"

	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type ImageHandler struct {
	Docker *client.Client
}

func (h *ImageHandler) List(c echo.Context) error {
	if h.Docker == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "docker client is not initialized"})
	}
	images, err := h.Docker.ImageList(c.Request().Context(), image.ListOptions{All: false})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, images)
}

func (h *ImageHandler) Remove(c echo.Context) error {
	id := c.Param("id")
	if _, err := h.Docker.ImageRemove(c.Request().Context(), id, image.RemoveOptions{Force: true}); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
