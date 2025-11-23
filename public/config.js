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

// Plans Configuration
const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        period: null,
        priceId: null,
        features: [
            '1 project',
            'Share via yenze.io/s/your-site',
            'Includes "Powered by YENZE" badge',
            'Basic analytics (views)'
        ],
        deploymentType: 'path', // yenze.io/s/slug
        maxDomains: 0,
        maxProjects: 1,
        badge: true
    },
    STARTER: {
        name: 'Starter',
        price: 12.00,
        period: 'year',
        priceId: 'price_1SVkywIDLJ66zkJzfqKZBxhz',
        features: [
            'Everything in Free',
            '3 projects',
            '1 custom domain (example.com)',
            'Remove YENZE badge',
            'Automatic DNS configuration',
            'SSL certificate included',
            'Basic analytics dashboard',
            'Email support'
        ],
        deploymentType: 'custom', // example.com
        maxDomains: 1,
        maxProjects: 3,
        badge: false
    },
    PRO: {
        name: 'Pro',
        price: 49.00,
        period: 'year',
        priceId: 'price_1SVl01IDLJ66zkJzDjhViJZA',
        features: [
            'Everything in Starter',
            'Unlimited projects',
            '3 custom domains',
            'Priority DNS propagation',
            'Advanced analytics dashboard',
            'Custom domain management',
            'Priority support',
            'White-label (no YENZE branding)',
            'API access'
        ],
        deploymentType: 'custom', // example.com
        maxDomains: 3,
        maxProjects: 999,
        badge: false
    }
};
