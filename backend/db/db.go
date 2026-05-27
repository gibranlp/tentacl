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
	usersBucket = []byte("users")
)

type DB struct {
	db *bbolt.DB
}

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
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
		_, err := tx.CreateBucketIfNotExists(usersBucket)
		return err
	})

	if err != nil {
		return nil, err
	}

	return &DB{db: db}, nil
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

func (d *DB) CreateUser(username, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := User{
		Username: username,
		Password: string(hashedPassword),
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

func (d *DB) ValidateUser(username, password string) (bool, error) {
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
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil, nil
}
