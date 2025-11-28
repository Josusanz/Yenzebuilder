
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Authenticate User
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing authorization token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    // 2. Get Connected Account ID
    const connectedAccountId = user.user_metadata?.stripe_account_id;
    if (!connectedAccountId) {
        return res.status(400).json({ error: 'Stripe account not connected. Please connect Stripe first.' });
    }

    const { productName, amount, currency = 'usd' } = req.body;

    try {
        // 3. Create Product on Connected Account
        const product = await stripe.products.create({
            name: productName,
        }, {
            stripeAccount: connectedAccountId,
        });

        // 4. Create Price on Connected Account
        // Amount is in cents/smallest unit
        const priceAmount = Math.round(parseFloat(amount.replace(/[^0-9.]/g, '')) * 100);

        const price = await stripe.prices.create({
            unit_amount: priceAmount,
            currency: currency.toLowerCase(),
            product: product.id,
        }, {
            stripeAccount: connectedAccountId,
        });

        // 5. Create Payment Link with Platform Fee (5%)
        // We calculate the fee amount because application_fee_percent is not always reliable on Payment Links directly?
        // Actually, let's try application_fee_percent first, or calculate it.
        // Stripe Payment Links API supports application_fee_amount.
        // Fee = 5%
        const feeAmount = Math.round(priceAmount * 0.05);

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            application_fee_amount: feeAmount,
        }, {
            stripeAccount: connectedAccountId,
        });

        res.status(200).json({ url: paymentLink.url });

    } catch (error) {
        console.error('Create Payment Link Error:', error);
        res.status(500).json({ error: error.message });
    }
}
