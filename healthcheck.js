#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

echo "Healthcheck: Testing http://localhost:${PORT}/health"

# Try to connect to the health endpoint
if wget --no-verbose --tries=1 --spider "http://localhost:${PORT}/health" 2>&1; then
    echo "Healthcheck: SUCCESS"
    exit 0
else
    echo "Healthcheck: FAILED"
    exit 1
fi
