/**
 * SavitriMart Gallery Page Scripts
 * Handles gallery-specific functionality
 * Version: 2.0.0
 */

(function() {
    'use strict';
    
    // ========== DOM Elements ==========
    const galleryItems = document.querySelectorAll('.gallery-item');
    const images = document.querySelectorAll('.gallery-item img');
    const videos = document.querySelectorAll('.gallery-item video');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    // ========== Category Filter Tabs ==========
    const initFilterTabs = () => {
        const tabs = document.querySelectorAll('.filter-tab');
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                const filter = tab.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    const show = filter === 'all' || category === filter;
                    item.style.display = show ? '' : 'none';
                });
            });
        });
    };

    // ========== Image Loading Enhancement ==========
    const initImageLoading = () => {
        images.forEach(img => {
            // Add loaded class when image is fully loaded
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
            
            // Add error handling for broken images
            img.addEventListener('error', () => {
                console.warn(`Failed to load image: ${img.src}`);
                img.alt = '[Image failed to load] ' + (img.alt || '');
                img.classList.add('error');
            });
        });
    };
    
    // ========== Video Optimization ==========
    const initVideoOptimization = () => {
        videos.forEach(video => {
            // Pause video when not in viewport (performance)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(video);
            
            // Add error handling
            video.addEventListener('error', () => {
                console.warn(`Failed to load video: ${video.querySelector('source')?.src}`);
                const errorMessage = document.createElement('p');
                errorMessage.className = 'video-error';
                errorMessage.textContent = '⚠️ Video failed to load. Please try again later.';
                video.parentElement?.appendChild(errorMessage);
            });
        });
    };
    
    // ========== Gallery Item Keyboard Navigation ==========
    const initGalleryKeyboardNav = () => {
        galleryItems.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'article');
            item.setAttribute('aria-label', `Gallery item ${index + 1} of ${galleryItems.length}`);
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const video = item.querySelector('video');
                    const img = item.querySelector('img');
                    
                    if (video) {
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    } else if (img) {
                        // Optional: Open image in lightbox
                        console.log('Image focused:', img.alt);
                    }
                }
            });
        });
    };
    
    // ========== Lazy Load Videos ==========
    const initVideoLazyLoad = () => {
        // Don't load video until user interacts or scrolls near
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    const source = video.querySelector('source');
                    
                    if (source && !source.getAttribute('data-src')) {
                        // Store original src
                        const originalSrc = source.src;
                        source.setAttribute('data-src', originalSrc);
                        source.src = '';
                        
                        // Load when user clicks play or scrolls near
                        const loadVideo = () => {
                            if (source.getAttribute('data-src')) {
                                source.src = source.getAttribute('data-src');
                                source.removeAttribute('data-src');
                                video.load();
                                video.removeEventListener('click', loadVideo);
                            }
                        };
                        
                        video.addEventListener('click', loadVideo);
                        // Also load after a delay if user doesn't click
                        setTimeout(loadVideo, 3000);
                    }
                    
                    videoObserver.unobserve(video);
                }
            });
        }, { threshold: 0.1, rootMargin: '200px' });
        
        videos.forEach(video => videoObserver.observe(video));
    };
    
    // ========== Return Button Keyboard Shortcut ==========
    const initReturnButtonShortcut = () => {
        const returnBtn = document.querySelector('.return-btn');
        if (!returnBtn) return;
        
        // Add keyboard shortcut: Alt + Left Arrow
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                returnBtn.click();
            }
        });
    };
    
    // ========== Gallery Filter (Future Enhancement) ==========
    // Placeholder for future filter functionality
    
    // ========== Initialize Gallery ==========
    const init = () => {
        initFilterTabs();
        initImageLoading();
        initVideoOptimization();
        initGalleryKeyboardNav();
        initVideoLazyLoad();
        initReturnButtonShortcut();
        
        console.log('[SavitriMart] Gallery page initialized');
    };
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();