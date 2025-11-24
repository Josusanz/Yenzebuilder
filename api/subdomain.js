// API Route for serving content via subdomain
// This handles requests to *.yenze.io and serves the corresponding project

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Domain Not Configured - YENZE</title>
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
                font-size: 3rem;
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
              <h1>Domain Not Configured</h1>
              <p>This custom domain hasn't been set up yet.</p>
              <a href="https://yenze.io">Go to YENZE</a>
            </div>
          </body>
          </html>
        `);
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
      console.error(`[Subdomain] Project not found for: ${subdomain}`, error);
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

    // Get user's subscription to check if badge should be shown
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', project.user_id)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'free';
    const showBadge = plan === 'free'; // Only show badge for FREE plan

    // Inject badge if needed
    let html = project.html || '<h1>Empty Project</h1>';

    if (showBadge) {
      // Add "Powered by YENZE" badge
      const badge = `
        <div id="yenze-badge" style="position: fixed; bottom: 20px; right: 20px; background: rgba(102, 126, 234, 0.95); color: white; padding: 8px 16px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; backdrop-filter: blur(10px);">
          <a href="https://yenze.io" target="_blank" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
            <span>Powered by YENZE</span>
          </a>
        </div>
      `;

      // Inject before closing body tag
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${badge}</body>`);
      } else {
        html += badge;
      }
    }

    // Inject analytics tracking script before </body> tag
    const analyticsScript = `
    <!-- YENZE Analytics Tracking -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      (function() {
        const supabaseUrl = '${process.env.SUPABASE_URL}';
        const supabaseAnonKey = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
        const projectId = '${project.id}';

        const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

        // Generate or get visitor ID
        function getVisitorId() {
          let visitorId = localStorage.getItem('yenze_visitor_id');
          if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('yenze_visitor_id', visitorId);
          }
          return visitorId;
        }

        // Generate session ID
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Track page view
        supabase.from('analytics_events').insert({
          project_id: projectId,
          event_type: 'page_view',
          visitor_id: getVisitorId(),
          session_id: sessionId,
          page_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          language: navigator.language,
          timestamp: new Date().toISOString(),
          metadata: {
            platform: navigator.platform,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }).then(function(result) {
          if (result.error) {
            console.error('Analytics tracking error:', result.error);
          }
        });
      })();
    </script>
    `;

    // Inject analytics before </body> or at the end if no </body> tag
    if (html.includes('</body>')) {
      html = html.replace('</body>', analyticsScript + '</body>');
    } else {
      html += analyticsScript;
    }

    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    // Return the HTML
    return res.status(200).send(html);

  } catch (error) {
    console.error('[Subdomain] Error:', error);
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
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Oops! Something went wrong</h1>
          <p>Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
}
