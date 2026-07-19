/**
 * SavitriMart Contact Form Handler
 * WhatsApp integration with validation and error handling
 * Version: 2.0.0
 */

(function() {
    'use strict';
    
    // ========== Configuration ==========
    const CONFIG = {
        whatsappNumber: '919427020201', // International format without '+'
        formSelector: '#contactForm',
        nameSelector: '#name',
        phoneSelector: '#phone',
        messageSelector: '#message',
        statusSelector: '#formStatus'
    };
    
    // ========== DOM Elements ==========
    const form = document.querySelector(CONFIG.formSelector);
    const nameInput = document.querySelector(CONFIG.nameSelector);
    const phoneInput = document.querySelector(CONFIG.phoneSelector);
    const messageInput = document.querySelector(CONFIG.messageSelector);
    const statusDiv = document.querySelector(CONFIG.statusSelector);
    
    // ========== Helper Functions ==========
    const showStatus = (message, type) => {
        if (!statusDiv) return;
        
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Announce to screen readers
        statusDiv.setAttribute('role', 'alert');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (statusDiv.style.display === 'block') {
                statusDiv.style.display = 'none';
                statusDiv.removeAttribute('role');
            }
        }, 5000);
    };
    
    const validatePhoneNumber = (phone) => {
        // Remove all spaces and special characters
        const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
        
        // Indian mobile number pattern
        // Starts with 6,7,8,9 and has exactly 10 digits
        const phonePattern = /^[6-9]\d{9}$/;
        
        return phonePattern.test(cleanPhone);
    };
    
    const formatPhoneForDisplay = (phone) => {
        // Format as +91 XXXXX XXXXX for display
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 10) {
            return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
        }
        return phone;
    };
    
    const validateForm = () => {
        const name = nameInput?.value.trim() || '';
        const phone = phoneInput?.value.trim() || '';
        const message = messageInput?.value.trim() || '';
        
        if (!name) {
            showStatus('✗ Please enter your name', 'error');
            nameInput?.focus();
            return false;
        }
        
        if (name.length < 2) {
            showStatus('✗ Please enter a valid name (minimum 2 characters)', 'error');
            nameInput?.focus();
            return false;
        }
        
        if (!phone) {
            showStatus('✗ Please enter your phone number', 'error');
            phoneInput?.focus();
            return false;
        }
        
        if (!validatePhoneNumber(phone)) {
            showStatus('✗ Please enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)', 'error');
            phoneInput?.focus();
            return false;
        }
        
        if (!message) {
            showStatus('✗ Please enter your message', 'error');
            messageInput?.focus();
            return false;
        }
        
        if (message.length < 5) {
            showStatus('✗ Please enter a more detailed message (minimum 5 characters)', 'error');
            messageInput?.focus();
            return false;
        }
        
        return { name, phone: phone.replace(/\D/g, ''), message };
    };
    
    const createWhatsAppMessage = (data) => {
        const date = new Date().toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
        
        return `*🛍️ NEW ENQUIRY FROM SAVITRIMART WEBSITE* 🛍️

*📅 Date & Time:* ${date}

*👤 Customer Details:*
• *Name:* ${data.name}
• *Phone:* ${data.phone}

*💬 Message:*
${data.message}

---
*Sent from SavitriMart Website*
📍 Limda Chowk, Dhanera - 385310
📞 Contact: +91 9427020201`;
    };
    
    const openWhatsApp = (message) => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
        
        // Try to open WhatsApp
        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
            // Popup was blocked
            showStatus(
                '⚠️ Popup blocked. Please allow popups for this site or <a href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer">click here to open WhatsApp</a>.',
                'error'
            );
            return false;
        }
        
        return true;
    };
    
    const resetForm = () => {
        if (form) form.reset();
        if (nameInput) nameInput.focus();
    };
    
    // ========== Form Submission Handler ==========
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Disable submit button to prevent double submission
        const submitBtn = form?.querySelector('.submit-btn');
        const originalBtnText = submitBtn?.innerHTML;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening WhatsApp...';
        }
        
        try {
            const validationResult = validateForm();
            
            if (validationResult === false) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                return;
            }
            
            const whatsappMessage = createWhatsAppMessage(validationResult);
            const opened = openWhatsApp(whatsappMessage);
            
            if (opened) {
                showStatus(
                    '✓ WhatsApp opened! Please tap "Send" in WhatsApp to complete your enquiry.',
                    'success'
                );
                resetForm();
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('✗ An unexpected error occurred. Please try again or call us directly.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    };
    
    // ========== Real-time Phone Number Formatting ==========
    const initPhoneFormatting = () => {
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            // Format as user types
            if (value.length > 5) {
                e.target.value = `${value.slice(0, 5)} ${value.slice(5)}`;
            } else {
                e.target.value = value;
            }
        });
    };
    
    // ========== Input Validation on Blur ==========
    const initInputValidation = () => {
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                const phone = phoneInput.value.trim();
                if (phone && !validatePhoneNumber(phone)) {
                    showStatus('⚠️ Please enter a valid 10-digit Indian mobile number', 'error');
                }
            });
        }
        
        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                const name = nameInput.value.trim();
                if (name && name.length < 2) {
                    showStatus('⚠️ Name should be at least 2 characters long', 'error');
                }
            });
        }
    };
    
    // ========== Initialize Contact Form ==========
    const init = () => {
        if (!form) {
            console.warn('[SavitriMart] Contact form not found on this page');
            return;
        }
        
        form.addEventListener('submit', handleSubmit);
        initPhoneFormatting();
        initInputValidation();
        
        console.log('[SavitriMart] Contact form initialized');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();