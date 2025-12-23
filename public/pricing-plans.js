// YENZE Pricing Plans Configuration
// Ultra-competitive pricing with Framer-style design

const PRICING_PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceId: null,
        interval: 'forever',
        features: {
            pages: 1,
            subdomain: true,
            customDomain: false,
            monthlyViews: 1000,
            storage: 10, // MB
            branding: true,
            integrations: ['basic'],
            support: 'community',
            projects: 1
        },
        limits: {
            maxPages: 1,
            maxProjects: 1,
            maxViews: 1000,
            maxStorage: 10485760, // 10MB in bytes
            customDomain: false,
            removeBranding: false,
            advancedIntegrations: false
        },
        description: 'For hobby projects',
        popular: false,
        cta: 'Get Started',
        displayFeatures: [
            '1 Website',
            'yenze.io subdomain',
            '1K visitors/mo',
            '10MB storage'
        ]
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 2.99,
        priceId: 'price_1SWi7yIDLJ66zkJzH1MJXNY6',
        interval: 'month',
        features: {
            pages: 3,
            subdomain: true,
            customDomain: true,
            monthlyViews: 5000,
            storage: 50, // MB
            branding: false,
            integrations: ['basic', 'forms', 'newsletter'],
            support: 'email',
            projects: 3
        },
        limits: {
            maxPages: 3,
            maxProjects: 3,
            maxViews: 5000,
            maxStorage: 52428800, // 50MB in bytes
            customDomain: true,
            removeBranding: true,
            advancedIntegrations: false
        },
        description: 'For personal sites',
        popular: true,
        cta: 'Start Building',
        badge: 'POPULAR',
        displayFeatures: [
            '3 Websites',
            '1 Custom Domain',
            '5K visitors/mo',
            '50MB storage',
            'Remove Branding'
        ]
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 6.99,
        priceId: 'price_1SWiCYIDLJ66zkJzlw0IY25L',
        interval: 'month',
        features: {
            pages: 'unlimited',
            subdomain: true,
            customDomain: true,
            monthlyViews: 25000,
            storage: 500, // MB
            branding: false,
            integrations: ['all'],
            support: 'priority',
            projects: 10,
            analytics: true
        },
        limits: {
            maxPages: -1, // -1 = unlimited
            maxProjects: 10,
            maxViews: 25000,
            maxStorage: 524288000, // 500MB in bytes
            customDomain: true,
            removeBranding: true,
            advancedIntegrations: true,
            analytics: true
        },
        description: 'For professionals',
        popular: false,
        cta: 'Go Pro',
        displayFeatures: [
            '10 Websites',
            'Custom Domain',
            '25K visitors/mo',
            'Analytics'
        ]
    },
    business: {
        id: 'business',
        name: 'Business',
        price: 14.99,
        priceId: 'price_1SWiDFIDLJ66zkJzyNmDga03',
        interval: 'month',
        features: {
            pages: 'unlimited',
            subdomain: true,
            customDomain: true,
            monthlyViews: 100000,
            storage: 2048, // 2GB
            branding: false,
            integrations: ['all'],
            support: 'priority',
            projects: -1, // unlimited
            analytics: true,
            whiteLabel: true
        },
        limits: {
            maxPages: -1, // unlimited
            maxProjects: -1, // unlimited
            maxViews: 100000,
            maxStorage: 2147483648, // 2GB in bytes
            customDomain: true,
            removeBranding: true,
            advancedIntegrations: true,
            analytics: true,
            whiteLabel: true
        },
        description: 'For agencies & teams',
        popular: false,
        cta: 'Scale Up',
        displayFeatures: [
            'Unlimited Sites',
            'Multiple Domains',
            '100K visitors/mo',
            'White-label'
        ]
    }
};

// Helper function to get plan details
function getPlanDetails(planId) {
    return PRICING_PLANS[planId] || PRICING_PLANS.free;
}

// Helper function to check if user can perform action based on plan
function canPerformAction(userPlan, action) {
    const plan = getPlanDetails(userPlan);

    switch(action) {
        case 'custom_domain':
            return plan.limits.customDomain;
        case 'remove_branding':
            return plan.limits.removeBranding;
        case 'analytics':
            return plan.limits.analytics;
        case 'white_label':
            return plan.limits.whiteLabel;
        default:
            return false;
    }
}

// Helper function to get readable limits
function getReadableLimits(planId) {
    const plan = getPlanDetails(planId);
    return {
        projects: plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects,
        pages: plan.limits.maxPages === -1 ? 'Unlimited' : plan.limits.maxPages,
        views: plan.limits.maxViews.toLocaleString(),
        storage: `${plan.features.storage >= 1024 ? (plan.features.storage / 1024).toFixed(0) + 'GB' : plan.features.storage + 'MB'}`
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRICING_PLANS, getPlanDetails, canPerformAction, getReadableLimits };
}
