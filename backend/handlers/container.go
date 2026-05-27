package handlers

import (
	"io"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for simplicity in this tool
	},
}

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

	func (h *ContainerHandler) Create(c echo.Context) error {

	var body map[string]interface{}
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	// This is a placeholder for the actual container creation logic
	// We'll need to parse the body into container.Config and container.HostConfig
	return c.JSON(http.StatusCreated, map[string]string{"message": "Container deployment started"})
}


func (h *ContainerHandler) Exec(c echo.Context) error {
	id := c.Param("id")

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	ctx := c.Request().Context()

	execConfig := container.ExecOptions{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          true,
		Cmd:          []string{"sh", "-c", "bash || sh"},
	}

	execCreateRes, err := h.Docker.ContainerExecCreate(ctx, id, execConfig)
	if err != nil {
		ws.WriteMessage(websocket.TextMessage, []byte("Failed to create exec instance: "+err.Error()))
		return nil
	}

	execAttachConfig := container.ExecAttachOptions{
		Tty: true,
	}

	resp, err := h.Docker.ContainerExecAttach(ctx, execCreateRes.ID, execAttachConfig)
	if err != nil {
		ws.WriteMessage(websocket.TextMessage, []byte("Failed to attach to exec instance: "+err.Error()))
		return nil
	}
	defer resp.Close()

	// Read from WS and write to Docker
	go func() {
		for {
			_, msg, err := ws.ReadMessage()
			if err != nil {
				break
			}
			_, _ = resp.Conn.Write(msg)
		}
	}()

	// Read from Docker and write to WS
	buf := make([]byte, 8192)
	for {
		n, err := resp.Reader.Read(buf)
		if n > 0 {
			if writeErr := ws.WriteMessage(websocket.TextMessage, buf[:n]); writeErr != nil {
				break
			}
		}
		if err != nil {
			break
		}
	}

	return nil
}
