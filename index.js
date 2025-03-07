
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for video downloads
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Process different platforms
    const platform = detectPlatform(url);
    
    // Handle download based on platform
    let result;
    switch (platform) {
      case 'youtube':
        result = await handleYouTube(url);
        break;
      case 'facebook':
        result = await handleFacebook(url);
        break;
      case 'instagram':
        result = await handleInstagram(url);
        break;
      case 'tiktok':
        result = await handleTikTok(url);
        break;
      case 'twitter':
        result = await handleTwitter(url);
        break;
      default:
        result = await handleGeneric(url);
    }
    
    return res.json({ ...result, platform });
    
  } catch (error) {
    console.error('Download error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process download request',
      details: error.message
    });
  }
});

// Platform detection
function detectPlatform(url) {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (domain.includes('youtube') || domain.includes('youtu.be')) {
    return 'youtube';
  } else if (domain.includes('facebook') || domain.includes('fb.watch')) {
    return 'facebook';
  } else if (domain.includes('instagram')) {
    return 'instagram';
  } else if (domain.includes('tiktok')) {
    return 'tiktok';
  } else if (domain.includes('twitter') || domain.includes('x.com')) {
    return 'twitter';
  } else {
    return 'generic';
  }
}

// Platform handlers
async function handleYouTube(url) {
  // Mock response for demo
  return {
    title: 'YouTube Video',
    type: 'video',
    medias: [
      {
        url: 'https://example.com/youtube_hd.mp4',
        quality: 'HD 1080p',
        format: 'mp4',
        formattedSize: '25 MB'
      },
      {
        url: 'https://example.com/youtube_sd.mp4',
        quality: 'SD 480p',
        format: 'mp4',
        formattedSize: '12 MB'
      },
      {
        url: 'https://example.com/youtube_audio.mp3',
        quality: 'Audio only',
        format: 'mp3',
        formattedSize: '5 MB'
      }
    ]
  };
}

async function handleFacebook(url) {
  return {
    title: 'Facebook Video',
    type: 'video',
    medias: [
      {
        url: 'https://example.com/facebook_hd.mp4',
        quality: 'HD',
        format: 'mp4',
        formattedSize: '20 MB'
      },
      {
        url: 'https://example.com/facebook_sd.mp4',
        quality: 'SD',
        format: 'mp4',
        formattedSize: '10 MB'
      }
    ]
  };
}

async function handleInstagram(url) {
  return {
    title: 'Instagram Post',
    type: 'video',
    medias: [
      {
        url: 'https://example.com/instagram.mp4',
        quality: 'Standard',
        format: 'mp4',
        formattedSize: '15 MB'
      }
    ]
  };
}

async function handleTikTok(url) {
  return {
    title: 'TikTok Video',
    type: 'video',
    medias: [
      {
        url: 'https://example.com/tiktok_nowm.mp4',
        quality: 'HD',
        format: 'mp4',
        formattedSize: '8 MB',
        watermark: false
      },
      {
        url: 'https://example.com/tiktok_wm.mp4',
        quality: 'HD',
        format: 'mp4',
        formattedSize: '8 MB',
        watermark: true
      }
    ]
  };
}

async function handleTwitter(url) {
  return {
    title: 'Twitter Video',
    type: 'video',
    medias: [
      {
        url: 'https://example.com/twitter_hd.mp4',
        quality: 'HD',
        format: 'mp4',
        formattedSize: '18 MB'
      },
      {
        url: 'https://example.com/twitter_sd.mp4',
        quality: 'SD',
        format: 'mp4',
        formattedSize: '9 MB'
      }
    ]
  };
}

async function handleGeneric(url) {
  return {
    title: 'Video Download',
    type: 'video',
    medias: [
      {
        url: url,
        quality: 'Original Quality',
        format: 'mp4',
        formattedSize: 'Unknown'
      }
    ]
  };
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT}`);
});
