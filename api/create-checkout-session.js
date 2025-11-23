// API Route: /api/create-checkout-session
// Creates a Stripe checkout session for purchasing plans

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Price IDs for each plan
const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER || 'price_1SWi7yIDLJ66zkJzH1MJXNY6',
    pro: process.env.STRIPE_PRICE_PRO || 'price_1SWiCYIDLJ66zkJzlw0IY25L',
    business: process.env.STRIPE_PRICE_BUSINESS || 'price_1SWiDFIDLJ66zkJzyNmDga03'
};

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { plan, userId, email } = req.body;

        console.log('[Checkout] Request received:', { plan, userId, email });

        // Validate input
        if (!plan || !userId || !email) {
            console.error('[Checkout] Missing required fields:', { plan, userId, email });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('[Checkout] Available price IDs:', PRICE_IDS);
        console.log('[Checkout] Looking for plan:', plan);

        if (!PRICE_IDS[plan]) {
            console.error('[Checkout] Invalid plan:', plan);
            return res.status(400).json({
                error: 'Invalid plan',
                availablePlans: Object.keys(PRICE_IDS),
                requestedPlan: plan
            });
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
        console.log('[Checkout] Creating Stripe session with:', {
            customerId,
            priceId: PRICE_IDS[plan],
            plan
        });

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

        console.log('[Checkout] Session created successfully:', session.id);
        res.status(200).json({ sessionId: session.id });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}
