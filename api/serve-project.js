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

    let projectHtml = customDomain.project.html;

    console.log(`[Serve Project] Successfully serving project: ${customDomain.project.name}`);

    // Inject analytics tracking script before </body> tag
    const analyticsScript = `
    <!-- YENZE Analytics Tracking -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      (function() {
        const supabaseUrl = '${process.env.SUPABASE_URL}';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2RjcGhlcHJhY29iYnN2cW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDYsImV4cCI6MjA3OTE4NjcwNn0.Z3w9P2dMeNu2J-2AcnxhLVSF_p794JZgIcAKMqkT3-A';
        const projectId = '${customDomain.project_id}';

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

    // Inject before </body> or at the end if no </body> tag
    if (projectHtml.includes('</body>')) {
      projectHtml = projectHtml.replace('</body>', analyticsScript + '</body>');
    } else {
      projectHtml = projectHtml + analyticsScript;
    }

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
