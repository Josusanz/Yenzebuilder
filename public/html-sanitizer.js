/**
 * HTML Sanitizer Module
 * Provides XSS protection using DOMPurify
 */

class HTMLSanitizer {
    constructor() {
        this.purify = null;
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                // Load DOMPurify from CDN if not already loaded
                if (typeof DOMPurify === 'undefined') {
                    await this._loadDOMPurify();
                }
                this.purify = DOMPurify;
                this.initialized = true;
            } catch (error) {
                console.error('Failed to initialize HTML sanitizer:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    async _loadDOMPurify() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.0/dist/purify.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Sanitize HTML for safe display
     * @param {string} html - HTML content to sanitize
     * @param {object} options - DOMPurify options
     * @returns {string} Sanitized HTML
     */
    sanitize(html, options = {}) {
        if (!this.initialized) {
            console.warn('Sanitizer not initialized. Call init() first.');
            return '';
        }

        const defaultOptions = {
            ALLOWED_TAGS: [
                'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'a', 'img', 'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em',
                'b', 'i', 'u', 'section', 'article', 'header', 'footer', 'nav',
                'button', 'input', 'textarea', 'form', 'label', 'select', 'option',
                'table', 'thead', 'tbody', 'tr', 'th', 'td', 'video', 'audio',
                'iframe', 'svg', 'path', 'circle', 'rect', 'line', 'polyline',
                'polygon', 'text', 'g', 'defs', 'linearGradient', 'stop',
                'pre', 'code', 'blockquote', 'script', 'style'
            ],
            ALLOWED_ATTR: [
                'class', 'id', 'style', 'src', 'alt', 'href', 'target', 'rel',
                'width', 'height', 'title', 'type', 'name', 'value', 'placeholder',
                'required', 'disabled', 'readonly', 'checked', 'selected',
                'data-*', 'aria-*', 'role', 'tabindex', 'autocomplete',
                'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'transform',
                'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points',
                'method', 'action', 'enctype', 'controls', 'autoplay', 'loop',
                'muted', 'poster', 'preload', 'frameborder', 'allow', 'allowfullscreen'
            ],
            ALLOW_DATA_ATTR: true,
            ALLOW_ARIA_ATTR: true,
            KEEP_CONTENT: true,
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            RETURN_DOM_IMPORT: false,
            SAFE_FOR_TEMPLATES: true,
            WHOLE_DOCUMENT: false,
            FORCE_BODY: false,
            SANITIZE_DOM: true,
            ...options
        };

        try {
            return this.purify.sanitize(html, defaultOptions);
        } catch (error) {
            console.error('Sanitization failed:', error);
            return '';
        }
    }

    /**
     * Sanitize HTML for editor use (more permissive)
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeForEditor(html) {
        return this.sanitize(html, {
            ADD_TAGS: ['link', 'meta'],
            ADD_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
                       'onfocus', 'onblur', 'onsubmit', 'onchange', 'oninput'],
            ALLOW_UNKNOWN_PROTOCOLS: false,
            WHOLE_DOCUMENT: true
        });
    }

    /**
     * Sanitize HTML for published sites (strict)
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeForPublish(html) {
        return this.sanitize(html, {
            FORBID_TAGS: ['script'], // Remove all scripts
            FORBID_ATTR: ['onerror', 'onload'], // Remove event handlers
            ALLOW_UNKNOWN_PROTOCOLS: false
        });
    }

    /**
     * Sanitize user input (very strict)
     * @param {string} input - User input to sanitize
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        return this.sanitize(input, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
            ALLOWED_ATTR: ['href', 'target', 'rel'],
            ALLOW_DATA_ATTR: false
        });
    }

    /**
     * Strip all HTML tags
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    stripHTML(html) {
        if (!this.initialized) {
            console.warn('Sanitizer not initialized.');
            return '';
        }

        return this.purify.sanitize(html, {
            ALLOWED_TAGS: [],
            KEEP_CONTENT: true
        });
    }

    /**
     * Check if HTML contains potentially dangerous content
     * @param {string} html - HTML to check
     * @returns {boolean} True if contains dangerous content
     */
    isDangerous(html) {
        if (!this.initialized) return false;

        const dangerous = [
            /<script/i,
            /javascript:/i,
            /onerror=/i,
            /onload=/i,
            /eval\(/i,
            /document\.cookie/i,
            /document\.write/i,
            /<iframe[^>]*src=["'](?!https?:\/\/)/i
        ];

        return dangerous.some(pattern => pattern.test(html));
    }
}

// Export singleton
const htmlSanitizer = new HTMLSanitizer();
window.htmlSanitizer = htmlSanitizer;

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => htmlSanitizer.init());
} else {
    htmlSanitizer.init();
}
