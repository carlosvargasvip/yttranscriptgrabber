# YT-TranscriptGrabber

A simple Express.js server that extracts captions/transcripts from YouTube videos using the reliable `youtube-transcript-api` Python library.

## 🚀 Quick Start

### Option 1: Deploy with Pre-built Image (Recommended)

Use the pre-built Docker image from GitHub Container Registry:

```bash
# Using Docker Compose (recommended)
curl -O https://raw.githubusercontent.com/carlosvargasvip/yttranscriptgrabber/main/docker-compose.deploy.yml
docker-compose -f docker-compose.deploy.yml up -d
```

Or run directly with Docker:

```bash
docker run -d \
  --name YT-TranscriptGrabber \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/carlosvargasvip/yttranscriptgrabber/yt-transcriptgrabber:latest
```

### Option 2: Build from Source

Clone and build locally:

```bash
git clone https://github.com/carlosvargasvip/yttranscriptgrabber.git
cd yttranscriptgrabber
docker-compose up -d
```

## 📋 Usage

Once running, the server will be available at `http://localhost:3000`

### API Endpoints

#### Get Video Transcript
```http
GET /captions?video_url=YOUTUBE_URL&format=json&lang=en
```

**Parameters:**
- `video_url` (required): Full YouTube video URL
- `format` (optional): `json` or `xml` (default: `json`)
- `lang` (optional): Language code (default: `en`)

**Example:**
```bash
curl "http://localhost:3000/captions?video_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json"
```

#### Health Check
```http
GET /health
```

### Response Format

**JSON Response:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "language": "en",
  "format": "json",
  "captionCount": 42,
  "captions": [
    {
      "text": "Never gonna give you up",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

**XML Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<captions>
  <caption index="0">
    <text>Never gonna give you up</text>
    <start>0.0</start>
    <duration>2.5</duration>
  </caption>
</captions>
```

## 🔧 n8n Integration

Use with n8n's **HTTP Request** node:

**Configuration:**
- **Method**: GET
- **URL**: `http://192.168.1.1:3000/captions` (use the internal ip address of your server. If N8N is running on a container it needs the local ip not localhost)
- **Query Parameters**:
  - `video_url`: `{{$json.videoUrl}}`
  - `format`: `json`
  - `lang`: `en`

**Input Data:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "format": "json",
  "language": "en"
}
```

## 🛠️ Development

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/carlosvargasvip/yttranscriptgrabber.git
cd yttranscriptgrabber

# Install dependencies
npm install

# Install Python dependencies
pip install youtube-transcript-api

# Start development server
npm start
```

### Building Custom Image

```bash
# Build image locally
docker build -t yt-transcriptgrabber:custom .

# Run custom build
docker run -p 3000:3000 yt-transcriptgrabber:custom
```

## 📊 Management Commands

### Check Status
```bash
# View running containers
docker ps

# Check logs
docker-compose -f docker-compose.deploy.yml logs -f

# Health check
curl http://localhost:3000/health
```

### Updates
```bash
# Pull latest image and restart
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d

# Or for direct docker run
docker pull ghcr.io/carlosvargasvip/yttranscriptgrabber/yt-transcriptgrabber:latest
docker stop YT-TranscriptGrabber
docker rm YT-TranscriptGrabber
# Then run the docker run command again
```

### Stop Service
```bash
# Stop with docker-compose
docker-compose -f docker-compose.deploy.yml down

# Or stop direct container
docker stop YT-TranscriptGrabber
docker rm YT-TranscriptGrabber
```

## 🌟 Features

- ✅ **No API Keys Required** - Works without YouTube Data API
- ✅ **Auto & Manual Captions** - Supports both transcript types
- ✅ **Multiple Languages** - Specify language with `lang` parameter
- ✅ **Multiple Formats** - JSON and XML output
- ✅ **Docker Ready** - Easy deployment with Docker
- ✅ **Health Monitoring** - Built-in health checks
- ✅ **n8n Compatible** - Perfect for automation workflows
- ✅ **Lightweight** - Alpine Linux based (~50MB image)

## 📝 Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

## 🔍 Troubleshooting

### Common Issues

**"No captions found"**
- Check if the video has captions enabled
- Try different language codes (`en`, `es`, `fr`, etc.)
- Some videos may not have transcripts available

**Container won't start**
- Check if port 3000 is already in use: `netstat -tulpn | grep 3000`
- View container logs: `docker logs YT-TranscriptGrabber`

**Connection refused**
- Ensure container is running: `docker ps`
- Check health endpoint: `curl http://localhost:3000/health`

### Support

For issues and feature requests, please visit:
[GitHub Issues](https://github.com/carlosvargasvip/yttranscriptgrabber/issues)

## 📄 License

MIT License - see LICENSE file for details.

---

**Made with ❤️ for easy YouTube transcript extraction**
