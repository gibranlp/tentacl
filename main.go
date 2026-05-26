package main

import (
	"github.com/gibranlp/tentacl/backend/api"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// Register all routes
	api.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8080"))
}
