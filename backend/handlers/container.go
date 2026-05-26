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
