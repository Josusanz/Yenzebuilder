// Vercel OAuth Callback
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/oauth-vercel-callback`
    : 'http://localhost:3000/api/oauth-vercel-callback';

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, state, error: oauthError } = req.query;

        if (oauthError) {
            return res.redirect(`/builder?error=vercel_oauth_failed&message=${encodeURIComponent(oauthError)}`);
        }

        if (!code || !state) {
            return res.redirect('/builder?error=missing_oauth_params');
        }

        // Verify state
        const { data: stateRecord, error: stateError } = await supabase
            .from('oauth_states')
            .select('*')
            .eq('state', state)
            .eq('provider', 'vercel')
            .single();

        if (stateError || !stateRecord) {
            return res.redirect('/builder?error=invalid_state');
        }

        if (new Date(stateRecord.expires_at) < new Date()) {
            await supabase.from('oauth_states').delete().eq('state', state);
            return res.redirect('/builder?error=state_expired');
        }

        const userId = stateRecord.user_id;

        // Delete used state
        await supabase.from('oauth_states').delete().eq('state', state);

        // Exchange code for access token
        const tokenResponse = await fetch('https://api.vercel.com/v2/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code,
                client_id: VERCEL_CLIENT_ID,
                client_secret: VERCEL_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('Token exchange error:', errorData);
            return res.redirect('/builder?error=token_exchange_failed');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, team_id, user_id: vercelUserId } = tokenData;

        // Store token in database
        await supabase
            .from('oauth_integrations')
            .upsert({
                user_id: userId,
                provider: 'vercel',
                access_token,
                account_id: team_id || vercelUserId,
                metadata: { vercel_user_id: vercelUserId, team_id },
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            });

        // Redirect back to builder with success
        res.redirect('/builder?vercel_connected=true');

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/builder?error=oauth_callback_failed');
    }
};
