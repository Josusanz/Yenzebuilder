// API Route: /api/creator-status
// Check creator's Stripe Connect account status

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { email } = req.query || req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Get creator from database
        const { data: creator, error } = await supabase
            .from('creators')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !creator) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        // Check Stripe account status
        let stripeStatus = 'pending';
        let payoutsEnabled = false;
        let chargesEnabled = false;

        if (creator.stripe_account_id) {
            try {
                const account = await stripe.accounts.retrieve(creator.stripe_account_id);
                payoutsEnabled = account.payouts_enabled;
                chargesEnabled = account.charges_enabled;

                if (payoutsEnabled && chargesEnabled) {
                    stripeStatus = 'active';
                } else if (account.details_submitted) {
                    stripeStatus = 'pending_verification';
                }

                // Update database if status changed
                if (creator.status !== stripeStatus) {
                    await supabase
                        .from('creators')
                        .update({ status: stripeStatus })
                        .eq('email', email);
                }
            } catch (e) {
                console.error('[CreatorStatus] Stripe error:', e.message);
            }
        }

        res.status(200).json({
            email: creator.email,
            name: creator.name,
            status: stripeStatus,
            payoutsEnabled,
            chargesEnabled,
            stripeAccountId: creator.stripe_account_id,
            templatesCount: creator.templates_count || 0,
            totalEarnings: creator.total_earnings || 0,
            createdAt: creator.created_at
        });

    } catch (error) {
        console.error('[CreatorStatus] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
