import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Serve an A/B test variant for a project
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { projectId, visitorId } = req.method === 'GET' ? req.query : req.body;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID required' });
        }

        // Check if project has A/B testing enabled
        const { data: project } = await supabase
            .from('projects')
            .select('id, ab_testing_enabled, html_content')
            .eq('id', projectId)
            .single();

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // If A/B testing not enabled, return original content
        if (!project.ab_testing_enabled) {
            return res.status(200).json({
                variant_id: null,
                variant_name: 'Original',
                is_ab_test: false
            });
        }

        // Get active variants
        const { data: variants } = await supabase
            .from('ab_test_variants')
            .select('*')
            .eq('project_id', projectId)
            .eq('is_active', true)
            .order('is_control', { ascending: false });

        if (!variants || variants.length === 0) {
            return res.status(200).json({
                variant_id: null,
                variant_name: 'Original',
                is_ab_test: false
            });
        }

        // Select variant based on visitor ID (consistent assignment)
        let selectedVariant;

        if (visitorId) {
            // Use visitor ID to consistently assign same variant
            const hash = hashString(visitorId + projectId);
            const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
            let weightedRandom = hash % totalWeight;

            for (const variant of variants) {
                weightedRandom -= variant.weight;
                if (weightedRandom < 0) {
                    selectedVariant = variant;
                    break;
                }
            }
        } else {
            // Random weighted selection
            const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
            let random = Math.random() * totalWeight;

            for (const variant of variants) {
                random -= variant.weight;
                if (random < 0) {
                    selectedVariant = variant;
                    break;
                }
            }
        }

        // Fallback to control if no variant selected
        if (!selectedVariant) {
            selectedVariant = variants.find(v => v.is_control) || variants[0];
        }

        // Track the view
        await supabase
            .from('ab_test_variants')
            .update({ views: selectedVariant.views + 1 })
            .eq('id', selectedVariant.id);

        return res.status(200).json({
            variant_id: selectedVariant.id,
            variant_name: selectedVariant.name,
            is_control: selectedVariant.is_control,
            is_ab_test: true,
            html_content: selectedVariant.html_content
        });

    } catch (error) {
        console.error('A/B variant error:', error);
        return res.status(500).json({ error: 'Failed to get variant' });
    }
}

// Track conversion for a variant
export async function trackConversion(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { variantId, conversionType = 'default' } = req.body;

        if (!variantId) {
            return res.status(400).json({ error: 'Variant ID required' });
        }

        // Increment conversion count
        const { data: variant } = await supabase
            .from('ab_test_variants')
            .select('conversions')
            .eq('id', variantId)
            .single();

        if (variant) {
            await supabase
                .from('ab_test_variants')
                .update({ conversions: variant.conversions + 1 })
                .eq('id', variantId);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Conversion tracking error:', error);
        return res.status(500).json({ error: 'Failed to track conversion' });
    }
}

// Simple hash function for consistent variant assignment
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
