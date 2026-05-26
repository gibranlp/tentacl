package main

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/gibranlp/tentacl/backend/api"
	"github.com/gibranlp/tentacl/backend/docker"
	"github.com/labstack/echo/v4"
)

//go:embed all:frontend/dist
var staticContent embed.FS

func main() {
	cli, err := docker.NewClient()
	if err != nil {
		panic(err)
	}
	defer cli.Close()

	e := echo.New()

	distFS, err := fs.Sub(staticContent, "frontend/dist")
	if err != nil {
		panic(err)
	}

	// Register all routes
	api.RegisterRoutes(e, cli, http.FS(distFS))

	e.Logger.Fatal(e.Start(":8080"))
}
