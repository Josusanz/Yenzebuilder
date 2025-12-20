/**
 * Verify Google Search Console Property
 * Automatically handles verification file upload
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

    const { projectId, verificationFile } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('html, seo_metadata')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // If verification file is provided, inject it into the HTML
        if (verificationFile) {
            // Extract filename from verification file (e.g., "google4aa3d892271c286b.html")
            const filename = verificationFile.match(/google[a-f0-9]+\.html/i)?.[0];

            if (!filename) {
                return res.status(400).json({ error: 'Invalid verification file format' });
            }

            // Create verification meta tag and file content
            const verificationCode = filename.replace('google', '').replace('.html', '');
            const verificationMetaTag = `<meta name="google-site-verification" content="${verificationCode}" />`;

            // Check if meta tag already exists
            let updatedHtml = project.html;
            if (!updatedHtml.includes('google-site-verification')) {
                // Add meta tag to head
                if (updatedHtml.includes('</head>')) {
                    updatedHtml = updatedHtml.replace('</head>', `    ${verificationMetaTag}\n</head>`);
                } else if (updatedHtml.includes('<head>')) {
                    updatedHtml = updatedHtml.replace('<head>', `<head>\n    ${verificationMetaTag}`);
                } else {
                    // No head tag, add at the beginning
                    updatedHtml = verificationMetaTag + '\n' + updatedHtml;
                }

                // Update project HTML with verification tag
                const { error: updateError } = await supabase
                    .from('projects')
                    .update({
                        html: updatedHtml,
                        seo_metadata: {
                            ...(project.seo_metadata || {}),
                            google_verification_file: filename,
                            google_verification_code: verificationCode,
                            google_verified_at: new Date().toISOString()
                        }
                    })
                    .eq('id', projectId);

                if (updateError) {
                    throw updateError;
                }

                return res.status(200).json({
                    success: true,
                    message: 'Verification meta tag added to your website',
                    verificationFile: filename,
                    verificationCode: verificationCode,
                    method: 'meta_tag',
                    nextSteps: [
                        'Your website now includes the Google verification meta tag',
                        'Go back to Google Search Console and click "Verify"',
                        'Google will automatically detect the verification tag'
                    ]
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Verification tag already exists',
                    method: 'meta_tag'
                });
            }
        }

        // If no verification file, return instructions
        return res.status(200).json({
            success: false,
            message: 'Verification file required',
            instructions: [
                '1. Go to Google Search Console',
                '2. Add your property',
                '3. Choose "HTML file" verification method',
                '4. Copy the filename (e.g., google4aa3d892271c286b.html)',
                '5. Send it back to this API with verificationFile parameter'
            ]
        });

    } catch (error) {
        console.error('Verify Google property error:', error);
        return res.status(500).json({
            error: 'Failed to verify property',
            details: error.message
        });
    }
}
