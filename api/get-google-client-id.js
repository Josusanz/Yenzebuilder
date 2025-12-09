module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Return the Google Client ID from environment variables
    // Ensure you have added GOOGLE_CLIENT_ID to your Vercel Environment Variables
    res.status(200).json({
        clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
    });
};
