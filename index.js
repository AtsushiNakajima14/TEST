
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create public directory for static files
const fs = require('fs');
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to download video
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
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
    const response = await axios.post(apiUrl, body, { headers });
    
    return res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to download video', details: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Create HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate Video Downloader</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="particles-container" id="particles-js"></div>
    
    <header>
        <nav>
            <div class="logo">
                <i class="fas fa-download"></i>
                <h1>Ultimate Video Downloader</h1>
            </div>
            <ul>
                <li><a href="#home" class="active">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-to">How to Use</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="container">
                <h1 class="title">Download Videos from Any Platform</h1>
                <p class="subtitle">Facebook, Instagram, Twitter, TikTok, YouTube, and many more!</p>
                
                <div class="download-form">
                    <input type="text" id="videoUrl" placeholder="Paste your video URL here..." required>
                    <button id="downloadBtn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
                
                <div id="result" class="result-container hidden">
                    <div class="loading-animation hidden">
                        <div class="loader"></div>
                        <p>Processing your request...</p>
                    </div>
                    <div class="download-results hidden">
                        <h3>Download Options</h3>
                        <div id="downloadOptions" class="options-container"></div>
                    </div>
                    <div class="error-message hidden">
                        <i class="fas fa-exclamation-circle"></i>
                        <p id="errorText"></p>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" class="features">
            <div class="container">
                <h2 class="section-title">Features</h2>
                <div class="features-grid">
                    <div class="feature-card" data-aos="fade-up">
                        <i class="fas fa-globe"></i>
                        <h3>Multiple Platforms</h3>
                        <p>Download videos from Facebook, Instagram, Twitter, TikTok, YouTube, and more!</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                        <i class="fas fa-bolt"></i>
                        <h3>Fast Processing</h3>
                        <p>Get your videos in seconds with our high-speed processing technology.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                        <i class="fas fa-video"></i>
                        <h3>HD Quality</h3>
                        <p>Download videos in the highest quality available from the source.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                        <i class="fas fa-lock"></i>
                        <h3>Secure</h3>
                        <p>We don't store your videos or personal information. Your privacy is our priority.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                        <i class="fas fa-mobile-alt"></i>
                        <h3>Mobile Friendly</h3>
                        <p>Our website works perfectly on all devices, including smartphones and tablets.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                        <i class="fas fa-infinity"></i>
                        <h3>Unlimited Downloads</h3>
                        <p>Download as many videos as you want without any limitations.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="how-to" class="how-to">
            <div class="container">
                <h2 class="section-title">How to Use</h2>
                <div class="steps">
                    <div class="step" data-aos="fade-right">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Copy the URL</h3>
                            <p>Find the video you want to download and copy its URL from the address bar or share button.</p>
                        </div>
                    </div>
                    <div class="step" data-aos="fade-right" data-aos-delay="100">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Paste the URL</h3>
                            <p>Paste the URL in the input field on our website.</p>
                        </div>
                    </div>
                    <div class="step" data-aos="fade-right" data-aos-delay="200">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Download</h3>
                            <p>Click the download button and select your preferred quality option.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2 class="section-title">About Us</h2>
                <p class="about-text">
                    Ultimate Video Downloader is a free online service that allows you to download videos from various social media platforms.
                    Our mission is to provide a simple, fast, and secure way to save your favorite videos for offline viewing.
                </p>
                <p class="about-text">
                    We are constantly improving our service to ensure the best experience for our users.
                    If you have any questions or suggestions, feel free to contact us.
                </p>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <i class="fas fa-download"></i>
                    <h2>Ultimate Video Downloader</h2>
                </div>
                <p>© 2023 Ultimate Video Downloader. All rights reserved.</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
    <script src="script.js"></script>
</body>
</html>`;

// Create CSS file
const cssContent = `/* Base Styles */
:root {
    --primary-color: #4c6ef5;
    --secondary-color: #38b2ac;
    --accent-color: #f06595;
    --background-dark: #1a202c;
    --background-light: #f8f9fa;
    --text-dark: #2d3748;
    --text-light: #f8f9fa;
    --success-color: #48bb78;
    --error-color: #f56565;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, var(--background-dark), #2d3748);
    color: var(--text-light);
    line-height: 1.6;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Particles Background */
.particles-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

/* Header & Navigation */
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: rgba(26, 32, 44, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: var(--box-shadow);
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    display: flex;
    align-items: center;
    color: var(--primary-color);
}

.logo i {
    font-size: 24px;
    margin-right: 10px;
}

.logo h1 {
    font-size: 1.5rem;
    font-weight: 600;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 30px;
}

nav ul li a {
    color: var(--text-light);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
}

nav ul li a:hover, nav ul li a.active {
    color: var(--primary-color);
}

nav ul li a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary-color);
    transition: var(--transition);
}

nav ul li a:hover::after, nav ul li a.active::after {
    width: 100%;
}

/* Hero Section */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 80px;
    position: relative;
    overflow: hidden;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(76, 110, 245, 0.1) 0%, rgba(26, 32, 44, 0) 70%);
}

.title {
    font-size: 3rem;
    margin-bottom: 20px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.subtitle {
    font-size: 1.2rem;
    color: #a0aec0;
    margin-bottom: 40px;
}

/* Download Form */
.download-form {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 30px;
    box-shadow: var(--box-shadow);
    border-radius: 50px;
    overflow: hidden;
    transition: transform 0.3s ease;
    background: rgba(45, 55, 72, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.download-form:hover {
    transform: translateY(-5px);
}

.download-form input {
    flex: 1;
    padding: 15px 25px;
    border: none;
    outline: none;
    font-size: 1rem;
    color: var(--text-light);
    background: transparent;
}

.download-form input::placeholder {
    color: #a0aec0;
}

.download-form button {
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    padding: 15px 30px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: center;
}

.download-form button:hover {
    opacity: 0.9;
}

.download-form button i {
    margin-right: 8px;
}

/* Result Container */
.result-container {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(45, 55, 72, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 20px;
    box-shadow: var(--box-shadow);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.hidden {
    display: none;
}

/* Loading Animation */
.loading-animation {
    text-align: center;
    padding: 20px 0;
}

.loader {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Download Options */
.download-results h3 {
    margin-bottom: 15px;
    text-align: center;
}

.options-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.download-option {
    background: rgba(45, 55, 72, 0.8);
    border-radius: 8px;
    padding: 15px;
    transition: transform 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.download-option:hover {
    transform: translateY(-3px);
    background: rgba(76, 110, 245, 0.2);
}

.download-option h4 {
    margin-bottom: 10px;
    color: var(--primary-color);
}

.download-option p {
    margin-bottom: 10px;
    font-size: 0.9rem;
}

.download-option .download-link {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    padding: 8px 15px;
    border-radius: 5px;
    font-weight: 500;
    margin-top: 10px;
    transition: background 0.3s ease;
}

.download-option .download-link:hover {
    background: #3a56c5;
}

/* Error Message */
.error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--error-color);
    padding: 20px;
}

.error-message i {
    font-size: 24px;
    margin-right: 10px;
}

/* Features Section */
.features {
    padding: 100px 0;
    background: rgba(26, 32, 44, 0.7);
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    position: relative;
    color: var(--text-light);
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 3px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.feature-card {
    background: rgba(45, 55, 72, 0.5);
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: var(--box-shadow);
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.feature-card:hover::before {
    transform: scaleX(1);
}

.feature-card i {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 20px;
}

.feature-card h3 {
    margin-bottom: 15px;
    font-size: 1.3rem;
}

.feature-card p {
    color: #a0aec0;
}

/* How to Use Section */
.how-to {
    padding: 100px 0;
    background: rgba(26, 32, 44, 0.5);
}

.steps {
    max-width: 800px;
    margin: 0 auto;
}

.step {
    display: flex;
    margin-bottom: 50px;
    position: relative;
}

.step:last-child {
    margin-bottom: 0;
}

.step::after {
    content: '';
    position: absolute;
    top: 70px;
    left: 30px;
    width: 1px;
    height: calc(100% - 50px);
    background: linear-gradient(to bottom, var(--primary-color), transparent);
    z-index: 0;
}

.step:last-child::after {
    display: none;
}

.step-number {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-right: 30px;
    flex-shrink: 0;
    box-shadow: 0 0 15px rgba(76, 110, 245, 0.5);
    position: relative;
    z-index: 1;
}

.step-content {
    background: rgba(45, 55, 72, 0.5);
    padding: 30px;
    border-radius: 10px;
    flex: 1;
    box-shadow: var(--box-shadow);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: transform 0.3s ease;
}

.step:hover .step-content {
    transform: translateX(10px);
}

.step-content h3 {
    margin-bottom: 10px;
    color: var(--primary-color);
}

/* About Section */
.about {
    padding: 100px 0;
    background: rgba(26, 32, 44, 0.7);
    text-align: center;
}

.about-text {
    max-width: 800px;
    margin: 0 auto 20px;
    line-height: 1.8;
    color: #a0aec0;
}

/* Footer */
footer {
    background: rgba(17, 24, 39, 0.95);
    padding: 50px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.footer-logo {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: var(--primary-color);
}

.footer-logo i {
    font-size: 24px;
    margin-right: 10px;
}

.footer-logo h2 {
    font-size: 1.5rem;
}

.social-links {
    display: flex;
    margin-top: 20px;
}

.social-links a {
    color: var(--text-light);
    margin: 0 15px;
    font-size: 20px;
    transition: color 0.3s ease;
}

.social-links a:hover {
    color: var(--primary-color);
}

/* Responsive Design */
@media (max-width: 992px) {
    .title {
        font-size: 2.5rem;
    }
    
    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
        padding: 15px;
    }
    
    .logo {
        margin-bottom: 15px;
    }
    
    nav ul {
        width: 100%;
        justify-content: space-between;
    }
    
    nav ul li {
        margin-left: 0;
    }
    
    .title {
        font-size: 2rem;
    }
    
    .download-form {
        flex-direction: column;
        border-radius: 10px;
    }
    
    .download-form input {
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .download-form button {
        width: 100%;
    }
    
    .step {
        flex-direction: column;
    }
    
    .step-number {
        margin-right: 0;
        margin-bottom: 20px;
    }
    
    .step::after {
        left: 30px;
        top: 70px;
    }
}

@media (max-width: 576px) {
    .title {
        font-size: 1.8rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    nav ul {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    nav ul li {
        margin: 5px 10px;
    }
}

/* Animation for Features */
[data-aos] {
    opacity: 0;
    transition-property: opacity, transform;
    transition-duration: 0.8s;
}

[data-aos="fade-up"] {
    transform: translateY(50px);
}

[data-aos="fade-right"] {
    transform: translateX(-50px);
}

.aos-animate {
    opacity: 1;
    transform: translateY(0) translateX(0);
}`;

// Create JS file
const jsContent = `// Initialize particles.js
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#4c6ef5"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#4c6ef5",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Animate on scroll
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const checkIfInView = () => {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            const elementVisible = 150;
            
            if (elementPosition.top < (window.innerHeight - elementVisible)) {
                element.classList.add('aos-animate');
            } else {
                element.classList.remove('aos-animate');
            }
        });
    };
    
    window.addEventListener('scroll', checkIfInView);
    checkIfInView();

    // Navigation active state
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Video Download Functionality
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('result');
    const loadingAnimation = document.querySelector('.loading-animation');
    const downloadResults = document.querySelector('.download-results');
    const downloadOptions = document.getElementById('downloadOptions');
    const errorMessage = document.querySelector('.error-message');
    const errorText = document.getElementById('errorText');

    downloadBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }
        
        // Show loading animation
        resultContainer.classList.remove('hidden');
        loadingAnimation.classList.remove('hidden');
        downloadResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            
            // Hide loading animation
            loadingAnimation.classList.add('hidden');
            
            if (data.error || !data.medias || data.medias.length === 0) {
                showError(data.error || 'No download options available for this URL');
                return;
            }
            
            // Show download options
            downloadResults.classList.remove('hidden');
            downloadOptions.innerHTML = '';
            
            data.medias.forEach((media, index) => {
                const option = document.createElement('div');
                option.className = 'download-option';
                
                const quality = media.quality || 'Unknown quality';
                const format = media.format || 'Unknown format';
                const size = media.formattedSize || 'Unknown size';
                
                option.innerHTML = `
                    <h4>Option ${index + 1}</h4>
                    <p><strong>Quality:</strong> ${quality}</p>
                    <p><strong>Format:</strong> ${format}</p>
                    <p><strong>Size:</strong> ${size}</p>
                    <a href="${media.url}" class="download-link" target="_blank" download>Download</a>
                `;
                
                downloadOptions.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to process your request. Please try again later.');
        }
    });
    
    function showError(message) {
        loadingAnimation.classList.add('hidden');
        downloadResults.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorText.textContent = message;
    }
});`;

fs.writeFileSync('public/index.html', htmlContent);
fs.writeFileSync('public/styles.css', cssContent);
fs.writeFileSync('public/script.js', jsContent);
