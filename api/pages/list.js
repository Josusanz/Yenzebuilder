/**
 * List All Pages
 * Returns all pages for a project with metadata
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const projectId = req.query.projectId;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, name, project_type, pages, navigation, custom_domain, subdomain_slug, public_slug')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const pages = project.pages || [];

        // Determine base URL
        const baseUrl = project.custom_domain
            ? `https://${project.custom_domain}`
            : project.subdomain_slug
            ? `https://${project.subdomain_slug}.yenze.io`
            : `https://yenze.io/s/${project.public_slug}`;

        // Enrich pages with full URLs
        const enrichedPages = pages.map(page => ({
            ...page,
            full_url: page.slug ? `${baseUrl}/${page.slug}` : baseUrl,
            word_count: estimateWordCount(page.html),
            last_modified: page.updated_at || page.created_at
        }));

        // Sort pages: homepage first, then by creation date
        enrichedPages.sort((a, b) => {
            if (a.is_homepage) return -1;
            if (b.is_homepage) return 1;
            return new Date(a.created_at) - new Date(b.created_at);
        });

        return res.status(200).json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                type: project.project_type,
                baseUrl: baseUrl
            },
            pages: enrichedPages,
            totalPages: enrichedPages.length,
            navigation: project.navigation || { items: [] }
        });

    } catch (error) {
        console.error('List pages error:', error);
        return res.status(500).json({
            error: 'Failed to list pages',
            details: error.message
        });
    }
}

/**
 * Estimate word count from HTML
 */
function estimateWordCount(html) {
    if (!html) return 0;

    // Remove HTML tags and count words
    const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text ? text.split(/\s+/).length : 0;
}
