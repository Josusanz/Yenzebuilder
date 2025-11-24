// Subdomain Validation and Utilities
// Handles subdomain generation, validation, and availability checking

class SubdomainUtils {
    constructor() {
        // Reserved subdomains that cannot be used
        this.RESERVED_SUBDOMAINS = [
            // System subdomains
            'www', 'mail', 'email', 'ftp', 'smtp', 'pop', 'imap',
            'webmail', 'ns1', 'ns2', 'mx', 'mx1', 'mx2',

            // Application subdomains
            'admin', 'administrator', 'api', 'app', 'application',
            'blog', 'shop', 'store', 'dashboard', 'console',
            'cdn', 'static', 'assets', 'media', 'files',
            'builder', 'editor', 'preview', 'staging', 'dev',
            'test', 'demo', 'sandbox', 'localhost',

            // Brand protection
            'yenze', 'support', 'help', 'docs', 'documentation',
            'status', 'about', 'contact', 'legal', 'privacy',
            'terms', 'billing', 'account', 'login', 'signup',
            'register', 'auth', 'oauth',

            // Security
            'secure', 'ssl', 'vpn', 'proxy', 'gateway',

            // Common abuse
            'fuck', 'shit', 'damn', 'hell', 'porn', 'sex',
            'spam', 'scam', 'phishing', 'abuse', 'illegal'
        ];
    }

    /**
     * Validates a subdomain string
     * @param {string} subdomain - The subdomain to validate
     * @returns {object} - {valid: boolean, error: string|null}
     */
    validate(subdomain) {
        if (!subdomain || typeof subdomain !== 'string') {
            return { valid: false, error: 'Subdomain is required' };
        }

        // Convert to lowercase for validation
        subdomain = subdomain.toLowerCase().trim();

        // Length check
        if (subdomain.length < 3) {
            return { valid: false, error: 'Subdomain must be at least 3 characters long' };
        }

        if (subdomain.length > 63) {
            return { valid: false, error: 'Subdomain must be 63 characters or less' };
        }

        // Format check: only lowercase letters, numbers, and hyphens
        const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
        if (!validPattern.test(subdomain)) {
            return {
                valid: false,
                error: 'Subdomain can only contain lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.'
            };
        }

        // Check if consecutive hyphens
        if (subdomain.includes('--')) {
            return { valid: false, error: 'Subdomain cannot contain consecutive hyphens' };
        }

        // Check reserved names
        if (this.RESERVED_SUBDOMAINS.includes(subdomain)) {
            return { valid: false, error: 'This subdomain is reserved and cannot be used' };
        }

        // Check for reserved prefixes
        const reservedPrefixes = ['yenze-', 'admin-', 'api-', 'mail-'];
        if (reservedPrefixes.some(prefix => subdomain.startsWith(prefix))) {
            return { valid: false, error: 'This subdomain prefix is reserved' };
        }

        return { valid: true, error: null };
    }

    /**
     * Generates a subdomain from a project name
     * @param {string} projectName - The project name
     * @returns {string} - A valid subdomain slug
     */
    generateFromName(projectName) {
        if (!projectName) {
            return this.generateRandom();
        }

        // Convert to lowercase and remove special characters
        let slug = projectName
            .toLowerCase()
            .trim()
            // Replace spaces and underscores with hyphens
            .replace(/[\s_]+/g, '-')
            // Remove special characters except hyphens
            .replace(/[^a-z0-9-]/g, '')
            // Remove consecutive hyphens
            .replace(/-+/g, '-')
            // Remove leading/trailing hyphens
            .replace(/^-+|-+$/g, '');

        // If empty after sanitization, generate random
        if (!slug || slug.length < 3) {
            return this.generateRandom();
        }

        // Truncate if too long
        if (slug.length > 63) {
            slug = slug.substring(0, 63).replace(/-+$/, '');
        }

        // If it's a reserved name, add suffix
        if (this.RESERVED_SUBDOMAINS.includes(slug)) {
            slug = `${slug}-site`;
        }

        return slug;
    }

    /**
     * Generates a random subdomain
     * @returns {string} - A random subdomain
     */
    generateRandom() {
        const adjectives = ['cool', 'awesome', 'great', 'super', 'amazing', 'pro', 'elite', 'prime', 'mega', 'ultra'];
        const nouns = ['site', 'web', 'page', 'hub', 'space', 'zone', 'studio', 'works', 'labs', 'digital'];
        const randomNum = Math.floor(Math.random() * 9999);

        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];

        return `${adjective}-${noun}-${randomNum}`;
    }

    /**
     * Checks if a subdomain is available in the database
     * @param {string} subdomain - The subdomain to check
     * @param {object} supabaseClient - The Supabase client instance
     * @returns {Promise<boolean>} - True if available, false if taken
     */
    async checkAvailability(subdomain, supabaseClient) {
        try {
            const { data, error } = await supabaseClient.client
                .from('projects')
                .select('id')
                .eq('subdomain_slug', subdomain)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error checking subdomain availability:', error);
                return false;
            }

            // If data is null, subdomain is available
            return data === null;

        } catch (error) {
            console.error('Error in checkAvailability:', error);
            return false;
        }
    }

    /**
     * Generates a unique available subdomain
     * @param {string} projectName - The project name
     * @param {object} supabaseClient - The Supabase client instance
     * @returns {Promise<string>} - A unique available subdomain
     */
    async generateUnique(projectName, supabaseClient) {
        let subdomain = this.generateFromName(projectName);
        let attempt = 0;
        const maxAttempts = 10;

        while (attempt < maxAttempts) {
            const available = await this.checkAvailability(subdomain, supabaseClient);

            if (available) {
                return subdomain;
            }

            // Try with a number suffix
            attempt++;
            const baseName = subdomain.replace(/-\d+$/, ''); // Remove existing number suffix if any
            subdomain = `${baseName}-${Math.floor(Math.random() * 9999)}`;
        }

        // If all attempts failed, use completely random
        return this.generateRandom();
    }

    /**
     * Gets the full subdomain URL
     * @param {string} subdomain - The subdomain slug
     * @returns {string} - The full URL (e.g., 'subdomain.yenze.io')
     */
    getFullURL(subdomain) {
        return `${subdomain}.yenze.io`;
    }

    /**
     * Formats subdomain for display
     * @param {string} subdomain - The subdomain slug
     * @returns {string} - Formatted display string
     */
    formatForDisplay(subdomain) {
        if (!subdomain) return 'No subdomain';
        return `https://${subdomain}.yenze.io`;
    }
}

// Create singleton instance
const subdomainUtils = new SubdomainUtils();

// Export for use in browser (global window object)
if (typeof window !== 'undefined') {
    window.subdomainUtils = subdomainUtils;
    window.SubdomainUtils = SubdomainUtils;
}

// Export for use in Node.js modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubdomainUtils;
}
