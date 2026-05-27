package handlers

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"

	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/registry"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type ImageHandler struct {
	Docker *client.Client
}

type PullRequest struct {
	Image string `json:"image"`
	URL   string `json:"url"`
	Token string `json:"token"`
}

func (h *ImageHandler) Pull(c echo.Context) error {
	var req PullRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	authConfig := registry.AuthConfig{}
	if req.URL != "" && req.Token != "" {
		authConfig.ServerAddress = req.URL
		authConfig.RegistryToken = req.Token
	}

	authStr, err := json.Marshal(authConfig)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	reader, err := h.Docker.ImagePull(c.Request().Context(), req.Image, image.PullOptions{RegistryAuth: base64.StdEncoding.EncodeToString(authStr)})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer reader.Close()

	// Wait for pull to complete
	_, _ = io.Copy(io.Discard, reader)

	return c.NoContent(http.StatusOK)
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

func (h *ImageHandler) Inspect(c echo.Context) error {
	id := c.Param("id")
	inspect, _, err := h.Docker.ImageInspectWithRaw(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, inspect)
}
