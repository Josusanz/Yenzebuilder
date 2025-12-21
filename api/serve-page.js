/**
 * Dynamic Page Router
 * Serves the correct page HTML based on URL slug for multi-page projects
 * Falls back to single-page HTML for single-page projects
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

    // Get project identifier (subdomain, custom domain, or public slug)
    const { projectId, subdomain, domain, slug: publicSlug, page: pageSlug } = req.query;

    try {
        let project;

        // Find project by different identifiers
        if (projectId) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error) throw error;
            project = data;
        } else if (subdomain) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('subdomain_slug', subdomain)
                .single();

            if (error) throw error;
            project = data;
        } else if (domain) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('custom_domain', domain)
                .single();

            if (error) throw error;
            project = data;
        } else if (publicSlug) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('public_slug', publicSlug)
                .single();

            if (error) throw error;
            project = data;
        } else {
            return res.status(400).json({ error: 'Project identifier required' });
        }

        if (!project) {
            return res.status(404).send(render404Page('Project not found'));
        }

        // Check project type
        if (project.project_type === 'multi' && project.pages && Array.isArray(project.pages) && project.pages.length > 0) {
            // Multi-page project: find the requested page
            const requestedSlug = (pageSlug || '').toLowerCase().trim();

            // Find page by slug (empty slug = homepage)
            const page = project.pages.find(p => p.slug === requestedSlug);

            if (page) {
                // Serve the page HTML
                res.setHeader('Content-Type', 'text/html');
                return res.status(200).send(page.html);
            } else {
                // Page not found - show 404
                const availablePages = project.pages.map(p => ({
                    name: p.name,
                    url: p.slug ? `/${p.slug}` : '/'
                }));

                return res.status(404).send(render404Page('Page not found', availablePages, project));
            }
        } else {
            // Single-page project: serve the main HTML
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(project.html || renderEmptyPage(project.name));
        }

    } catch (error) {
        console.error('Serve page error:', error);
        return res.status(500).send(render500Page(error.message));
    }
}

/**
 * Render 404 page
 */
function render404Page(message, availablePages = [], project = null) {
    const baseUrl = project?.custom_domain
        ? `https://${project.custom_domain}`
        : project?.subdomain_slug
        ? `https://${project.subdomain_slug}.yenze.io`
        : project?.public_slug
        ? `https://yenze.io/s/${project.public_slug}`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .error-code {
            font-size: 6rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2rem;
            color: #1f2937;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        .pages-list {
            text-align: left;
            background: #f9fafb;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
        .pages-list h2 {
            font-size: 1rem;
            color: #374151;
            margin-bottom: 1rem;
        }
        .pages-list ul {
            list-style: none;
        }
        .pages-list li {
            margin-bottom: 0.5rem;
        }
        .pages-list a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        .pages-list a:hover {
            color: #764ba2;
            text-decoration: underline;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>${message || 'The page you are looking for does not exist.'}</p>
        ${baseUrl ? `<a href="${baseUrl}" class="btn">Go to Homepage</a>` : ''}
        ${availablePages.length > 0 ? `
        <div class="pages-list">
            <h2>Available Pages:</h2>
            <ul>
                ${availablePages.map(page => `<li><a href="${baseUrl}${page.url}">${page.name}</a></li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
}

/**
 * Render 500 error page
 */
function render500Page(error) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Server Error</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f43f5e 0%, #dc2626 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .error-code {
            font-size: 6rem;
            font-weight: 800;
            color: #dc2626;
            line-height: 1;
            margin-bottom: 1rem;
        }
        h1 { font-size: 2rem; color: #1f2937; margin-bottom: 1rem; }
        p { font-size: 1.125rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-code">500</div>
        <h1>Server Error</h1>
        <p>Something went wrong on our end. Please try again later.</p>
    </div>
</body>
</html>`;
}

/**
 * Render empty page for projects with no HTML
 */
function renderEmptyPage(projectName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName || 'New Project'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.5rem; opacity: 0.9; }
    </style>
</head>
<body>
    <div>
        <h1>${projectName || 'New Project'}</h1>
        <p>Your project is ready to be built</p>
    </div>
</body>
</html>`;
}
