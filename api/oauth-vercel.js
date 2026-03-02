// Vercel OAuth Flow
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel OAuth configuration
const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/oauth-vercel-callback`
    : 'http://localhost:3000/api/oauth-vercel-callback';

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            // Get user ID from query
            const userId = req.query.userId;

            if (!userId) {
                return res.status(400).json({ error: 'User ID required' });
            }

            // Generate state for CSRF protection
            const state = Buffer.from(JSON.stringify({
                userId,
                timestamp: Date.now(),
                nonce: Math.random().toString(36).substring(7)
            })).toString('base64');

            // Store state temporarily
            await supabase
                .from('oauth_states')
                .insert({
                    state,
                    user_id: userId,
                    provider: 'vercel',
                    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
                });

            // Vercel OAuth authorization URL
            const authUrl = new URL('https://vercel.com/integrations/new');
            authUrl.searchParams.set('client_id', VERCEL_CLIENT_ID);
            authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
            authUrl.searchParams.set('state', state);

            // Redirect to Vercel OAuth
            res.redirect(authUrl.toString());

        } catch (error) {
            console.error('OAuth initiation error:', error);
            res.status(500).json({ error: 'Failed to initiate OAuth' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
