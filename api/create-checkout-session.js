// API Route: /api/create-checkout-session
// Creates a Stripe checkout session for purchasing plans

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

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

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { plan, priceId, userId, email, successUrl, cancelUrl } = req.body;

        console.log('[Checkout] Request received:', { plan, priceId, userId, email });

        // Validate input - email is required, userId is optional for anonymous users
        if (!email) {
            console.error('[Checkout] Missing email');
            return res.status(400).json({ error: 'Email is required' });
        }

        // Determine the price ID - accept direct priceId or look up by plan name
        let finalPriceId = priceId;
        let planName = plan;

        if (!finalPriceId && plan) {
            finalPriceId = PRICE_IDS[plan];
            console.log('[Checkout] Looking up price for plan:', plan, '->', finalPriceId);
        }

        // If priceId was provided directly, find the plan name
        if (priceId && !plan) {
            planName = Object.keys(PRICE_IDS).find(key => PRICE_IDS[key] === priceId) || 'unknown';
        }

        if (!finalPriceId) {
            console.error('[Checkout] Invalid plan or priceId:', { plan, priceId });
            return res.status(400).json({
                error: 'Invalid plan or priceId',
                availablePlans: Object.keys(PRICE_IDS),
                requestedPlan: plan
            });
        }

        // Create or retrieve Stripe customer
        let customerId;

        // First check by email in Stripe
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
            console.log('[Checkout] Found existing Stripe customer:', customerId);
        } else {
            // Create new customer
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    supabase_user_id: userId || 'anonymous',
                    source: 'yenze_dashboard'
                }
            });
            customerId = customer.id;
            console.log('[Checkout] Created new Stripe customer:', customerId);
        }

        // Determine URLs
        const baseUrl = 'https://yenze.io';
        const finalSuccessUrl = successUrl || `${baseUrl}/my-sites?success=true&session_id={CHECKOUT_SESSION_ID}`;
        const finalCancelUrl = cancelUrl || `${baseUrl}/my-sites?canceled=true`;

        // Create checkout session
        console.log('[Checkout] Creating Stripe session with:', {
            customerId,
            priceId: finalPriceId,
            plan: planName
        });

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: finalPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: finalSuccessUrl,
            cancel_url: finalCancelUrl,
            metadata: {
                user_id: userId || 'anonymous',
                email: email,
                plan: planName
            },
            allow_promotion_codes: true,
        });

        console.log('[Checkout] Session created successfully:', session.id);
        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
};
