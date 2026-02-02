// API Route: /api/publish-anonymous
// Allows publishing without authentication - just email required
// Saves project and returns published URL

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { html, slug, email, projectName } = req.body;

        // Validate required fields
        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Generate slug if not provided
        let finalSlug = slug;
        if (!finalSlug) {
            const baseName = (projectName || 'site').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            finalSlug = `${baseName}-${randomSuffix}`;
        }

        // Sanitize slug
        finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 50);

        console.log('[PublishAnonymous] Publishing:', { slug: finalSlug, email, htmlLength: html.length });

        // Check if slug is available
        const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('slug', finalSlug)
            .single();

        if (existing) {
            // Slug taken - add random suffix
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            finalSlug = `${finalSlug}-${randomSuffix}`;
        }

        // Save lead first
        try {
            await supabase.from('leads').upsert({
                email: email,
                source: 'anonymous_publish',
                created_at: new Date().toISOString()
            }, { onConflict: 'email' });
        } catch (e) {
            console.warn('[PublishAnonymous] Could not save lead:', e.message);
        }

        // Create or update project
        const projectData = {
            slug: finalSlug,
            name: projectName || finalSlug,
            html: html,
            owner_email: email,
            published: true,
            published_url: `https://yenze.io/s/${finalSlug}`,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Try to find existing project by email and slug pattern
        const { data: existingProject } = await supabase
            .from('projects')
            .select('id, slug')
            .eq('owner_email', email)
            .eq('slug', finalSlug)
            .single();

        let savedProject;

        if (existingProject) {
            // Update existing
            const { data, error } = await supabase
                .from('projects')
                .update({
                    html: html,
                    name: projectName || existingProject.slug,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingProject.id)
                .select()
                .single();

            if (error) throw error;
            savedProject = data;
            console.log('[PublishAnonymous] Updated existing project:', savedProject.id);
        } else {
            // Create new
            const { data, error } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) throw error;
            savedProject = data;
            console.log('[PublishAnonymous] Created new project:', savedProject.id);
        }

        // Return success with published URL
        const publishedUrl = `https://yenze.io/s/${savedProject.slug}`;

        res.status(200).json({
            success: true,
            url: publishedUrl,
            slug: savedProject.slug,
            projectId: savedProject.id
        });

    } catch (error) {
        console.error('[PublishAnonymous] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
