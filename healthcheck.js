#!/bin/sh

# Get the port from environment variable, default to 3000
PORT=${PORT:-3000}

# Test the health endpoint using IPv4 explicitly
HEALTH_URL="http://127.0.0.1:${PORT}/health"

# Use curl instead of wget for better IPv4 handling
if command -v curl >/dev/null 2>&1; then
    # Use curl with IPv4 only
    if curl -4 -f -s "$HEALTH_URL" >/dev/null; then
        exit 0
    else
        exit 1
    fi
else
    # Fallback to wget with IPv4 only
    if wget --inet4-only --quiet --tries=1 --spider "$HEALTH_URL" >/dev/null 2>&1; then
        exit 0
    else
        exit 1
    fi
fi
