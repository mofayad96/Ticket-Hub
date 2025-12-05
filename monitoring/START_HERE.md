# 🚀 Start Here - Monitoring Quick Guide

Your monitoring stack is **already running**! Here's how to use it.

## ✅ Is It Working?

Run this command:
```bash
curl -s http://localhost:9090/api/v1/targets | grep '"health":"up"' | wc -l
```

**Result should be: 3** (all targets are up)

## 📊 View Your Metrics

### Option 1: Grafana (Recommended)
**Best for:** Visual dashboards and graphs

1. Open: http://localhost:3001
2. Login: `admin` / `admin123`
3. Follow **CREATE_DASHBOARD.md** to create your first dashboard

**Or import a pre-made dashboard:**
- Go to Dashboards → Import
- Enter ID: **1860** (Node Exporter Full)
- Select Prometheus data source
- Done! 🎉

### Option 2: Prometheus
**Best for:** Quick queries and debugging

1. Open: http://localhost:9090/graph
2. Try these queries:

**Host CPU:**
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**Container Memory:**
```promql
container_memory_usage_bytes{name=~".+"}
```

**All Services Status:**
```promql
up
```

### Option 3: cAdvisor
**Best for:** Real-time container view

1. Open: http://localhost:8080
2. See all containers with live stats

## 🎯 What Can You Monitor?

### Host System
- CPU usage (per core and total)
- Memory usage
- Disk space and I/O
- Network traffic
- System load

### Docker Containers
- CPU usage per container
- Memory usage per container
- Network traffic per container
- Disk I/O per container
- Container restarts

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Quick reference |
| **VERIFY.md** | Detailed verification steps |
| **CREATE_DASHBOARD.md** | Step-by-step dashboard creation |
| **SIMPLIFIED_SETUP.md** | Complete setup guide |
| **WHAT_GETS_MONITORED.md** | Visual examples |

## 🔧 Common Tasks

### Check Status
```bash
docker-compose -f ../docker-compose.monitoring.yml ps
```

### View Logs
```bash
docker-compose -f ../docker-compose.monitoring.yml logs -f
```

### Restart Services
```bash
docker-compose -f ../docker-compose.monitoring.yml restart
```

### Stop Monitoring
```bash
docker-compose -f ../docker-compose.monitoring.yml down
```

## 🆘 Troubleshooting

### No data in Grafana?
1. Check Prometheus targets: http://localhost:9090/targets
2. All should show "UP"
3. If not, restart: `docker-compose -f ../docker-compose.monitoring.yml restart`

### Can't login to Grafana?
- Username: `admin`
- Password: `admin123`
- URL: http://localhost:3001

### Prometheus shows targets DOWN?
```bash
# Check logs
docker logs prometheus
docker logs node-exporter
docker logs cadvisor
```

## 🎓 Next Steps

1. **Create a dashboard** - Follow CREATE_DASHBOARD.md
2. **Set up alerts** - Get notified when CPU/Memory is high
3. **Customize** - Adjust scrape intervals, retention period
4. **Explore** - Try different queries and visualizations

## 💡 Pro Tips

- **Time range**: Top right in Grafana (Last 5m, 1h, 24h, etc.)
- **Auto-refresh**: Click 🔄 in Grafana for live updates
- **Import dashboards**: Use community dashboards from grafana.com
- **Save queries**: Bookmark useful Prometheus queries

---

**Everything working?** Start with CREATE_DASHBOARD.md to build your first dashboard! 📊
