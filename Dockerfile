FROM node:18-alpine

# Install Python, pip, and curl for healthcheck
RUN apk add --no-cache python3 py3-pip curl

# Set working directory
WORKDIR /app

# Create and activate virtual environment for Python dependencies
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install youtube-transcript-api

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Make healthcheck script executable
RUN chmod +x healthcheck.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /app/healthcheck.js

# Start the application
CMD ["npm", "start"]
