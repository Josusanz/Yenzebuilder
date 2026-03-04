// API Route: /api/create-portal-session
// Creates a Stripe Customer Portal session for managing subscriptions

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, email, returnUrl } = req.body;

        if (!userId && !email) {
            return res.status(400).json({ error: 'Missing user ID or email' });
        }

        console.log('[Portal] Creating session for:', { userId, email });

        let stripeCustomerId = null;

        // First try to find by email (supports anonymous users)
        if (email) {
            const { data: subByEmail } = await supabase
                .from('subscriptions')
                .select('stripe_customer_id')
                .eq('email', email)
                .eq('status', 'active')
                .limit(1)
                .single();

            if (subByEmail?.stripe_customer_id) {
                stripeCustomerId = subByEmail.stripe_customer_id;
            }
        }

        // Fallback to userId lookup
        if (!stripeCustomerId && userId) {
            const { data: subByUser } = await supabase
                .from('subscriptions')
                .select('stripe_customer_id')
                .eq('user_id', userId)
                .eq('status', 'active')
                .limit(1)
                .single();

            if (subByUser?.stripe_customer_id) {
                stripeCustomerId = subByUser.stripe_customer_id;
            }
        }

        if (!stripeCustomerId) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        // Determine return URL
        const finalReturnUrl = returnUrl || 'https://yenze.io/my-sites';

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: finalReturnUrl,
        });

        console.log('[Portal] Session created:', portalSession.url);
        res.status(200).json({ url: portalSession.url });

    } catch (error) {
        console.error('Portal session error:', error);
        res.status(500).json({ error: error.message });
    }
};
