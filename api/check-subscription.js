// API Route: /api/check-subscription
// Returns the subscription status for a user by email

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan features configuration
const PLAN_FEATURES = {
    free: {
        maxProjects: 3,
        customSubdomain: false,
        removeBranding: false,
        customDomain: false,
        analytics: false,
        seoTools: false,
        teamCollaboration: false,
        apiAccess: false
    },
    starter: {
        maxProjects: 5,
        customSubdomain: true,
        removeBranding: true,
        customDomain: true,
        maxDomains: 1,
        analytics: false,
        seoTools: false,
        teamCollaboration: false,
        apiAccess: false
    },
    pro: {
        maxProjects: 20,
        customSubdomain: true,
        removeBranding: true,
        customDomain: true,
        maxDomains: 3,
        analytics: true,
        seoTools: true,
        teamCollaboration: false,
        apiAccess: false
    },
    business: {
        maxProjects: -1, // unlimited
        customSubdomain: true,
        removeBranding: true,
        customDomain: true,
        maxDomains: 10,
        analytics: true,
        seoTools: true,
        teamCollaboration: true,
        apiAccess: true
    }
};

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('[CheckSubscription] Checking for:', email);

        // Find subscription by email
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('email', email)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('[CheckSubscription] Database error:', error);
            throw error;
        }

        if (subscription) {
            const plan = subscription.plan || 'free';
            const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;

            console.log('[CheckSubscription] Found subscription:', plan);

            res.status(200).json({
                hasSubscription: true,
                plan: plan,
                status: subscription.status,
                features: features,
                periodEnd: subscription.current_period_end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            });
        } else {
            console.log('[CheckSubscription] No active subscription found');

            res.status(200).json({
                hasSubscription: false,
                plan: 'free',
                status: 'none',
                features: PLAN_FEATURES.free
            });
        }

    } catch (error) {
        console.error('[CheckSubscription] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
