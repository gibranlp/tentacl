package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

type HostHandler struct{}

type HostStats struct {
	CPUPercent float64 `json:"cpuPercent"`
	MemUsed    uint64  `json:"memUsed"`
	MemTotal   uint64  `json:"memTotal"`
	Uptime     uint64  `json:"uptime"`
}

func (h *HostHandler) Stats(c echo.Context) error {
	ctx := c.Request().Context()

	// CPU - get average for all cores over a 200ms window
	cpuPercents, err := cpu.PercentWithContext(ctx, 200*time.Millisecond, false)
	var cpuVal float64
	if err == nil && len(cpuPercents) > 0 {
		cpuVal = cpuPercents[0]
	}

	// Memory
	vm, err := mem.VirtualMemoryWithContext(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch memory stats"})
	}

	// Uptime
	hostInfo, err := host.InfoWithContext(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch host info"})
	}

	return c.JSON(http.StatusOK, HostStats{
		CPUPercent: cpuVal,
		MemUsed:    vm.Used,
		MemTotal:   vm.Total,
		Uptime:     hostInfo.Uptime,
	})
}
