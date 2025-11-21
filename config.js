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
            'Unlimited editing',
            'Unlimited publishes',
            'Deploy to yenze.app subdomain',
            'Includes "Made with YENZE" badge',
            'Basic analytics (views, visits)'
        ],
        deploymentType: 'subdomain', // proyecto.yenze.app
        maxDomains: 0,
        maxProjects: 999
    },
    ONE_TIME: {
        name: 'Custom Domain',
        price: 7.99,
        period: 'one-time',
        priceId: 'price_1SVheLIDLJ66zkJzd9xC2wlK',
        features: [
            '1 deploy with custom domain',
            'Remove YENZE badge',
            'Basic analytics',
            'SSL certificate included',
            'One-time payment'
        ],
        deploymentType: 'custom',
        maxDomains: 1,
        maxProjects: 1
    },
    PRO: {
        name: 'Pro',
        price: 19.99,
        period: 'year',
        priceId: 'price_1SVheoIDLJ66zkJzV3GkWvRr',
        features: [
            'Everything in Free',
            'Unlimited deploys',
            'Up to 10 custom domains',
            'Remove YENZE badge',
            'Advanced analytics dashboard',
            'Custom domain management',
            'Priority support',
            'SSL certificates for all domains'
        ],
        deploymentType: 'custom',
        maxDomains: 10,
        maxProjects: 999
    }
};
