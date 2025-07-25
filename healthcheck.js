#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

# Try to connect to the health endpoint
if wget --no-verbose --tries=1 --spider "http://localhost:${PORT}/health" 2>/dev/null; then
    exit 0
else
    exit 1
fi
