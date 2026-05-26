package main

import (
	"github.com/gibranlp/tentacl/backend/api"
	"github.com/gibranlp/tentacl/backend/docker"
	"github.com/labstack/echo/v4"
)

func main() {
	cli, err := docker.NewClient()
	if err != nil {
		panic(err)
	}
	defer cli.Close()

	e := echo.New()

	// Register all routes
	api.RegisterRoutes(e, cli)

	e.Logger.Fatal(e.Start(":8080"))
}
