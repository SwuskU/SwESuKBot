// SVG Loader for SwESuKBot Website
// This script dynamically loads SVG graphics into their containers

class SVGLoader {
    constructor() {
        this.svgCache = new Map();
        this.loadingPromises = new Map();
    }

    // Load SVG content from file
    async loadSVG(filename) {
        if (this.svgCache.has(filename)) {
            return this.svgCache.get(filename);
        }

        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }

        const loadPromise = this.fetchSVG(filename);
        this.loadingPromises.set(filename, loadPromise);

        try {
            const svgContent = await loadPromise;
            this.svgCache.set(filename, svgContent);
            this.loadingPromises.delete(filename);
            return svgContent;
        } catch (error) {
            this.loadingPromises.delete(filename);
            throw error;
        }
    }

    // Fetch SVG file content
    async fetchSVG(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`Could not load SVG ${filename}:`, error);
            return this.createFallbackSVG(filename);
        }
    }

    // Create fallback SVG if file loading fails
    createFallbackSVG(filename) {
        const name = filename.replace('.svg', '').replace(/[^a-zA-Z0-9]/g, ' ');
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#5865f2" opacity="0.1" rx="10"/>
                <text x="50" y="50" text-anchor="middle" font-family="Arial, sans-serif" 
                      font-size="8" fill="#5865f2">${name}</text>
            </svg>
        `;
    }

    // Insert SVG into container
    async insertSVG(containerSelector, filename, options = {}) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn(`Container ${containerSelector} not found`);
            return;
        }

        try {
            // Show loading state
            if (options.showLoading) {
                container.innerHTML = this.createLoadingSVG();
            }

            const svgContent = await this.loadSVG(filename);
            
            // Apply options
            let processedSVG = svgContent;
            if (options.width || options.height) {
                processedSVG = this.resizeSVG(svgContent, options.width, options.height);
            }
            
            if (options.className) {
                processedSVG = this.addClassToSVG(processedSVG, options.className);
            }

            container.innerHTML = processedSVG;

            // Add animation class if specified
            if (options.animationClass) {
                setTimeout(() => {
                    const svg = container.querySelector('svg');
                    if (svg) {
                        svg.classList.add(options.animationClass);
                    }
                }, 100);
            }

        } catch (error) {
            console.error(`Error loading SVG ${filename}:`, error);
            container.innerHTML = this.createErrorSVG(filename);
        }
    }

    // Create loading SVG
    createLoadingSVG() {
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="20" fill="none" stroke="#5865f2" stroke-width="3" 
                        stroke-dasharray="31.416" stroke-dashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" 
                             values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" 
                             values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
                <text x="50" y="75" text-anchor="middle" font-family="Arial, sans-serif" 
                      font-size="8" fill="#5865f2">Loading...</text>
            </svg>
        `;
    }

    // Create error SVG
    createErrorSVG(filename) {
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#f04747" opacity="0.1" rx="10"/>
                <circle cx="50" cy="40" r="15" fill="#f04747" opacity="0.2"/>
                <text x="50" y="45" text-anchor="middle" font-family="Arial, sans-serif" 
                      font-size="16" fill="#f04747">!</text>
                <text x="50" y="65" text-anchor="middle" font-family="Arial, sans-serif" 
                      font-size="6" fill="#f04747">Error loading</text>
                <text x="50" y="75" text-anchor="middle" font-family="Arial, sans-serif" 
                      font-size="5" fill="#f04747">${filename}</text>
            </svg>
        `;
    }

    // Resize SVG
    resizeSVG(svgContent, width, height) {
        return svgContent.replace(
            /<svg([^>]*)>/,
            (match, attributes) => {
                let newAttributes = attributes;
                if (width) {
                    newAttributes = newAttributes.replace(/width="[^"]*"/, `width="${width}"`);
                    if (!newAttributes.includes('width=')) {
                        newAttributes += ` width="${width}"`;
                    }
                }
                if (height) {
                    newAttributes = newAttributes.replace(/height="[^"]*"/, `height="${height}"`);
                    if (!newAttributes.includes('height=')) {
                        newAttributes += ` height="${height}"`;
                    }
                }
                return `<svg${newAttributes}>`;
            }
        );
    }

    // Add class to SVG
    addClassToSVG(svgContent, className) {
        return svgContent.replace(
            /<svg([^>]*)>/,
            (match, attributes) => {
                const classMatch = attributes.match(/class="([^"]*)"/);
                if (classMatch) {
                    const existingClasses = classMatch[1];
                    const newAttributes = attributes.replace(
                        /class="[^"]*"/,
                        `class="${existingClasses} ${className}"`
                    );
                    return `<svg${newAttributes}>`;
                } else {
                    return `<svg${attributes} class="${className}">`;
                }
            }
        );
    }

    // Load all SVGs for the website
    async loadAllSVGs() {
        const svgMappings = [
            // Logo
            {
                container: '.logo-svg-container',
                file: 'logo.svg',
                options: { width: '40px', height: '40px', animationClass: 'fade-in' }
            },
            
            // Hero Section
            {
                container: '.github-svg-container',
                file: 'github-hero.svg',
                options: { animationClass: 'slide-in-left', showLoading: true }
            },
            {
                container: '.discord-svg-container',
                file: 'discord-hero.svg',
                options: { animationClass: 'slide-in-right', showLoading: true }
            },
            {
                container: '.connection-svg-container',
                file: 'connection-animation.svg',
                options: { animationClass: 'fade-in', showLoading: true }
            },
            
            // Feature Icons
            {
                container: '.feature-card:nth-child(1) .feature-icon',
                file: 'feature-notifications.svg',
                options: { width: '80px', height: '80px', animationClass: 'fade-in' }
            },
            {
                container: '.feature-card:nth-child(2) .feature-icon',
                file: 'feature-management.svg',
                options: { width: '80px', height: '80px', animationClass: 'fade-in' }
            },
            {
                container: '.feature-card:nth-child(3) .feature-icon',
                file: 'feature-collaboration.svg',
                options: { width: '80px', height: '80px', animationClass: 'fade-in' }
            },
            
            // Workflow
            {
                container: '.workflow-svg-container',
                file: 'workflow.svg',
                options: { animationClass: 'fade-in', showLoading: true }
            },
            
            // OAuth Icons
            {
                container: '.github-icon',
                file: 'github-oauth-icon.svg',
                options: { width: '24px', height: '24px' }
            },
            {
                container: '.discord-icon',
                file: 'discord-oauth-icon.svg',
                options: { width: '24px', height: '24px' }
            }
        ];

        // Load SVGs with staggered timing for better UX
        for (let i = 0; i < svgMappings.length; i++) {
            const mapping = svgMappings[i];
            
            // Add delay for visual effect
            setTimeout(() => {
                this.insertSVG(mapping.container, mapping.file, mapping.options);
            }, i * 200);
        }
    }

    // Preload critical SVGs
    async preloadCriticalSVGs() {
        const criticalSVGs = [
            'logo.svg',
            'github-hero.svg',
            'discord-hero.svg',
            'connection-animation.svg'
        ];

        const preloadPromises = criticalSVGs.map(filename => this.loadSVG(filename));
        
        try {
            await Promise.all(preloadPromises);
            console.log('Critical SVGs preloaded successfully');
        } catch (error) {
            console.warn('Some critical SVGs failed to preload:', error);
        }
    }
}

// Create global SVG loader instance
window.svgLoader = new SVGLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading SVG graphics...');
    
    try {
        // Preload critical SVGs first
        await window.svgLoader.preloadCriticalSVGs();
        
        // Load all SVGs
        await window.svgLoader.loadAllSVGs();
        
        console.log('SVG graphics loaded successfully');
    } catch (error) {
        console.error('Error loading SVG graphics:', error);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SVGLoader;
}
