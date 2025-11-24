// API Route for Google Gemini AI Website Generation
// Generates HTML website code based on user description

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, userApiKey } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use user's API key if provided, otherwise use system key
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured',
        needsUserKey: true
      });
    }

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert web developer. Generate a complete, production-ready HTML website based on this description:

"${prompt}"

IMPORTANT REQUIREMENTS:
1. Generate a SINGLE, complete HTML file with inline CSS and JavaScript
2. Include DOCTYPE, html, head, and body tags
3. Make it responsive and mobile-friendly
4. Use modern CSS (flexbox/grid) and clean design
5. Include professional styling with good color schemes
6. Add semantic HTML5 elements
7. Make it visually appealing with proper spacing and typography
8. Include smooth transitions and hover effects
9. Ensure the design matches the user's description closely
10. DO NOT include any explanations or comments outside the HTML - ONLY return the HTML code

Return ONLY the HTML code, nothing else.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      // Check if it's a rate limit error
      if (response.status === 429 || errorData.error?.message?.includes('quota')) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please use your own API key.',
          needsUserKey: true,
          rateLimitExceeded: true
        });
      }

      console.error('Gemini API error:', errorData);
      return res.status(500).json({
        error: errorData.error?.message || 'Failed to generate website'
      });
    }

    const data = await response.json();

    // Extract the generated HTML from Gemini's response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({ error: 'No content generated' });
    }

    // Clean up the response - remove markdown code blocks if present
    let html = generatedText.trim();

    // Remove markdown code fences if present
    html = html.replace(/^```html\n?/i, '');
    html = html.replace(/^```\n?/i, '');
    html = html.replace(/\n?```$/i, '');
    html = html.trim();

    // Validate that we got HTML
    if (!html.toLowerCase().includes('<!doctype') && !html.toLowerCase().includes('<html')) {
      return res.status(500).json({
        error: 'Generated content is not valid HTML'
      });
    }

    return res.status(200).json({
      html,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0
    });

  } catch (error) {
    console.error('AI Generation error:', error);
    return res.status(500).json({
      error: 'An error occurred while generating the website',
      details: error.message
    });
  }
}
