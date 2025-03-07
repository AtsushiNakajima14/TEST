document.addEventListener('DOMContentLoaded', function() {
    // Optimize particles settings for better performance
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 40, // Reduced particle count
                "density": {
                    "enable": true,
                    "value_area": 1000
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
                    "speed": 0.5, // Reduced animation speed
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1, // Reduced animation speed
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
                "speed": 0.5, // Reduced move speed
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
                    "particles_nb": 2 // Reduced particles generated on click
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": false // Disable retina detection for performance
    });

    // Create notifications container
    const notificationsContainer = document.createElement('div');
    notificationsContainer.className = 'notifications-container';
    document.body.appendChild(notificationsContainer);

    // Optimize scroll animations with throttle
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    // Throttle function to improve scroll performance
    const throttle = (callback, delay) => {
        let lastCall = 0;
        return function(...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return callback(...args);
        };
    };
    
    const checkIfInView = throttle(() => {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            const elementVisible = 150;
            
            if (elementPosition.top < (window.innerHeight - elementVisible)) {
                element.classList.add('aos-animate');
            } else {
                element.classList.remove('aos-animate');
            }
        });
    }, 100); // Throttle to run at most every 100ms
    
    window.addEventListener('scroll', checkIfInView);
    checkIfInView();

    // Optimize section detection for navigation
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', throttle(() => {
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
    }, 100)); // Throttle to run at most every 100ms

    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('result');
    const loadingAnimation = document.querySelector('.loading-animation');
    const downloadResults = document.querySelector('.download-results');
    const downloadOptions = document.getElementById('downloadOptions');
    const errorMessage = document.querySelector('.error-message');
    const errorText = document.getElementById('errorText');

    // Show notification popup
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 
                        type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        
        const text = document.createElement('p');
        text.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-notification';
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        notification.appendChild(icon);
        notification.appendChild(text);
        notification.appendChild(closeBtn);
        
        notificationsContainer.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Auto download function
    function autoDownload(url) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        link.setAttribute('target', '_blank');
        
        // Append link to body
        document.body.appendChild(link);
        
        // Trigger click
        setTimeout(() => {
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            
            // Show success notification
            showNotification('Download started automatically!', 'success');
        }, 1000);
    }

    downloadBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a valid URL');
            showNotification('Please enter a valid URL', 'error');
            return;
        }
        
        resultContainer.classList.remove('hidden');
        loadingAnimation.classList.remove('hidden');
        downloadResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        showNotification('Processing your request...', 'info');
        
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            
            loadingAnimation.classList.add('hidden');
            
            if (data.error || !data.medias || data.medias.length === 0) {
                const errorMsg = data.error || 'No download options available for this URL';
                showError(errorMsg);
                showNotification(errorMsg, 'error');
                return;
            }
            
            downloadResults.classList.remove('hidden');
            downloadOptions.innerHTML = '';
            
            // Start auto download with best quality option
            if (data.medias.length > 0) {
                const bestQuality = data.medias[0]; // Assuming first option is best quality
                autoDownload(bestQuality.url);
            }
            
            // Display all download options
            data.medias.forEach((media, index) => {
                const option = document.createElement('div');
                option.className = 'download-option';
                
                const quality = media.quality || 'Unknown quality';
                const format = media.format || 'Unknown format';
                const size = media.formattedSize || 'Unknown size';
                
                option.innerHTML = `
                    <h4>Option ${index + 1}${index === 0 ? ' (Auto-downloading...)' : ''}</h4>
                    <p><strong>Quality:</strong> ${quality}</p>
                    <p><strong>Format:</strong> ${format}</p>
                    <p><strong>Size:</strong> ${size}</p>
                    <a href="${media.url}" class="download-link" target="_blank" download>Download</a>
                `;
                
                // Add click event to each download option
                option.addEventListener('click', function(e) {
                    // Don't trigger if the actual download link was clicked
                    if (!e.target.classList.contains('download-link')) {
                        const downloadLink = this.querySelector('.download-link');
                        autoDownload(downloadLink.href);
                    }
                });
                
                downloadOptions.appendChild(option);
            });
            
            showNotification(`Found ${data.medias.length} download options!`, 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to process your request. Please try again later.');
            showNotification('Failed to process your request. Please try again later.', 'error');
        }
    });
    
    function showError(message) {
        loadingAnimation.classList.add('hidden');
        downloadResults.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorText.textContent = message;
    }
});
