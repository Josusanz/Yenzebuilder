// Secure Configuration - NO sensitive data exposed to client
// All sensitive credentials are accessed via API endpoints

// API Endpoints for secure credential access
const API_ENDPOINTS = {
    config: '/api/client-config',
    supabase: '/api/supabase-config',
    stripe: '/api/stripe-config'
};

// Client-safe configuration that can be exposed
const PUBLIC_CONFIG = {
    app: {
        name: 'YENZE',
        version: '2.0.0',
        urls: {
            app: window.location.origin,
            builder: 'https://builder.yenze.io'
        }
    },
    features: {
        aiGeneration: true,
        customDomains: true,
        analytics: true,
        multipage: true
    }
};

// Plans Configuration - Safe to expose (no sensitive data)
const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        priceId: null,
        monthlyPrice: 0,
        features: [
            '3 websites/projects', // UPDATED FROM 1
            'Multipage support (unlimited pages in HTML)',
            'Free URL (yenze.io/s/your-site)',
            '5,000 monthly visitors', // UPDATED FROM 1,000
            '25MB storage per site', // UPDATED FROM 10MB
            'Basic integrations (forms, newsletter)',
            'Community support',
            'Includes "Built with YENZE" badge'
        ],
        limits: {
            maxProjects: 3, // UPDATED FROM 1
            maxViews: 5000, // UPDATED FROM 1000
            maxStorage: 26214400, // 25MB (UPDATED FROM 10MB)
            customDomain: false,
            removeBranding: false,
            analytics: false,
            subdomain: false
        },
        deploymentType: 'path',
        maxDomains: 0,
        badge: true,
        popular: false,
        cta: 'Get Started Free'
    },
    STARTER: {
        id: 'starter',
        name: 'Starter',
        price: 2.99,
        period: 'month',
        monthlyPrice: 2.99,
        features: [
            '5 websites/projects', // UPDATED FROM 3
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            '1 custom domain (yourbrand.com)',
            '10,000 monthly visitors', // UPDATED FROM 5,000
            '100MB storage per site', // UPDATED FROM 50MB
            'All integrations (Web3Forms, Loops.so)',
            'Email support',
            'Remove YENZE branding',
            'SSL certificate included'
        ],
        limits: {
            maxProjects: 5, // UPDATED FROM 3
            maxViews: 10000, // UPDATED FROM 5000
            maxStorage: 104857600, // 100MB (UPDATED FROM 50MB)
            customDomain: true,
            removeBranding: true,
            analytics: false,
            subdomain: true
        },
        deploymentType: 'subdomain',
        maxDomains: 1,
        badge: false,
        popular: true,
        badge_text: 'Most Popular',
        cta: 'Start Building'
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 6.99,
        period: 'month',
        monthlyPrice: 6.99,
        features: [
            '20 websites/projects', // UPDATED FROM 10
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            '3 custom domains', // UPDATED FROM 1
            '50,000 monthly visitors', // UPDATED FROM 25,000
            '1GB storage per site', // UPDATED FROM 500MB
            'All integrations + premium',
            'Priority email support',
            'Remove all YENZE branding',
            'Analytics dashboard',
            'Automatic SSL certificates',
            'SEO tools & sitemap generation'
        ],
        limits: {
            maxProjects: 20, // UPDATED FROM 10
            maxViews: 50000, // UPDATED FROM 25000
            maxStorage: 1073741824, // 1GB (UPDATED FROM 500MB)
            customDomain: true,
            removeBranding: true,
            analytics: true,
            subdomain: true,
            seoTools: true
        },
        deploymentType: 'subdomain',
        maxDomains: 3, // UPDATED FROM 1
        badge: false,
        popular: false,
        cta: 'Go Pro'
    },
    BUSINESS: {
        id: 'business',
        name: 'Business',
        price: 14.99,
        period: 'month',
        monthlyPrice: 14.99,
        features: [
            'Unlimited websites/projects',
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            'Multiple custom domains (up to 10)', // UPDATED
            '250,000 monthly visitors', // UPDATED FROM 100,000
            '5GB storage per site', // UPDATED FROM 2GB
            'All integrations + API access',
            'Priority support (24h response)',
            'Complete white-label',
            'Advanced analytics & insights',
            'Team collaboration',
            'Custom branding in editor',
            'API access for automation',
            'Export code functionality'
        ],
        limits: {
            maxProjects: -1, // unlimited
            maxViews: 250000, // UPDATED FROM 100000
            maxStorage: 5368709120, // 5GB (UPDATED FROM 2GB)
            customDomain: true,
            multipleCustomDomains: true,
            removeBranding: true,
            analytics: true,
            whitelabel: true,
            apiAccess: true,
            subdomain: true,
            teamCollaboration: true,
            exportCode: true
        },
        deploymentType: 'subdomain',
        maxDomains: 10, // UPDATED FROM 999
        badge: false,
        popular: false,
        badge_text: 'Best Value',
        cta: 'Scale Up'
    }
};

// Secure configuration loader
class SecureConfig {
    constructor() {
        this.config = null;
        this.loading = false;
        this.loadPromise = null;
    }

    async load() {
        if (this.config) return this.config;
        if (this.loading) return this.loadPromise;

        this.loading = true;
        this.loadPromise = this._fetchConfig();

        try {
            this.config = await this.loadPromise;
            return this.config;
        } finally {
            this.loading = false;
        }
    }

    async _fetchConfig() {
        try {
            const response = await fetch(API_ENDPOINTS.config);
            if (!response.ok) {
                // If API fails, try to use what we have or throw
                console.warn('Config API returned error:', response.status);
                // We keep going to the catch block which handles fallback
                throw new Error('Failed to load configuration from API');
            }
            const serverConfig = await response.json();

            return {
                ...PUBLIC_CONFIG,
                supabase: {
                    url: serverConfig.supabaseUrl,
                    anonKey: serverConfig.supabaseAnonKey
                },
                stripe: {
                    publicKey: serverConfig.stripePublicKey,
                    paymentLinks: serverConfig.paymentLinks,
                    priceIds: serverConfig.priceIds
                },
                google: {
                    clientId: serverConfig.googleClientId
                }
            };
        } catch (error) {
            console.error('Failed to load secure config from API:', error);

            // Fallback to empty/safe values
            // IMPORTANT: Never hardcode production secrets here
            return {
                ...PUBLIC_CONFIG,
                supabase: {
                    url: '',
                    anonKey: ''
                },
                stripe: {
                    publicKey: '', // Must come from API
                    paymentLinks: {
                        starter: '',
                        pro: '',
                        business: ''
                    },
                    priceIds: {}
                },
                google: {
                    clientId: ''
                }
            };
        }
    }

    getPlans() {
        return PLANS;
    }

    getPlan(planId) {
        return PLANS[planId.toUpperCase()] || PLANS.FREE;
    }

    async getSupabaseConfig() {
        const config = await this.load();
        return config.supabase;
    }

    async getStripeConfig() {
        const config = await this.load();
        return config.stripe;
    }

    async getGoogleConfig() {
        const config = await this.load();
        return config.google;
    }

    // Helper to wait for STRIPE_CONFIG to be available
    async waitForStripeConfig(maxRetries = 50) {
        let retries = 0;
        while (!window.STRIPE_CONFIG && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        if (!window.STRIPE_CONFIG) {
            console.error('STRIPE_CONFIG not initialized after timeout');
            // Return empty config to prevent crash, but functionality will fail
            return { publicKey: '' };
        }

        return window.STRIPE_CONFIG;
    }
}

// Export singleton instance
const secureConfig = new SecureConfig();

// Backward compatibility - expose PLANS globally
window.PLANS = PLANS;
window.secureConfig = secureConfig;

// Initialize STRIPE_CONFIG globally for backward compatibility
// This will be populated after config loads
window.STRIPE_CONFIG = null;

// Load config and populate STRIPE_CONFIG immediately
(async () => {
    try {
        const config = await secureConfig.load();
        window.STRIPE_CONFIG = config.stripe;

        if (window.STRIPE_CONFIG && window.STRIPE_CONFIG.publicKey) {
            console.log('[Config] STRIPE_CONFIG initialized successfully');
        } else {
            console.warn('[Config] STRIPE_CONFIG loaded but missing keys (API failure?)');
        }
    } catch (error) {
        console.error('[Config] Failed to initialize STRIPE_CONFIG:', error);
        // Fallback to empty object
        window.STRIPE_CONFIG = { publicKey: '' };
    }
})();
