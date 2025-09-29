// Premier Bank Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initChatModal();
    initCounters();
    initContactForm();
    initScrollEffects();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links (starting with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    
    let current = '';
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top - headerHeight - 50;
        if (sectionTop <= 0) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Chat modal functionality
function initChatModal() {
    const chatButton = document.getElementById('chatButton');
    const chatModal = document.getElementById('chatModal');
    const closeModal = document.getElementById('closeModal');
    const chatOptions = document.querySelectorAll('.chat__option');

    // Open modal
    chatButton.addEventListener('click', function() {
        chatModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        setTimeout(() => {
            chatModal.querySelector('.modal__content').style.transform = 'scale(1)';
        }, 10);
    });

    // Close modal
    function closeModalHandler() {
        chatModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', closeModalHandler);

    // Close modal when clicking outside
    chatModal.addEventListener('click', function(e) {
        if (e.target === chatModal) {
            closeModalHandler();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !chatModal.classList.contains('hidden')) {
            closeModalHandler();
        }
    });

    // Handle chat option clicks
    chatOptions.forEach(option => {
        option.addEventListener('click', function() {
            const optionText = this.textContent;
            handleChatOption(optionText);
        });
    });
}

// Handle chat option selection
function handleChatOption(option) {
    const responses = {
        'Account Information': 'For account information, please call us at 1-800-PREMIER or visit your nearest branch. Our customer service team is available 24/7 to assist you.',
        'Loan Services': 'Interested in our loan services? Our loan specialists can help you find the perfect solution. Would you like to schedule a consultation?',
        'Technical Support': 'Having trouble with online banking or our mobile app? Our technical support team is ready to help. Please call 1-800-PREMIER for immediate assistance.',
        'Schedule Appointment': 'Ready to meet with one of our banking professionals? Please call 1-800-PREMIER or visit our website to schedule an appointment at your convenience.'
    };

    const response = responses[option] || 'Thank you for contacting Premier Bank. Please call 1-800-PREMIER for immediate assistance.';
    
    // Create a simple alert for demo purposes
    // In a real application, this would integrate with a chat system
    alert(`${option}\n\n${response}`);
}

// Animated counters
function initCounters() {
    const counters = document.querySelectorAll('.stat__number[data-count]');
    let hasAnimated = false;

    function animateCounters() {
        if (hasAnimated) return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const increment = target / 100;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = formatNumber(target);
                    clearInterval(timer);
                } else {
                    counter.textContent = formatNumber(Math.floor(current));
                }
            }, 20);
        });

        hasAnimated = true;
    }

    // Format numbers with appropriate suffixes
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M+';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K+';
        } else {
            return num.toString() + '+';
        }
    }

    // Trigger animation when stats section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
            }
        });
    }, {
        threshold: 0.5
    });

    const statsSection = document.querySelector('.hero__stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact__form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate all fields
    let isValid = true;
    const inputs = form.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please correct the errors before submitting.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (in real app, this would send to server)
    setTimeout(() => {
        showNotification('Thank you! Your message has been sent. We\'ll get back to you within 24 hours.', 'success');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Validate individual form field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.id;
    
    // Remove existing error
    clearFieldError({ target: field });
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(field)} is required.`;
        isValid = false;
    }
    
    // Email validation
    else if (field.type === 'email' && value && !isValidEmail(value)) {
        errorMessage = 'Please enter a valid email address.';
        isValid = false;
    }
    
    // Show error if validation failed
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Clear field error styling and message
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--color-error)';
    errorElement.style.fontSize = 'var(--font-size-sm)';
    errorElement.style.marginTop = 'var(--space-4)';
    
    field.parentNode.appendChild(errorElement);
}

// Get user-friendly field label
function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent : field.name || field.id;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 20px;
        background: var(--color-${type === 'error' ? 'error' : 'success'});
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Scroll effects
function initScrollEffects() {
    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .feature, .contact__item');
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Header background on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Service card interactions
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const button = card.querySelector('.btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const serviceName = card.querySelector('.service-card__title').textContent;
                showServiceDetails(serviceName);
            });
        }
    });
});

// Show service details
function showServiceDetails(serviceName) {
    const serviceDetails = {
        'Personal Banking': 'Our personal banking services include checking accounts, savings accounts, CDs, and personal loans. Visit a branch or call 1-800-PREMIER to get started.',
        'Business Banking': 'We offer comprehensive business banking solutions including business checking, merchant services, and business loans. Contact our business banking specialists today.',
        'Loans & Mortgages': 'Whether you\'re buying your first home or refinancing, our mortgage specialists are here to help. Get pre-approved online or schedule a consultation.',
        'Investment Services': 'Build wealth for the future with our investment services. Our financial advisors can help you create a personalized investment strategy.'
    };
    
    const details = serviceDetails[serviceName] || 'Contact us at 1-800-PREMIER for more information about this service.';
    alert(`${serviceName}\n\n${details}`);
}

// Add CSS animations via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .service-card,
    .testimonial-card,
    .feature,
    .contact__item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .header.scrolled {
        background: rgba(var(--color-surface-rgb, 255, 255, 253), 0.95) !important;
        backdrop-filter: blur(10px);
    }
    
    .form-control.error {
        border-color: var(--color-error) !important;
        box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.1) !important;
    }
    
    .modal__content {
        transform: scale(0.9);
        transition: transform 0.3s ease-out;
    }
`;

document.head.appendChild(style);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization for scroll events
const debouncedScrollHandler = debounce(() => {
    updateActiveNavLink();
}, 10);

window.removeEventListener('scroll', updateActiveNavLink);
window.addEventListener('scroll', debouncedScrollHandler);

// Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Navigate with arrow keys in service cards
    if (e.target.closest('.service-card')) {
        const cards = Array.from(document.querySelectorAll('.service-card'));
        const currentIndex = cards.indexOf(e.target.closest('.service-card'));
        
        if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
            cards[currentIndex + 1].focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            cards[currentIndex - 1].focus();
        }
    }
});

// Make service cards focusable for keyboard navigation
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.setAttribute('tabindex', index === 0 ? '0' : '-1');
    card.addEventListener('focus', function() {
        this.style.outline = '2px solid var(--color-bank-primary)';
        this.style.outlineOffset = '2px';
    });
    card.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
});

console.log('Premier Bank website initialized successfully!');