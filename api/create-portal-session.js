// API Route: /api/create-portal-session
// Creates a Stripe Customer Portal session for managing subscriptions

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing user ID' });
        }

        // Get user's Stripe customer ID from any active subscription
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .limit(1);

        if (error || !subscriptions || subscriptions.length === 0 || !subscriptions[0]?.stripe_customer_id) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        const subscription = subscriptions[0];

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `https://builder.yenze.io/dashboard`,
        });

        res.status(200).json({ url: portalSession.url });

    } catch (error) {
        console.error('Portal session error:', error);
        res.status(500).json({ error: error.message });
    }
}
