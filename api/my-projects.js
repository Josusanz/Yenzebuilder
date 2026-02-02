// API Route: /api/my-projects
// Returns projects for a user by email (anonymous publishing)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('[MyProjects] Fetching projects for:', email);

        // Fetch projects by owner_email (anonymous) or user email (authenticated)
        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, name, slug, published_url, created_at, updated_at, plan')
            .or(`owner_email.eq.${email}`)
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[MyProjects] Database error:', error);
            throw error;
        }

        console.log('[MyProjects] Found', projects?.length || 0, 'projects');

        res.status(200).json({
            projects: projects || [],
            count: projects?.length || 0
        });

    } catch (error) {
        console.error('[MyProjects] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
