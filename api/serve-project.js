// API endpoint to serve project HTML for custom domains
// Called by middleware when a custom domain is detected

const { createClient } = require('@supabase/supabase-js');
const { serveProject, sendError } = require('./_utils/response-helper.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  try {
    const domain = req.query.domain;
    const path = req.query.path || '/';

    if (!domain) {
      return res.status(400).send('Domain parameter required');
    }

    console.log(`[Serve Project] Serving content for domain: ${domain}, path: ${path}`);

    // Look up which project this domain belongs to
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .select(`
        id,
        domain,
        project_id,
        status,
        project:projects(id, name, html, user_id)
      `)
      .eq('domain', domain)
      .eq('status', 'active')
      .single();

    if (domainError || !customDomain) {
      console.error('[Serve Project] Domain not found:', domain);
      return sendError(
        res,
        404,
        'Domain Not Configured',
        `The domain <strong>${domain}</strong> is not configured or active. Please check your custom domain settings in the YENZE dashboard.`,
        'Error: Domain not found or not active'
      );
    }

    // Check if project has content
    if (!customDomain.project || !customDomain.project.html) {
      console.error('[Serve Project] Project has no content:', customDomain.project_id);
      return sendError(
        res,
        404,
        'No Content Available',
        'This project doesn\'t have any published content yet. Please publish your project from the YENZE builder.'
      );
    }

    console.log(`[Serve Project] Successfully serving project: ${customDomain.project.name}`);

    // Serve the HTML with proper headers, analytics, etc.
    // Assuming custom domains are paid, so no badge
    return await serveProject(res, customDomain.project, {
      showBadge: false
    });

  } catch (error) {
    console.error('[Serve Project] Error:', error);
    return sendError(res, 500, 'Server Error', 'An error occurred while loading this page.', error.message);
  }
}
