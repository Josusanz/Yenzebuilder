// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_CONFIG = {
    url: 'https://xssdcphepracobbsvqmg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2RjcGhlcHJhY29iYnN2cW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDYsImV4cCI6MjA3OTE4NjcwNn0.Z3w9P2dMeNu2J-2AcnxhLVSF_p794JZgIcAKMqkT3-A'
};

// Stripe Configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_live_51MC0CNIDLJ66zkJzWkTaTmIrxYYaIUYwIhXWoAibHOqOQykhnbaZm57Cf7mFWUcuVruqq8iQCboJB1bgFwluGJCq00RzMk6vtK'
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
            '1 page per project',
            '1 project total',
            'Free subdomain (you.yenze.io)',
            '1,000 monthly page views',
            '10MB storage',
            'Basic integrations (forms, newsletter)',
            'Community support',
            'Includes "Built with YENZE" badge'
        ],
        limits: {
            maxPages: 1,
            maxProjects: 1,
            maxViews: 1000,
            maxStorage: 10485760, // 10MB
            customDomain: false,
            removeBranding: false,
            analytics: false
        },
        deploymentType: 'subdomain', // user.yenze.io
        maxDomains: 0,
        badge: true,
        popular: false,
        cta: 'Get Started Free'
    },
    STARTER: {
        id: 'starter',
        name: 'Starter',
        price: 35.88, // $2.99/mo × 12
        period: 'year',
        priceId: 'price_starter_yearly', // TODO: Create in Stripe
        monthlyPrice: 2.99,
        monthlyPriceId: 'price_starter_monthly', // TODO: Create in Stripe
        features: [
            '3 pages per project',
            '3 projects total',
            'Free subdomain (you.yenze.io)',
            '5,000 monthly page views',
            '50MB storage',
            'All integrations (Web3Forms, Loops.so)',
            'Email support',
            'Remove YENZE branding',
            'SSL certificate included'
        ],
        limits: {
            maxPages: 3,
            maxProjects: 3,
            maxViews: 5000,
            maxStorage: 52428800, // 50MB
            customDomain: false,
            removeBranding: true,
            analytics: false
        },
        deploymentType: 'subdomain',
        maxDomains: 0,
        badge: false,
        popular: true,
        badge_text: 'Most Popular',
        cta: 'Start Building',
        savings: 'Save $0.10/mo'
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 83.88, // $6.99/mo × 12
        period: 'year',
        priceId: 'price_pro_yearly', // TODO: Create in Stripe
        monthlyPrice: 6.99,
        monthlyPriceId: 'price_pro_monthly', // TODO: Create in Stripe
        features: [
            'Unlimited pages per project',
            '10 projects total',
            'Free subdomain + 1 custom domain',
            '25,000 monthly page views',
            '500MB storage',
            'All integrations + premium',
            'Priority email support',
            'Remove all YENZE branding',
            'Analytics dashboard',
            'Custom domain (yourbrand.com)',
            'Automatic SSL certificates'
        ],
        limits: {
            maxPages: -1, // unlimited
            maxProjects: 10,
            maxViews: 25000,
            maxStorage: 524288000, // 500MB
            customDomain: true,
            removeBranding: true,
            analytics: true
        },
        deploymentType: 'custom',
        maxDomains: 1,
        badge: false,
        popular: false,
        cta: 'Go Pro',
        savings: 'Save $1/mo'
    },
    BUSINESS: {
        id: 'business',
        name: 'Business',
        price: 179.88, // $14.99/mo × 12
        period: 'year',
        priceId: 'price_business_yearly', // TODO: Create in Stripe
        monthlyPrice: 14.99,
        monthlyPriceId: 'price_business_monthly', // TODO: Create in Stripe
        features: [
            'Unlimited pages',
            'Unlimited projects',
            'Multiple custom domains',
            '100,000 monthly page views',
            '2GB storage',
            'All integrations + API access',
            'Priority support (24h response)',
            'Complete white-label',
            'Advanced analytics',
            'Team collaboration (coming soon)',
            'Custom branding in editor',
            'API access for automation'
        ],
        limits: {
            maxPages: -1,
            maxProjects: -1, // unlimited
            maxViews: 100000,
            maxStorage: 2147483648, // 2GB
            customDomain: true,
            multipleCustomDomains: true,
            removeBranding: true,
            analytics: true,
            whitelabel: true,
            apiAccess: true
        },
        deploymentType: 'custom',
        maxDomains: 999,
        badge: false,
        popular: false,
        badge_text: 'Best Value',
        cta: 'Scale Up',
        savings: 'Save $5/mo'
    }
};
