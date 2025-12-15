/**
 * SEO Audit API
 * Analyzes project HTML for SEO best practices
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
        // Get project HTML
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('html, name, subdomain, published_url, meta_description, meta_keywords')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Run SEO audit
        const audit = performSEOAudit(project);

        return res.status(200).json({
            success: true,
            score: audit.score,
            issues: audit.issues,
            passed: audit.passed,
            warnings: audit.warnings,
            recommendations: audit.recommendations,
            details: audit.details
        });

    } catch (error) {
        console.error('SEO Audit error:', error);
        return res.status(500).json({
            error: 'Failed to run SEO audit',
            details: error.message
        });
    }
}

/**
 * Perform comprehensive SEO audit
 */
function performSEOAudit(project) {
    const html = project.html || '';
    const issues = [];
    const passed = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    // 1. Check for <title> tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
        issues.push({
            severity: 'error',
            message: 'Missing <title> tag',
            impact: -15,
            category: 'metadata'
        });
        score -= 15;
        recommendations.push('Add a descriptive <title> tag (50-60 characters)');
    } else {
        const titleLength = titleMatch[1].length;
        if (titleLength < 30 || titleLength > 60) {
            warnings.push({
                severity: 'warning',
                message: `Title length (${titleLength} chars) not optimal (50-60 recommended)`,
                impact: -5,
                category: 'metadata'
            });
            score -= 5;
        } else {
            passed.push('Title tag exists and has optimal length');
        }
    }

    // 2. Check for meta description
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (!metaDescMatch && !project.meta_description) {
        issues.push({
            severity: 'error',
            message: 'Missing meta description',
            impact: -10,
            category: 'metadata'
        });
        score -= 10;
        recommendations.push('Add meta description (150-160 characters)');
    } else {
        const descLength = (metaDescMatch?.[1] || project.meta_description || '').length;
        if (descLength < 120 || descLength > 160) {
            warnings.push({
                severity: 'warning',
                message: `Meta description length (${descLength} chars) not optimal (150-160 recommended)`,
                impact: -3,
                category: 'metadata'
            });
            score -= 3;
        } else {
            passed.push('Meta description exists and has optimal length');
        }
    }

    // 3. Check for H1 tag
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (!h1Match) {
        issues.push({
            severity: 'error',
            message: 'Missing <h1> heading',
            impact: -10,
            category: 'content'
        });
        score -= 10;
        recommendations.push('Add a single <h1> heading with main keyword');
    } else {
        const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
        if (h1Count > 1) {
            warnings.push({
                severity: 'warning',
                message: `Multiple <h1> tags found (${h1Count}), should only have 1`,
                impact: -5,
                category: 'content'
            });
            score -= 5;
        } else {
            passed.push('Single H1 heading present');
        }
    }

    // 4. Check heading hierarchy (H2, H3, etc.)
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    if (h2Count === 0 && h3Count === 0) {
        warnings.push({
            severity: 'warning',
            message: 'No heading hierarchy (H2, H3) found',
            impact: -5,
            category: 'content'
        });
        score -= 5;
        recommendations.push('Use H2 and H3 tags for content structure');
    } else {
        passed.push('Heading hierarchy present');
    }

    // 5. Check for alt text on images
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgTags.filter(img => !img.match(/alt=["'][^"']+["']/i));
    if (imgsWithoutAlt.length > 0) {
        issues.push({
            severity: 'error',
            message: `${imgsWithoutAlt.length} image(s) missing alt text`,
            impact: -8,
            category: 'accessibility'
        });
        score -= 8;
        recommendations.push('Add descriptive alt text to all images');
    } else if (imgTags.length > 0) {
        passed.push('All images have alt text');
    }

    // 6. Check for viewport meta tag (mobile-friendly)
    const viewportMatch = html.match(/<meta\s+name=["']viewport["']/i);
    if (!viewportMatch) {
        issues.push({
            severity: 'error',
            message: 'Missing viewport meta tag (not mobile-friendly)',
            impact: -12,
            category: 'mobile'
        });
        score -= 12;
        recommendations.push('Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    } else {
        passed.push('Viewport meta tag present (mobile-friendly)');
    }

    // 7. Check for Open Graph tags
    const ogTags = html.match(/<meta\s+property=["']og:[^"']+["']/gi) || [];
    if (ogTags.length === 0) {
        warnings.push({
            severity: 'warning',
            message: 'No Open Graph tags found (poor social sharing)',
            impact: -5,
            category: 'social'
        });
        score -= 5;
        recommendations.push('Add Open Graph tags (og:title, og:description, og:image)');
    } else {
        passed.push('Open Graph tags present');
    }

    // 8. Check for canonical URL
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']/i);
    if (!canonicalMatch) {
        warnings.push({
            severity: 'warning',
            message: 'Missing canonical URL',
            impact: -3,
            category: 'technical'
        });
        score -= 3;
        recommendations.push('Add canonical URL to avoid duplicate content issues');
    } else {
        passed.push('Canonical URL present');
    }

    // 9. Check content length
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;
    if (wordCount < 300) {
        warnings.push({
            severity: 'warning',
            message: `Content is thin (${wordCount} words), minimum 300 recommended`,
            impact: -5,
            category: 'content'
        });
        score -= 5;
        recommendations.push('Add more quality content (minimum 300 words)');
    } else {
        passed.push(`Good content length (${wordCount} words)`);
    }

    // 10. Check for external links
    const externalLinks = (html.match(/<a[^>]*href=["']https?:\/\/[^"']+["']/gi) || []).length;
    if (externalLinks === 0) {
        warnings.push({
            severity: 'info',
            message: 'No external links found',
            impact: -2,
            category: 'linking'
        });
        score -= 2;
    } else {
        passed.push(`${externalLinks} external link(s) found`);
    }

    // 11. Check for internal links
    const internalLinks = (html.match(/<a[^>]*href=["'][^"']*["']/gi) || [])
        .filter(link => !link.match(/https?:\/\//)).length;
    if (internalLinks === 0) {
        warnings.push({
            severity: 'info',
            message: 'No internal links found',
            impact: -2,
            category: 'linking'
        });
        score -= 2;
    } else {
        passed.push(`${internalLinks} internal link(s) found`);
    }

    // 12. Check for schema.org markup
    const schemaMatch = html.match(/schema\.org/i);
    if (!schemaMatch) {
        warnings.push({
            severity: 'info',
            message: 'No Schema.org markup found',
            impact: -3,
            category: 'technical'
        });
        score -= 3;
        recommendations.push('Consider adding Schema.org structured data');
    } else {
        passed.push('Schema.org markup present');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, Math.min(100, score));

    return {
        score: Math.round(score),
        issues: issues,
        passed: passed,
        warnings: warnings,
        recommendations: recommendations,
        details: {
            totalChecks: issues.length + passed.length + warnings.length,
            criticalIssues: issues.length,
            warningCount: warnings.length,
            passedChecks: passed.length
        }
    };
}
