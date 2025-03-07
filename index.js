const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced middleware setup
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public', {
  maxAge: '1h' // Add cache control for static assets
}));

// Add compression for better performance
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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
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
    
    // Set timeout and add error handling
    const response = await axios.post(apiUrl, body, { 
      headers,
      timeout: 15000 // 15 second timeout
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    
    // Provide more specific error messages based on the error
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out. The server might be experiencing high traffic.' });
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({ 
        error: 'Failed to download video', 
        details: `Service responded with status code: ${error.response.status}` 
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ error: 'No response from download service. Please try again later.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ error: 'Failed to download video', details: error.message });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});