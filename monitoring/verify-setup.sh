#!/bin/bash

# Verification script for monitoring stack setup
# This script verifies that the Docker Compose file is properly configured

set -e

echo "=== Monitoring Stack Setup Verification ==="
echo ""

# Check if Docker is running
echo "1. Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi
echo "✓ Docker is running"

# Check if docker-compose file exists
echo ""
echo "2. Checking docker-compose.monitoring.yml..."
if [ ! -f "../docker-compose.monitoring.yml" ]; then
    echo "❌ docker-compose.monitoring.yml not found"
    exit 1
fi
echo "✓ docker-compose.monitoring.yml exists"

# Validate docker-compose file
echo ""
echo "3. Validating docker-compose configuration..."
if ! docker-compose -f ../docker-compose.monitoring.yml config > /dev/null 2>&1; then
    echo "❌ docker-compose.monitoring.yml has configuration errors"
    exit 1
fi
echo "✓ docker-compose.monitoring.yml is valid"

# Check if required configuration files exist
echo ""
echo "4. Checking configuration files..."
if [ ! -f "../monitoring/prometheus/prometheus.yml" ]; then
    echo "❌ prometheus.yml not found"
    exit 1
fi
echo "✓ prometheus.yml exists"

if [ ! -d "../monitoring/grafana/provisioning" ]; then
    echo "❌ Grafana provisioning directory not found"
    exit 1
fi
echo "✓ Grafana provisioning directory exists"

# Check if fullstackapp network exists
echo ""
echo "5. Checking Docker network..."
if ! docker network inspect fullstackapp > /dev/null 2>&1; then
    echo "⚠️  fullstackapp network does not exist"
    echo "   Creating network..."
    docker network create fullstackapp
    echo "✓ fullstackapp network created"
else
    echo "✓ fullstackapp network exists"
fi

# List services
echo ""
echo "6. Services defined in docker-compose.monitoring.yml:"
docker-compose -f ../docker-compose.monitoring.yml config --services

echo ""
echo "=== Verification Complete ==="
echo ""
echo "To start the monitoring stack:"
echo "  docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.monitoring.yml logs -f"
echo ""
echo "To stop the monitoring stack:"
echo "  docker-compose -f docker-compose.monitoring.yml down"
echo ""
echo "Access points:"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin123)"
echo "  - cAdvisor: http://localhost:8080"
echo "  - Node Exporter: http://localhost:9100/metrics"
echo "  - MongoDB Exporter: http://localhost:9216/metrics"
