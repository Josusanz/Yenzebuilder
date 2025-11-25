// API Route for serving FREE tier content via /s/:slug
// This handles requests to yenze.io/s/slug and serves the corresponding project

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  try {
    // Get slug from query parameter
    const slug = req.query.slug;

    console.log(`[View Project] Request for slug: ${slug}`);
    console.log(`[View Project] Environment check:`, {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Initialize Supabase client inside handler to ensure env vars are available
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!slug) {
      return res.status(400).send('Missing slug parameter');
    }

    // Find project with this public slug
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name, html_content, user_id, public_slug, is_published')
      .eq('public_slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !project) {
      console.error(`[View Project] Project not found for slug: ${slug}`, error);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Site Not Found - YENZE</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 {
              font-size: 4rem;
              margin: 0 0 1rem 0;
            }
            p {
              font-size: 1.25rem;
              margin: 0 0 2rem 0;
              opacity: 0.9;
            }
            a {
              display: inline-block;
              padding: 0.75rem 2rem;
              background: white;
              color: #667eea;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              transition: transform 0.2s;
            }
            a:hover {
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>This site hasn't been published yet.</p>
            <a href="https://yenze.io">Create Your Own Website</a>
          </div>
        </body>
        </html>
      `);
    }

    // Get user's subscription to check plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', project.user_id)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'free';

    // Inject badge for FREE users
    let html = project.html_content || '<h1>Empty Project</h1>';

    if (plan === 'free') {
      // Add "Powered by YENZE" badge with upgrade CTA
      const badge = `
        <div id="yenze-badge" style="position: fixed; bottom: 20px; right: 20px; background: rgba(102, 126, 234, 0.95); color: white; padding: 12px 20px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; backdrop-filter: blur(10px);">
          <a href="https://yenze.io" target="_blank" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
            <span>Powered by YENZE</span>
          </a>
          <div style="margin-top: 8px; font-size: 12px; opacity: 0.9; text-align: center;">
            <a href="https://yenze.io/dashboard.html" target="_blank" style="color: white; text-decoration: underline;">Upgrade for custom subdomain</a>
          </div>
        </div>
      `;

      // Inject before closing body tag
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${badge}</body>`);
      } else {
        html += badge;
      }
    }

    // Track view (analytics) - don't let analytics errors break the page
    try {
      await supabase
        .from('project_analytics')
        .insert({
          project_id: project.id,
          event_type: 'page_view',
          timestamp: new Date().toISOString()
        });
    } catch (err) {
      console.error('Analytics error:', err);
    }

    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    // Return the HTML
    return res.status(200).send(html);

  } catch (error) {
    console.error('[View Project] Error:', error);
    console.error('[View Project] Error stack:', error.stack);
    console.error('[View Project] Error message:', error.message);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - YENZE</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h1 {
            color: #e53e3e;
            margin: 0 0 1rem 0;
          }
          p {
            color: #666;
            margin: 0;
          }
          .debug {
            margin-top: 1rem;
            padding: 1rem;
            background: #f0f0f0;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            text-align: left;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Oops! Something went wrong</h1>
          <p>Please try again later.</p>
          <div class="debug">Error: ${error.message}</div>
        </div>
      </body>
      </html>
    `);
  }
}
