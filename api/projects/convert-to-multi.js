/**
 * Convert Single-Page to Multi-Page Project
 * Migrates existing single-page project to multi-page structure
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if already multi-page
        if (project.project_type === 'multi') {
            return res.status(400).json({
                error: 'Project is already multi-page',
                message: 'This project has already been converted to multi-page'
            });
        }

        // Extract existing SEO metadata
        const existingSeo = project.seo_metadata || {};

        // Create homepage from existing HTML
        const homePage = {
            id: uuidv4(),
            slug: '',  // Empty slug = homepage
            name: 'Home',
            title: existingSeo.meta_title || project.name || 'Home',
            html: project.html || '<!DOCTYPE html><html><head><title>Home</title></head><body><h1>Welcome</h1></body></html>',
            seo_metadata: {
                meta_title: existingSeo.meta_title || project.name || 'Home',
                meta_description: existingSeo.meta_description || '',
                keywords: existingSeo.keywords || '',
                canonical_url: existingSeo.canonical_url || '',
                og_image: existingSeo.og_image || ''
            },
            is_homepage: true,
            created_at: project.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Create navigation
        const navigation = {
            items: [
                {
                    label: 'Home',
                    link: '/',
                    page_id: homePage.id
                }
            ]
        };

        // Update project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                project_type: 'multi',
                pages: [homePage],
                navigation: navigation,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'Project converted to multi-page successfully',
            project: {
                id: project.id,
                name: project.name,
                type: 'multi',
                pages: [homePage],
                navigation: navigation
            },
            nextSteps: [
                'Your existing content is now the homepage',
                'Add new pages using the Pages panel',
                'Customize navigation menu',
                'Set SEO metadata for each page'
            ]
        });

    } catch (error) {
        console.error('Convert to multi-page error:', error);
        return res.status(500).json({
            error: 'Failed to convert project',
            details: error.message
        });
    }
}
