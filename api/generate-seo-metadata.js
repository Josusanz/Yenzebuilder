/**
 * Generate SEO Metadata with AI
 * Uses Google Gemini to generate optimized SEO metadata
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectId, html, projectName } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('html, name')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const content = html || project.html || '';
        const name = projectName || project.name || 'My Website';

        let generatedMetadata;

        if (genAI) {
            // Use AI to generate metadata
            generatedMetadata = await generateWithAI(content, name);
        } else {
            // Fallback to simple extraction
            generatedMetadata = extractBasicMetadata(content, name);
        }

        return res.status(200).json({
            success: true,
            metadata: generatedMetadata
        });

    } catch (error) {
        console.error('Generate SEO metadata error:', error);
        return res.status(500).json({
            error: 'Failed to generate SEO metadata',
            details: error.message
        });
    }
}

/**
 * Generate metadata using AI
 */
async function generateWithAI(html, projectName) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Extract text content from HTML
        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000); // Limit to 2000 chars

        const prompt = `You are an SEO expert. Analyze this website content and generate optimized SEO metadata.

Project Name: ${projectName}

Website Content:
${textContent}

Generate the following in JSON format:
{
  "meta_title": "An engaging, keyword-rich title (50-60 characters)",
  "meta_description": "A compelling description that encourages clicks (150-160 characters)",
  "keywords": "5-10 relevant keywords, comma-separated"
}

Requirements:
- Title must be 50-60 characters
- Description must be 150-160 characters
- Keywords should be relevant to the content
- Make it engaging and click-worthy
- Include the project name if relevant

Return ONLY the JSON object, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const metadata = JSON.parse(jsonMatch[0]);
            return {
                meta_title: metadata.meta_title || `${projectName} - Website`,
                meta_description: metadata.meta_description || `Visit ${projectName} for more information.`,
                keywords: metadata.keywords || projectName
            };
        }

        throw new Error('Failed to parse AI response');

    } catch (error) {
        console.error('AI generation error:', error);
        // Fallback to basic extraction
        return extractBasicMetadata(html, projectName);
    }
}

/**
 * Extract basic metadata from HTML (fallback)
 */
function extractBasicMetadata(html, projectName) {
    // Extract existing title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const existingTitle = titleMatch ? titleMatch[1] : projectName;

    // Extract first paragraph or heading for description
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);

    const descText = h1Match ? h1Match[1] : (pMatch ? pMatch[1] : `Welcome to ${projectName}`);
    const cleanDesc = descText.replace(/<[^>]+>/g, '').trim();

    // Generate description
    let description = cleanDesc;
    if (description.length < 150) {
        description += `. Visit our website to learn more about ${projectName} and what we offer.`;
    }
    if (description.length > 160) {
        description = description.substring(0, 157) + '...';
    }

    // Extract keywords from headings and content
    const headings = (html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [])
        .map(h => h.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);

    const keywords = [...new Set([
        projectName,
        ...headings.slice(0, 5)
    ])].join(', ');

    return {
        meta_title: existingTitle.length > 60 ? existingTitle.substring(0, 57) + '...' : existingTitle,
        meta_description: description,
        keywords: keywords.substring(0, 200) // Limit keywords length
    };
}
