/**
 * Secure Client Configuration API
 * Returns only client-safe configuration data
 * Sensitive keys remain server-side only
 */

module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Client-safe configuration
        const clientConfig = {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY, // Anon key is safe to expose
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY, // Public key is safe
            googleClientId: process.env.GOOGLE_CLIENT_ID, // Client ID is safe

            // Payment links (safe to expose)
            paymentLinks: {
                starter: process.env.STRIPE_LINK_STARTER,
                pro: process.env.STRIPE_LINK_PRO,
                business: process.env.STRIPE_LINK_BUSINESS
            },

            // Price IDs (safe to expose, needed for checkout)
            priceIds: {
                starter: process.env.STRIPE_PRICE_STARTER,
                pro: process.env.STRIPE_PRICE_PRO,
                business: process.env.STRIPE_PRICE_BUSINESS
            }
        };

        // Log missing fields but don't fail - allow partial functionality
        if (!clientConfig.supabaseUrl || !clientConfig.supabaseAnonKey) {
            console.warn('[ClientConfig] Missing Supabase configuration - auth features disabled');
        }

        if (!clientConfig.stripePublicKey) {
            console.warn('[ClientConfig] Missing Stripe configuration - payment features disabled');
        }

        // Set cache headers (5 minutes)
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        res.setHeader('Content-Type', 'application/json');

        return res.status(200).json(clientConfig);

    } catch (error) {
        console.error('Error loading client configuration:', error);
        return res.status(500).json({ error: 'Failed to load configuration' });
    }
};
