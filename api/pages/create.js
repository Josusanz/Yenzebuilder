/**
 * Create New Page
 * Adds a new page to a multi-page project
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

    const { projectId, slug, name, title, html, isHomepage, template } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!slug && !isHomepage) {
        return res.status(400).json({ error: 'Slug is required (or set isHomepage=true)' });
    }

    try {
        // Get project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('pages, project_type, navigation')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const pages = project.pages || [];

        // Validate slug uniqueness
        const normalizedSlug = (slug || '').toLowerCase().trim();
        const slugExists = pages.some(p => p.slug === normalizedSlug);

        if (slugExists) {
            return res.status(400).json({
                error: 'Slug already exists',
                message: 'Please choose a different URL slug'
            });
        }

        // If setting as homepage, unset other homepages
        if (isHomepage) {
            pages.forEach(p => p.is_homepage = false);
        }

        // Create new page object
        const newPage = {
            id: uuidv4(),
            slug: normalizedSlug,
            name: name || 'New Page',
            title: title || name || 'New Page',
            html: html || getTemplateHTML(template, name),
            seo_metadata: {
                meta_title: title || name || 'New Page',
                meta_description: '',
                keywords: '',
                canonical_url: '',
                og_image: ''
            },
            is_homepage: !!isHomepage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Add page to array
        pages.push(newPage);

        // Add to navigation if not already there
        const navigation = project.navigation || { items: [] };
        if (!navigation.items) navigation.items = [];

        navigation.items.push({
            label: name || 'New Page',
            link: normalizedSlug ? `/${normalizedSlug}` : '/',
            page_id: newPage.id
        });

        // Update project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                pages: pages,
                navigation: navigation,
                project_type: 'multi',  // Automatically convert to multi-page
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            message: 'Page created successfully',
            page: newPage,
            totalPages: pages.length
        });

    } catch (error) {
        console.error('Create page error:', error);
        return res.status(500).json({
            error: 'Failed to create page',
            details: error.message
        });
    }
}

/**
 * Get template HTML based on template type
 */
function getTemplateHTML(template, pageName) {
    const templates = {
        home: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName || 'Home'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.5rem; opacity: 0.9; }
    </style>
</head>
<body>
    <section class="hero">
        <div>
            <h1>Welcome to ${pageName || 'Our Website'}</h1>
            <p>Create something amazing</p>
        </div>
    </section>
</body>
</html>`,

        about: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName || 'About Us'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; }
        h1 { font-size: 2.5rem; margin-bottom: 2rem; color: #1f2937; }
        p { font-size: 1.125rem; line-height: 1.75; color: #4b5563; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>About Us</h1>
        <p>Tell your story here. Share your mission, vision, and what makes you unique.</p>
        <p>This is your opportunity to connect with your audience on a deeper level.</p>
    </div>
</body>
</html>`,

        contact: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName || 'Contact'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 4rem 2rem; }
        h1 { font-size: 2.5rem; margin-bottom: 2rem; color: #1f2937; }
        form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        input, textarea { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db;
                          border-radius: 4px; font-size: 1rem; }
        button { background: #667eea; color: white; padding: 0.75rem 2rem; border: none;
                 border-radius: 4px; font-size: 1rem; cursor: pointer; }
        button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Contact Us</h1>
        <form>
            <input type="text" placeholder="Name" required>
            <input type="email" placeholder="Email" required>
            <textarea rows="5" placeholder="Message" required></textarea>
            <button type="submit">Send Message</button>
        </form>
    </div>
</body>
</html>`,

        blog: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName || 'Blog'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; }
        h1 { font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
        article { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #e5e7eb; }
        h2 { font-size: 1.75rem; margin-bottom: 1rem; color: #374151; }
        .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem; }
        p { font-size: 1.125rem; line-height: 1.75; color: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Blog</h1>
        <article>
            <h2>Your First Post</h2>
            <div class="meta">January 15, 2025 • 5 min read</div>
            <p>Start sharing your thoughts, insights, and stories with the world.</p>
        </article>
    </div>
</body>
</html>`,

        blank: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName || 'New Page'}</title>
</head>
<body>
    <h1>${pageName || 'New Page'}</h1>
    <p>Start designing your page here.</p>
</body>
</html>`
    };

    return templates[template] || templates.blank;
}
