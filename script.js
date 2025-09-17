// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const githubLogin = document.getElementById('githubLogin');
const discordLogin = document.getElementById('discordLogin');
const getStartedBtn = document.getElementById('getStartedBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');
const signupLink = document.getElementById('signupLink');

// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupAnimations();
    checkAuthStatus();
});

// Initialize application
function initializeApp() {
    console.log('SwESuKBot initialized');
    
    // Load SVG graphics
    loadSVGGraphics();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup intersection observer for animations
    setupIntersectionObserver();
}

// Setup event listeners
function setupEventListeners() {
    // Login modal events
    loginBtn.addEventListener('click', openLoginModal);
    closeModal.addEventListener('click', closeLoginModal);
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // Login form events
    loginForm.addEventListener('submit', handleLogin);
    githubLogin.addEventListener('click', handleGitHubLogin);
    discordLogin.addEventListener('click', handleDiscordLogin);
    signupLink.addEventListener('click', handleSignup);
    
    // Hero button events
    getStartedBtn.addEventListener('click', handleGetStarted);
    learnMoreBtn.addEventListener('click', handleLearnMore);
    
    // Navigation events
    setupNavigationEvents();
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyboardEvents);
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup intersection observer for scroll animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .about-text, .workflow-svg-container');
    animatedElements.forEach(el => observer.observe(el));
}

// Setup navigation events
function setupNavigationEvents() {
    // Active navigation highlighting
    window.addEventListener('scroll', updateActiveNavigation);
    
    // Mobile menu toggle (if needed in future)
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Modal functions
function openLoginModal() {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
    }, 100);
}

function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    loginForm.reset();
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Anmelden...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        if (validateLogin(email, password)) {
            authenticateUser({
                email: email,
                name: email.split('@')[0],
                provider: 'email'
            });
            closeLoginModal();
            showNotification('Erfolgreich angemeldet!', 'success');
        } else {
            showNotification('Ungültige Anmeldedaten', 'error');
        }
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function handleGitHubLogin() {
    showNotification('GitHub OAuth wird geöffnet...', 'info');
    
    // Simulate GitHub OAuth flow
    setTimeout(() => {
        authenticateUser({
            name: 'GitHub User',
            email: 'user@github.com',
            provider: 'github',
            avatar: 'https://github.com/identicons/sample.png'
        });
        closeLoginModal();
        showNotification('Mit GitHub angemeldet!', 'success');
    }, 2000);
}

function handleDiscordLogin() {
    showNotification('Discord OAuth wird geöffnet...', 'info');
    
    // Simulate Discord OAuth flow
    setTimeout(() => {
        authenticateUser({
            name: 'Discord User',
            email: 'user@discord.com',
            provider: 'discord',
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
        });
        closeLoginModal();
        showNotification('Mit Discord angemeldet!', 'success');
    }, 2000);
}

function handleSignup(e) {
    e.preventDefault();
    showNotification('Registrierung wird implementiert...', 'info');
}

function validateLogin(email, password) {
    // Simple validation for demo
    return email.includes('@') && password.length >= 6;
}

function authenticateUser(userData) {
    isAuthenticated = true;
    currentUser = userData;
    
    // Update UI
    updateAuthUI();
    
    // Store in localStorage for persistence
    localStorage.setItem('swesukbot_user', JSON.stringify(userData));
    localStorage.setItem('swesukbot_auth', 'true');
}

function updateAuthUI() {
    if (isAuthenticated && currentUser) {
        loginBtn.textContent = currentUser.name;
        loginBtn.onclick = showUserMenu;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = openLoginModal;
    }
}

function showUserMenu() {
    // Create user menu dropdown
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-menu-content">
            <div class="user-info">
                <strong>${currentUser.name}</strong>
                <small>${currentUser.email}</small>
            </div>
            <hr>
            <button onclick="showDashboard()">Dashboard</button>
            <button onclick="showSettings()">Einstellungen</button>
            <button onclick="logout()">Abmelden</button>
        </div>
    `;
    
    // Position menu
    const rect = loginBtn.getBoundingClientRect();
    userMenu.style.position = 'fixed';
    userMenu.style.top = rect.bottom + 10 + 'px';
    userMenu.style.right = '20px';
    userMenu.style.zIndex = '2001';
    
    document.body.appendChild(userMenu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!userMenu.contains(e.target) && e.target !== loginBtn) {
                userMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function logout() {
    isAuthenticated = false;
    currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('swesukbot_user');
    localStorage.removeItem('swesukbot_auth');
    
    // Update UI
    updateAuthUI();
    
    // Remove user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) userMenu.remove();
    
    showNotification('Erfolgreich abgemeldet', 'success');
}

function checkAuthStatus() {
    const storedAuth = localStorage.getItem('swesukbot_auth');
    const storedUser = localStorage.getItem('swesukbot_user');
    
    if (storedAuth === 'true' && storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            isAuthenticated = true;
            updateAuthUI();
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('swesukbot_user');
            localStorage.removeItem('swesukbot_auth');
        }
    }
}

// Hero button handlers
function handleGetStarted() {
    if (isAuthenticated) {
        showDashboard();
    } else {
        openLoginModal();
    }
}

function handleLearnMore() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Dashboard and settings functions
function showDashboard() {
    showNotification('Dashboard wird geladen...', 'info');
    // Here you would typically navigate to a dashboard page
    console.log('Opening dashboard for user:', currentUser);
}

function showSettings() {
    showNotification('Einstellungen werden geladen...', 'info');
    // Here you would typically open settings modal or page
    console.log('Opening settings for user:', currentUser);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00d4aa' : type === 'error' ? '#ff4757' : '#5865f2'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Keyboard event handlers
function handleKeyboardEvents(e) {
    // Close modal with Escape key
    if (e.key === 'Escape' && loginModal.style.display === 'block') {
        closeLoginModal();
    }
    
    // Quick login with Ctrl+L
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (!isAuthenticated) {
            openLoginModal();
        }
    }
}

// Animation setup
function setupAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroGraphics = document.querySelector('.hero-graphics');
        
        if (heroGraphics) {
            const rate = scrolled * -0.5;
            heroGraphics.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Typing animation for hero title
    animateHeroTitle();
}

function animateHeroTitle() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const originalText = heroTitle.innerHTML;
    heroTitle.innerHTML = '';
    
    let index = 0;
    const typeSpeed = 50;
    
    function typeWriter() {
        if (index < originalText.length) {
            heroTitle.innerHTML += originalText.charAt(index);
            index++;
            setTimeout(typeWriter, typeSpeed);
        }
    }
    
    // Start typing animation after a short delay
    setTimeout(typeWriter, 1000);
}

// Load SVG graphics
function loadSVGGraphics() {
    // SVG graphics are now loaded automatically by svg-loader.js
    console.log('SVG graphics will be loaded by SVG loader...');
    
    // Add any additional SVG-related initialization here
    setupSVGInteractions();
}

function setupSVGInteractions() {
    // Add hover effects and interactions for SVG elements
    document.addEventListener('click', function(e) {
        // Handle SVG interactions
        if (e.target.closest('.feature-icon')) {
            const featureCard = e.target.closest('.feature-card');
            if (featureCard) {
                featureCard.classList.add('pulse-animation');
                setTimeout(() => {
                    featureCard.classList.remove('pulse-animation');
                }, 600);
            }
        }
    });
    
    // Add intersection observer for SVG animations
    const svgContainers = document.querySelectorAll('.github-svg-container, .discord-svg-container, .workflow-svg-container');
    
    const svgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const svg = entry.target.querySelector('svg');
                if (svg) {
                    svg.classList.add('animate-in');
                }
            }
        });
    }, { threshold: 0.3 });
    
    svgContainers.forEach(container => {
        svgObserver.observe(container);
    });
}

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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimization
const debouncedScroll = debounce(updateActiveNavigation, 10);
window.addEventListener('scroll', debouncedScroll);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here
        console.log('Service worker support detected');
    });
}

// Export functions for global access
window.SwESuKBot = {
    openLoginModal,
    closeLoginModal,
    showNotification,
    logout,
    showDashboard,
    showSettings
};
