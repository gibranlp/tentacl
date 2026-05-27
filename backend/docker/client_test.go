package docker

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewClient(t *testing.T) {
	client, err := NewClient()
	assert.NoError(t, err)
	assert.NotNil(t, client)
	if client != nil {
		client.Close()
	}
}
