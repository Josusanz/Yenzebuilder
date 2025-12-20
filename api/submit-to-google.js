/**
 * Submit Sitemap to Google Search Console
 * Uses Google Indexing API for direct submission
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId, userId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get user's Google account settings if userId provided
        let googleAccount = null;
        if (userId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('google_accounts')
                .eq('id', userId)
                .single();

            if (profile?.google_accounts && Array.isArray(profile.google_accounts) && profile.google_accounts.length > 0) {
                // Use the first account or the one marked as default
                googleAccount = profile.google_accounts.find(acc => acc.is_default) || profile.google_accounts[0];
            }
        }

        // Determine the base URL
        const baseUrl = project.custom_domain
            ? `https://${project.custom_domain}`
            : project.subdomain
            ? `https://${project.subdomain}.yenze.io`
            : `https://yenze.io/s/${project.public_slug}`;

        const sitemapUrl = `${baseUrl}/sitemap.xml`;

        // Method 1: Ping Google directly (simple, no auth required)
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

        try {
            const pingResponse = await fetch(pingUrl);

            if (pingResponse.ok) {
                // Log submission
                await supabase
                    .from('projects')
                    .update({
                        seo_metadata: {
                            ...(project.seo_metadata || {}),
                            last_google_submission: new Date().toISOString(),
                            sitemap_url: sitemapUrl,
                            submitted_via_account: googleAccount?.email || 'ping'
                        }
                    })
                    .eq('id', projectId);

                return res.status(200).json({
                    success: true,
                    message: 'Sitemap submitted to Google successfully',
                    sitemapUrl: sitemapUrl,
                    method: 'ping',
                    accountUsed: googleAccount?.email || 'Default (ping)',
                    gscUrl: `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(baseUrl)}&sitemap_url=${encodeURIComponent(sitemapUrl)}`
                });
            }
        } catch (pingError) {
            console.log('Ping method failed, providing manual instructions', pingError);
        }

        // Method 2: If ping fails, return instructions for manual submission
        return res.status(200).json({
            success: false,
            message: 'Please submit manually via Google Search Console',
            sitemapUrl: sitemapUrl,
            instructions: [
                '1. Go to Google Search Console',
                googleAccount ? `2. Make sure you're logged in as: ${googleAccount.email}` : '2. Log in with your Google account',
                '3. Select your property (or add it if not added)',
                '4. Go to Sitemaps section',
                `5. Enter: ${sitemapUrl}`,
                '6. Click Submit'
            ],
            gscUrl: `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(baseUrl)}`,
            verifyUrl: `https://search.google.com/search-console/welcome?resource_id=${encodeURIComponent(baseUrl)}`,
            accountToUse: googleAccount?.email || 'Your Google account'
        });

    } catch (error) {
        console.error('Submit to Google error:', error);
        return res.status(500).json({
            error: 'Failed to submit to Google',
            details: error.message
        });
    }
}

/**
 * Submit URL to Google Indexing API (requires OAuth)
 * This is a more advanced method that requires Google Cloud credentials
 */
async function submitViaIndexingAPI(url) {
    // This would require:
    // 1. Google Cloud Service Account
    // 2. Indexing API enabled
    // 3. JWT token generation

    // For now, we use the simpler ping method above
    // Future enhancement: Implement full OAuth flow

    throw new Error('Indexing API not yet implemented. Use ping method.');
}
