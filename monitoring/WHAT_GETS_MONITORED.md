# What Gets Monitored - Visual Guide

## 🎯 Monitoring Scope

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR HOST SYSTEM                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  CPU: 8 cores @ 3.2GHz                             │    │
│  │  RAM: 16GB                                          │    │
│  │  Disk: 500GB SSD                                    │    │
│  │  Network: eth0                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │                                   │
│                   Node Exporter                              │
│                   (Port 9100)                                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              DOCKER CONTAINERS                      │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │ node-app │  │  mongo   │  │react-app │  ...    │    │
│  │  │ CPU: 15% │  │ CPU: 8%  │  │ CPU: 5%  │         │    │
│  │  │ RAM:256MB│  │ RAM:512MB│  │ RAM:128MB│         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │                                   │
│                      cAdvisor                                │
│                     (Port 8080)                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Metrics Flow
                           ▼
                    ┌─────────────┐
                    │ Prometheus  │ ◄── Collects & Stores
                    │ (Port 9090) │     (15 days retention)
                    └─────────────┘
                           │
                           │ Query
                           ▼
                    ┌─────────────┐
                    │   Grafana   │ ◄── Visualizes
                    │ (Port 3001) │     (Dashboards)
                    └─────────────┘
```

## 📊 Metrics Collected

### 🖥️ Host System Metrics (Node Exporter)

#### CPU
- ✅ Usage per core
- ✅ Total CPU usage %
- ✅ Load averages (1m, 5m, 15m)
- ✅ Context switches
- ✅ Interrupts

#### Memory
- ✅ Total RAM
- ✅ Used RAM
- ✅ Available RAM
- ✅ Buffers/Cache
- ✅ Swap usage

#### Disk
- ✅ Disk space (used/free)
- ✅ Disk I/O (reads/writes per second)
- ✅ Disk latency
- ✅ Inode usage

#### Network
- ✅ Bytes sent/received
- ✅ Packets sent/received
- ✅ Errors and drops
- ✅ Active connections

#### System
- ✅ Uptime
- ✅ Number of processes
- ✅ File descriptors
- ✅ Boot time

### 🐳 Container Metrics (cAdvisor)

#### Per Container
- ✅ CPU usage %
- ✅ CPU throttling
- ✅ Memory usage (bytes)
- ✅ Memory limits
- ✅ Memory cache
- ✅ Network traffic (in/out)
- ✅ Disk I/O (reads/writes)
- ✅ Filesystem usage

#### Container Health
- ✅ Uptime
- ✅ Restart count
- ✅ Exit codes
- ✅ OOM (Out of Memory) kills

## ❌ What's NOT Monitored

- ❌ Application logs
- ❌ API request/response times
- ❌ Database query performance
- ❌ Custom business metrics
- ❌ User activity
- ❌ Error rates
- ❌ Application-specific metrics

## 🎨 Example Dashboard Views

### Host Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ CPU Usage                    Memory Usage                │
│ [████████░░] 80%            [██████░░░░] 60%            │
│                                                           │
│ Disk Usage                   Network Traffic             │
│ [███░░░░░░░] 30%            ↓ 2.5 MB/s  ↑ 1.2 MB/s      │
│                                                           │
│ Load Average: 2.5, 2.1, 1.8                              │
│ Uptime: 15 days, 3 hours                                 │
└─────────────────────────────────────────────────────────┘
```

### Container Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Container Resources                                      │
│                                                           │
│ node-app      [████████░░] 80%  256MB  ↓ 500KB/s       │
│ mongo         [████░░░░░░] 40%  512MB  ↓ 200KB/s       │
│ react-app     [██░░░░░░░░] 20%  128MB  ↓ 100KB/s       │
│ prometheus    [█░░░░░░░░░] 10%  200MB  ↓  50KB/s       │
│ grafana       [█░░░░░░░░░] 10%  150MB  ↓  30KB/s       │
│                                                           │
│ Total: 5 containers running                              │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Sample Queries

### Find CPU Hogs
```promql
topk(5, rate(container_cpu_usage_seconds_total[5m]))
```

### Find Memory Hogs
```promql
topk(5, container_memory_usage_bytes)
```

### Host CPU Usage
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Disk Space Remaining
```promql
node_filesystem_avail_bytes / node_filesystem_size_bytes * 100
```

## 🎯 Use Cases

### ✅ Good For
- Identifying resource bottlenecks
- Capacity planning
- Detecting container crashes
- Monitoring system health
- Tracking resource trends
- Optimizing container limits

### ❌ Not Good For
- Debugging application errors
- Tracking user behavior
- Monitoring API performance
- Database query optimization
- Business metrics
- Application-level monitoring

## 📈 Data Retention

- **Prometheus**: 15 days of metrics
- **Grafana**: Unlimited dashboard history
- **Disk Usage**: ~1-2GB for 15 days

## 🚀 Getting Started

1. Start the stack:
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. Check Prometheus targets:
   ```
   http://localhost:9090/targets
   ```

3. View raw metrics:
   - Host: http://localhost:9100/metrics
   - Containers: http://localhost:8080/containers/

4. Create dashboards in Grafana:
   ```
   http://localhost:3001
   ```

## 📚 Next Steps

1. **Task 4**: Create Grafana dashboards
2. Set up alerts for critical thresholds
3. Customize retention and scrape intervals
4. Add more hosts if needed

---

**Summary**: This monitoring stack gives you complete visibility into your infrastructure (host + containers) without any application-level complexity.
