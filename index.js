const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const requestTracker = {
  ipRequests: {},
  globalLastRequest: 0,
  GLOBAL_COOLDOWN: 3000, 
  getIpCooldown: function(ip) {
    if (!this.ipRequests[ip]) {
      this.ipRequests[ip] = { count: 0, lastRequest: 0, cooldown: 5000 };
    }
    return this.ipRequests[ip];
  },
  updateIpCooldown: function(ip) {
    const tracker = this.getIpCooldown(ip);
    tracker.count++;
    tracker.lastRequest = Date.now();
 
    if (tracker.count > 5) {
      tracker.cooldown = Math.min(30000, tracker.cooldown * 1.5); 
    }
  },
  canMakeRequest: function(ip) {
    const now = Date.now();
    const tracker = this.getIpCooldown(ip);
    const ipReady = (now - tracker.lastRequest) > tracker.cooldown;
    const globalReady = (now - this.globalLastRequest) > this.GLOBAL_COOLDOWN;
    
    return ipReady && globalReady;
  },
  getRemainingCooldown: function(ip) {
    const now = Date.now();
    const tracker = this.getIpCooldown(ip);
    const ipRemaining = Math.max(0, tracker.cooldown - (now - tracker.lastRequest));
    const globalRemaining = Math.max(0, this.GLOBAL_COOLDOWN - (now - this.globalLastRequest));
    
    return Math.max(ipRemaining, globalRemaining);
  }
};

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public', {
  maxAge: '1h' 
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const fs = require('fs');
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/download', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.ip;
    
    if (!requestTracker.canMakeRequest(clientIp)) {
      const cooldownMs = requestTracker.getRemainingCooldown(clientIp);
      const cooldownSec = Math.ceil(cooldownMs / 1000);
      return res.status(429).json({ 
        error: `Please wait ${cooldownSec} seconds before making another request`,
        cooldownMs: cooldownMs
      });
    }
    
    requestTracker.updateIpCooldown(clientIp);
    requestTracker.globalLastRequest = Date.now();
    
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Detect platform for specialized handling
    let platform = detectPlatform(url);
    
    // Primary API endpoint
    const apiUrl = "https://universaldownloader.com/wp-json/aio-dl/video-data/";
    
    // Backup API URLs in case primary fails
    const backupApiUrls = [
      "https://fastdl.app/api/download",
      "https://savefrom.net/api/convert",
      "https://ytmate.com/api/convert"
    ];
    
    const headers = {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "cookie": "PHPSESSID=iidld6j33b2iscdvl8ed85k6in; pll_language=en; _ga_SNFLGC3754=GS1.1.1741305061.1.0.1741305061.0.0.0; _ga=GA1.2.897696689.1741305062; _gid=GA1.2.741064418.1741305065",
      "Referer": "https://universaldownloader.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const body = `url=${encodeURIComponent(url)}&platform=${platform}`;
    
    try {
      // Try primary API first
      const response = await axios.post(apiUrl, body, { 
        headers,
        timeout: 30000 
      });
      
      // Process and enhance the response if needed
      const enhancedData = enhanceResponse(response.data, platform);
      return res.json(enhancedData);
    } catch (primaryError) {
      console.log(`Primary API error: ${primaryError.message}, trying backup APIs...`);
      
      // If primary API fails, try backup APIs sequentially
      for (const backupUrl of backupApiUrls) {
        try {
          const backupResponse = await axios.post(backupUrl, body, {

// Detect the platform from the URL
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
    return 'facebook';
  } else if (urlLower.includes('instagram.com')) {
    return 'instagram';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  } else if (urlLower.includes('vimeo.com')) {
    return 'vimeo';
  } else if (urlLower.includes('dailymotion.com')) {
    return 'dailymotion';
  } else if (urlLower.includes('pinterest.com')) {
    return 'pinterest';
  } else if (urlLower.includes('reddit.com')) {
    return 'reddit';
  } else if (urlLower.includes('tumblr.com')) {
    return 'tumblr';
  } else if (urlLower.includes('soundcloud.com')) {
    return 'soundcloud';
  } else if (urlLower.includes('linkedin.com')) {
    return 'linkedin';
  } else if (urlLower.includes('vk.com')) {
    return 'vk';
  } else {
    return 'general';
  }
}

// Enhance response with additional metadata based on platform
function enhanceResponse(data, platform) {
  if (!data || !data.medias || data.medias.length === 0) {
    return data;
  }
  
  // Add platform-specific enhancements
  switch (platform) {
    case 'youtube':
      // For YouTube, enhance with video title and thumbnail if not present
      if (!data.title && data.medias[0].thumbnail) {
        data.title = `YouTube Video - ${new Date().toLocaleDateString()}`;
      }
      
      // Add YouTube-specific format labels if missing
      data.medias.forEach(media => {
        if (!media.quality && media.format === 'mp4') {
          // Estimate quality based on size if available
          const sizeMB = parseFloat(media.size || '0');
          if (sizeMB > 50) media.quality = '1080p';
          else if (sizeMB > 25) media.quality = '720p';
          else if (sizeMB > 10) media.quality = '480p';
          else media.quality = '360p';
        }
      });
      break;
      
    case 'instagram':
      // For Instagram, add story/reel/post type if not specified
      if (!data.type) {
        data.type = data.medias.length > 1 ? 'Carousel Post' : 'Post/Reel';
      }
      break;
      
    case 'tiktok':
      // For TikTok, ensure watermark info is present
      data.medias.forEach(media => {
        if (media.format === 'mp4' && !media.hasOwnProperty('watermark')) {
          media.watermark = true; // Default to watermarked
        }
      });
      break;
  }
  
  // Add formatted sizes for all media if not present
  data.medias.forEach(media => {
    if (!media.formattedSize && media.size) {
      const sizeNum = parseFloat(media.size);
      if (sizeNum < 1024) {
        media.formattedSize = `${sizeNum.toFixed(2)} KB`;
      } else {
        media.formattedSize = `${(sizeNum / 1024).toFixed(2)} MB`;
      }
    }
  });
  
  return data;
}

// Try platform specific download methods when main APIs fail
async function tryPlatformSpecificMethod(url, platform) {
  console.log(`Trying platform-specific method for ${platform}...`);
  
  try {
    switch (platform) {
      case 'youtube':
        // Simple fallback for YouTube
        return {
          success: true,
          medias: [
            {
              url: `https://www.y2mate.com/youtube/${url.split('v=')[1] || url.split('/').pop()}`,
              quality: 'Best Available',
              format: 'mp4',
              formattedSize: 'Varies',
              thirdPartyDownload: true
            },
            {
              url: `https://www.y2mate.com/youtube/${url.split('v=')[1] || url.split('/').pop()}/mp3`,
              quality: 'Audio Only',
              format: 'mp3',
              formattedSize: 'Varies',
              thirdPartyDownload: true
            }
          ]
        };
        
      case 'tiktok':
        // Fallback for TikTok
        return {
          success: true,
          medias: [
            {
              url: `https://ssstik.io/download?url=${encodeURIComponent(url)}`,
              quality: 'Original',
              format: 'mp4',
              formattedSize: 'Varies',
              thirdPartyDownload: true
            }
          ]
        };
        
      case 'instagram':
        // Fallback for Instagram
        return {
          success: true,
          medias: [
            {
              url: `https://igram.io/download?url=${encodeURIComponent(url)}`,
              quality: 'Best Available',
              format: 'mp4',
              formattedSize: 'Varies',
              thirdPartyDownload: true
            }
          ]
        };
        
      default:
        // Generic fallback for other platforms - provide links to popular services
        return {
          success: true,
          medias: [
            {
              url: `https://savefrom.net/${encodeURIComponent(url)}`,
              quality: 'Various Options',
              format: 'Various',
              formattedSize: 'Varies',
              thirdPartyDownload: true
            }
          ]
        };
    }
  } catch (error) {
    console.error(`Platform-specific method failed: ${error.message}`);
    return null;
  }
}

            headers,
            timeout: 20000
          });
          
          // If backup succeeded, process and return the data
          const enhancedData = enhanceResponse(backupResponse.data, platform);
          return res.json(enhancedData);
        } catch (backupError) {
          console.log(`Backup API ${backupUrl} error: ${backupError.message}`);
          // Continue to next backup
        }
      }
      
      // If all APIs failed, try platform-specific handling
      const platformSpecificData = await tryPlatformSpecificMethod(url, platform);
      if (platformSpecificData) {
        return res.json(platformSpecificData);
      }
      
      // All methods failed, throw the original error
      throw primaryError;
    }
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out. The server might be experiencing high traffic.' });
    } else if (error.response) {
   
      return res.status(error.response.status).json({ 
        error: 'Failed to download video', 
        details: `Service responded with status code: ${error.response.status}` 
      });
    } else if (error.request) {
    
      return res.status(503).json({ error: 'No response from download service. Please try again later.' });
    } else {
    
      return res.status(500).json({ error: 'Failed to download video', details: error.message });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});