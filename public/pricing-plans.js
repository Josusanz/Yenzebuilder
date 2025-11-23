// YENZE Pricing Plans Configuration
// Ultra-competitive pricing for maximum conversions

const PRICING_PLANS = {
    free: {
        id: 'free',
        name: 'FREE',
        price: 0,
        priceId: null, // No Stripe price ID needed
        interval: 'forever',
        features: {
            pages: 1,
            subdomain: true,
            customDomain: false,
            monthlyViews: 1000,
            storage: 10, // MB
            branding: true, // Shows "Built with YENZE"
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
        description: 'Perfect for personal portfolios and testing',
        popular: false,
        cta: 'Get Started Free'
    },
    starter: {
        id: 'starter',
        name: 'STARTER',
        price: 2.99,
        priceId: 'price_starter_monthly', // Will create in Stripe
        interval: 'month',
        features: {
            pages: 3,
            subdomain: true,
            customDomain: false,
            monthlyViews: 5000,
            storage: 50, // MB
            branding: false, // No YENZE branding
            integrations: ['basic', 'forms', 'newsletter'],
            support: 'email',
            projects: 3
        },
        limits: {
            maxPages: 3,
            maxProjects: 3,
            maxViews: 5000,
            maxStorage: 52428800, // 50MB in bytes
            customDomain: false,
            removeBranding: true,
            advancedIntegrations: false
        },
        description: 'For freelancers and small businesses',
        popular: true,
        cta: 'Start Building',
        badge: 'Most Popular'
    },
    pro: {
        id: 'pro',
        name: 'PRO',
        price: 6.99,
        priceId: 'price_pro_monthly', // Will create in Stripe
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
        description: 'For growing businesses and professionals',
        popular: false,
        cta: 'Go Pro'
    },
    business: {
        id: 'business',
        name: 'BUSINESS',
        price: 14.99,
        priceId: 'price_business_monthly', // Will create in Stripe
        interval: 'month',
        features: {
            pages: 'unlimited',
            subdomain: true,
            customDomain: 'multiple',
            monthlyViews: 100000,
            storage: 2000, // MB (2GB)
            branding: false,
            integrations: ['all'],
            support: 'priority',
            projects: 'unlimited',
            analytics: true,
            whitelabel: true,
            api: true
        },
        limits: {
            maxPages: -1,
            maxProjects: -1, // unlimited
            maxViews: 100000,
            maxStorage: 2097152000, // 2GB in bytes
            customDomain: true,
            multipleCustomDomains: true,
            removeBranding: true,
            advancedIntegrations: true,
            analytics: true,
            whitelabel: true,
            apiAccess: true
        },
        description: 'For agencies and power users',
        popular: false,
        cta: 'Scale Up',
        badge: 'Best Value'
    }
};

// Feature descriptions for UI
const FEATURE_DESCRIPTIONS = {
    pages: {
        icon: '📄',
        name: 'Pages per Project',
        tooltip: 'Number of individual pages you can create in each project'
    },
    subdomain: {
        icon: '🌐',
        name: 'Free Subdomain',
        tooltip: 'Get a free yourname.yenze.io subdomain'
    },
    customDomain: {
        icon: '🔗',
        name: 'Custom Domain',
        tooltip: 'Connect your own domain (yourbrand.com)'
    },
    monthlyViews: {
        icon: '👁️',
        name: 'Monthly Page Views',
        tooltip: 'Number of times your pages can be viewed per month'
    },
    storage: {
        icon: '💾',
        name: 'Storage',
        tooltip: 'Total storage for images and assets'
    },
    branding: {
        icon: '✨',
        name: 'YENZE Branding',
        tooltip: 'Small "Built with YENZE" badge on your site'
    },
    integrations: {
        icon: '🔌',
        name: 'Integrations',
        tooltip: 'Connect forms, newsletters, analytics and more'
    },
    support: {
        icon: '💬',
        name: 'Support',
        tooltip: 'How quickly we respond to your questions'
    },
    projects: {
        icon: '📁',
        name: 'Projects',
        tooltip: 'Number of separate websites you can create'
    },
    analytics: {
        icon: '📊',
        name: 'Analytics',
        tooltip: 'Track visitors and page performance'
    },
    whitelabel: {
        icon: '🏷️',
        name: 'White Label',
        tooltip: 'Complete removal of YENZE branding, even in editor'
    },
    api: {
        icon: '⚡',
        name: 'API Access',
        tooltip: 'Programmatic access to manage your sites'
    }
};

// Helper functions
function getPlanById(planId) {
    return PRICING_PLANS[planId] || PRICING_PLANS.free;
}

function canUserPerformAction(userPlan, action, currentUsage) {
    const plan = getPlanById(userPlan);

    switch(action) {
        case 'create_page':
            if (plan.limits.maxPages === -1) return true;
            return currentUsage.pages < plan.limits.maxPages;

        case 'create_project':
            if (plan.limits.maxProjects === -1) return true;
            return currentUsage.projects < plan.limits.maxProjects;

        case 'add_custom_domain':
            return plan.limits.customDomain === true;

        case 'remove_branding':
            return plan.limits.removeBranding === true;

        case 'use_advanced_integrations':
            return plan.limits.advancedIntegrations === true;

        case 'view_analytics':
            return plan.limits.analytics === true;

        case 'api_access':
            return plan.limits.apiAccess === true;

        default:
            return false;
    }
}

function getUpgradeMessage(userPlan, action) {
    const messages = {
        create_page: {
            free: 'Upgrade to STARTER ($2.99/mo) to create up to 3 pages!',
            starter: 'Upgrade to PRO ($6.99/mo) for unlimited pages!',
            pro: 'You already have unlimited pages!'
        },
        create_project: {
            free: 'Upgrade to STARTER ($2.99/mo) to create up to 3 projects!',
            starter: 'Upgrade to PRO ($6.99/mo) for 10 projects!',
            pro: 'Upgrade to BUSINESS ($14.99/mo) for unlimited projects!'
        },
        add_custom_domain: {
            free: 'Upgrade to PRO ($6.99/mo) to use your custom domain!',
            starter: 'Upgrade to PRO ($6.99/mo) to use your custom domain!'
        },
        remove_branding: {
            free: 'Upgrade to STARTER ($2.99/mo) to remove YENZE branding!'
        },
        use_advanced_integrations: {
            free: 'Upgrade to PRO ($6.99/mo) for advanced integrations!',
            starter: 'Upgrade to PRO ($6.99/mo) for advanced integrations!'
        }
    };

    return messages[action]?.[userPlan] || 'Upgrade to unlock this feature!';
}

// Calculate cost per client for internal use
function calculateCostPerClient(planId, clientCount) {
    const vercelCostPerMonth = 20; // Vercel Pro
    const bandwidthIncluded = 100 * 1024 * 1024 * 1024; // 100GB in bytes

    const plan = getPlanById(planId);
    const avgPageSize = 500 * 1024; // 500KB per page
    const bandwidthPerClient = plan.limits.maxViews * avgPageSize;

    const totalBandwidth = bandwidthPerClient * clientCount;

    if (totalBandwidth <= bandwidthIncluded) {
        return {
            costPerClient: vercelCostPerMonth / clientCount,
            totalCost: vercelCostPerMonth,
            withinLimit: true
        };
    } else {
        const extraGB = (totalBandwidth - bandwidthIncluded) / (1024 * 1024 * 1024);
        const extraCost = extraGB * 0.15; // $0.15 per GB
        const totalCost = vercelCostPerMonth + extraCost;

        return {
            costPerClient: totalCost / clientCount,
            totalCost: totalCost,
            withinLimit: false,
            extraBandwidth: extraGB
        };
    }
}
