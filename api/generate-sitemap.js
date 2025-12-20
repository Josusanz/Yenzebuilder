/**
 * Generate Sitemap.xml for a project
 * Returns XML sitemap based on project pages
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const projectId = req.query.projectId || req.body?.projectId;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Determine the base URL
        const baseUrl = project.custom_domain
            ? `https://${project.custom_domain}`
            : project.subdomain
            ? `https://${project.subdomain}.yenze.io`
            : `https://yenze.io/s/${project.public_slug}`;

        // Parse HTML to find pages
        const pages = extractPagesFromHTML(project.html, baseUrl);

        // Generate sitemap XML
        const sitemap = generateSitemapXML(pages);

        // Store sitemap in project metadata
        await supabase
            .from('projects')
            .update({
                seo_metadata: {
                    ...(project.seo_metadata || {}),
                    sitemap_generated: true,
                    sitemap_generated_at: new Date().toISOString()
                }
            })
            .eq('id', projectId);

        // Return JSON with sitemap data
        return res.status(200).json({
            success: true,
            sitemap: sitemap,
            totalUrls: pages.length,
            baseUrl: baseUrl
        });

    } catch (error) {
        console.error('Generate sitemap error:', error);
        return res.status(500).json({ error: 'Failed to generate sitemap' });
    }
}

/**
 * Extract pages from HTML
 */
function extractPagesFromHTML(html, baseUrl) {
    const pages = [];

    // Add homepage
    pages.push({
        loc: baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '1.0'
    });

    // Find all internal links
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;
    const uniqueUrls = new Set();

    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];

        // Only include relative URLs or URLs on same domain
        if (href.startsWith('/') || href.startsWith(baseUrl)) {
            const fullUrl = href.startsWith('/')
                ? `${baseUrl}${href}`
                : href;

            // Remove hash and query params for uniqueness
            const cleanUrl = fullUrl.split('#')[0].split('?')[0];

            if (!uniqueUrls.has(cleanUrl)) {
                uniqueUrls.add(cleanUrl);
                pages.push({
                    loc: cleanUrl,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.8'
                });
            }
        }
    }

    // Find pages with class="page" or data-page attribute
    const pageRegex = /class=["'][^"']*\bpage\b[^"']*["']|data-page=["']([^"']+)["']/gi;
    while ((match = pageRegex.exec(html)) !== null) {
        if (match[1]) {
            const pageUrl = `${baseUrl}/${match[1]}`;
            if (!uniqueUrls.has(pageUrl)) {
                uniqueUrls.add(pageUrl);
                pages.push({
                    loc: pageUrl,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.8'
                });
            }
        }
    }

    return pages;
}

/**
 * Generate XML sitemap
 */
function generateSitemapXML(pages) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `    <url>
        <loc>${escapeXml(page.loc)}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
