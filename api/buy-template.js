// API Route: /api/buy-template
// Creates a Stripe checkout session for purchasing templates
// Uses Stripe Connect: 70% to creator, 30% platform fee

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Platform fee percentage (30%)
const PLATFORM_FEE_PERCENT = 30;

// Template catalog with creator info
// In production, this would come from database
const TEMPLATES = {
    'saas-dashboard-pro': {
        name: 'SaaS Dashboard Pro',
        price: 2900, // $29 in cents
        description: 'Complete admin dashboard with charts, tables, and dark mode',
        creatorId: 'platform', // 'platform' = your own templates (100% to you)
        stripeAccountId: null // null = platform owns this template
    },
    'startup-landing-pro': {
        name: 'Startup Landing Pro',
        price: 1900,
        description: 'High-converting landing page with pricing tables and testimonials',
        creatorId: 'platform',
        stripeAccountId: null
    },
    'portfolio-developer': {
        name: 'Developer Portfolio',
        price: 1500,
        description: 'Terminal-style portfolio for developers',
        creatorId: 'platform',
        stripeAccountId: null
    },
    'agency-starter': {
        name: 'Agency Starter Kit',
        price: 3900,
        description: 'Complete agency website template',
        creatorId: 'platform',
        stripeAccountId: null
    },
    'ecommerce-starter': {
        name: 'E-commerce Starter',
        price: 4900,
        description: 'Product showcase with cart UI',
        creatorId: 'platform',
        stripeAccountId: null
    }
    // Example of third-party creator template:
    // 'creator-template-1': {
    //     name: 'Creator Template',
    //     price: 2500,
    //     description: 'Template by external creator',
    //     creatorId: 'creator_123',
    //     stripeAccountId: 'acct_xxx' // Creator's Stripe Connect account
    // }
};

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { templateId, email } = req.body;

        console.log('[BuyTemplate] Request:', { templateId, email });

        // Validate input
        if (!templateId || !email) {
            return res.status(400).json({ error: 'Missing templateId or email' });
        }

        const template = TEMPLATES[templateId];
        if (!template) {
            return res.status(400).json({
                error: 'Template not found',
                availableTemplates: Object.keys(TEMPLATES)
            });
        }

        // Save lead
        try {
            await supabase.from('leads').upsert({
                email: email,
                source: 'template_purchase',
                created_at: new Date().toISOString()
            }, { onConflict: 'email' });
        } catch (e) {
            console.log('[BuyTemplate] Lead save warning:', e.message);
        }

        // Build checkout session config
        const sessionConfig = {
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: template.name,
                            description: template.description,
                            metadata: { template_id: templateId }
                        },
                        unit_amount: template.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `https://yenze.io/templates/success.html?session_id={CHECKOUT_SESSION_ID}&template=${templateId}`,
            cancel_url: `https://yenze.io/templates?canceled=true`,
            metadata: {
                template_id: templateId,
                email: email,
                creator_id: template.creatorId
            },
            allow_promotion_codes: true,
        };

        // If template has a creator (Stripe Connect), split payment
        if (template.stripeAccountId) {
            // Calculate platform fee (30%)
            const platformFee = Math.round(template.price * (PLATFORM_FEE_PERCENT / 100));

            sessionConfig.payment_intent_data = {
                application_fee_amount: platformFee,
                transfer_data: {
                    destination: template.stripeAccountId,
                },
            };

            console.log('[BuyTemplate] Split payment:', {
                total: template.price,
                platformFee: platformFee,
                creatorReceives: template.price - platformFee
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log('[BuyTemplate] Session created:', session.id);

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('[BuyTemplate] Error:', error);
        res.status(500).json({ error: error.message });
    }
};
