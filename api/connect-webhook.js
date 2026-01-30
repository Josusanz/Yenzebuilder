// API Route: /api/connect-webhook
// Handles Stripe Connect webhooks for creator account updates

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook secret for Connect events (set in Stripe Dashboard)
const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Get raw body for signature verification
        const rawBody = req.body;

        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } else {
            // For testing without signature verification
            event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
            console.log('[ConnectWebhook] Warning: No webhook secret configured');
        }
    } catch (err) {
        console.error('[ConnectWebhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('[ConnectWebhook] Received event:', event.type);

    try {
        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object;
                await handleAccountUpdated(account);
                break;
            }

            case 'account.application.authorized': {
                const account = event.data.object;
                console.log('[ConnectWebhook] Account authorized:', account.id);
                break;
            }

            case 'account.application.deauthorized': {
                const account = event.data.object;
                await handleAccountDeauthorized(account);
                break;
            }

            case 'payout.paid': {
                const payout = event.data.object;
                console.log('[ConnectWebhook] Payout completed:', payout.id, payout.amount / 100);
                break;
            }

            case 'payment_intent.succeeded': {
                // Track template sales
                const paymentIntent = event.data.object;
                if (paymentIntent.transfer_data?.destination) {
                    await handleTemplateSale(paymentIntent);
                }
                break;
            }

            default:
                console.log('[ConnectWebhook] Unhandled event type:', event.type);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[ConnectWebhook] Error processing event:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

async function handleAccountUpdated(account) {
    console.log('[ConnectWebhook] Account updated:', account.id);

    // Determine status
    let status = 'pending';
    if (account.payouts_enabled && account.charges_enabled) {
        status = 'active';
    } else if (account.details_submitted) {
        status = 'pending_verification';
    }

    // Update creator in database
    const { error } = await supabase
        .from('creators')
        .update({
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_account_id', account.id);

    if (error) {
        console.error('[ConnectWebhook] Failed to update creator:', error);
    } else {
        console.log('[ConnectWebhook] Creator status updated to:', status);
    }
}

async function handleAccountDeauthorized(account) {
    console.log('[ConnectWebhook] Account deauthorized:', account.id);

    // Mark creator as suspended
    const { error } = await supabase
        .from('creators')
        .update({
            status: 'suspended',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_account_id', account.id);

    if (error) {
        console.error('[ConnectWebhook] Failed to suspend creator:', error);
    }
}

async function handleTemplateSale(paymentIntent) {
    const creatorAccountId = paymentIntent.transfer_data.destination;
    const amount = paymentIntent.amount / 100;
    const creatorAmount = amount * 0.7; // 70% to creator

    console.log('[ConnectWebhook] Template sale:', {
        total: amount,
        creatorAmount: creatorAmount,
        creatorAccount: creatorAccountId
    });

    // Update creator earnings
    const { data: creator, error: fetchError } = await supabase
        .from('creators')
        .select('total_earnings, templates_count')
        .eq('stripe_account_id', creatorAccountId)
        .single();

    if (fetchError) {
        console.error('[ConnectWebhook] Failed to fetch creator:', fetchError);
        return;
    }

    const { error: updateError } = await supabase
        .from('creators')
        .update({
            total_earnings: (creator.total_earnings || 0) + creatorAmount,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_account_id', creatorAccountId);

    if (updateError) {
        console.error('[ConnectWebhook] Failed to update earnings:', updateError);
    } else {
        console.log('[ConnectWebhook] Updated creator earnings');
    }
}
