#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

# Test the health endpoint
HEALTH_URL="http://localhost:${PORT}/health"

# Use curl instead of wget for better error handling
if command -v curl >/dev/null 2>&1; then
    # Use curl if available
    if curl -f -s "$HEALTH_URL" >/dev/null; then
        exit 0
    else
        exit 1
    fi
else
    # Fallback to wget
    if wget --quiet --tries=1 --spider "$HEALTH_URL" >/dev/null 2>&1; then
        exit 0
    else
        exit 1
    fi
fi
