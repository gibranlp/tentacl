package handlers

import (
	"io"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/labstack/echo/v4"
)

// flushWriter wraps an io.Writer and an http.Flusher to ensure data is sent immediately.
type flushWriter struct {
	w io.Writer
	f http.Flusher
}

func (fw *flushWriter) Write(p []byte) (n int, err error) {
	n, err = fw.w.Write(p)
	if fw.f != nil {
		fw.f.Flush()
	}
	return
}

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

	// Set headers for streaming
	res := c.Response()
	res.Header().Set(echo.HeaderContentType, echo.MIMETextPlain)
	res.Header().Set("X-Content-Type-Options", "nosniff")
	res.Header().Set("Connection", "keep-alive")
	res.Header().Set("Transfer-Encoding", "chunked")
	res.WriteHeader(http.StatusOK)

	// Create a flushing writer
	flusher, _ := res.Writer.(http.Flusher)
	fw := &flushWriter{w: res.Writer, f: flusher}

	// Direct stream to response
	// We use stdcopy to demultiplex the Docker stream (header removal)
	// If stdcopy fails (e.g. TTY mode), we fallback to a simple copy
	_, err = stdcopy.StdCopy(fw, fw, logs)
	if err != nil {
		// Fallback for TTY containers where the stream is raw
		_, _ = io.Copy(fw, logs)
	}

	return nil
}

func (h *ContainerHandler) Inspect(c echo.Context) error {
	id := c.Param("id")
	inspect, err := h.Docker.ContainerInspect(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, inspect)
}
