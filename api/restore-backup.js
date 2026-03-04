const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        const { backupId, projectId } = req.body;

        if (!backupId || !projectId) {
            return res.status(400).json({ error: 'Backup ID and Project ID required' });
        }

        // Get backup data
        const { data: backup, error: backupError } = await supabase
            .from('project_backups')
            .select('*')
            .eq('id', backupId)
            .eq('user_id', user.id)
            .single();

        if (backupError || !backup) {
            return res.status(404).json({ error: 'Backup not found' });
        }

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, project_type')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const backupData = backup.backup_data;

        // Create a backup of current state before restoring (safety backup)
        const { data: currentProject } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        let currentPages = [];
        if (currentProject.project_type === 'multi') {
            const { data: pagesData } = await supabase
                .from('pages')
                .select('*')
                .eq('project_id', projectId);
            currentPages = pagesData || [];
        }

        // Save safety backup
        await supabase
            .from('project_backups')
            .insert({
                project_id: projectId,
                user_id: user.id,
                name: `Before restore - ${new Date().toLocaleString()}`,
                backup_data: {
                    project: {
                        name: currentProject.name,
                        html_content: currentProject.html_content,
                        custom_css: currentProject.custom_css,
                        settings: currentProject.settings,
                        seo_metadata: currentProject.seo_metadata,
                        project_type: currentProject.project_type
                    },
                    pages: currentPages.map(p => ({
                        name: p.name,
                        slug: p.slug,
                        html_content: p.html_content,
                        is_homepage: p.is_homepage,
                        seo_metadata: p.seo_metadata
                    }))
                },
                size_bytes: 0,
                is_auto: true
            });

        // Restore project data
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                html_content: backupData.project.html_content,
                custom_css: backupData.project.custom_css,
                settings: backupData.project.settings,
                seo_metadata: backupData.project.seo_metadata,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) throw updateError;

        // Restore pages if multi-page
        if (backupData.pages && backupData.pages.length > 0) {
            // Delete existing pages
            await supabase
                .from('pages')
                .delete()
                .eq('project_id', projectId);

            // Insert backup pages
            const pagesToInsert = backupData.pages.map(p => ({
                project_id: projectId,
                name: p.name,
                slug: p.slug,
                html_content: p.html_content,
                is_homepage: p.is_homepage,
                seo_metadata: p.seo_metadata
            }));

            await supabase
                .from('pages')
                .insert(pagesToInsert);
        }

        return res.status(200).json({
            success: true,
            message: 'Project restored successfully'
        });

    } catch (error) {
        console.error('Restore error:', error);
        return res.status(500).json({ error: 'Failed to restore backup' });
    }
}
