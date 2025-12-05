# How to Verify Monitoring is Working

## Quick Check

```bash
# Check all services are running
docker-compose -f ../docker-compose.monitoring.yml ps

# All should show "Up"
```

## 1. Check Prometheus Targets

Visit: http://localhost:9090/targets

You should see **3 targets**, all showing **UP**:
- ✅ prometheus (1/1 up)
- ✅ node-exporter (1/1 up)
- ✅ cadvisor (1/1 up)

## 2. Query Metrics in Prometheus

Visit: http://localhost:9090/graph

Try these queries:

### Host CPU Usage
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
Should show a number (e.g., 15.3 = 15.3% CPU usage)

### Host Memory Usage
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```
Should show memory usage percentage

### Container Memory
```promql
container_memory_usage_bytes{name=~".+"}
```
Should show memory usage for all containers

### Container CPU
```promql
rate(container_cpu_usage_seconds_total{name=~".+"}[5m]) * 100
```
Should show CPU usage for all containers

## 3. Check Grafana

Visit: http://localhost:3001

**Login:** admin / admin123

### Verify Prometheus Data Source

1. Click ☰ menu (top left)
2. Go to **Connections** → **Data sources**
3. You should see **Prometheus** listed
4. Click on it
5. Scroll down and click **Save & test**
6. Should show: ✅ "Successfully queried the Prometheus API"

### Create Your First Dashboard

1. Click ☰ menu → **Dashboards**
2. Click **New** → **New Dashboard**
3. Click **Add visualization**
4. Select **Prometheus** data source
5. In the query box, enter: `up`
6. Click **Run queries**
7. You should see 3 metrics (prometheus, node-exporter, cadvisor)

## 4. Check cAdvisor

Visit: http://localhost:8080

You should see:
- List of all running containers
- CPU, Memory, Network stats for each
- Real-time graphs

## 5. Check Node Exporter

Visit: http://localhost:9100/metrics

You should see a long list of metrics like:
```
node_cpu_seconds_total{cpu="0",mode="idle"} 12345.67
node_memory_MemTotal_bytes 16777216000
node_disk_io_time_seconds_total{device="sda"} 123.45
...
```

## Troubleshooting

### No data in Grafana?
- Check Prometheus targets are UP: http://localhost:9090/targets
- Verify data source connection in Grafana
- Wait 30 seconds for first scrape

### Targets showing DOWN?
```bash
# Check logs
docker logs prometheus
docker logs node-exporter
docker logs cadvisor

# Restart services
docker-compose -f ../docker-compose.monitoring.yml restart
```

### Can't access services?
```bash
# Check ports are not in use
sudo lsof -i :9090  # Prometheus
sudo lsof -i :3001  # Grafana
sudo lsof -i :8080  # cAdvisor
sudo lsof -i :9100  # Node Exporter
```

## What You Should See

### Prometheus (http://localhost:9090)
- Targets page shows 3/3 UP
- Graph page can query metrics
- Status → Configuration shows your config

### Grafana (http://localhost:3001)
- Login works
- Prometheus data source connected
- Can create dashboards
- Can query metrics

### cAdvisor (http://localhost:8080)
- Shows all containers
- Real-time resource usage
- Historical graphs

### Node Exporter (http://localhost:9100/metrics)
- Returns text metrics
- Shows CPU, memory, disk, network stats

## Next Steps

Once verified, you can:
1. Create custom Grafana dashboards
2. Set up alerts in Prometheus
3. Customize scrape intervals
4. Add more exporters

## Quick Test Commands

```bash
# Test Prometheus API
curl -s http://localhost:9090/api/v1/targets | grep '"health":"up"' | wc -l
# Should return: 3

# Test if metrics are being collected
curl -s 'http://localhost:9090/api/v1/query?query=up' | grep '"value":\[' | wc -l
# Should return: 3 or more

# Test Node Exporter
curl -s http://localhost:9100/metrics | grep node_cpu_seconds_total | head -1
# Should return CPU metrics

# Test cAdvisor
curl -s http://localhost:8080/metrics | grep container_memory_usage_bytes | head -1
# Should return container metrics
```

All tests passing? **You're good to go!** 🚀
