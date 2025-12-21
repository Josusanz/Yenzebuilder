/**
 * Apply SEO Metadata to Project HTML
 * Injects saved SEO metadata into the HTML head section
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

    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('html, seo_metadata, custom_domain, subdomain_slug, public_slug, published_url')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const seoMeta = project.seo_metadata || {};

        if (!seoMeta.meta_title && !seoMeta.meta_description && !seoMeta.keywords && !seoMeta.canonical_url && !seoMeta.og_image) {
            return res.status(400).json({
                error: 'No SEO metadata found',
                message: 'Please generate or edit SEO metadata first'
            });
        }

        let html = project.html;

        // Determine canonical URL if not provided
        const canonicalUrl = seoMeta.canonical_url || (
            project.custom_domain
                ? `https://${project.custom_domain}`
                : project.subdomain_slug
                ? `https://${project.subdomain_slug}.yenze.io`
                : project.published_url
                ? project.published_url
                : `https://yenze.io/s/${project.public_slug}`
        );

        // Remove existing SEO meta tags to avoid duplicates
        html = removeExistingSEOTags(html);

        // Build SEO meta tags
        const metaTags = buildSEOMetaTags(seoMeta, canonicalUrl);

        // Inject meta tags into <head>
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${metaTags}\n</head>`);
        } else if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n${metaTags}`);
        } else {
            // No head tag, add at the beginning
            html = `<!DOCTYPE html>\n<html>\n<head>\n${metaTags}\n</head>\n<body>\n${html}\n</body>\n</html>`;
        }

        // Update project with new HTML
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                html: html,
                seo_metadata: {
                    ...seoMeta,
                    applied_to_html: true,
                    applied_at: new Date().toISOString()
                }
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'SEO metadata applied to HTML successfully',
            appliedTags: {
                title: !!seoMeta.meta_title,
                description: !!seoMeta.meta_description,
                keywords: !!seoMeta.keywords,
                canonical: !!canonicalUrl,
                ogImage: !!seoMeta.og_image
            }
        });

    } catch (error) {
        console.error('Apply SEO to HTML error:', error);
        return res.status(500).json({
            error: 'Failed to apply SEO metadata',
            details: error.message
        });
    }
}

/**
 * Remove existing SEO meta tags to avoid duplicates
 */
function removeExistingSEOTags(html) {
    // Remove title tag
    html = html.replace(/<title>.*?<\/title>/gi, '');

    // Remove meta description
    html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/gi, '');

    // Remove meta keywords
    html = html.replace(/<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/gi, '');

    // Remove canonical link
    html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/gi, '');

    // Remove Open Graph tags
    html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'][^"']*["']\s*\/?>/gi, '');

    // Remove Twitter Card tags
    html = html.replace(/<meta\s+name=["']twitter:card["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/gi, '');

    return html;
}

/**
 * Build SEO meta tags string
 */
function buildSEOMetaTags(seoMeta, canonicalUrl) {
    const tags = [];

    // Charset and viewport (always include)
    tags.push('    <meta charset="UTF-8">');
    tags.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">');

    // Title
    if (seoMeta.meta_title) {
        tags.push(`    <title>${escapeHtml(seoMeta.meta_title)}</title>`);
    }

    // Meta description
    if (seoMeta.meta_description) {
        tags.push(`    <meta name="description" content="${escapeHtml(seoMeta.meta_description)}">`);
    }

    // Keywords
    if (seoMeta.keywords) {
        tags.push(`    <meta name="keywords" content="${escapeHtml(seoMeta.keywords)}">`);
    }

    // Canonical URL
    if (canonicalUrl) {
        tags.push(`    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
    }

    // Open Graph tags
    if (seoMeta.meta_title) {
        tags.push(`    <meta property="og:title" content="${escapeHtml(seoMeta.meta_title)}">`);
    }
    if (seoMeta.meta_description) {
        tags.push(`    <meta property="og:description" content="${escapeHtml(seoMeta.meta_description)}">`);
    }
    if (seoMeta.og_image) {
        tags.push(`    <meta property="og:image" content="${escapeHtml(seoMeta.og_image)}">`);
    }
    if (canonicalUrl) {
        tags.push(`    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">`);
    }
    tags.push('    <meta property="og:type" content="website">');

    // Twitter Card tags
    tags.push('    <meta name="twitter:card" content="summary_large_image">');
    if (seoMeta.meta_title) {
        tags.push(`    <meta name="twitter:title" content="${escapeHtml(seoMeta.meta_title)}">`);
    }
    if (seoMeta.meta_description) {
        tags.push(`    <meta name="twitter:description" content="${escapeHtml(seoMeta.meta_description)}">`);
    }
    if (seoMeta.og_image) {
        tags.push(`    <meta name="twitter:image" content="${escapeHtml(seoMeta.og_image)}">`);
    }

    // Add comment
    tags.push('    <!-- SEO metadata generated by YENZE -->');

    return tags.join('\n');
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
