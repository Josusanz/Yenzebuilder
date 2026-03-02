// Cloudflare OAuth Callback
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CLOUDFLARE_CLIENT_ID = process.env.CLOUDFLARE_CLIENT_ID;
const CLOUDFLARE_CLIENT_SECRET = process.env.CLOUDFLARE_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/oauth-cloudflare-callback`
    : 'http://localhost:3000/api/oauth-cloudflare-callback';

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, state, error: oauthError } = req.query;

        // Check for OAuth errors
        if (oauthError) {
            return res.redirect(`/builder?error=cloudflare_oauth_failed&message=${encodeURIComponent(oauthError)}`);
        }

        if (!code || !state) {
            return res.redirect('/builder?error=missing_oauth_params');
        }

        // Verify state
        const { data: stateRecord, error: stateError } = await supabase
            .from('oauth_states')
            .select('*')
            .eq('state', state)
            .eq('provider', 'cloudflare')
            .single();

        if (stateError || !stateRecord) {
            return res.redirect('/builder?error=invalid_state');
        }

        // Check if state expired
        if (new Date(stateRecord.expires_at) < new Date()) {
            await supabase.from('oauth_states').delete().eq('state', state);
            return res.redirect('/builder?error=state_expired');
        }

        const userId = stateRecord.user_id;

        // Delete used state
        await supabase.from('oauth_states').delete().eq('state', state);

        // Exchange code for access token
        const tokenResponse = await fetch('https://dash.cloudflare.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: CLOUDFLARE_CLIENT_ID,
                client_secret: CLOUDFLARE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('Token exchange error:', errorData);
            return res.redirect('/builder?error=token_exchange_failed');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokenData;

        // Get account ID using the access token
        const accountsResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!accountsResponse.ok) {
            return res.redirect('/builder?error=failed_to_get_account');
        }

        const accountsData = await accountsResponse.json();
        const accountId = accountsData.result?.[0]?.id;

        if (!accountId) {
            return res.redirect('/builder?error=no_account_found');
        }

        // Store tokens in database (encrypted)
        await supabase
            .from('oauth_integrations')
            .upsert({
                user_id: userId,
                provider: 'cloudflare',
                access_token,
                refresh_token,
                account_id: accountId,
                expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            });

        // Redirect back to builder with success
        res.redirect('/builder?cloudflare_connected=true');

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/builder?error=oauth_callback_failed');
    }
};
