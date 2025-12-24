import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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
        // GET - List backups for a project
        if (req.method === 'GET') {
            const { projectId } = req.query;

            if (!projectId) {
                return res.status(400).json({ error: 'Project ID required' });
            }

            // Verify project ownership
            const { data: project } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Get backups
            const { data: backups, error } = await supabase
                .from('project_backups')
                .select('id, name, created_at, size_bytes, is_auto')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            return res.status(200).json({ backups: backups || [] });
        }

        // POST - Create a backup
        if (req.method === 'POST') {
            const { projectId, name, isAuto = false } = req.body;

            if (!projectId) {
                return res.status(400).json({ error: 'Project ID required' });
            }

            // Get project data
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Get pages if multi-page project
            let pages = [];
            if (project.project_type === 'multi') {
                const { data: pagesData } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('project_id', projectId);
                pages = pagesData || [];
            }

            // Create backup data
            const backupData = {
                project: {
                    name: project.name,
                    html_content: project.html_content,
                    custom_css: project.custom_css,
                    settings: project.settings,
                    seo_metadata: project.seo_metadata,
                    project_type: project.project_type
                },
                pages: pages.map(p => ({
                    name: p.name,
                    slug: p.slug,
                    html_content: p.html_content,
                    is_homepage: p.is_homepage,
                    seo_metadata: p.seo_metadata
                }))
            };

            const backupJson = JSON.stringify(backupData);
            const sizeBytes = new Blob([backupJson]).size;

            // Check backup limit (keep max 10 per project)
            const { count } = await supabase
                .from('project_backups')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId);

            if (count >= 10) {
                // Delete oldest backup
                const { data: oldest } = await supabase
                    .from('project_backups')
                    .select('id')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .single();

                if (oldest) {
                    await supabase
                        .from('project_backups')
                        .delete()
                        .eq('id', oldest.id);
                }
            }

            // Create backup
            const { data: backup, error: backupError } = await supabase
                .from('project_backups')
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    name: name || `Backup ${new Date().toLocaleString()}`,
                    backup_data: backupData,
                    size_bytes: sizeBytes,
                    is_auto: isAuto
                })
                .select()
                .single();

            if (backupError) throw backupError;

            return res.status(200).json({
                success: true,
                backup: {
                    id: backup.id,
                    name: backup.name,
                    created_at: backup.created_at,
                    size_bytes: backup.size_bytes
                }
            });
        }

        // DELETE - Delete a backup
        if (req.method === 'DELETE') {
            const { backupId } = req.body;

            if (!backupId) {
                return res.status(400).json({ error: 'Backup ID required' });
            }

            // Verify ownership
            const { data: backup } = await supabase
                .from('project_backups')
                .select('id')
                .eq('id', backupId)
                .eq('user_id', user.id)
                .single();

            if (!backup) {
                return res.status(404).json({ error: 'Backup not found' });
            }

            const { error } = await supabase
                .from('project_backups')
                .delete()
                .eq('id', backupId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ error: 'Backup operation failed' });
    }
}
