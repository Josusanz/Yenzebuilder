// API Route for viewing published websites via subdomain (e.g., prueba1.yenze.io)
// This serves the website content for PAID plan users

const { createClient } = require('@supabase/supabase-js');

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
      return res.status(404).send('Not Found');
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
      .eq('is_published', true)
      .single();

    if (error || !project) {
      console.error('[View Subdomain] Project not found:', error);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Website Not Found</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
              }
              h1 {
                font-size: 3rem;
                margin: 0 0 1rem;
              }
              p {
                font-size: 1.25rem;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404</h1>
              <p>This website doesn't exist or has been unpublished.</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('[View Subdomain] Project found:', {
      id: project.id,
      name: project.name,
      subdomain: project.subdomain_slug
    });

    // Track page view (async, don't wait)
    supabase
      .from('project_analytics')
      .insert({
        project_id: project.id,
        event_type: 'page_view',
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        referrer: req.headers.referer || null
      })
      .then(() => console.log('[View Subdomain] Analytics tracked'))
      .catch(err => console.error('[View Subdomain] Analytics error:', err));

    // Return the HTML content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.status(200).send(project.html_content);

  } catch (error) {
    console.error('[View Subdomain] Error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
            }
            h1 {
              font-size: 3rem;
              margin: 0 0 1rem;
            }
            p {
              font-size: 1.25rem;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>500</h1>
            <p>Something went wrong. Please try again later.</p>
          </div>
        </body>
      </html>
    `);
  }
};
