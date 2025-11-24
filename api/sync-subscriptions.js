// API Route: /api/sync-subscriptions
// Manually sync subscriptions with Stripe (in case webhook fails)

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

        // Get all subscriptions for this user from database
        const { data: dbSubscriptions, error: dbError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        // Check each subscription status in Stripe
        for (const dbSub of dbSubscriptions) {
            if (dbSub.stripe_subscription_id) {
                try {
                    // Get subscription from Stripe
                    const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);

                    // If canceled or expired in Stripe, delete from database
                    if (stripeSub.status === 'canceled' || stripeSub.status === 'incomplete_expired') {
                        await supabase
                            .from('subscriptions')
                            .delete()
                            .eq('id', dbSub.id);

                        console.log(`Deleted canceled subscription: ${dbSub.id}`);
                    } else {
                        // Update with latest Stripe data
                        await supabase
                            .from('subscriptions')
                            .update({
                                status: stripeSub.status,
                                current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
                                current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
                                cancel_at_period_end: stripeSub.cancel_at_period_end,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', dbSub.id);
                    }
                } catch (stripeError) {
                    // If subscription not found in Stripe, delete from database
                    if (stripeError.code === 'resource_missing') {
                        await supabase
                            .from('subscriptions')
                            .delete()
                            .eq('id', dbSub.id);

                        console.log(`Deleted non-existent subscription: ${dbSub.id}`);
                    } else {
                        throw stripeError;
                    }
                }
            }
        }

        res.status(200).json({ success: true, message: 'Subscriptions synced successfully' });

    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: error.message });
    }
}
