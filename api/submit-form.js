// API Route for handling contact form submissions
// Uses Resend to send emails to site owners
// v1.4 - Webhook reconnected, forcing new deploy

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  // Enable CORS for form submissions from any published site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      message,
      subject,
      project_id,
      site_id,
      // Support for multi-column forms
      first_name,
      last_name,
      // Custom fields (any additional fields)
      ...customFields
    } = req.body;

    // Get site_url from body or referer
    const site_url = req.body.site_url || req.headers.referer || req.headers.origin;

    console.log('[Submit Form] Received submission:', { name, email, subject, project_id, site_id, site_url });

    // Validate required fields
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Combine first_name and last_name if provided
    const fullName = first_name && last_name
      ? `${first_name} ${last_name}`
      : (name || 'Anonymous');

    // Find the site owner based on project_id, site_id, or site_url
    let ownerEmail = null;
    let ownerName = null;
    let projectData = null;

    // Try to find project by ID first
    if (project_id || site_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, name, user_id, subdomain_slug, public_slug')
        .eq('id', project_id || site_id)
        .single();

      if (project) {
        projectData = project;
      }
    }

    // If no project found by ID, try to find by subdomain from URL
    if (!projectData && site_url) {
      // Extract subdomain from URL like "example.yenze.io" or "yenze.io/s/example"
      let subdomain = null;
      let slug = null;

      try {
        const url = new URL(site_url);
        const hostname = url.hostname;

        // Check for subdomain.yenze.io
        if (hostname.endsWith('.yenze.io') && hostname !== 'yenze.io' && hostname !== 'www.yenze.io') {
          subdomain = hostname.split('.')[0];
        }

        // Check for yenze.io/s/slug
        const pathMatch = url.pathname.match(/^\/s\/([^\/]+)/);
        if (pathMatch) {
          slug = pathMatch[1];
        }
      } catch (e) {
        console.log('[Submit Form] Could not parse URL:', site_url);
      }

      if (subdomain) {
        const { data: project } = await supabase
          .from('projects')
          .select('id, name, user_id, subdomain_slug, public_slug')
          .eq('subdomain_slug', subdomain)
          .single();

        if (project) {
          projectData = project;
        }
      } else if (slug) {
        const { data: project } = await supabase
          .from('projects')
          .select('id, name, user_id, subdomain_slug, public_slug')
          .eq('public_slug', slug)
          .single();

        if (project) {
          projectData = project;
        }
      }
    }

    // Get owner email from auth.users (most reliable source)
    if (projectData && projectData.user_id) {
      try {
        // Try to get user from auth.users using admin API
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(projectData.user_id);
        if (user && !authError) {
          ownerEmail = user.email;
          ownerName = user.user_metadata?.full_name || user.user_metadata?.name || null;
          console.log('[Submit Form] Found user email from auth:', ownerEmail);
        }
      } catch (authErr) {
        console.log('[Submit Form] Auth lookup error:', authErr.message);
      }

      // Fallback: try profiles table if auth lookup failed
      if (!ownerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', projectData.user_id)
          .single();

        if (profile && profile.email) {
          ownerEmail = profile.email;
          ownerName = profile.full_name;
          console.log('[Submit Form] Found user email from profiles:', ownerEmail);
        }
      }
    }

    console.log('[Submit Form] Found owner:', { ownerEmail, projectName: projectData?.name });

    // Check rate limits based on user plan
    if (projectData) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', projectData.user_id)
        .single();

      const plan = profile?.plan || 'free';

      // Get submission count for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectData.id)
        .gte('created_at', startOfMonth.toISOString());

      // Plan limits
      const limits = {
        free: 50,
        basic: 500,
        pro: 2000,
        business: 10000
      };

      const limit = limits[plan] || 50;

      if (count >= limit) {
        console.log('[Submit Form] Rate limit exceeded:', { plan, count, limit });
        return res.status(429).json({
          success: false,
          error: 'Monthly form submission limit reached. Please contact the site owner.'
        });
      }
    }

    // Store form submission in database
    // Log environment check
    console.log('[Submit Form] Using Supabase URL:', process.env.SUPABASE_URL ? 'configured' : 'MISSING');
    console.log('[Submit Form] Using Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'MISSING');

    const insertData = {
      name: fullName,
      email: email,
      phone: phone || null,
      message: message,
      subject: subject || 'New Contact Form Submission',
      project_id: projectData?.id || null,
      site_url: site_url,
      ip_address: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      user_agent: req.headers['user-agent'],
      custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
      created_at: new Date().toISOString()
    };

    console.log('[Submit Form] Attempting insert with data:', JSON.stringify(insertData, null, 2));

    // Try insert without select first to see if it works
    const { error: dbError } = await supabase
      .from('form_submissions')
      .insert(insertData);

    console.log('[Submit Form] Insert result - error:', JSON.stringify(dbError));

    if (dbError) {
      console.error('[Submit Form] Database error:', dbError);
      console.error('[Submit Form] Database error details:', JSON.stringify(dbError, null, 2));
      // Return error with debug info
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + (dbError.message || 'Failed to save submission'),
        details: dbError.code,
        debug: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          projectFound: !!projectData,
          projectId: projectData?.id
        }
      });
    }

    console.log('[Submit Form] Submission saved successfully');

    // Send email notification to site owner
    if (ownerEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const siteName = projectData?.name || 'your YENZE site';
        const formSubject = subject || 'New Contact Form Submission';

        // Build custom fields HTML if any
        let customFieldsHtml = '';
        if (Object.keys(customFields).length > 0) {
          customFieldsHtml = '<h3 style="color: #333; margin-top: 20px;">Additional Information</h3>';
          for (const [key, value] of Object.entries(customFields)) {
            if (key !== 'site_url' && value) {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              customFieldsHtml += `<p><strong>${formattedKey}:</strong> ${value}</p>`;
            }
          }
        }

        await resend.emails.send({
          from: 'YENZE Forms <forms@yenze.io>',
          to: ownerEmail,
          subject: `[${siteName}] ${formSubject}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Form Submission</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From ${siteName}</p>
              </div>

              <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 12px 12px;">
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <h2 style="color: #333; margin-top: 0; margin-bottom: 20px; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>

                  <p style="margin: 10px 0;"><strong>Name:</strong> ${fullName}</p>
                  <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
                  ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}

                  <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px; font-size: 16px;">Message</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
                    <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                  </div>

                  ${customFieldsHtml}
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    Reply directly to this email to respond to ${fullName}
                  </p>
                </div>
              </div>

              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>Powered by <a href="https://yenze.io" style="color: #667eea; text-decoration: none;">YENZE</a></p>
                <p style="margin-top: 5px;">Submission received from: ${site_url || 'Unknown'}</p>
              </div>
            </div>
          `,
          replyTo: email
        });

        console.log('[Submit Form] Email sent to:', ownerEmail);
      } catch (emailError) {
        console.error('[Submit Form] Email error:', emailError);
        // Don't fail the request if email fails - submission is still saved
      }
    } else {
      console.log('[Submit Form] No owner email or Resend API key - skipping email notification');
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received.',
      saved: true,
      debug: {
        projectFound: !!projectData,
        projectId: projectData?.id,
        ownerEmail: ownerEmail ? 'found' : 'not found'
      }
    });

  } catch (error) {
    console.error('[Submit Form] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your submission'
    });
  }
};
