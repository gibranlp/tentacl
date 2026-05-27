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
	Role     string `json:"role"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) Status(c echo.Context) error {
	if h.DB == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database is not initialized (h.DB is nil)"})
	}

	hasUsers, err := h.DB.HasUsers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	return c.JSON(http.StatusOK, map[string]bool{"needsSetup": !hasUsers})
}

func (h *AuthHandler) Setup(c echo.Context) error {
	if h.DB == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database is not initialized (h.DB is nil)"})
	}
	
	hasUsers, err := h.DB.HasUsers()
	if err != nil {
		c.Logger().Error("Setup HasUsers error: ", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error checking users: " + err.Error()})
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

	if err := h.DB.CreateUser(req.Username, req.Password, "admin"); err != nil {
		c.Logger().Error("Setup CreateUser error: ", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user: " + err.Error()})
	}

	user, _ := h.DB.ValidateUser(req.Username, req.Password)
	return h.generateTokenResponse(c, user)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	user, err := h.DB.ValidateUser(req.Username, req.Password)
	if err != nil || user == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	return h.generateTokenResponse(c, user)
}

func (h *AuthHandler) ListUsers(c echo.Context) error {
	users, err := h.DB.GetUsers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, users)
}

func (h *AuthHandler) CreateUser(c echo.Context) error {
	var req AuthRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}
	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Username and password required"})
	}

	if err := h.DB.CreateUser(req.Username, req.Password, req.Role); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.NoContent(http.StatusCreated)
}

func (h *AuthHandler) DeleteUser(c echo.Context) error {
	username := c.Param("username")
	currentUser := c.Get("user").(*jwt.Token)
	claims := currentUser.Claims.(jwt.MapClaims)
	currentUsername := claims["username"].(string)

	if username == currentUsername {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Cannot delete yourself"})
	}

	if err := h.DB.DeleteUser(username); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *AuthHandler) ChangePassword(c echo.Context) error {
	currentUser := c.Get("user").(*jwt.Token)
	claims := currentUser.Claims.(jwt.MapClaims)
	username := claims["username"].(string)

	var req ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	valid, err := h.DB.ValidateUser(username, req.CurrentPassword)
	if err != nil || valid == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid current password"})
	}

	if err := h.DB.UpdatePassword(username, req.NewPassword); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.NoContent(http.StatusOK)
}

func (h *AuthHandler) generateTokenResponse(c echo.Context, user *db.User) error {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	t, err := token.SignedString(JWTSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, AuthResponse{Token: t})
}
