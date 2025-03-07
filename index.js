const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting and cooldown tracking
const requestTracker = {
  ipRequests: {},
  globalLastRequest: 0,
  GLOBAL_COOLDOWN: 3000, // 3 seconds cooldown between any requests
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
    
    // Increase cooldown for frequent users (exponential backoff)
    if (tracker.count > 5) {
      tracker.cooldown = Math.min(30000, tracker.cooldown * 1.5); // Max 30 seconds
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
    // Get client IP (using x-forwarded-for if behind proxy, falling back to req.ip)
    const clientIp = req.headers['x-forwarded-for'] || req.ip;
    
    // Check if request is allowed or in cooldown
    if (!requestTracker.canMakeRequest(clientIp)) {
      const cooldownMs = requestTracker.getRemainingCooldown(clientIp);
      const cooldownSec = Math.ceil(cooldownMs / 1000);
      return res.status(429).json({ 
        error: `Please wait ${cooldownSec} seconds before making another request`,
        cooldownMs: cooldownMs
      });
    }
    
    // Update request tracking
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

    const apiUrl = "https://universaldownloader.com/wp-json/aio-dl/video-data/";
    const headers = {
      "accept": "/",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "PHPSESSID=iidld6j33b2iscdvl8ed85k6in; pll_language=en; _ga_SNFLGC3754=GS1.1.1741305061.1.0.1741305061.0.0.0; _ga=GA1.2.897696689.1741305062; _gid=GA1.2.741064418.1741305065; _gat_gtag_UA_250577925_1=1",
      "Referer": "https://universaldownloader.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const body = `url=${encodeURIComponent(url)}`;
    
    const response = await axios.post(apiUrl, body, { 
      headers,
      timeout: 30000 // Increased timeout to 30 seconds
    });

    return res.json(response.data);
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