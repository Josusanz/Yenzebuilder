const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, model = 'gemini-1.5-flash' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use server-side API key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({ error: 'Server configuration error: API Key not found' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Map model names if needed, or pass through
        // Note: gemini-2.0-flash-exp might not be available via this SDK version yet, 
        // but we can try passing the string directly.
        const generativeModel = genAI.getGenerativeModel({ model: model });

        const result = await generativeModel.generateContent(prompt + "\n\nIMPORTANT: Return ONLY the HTML code. Do not include markdown formatting like ```html or ```. Just the raw HTML code.");
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            code: text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to generate content',
            details: error.toString()
        });
    }
};
