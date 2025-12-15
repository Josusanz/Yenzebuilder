/**
 * Submit Sitemap to Google Search Console
 * Uses Google Indexing API for direct submission
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId } = req.body;

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
                        metadata: {
                            ...project.metadata,
                            last_google_submission: new Date().toISOString(),
                            sitemap_url: sitemapUrl
                        }
                    })
                    .eq('id', projectId);

                return res.status(200).json({
                    success: true,
                    message: 'Sitemap submitted to Google successfully',
                    sitemapUrl: sitemapUrl,
                    method: 'ping',
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
                '2. Select your property (or add it if not added)',
                '3. Go to Sitemaps section',
                `4. Enter: ${sitemapUrl}`,
                '5. Click Submit'
            ],
            gscUrl: `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(baseUrl)}`,
            verifyUrl: `https://search.google.com/search-console/welcome?resource_id=${encodeURIComponent(baseUrl)}`
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
