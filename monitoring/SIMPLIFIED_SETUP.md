# Simplified Infrastructure Monitoring Setup

## ✅ What's Included

Your monitoring stack now focuses **only on infrastructure metrics**:

### 4 Services
1. **Prometheus** - Collects and stores metrics
2. **Grafana** - Visualizes metrics in dashboards
3. **Node Exporter** - Monitors host system (CPU, RAM, Disk, Network)
4. **cAdvisor** - Monitors Docker containers

### ❌ What's NOT Included
- ~~MongoDB Exporter~~ (removed)
- ~~Backend API metrics~~ (removed)
- ~~Application-level monitoring~~ (removed)

## 🎯 What You Can Monitor

### Host System
```
CPU:     [████████░░] 80%
Memory:  [██████░░░░] 60% (9.6GB / 16GB)
Disk:    [███░░░░░░░] 30% (30GB / 100GB)
Network: ↓ 2.5 MB/s  ↑ 1.2 MB/s
```

### Docker Containers
```
Container          CPU    Memory      Network
node-app          15%    256MB       ↓ 500KB/s
mongo             8%     512MB       ↓ 200KB/s
react-app         5%     128MB       ↓ 100KB/s
prometheus        3%     200MB       ↓ 50KB/s
grafana           2%     150MB       ↓ 30KB/s
```

## 🚀 Quick Start

```bash
# Start monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Check it's running
docker-compose -f docker-compose.monitoring.yml ps

# Access Grafana
open http://localhost:3001
# Login: admin / admin123
```

## 📊 What to Do Next

### 1. Verify Prometheus is Collecting Data
Visit http://localhost:9090/targets

You should see:
- ✅ prometheus (1/1 up)
- ✅ node-exporter (1/1 up)  
- ✅ cadvisor (1/1 up)

### 2. Query Some Metrics in Prometheus
Visit http://localhost:9090/graph

Try these queries:
```promql
# Host CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Container memory usage
container_memory_usage_bytes{name=~".+"}

# Network traffic
rate(node_network_receive_bytes_total[5m])
```

### 3. Create Grafana Dashboards (Task 4)
You'll create two dashboards:
- **Host Metrics Dashboard**: CPU, Memory, Disk, Network
- **Container Metrics Dashboard**: Per-container resource usage

## 📁 Configuration Files

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Scrape config (3 targets)
├── grafana/
│   └── provisioning/           # Auto-config for Grafana
└── INFRASTRUCTURE_MONITORING.md # Detailed docs
```

## 🔧 Customization

### Change Retention Period
Edit `docker-compose.monitoring.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'  # Change from 15d to 30d
```

### Change Scrape Interval
Edit `monitoring/prometheus/prometheus.yml`:
```yaml
global:
  scrape_interval: 30s  # Change from 15s to 30s
```

### Change Grafana Password
Edit `docker-compose.monitoring.yml`:
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=your_secure_password
```

## 🛑 Stopping

```bash
# Stop (keep data)
docker-compose -f docker-compose.monitoring.yml down

# Stop and delete all data
docker-compose -f docker-compose.monitoring.yml down -v
```

## 💾 Data Storage

Metrics are stored in Docker volumes:
- `prometheus-data`: 15 days of metrics (configurable)
- `grafana-data`: Your dashboards and settings

These persist even if you stop/restart containers.

## 🎓 Learning Resources

### Prometheus Queries
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)

### Grafana Dashboards
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/)
- [Pre-built Dashboards](https://grafana.com/grafana/dashboards/)

### Metrics to Monitor
- Node Exporter: https://github.com/prometheus/node_exporter
- cAdvisor: https://github.com/google/cadvisor

## ❓ Common Questions

**Q: Can I add application metrics later?**
A: Yes! Just add the scrape config back to `prometheus.yml` and restart.

**Q: How much disk space does this use?**
A: Prometheus uses ~1-2GB for 15 days of infrastructure metrics.

**Q: Can I monitor multiple hosts?**
A: Yes! Install Node Exporter on other hosts and add them to Prometheus config.

**Q: Does this slow down my containers?**
A: No. cAdvisor has minimal overhead (<1% CPU typically).

## 📞 Need Help?

Check these files:
- `monitoring/INFRASTRUCTURE_MONITORING.md` - Detailed documentation
- `monitoring/QUICK_START.md` - Original setup guide
- `.kiro/specs/monitoring-stack/design.md` - Technical design

Or check Prometheus targets: http://localhost:9090/targets
