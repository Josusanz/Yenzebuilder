// API endpoint to add custom domain
// This adds a custom domain to Vercel project

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vercel configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Optional, for team accounts

module.exports = async function handler(req, res) {
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
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1);

    const subscription = subscriptions?.[0];
    const planName = subscription?.plan?.toLowerCase() || 'free';

    if (!['pro', 'business'].includes(planName)) {
      return res.status(403).json({
        error: 'Custom domains require PRO or BUSINESS plan',
        upgradeRequired: true
      });
    }

    // Check domain limit based on plan
    const maxDomains = planName === 'pro' ? 1 : 999; // Pro: 1 domain, Business: unlimited
    const { count } = await supabase
      .from('custom_domains')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (count >= maxDomains) {
      return res.status(403).json({
        error: `Your ${planName.toUpperCase()} plan allows ${maxDomains} custom domain(s). Please upgrade to BUSINESS for unlimited domains.`,
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

    // Add domain to Vercel project
    let vercelData = null;
    if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
      try {
        const vercelUrl = VERCEL_TEAM_ID
          ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
          : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`;

        const vercelResponse = await fetch(vercelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: normalizedDomain,
            gitBranch: null // Use production branch
          })
        });

        const vercelResult = await vercelResponse.json();

        if (vercelResponse.ok) {
          vercelData = {
            name: vercelResult.name,
            verified: vercelResult.verified || false,
            verification: vercelResult.verification || []
          };
          console.log(`[Custom Domain] Vercel domain added: ${vercelData.name}`);
        } else {
          console.error('[Custom Domain] Vercel error:', vercelResult);
          return res.status(500).json({
            error: 'Failed to configure domain with Vercel',
            details: vercelResult.error?.message || 'Unknown error'
          });
        }
      } catch (vercelError) {
        console.error('[Custom Domain] Vercel API error:', vercelError);
        return res.status(500).json({
          error: 'Failed to communicate with Vercel',
          details: vercelError.message
        });
      }
    } else {
      return res.status(500).json({
        error: 'Vercel configuration missing',
        details: 'Please configure VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables'
      });
    }

    // Get Vercel project domain for CNAME target
    const vercelProjectDomain = `${VERCEL_PROJECT_ID}.vercel.app`;

    // Save to database
    const { data: customDomain, error: dbError } = await supabase
      .from('custom_domains')
      .insert({
        user_id: user.id,
        project_id: projectId,
        domain: normalizedDomain,
        status: vercelData?.verified ? 'active' : 'pending',
        vercel_verified: vercelData?.verified || false,
        verification_record: vercelData?.verification?.[0] || null,
        cname_target: vercelProjectDomain
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Custom Domain] Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save domain', details: dbError.message });
    }

    console.log(`[Custom Domain] Domain added successfully: ${normalizedDomain}`);

    // Return success with DNS instructions
    return res.status(200).json({
      success: true,
      domain: customDomain,
      instructions: {
        title: 'Configure DNS Records',
        description: 'Add the following DNS record at your domain registrar:',
        records: [
          {
            type: 'CNAME',
            name: normalizedDomain.includes('www') ? 'www' : '@',
            value: vercelProjectDomain,
            ttl: 'Auto or 3600'
          }
        ],
        notes: [
          'DNS propagation typically takes 5-30 minutes',
          'SSL certificate will be automatically provisioned once DNS is verified',
          'You can verify your domain status from the dashboard'
        ]
      }
    });

  } catch (error) {
    console.error('[Custom Domain] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
