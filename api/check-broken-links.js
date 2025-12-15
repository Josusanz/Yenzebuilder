/**
 * Check for broken links in a project
 * Crawls the HTML and tests all links
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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
            .select('html')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Extract all links from HTML
        const links = extractLinks(project.html);

        // Check each link (with timeout and concurrency limit)
        const results = await checkLinks(links);

        // Categorize results
        const brokenLinks = results.filter(r => r.status === 'broken');
        const workingLinks = results.filter(r => r.status === 'ok');
        const warningLinks = results.filter(r => r.status === 'warning');

        return res.status(200).json({
            total: results.length,
            broken: brokenLinks.length,
            working: workingLinks.length,
            warnings: warningLinks.length,
            links: results,
            summary: {
                health: brokenLinks.length === 0 ? 'healthy' : brokenLinks.length < 5 ? 'warning' : 'critical',
                checkedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Check broken links error:', error);
        return res.status(500).json({
            error: 'Failed to check links',
            details: error.message
        });
    }
}

/**
 * Extract links from HTML
 */
function extractLinks(html) {
    const links = [];
    const seen = new Set();

    // Extract <a> tags
    const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;

    while ((match = aRegex.exec(html)) !== null) {
        const href = match[1];
        if (!seen.has(href) && isValidUrl(href)) {
            seen.add(href);
            links.push({
                url: href,
                type: 'link',
                tag: 'a'
            });
        }
    }

    // Extract <img> tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (!seen.has(src) && isValidUrl(src)) {
            seen.add(src);
            links.push({
                url: src,
                type: 'image',
                tag: 'img'
            });
        }
    }

    // Extract <script> tags
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    while ((match = scriptRegex.exec(html)) !== null) {
        const src = match[1];
        if (!seen.has(src) && isValidUrl(src)) {
            seen.add(src);
            links.push({
                url: src,
                type: 'script',
                tag: 'script'
            });
        }
    }

    // Extract <link> tags (CSS)
    const linkRegex = /<link[^>]+href=["']([^"']+)["']/gi;
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (!seen.has(href) && isValidUrl(href)) {
            seen.add(href);
            links.push({
                url: href,
                type: 'stylesheet',
                tag: 'link'
            });
        }
    }

    return links;
}

/**
 * Check if URL is valid and should be checked
 */
function isValidUrl(url) {
    // Skip anchors, mailto, tel, javascript
    if (url.startsWith('#') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('javascript:') ||
        url.startsWith('data:')) {
        return false;
    }

    // Must be absolute URL or start with /
    return url.startsWith('http://') ||
           url.startsWith('https://') ||
           url.startsWith('//') ||
           url.startsWith('/');
}

/**
 * Check links with concurrency limit
 */
async function checkLinks(links, concurrency = 5) {
    const results = [];
    const queue = [...links];

    // Process in batches
    while (queue.length > 0) {
        const batch = queue.splice(0, concurrency);
        const batchResults = await Promise.all(
            batch.map(link => checkSingleLink(link))
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Check a single link
 */
async function checkSingleLink(link) {
    // Skip relative URLs (can't check without domain)
    if (link.url.startsWith('/')) {
        return {
            ...link,
            status: 'skipped',
            message: 'Relative URL - cannot check without domain',
            statusCode: null
        };
    }

    // Normalize protocol-relative URLs
    let url = link.url;
    if (url.startsWith('//')) {
        url = 'https:' + url;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            method: 'HEAD', // Use HEAD for faster checks
            signal: controller.signal,
            headers: {
                'User-Agent': 'YENZE-LinkChecker/1.0'
            },
            redirect: 'follow'
        });

        clearTimeout(timeout);

        const statusCode = response.status;

        if (statusCode >= 200 && statusCode < 300) {
            return {
                ...link,
                status: 'ok',
                message: 'Link is working',
                statusCode
            };
        } else if (statusCode >= 300 && statusCode < 400) {
            return {
                ...link,
                status: 'warning',
                message: 'Redirect detected',
                statusCode,
                redirectUrl: response.url
            };
        } else if (statusCode >= 400) {
            return {
                ...link,
                status: 'broken',
                message: `HTTP ${statusCode}`,
                statusCode
            };
        }

        return {
            ...link,
            status: 'warning',
            message: 'Unexpected status code',
            statusCode
        };

    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                ...link,
                status: 'broken',
                message: 'Timeout - server not responding',
                statusCode: null
            };
        }

        return {
            ...link,
            status: 'broken',
            message: error.message || 'Failed to fetch',
            statusCode: null
        };
    }
}
