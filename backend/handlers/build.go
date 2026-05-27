package handlers

import (
	"archive/tar"
	"bytes"
	"io"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type BuildHandler struct {
	Docker *client.Client
}

func (h *BuildHandler) Build(c echo.Context) error {
	file, err := c.FormFile("dockerfile")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "No file uploaded"})
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)
	defer tw.Close()

	content, err := io.ReadAll(src)
	if err != nil {
		return err
	}

	header := &tar.Header{
		Name: "Dockerfile",
		Size: int64(len(content)),
	}
	if err := tw.WriteHeader(header); err != nil {
		return err
	}
	if _, err := tw.Write(content); err != nil {
		return err
	}

	res, err := h.Docker.ImageBuild(c.Request().Context(), &buf, types.ImageBuildOptions{
		Dockerfile: "Dockerfile",
		Tags:       []string{file.Filename + ":latest"},
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer res.Body.Close()

	return c.NoContent(http.StatusCreated)
}
