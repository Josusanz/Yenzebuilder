// API Route for viewing published websites via subdomain (e.g., prueba1.yenze.io)
// This serves the website content for PAID plan users

const { createClient } = require('@supabase/supabase-js');
const { serveProject, sendError } = require('./_utils/response-helper.js');

module.exports = async function handler(req, res) {
  try {
    // Get the hostname from the request
    const hostname = req.headers.host;

    console.log('[View Subdomain] Request for hostname:', hostname);

    // Extract subdomain from hostname (e.g., "prueba1" from "prueba1.yenze.io")
    const subdomain = hostname.split('.')[0];

    // Skip if it's a main domain or special subdomain
    if (['yenze', 'www', 'builder', 'api'].includes(subdomain)) {
      console.log('[View Subdomain] Skipping main/special domain:', subdomain);
      return sendError(res, 404, '404', 'Not Found');
    }

    console.log('[View Subdomain] Extracted subdomain:', subdomain);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch project by subdomain_slug
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain_slug', subdomain)
      .eq('published', true)
      .single();

    if (error || !project) {
      console.error('[View Subdomain] Project not found:', error);
      return sendError(
        res,
        404,
        '404',
        'This website doesn\'t exist or has been unpublished.'
      );
    }

    console.log('[View Subdomain] Project found:', {
      id: project.id,
      name: project.name,
      subdomain: project.subdomain_slug
    });

    // Use the shared serveProject helper (no badge for paid plans)
    return await serveProject(res, project, { showBadge: false });

  } catch (error) {
    console.error('[View Subdomain] Error:', error);
    return sendError(
      res,
      500,
      'Server Error',
      'Something went wrong. Please try again later.',
      error.message
    );
  }
}
