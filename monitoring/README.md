# Infrastructure Monitoring Stack

Simple monitoring for host system and Docker container resources.

## What Gets Monitored

### 🖥️ Host System (Node Exporter)
- CPU, Memory, Disk, Network
- System uptime and load

### 🐳 Docker Containers (cAdvisor)
- CPU and Memory per container
- Network and Disk I/O per container
- Container health and restarts

## Quick Start

```bash
# Start monitoring
docker-compose -f ../docker-compose.monitoring.yml up -d

# Verify it's working
./verify-setup.sh
```

## Access Services

| Service | URL | Login |
|---------|-----|-------|
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **cAdvisor** | http://localhost:8080 | - |
| **Node Exporter** | http://localhost:9100/metrics | - |

## Verify It's Working

### 1. Check Prometheus Targets
Visit: http://localhost:9090/targets

Should show **3 targets UP**:
- ✅ prometheus
- ✅ node-exporter  
- ✅ cadvisor

### 2. Test a Query
Visit: http://localhost:9090/graph

Query: `up`

Should return 3 results (all with value 1)

### 3. Check Grafana
1. Login to http://localhost:3001 (admin/admin123)
2. Go to **Connections** → **Data sources**
3. Click **Prometheus** → **Save & test**
4. Should show: ✅ "Successfully queried the Prometheus API"

### 4. Create Your First Dashboard
See **CREATE_DASHBOARD.md** for step-by-step guide

## Documentation

- **VERIFY.md** - How to verify everything is working
- **CREATE_DASHBOARD.md** - Create Grafana dashboards
- **SIMPLIFIED_SETUP.md** - Complete setup guide
- **WHAT_GETS_MONITORED.md** - Visual guide with examples

## Configuration

- `prometheus/prometheus.yml` - Scrape targets
- `grafana/provisioning/` - Auto-configuration

## Data Retention

- Prometheus: 15 days
- Storage: ~1-2GB

## Stop Monitoring

```bash
# Stop (keep data)
docker-compose -f ../docker-compose.monitoring.yml down

# Stop and remove data
docker-compose -f ../docker-compose.monitoring.yml down -v
```
