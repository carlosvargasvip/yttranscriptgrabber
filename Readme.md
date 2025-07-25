# README.md
# YouTube Captions Server

A simple Express.js server that extracts captions from YouTube videos.

## Quick Start

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Using Docker directly
```bash
# Build the image
docker build -t youtube-captions-server .

# Run the container
docker run -p 3000:3000 youtube-captions-server
```

### Local Development
```bash
npm install
npm start
```

## Usage

- **Health Check**: `GET /health`
- **Get Captions**: `GET /captions?video_url=YOUTUBE_URL&format=json&lang=en`

### Examples
```bash
# JSON format
curl "http://localhost:3000/captions?video_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json"

# XML format
curl "http://localhost:3000/captions?video_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=xml"
```

## n8n Integration

Use HTTP Request node:
- **Method**: GET
- **URL**: `http://localhost:3000/captions`
- **Query Parameters**:
  - `video_url`: Your YouTube URL
  - `format`: `json` or `xml`
  - `lang`: Language code (default: `en`)

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)
