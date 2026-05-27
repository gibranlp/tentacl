package db

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"go.etcd.io/bbolt"
	"golang.org/x/crypto/bcrypt"
)

var (
	usersBucket      = []byte("users")
	registriesBucket = []byte("registries")
)

type Registry struct {
	ID     string `json:"id"`
	URL    string `json:"url"`
	UserID string `json:"user_id"`
	Token  string `json:"token"`
}

type DB struct {
	db *bbolt.DB
}

type User struct {
	Username string `json:"username"`
	Password string `json:"password,omitempty"`
	Role     string `json:"role"`
}
func Init(path string) (*DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return nil, err
	}

	db, err := bbolt.Open(path, 0600, &bbolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		if _, err := tx.CreateBucketIfNotExists(usersBucket); err != nil {
			return err
		}
		_, err := tx.CreateBucketIfNotExists(registriesBucket)
		return err
	})

	if err != nil {
		return nil, err
	}

	return &DB{db: db}, nil
}

func (d *DB) SaveRegistry(r Registry) error {
	data, err := json.Marshal(r)
	if err != nil {
		return err
	}
	return d.db.Update(func(tx *bbolt.Tx) error {
		return tx.Bucket(registriesBucket).Put([]byte(r.ID), data)
	})
}

func (d *DB) GetRegistriesByUserID(userID string) ([]Registry, error) {
	var regs []Registry
	err := d.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket(registriesBucket)
		return b.ForEach(func(k, v []byte) error {
			var r Registry
			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}
			if r.UserID == userID {
				regs = append(regs, r)
			}
			return nil
		})
	})
	return regs, err
}

func (d *DB) DeleteRegistry(id string) error {
	return d.db.Update(func(tx *bbolt.Tx) error {
		return tx.Bucket(registriesBucket).Delete([]byte(id))
	})
}

func (d *DB) Close() error {
	return d.db.Close()
}

func (d *DB) HasUsers() (bool, error) {
	hasUsers := false
	err := d.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket(usersBucket)
		hasUsers = b.Stats().KeyN > 0
		return nil
	})
	return hasUsers, err
}

func (d *DB) CreateUser(username, password, role string) error {
	if role == "" {
		role = "admin"
	}
	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := User{
		Username: username,
		Password: string(hashedPassword),
		Role:     role,
	}

	userData, err := json.Marshal(user)
	if err != nil {
		return err
	}

	return d.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket(usersBucket)
		if b.Get([]byte(username)) != nil {
			return fmt.Errorf("user already exists")
		}
		return b.Put([]byte(username), userData)
	})
}

func (d *DB) GetUsers() ([]User, error) {
	var users []User
	err := d.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket(usersBucket)
		return b.ForEach(func(k, v []byte) error {
			var u User
			if err := json.Unmarshal(v, &u); err != nil {
				return err
			}
			u.Password = "" // Do not return passwords
			users = append(users, u)
			return nil
		})
	})
	return users, err
}

func (d *DB) DeleteUser(username string) error {
	return d.db.Update(func(tx *bbolt.Tx) error {
		return tx.Bucket(usersBucket).Delete([]byte(username))
	})
}

func (d *DB) UpdatePassword(username, newPassword string) error {
	return d.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket(usersBucket)
		userData := b.Get([]byte(username))
		if userData == nil {
			return fmt.Errorf("user not found")
		}

		var user User
		if err := json.Unmarshal(userData, &user); err != nil {
			return err
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)

		newUserData, err := json.Marshal(user)
		if err != nil {
			return err
		}

		return b.Put([]byte(username), newUserData)
	})
}

func (d *DB) ValidateUser(username, password string) (*User, error) {
	var user User
	err := d.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket(usersBucket)
		userData := b.Get([]byte(username))
		if userData == nil {
			return fmt.Errorf("user not found")
		}
		return json.Unmarshal(userData, &user)
	})

	if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, err
	}
	
	user.Password = ""
	return &user, nil
}
