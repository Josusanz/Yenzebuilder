// API endpoint to get project by ID (public access)
// Used when loading a project in the builder via ?project=ID

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const projectId = req.query.id;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    console.log(`[Get Project] Loading project: ${projectId}`);

    // Fetch project from database (no auth required for reading)
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name, html, user_id')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('[Get Project] Database error:', error);
      return res.status(404).json({
        error: 'Project not found',
        details: error.message
      });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log(`[Get Project] Project found: ${project.name}`);

    // Return project data
    return res.status(200).json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        html: project.html || '',
        assets: []  // Assets column doesn't exist in database yet
      }
    });

  } catch (error) {
    console.error('[Get Project] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
