/**
 * Delete Page
 * Removes a page from a multi-page project
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId, pageId } = req.method === 'DELETE' ? req.query : req.body;

    if (!projectId || !pageId) {
        return res.status(400).json({ error: 'Project ID and Page ID are required' });
    }

    try {
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('pages, navigation')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const pages = project.pages || [];
        const pageIndex = pages.findIndex(p => p.id === pageId);

        if (pageIndex === -1) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const pageToDelete = pages[pageIndex];

        // Prevent deleting the only page
        if (pages.length === 1) {
            return res.status(400).json({
                error: 'Cannot delete the only page',
                message: 'A project must have at least one page'
            });
        }

        // Prevent deleting homepage without reassigning
        if (pageToDelete.is_homepage && pages.length > 1) {
            return res.status(400).json({
                error: 'Cannot delete homepage',
                message: 'Please set another page as homepage first',
                suggestion: 'Set another page as homepage before deleting this one'
            });
        }

        // Remove page
        pages.splice(pageIndex, 1);

        // Remove from navigation
        const navigation = project.navigation || { items: [] };
        if (navigation.items) {
            navigation.items = navigation.items.filter(item => item.page_id !== pageId);
        }

        // Update project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                pages: pages,
                navigation: navigation,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'Page deleted successfully',
            deletedPage: {
                id: pageToDelete.id,
                name: pageToDelete.name,
                slug: pageToDelete.slug
            },
            remainingPages: pages.length
        });

    } catch (error) {
        console.error('Delete page error:', error);
        return res.status(500).json({
            error: 'Failed to delete page',
            details: error.message
        });
    }
}
