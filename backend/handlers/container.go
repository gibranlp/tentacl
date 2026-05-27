package handlers

import (
	"io"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type ContainerHandler struct {
	Docker *client.Client
}

func (h *ContainerHandler) List(c echo.Context) error {
	if h.Docker == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "docker client is not initialized"})
	}
	containers, err := h.Docker.ContainerList(c.Request().Context(), container.ListOptions{All: true})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, containers)
}

func (h *ContainerHandler) Start(c echo.Context) error {
	id := c.Param("id")
	if err := h.Docker.ContainerStart(c.Request().Context(), id, container.StartOptions{}); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *ContainerHandler) Stop(c echo.Context) error {
	id := c.Param("id")
	if err := h.Docker.ContainerStop(c.Request().Context(), id, container.StopOptions{}); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *ContainerHandler) Restart(c echo.Context) error {
	id := c.Param("id")
	if err := h.Docker.ContainerRestart(c.Request().Context(), id, container.StopOptions{}); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *ContainerHandler) Remove(c echo.Context) error {
	id := c.Param("id")
	if err := h.Docker.ContainerRemove(c.Request().Context(), id, container.RemoveOptions{Force: true}); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *ContainerHandler) Logs(c echo.Context) error {
	id := c.Param("id")
	options := container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Tail:       "100",
	}

	logs, err := h.Docker.ContainerLogs(c.Request().Context(), id, options)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer logs.Close()

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextPlain)
	c.Response().WriteHeader(http.StatusOK)

	// Direct stream to response
	if _, err := io.Copy(c.Response().Writer, logs); err != nil {
		return err
	}

	return nil
}
