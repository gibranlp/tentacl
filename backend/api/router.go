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
	registryHandler := &handlers.RegistryHandler{DB: database}
	buildHandler := &handlers.BuildHandler{Docker: dockerClient}
	stackHandler := &handlers.StackHandler{Docker: dockerClient}
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

	// RBAC Middleware
	adminOnly := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*jwt.Token)
			claims := user.Claims.(jwt.MapClaims)
			role := claims["role"].(string)
			if role != "admin" {
				return echo.NewHTTPError(http.StatusForbidden, "Admin access required")
			}
			return next(c)
		}
	}

	// Protected routes
	apiGroup := e.Group("/api")
	apiGroup.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: handlers.JWTSecret,
		TokenLookup: "header:Authorization:Bearer ,query:token",
		ErrorHandler: func(c echo.Context, err error) error {
			authHeader := c.Request().Header.Get("Authorization")
			c.Logger().Errorf("JWT Auth Error: %v | Header: %s", err, authHeader)
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
		},
		Skipper: func(c echo.Context) bool {
			// Skip JWT auth for public auth endpoints
			path := c.Request().URL.Path
			return strings.HasPrefix(path, "/api/auth/")
		},
	}))

	// User management
	apiGroup.GET("/users", authHandler.ListUsers, adminOnly)
	apiGroup.POST("/users", authHandler.CreateUser, adminOnly)
	apiGroup.DELETE("/users/:username", authHandler.DeleteUser, adminOnly)
	apiGroup.PATCH("/users/me/password", authHandler.ChangePassword)

	apiGroup.POST("/registries", registryHandler.Add, adminOnly)
	apiGroup.GET("/registries", registryHandler.List)
	apiGroup.DELETE("/registries/:id", registryHandler.Remove, adminOnly)

	apiGroup.POST("/images/build", buildHandler.Build, adminOnly)
	apiGroup.POST("/stacks/deploy", stackHandler.Deploy, adminOnly)
	apiGroup.POST("/containers/create", containerHandler.Create, adminOnly)

	apiGroup.GET("/host/stats", hostHandler.Stats)
	apiGroup.GET("/containers", containerHandler.List)
	apiGroup.POST("/containers/:id/start", containerHandler.Start, adminOnly)
	apiGroup.POST("/containers/:id/stop", containerHandler.Stop, adminOnly)
	apiGroup.POST("/containers/:id/restart", containerHandler.Restart, adminOnly)
	apiGroup.DELETE("/containers/:id", containerHandler.Remove, adminOnly)

	apiGroup.GET("/images", imageHandler.List)
	apiGroup.POST("/images/pull", imageHandler.Pull, adminOnly)
	apiGroup.DELETE("/images/:id", imageHandler.Remove, adminOnly)
	apiGroup.GET("/images/:id", imageHandler.Inspect)
	apiGroup.GET("/networks", networkHandler.List)
	apiGroup.DELETE("/networks/:id", networkHandler.Remove, adminOnly)
	apiGroup.GET("/networks/:id", networkHandler.Inspect)
	apiGroup.GET("/volumes", volumeHandler.List)
	apiGroup.DELETE("/volumes/:name", volumeHandler.Remove, adminOnly)
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
