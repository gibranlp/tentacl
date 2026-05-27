// Package api provides the HTTP API for the Tentacl application.
package api

import (
	"net/http"
	"strings"

	"github.com/docker/docker/client"
	"github.com/gibranlp/tentacl/backend/db"
	"github.com/gibranlp/tentacl/backend/handlers"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo, dockerClient *client.Client, database *db.DB, staticFS http.FileSystem) {
	containerHandler := &handlers.ContainerHandler{Docker: dockerClient}
	imageHandler := &handlers.ImageHandler{Docker: dockerClient}
	networkHandler := &handlers.NetworkHandler{Docker: dockerClient}
	volumeHandler := &handlers.VolumeHandler{Docker: dockerClient}
	hostHandler := &handlers.HostHandler{}
	authHandler := &handlers.AuthHandler{DB: database}

	// Public routes
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "Tentacl Active")
	})

	authGroup := e.Group("/api/auth")
	authGroup.GET("/status", authHandler.Status)
	authGroup.POST("/setup", authHandler.Setup)
	authGroup.POST("/login", authHandler.Login)

	// Protected routes
	apiGroup := e.Group("/api")
	apiGroup.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: handlers.JWTSecret,
		TokenLookup: "header:Authorization:Bearer ,query:token",
		Skipper: func(c echo.Context) bool {
			// Skip JWT auth for public auth endpoints
			path := c.Request().URL.Path
			return strings.HasPrefix(path, "/api/auth/")
		},
	}))

	apiGroup.POST("/users", authHandler.CreateUser)

	apiGroup.GET("/host/stats", hostHandler.Stats)
	apiGroup.GET("/containers", containerHandler.List)
	apiGroup.POST("/containers/:id/start", containerHandler.Start)
	apiGroup.POST("/containers/:id/stop", containerHandler.Stop)
	apiGroup.POST("/containers/:id/restart", containerHandler.Restart)
	apiGroup.DELETE("/containers/:id", containerHandler.Remove)

	apiGroup.GET("/images", imageHandler.List)
	apiGroup.DELETE("/images/:id", imageHandler.Remove)
	apiGroup.GET("/images/:id", imageHandler.Inspect)
	apiGroup.GET("/networks", networkHandler.List)
	apiGroup.DELETE("/networks/:id", networkHandler.Remove)
	apiGroup.GET("/networks/:id", networkHandler.Inspect)
	apiGroup.GET("/volumes", volumeHandler.List)
	apiGroup.DELETE("/volumes/:name", volumeHandler.Remove)
	apiGroup.GET("/volumes/:name", volumeHandler.Inspect)

	apiGroup.GET("/containers/:id/logs", containerHandler.Logs)
	apiGroup.GET("/containers/:id/inspect", containerHandler.Inspect)

	// Exec uses standard GET but passes token via query param
	apiGroup.GET("/containers/:id/exec", containerHandler.Exec)

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
