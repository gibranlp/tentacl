package handlers

import (
	"net/http"

	"github.com/gibranlp/tentacl/backend/crypto"
	"github.com/gibranlp/tentacl/backend/db"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type RegistryHandler struct {
	DB *db.DB
}

type RegistryRequest struct {
	URL   string `json:"url"`
	Token string `json:"token"`
}

func (h *RegistryHandler) List(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	username := claims["username"].(string)

	registries, err := h.DB.GetRegistriesByUserID(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, registries)
}

func (h *RegistryHandler) Add(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	username := claims["username"].(string)

	var req RegistryRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	encryptedToken, err := crypto.Encrypt(req.Token)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to encrypt token"})
	}

	registry := db.Registry{
		ID:     uuid.New().String(),
		URL:    req.URL,
		UserID: username,
		Token:  encryptedToken,
	}

	if err := h.DB.SaveRegistry(registry); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, registry)
}

func (h *RegistryHandler) Remove(c echo.Context) error {
	id := c.Param("id")
	if err := h.DB.DeleteRegistry(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
