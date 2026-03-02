// Cloudflare OAuth Flow
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cloudflare OAuth configuration
const CLOUDFLARE_CLIENT_ID = process.env.CLOUDFLARE_CLIENT_ID;
const CLOUDFLARE_CLIENT_SECRET = process.env.CLOUDFLARE_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/oauth-cloudflare-callback`
    : 'http://localhost:3000/api/oauth-cloudflare-callback';

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
            // Get user ID from query or session
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

            // Store state temporarily in database
            await supabase
                .from('oauth_states')
                .insert({
                    state,
                    user_id: userId,
                    provider: 'cloudflare',
                    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
                });

            // Cloudflare OAuth authorization URL
            const authUrl = new URL('https://dash.cloudflare.com/oauth2/auth');
            authUrl.searchParams.set('client_id', CLOUDFLARE_CLIENT_ID);
            authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('scope', 'account:read workers_kv:edit workers_scripts:edit pages:edit');

            // Redirect to Cloudflare OAuth
            res.redirect(authUrl.toString());

        } catch (error) {
            console.error('OAuth initiation error:', error);
            res.status(500).json({ error: 'Failed to initiate OAuth' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
