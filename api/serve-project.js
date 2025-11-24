// API endpoint to serve project HTML for custom domains
// Called by middleware when a custom domain is detected

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Domain Not Found</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                max-width: 600px;
                padding: 40px;
              }
              h1 { font-size: 48px; margin-bottom: 20px; }
              p { font-size: 18px; opacity: 0.9; }
              .code { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🌐 Domain Not Configured</h1>
              <p>The domain <strong>${domain}</strong> is not configured or active.</p>
              <p>Please check your custom domain settings in the YENZE dashboard.</p>
              <div class="code">Error: Domain not found or not active</div>
            </div>
          </body>
        </html>
      `);
    }

    // Check if project has content
    if (!customDomain.project || !customDomain.project.html) {
      console.error('[Serve Project] Project has no content:', customDomain.project_id);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>No Content</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
              }
              .container {
                text-align: center;
                max-width: 600px;
                padding: 40px;
              }
              h1 { font-size: 48px; margin-bottom: 20px; }
              p { font-size: 18px; opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📄 No Content Available</h1>
              <p>This project doesn't have any published content yet.</p>
              <p>Please publish your project from the YENZE builder.</p>
            </div>
          </body>
        </html>
      `);
    }

    const projectHtml = customDomain.project.html;

    console.log(`[Serve Project] Successfully serving project: ${customDomain.project.name}`);

    // Serve the HTML with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('X-Project-ID', customDomain.project_id);
    res.setHeader('X-Project-Name', customDomain.project.name);

    return res.status(200).send(projectHtml);

  } catch (error) {
    console.error('[Serve Project] Error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #fc6076 0%, #ff9a44 100%);
              color: white;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 40px;
            }
            h1 { font-size: 48px; margin-bottom: 20px; }
            p { font-size: 18px; opacity: 0.9; }
            .error { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin-top: 20px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Server Error</h1>
            <p>An error occurred while loading this page.</p>
            <div class="error">${error.message}</div>
          </div>
        </body>
      </html>
    `);
  }
}
