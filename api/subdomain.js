// API Route for serving content via subdomain
// This handles requests to *.yenze.io and serves the corresponding project

const { createClient } = require('@supabase/supabase-js');
const { serveProject, sendError } = require('./_utils/response-helper.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  try {
    // Get the host from request headers
    const host = req.headers.host || '';

    console.log(`[Request] Host: ${host}`);

    // Check if this is a custom domain or subdomain
    const isCustomDomain = !host.includes('.yenze.io') && host !== 'yenze.io';
    let project = null;
    let error = null;

    if (isCustomDomain) {
      // Custom domain: Look up by domain
      console.log(`[Custom Domain] Request for: ${host}`);

      // First check if custom domain exists and is active
      const { data: customDomain } = await supabase
        .from('custom_domains')
        .select('project_id, status')
        .eq('domain', host)
        .single();

      if (!customDomain || customDomain.status !== 'active') {
        console.error(`[Custom Domain] Domain not found or not active: ${host}`);
        return sendError(
          res,
          404,
          'Domain Not Configured',
          'This custom domain hasn\'t been set up yet.'
        );
      }

      // Fetch project data
      const projectResponse = await supabase
        .from('projects')
        .select('id, name, html, user_id, subdomain_slug, published_url')
        .eq('id', customDomain.project_id)
        .single();

      project = projectResponse.data;
      error = projectResponse.error;

    } else {
      // Subdomain: Look up by subdomain_slug
      const subdomain = host.split('.')[0];

      // If no subdomain or it's the main domain, return error
      if (!subdomain || subdomain === 'yenze' || subdomain === 'www') {
        return res.status(400).send('Invalid subdomain request');
      }

      console.log(`[Subdomain] Request for: ${subdomain}.yenze.io`);

      // Find project with this subdomain slug
      const projectResponse = await supabase
        .from('projects')
        .select('id, name, html, user_id, subdomain_slug, published_url')
        .eq('subdomain_slug', subdomain)
        .single();

      project = projectResponse.data;
      error = projectResponse.error;
    }

    if (error || !project) {
      console.error(`[Subdomain] Project not found for: ${host}`, error);
      return sendError(
        res,
        404,
        'Site Not Found',
        'This site hasn\'t been published yet.'
      );
    }

    // Get user's subscription to check if badge should be shown
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', project.user_id)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'free';
    const showBadge = plan === 'free'; // Only show badge for FREE plan

    return await serveProject(res, project, {
      showBadge: showBadge
    });

  } catch (error) {
    console.error('[Subdomain] Error:', error);
    return sendError(res, 500, 'Oops! Something went wrong', 'Please try again later.', error.message);
  }
}
