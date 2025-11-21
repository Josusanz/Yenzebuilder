// API Route: /api/create-checkout-session
// Creates a Stripe checkout session for purchasing plans

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Price IDs for each plan (you'll get these from Stripe Dashboard)
const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO
};

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { plan, userId, email } = req.body;

        // Validate input
        if (!plan || !userId || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!PRICE_IDS[plan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Check if user already has an active subscription
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (existingSub && plan === 'pro') {
            return res.status(400).json({ error: 'User already has an active subscription' });
        }

        // Create or retrieve Stripe customer
        let customerId;
        const { data: existingCustomer } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (existingCustomer?.stripe_customer_id) {
            customerId = existingCustomer.stripe_customer_id;
        } else {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    supabase_user_id: userId
                }
            });
            customerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICE_IDS[plan],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/dashboard.html?canceled=true`,
            metadata: {
                user_id: userId,
                plan: plan
            },
            allow_promotion_codes: true,
        });

        res.status(200).json({ sessionId: session.id });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}
