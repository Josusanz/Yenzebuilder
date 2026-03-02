// Analytics API endpoint
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            event,
            data,
            sessionId,
            timestamp,
            page,
            referrer,
            userAgent,
            screenSize,
            language
        } = req.body;

        // Extract project info from page URL
        // Assume format: /s/slug or /sites/slug
        let projectSlug = null;
        if (page) {
            const match = page.match(/\/s\/([^\/]+)|\/sites\/([^\/]+)/);
            if (match) {
                projectSlug = match[1] || match[2];
            }
        }

        // Find project ID from slug
        let projectId = null;
        if (projectSlug) {
            const { data: project } = await supabase
                .from('projects')
                .select('id')
                .or(`public_slug.eq.${projectSlug},subdomain_slug.eq.${projectSlug}`)
                .single();

            projectId = project?.id;
        }

        // Parse user agent for device/browser info
        const deviceInfo = parseUserAgent(userAgent);

        // Insert analytics event
        const { error } = await supabase
            .from('analytics_events')
            .insert({
                project_id: projectId,
                event: event,
                data: data,
                session_id: sessionId,
                page: page,
                referrer: referrer,
                user_agent: userAgent,
                device_type: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                screen_size: screenSize,
                language: language,
                created_at: timestamp || new Date().toISOString()
            });

        if (error) {
            console.error('Analytics insert error:', error);
            // Don't fail the request if analytics fails
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Analytics error:', error);
        // Return success anyway to not break user experience
        return res.status(200).json({ success: true });
    }
};

function parseUserAgent(ua) {
    if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' };

    const lower = ua.toLowerCase();

    // Device
    let device = 'desktop';
    if (lower.includes('mobile')) device = 'mobile';
    else if (lower.includes('tablet') || lower.includes('ipad')) device = 'tablet';

    // Browser
    let browser = 'unknown';
    if (lower.includes('chrome')) browser = 'Chrome';
    else if (lower.includes('safari')) browser = 'Safari';
    else if (lower.includes('firefox')) browser = 'Firefox';
    else if (lower.includes('edge')) browser = 'Edge';
    else if (lower.includes('opera')) browser = 'Opera';

    // OS
    let os = 'unknown';
    if (lower.includes('windows')) os = 'Windows';
    else if (lower.includes('mac')) os = 'macOS';
    else if (lower.includes('linux')) os = 'Linux';
    else if (lower.includes('android')) os = 'Android';
    else if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';

    return { device, browser, os };
}
