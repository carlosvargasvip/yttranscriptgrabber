const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for n8n
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Your original function converted to Express endpoint
app.get('/captions', async (req, res) => {
    const videoUrl = req.query.video_url;
    const format = req.query.format || 'json';
    const lang = req.query.lang || 'en';

    console.log(`Processing request - URL: ${videoUrl}, Format: ${format}, Language: ${lang}`);

    if (!videoUrl) {
        return res.status(400).json({ error: "Invalid request. Must include 'video_url'." });
    }

    let videoId;
    try {
        const url = new URL(videoUrl);
        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v');
        }
        
        if (!videoId) {
            return res.status(400).json({ error: "Invalid video URL format." });
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid video URL format." });
    }

    try {
        const captions = await getYouTubeTranscript(videoId, lang);

        console.log(`Successfully fetched ${captions.length} captions for video ${videoId}`);

        if (format === 'json') {
            return res.status(200).json({ 
                videoId,
                language: lang,
                captionCount: captions.length,
                captions 
            });
        } else if (format === 'xml') {
            const captionsXml = jsonToXml(captions);
            return res.header('Content-Type', 'application/xml').send(captionsXml);
        } else {
            return res.status(400).json({ error: "Invalid format. Use 'json' or 'xml'." });
        }
    } catch (error) {
        console.error('Error fetching captions:', error);
        return res.status(500).json({ 
            error: error.message,
            videoId: videoId 
        });
    }
});

// Function to get YouTube transcript using Python youtube-transcript-api
function getYouTubeTranscript(videoId, lang = 'en') {
    return new Promise((resolve, reject) => {
        const pythonScript = `
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

try:
    video_id = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
    
    # Create an instance of YouTubeTranscriptApi
    ytt_api = YouTubeTranscriptApi()
    
    # Get the transcript list for the video
    transcript_list = ytt_api.list(video_id)
    
    # Find transcript in the requested language, fallback to any available
    try:
        transcript = transcript_list.find_transcript([lang])
    except:
        # If requested language not found, get the first available transcript
        transcript = next(iter(transcript_list))
    
    # Fetch the actual transcript data
    transcript_data = transcript.fetch()
    
    # Convert FetchedTranscriptSnippet objects to dictionaries
    result = []
    for snippet in transcript_data:
        if hasattr(snippet, 'text') and hasattr(snippet, 'start'):
            # Convert to dictionary format
            item = {
                'text': snippet.text,
                'start': snippet.start,
                'duration': getattr(snippet, 'duration', getattr(snippet, 'dur', 0))
            }
            result.append(item)
        elif isinstance(snippet, dict):
            # Already a dictionary
            result.append(snippet)
        else:
            # Fallback - convert to string
            result.append({'text': str(snippet), 'start': 0, 'duration': 0})
    
    print(json.dumps(result))
    
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;

        const python = spawn('/app/venv/bin/python', ['-c', pythonScript, videoId, lang]);
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to parse transcript data'));
                }
            } else {
                try {
                    const error = JSON.parse(errorOutput);
                    reject(new Error(error.error || 'Failed to fetch transcript'));
                } catch (e) {
                    reject(new Error('Failed to fetch transcript: ' + errorOutput));
                }
            }
        });
    });
}
const jsonToXml = (texts) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<captions>\n';
    texts.forEach((text, index) => {
        xml += `  <caption index="${index}">\n`;
        if (typeof text === 'object') {
            xml += `    <text>${escapeXml(text.text || text.toString())}</text>\n`;
            if (text.start) xml += `    <start>${text.start}</start>\n`;
            if (text.dur) xml += `    <duration>${text.dur}</duration>\n`;
        } else {
            xml += `    <text>${escapeXml(text.toString())}</text>\n`;
        }
        xml += `  </caption>\n`;
    });
    xml += '</captions>';
    return xml;
};

// XML escape function
const escapeXml = (text) => {
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        endpoints: [
            'GET /captions?video_url=URL&format=json|xml&lang=en',
            'GET /health'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`YouTube Captions Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Example: http://localhost:${port}/captions?video_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json`);
});

module.exports = app;
