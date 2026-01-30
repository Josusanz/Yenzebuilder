// API Route: /api/stripe-webhook
// Handles Stripe webhook events (payments, subscriptions)

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { buffer } = require('micro');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper functions for handling events
async function handleCheckoutCompleted(session) {
    const userId = session.metadata.user_id;
    const plan = session.metadata.plan;
    const customerId = session.customer;

    console.log('Checkout completed:', { userId, plan, customerId });

    // For one-time payments
    if (session.mode === 'payment') {
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                plan: plan,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
    }
    // For subscriptions
    else if (session.mode === 'subscription') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                plan: plan,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
    }
}

async function handleSubscriptionUpdated(subscription) {
    const customerId = subscription.customer;

    // Find user by customer ID
    // Note: We might need to handle cases where multiple users might map to same customer (rare/error case)
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!existingSub) {
        console.error('Subscription not found for customer:', customerId);
        return;
    }

    await supabase
        .from('subscriptions')
        .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
    // Soft-delete: Update status to canceled instead of deleting the record
    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

    console.log('Subscription marked as canceled:', subscription.id);
}

async function handlePaymentSucceeded(invoice) {
    // Payment succeeded for subscription renewal
    console.log('Payment succeeded for invoice:', invoice.id);

    if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await handleSubscriptionUpdated(subscription);
    }
}

async function handlePaymentFailed(invoice) {
    // Payment failed for subscription
    console.error('Payment failed for invoice:', invoice.id);

    if (invoice.subscription) {
        await supabase
            .from('subscriptions')
            .update({
                status: 'past_due',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);
    }
}

// Main handler
const handler = async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            buf,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = handler;

// Expo config for Next.js/Vercel raw body
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
