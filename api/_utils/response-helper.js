
import { createClient } from '@supabase/supabase-js';

// Helper to send consistent error pages
export function sendError(res, statusCode, title, message, details = null) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - YENZE</title>
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
          max-width: 600px;
        }
        h1 {
          font-size: 3rem;
          margin: 0 0 1rem 0;
        }
        p {
          font-size: 1.25rem;
          margin: 0 0 2rem 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        .code {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          font-family: monospace;
          word-break: break-word;
          text-align: left;
          font-size: 0.9rem;
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
        <h1>${title}</h1>
        <p>${message}</p>
        ${details ? `<div class="code">${details}</div>` : ''}
        <div style="margin-top: 30px">
          <a href="https://yenze.io">Go to YENZE</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return res.status(statusCode).send(html);
}

// Helper to serve project content with analytics and badge
export async function serveProject(res, project, options = {}) {
  try {
    const { 
      supabaseUrl = process.env.SUPABASE_URL,
      // Use env var if available, otherwise fallback to the one found in code (though we should move to env var)
      supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2RjcGhlcHJhY29iYnN2cW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDYsImV4cCI6MjA3OTE4NjcwNn0.Z3w9P2dMeNu2J-2AcnxhLVSF_p794JZgIcAKMqkT3-A',
      showBadge = false 
    } = options;

    let html = project.html || '<h1>Empty Project</h1>';

    // 1. Inject Badge if needed (for free plan)
    if (showBadge) {
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

      if (html.includes('</body>')) {
        html = html.replace('</body>', `${badge}</body>`);
      } else {
        html += badge;
      }
    }

    // 2. Inject Analytics
    const analyticsScript = `
    <!-- YENZE Analytics Tracking -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      (function() {
        const supabaseUrl = '${supabaseUrl}';
        const supabaseAnonKey = '${supabaseAnonKey}';
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

    if (html.includes('</body>')) {
      html = html.replace('</body>', analyticsScript + '</body>');
    } else {
      html += analyticsScript;
    }

    // 3. Set Headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('X-Project-ID', project.id);
    res.setHeader('X-Project-Name', project.name || 'Untitled');

    return res.status(200).send(html);

  } catch (error) {
    console.error('[Serve Project] Error processing HTML:', error);
    return sendError(res, 500, 'Server Error', 'An error occurred while processing the page.', error.message);
  }
}
