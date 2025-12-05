# Create Your First Dashboard in Grafana

## Step-by-Step Guide

### 1. Login to Grafana
- Go to: http://localhost:3001
- Username: `admin`
- Password: `admin123`

### 2. Create a New Dashboard

1. Click the **☰ menu** (top left)
2. Click **Dashboards**
3. Click **New** → **New Dashboard**
4. Click **Add visualization**
5. Select **Prometheus** as the data source

### 3. Add Host CPU Panel

**Panel 1: CPU Usage**

1. In the query editor, enter:
   ```promql
   100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   ```

2. On the right panel:
   - **Panel title**: Host CPU Usage
   - **Unit**: Percent (0-100)
   - **Min**: 0
   - **Max**: 100

3. Click **Apply** (top right)

### 4. Add More Panels

Click **Add** → **Visualization** for each:

**Panel 2: Memory Usage**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```
- Title: Host Memory Usage
- Unit: Percent (0-100)

**Panel 3: Disk Usage**
```promql
(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100
```
- Title: Disk Usage
- Unit: Percent (0-100)

**Panel 4: Network Traffic**
```promql
rate(node_network_receive_bytes_total{device!~"lo|docker.*"}[5m])
```
- Title: Network In
- Unit: bytes/sec

Add another for Network Out:
```promql
rate(node_network_transmit_bytes_total{device!~"lo|docker.*"}[5m])
```

**Panel 5: Container Memory**
```promql
container_memory_usage_bytes{name=~".+"}
```
- Title: Container Memory Usage
- Unit: bytes
- Legend: {{name}}

**Panel 6: Container CPU**
```promql
rate(container_cpu_usage_seconds_total{name=~".+"}[5m]) * 100
```
- Title: Container CPU Usage
- Unit: Percent (0-100)
- Legend: {{name}}

### 5. Save Dashboard

1. Click **💾 Save** (top right)
2. Name it: "Infrastructure Overview"
3. Click **Save**

## Pre-Made Dashboard (Quick Option)

Instead of creating from scratch, import a pre-made dashboard:

1. Click **☰ menu** → **Dashboards**
2. Click **New** → **Import**
3. Enter dashboard ID: **1860** (Node Exporter Full)
4. Click **Load**
5. Select **Prometheus** as data source
6. Click **Import**

For container monitoring:
- Dashboard ID: **893** (Docker and System Monitoring)

## Useful Queries

### Host Metrics

```promql
# CPU per core
100 - (avg by (cpu) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Load average
node_load1
node_load5
node_load15

# Memory breakdown
node_memory_MemTotal_bytes
node_memory_MemFree_bytes
node_memory_MemAvailable_bytes
node_memory_Buffers_bytes
node_memory_Cached_bytes

# Disk I/O
rate(node_disk_read_bytes_total[5m])
rate(node_disk_written_bytes_total[5m])

# Network errors
rate(node_network_receive_errs_total[5m])
rate(node_network_transmit_errs_total[5m])
```

### Container Metrics

```promql
# Top 5 memory consumers
topk(5, container_memory_usage_bytes{name=~".+"})

# Top 5 CPU consumers
topk(5, rate(container_cpu_usage_seconds_total{name=~".+"}[5m]))

# Container network
rate(container_network_receive_bytes_total{name=~".+"}[5m])
rate(container_network_transmit_bytes_total{name=~".+"}[5m])

# Container restarts
container_last_seen{name=~".+"}
```

## Dashboard Tips

### Time Range
- Top right corner: Select time range (Last 5m, 1h, 6h, 24h, etc.)
- Click 🔄 to auto-refresh

### Variables
Create variables for dynamic dashboards:
1. Dashboard settings (⚙️) → Variables → Add variable
2. Name: `container`
3. Query: `label_values(container_memory_usage_bytes, name)`
4. Use in queries: `{name="$container"}`

### Alerts
Add alerts to panels:
1. Edit panel
2. Click **Alert** tab
3. Create alert rule
4. Set threshold (e.g., CPU > 80%)

### Panel Types
- **Time series**: Line graphs (default)
- **Stat**: Single number
- **Gauge**: Progress bar
- **Bar chart**: Comparisons
- **Table**: Detailed data

## Example Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ Infrastructure Overview                    [Last 1h] 🔄 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  CPU Usage          Memory Usage         Disk Usage      │
│  [████░░] 40%      [██████░░] 60%       [███░░░] 30%    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Network Traffic (In/Out)                                │
│  [Line graph showing network over time]                  │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Container Memory Usage                                  │
│  [Stacked area chart by container]                       │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Container CPU Usage                                     │
│  [Multi-line graph per container]                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Sharing Dashboards

### Export
1. Dashboard settings (⚙️)
2. **JSON Model** → Copy
3. Save to file

### Import
1. **☰ menu** → **Dashboards** → **New** → **Import**
2. Paste JSON or upload file

## Next Steps

1. Create separate dashboards for:
   - Host system metrics
   - Container metrics
   - Network monitoring
   
2. Set up alerts for critical thresholds

3. Explore community dashboards: https://grafana.com/grafana/dashboards/

4. Customize colors, thresholds, and layouts

Happy monitoring! 📊
