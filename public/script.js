document.addEventListener('DOMContentLoaded', function() {

    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 40, 
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
                    "speed": 0.5, 
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1, 
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
                "speed": 0.5, 
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
                    "particles_nb": 2 
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": false 
    });

    const notificationsContainer = document.createElement('div');
    notificationsContainer.className = 'notifications-container';
    document.body.appendChild(notificationsContainer);

    const animatedElements = document.querySelectorAll('[data-aos]');

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
    }, 100); 

    window.addEventListener('scroll', checkIfInView);
    checkIfInView();

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
    }, 100)); 

    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('result');
    const loadingAnimation = document.querySelector('.loading-animation');
    const downloadResults = document.querySelector('.download-results');
    const downloadOptions = document.getElementById('downloadOptions');
    const errorMessage = document.querySelector('.error-message');
    const errorText = document.getElementById('errorText');

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

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    function autoDownload(url) {
        showNotification('Starting download...', 'info');

        fetch(url)
            .then(response => {
                let filename = 'video';
                const disposition = response.headers.get('content-disposition');
                if (disposition && disposition.includes('filename=')) {
                    const filenameMatch = disposition.match(/filename=["']?([^"']+)["']?/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1];
                    }
                } else {

                    const urlParts = url.split('/');
                    if (urlParts.length > 0) {
                        const possibleFilename = urlParts[urlParts.length - 1].split('?')[0];
                        if (possibleFilename && possibleFilename.includes('.')) {
                            filename = possibleFilename;
                        } else {
                            filename = 'video_download.' + (url.includes('.mp4') ? 'mp4' : 'mp3');
                        }
                    }
                }

                return response.blob().then(blob => {

                    const blobUrl = URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;

                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(blobUrl); 
                    }, 100);

                    showNotification('Download started!', 'success');
                });
            })
            .catch(error => {
                console.error('Download error:', error);
                showNotification('Download failed. Trying alternate method...', 'error');

                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;

                document.body.appendChild(iframe);

                setTimeout(() => {
                    document.body.removeChild(iframe);
                    showNotification('Alternate download method initiated', 'info');
                }, 2000);
            });
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

            document.body.classList.add('results-active');

            if (data.title || data.platform) {
                const infoHeader = document.createElement('div');
                infoHeader.className = 'download-info-header';

                if (data.title) {
                    const titleElement = document.createElement('h3');
                    titleElement.textContent = data.title;
                    infoHeader.appendChild(titleElement);
                }

                if (data.platform) {
                    const platformElement = document.createElement('span');
                    platformElement.className = 'platform-badge';
                    platformElement.textContent = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
                    infoHeader.appendChild(platformElement);
                }

                if (data.type) {
                    const typeElement = document.createElement('span');
                    typeElement.className = 'type-badge';
                    typeElement.textContent = data.type;
                    infoHeader.appendChild(typeElement);
                }

                downloadResults.insertBefore(infoHeader, downloadOptions);
            }

            const sortedMedia = [...data.medias].sort((a, b) => {
             
                const qualityA = a.quality || '';
                const qualityB = b.quality || '';

                if (qualityA.includes('HD') && !qualityB.includes('HD')) return -1;
                if (!qualityA.includes('HD') && qualityB.includes('HD')) return 1;

                const numA = parseInt(qualityA.match(/\d+/)?.[0] || '0');
                const numB = parseInt(qualityB.match(/\d+/)?.[0] || '0');

                if (numA !== numB) return numB - numA; 
                if (a.format === 'mp4' && b.format !== 'mp4') return -1;
                if (a.format !== 'mp4' && b.format === 'mp4') return 1;

                return 0;
            });

            sortedMedia.forEach((media, index) => {
                const option = document.createElement('div');
                option.className = 'download-option';
                option.style.setProperty('--i', index); 

                const quality = media.quality || 'Standard quality';
                const format = media.format || 'Unknown format';
                const size = media.formattedSize || 'Unknown size';

                let optionContent = `
                    <h4>Option ${index + 1}</h4>
                    <p><strong>Quality:</strong> ${quality}</p>
                    <p><strong>Format:</strong> ${format}</p>
                    <p><strong>Size:</strong> ${size}</p>
                `;

                if (media.watermark === false) {
                    optionContent += `<p class="special-feature"><i class="fas fa-check-circle"></i> No Watermark</p>`;
                }

                if (media.audio === false) {
                    optionContent += `<p class="special-feature"><i class="fas fa-volume-mute"></i> No Audio</p>`;
                }

                if (media.thirdPartyDownload) {
                    optionContent += `<p class="redirect-notice"><i class="fas fa-external-link-alt"></i> Redirects to download service</p>`;
                }

                option.innerHTML = optionContent;

                option.addEventListener('click', function() {
                    if (media.thirdPartyDownload) {
                       
                        window.open(media.url, '_blank');
                        showNotification(`Redirecting to download service...`, 'info');
                    } else {
                      
                        autoDownload(media.url);
                        showNotification(`Downloading ${quality} ${format} file...`, 'success');
                    }
                });

                downloadOptions.appendChild(option);
            });

            if (sortedMedia.length > 1) {
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';

                const copyAllBtn = document.createElement('button');
                copyAllBtn.innerHTML = '<i class="fas fa-copy"></i> Copy All URLs';
                copyAllBtn.className = 'copy-all-btn';
                copyAllBtn.addEventListener('click', function() {
                    const allUrls = sortedMedia.map(m => m.url).join('\n');
                    navigator.clipboard.writeText(allUrls).then(() => {
                        showNotification('All download URLs copied to clipboard!', 'success');
                    });
                });

                actionButtons.appendChild(copyAllBtn);
                downloadResults.appendChild(actionButtons);
            }

            showNotification(`Found ${data.medias.length} download options!`, 'success');

        } catch (error) {
            console.error('Error:', error);
            let errorMsg = 'Failed to process your request. Please try again later.';

            if (error.response && error.response.status === 429) {
                const data = error.response.data;
                errorMsg = data.error || 'Rate limit exceeded. Please wait before trying again.';

                if (data.cooldownMs) {
                    const cooldownSec = Math.ceil(data.cooldownMs / 1000);
                    let remainingTime = cooldownSec;

                    errorMsg = `Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`;
                    showError(errorMsg);
                    showNotification(errorMsg, 'error');

                    const countdownInterval = setInterval(() => {
                        remainingTime--;
                        if (remainingTime <= 0) {
                            clearInterval(countdownInterval);
                            showError('You can try again now.');
                            showNotification('Cooldown period ended. You can try again now.', 'info');
                        } else {
                            errorMsg = `Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`;
                            errorText.textContent = errorMsg;
                        }
                    }, 1000);

                    return;
                }
            } else if (error.message && error.message.includes('timeout')) {
                errorMsg = 'Request timed out. The service might be busy. Please try again later.';
            }

            showError(errorMsg);
            showNotification(errorMsg, 'error');
        }
    });

    function showError(message) {
        loadingAnimation.classList.add('hidden');
        downloadResults.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorText.textContent = message;
    }
});