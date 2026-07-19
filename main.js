/**
 * SavitriMart Main JavaScript
 * Core functionality for the website
 * Version: 2.0.0
 */

(function() {
    'use strict';
    
    // ========== DOM Elements Cache ==========
    const dom = {
        menuToggle: document.querySelector('.menu-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        scrollBtn: document.getElementById('scrollToTop'),
        yearSpan: document.getElementById('currentYear'),
        statusBadge: document.getElementById('shopStatus'),
        statusText: document.getElementById('statusText'),
        openTimeEl: document.getElementById('openTime'),
        closeTimeEl: document.getElementById('closeTime'),
        workingDaysEl: document.getElementById('workingDays')
    };
    
    // ========== Configuration ==========
    const CONFIG = {
        shop: {
            openHour: 9,
            openMinute: 0,
            closeHour: 21,
            closeMinute: 0,
            openTime: '8:00 AM',
            closeTime: '8:00 PM',
            workingDays: 'સોમવાર - રવિવાર (બધા દિવસ)'
        },
        scrollThreshold: 300,
        statusUpdateInterval: 60000,
        headerSelector: '.header'
    };
    
    // ========== Helper Functions ==========
    const logError = (message, error = null) => {
        if (error) {
            console.error(`[SavitriMart Error] ${message}`, error);
        } else {
            console.warn(`[SavitriMart] ${message}`);
        }
    };
    
    const setAttributes = (el, attrs) => {
        if (!el) return;
        Object.entries(attrs).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                el.setAttribute(key, value);
            }
        });
    };
    
    // ========== 1) Mobile Menu with Focus Trap ==========
    const initMobileMenu = () => {
        if (!dom.menuToggle || !dom.navMenu) {
            logError('Mobile menu elements not found');
            return;
        }
        
        let focusableElements = [];
        
        const updateFocusableElements = () => {
            focusableElements = Array.from(
                dom.navMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')
            );
        };
        
        const trapFocus = (e) => {
            if (!dom.navMenu.classList.contains('active')) return;
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable?.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable?.focus();
                    }
                }
            }
        };
        
        const toggleMenu = (isOpen) => {
            dom.menuToggle.classList.toggle('active', isOpen);
            dom.navMenu.classList.toggle('active', isOpen);
            setAttributes(dom.menuToggle, { 'aria-expanded': isOpen.toString() });
            
            if (isOpen) {
                updateFocusableElements();
                if (focusableElements.length) {
                    focusableElements[0].focus();
                }
                document.addEventListener('keydown', trapFocus);
            } else {
                document.removeEventListener('keydown', trapFocus);
            }
        };
        
        dom.menuToggle.addEventListener('click', () => {
            const isActive = dom.navMenu.classList.contains('active');
            toggleMenu(!isActive);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dom.navMenu.classList.contains('active')) {
                toggleMenu(false);
                dom.menuToggle.focus();
            }
        });
        
        dom.navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    };
    
    // ========== 2) Product Accordion ==========
    const initProductAccordion = () => {
        const cardToggles = document.querySelectorAll('.card-toggle');
        
        if (!cardToggles.length) return;
        
        cardToggles.forEach(toggle => {
            const card = toggle.closest('.card');
            if (!card) return;
            
            const toggleCard = (isOpen) => {
                card.classList.toggle('active', isOpen);
                setAttributes(toggle, { 'aria-expanded': isOpen.toString() });
            };
            
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCurrentlyOpen = card.classList.contains('active');
                toggleCard(!isCurrentlyOpen);
            });
            
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        });
    };
    
    // ========== 3) Shop Status with Minute Accuracy ==========
    const initShopStatus = () => {
        if (dom.openTimeEl) dom.openTimeEl.textContent = CONFIG.shop.openTime;
        if (dom.closeTimeEl) dom.closeTimeEl.textContent = CONFIG.shop.closeTime;
        if (dom.workingDaysEl) dom.workingDaysEl.textContent = CONFIG.shop.workingDays;
        
        const updateStatus = () => {
            if (!dom.statusBadge || !dom.statusText) return;
            
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const openMinutes = CONFIG.shop.openHour * 60 + CONFIG.shop.openMinute;
            const closeMinutes = CONFIG.shop.closeHour * 60 + CONFIG.shop.closeMinute;
            const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
            
            const statusClass = isOpen ? 'open' : 'closed';
            const statusMessage = isOpen ? 'Open Now' : 'Closed Now';
            
            dom.statusBadge.classList.toggle('open', isOpen);
            dom.statusBadge.classList.toggle('closed', !isOpen);
            dom.statusText.textContent = statusMessage;
            setAttributes(dom.statusBadge, { 'data-status': statusClass });
        };
        
        updateStatus();
        
        if (CONFIG.statusUpdateInterval) {
            setInterval(updateStatus, CONFIG.statusUpdateInterval);
        }
    };
    
    // ========== 4) Scroll to Top Button ==========
    const initScrollToTop = () => {
        if (!dom.scrollBtn) {
            logError('Scroll to top button not found');
            return;
        }
        
        const toggleVisibility = () => {
            const shouldShow = window.scrollY > CONFIG.scrollThreshold;
            dom.scrollBtn.classList.toggle('visible', shouldShow);
            setAttributes(dom.scrollBtn, { 'aria-hidden': (!shouldShow).toString() });
        };
        
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
        
        dom.scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    
    // ========== 5) Smooth Scroll with Dynamic Header Offset ==========
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (!href || href === '#' || href === '#/' || href.length === 1) return;
                if (!href.startsWith('#')) return;
                
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                
                if (!target) return;
                
                e.preventDefault();
                
                const header = document.querySelector(CONFIG.headerSelector);
                const headerHeight = header ? header.offsetHeight : 80;
                const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
                
                // Update URL without causing jump
                history.pushState(null, null, href);
            });
        });
    };
    
    // ========== 6) Fade-in Animation on Scroll ==========
    const initFadeInAnimation = () => {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        if (!fadeElements.length) return;
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            fadeElements.forEach(el => el.classList.add('visible'));
            return;
        }
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        fadeElements.forEach(el => observer.observe(el));
    };
    
    // ========== 7) Dynamic Copyright Year ==========
    const initCopyrightYear = () => {
        if (dom.yearSpan) {
            dom.yearSpan.textContent = new Date().getFullYear();
        }
    };
    
    // ========== 8) Lazy Load Images Enhancement ==========
    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            });
        } else {
            // Fallback for older browsers
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }
    };
    
    // ========== 9) Handle Reduced Motion Preference ==========
    const initReducedMotion = () => {
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionMediaQuery.matches) {
            document.documentElement.style.scrollBehavior = 'auto';
        }
    };
    
    // ========== 10) Register Service Worker (if supported) ==========
    const initServiceWorker = () => {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registered successfully');
                    })
                    .catch(err => {
                        logError('ServiceWorker registration failed:', err);
                    });
            });
        }
    };
    
    // ========== Initialize Everything ==========
    const init = () => {
        initMobileMenu();
        initProductAccordion();
        initShopStatus();
        initScrollToTop();
        initSmoothScroll();
        initFadeInAnimation();
        initCopyrightYear();
        initLazyLoading();
        initReducedMotion();
        initServiceWorker();
        
        console.log('SavitriMart website initialized successfully');
    };
    
    // Start after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();