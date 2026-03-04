const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        // GET - List A/B test variants for a project
        if (req.method === 'GET') {
            const { projectId } = req.query;

            if (!projectId) {
                return res.status(400).json({ error: 'Project ID required' });
            }

            // Verify project ownership
            const { data: project } = await supabase
                .from('projects')
                .select('id, ab_testing_enabled')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const { data: variants, error } = await supabase
                .from('ab_test_variants')
                .select('*')
                .eq('project_id', projectId)
                .order('is_control', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) throw error;

            return res.status(200).json({
                ab_testing_enabled: project.ab_testing_enabled,
                variants: variants || []
            });
        }

        // POST - Create a new variant
        if (req.method === 'POST') {
            const { projectId, name, html_content, weight = 50 } = req.body;

            if (!projectId || !name) {
                return res.status(400).json({ error: 'Project ID and name are required' });
            }

            // Verify project ownership and get current content
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Check if this is the first variant (should be control)
            const { count } = await supabase
                .from('ab_test_variants')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId);

            const isControl = count === 0;

            // If creating control variant, use current project content
            const variantContent = isControl ? project.html_content : (html_content || project.html_content);

            // Create variant
            const { data: variant, error } = await supabase
                .from('ab_test_variants')
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    name,
                    html_content: variantContent,
                    weight: isControl ? 50 : weight,
                    is_control: isControl,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                variant
            });
        }

        // PUT - Update a variant
        if (req.method === 'PUT') {
            const { variantId, name, html_content, weight, is_active } = req.body;

            if (!variantId) {
                return res.status(400).json({ error: 'Variant ID required' });
            }

            // Verify ownership
            const { data: existing } = await supabase
                .from('ab_test_variants')
                .select('id, is_control')
                .eq('id', variantId)
                .eq('user_id', user.id)
                .single();

            if (!existing) {
                return res.status(404).json({ error: 'Variant not found' });
            }

            const updates = { updated_at: new Date().toISOString() };
            if (name !== undefined) updates.name = name;
            if (html_content !== undefined) updates.html_content = html_content;
            if (weight !== undefined) updates.weight = Math.min(100, Math.max(0, weight));
            if (is_active !== undefined && !existing.is_control) updates.is_active = is_active;

            const { error } = await supabase
                .from('ab_test_variants')
                .update(updates)
                .eq('id', variantId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        // DELETE - Delete a variant
        if (req.method === 'DELETE') {
            const { variantId } = req.body;

            if (!variantId) {
                return res.status(400).json({ error: 'Variant ID required' });
            }

            // Verify ownership and check if control
            const { data: existing } = await supabase
                .from('ab_test_variants')
                .select('id, is_control')
                .eq('id', variantId)
                .eq('user_id', user.id)
                .single();

            if (!existing) {
                return res.status(404).json({ error: 'Variant not found' });
            }

            if (existing.is_control) {
                return res.status(400).json({ error: 'Cannot delete control variant' });
            }

            const { error } = await supabase
                .from('ab_test_variants')
                .delete()
                .eq('id', variantId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('A/B Test error:', error);
        return res.status(500).json({ error: 'A/B test operation failed' });
    }
}
