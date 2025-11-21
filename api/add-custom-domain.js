// API endpoint to add custom domain
// This creates a custom hostname in Cloudflare for SaaS

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cloudflare for SaaS configuration
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authentication token from request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { domain, projectId } = req.body;

    // Validate input
    if (!domain || !projectId) {
      return res.status(400).json({ error: 'Domain and projectId are required' });
    }

    // Normalize domain (remove protocol, www, trailing slash)
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$/;
    if (!domainRegex.test(normalizedDomain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    // Check if domain is already taken
    const { data: existingDomain } = await supabase
      .from('custom_domains')
      .select('id, user_id')
      .eq('domain', normalizedDomain)
      .eq('status', 'active')
      .single();

    if (existingDomain) {
      if (existingDomain.user_id === user.id) {
        return res.status(400).json({ error: 'You already own this domain' });
      }
      return res.status(400).json({ error: 'Domain is already in use' });
    }

    // Check user's subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || !['starter', 'pro'].includes(subscription.plan)) {
      return res.status(403).json({
        error: 'Custom domains require STARTER or PRO plan',
        upgradeRequired: true
      });
    }

    // Check domain limit based on plan
    const maxDomains = subscription.plan === 'starter' ? 1 : 10;
    const { count } = await supabase
      .from('custom_domains')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (count >= maxDomains) {
      return res.status(403).json({
        error: `Your ${subscription.plan.toUpperCase()} plan allows ${maxDomains} custom domain(s). Please upgrade to PRO for more.`,
        limitReached: true
      });
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log(`[Custom Domain] Adding domain: ${normalizedDomain} for user: ${user.id}`);

    // Create custom hostname in Cloudflare
    let cloudflareData = null;
    if (CLOUDFLARE_ZONE_ID && CLOUDFLARE_API_TOKEN) {
      try {
        const cloudflareResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              hostname: normalizedDomain,
              ssl: {
                method: 'txt',
                type: 'dv',
                settings: {
                  min_tls_version: '1.2'
                }
              }
            })
          }
        );

        const cloudflareResult = await cloudflareResponse.json();

        if (cloudflareResult.success) {
          cloudflareData = {
            id: cloudflareResult.result.id,
            status: cloudflareResult.result.status,
            ssl_status: cloudflareResult.result.ssl?.status,
            verification_errors: cloudflareResult.result.verification_errors || []
          };
          console.log(`[Custom Domain] Cloudflare custom hostname created: ${cloudflareData.id}`);
        } else {
          console.error('[Custom Domain] Cloudflare error:', cloudflareResult.errors);
          return res.status(500).json({
            error: 'Failed to configure domain with Cloudflare',
            details: cloudflareResult.errors
          });
        }
      } catch (cfError) {
        console.error('[Custom Domain] Cloudflare API error:', cfError);
        return res.status(500).json({
          error: 'Failed to communicate with Cloudflare',
          details: cfError.message
        });
      }
    }

    // Save to database
    const { data: customDomain, error: dbError } = await supabase
      .from('custom_domains')
      .insert({
        user_id: user.id,
        project_id: projectId,
        domain: normalizedDomain,
        status: 'pending',
        cloudflare_id: cloudflareData?.id || null,
        cloudflare_status: cloudflareData?.status || null,
        ssl_status: cloudflareData?.ssl_status || null,
        verification_errors: cloudflareData?.verification_errors || [],
        nameservers: null // Will be populated when user changes nameservers
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Custom Domain] Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save domain', details: dbError.message });
    }

    console.log(`[Custom Domain] Domain added successfully: ${normalizedDomain}`);

    // Return success with instructions
    return res.status(200).json({
      success: true,
      domain: customDomain,
      instructions: {
        step1: `Add a CNAME record pointing ${normalizedDomain} to cname.yenze.io`,
        step2: 'DNS propagation may take up to 48 hours',
        step3: 'SSL certificate will be automatically provisioned'
      }
    });

  } catch (error) {
    console.error('[Custom Domain] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
