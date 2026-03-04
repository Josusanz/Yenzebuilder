const { createClient } = require('@supabase/supabase-js');
const JSZip = require('jszip');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { projectId, format = 'html' } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
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

        // Get project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get project pages if multi-page
        let pages = [];
        if (project.project_type === 'multi') {
            const { data: pagesData } = await supabase
                .from('pages')
                .select('*')
                .eq('project_id', projectId)
                .order('is_homepage', { ascending: false });
            pages = pagesData || [];
        }

        // Generate clean HTML
        const generateCleanHTML = (htmlContent, title = 'My Website') => {
            // If content is already a full HTML document, return it cleaned
            if (htmlContent && htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html')) {
                return cleanHTML(htmlContent);
            }

            // Otherwise wrap in basic HTML structure
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
</head>
<body>
${htmlContent || ''}
</body>
</html>`;
        };

        // Clean HTML from editor artifacts
        const cleanHTML = (html) => {
            if (!html) return '';

            return html
                // Remove YENZE editor attributes
                .replace(/\s*data-yenze-[^=]*="[^"]*"/g, '')
                .replace(/\s*data-element-id="[^"]*"/g, '')
                .replace(/\s*contenteditable="[^"]*"/g, '')
                // Remove editor classes
                .replace(/\s*class="[^"]*yenze-[^"]*"/g, '')
                // Remove inline editor styles
                .replace(/outline:\s*[^;]*yenze[^;]*;?/g, '')
                // Clean up extra whitespace
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                .trim();
        };

        // Sanitize filename for Content-Disposition header
        const safeFilename = (project.name || 'website')
            .replace(/[^a-zA-Z0-9-_\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) || 'website';

        if (format === 'html') {
            // Single HTML file export
            const html = generateCleanHTML(project.html_content, project.name);

            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.html"`);
            return res.status(200).send(html);
        }

        if (format === 'zip') {
            // ZIP export with all files
            const zip = new JSZip();

            if (project.project_type === 'multi' && pages.length > 0) {
                // Multi-page project
                pages.forEach((page, index) => {
                    const filename = page.is_homepage ? 'index.html' : `${page.slug || page.name || `page-${index}`}.html`;
                    const html = generateCleanHTML(page.html_content, page.title || page.name);
                    zip.file(filename, html);
                });
            } else {
                // Single page project
                const html = generateCleanHTML(project.html_content, project.name);
                zip.file('index.html', html);
            }

            // Add CSS file if there's custom CSS
            if (project.custom_css) {
                zip.file('styles.css', project.custom_css);
            }

            // Add a readme
            zip.file('README.txt', `
${project.name || 'My Website'}
================================
Exported from YENZE Builder
https://yenze.io

Files included:
- index.html (main page)
${pages.length > 1 ? pages.filter(p => !p.is_homepage).map(p => `- ${p.slug || p.name}.html`).join('\n') : ''}
${project.custom_css ? '- styles.css (custom styles)' : ''}

To view your website:
1. Open index.html in any web browser
2. Or upload all files to your web hosting

Need help? Contact support@yenze.io
`);

            // Generate ZIP
            const zipBuffer = await zip.generateAsync({
                type: 'nodebuffer',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.zip"`);
            return res.status(200).send(zipBuffer);
        }

        return res.status(400).json({ error: 'Invalid format. Use "html" or "zip"' });

    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({ error: 'Failed to export project' });
    }
}
