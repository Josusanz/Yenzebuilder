const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Track a conversion for an A/B test variant
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
        const { variantId, conversionType = 'default' } = req.body;

        if (!variantId) {
            return res.status(400).json({ error: 'Variant ID required' });
        }

        // Get current conversion count
        const { data: variant, error: selectError } = await supabase
            .from('ab_test_variants')
            .select('conversions')
            .eq('id', variantId)
            .single();

        if (selectError || !variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        // Increment conversion count
        const { error: updateError } = await supabase
            .from('ab_test_variants')
            .update({
                conversions: (variant.conversions || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', variantId);

        if (updateError) throw updateError;

        return res.status(200).json({
            success: true,
            conversions: variant.conversions + 1
        });

    } catch (error) {
        console.error('Conversion tracking error:', error);
        return res.status(500).json({ error: 'Failed to track conversion' });
    }
}
