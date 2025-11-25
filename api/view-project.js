// API Route for serving FREE tier content via /s/:slug
// This handles requests to yenze.io/s/slug and serves the corresponding project

import { createClient } from '@supabase/supabase-js';
import { serveProject, sendError } from './_utils/response-helper.js';

export default async function handler(req, res) {
  try {
    // Get slug from query parameter
    const slug = req.query.slug;

    console.log(`[View Project] Request for slug: ${slug}`);

    if (!slug) {
      return sendError(res, 400, '400', 'Missing slug parameter');
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Find project with this public slug
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name, html, user_id, public_slug, published')
      .eq('public_slug', slug)
      .eq('published', true)
      .single();

    if (error || !project) {
      console.error(`[View Project] Project not found for slug: ${slug}`, error);
      return sendError(
        res,
        404,
        '404',
        'This site hasn\'t been published yet.'
      );
    }

    console.log(`[View Project] Project found:`, {
      id: project.id,
      name: project.name,
      slug: project.public_slug
    });

    // Get user's subscription to check plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', project.user_id)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'free';
    const showBadge = plan === 'free';

    console.log(`[View Project] User plan: ${plan}, Show badge: ${showBadge}`);

    // Use the shared serveProject helper
    return await serveProject(res, project, { showBadge });

  } catch (error) {
    console.error('[View Project] Error:', error);
    return sendError(
      res,
      500,
      'Server Error',
      'An error occurred while loading the page.',
      error.message
    );
  }
}
