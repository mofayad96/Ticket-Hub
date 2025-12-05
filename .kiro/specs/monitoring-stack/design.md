# Design Document: Monitoring Stack Integration

## Overview

This design document outlines the architecture and implementation approach for integrating Prometheus and Grafana monitoring into the Ticket Hub application. The solution uses Docker containers to deploy a complete observability stack that collects metrics from the Node.js backend, MongoDB database, and container infrastructure. The design emphasizes ease of deployment, minimal configuration overhead, and seamless integration with the existing Docker Compose setup.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring Stack                         │
│                                                              │
│  ┌──────────┐         ┌──────────┐        ┌──────────┐    │
│  │ Grafana  │────────▶│Prometheus│◀───────│  Node    │    │
│  │  :3001   │         │  :9090   │        │ Exporter │    │
│  └──────────┘         └──────────┘        └──────────┘    │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Backend  │  │ MongoDB  │  │ cAdvisor │
         │  :4000   │  │ Exporter │  │  :8080   │
         └──────────┘  └──────────┘  └──────────┘
                │            │
                ▼            ▼
         ┌──────────┐  ┌──────────┐
         │ Node.js  │  │ MongoDB  │
         │ Backend  │  │ Database │
         └──────────┘  └──────────┘
```

### Network Architecture

All monitoring services will connect to the existing `fullstackapp` network to enable communication with application services. This allows Prometheus to scrape metrics from the backend and other exporters without exposing additional ports externally.

### Data Flow

1. **Metrics Collection**: Prometheus scrapes metrics from configured targets at regular intervals (default: 15s)
2. **Metrics Storage**: Prometheus stores time-series data in its local TSDB with configurable retention
3. **Visualization**: Grafana queries Prometheus and renders dashboards
4. **Exporters**: Specialized exporters (MongoDB Exporter, Node Exporter, cAdvisor) expose metrics in Prometheus format

## Components and Interfaces

### 1. Prometheus

**Image**: `prom/prometheus:latest`

**Configuration**:
- Port: 9090 (web UI and API)
- Configuration file: `./monitoring/prometheus/prometheus.yml`
- Data persistence: Docker volume `prometheus-data`
- Command flags: `--config.file=/etc/prometheus/prometheus.yml --storage.tsdb.retention.time=15d`

**Scrape Targets**:
- Backend service: `http://node-app:4000/metrics`
- MongoDB Exporter: `http://mongodb-exporter:9216/metrics`
- Node Exporter: `http://node-exporter:9100/metrics`
- cAdvisor: `http://cadvisor:8080/metrics`
- Prometheus itself: `http://localhost:9090/metrics`

### 2. Grafana

**Image**: `grafana/grafana:latest`

**Configuration**:
- Port: 3001 (web UI)
- Data persistence: Docker volume `grafana-data`
- Provisioning: Automatic data source and dashboard configuration
- Environment variables:
  - `GF_SECURITY_ADMIN_USER`: Admin username (default: admin)
  - `GF_SECURITY_ADMIN_PASSWORD`: Admin password (configurable)
  - `GF_USERS_ALLOW_SIGN_UP`: false

**Provisioning Structure**:
```
monitoring/grafana/
├── provisioning/
│   ├── datasources/
│   │   └── prometheus.yml
│   └── dashboards/
│       ├── dashboard.yml
│       └── dashboards/
│           ├── backend-metrics.json
│           ├── container-metrics.json
│           └── mongodb-metrics.json
```

### 3. MongoDB Exporter

**Image**: `percona/mongodb_exporter:latest`

**Configuration**:
- Port: 9216 (metrics endpoint)
- MongoDB URI: `mongodb://root:example@mongo:27017`
- Command: `--mongodb.uri=mongodb://root:example@mongo:27017 --collect-all`

### 4. Node Exporter

**Image**: `prom/node-exporter:latest`

**Configuration**:
- Port: 9100 (metrics endpoint)
- Volumes: Mount host filesystem paths for system metrics
  - `/proc:/host/proc:ro`
  - `/sys:/host/sys:ro`
  - `/:/rootfs:ro`
- Command: `--path.procfs=/host/proc --path.sysfs=/host/sys --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)`

### 5. cAdvisor

**Image**: `gcr.io/cadvisor/cadvisor:latest`

**Configuration**:
- Port: 8080 (web UI and metrics)
- Volumes: Mount Docker socket and system paths
  - `/:/rootfs:ro`
  - `/var/run:/var/run:ro`
  - `/sys:/sys:ro`
  - `/var/lib/docker/:/var/lib/docker:ro`
  - `/dev/disk/:/dev/disk:ro`
- Privileged mode: Required for container metrics collection

### 6. Backend Metrics Integration

The Node.js backend will be instrumented with the `prom-client` library to expose application metrics.

**Metrics Endpoint**: `GET /metrics`

**Metric Categories**:
- **HTTP Metrics**: Request count, duration histogram, error rates by route and method
- **Process Metrics**: CPU usage, memory usage, event loop lag
- **Business Metrics**: Custom counters for tickets created, users registered, authentication attempts

**Implementation**:
- Middleware to track HTTP requests
- Default metrics collection for Node.js process
- Custom metrics for business logic

## Data Models

### Prometheus Configuration Schema

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'ticket-hub'
    environment: 'development'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'backend'
    static_configs:
      - targets: ['node-app:4000']
    metrics_path: '/metrics'
  
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

### Grafana Data Source Configuration

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### Docker Compose Service Definitions

The monitoring stack will be defined in `docker-compose.monitoring.yml` with the following structure:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=15d'
    ports:
      - "9090:9090"
    networks:
      - fullstackapp
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3001:3000"
    networks:
      - fullstackapp
    depends_on:
      - prometheus
    restart: unless-stopped

  mongodb-exporter:
    image: percona/mongodb_exporter:latest
    container_name: mongodb-exporter
    command:
      - '--mongodb.uri=mongodb://root:example@mongo:27017'
      - '--collect-all'
    ports:
      - "9216:9216"
    networks:
      - fullstackapp
    depends_on:
      - mongo
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    ports:
      - "9100:9100"
    networks:
      - fullstackapp
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "8080:8080"
    networks:
      - fullstackapp
    restart: unless-stopped

networks:
  fullstackapp:
    external: true

volumes:
  prometheus-data:
  grafana-data:
```

## Corr
ectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Data persistence across container restarts

*For any* data written to Prometheus or Grafana (metrics, dashboards, configurations), restarting the containers should preserve that data and make it available after restart.

**Validates: Requirements 1.3, 4.4**

### Property 2: Volume persistence integrity

*For any* volume-backed data in the monitoring stack, stopping and removing containers then recreating them should result in the same data being accessible.

**Validates: Requirements 1.3**

## Error Handling

### Container Startup Failures

**Scenario**: A monitoring service fails to start due to configuration errors or missing dependencies.

**Handling**:
- Docker Compose will automatically restart containers with `restart: unless-stopped` policy
- Prometheus and Grafana will log configuration errors to stdout/stderr
- Health checks can be added to verify service readiness

### Network Connectivity Issues

**Scenario**: Prometheus cannot reach scrape targets due to network misconfiguration.

**Handling**:
- Prometheus will mark targets as "down" in the targets UI
- Metrics will show gaps for unreachable targets
- Logs will indicate connection failures with target URLs

### Missing Metrics Endpoints

**Scenario**: Backend service doesn't expose /metrics endpoint or returns invalid format.

**Handling**:
- Prometheus will log scrape errors
- Target will show as "down" or with scrape errors
- Grafana dashboards will show "No Data" for affected panels

### Volume Permission Issues

**Scenario**: Docker volumes have incorrect permissions preventing data writes.

**Handling**:
- Containers will log permission denied errors
- Use appropriate user/group IDs in container configuration
- Document required volume permissions in deployment guide

### Resource Exhaustion

**Scenario**: Prometheus runs out of disk space or memory.

**Handling**:
- Configure appropriate retention periods to manage disk usage
- Set memory limits in Docker Compose to prevent OOM
- Monitor Prometheus's own metrics for resource usage

## Testing Strategy

### Unit Testing

The monitoring stack integration primarily involves configuration and infrastructure setup rather than application code. Unit testing will focus on:

1. **Backend Metrics Instrumentation**:
   - Test that the prom-client middleware correctly tracks HTTP requests
   - Test that custom business metrics increment correctly
   - Test that the /metrics endpoint returns valid Prometheus format
   - Test that metrics are properly labeled with route, method, and status code

2. **Configuration Validation**:
   - Test that prometheus.yml parses correctly
   - Test that Grafana provisioning files are valid YAML/JSON
   - Test that environment variable substitution works correctly

### Property-Based Testing

Property-based testing will verify universal behaviors that should hold across all scenarios:

1. **Property 1: Data Persistence**:
   - Generate random metrics data and dashboard configurations
   - Write data to Prometheus/Grafana
   - Restart containers
   - Verify all data is still accessible
   - This validates Requirements 1.3 and 4.4

2. **Property 2: Volume Integrity**:
   - For any set of monitoring data
   - Stop and remove containers
   - Recreate containers with same volume mounts
   - Verify data is identical to before removal
   - This validates Requirement 1.3

### Integration Testing

Integration tests will verify the complete monitoring stack works end-to-end:

1. **Stack Deployment Test**:
   - Deploy monitoring stack using docker-compose
   - Verify all containers start successfully
   - Verify all services are accessible on expected ports
   - Validates Requirements 1.1, 1.2, 1.4

2. **Metrics Collection Test**:
   - Deploy full application stack with monitoring
   - Generate application traffic (API requests, database operations)
   - Verify Prometheus collects metrics from all targets
   - Verify metrics appear in Grafana dashboards
   - Validates Requirements 2.1-2.4, 3.1-3.4

3. **Dashboard Provisioning Test**:
   - Start Grafana with provisioning configuration
   - Verify Prometheus data source is configured
   - Verify all dashboards are loaded
   - Verify dashboards display data correctly
   - Validates Requirements 4.1, 4.3, 6.1-6.4

4. **Network Connectivity Test**:
   - Deploy monitoring and application stacks separately
   - Verify services can communicate across shared network
   - Validates Requirements 1.4, 7.2

5. **Configuration Reload Test**:
   - Modify prometheus.yml configuration
   - Send reload signal to Prometheus
   - Verify new configuration is active without restart
   - Validates Requirement 8.2

### Manual Testing

Some aspects require manual verification:

1. **Grafana UI Testing**:
   - Access Grafana web interface
   - Verify authentication works
   - Verify dashboards render correctly
   - Verify data source queries return results

2. **Prometheus UI Testing**:
   - Access Prometheus web interface
   - Verify targets are up and being scraped
   - Verify metrics are queryable
   - Verify retention settings are applied

3. **Performance Testing**:
   - Monitor resource usage under load
   - Verify metrics collection doesn't impact application performance
   - Verify Prometheus can handle expected metric volume

### Testing Framework

- **Backend Unit Tests**: Jest or Mocha for Node.js testing
- **Property-Based Tests**: fast-check library for JavaScript/TypeScript
- **Integration Tests**: Docker Compose + shell scripts or Testcontainers
- **Configuration Validation**: YAML/JSON schema validators

### Test Execution Strategy

1. Run unit tests during development of backend metrics instrumentation
2. Run property-based tests after implementing data persistence
3. Run integration tests after completing Docker Compose configuration
4. Run manual tests before considering the feature complete
5. All tests should be automated where possible and included in CI/CD pipeline

## Implementation Phases

### Phase 1: Core Monitoring Stack Setup
- Create Docker Compose file for Prometheus and Grafana
- Configure Prometheus with basic scrape targets
- Set up Grafana with Prometheus data source provisioning
- Verify basic deployment and connectivity

### Phase 2: Exporter Integration
- Add MongoDB Exporter for database metrics
- Add Node Exporter for host system metrics
- Add cAdvisor for container metrics
- Configure Prometheus to scrape all exporters

### Phase 3: Backend Instrumentation
- Install prom-client in Node.js backend
- Implement /metrics endpoint
- Add HTTP request tracking middleware
- Add custom business metrics

### Phase 4: Dashboard Creation
- Create backend API metrics dashboard
- Create container resource utilization dashboard
- Create MongoDB performance dashboard
- Create host system metrics dashboard
- Configure dashboard provisioning

### Phase 5: Integration and Testing
- Test complete stack deployment
- Verify metrics collection from all sources
- Verify dashboard functionality
- Document deployment and usage procedures

## Security Considerations

1. **Grafana Authentication**: Always change default admin password in production
2. **Network Exposure**: Consider using reverse proxy for external access
3. **Secrets Management**: Use Docker secrets or environment files for sensitive data
4. **MongoDB Exporter**: Ensure MongoDB credentials have minimal required permissions
5. **Container Privileges**: cAdvisor requires privileged mode - understand security implications

## Performance Considerations

1. **Scrape Intervals**: Balance between data granularity and resource usage (default 15s)
2. **Retention Period**: Configure based on available disk space (default 15 days)
3. **Metric Cardinality**: Avoid high-cardinality labels that can cause memory issues
4. **Resource Limits**: Set appropriate CPU and memory limits for monitoring containers
5. **Storage**: Use SSD storage for Prometheus data directory for better performance

## Deployment Considerations

1. **Development Environment**: Use docker-compose.monitoring.yml alongside existing compose files
2. **Production Environment**: Consider using external Prometheus/Grafana instances or managed services
3. **Scaling**: For high-traffic applications, consider Prometheus federation or Thanos for long-term storage
4. **Backup**: Regularly backup Grafana dashboards and Prometheus configuration
5. **Updates**: Keep monitoring stack images updated for security patches and new features
