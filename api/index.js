// Dynamic index handler
// Detects if request is from custom domain or platform domain
// and routes accordingly

import { createClient } from '@supabase/supabase-js';
import { serveProject, sendError } from './_utils/response-helper.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Platform domains that should show the landing page
const PLATFORM_DOMAINS = [
  'builder.yenze.io',
  'yenze.io',
  'www.yenze.io',
  'localhost',
  'vercel.app'
];

export default async function handler(req, res) {
  const host = req.headers.host || '';

  // Check if this is a platform domain
  const isPlatformDomain = PLATFORM_DOMAINS.some(domain =>
    host === domain || host.endsWith(`.${domain}`)
  );

  if (isPlatformDomain) {
    // Serve the platform landing page
    return res.redirect(307, '/landing.html');
  }

  // This is a custom domain - serve the project
  const domain = host.split(':')[0]; // Remove port if present

  console.log(`[Index] Custom domain detected: ${domain}`);

  try {
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
      console.error('[Index] Domain not found:', domain);
      return sendError(
        res,
        404,
        'Domain Not Configured',
        `The domain <strong>${domain}</strong> is not configured or not active. Please check your custom domain settings in the YENZE dashboard.`,
        'Error: Domain not found or not active'
      );
    }

    // Check if project has content
    if (!customDomain.project || !customDomain.project.html) {
      console.error('[Index] Project has no content:', customDomain.project_id);
      return sendError(
        res,
        404,
        'No Content Available',
        'This project doesn\'t have any published content yet. Please publish your project from the YENZE builder.'
      );
    }

    console.log(`[Index] Successfully serving project: ${customDomain.project.name}`);

    // Check subscription for badge (optional, but good for consistency)
    // For custom domains, we might assume they are PRO/BUSINESS so maybe no badge?
    // The original code didn't check for badge on custom domains, so I'll leave it as false (default)
    // or we could check. Let's stick to original behavior for now (no badge on custom domains usually implies paid plan).

    return await serveProject(res, customDomain.project, {
      showBadge: false // Custom domains are usually paid features, so no badge
    });

  } catch (error) {
    console.error('[Index] Error:', error);
    return sendError(res, 500, 'Server Error', 'An error occurred while loading this page.', error.message);
  }
}
