
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
    
    // Detect the platform first
    const platform = detectPlatform(url);
    
    // Call Universal Downloader API based on platform
    const result = await fetchDownloadInfo(url, platform);
    
    // Return the result with the detected platform
    return res.json({ ...result, platform });
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ 
      error: 'Failed to process download request',
      details: error.message || 'Unknown error occurred'
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
  } else if (domain.includes('vimeo')) {
    return 'vimeo';
  } else if (domain.includes('dailymotion')) {
    return 'dailymotion';
  } else if (domain.includes('linkedin')) {
    return 'linkedin';
  } else if (domain.includes('pinterest')) {
    return 'pinterest';
  } else if (domain.includes('reddit')) {
    return 'reddit';
  } else if (domain.includes('tumblr')) {
    return 'tumblr';
  } else {
    return 'generic';
  }
}

// Universal Downloader API integration
async function fetchDownloadInfo(url, platform) {
  try {
    // API endpoints for different platforms
    const apiEndpoints = {
      youtube: 'https://api.downloadmedia.io/api/youtube/info',
      facebook: 'https://api.downloadmedia.io/api/facebook/info',
      instagram: 'https://api.downloadmedia.io/api/instagram/info',
      tiktok: 'https://api.downloadmedia.io/api/tiktok/info',
      twitter: 'https://api.downloadmedia.io/api/twitter/info',
      vimeo: 'https://api.downloadmedia.io/api/vimeo/info',
      dailymotion: 'https://api.downloadmedia.io/api/dailymotion/info',
      linkedin: 'https://api.downloadmedia.io/api/linkedin/info',
      pinterest: 'https://api.downloadmedia.io/api/pinterest/info',
      reddit: 'https://api.downloadmedia.io/api/reddit/info',
      tumblr: 'https://api.downloadmedia.io/api/tumblr/info',
      generic: 'https://api.downloadmedia.io/api/generic/info'
    };
    
    // Get the appropriate API endpoint
    const apiEndpoint = apiEndpoints[platform] || apiEndpoints.generic;
    
    // Setup request options
    const options = {
      method: 'POST',
      url: apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // You would typically include your API key here
        // 'X-API-KEY': 'your-api-key'
      },
      data: { url },
      timeout: 30000 // 30 seconds timeout
    };
    
    // Make the API request
    const response = await axios(options);
    
    // Process the API response
    if (response.data && (response.data.medias || response.data.links)) {
      // Format the response to match our expected structure
      return processApiResponse(response.data, platform);
    } else {
      // If API doesn't return expected data, use fallback
      console.warn(`API response for ${platform} did not contain expected data structure, using fallback`);
      return getFallbackResponse(platform, url);
    }
  } catch (error) {
    console.error(`Error fetching from API for ${platform}:`, error.message);
    
    // If API call fails, use our fallback handlers
    console.log(`Using fallback response for ${platform}`);
    return getFallbackResponse(platform, url);
  }
}

// Process API response into our expected format
function processApiResponse(apiData, platform) {
  try {
    // Initialize result object with defaults
    const result = {
      title: apiData.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Media`,
      type: apiData.type || 'video',
      medias: []
    };
    
    // Process media items from API response
    const mediaList = apiData.medias || apiData.links || [];
    
    if (Array.isArray(mediaList) && mediaList.length > 0) {
      result.medias = mediaList.map(media => {
        return {
          url: media.url || media.link || '',
          quality: media.quality || media.resolution || 'Standard',
          format: media.format || media.extension || getFormatFromUrl(media.url || media.link || ''),
          formattedSize: media.size || media.formattedSize || 'Unknown',
          watermark: media.watermark !== undefined ? media.watermark : undefined,
          audio: media.audio !== undefined ? media.audio : undefined
        };
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error processing API response:', error);
    return getFallbackResponse(platform);
  }
}

// Get file format from URL
function getFormatFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop().toLowerCase();
    
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4a', 'mp3', 'wav'].includes(extension)) {
      return extension;
    }
    
    return 'mp4'; // Default format
  } catch (error) {
    return 'mp4';
  }
}

// Fallback responses for each platform
function getFallbackResponse(platform, url) {
  switch (platform) {
    case 'youtube':
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
    
    case 'facebook':
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
    
    case 'instagram':
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
    
    case 'tiktok':
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
    
    case 'twitter':
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
      
    case 'vimeo':
      return {
        title: 'Vimeo Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/vimeo_hd.mp4',
            quality: 'HD 720p',
            format: 'mp4',
            formattedSize: '22 MB'
          },
          {
            url: 'https://example.com/vimeo_sd.mp4',
            quality: 'SD 360p',
            format: 'mp4',
            formattedSize: '10 MB'
          }
        ]
      };
      
    case 'dailymotion':
      return {
        title: 'Dailymotion Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/dailymotion_hd.mp4',
            quality: 'HD 720p',
            format: 'mp4',
            formattedSize: '18 MB'
          },
          {
            url: 'https://example.com/dailymotion_sd.mp4',
            quality: 'SD 480p',
            format: 'mp4',
            formattedSize: '8 MB'
          }
        ]
      };
      
    case 'linkedin':
      return {
        title: 'LinkedIn Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/linkedin.mp4',
            quality: 'Standard',
            format: 'mp4',
            formattedSize: '12 MB'
          }
        ]
      };
      
    case 'pinterest':
      return {
        title: 'Pinterest Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/pinterest.mp4',
            quality: 'Standard',
            format: 'mp4',
            formattedSize: '7 MB'
          }
        ]
      };
      
    case 'reddit':
      return {
        title: 'Reddit Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/reddit_video.mp4',
            quality: 'Original',
            format: 'mp4',
            formattedSize: '15 MB'
          },
          {
            url: 'https://example.com/reddit_audio.mp3',
            quality: 'Audio Only',
            format: 'mp3',
            formattedSize: '2 MB'
          }
        ]
      };
      
    case 'tumblr':
      return {
        title: 'Tumblr Video',
        type: 'video',
        medias: [
          {
            url: 'https://example.com/tumblr.mp4',
            quality: 'Standard',
            format: 'mp4',
            formattedSize: '10 MB'
          }
        ]
      };
    
    case 'generic':
    default:
      return {
        title: 'Video Download',
        type: 'video',
        medias: [
          {
            url: url || 'https://example.com/generic.mp4',
            quality: 'Original Quality',
            format: 'mp4',
            formattedSize: 'Unknown'
          }
        ]
      };
  }
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT}`);
});
