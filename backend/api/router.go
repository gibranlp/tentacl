// Package api provides the HTTP API for the Tentacl application.
package api

import (
	"net/http"
	"strings"

	"github.com/docker/docker/client"
	"github.com/gibranlp/tentacl/backend/handlers"
	"github.com/labstack/echo/v4"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo, dockerClient *client.Client, staticFS http.FileSystem) {
	containerHandler := &handlers.ContainerHandler{Docker: dockerClient}
	imageHandler := &handlers.ImageHandler{Docker: dockerClient}
	networkHandler := &handlers.NetworkHandler{Docker: dockerClient}
	volumeHandler := &handlers.VolumeHandler{Docker: dockerClient}
	hostHandler := &handlers.HostHandler{}

	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Tentacl Active")
	})

	e.GET("/api/host/stats", hostHandler.Stats)
	e.GET("/api/containers", containerHandler.List)
	e.POST("/api/containers/:id/start", containerHandler.Start)
	e.POST("/api/containers/:id/stop", containerHandler.Stop)
	e.POST("/api/containers/:id/restart", containerHandler.Restart)
	e.DELETE("/api/containers/:id", containerHandler.Remove)

	e.GET("/api/images", imageHandler.List)
	e.DELETE("/api/images/:id", imageHandler.Remove)
	e.GET("/api/images/:id", imageHandler.Inspect)
	e.GET("/api/networks", networkHandler.List)
	e.DELETE("/api/networks/:id", networkHandler.Remove)
	e.GET("/api/networks/:id", networkHandler.Inspect)
	e.GET("/api/volumes", volumeHandler.List)
	e.DELETE("/api/volumes/:name", volumeHandler.Remove)
	e.GET("/api/volumes/:name", volumeHandler.Inspect)

	e.GET("/api/containers/:id/logs", containerHandler.Logs)
	e.GET("/api/containers/:id/inspect", containerHandler.Inspect)

	if staticFS != nil {
		e.GET("/*", func(c echo.Context) error {
			path := strings.TrimPrefix(c.Request().URL.Path, "/")

			// Don't serve frontend for missing /api routes
			if strings.HasPrefix(path, "api/") {
				return c.String(http.StatusNotFound, "Not Found")
			}

			if path == "" {
				path = "index.html"
			}

			f, err := staticFS.Open(path)
			if err != nil {
				path = "index.html"
				f, err = staticFS.Open(path)
				if err != nil {
					return c.String(http.StatusNotFound, "Not Found")
				}
			}
			defer f.Close()

			fi, err := f.Stat()
			if err != nil {
				return err
			}

			http.ServeContent(c.Response(), c.Request(), path, fi.ModTime(), f)
			return nil
		})
	}
}
