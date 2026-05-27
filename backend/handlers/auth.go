package handlers

import (
	"net/http"
	"time"

	"github.com/gibranlp/tentacl/backend/db"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

var JWTSecret = []byte("tentacl-super-secret-key-change-in-production")

type AuthHandler struct {
	DB *db.DB
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) Status(c echo.Context) error {
	hasUsers, err := h.DB.HasUsers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	return c.JSON(http.StatusOK, map[string]bool{"needsSetup": !hasUsers})
}

func (h *AuthHandler) Setup(c echo.Context) error {
	hasUsers, err := h.DB.HasUsers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	if hasUsers {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Setup already complete"})
	}

	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}
	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Username and password required"})
	}

	if err := h.DB.CreateUser(req.Username, req.Password); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	return h.generateTokenResponse(c, req.Username)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	valid, err := h.DB.ValidateUser(req.Username, req.Password)
	if err != nil || !valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	return h.generateTokenResponse(c, req.Username)
}

func (h *AuthHandler) CreateUser(c echo.Context) error {
	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}
	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Username and password required"})
	}

	if err := h.DB.CreateUser(req.Username, req.Password); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.NoContent(http.StatusCreated)
}

func (h *AuthHandler) generateTokenResponse(c echo.Context, username string) error {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	t, err := token.SignedString(JWTSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, AuthResponse{Token: t})
}
