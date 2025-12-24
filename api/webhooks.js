import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
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
        // GET - List webhooks for a project
        if (req.method === 'GET') {
            const { projectId } = req.query;

            if (!projectId) {
                return res.status(400).json({ error: 'Project ID required' });
            }

            const { data: webhooks, error } = await supabase
                .from('form_webhooks')
                .select('id, name, url, events, is_active, created_at')
                .eq('project_id', projectId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return res.status(200).json({ webhooks: webhooks || [] });
        }

        // POST - Create a webhook
        if (req.method === 'POST') {
            const { projectId, name, url, events = ['form_submission'], headers = {} } = req.body;

            if (!projectId || !name || !url) {
                return res.status(400).json({ error: 'Project ID, name, and URL are required' });
            }

            // Validate URL
            try {
                new URL(url);
            } catch {
                return res.status(400).json({ error: 'Invalid webhook URL' });
            }

            // Verify project ownership
            const { data: project } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Generate webhook secret
            const secret = crypto.randomBytes(32).toString('hex');

            // Create webhook
            const { data: webhook, error } = await supabase
                .from('form_webhooks')
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    name,
                    url,
                    secret,
                    events,
                    headers,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                webhook: {
                    id: webhook.id,
                    name: webhook.name,
                    url: webhook.url,
                    secret: webhook.secret,
                    events: webhook.events,
                    is_active: webhook.is_active
                }
            });
        }

        // PUT - Update a webhook
        if (req.method === 'PUT') {
            const { webhookId, name, url, events, is_active, headers } = req.body;

            if (!webhookId) {
                return res.status(400).json({ error: 'Webhook ID required' });
            }

            // Verify ownership
            const { data: existing } = await supabase
                .from('form_webhooks')
                .select('id')
                .eq('id', webhookId)
                .eq('user_id', user.id)
                .single();

            if (!existing) {
                return res.status(404).json({ error: 'Webhook not found' });
            }

            const updates = {};
            if (name !== undefined) updates.name = name;
            if (url !== undefined) {
                try {
                    new URL(url);
                    updates.url = url;
                } catch {
                    return res.status(400).json({ error: 'Invalid webhook URL' });
                }
            }
            if (events !== undefined) updates.events = events;
            if (is_active !== undefined) updates.is_active = is_active;
            if (headers !== undefined) updates.headers = headers;
            updates.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('form_webhooks')
                .update(updates)
                .eq('id', webhookId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        // DELETE - Delete a webhook
        if (req.method === 'DELETE') {
            const { webhookId } = req.body;

            if (!webhookId) {
                return res.status(400).json({ error: 'Webhook ID required' });
            }

            // Verify ownership
            const { data: existing } = await supabase
                .from('form_webhooks')
                .select('id')
                .eq('id', webhookId)
                .eq('user_id', user.id)
                .single();

            if (!existing) {
                return res.status(404).json({ error: 'Webhook not found' });
            }

            const { error } = await supabase
                .from('form_webhooks')
                .delete()
                .eq('id', webhookId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Webhook operation failed' });
    }
}

// Helper function to trigger webhooks (exported for use in submit-form.js)
export async function triggerWebhooks(projectId, eventType, payload) {
    try {
        // Get active webhooks for this project
        const { data: webhooks } = await supabase
            .from('form_webhooks')
            .select('*')
            .eq('project_id', projectId)
            .eq('is_active', true)
            .contains('events', [eventType]);

        if (!webhooks || webhooks.length === 0) {
            return;
        }

        // Send to each webhook
        const results = await Promise.allSettled(
            webhooks.map(async (webhook) => {
                const timestamp = Date.now();
                const signature = crypto
                    .createHmac('sha256', webhook.secret)
                    .update(`${timestamp}.${JSON.stringify(payload)}`)
                    .digest('hex');

                const headers = {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Timestamp': timestamp.toString(),
                    'X-Webhook-Event': eventType,
                    ...webhook.headers
                };

                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        event: eventType,
                        timestamp: new Date().toISOString(),
                        data: payload
                    })
                });

                // Log the webhook call
                await supabase.from('webhook_logs').insert({
                    webhook_id: webhook.id,
                    project_id: projectId,
                    status_code: response.status,
                    payload: payload,
                    response_body: response.status >= 400 ? await response.text().catch(() => '') : null,
                    error_message: response.ok ? null : `HTTP ${response.status}`
                });

                return { webhookId: webhook.id, status: response.status };
            })
        );

        return results;
    } catch (error) {
        console.error('Error triggering webhooks:', error);
    }
}
