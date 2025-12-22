/**
 * Verify Checkout Session
 * Validates a Stripe checkout session and updates user subscription
 */

const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Checkout session not found' });
        }

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                error: 'Payment not completed',
                status: session.payment_status
            });
        }

        // Get the subscription details
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email;

        // Get user by email
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', customerEmail)
            .single();

        if (userError || !users) {
            console.error('User not found:', customerEmail);
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = users.id;

        // Extract plan from metadata or line items
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
        const planMetadata = lineItems.data[0]?.price?.metadata?.plan || 'starter';

        // Create or update subscription in database
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan: planMetadata,
                status: 'active',
                current_period_start: new Date(session.created * 1000).toISOString(),
                current_period_end: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (subError) {
            console.error('Error creating subscription:', subError);
            return res.status(500).json({ error: 'Failed to create subscription' });
        }

        return res.status(200).json({
            success: true,
            subscription: {
                id: subscription.id,
                plan: subscription.plan,
                status: subscription.status
            },
            message: 'Subscription activated successfully'
        });

    } catch (error) {
        console.error('Verify checkout error:', error);
        return res.status(500).json({
            error: 'Failed to verify checkout',
            details: error.message
        });
    }
}
