/**
 * Update Page
 * Updates an existing page's content, metadata, or settings
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId, pageId, html, slug, name, title, seoMetadata, isHomepage } = req.body;

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

        const currentPage = pages[pageIndex];

        // If changing slug, validate uniqueness
        if (slug !== undefined && slug !== currentPage.slug) {
            const normalizedSlug = slug.toLowerCase().trim();
            const slugExists = pages.some((p, idx) => idx !== pageIndex && p.slug === normalizedSlug);

            if (slugExists) {
                return res.status(400).json({
                    error: 'Slug already exists',
                    message: 'Please choose a different URL slug'
                });
            }

            currentPage.slug = normalizedSlug;

            // Update navigation
            const navigation = project.navigation || { items: [] };
            const navItem = navigation.items?.find(item => item.page_id === pageId);
            if (navItem) {
                navItem.link = normalizedSlug ? `/${normalizedSlug}` : '/';
            }
        }

        // Update fields
        if (html !== undefined) currentPage.html = html;
        if (name !== undefined) {
            currentPage.name = name;
            // Update navigation label
            const navigation = project.navigation || { items: [] };
            const navItem = navigation.items?.find(item => item.page_id === pageId);
            if (navItem) {
                navItem.label = name;
            }
        }
        if (title !== undefined) currentPage.title = title;
        if (seoMetadata !== undefined) {
            currentPage.seo_metadata = {
                ...(currentPage.seo_metadata || {}),
                ...seoMetadata
            };
        }

        // Handle homepage flag
        if (isHomepage !== undefined && isHomepage === true) {
            // Unset other homepages
            pages.forEach(p => p.is_homepage = false);
            currentPage.is_homepage = true;
        } else if (isHomepage === false) {
            currentPage.is_homepage = false;
        }

        currentPage.updated_at = new Date().toISOString();

        // Update project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                pages: pages,
                navigation: project.navigation,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'Page updated successfully',
            page: currentPage
        });

    } catch (error) {
        console.error('Update page error:', error);
        return res.status(500).json({
            error: 'Failed to update page',
            details: error.message
        });
    }
}
