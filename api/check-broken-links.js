/**
 * Check for broken links in a project
 * Crawls the HTML and tests all links
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
            statusCode: null,
            suggestion: null
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
                statusCode,
                suggestion: null
            };
        } else if (statusCode >= 300 && statusCode < 400) {
            return {
                ...link,
                status: 'warning',
                message: 'Redirect detected',
                statusCode,
                redirectUrl: response.url,
                suggestion: {
                    action: 'Update link to final destination',
                    fix: `Change "${link.url}" to "${response.url}"`,
                    reason: 'Redirects slow down page load and hurt SEO',
                    severity: 'medium'
                }
            };
        } else if (statusCode >= 400) {
            const suggestion = generateFixSuggestion(link, statusCode, url);
            return {
                ...link,
                status: 'broken',
                message: `HTTP ${statusCode}`,
                statusCode,
                suggestion
            };
        }

        return {
            ...link,
            status: 'warning',
            message: 'Unexpected status code',
            statusCode,
            suggestion: null
        };

    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                ...link,
                status: 'broken',
                message: 'Timeout - server not responding',
                statusCode: null,
                suggestion: {
                    action: 'Check server or remove link',
                    fix: 'The server is not responding. Verify the URL is correct or remove this link.',
                    reason: 'Timeouts indicate the server is down or unreachable',
                    severity: 'high'
                }
            };
        }

        const suggestion = generateErrorSuggestion(link, error);
        return {
            ...link,
            status: 'broken',
            message: error.message || 'Failed to fetch',
            statusCode: null,
            suggestion
        };
    }
}

/**
 * Generate intelligent fix suggestion based on status code
 */
function generateFixSuggestion(link, statusCode, url) {
    const suggestions = {
        404: {
            action: 'Fix or remove broken link',
            fix: `The page at "${url}" does not exist. Check for typos in the URL or remove the link.`,
            reason: '404 errors hurt SEO and create a bad user experience',
            severity: 'high',
            possibleFixes: [
                'Check if the URL has a typo',
                'Search for the correct URL on the website',
                'Use web.archive.org to find the old content',
                'Remove the link if the page no longer exists'
            ]
        },
        403: {
            action: 'Check permissions',
            fix: `Access forbidden to "${url}". This might be behind authentication or have IP restrictions.`,
            reason: 'Users won\'t be able to access this resource',
            severity: 'high',
            possibleFixes: [
                'Verify the URL is meant to be public',
                'Check if login is required',
                'Contact the website owner for access',
                'Remove link if it should not be public'
            ]
        },
        500: {
            action: 'Server error - may be temporary',
            fix: `Server error at "${url}". This might be temporary, check again later.`,
            reason: 'Server errors are usually temporary but should be monitored',
            severity: 'medium',
            possibleFixes: [
                'Wait and check again in a few hours',
                'Contact the website administrator',
                'Find an alternative resource',
                'Add a note that the link may be temporarily unavailable'
            ]
        },
        default: {
            action: 'Investigate and fix',
            fix: `HTTP error ${statusCode} for "${url}". Check the URL and server status.`,
            reason: 'Unexpected HTTP errors should be investigated',
            severity: 'medium',
            possibleFixes: [
                'Verify the URL is correct',
                'Check if the website is down',
                'Try accessing the URL in a browser',
                'Consider finding an alternative link'
            ]
        }
    };

    return suggestions[statusCode] || suggestions.default;
}

/**
 * Generate suggestion based on error type
 */
function generateErrorSuggestion(link, error) {
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes('dns') || errorMsg.includes('getaddrinfo')) {
        return {
            action: 'DNS error - domain does not exist',
            fix: `The domain in "${link.url}" cannot be found. Check if the domain name is correct.`,
            reason: 'DNS errors mean the domain doesn\'t exist or is misconfigured',
            severity: 'critical',
            possibleFixes: [
                'Check for typos in the domain name',
                'Verify the domain is still registered',
                'Use a domain checker tool',
                'Remove the link if the site is permanently gone'
            ]
        };
    }

    if (errorMsg.includes('ssl') || errorMsg.includes('certificate')) {
        return {
            action: 'SSL/Certificate error',
            fix: `SSL certificate issue with "${link.url}". The site may be insecure or misconfigured.`,
            reason: 'SSL errors indicate security issues',
            severity: 'high',
            possibleFixes: [
                'Try changing https:// to http:// (if appropriate)',
                'Contact the website owner about their SSL certificate',
                'Find an alternative secure resource',
                'Warn users if linking is necessary'
            ]
        };
    }

    if (errorMsg.includes('network') || errorMsg.includes('econnrefused')) {
        return {
            action: 'Network error',
            fix: `Cannot connect to "${link.url}". The server may be down or blocking requests.`,
            reason: 'Connection refused means the server is unreachable',
            severity: 'high',
            possibleFixes: [
                'Check if the website is down using a service like downforeveryoneorjustme.com',
                'Verify the URL is correct',
                'Try again later - may be temporary',
                'Find an alternative resource'
            ]
        };
    }

    return {
        action: 'Fix or remove link',
        fix: `Error accessing "${link.url}": ${error.message}`,
        reason: 'Link cannot be accessed',
        severity: 'medium',
        possibleFixes: [
            'Verify the URL is correct',
            'Check if the resource exists',
            'Try accessing in a browser',
            'Consider removing if permanently broken'
        ]
    };
}
