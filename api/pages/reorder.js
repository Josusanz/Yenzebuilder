/**
 * Reorder Pages
 * Changes the order of pages in a project
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId, pageOrder } = req.body;

    if (!projectId || !Array.isArray(pageOrder)) {
        return res.status(400).json({
            error: 'Project ID and page order array are required',
            example: { projectId: 'uuid', pageOrder: ['page-1', 'page-2', 'page-3'] }
        });
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

        // Validate that all page IDs exist
        const pageIds = pages.map(p => p.id);
        const invalidIds = pageOrder.filter(id => !pageIds.includes(id));

        if (invalidIds.length > 0) {
            return res.status(400).json({
                error: 'Invalid page IDs',
                invalidIds: invalidIds
            });
        }

        // Reorder pages array
        const reorderedPages = pageOrder.map(id => pages.find(p => p.id === id));

        // Reorder navigation to match
        const navigation = project.navigation || { items: [] };
        if (navigation.items && navigation.items.length > 0) {
            navigation.items = pageOrder
                .map(pageId => navigation.items.find(item => item.page_id === pageId))
                .filter(item => item !== undefined);
        }

        // Update project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                pages: reorderedPages,
                navigation: navigation,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'Pages reordered successfully',
            newOrder: reorderedPages.map(p => ({ id: p.id, name: p.name, slug: p.slug }))
        });

    } catch (error) {
        console.error('Reorder pages error:', error);
        return res.status(500).json({
            error: 'Failed to reorder pages',
            details: error.message
        });
    }
}
