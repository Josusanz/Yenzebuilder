const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`/dashboard?error=${error_description || error}`);
    }

    if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
    }

    try {
        // 1. Exchange the authorization code for an access token and connected account ID
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        });

        const connectedAccountId = response.stripe_user_id;

        // 2. We need to identify the user. 
        // Assuming state = userId for now (legacy implementation)
        const userId = state;

        if (!userId) {
            throw new Error('User ID not found in state');
        }

        // 3. Update Supabase user with the connected account ID
        const { data, error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { stripe_account_id: connectedAccountId } }
        );

        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw updateError;
        }

        // 4. Redirect back to dashboard
        res.redirect('/dashboard#payments');

    } catch (err) {
        console.error('Stripe Callback Error:', err);
        res.redirect(`/dashboard?error=stripe_connection_failed`);
    }
};
