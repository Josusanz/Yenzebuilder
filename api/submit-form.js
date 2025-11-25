// API Route for handling contact form submissions
// This replaces Web3Forms with our own system

const { createClient } = require('@supabase/supabase-js');

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
      // Support for multi-column forms
      first_name,
      last_name,
      // Original referrer/site info
      site_url
    } = req.body;

    console.log('[Submit Form] Received submission:', { name, email, subject, project_id });

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

    // Store form submission in database
    const { data: submission, error: dbError } = await supabase
      .from('form_submissions')
      .insert({
        name: fullName,
        email: email,
        phone: phone || null,
        message: message,
        subject: subject || 'New Contact Form Submission',
        project_id: project_id || null,
        site_url: site_url || req.headers.referer || null,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Submit Form] Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save form submission'
      });
    }

    console.log('[Submit Form] Submission saved:', submission.id);

    // TODO: In future, send email notification to site owner
    // For now, we just store in database

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you soon.',
      submission_id: submission.id
    });

  } catch (error) {
    console.error('[Submit Form] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your submission',
      details: error.message
    });
  }
};
