// API endpoint to verify custom domain status
// Checks Cloudflare and updates database

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { domainId } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    // Get domain from database
    const { data: customDomain, error: dbError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !customDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    console.log(`[Verify Domain] Checking status for: ${customDomain.domain}`);

    // If no Cloudflare ID, can't verify
    if (!customDomain.cloudflare_id || !CLOUDFLARE_API_TOKEN) {
      return res.status(400).json({
        error: 'Domain not configured with Cloudflare',
        status: customDomain.status
      });
    }

    // Check status with Cloudflare
    try {
      const cloudflareResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${customDomain.cloudflare_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const cloudflareResult = await cloudflareResponse.json();

      if (!cloudflareResult.success) {
        console.error('[Verify Domain] Cloudflare error:', cloudflareResult.errors);
        return res.status(500).json({
          error: 'Failed to verify domain',
          details: cloudflareResult.errors
        });
      }

      const cfData = cloudflareResult.result;
      const isActive = cfData.status === 'active';
      const sslActive = cfData.ssl?.status === 'active';

      // Update database with new status
      const { data: updatedDomain, error: updateError } = await supabase
        .from('custom_domains')
        .update({
          cloudflare_status: cfData.status,
          ssl_status: cfData.ssl?.status,
          verification_errors: cfData.verification_errors || [],
          status: isActive && sslActive ? 'active' : 'pending',
          verified_at: isActive && sslActive ? new Date().toISOString() : null
        })
        .eq('id', domainId)
        .select()
        .single();

      if (updateError) {
        console.error('[Verify Domain] Update error:', updateError);
        return res.status(500).json({ error: 'Failed to update domain status' });
      }

      console.log(`[Verify Domain] Status updated: ${updatedDomain.status}`);

      return res.status(200).json({
        success: true,
        domain: updatedDomain,
        cloudflare: {
          status: cfData.status,
          ssl_status: cfData.ssl?.status,
          verification_errors: cfData.verification_errors || []
        },
        message: isActive && sslActive
          ? 'Domain is active and SSL is configured'
          : 'Domain is pending verification. Please ensure DNS is configured correctly.'
      });

    } catch (cfError) {
      console.error('[Verify Domain] Cloudflare API error:', cfError);
      return res.status(500).json({
        error: 'Failed to communicate with Cloudflare',
        details: cfError.message
      });
    }

  } catch (error) {
    console.error('[Verify Domain] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
