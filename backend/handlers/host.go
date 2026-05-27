package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

type HostHandler struct {
	Docker *client.Client
}

type ContainerStats struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	CPU     float64 `json:"cpu"`
	Memory  uint64  `json:"memory"`
	NetIn   uint64  `json:"netIn"`
	NetOut  uint64  `json:"netOut"`
	Status  string  `json:"status"`
}

type HostStats struct {
	CPUPercent float64          `json:"cpuPercent"`
	MemUsed    uint64           `json:"memUsed"`
	MemTotal   uint64           `json:"memTotal"`
	Uptime     uint64           `json:"uptime"`
	NetIn      uint64           `json:"netIn"`
	NetOut     uint64           `json:"netOut"`
	Containers []ContainerStats `json:"containers"`
}

func (h *HostHandler) Stats(c echo.Context) error {
	ctx := c.Request().Context()

	// CPU
	cpuPercents, _ := cpu.PercentWithContext(ctx, 200*time.Millisecond, false)
	var cpuVal float64
	if len(cpuPercents) > 0 {
		cpuVal = cpuPercents[0]
	}

	// Memory
	vm, _ := mem.VirtualMemoryWithContext(ctx)

	// Uptime
	hostInfo, _ := host.InfoWithContext(ctx)

	// Network Stats (Host)
	ioStats, _ := net.IOCountersWithContext(ctx, false)
	var netIn, netOut uint64
	if len(ioStats) > 0 {
		netIn = ioStats[0].BytesRecv
		netOut = ioStats[0].BytesSent
	}

	// Container Stats
	var containerStats []ContainerStats
	if h.Docker != nil {
		containers, _ := h.Docker.ContainerList(ctx, container.ListOptions{All: false}) // Only running
		var wg sync.WaitGroup
		var mu sync.Mutex

		for _, ctr := range containers {
			wg.Add(1)
			go func(ctr container.Summary) {
				defer wg.Done()
				
				stats, err := h.Docker.ContainerStatsOneShot(ctx, ctr.ID)
				if err != nil {
					return
				}
				defer stats.Body.Close()

				var v struct {
					CPUStats struct {
						CPUUsage struct {
							TotalUsage uint64 `json:"total_usage"`
						} `json:"cpu_usage"`
						SystemCPUUsage uint64 `json:"system_cpu_usage"`
						OnlineCPUs     uint32 `json:"online_cpus"`
					} `json:"cpu_stats"`
					PreCPUStats struct {
						CPUUsage struct {
							TotalUsage uint64 `json:"total_usage"`
						} `json:"cpu_usage"`
						SystemCPUUsage uint64 `json:"system_cpu_usage"`
					} `json:"precpu_stats"`
					MemoryStats struct {
						Usage uint64 `json:"usage"`
					} `json:"memory_stats"`
					Networks map[string]struct {
						RxBytes uint64 `json:"rx_bytes"`
						TxBytes uint64 `json:"tx_bytes"`
					} `json:"networks"`
				}

				if err := json.NewDecoder(stats.Body).Decode(&v); err != nil {
					return
				}

				// Calculate CPU percentage
				cpuDelta := float64(v.CPUStats.CPUUsage.TotalUsage) - float64(v.PreCPUStats.CPUUsage.TotalUsage)
				systemDelta := float64(v.CPUStats.SystemCPUUsage) - float64(v.PreCPUStats.SystemCPUUsage)
				cpuPercent := 0.0
				if systemDelta > 0.0 && cpuDelta > 0.0 {
					cpuPercent = (cpuDelta / systemDelta) * float64(v.CPUStats.OnlineCPUs) * 100.0
				}

				var rx, tx uint64
				for _, net := range v.Networks {
					rx += net.RxBytes
					tx += net.TxBytes
				}

				mu.Lock()
				containerStats = append(containerStats, ContainerStats{
					ID:     ctr.ID[:12],
					Name:   ctr.Names[0][1:], // Remove leading slash
					CPU:    cpuPercent,
					Memory: v.MemoryStats.Usage,
					NetIn:  rx,
					NetOut: tx,
					Status: ctr.State,
				})
				mu.Unlock()
			}(ctr)
		}
		wg.Wait()
	}

	return c.JSON(http.StatusOK, HostStats{
		CPUPercent: cpuVal,
		MemUsed:    vm.Used,
		MemTotal:   vm.Total,
		Uptime:     hostInfo.Uptime,
		NetIn:      netIn,
		NetOut:     netOut,
		Containers: containerStats,
	})
}
