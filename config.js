// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_CONFIG = {
    url: 'https://xssdcphepracobbsvqmg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2RjcGhlcHJhY29iYnN2cW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDYsImV4cCI6MjA3OTE4NjcwNn0.Z3w9P2dMeNu2J-2AcnxhLVSF_p794JZgIcAKMqkT3-A'
};

// Stripe Configuration
const STRIPE_CONFIG = {
    publicKey: 'YOUR_STRIPE_PUBLIC_KEY'
};

// Plans Configuration
const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        features: [
            'Unlimited editing',
            'Deploy to yenze subdomain',
            'Includes "Made with YENZE" badge',
            'Basic analytics'
        ],
        deploymentType: 'subdomain' // proyecto.yenze.app
    },
    PRO: {
        name: 'Pro',
        price: 9.99,
        priceId: 'price_xxxxx', // Stripe Price ID
        features: [
            'Everything in Free',
            'Custom domain support',
            'Download HTML/ZIP',
            'Remove YENZE badge',
            '5 projects',
            'Analytics dashboard',
            'Priority support'
        ],
        deploymentType: 'custom' // user's domain
    },
    BUSINESS: {
        name: 'Business',
        price: 29.99,
        priceId: 'price_xxxxx', // Stripe Price ID
        features: [
            'Everything in Pro',
            'Unlimited projects',
            'White label',
            'Multiple custom domains',
            'Custom code injection',
            'Advanced analytics',
            'API access',
            'Team collaboration',
            '24/7 priority support'
        ],
        deploymentType: 'custom'
    }
};
