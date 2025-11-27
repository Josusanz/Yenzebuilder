// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_CONFIG = {
    url: 'https://xssdcphepracobbsvqmg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2RjcGhlcHJhY29iYnN2cW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDYsImV4cCI6MjA3OTE4NjcwNn0.Z3w9P2dMeNu2J-2AcnxhLVSF_p794JZgIcAKMqkT3-A'
};

// Stripe Configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_live_51MC0CNIDLJ66zkJzWkTaTmIrxYYaIUYwIhXWoAibHOqOQykhnbaZm57Cf7mFWUcuVruqq8iQCboJB1bgFwluGJCq00RzMk6vtK',
    paymentLinks: {
        starter: 'https://buy.stripe.com/eVq7sM3er132eJZeD3aIM04',
        pro: 'https://buy.stripe.com/bJe4gAeX98vu6dtbqRaIM02',
        business: 'https://buy.stripe.com/14A28seX93ba7hx3YpaIM03'
    }
};

// Plans Configuration - Ultra-Competitive Pricing
const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        priceId: null,
        monthlyPrice: 0,
        features: [
            '1 website/project',
            'Multipage support (unlimited pages in HTML)',
            'Free URL (yenze.io/s/your-site)',
            '1,000 monthly visitors',
            '10MB storage per site',
            'Basic integrations (forms, newsletter)',
            'Community support',
            'Includes "Built with YENZE" badge'
        ],
        limits: {
            maxProjects: 1,
            maxViews: 1000,
            maxStorage: 10485760, // 10MB
            customDomain: false,
            removeBranding: false,
            analytics: false,
            subdomain: false
        },
        deploymentType: 'path', // yenze.io/s/username
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
        priceId: 'price_1SWi7yIDLJ66zkJzH1MJXNY6',
        monthlyPrice: 2.99,
        monthlyPriceId: 'price_1SWi7yIDLJ66zkJzH1MJXNY6',
        features: [
            '3 websites/projects',
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            '1 custom domain (yourbrand.com)',
            '5,000 monthly visitors',
            '50MB storage per site',
            'All integrations (Web3Forms, Loops.so)',
            'Email support',
            'Remove YENZE branding',
            'SSL certificate included'
        ],
        limits: {
            maxProjects: 3,
            maxViews: 5000,
            maxStorage: 52428800, // 50MB
            customDomain: true,
            removeBranding: true,
            analytics: false,
            subdomain: true
        },
        deploymentType: 'subdomain', // yoursite.yenze.io
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
        priceId: 'price_1SWiCYIDLJ66zkJzlw0IY25L',
        monthlyPrice: 6.99,
        monthlyPriceId: 'price_1SWiCYIDLJ66zkJzlw0IY25L',
        features: [
            '10 websites/projects',
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            '1 custom domain (yourbrand.com)',
            '25,000 monthly visitors',
            '500MB storage per site',
            'All integrations + premium',
            'Priority email support',
            'Remove all YENZE branding',
            'Analytics dashboard',
            'Automatic SSL certificates'
        ],
        limits: {
            maxProjects: 10,
            maxViews: 25000,
            maxStorage: 524288000, // 500MB
            customDomain: true,
            removeBranding: true,
            analytics: true,
            subdomain: true
        },
        deploymentType: 'subdomain', // yoursite.yenze.io
        maxDomains: 1,
        badge: false,
        popular: false,
        cta: 'Go Pro'
    },
    BUSINESS: {
        id: 'business',
        name: 'Business',
        price: 14.99,
        period: 'month',
        priceId: 'price_1SWiDFIDLJ66zkJzyNmDga03',
        monthlyPrice: 14.99,
        monthlyPriceId: 'price_1SWiDFIDLJ66zkJzyNmDga03',
        features: [
            'Unlimited websites/projects',
            'Multipage support (unlimited pages per site)',
            'Custom subdomain (yoursite.yenze.io)',
            'Multiple custom domains',
            '100,000 monthly visitors',
            '2GB storage per site',
            'All integrations + API access',
            'Priority support (24h response)',
            'Complete white-label',
            'Advanced analytics',
            'Team collaboration (coming soon)',
            'Custom branding in editor',
            'API access for automation'
        ],
        limits: {
            maxProjects: -1, // unlimited
            maxViews: 100000,
            maxStorage: 2147483648, // 2GB
            customDomain: true,
            multipleCustomDomains: true,
            removeBranding: true,
            analytics: true,
            whitelabel: true,
            apiAccess: true,
            subdomain: true
        },
        deploymentType: 'subdomain', // yoursite.yenze.io + custom domains
        maxDomains: 999,
        badge: false,
        popular: false,
        badge_text: 'Best Value',
        cta: 'Scale Up'
    }
};
