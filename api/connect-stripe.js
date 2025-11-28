import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const clientId = process.env.STRIPE_CLIENT_ID;
        const redirectUri = process.env.STRIPE_REDIRECT_URI || 'https://builder.yenze.io/api/stripe-callback';

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Pass userId as state to identify user in callback
        // In production, sign this to prevent tampering
        const state = userId;

        const args = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: 'read_write',
            redirect_uri: redirectUri,
            state: state
        });

        const url = `https://connect.stripe.com/oauth/authorize?${args.toString()}`;

        res.redirect(url);
    } catch (error) {
        console.error('Stripe Connect error:', error);
        res.status(500).json({ error: 'Failed to initiate Stripe Connect' });
    }
}
