// API Route: /api/creator-onboarding
// Creates Stripe Connect onboarding link for template creators

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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, name, website } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        console.log('[CreatorOnboarding] Starting for:', email);

        // Check if creator already exists
        const { data: existingCreator } = await supabase
            .from('creators')
            .select('*')
            .eq('email', email)
            .single();

        let stripeAccountId;

        if (existingCreator?.stripe_account_id) {
            // Creator exists, use existing account
            stripeAccountId = existingCreator.stripe_account_id;
            console.log('[CreatorOnboarding] Existing creator:', stripeAccountId);
        } else {
            // Create new Stripe Connect account
            const account = await stripe.accounts.create({
                type: 'express',
                email: email,
                metadata: {
                    creator_name: name,
                    website: website || ''
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            stripeAccountId = account.id;
            console.log('[CreatorOnboarding] Created Stripe account:', stripeAccountId);

            // Save creator to database
            await supabase.from('creators').upsert({
                email: email,
                name: name,
                website: website || null,
                stripe_account_id: stripeAccountId,
                status: 'pending',
                created_at: new Date().toISOString()
            }, { onConflict: 'email' });
        }

        // Create onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: 'https://yenze.io/creators/onboarding?refresh=true',
            return_url: 'https://yenze.io/creators/success',
            type: 'account_onboarding',
        });

        console.log('[CreatorOnboarding] Onboarding link created');

        res.status(200).json({
            url: accountLink.url,
            accountId: stripeAccountId
        });

    } catch (error) {
        console.error('[CreatorOnboarding] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
