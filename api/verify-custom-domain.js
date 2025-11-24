// API endpoint to verify custom domain status
// Checks Vercel and updates database

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

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

    // Verify Vercel configuration
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return res.status(500).json({
        error: 'Vercel configuration missing',
        details: 'Please configure VERCEL_TOKEN and VERCEL_PROJECT_ID'
      });
    }

    // Check status with Vercel
    try {
      const vercelUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${customDomain.domain}?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${customDomain.domain}`;

      const vercelResponse = await fetch(vercelUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const vercelResult = await vercelResponse.json();

      if (!vercelResponse.ok) {
        console.error('[Verify Domain] Vercel error:', vercelResult);
        return res.status(500).json({
          error: 'Failed to verify domain',
          details: vercelResult.error?.message || 'Unknown error'
        });
      }

      const isVerified = vercelResult.verified === true;
      const verificationRecords = vercelResult.verification || [];

      // Update database with new status
      const { data: updatedDomain, error: updateError } = await supabase
        .from('custom_domains')
        .update({
          vercel_verified: isVerified,
          verification_record: verificationRecords[0] || null,
          status: isVerified ? 'active' : 'pending',
          verified_at: isVerified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
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
        vercel: {
          verified: isVerified,
          verification: verificationRecords
        },
        message: isVerified
          ? 'Domain is active and SSL is configured'
          : 'Domain is pending verification. Please ensure DNS is configured correctly.',
        dnsInstructions: !isVerified && verificationRecords.length > 0 ? {
          type: verificationRecords[0].type || 'CNAME',
          name: verificationRecords[0].domain || customDomain.domain,
          value: verificationRecords[0].value || customDomain.cname_target
        } : null
      });

    } catch (vercelError) {
      console.error('[Verify Domain] Vercel API error:', vercelError);
      return res.status(500).json({
        error: 'Failed to communicate with Vercel',
        details: vercelError.message
      });
    }

  } catch (error) {
    console.error('[Verify Domain] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
