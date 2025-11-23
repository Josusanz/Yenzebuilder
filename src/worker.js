import { createClient } from '@supabase/supabase-js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Supabase
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Route 1: FREE tier - /s/:slug
    if (pathname.startsWith('/s/')) {
      return handleViewProject(request, supabase, pathname, corsHeaders);
    }

    // Route 2: API endpoints
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env, supabase, pathname, corsHeaders);
    }

    // Route 3: Custom domains
    if (hostname !== 'yenze.io' && hostname !== 'www.yenze.io' && !hostname.endsWith('.yenze.io')) {
      return handleCustomDomain(request, supabase, hostname, corsHeaders);
    }

    // Route 4: Static files - proxy to Cloudflare Pages
    // Redirect to Pages deployment for static files (handles both yenze.io and www.yenze.io)
    const pagesUrl = 'https://bfcdea29.yenze.pages.dev' + pathname;
    return fetch(pagesUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body
    });
  }
};

// Handle /s/:slug for FREE tier projects
async function handleViewProject(request, supabase, pathname, corsHeaders) {
  try {
    const slug = pathname.replace('/s/', '');

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // Find project with this public slug
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name, html, user_id, public_slug, published')
      .eq('public_slug', slug)
      .eq('published', true)
      .single();

    if (error || !project) {
      return new Response(get404HTML(), {
        status: 404,
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', project.user_id)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'free';
    let html = project.html || '<h1>Empty Project</h1>';

    // Add badge for FREE users
    if (plan === 'free') {
      const badge = getBadgeHTML();
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${badge}</body>`);
      } else {
        html += badge;
      }
    }

    // Track analytics (non-blocking)
    supabase
      .from('project_analytics')
      .insert({
        project_id: project.id,
        event_type: 'page_view',
        timestamp: new Date().toISOString()
      })
      .then(() => {})
      .catch(err => console.error('Analytics error:', err));

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('[View Project] Error:', error);
    return new Response(getErrorHTML(error.message), {
      status: 500,
      headers: { 'Content-Type': 'text/html', ...corsHeaders }
    });
  }
}

// Handle custom domains
async function handleCustomDomain(request, supabase, hostname, corsHeaders) {
  try {
    // Look up custom domain
    const { data: customDomain } = await supabase
      .from('custom_domains')
      .select('project_id, domain, verified')
      .eq('domain', hostname)
      .eq('verified', true)
      .single();

    if (!customDomain) {
      return new Response(get404HTML(), {
        status: 404,
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, html, user_id')
      .eq('id', customDomain.project_id)
      .single();

    if (!project) {
      return new Response(get404HTML(), {
        status: 404,
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    const html = project.html || '<h1>Empty Project</h1>';

    // Track analytics
    supabase
      .from('project_analytics')
      .insert({
        project_id: project.id,
        event_type: 'page_view',
        timestamp: new Date().toISOString()
      })
      .then(() => {})
      .catch(err => console.error('Analytics error:', err));

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('[Custom Domain] Error:', error);
    return new Response(getErrorHTML(error.message), {
      status: 500,
      headers: { 'Content-Type': 'text/html', ...corsHeaders }
    });
  }
}

// Handle API endpoints
async function handleAPI(request, env, supabase, pathname, corsHeaders) {
  // Route to appropriate API handler
  if (pathname === '/api/create-checkout-session') {
    return handleCheckoutSession(request, env, supabase, corsHeaders);
  }

  if (pathname === '/api/stripe-webhook') {
    return handleStripeWebhook(request, env, supabase, corsHeaders);
  }

  if (pathname === '/api/add-custom-domain') {
    return handleAddCustomDomain(request, env, supabase, corsHeaders);
  }

  if (pathname === '/api/create-portal-session') {
    return handleCreatePortalSession(request, env, supabase, corsHeaders);
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

// Stripe checkout session handler
async function handleCheckoutSession(request, env, supabase, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { plan, userId, email } = await request.json();

    // Validate
    if (!plan || !userId || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize Stripe
    const stripe = (await import('stripe')).default(env.STRIPE_SECRET_KEY);

    const PRICE_IDS = {
      starter: env.STRIPE_PRICE_STARTER,
      pro: env.STRIPE_PRICE_PRO
    };

    if (!PRICE_IDS[plan]) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      mode: 'subscription',
      success_url: `${new URL(request.url).origin}/dashboard.html?success=true`,
      cancel_url: `${new URL(request.url).origin}/dashboard.html?canceled=true`,
      metadata: { user_id: userId, plan: plan },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Stripe webhook handler
async function handleStripeWebhook(request, env, supabase, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const stripe = (await import('stripe')).default(env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Get subscription details to find the price ID
        let plan = session.metadata.plan; // Try metadata first

        if (!plan && subscriptionId) {
          // If no metadata, fetch subscription to get price ID
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Map price ID to plan name
          const priceIdToPlan = {
            'price_1SVkywIDLJ66zkJzfqKZBxhz': 'starter',
            'price_1SVl01IDLJ66zkJzDjhViJZA': 'pro'
          };

          plan = priceIdToPlan[priceId] || 'free';
          console.log('Mapped price ID', priceId, 'to plan:', plan);
        }

        console.log('Checkout completed:', { userId, plan, customerId, subscriptionId });

        // Create subscription in Supabase (allow multiple subscriptions per user)
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (subError) {
          console.error('Error creating subscription:', subError);
          return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        console.log('Subscription created successfully for user:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log('Subscription updated:', { customerId, status: subscription.status });

        // Update subscription status in Supabase
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log('Subscription deleted:', { customerId });

        // Mark subscription as cancelled
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (deleteError) {
          console.error('Error cancelling subscription:', deleteError);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('Payment succeeded for invoice:', event.data.object.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        console.log('Payment failed:', { customerId });

        // Update subscription status to past_due
        const { error: failError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (failError) {
          console.error('Error updating subscription status:', failError);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Create Stripe billing portal session
async function handleCreatePortalSession(request, env, supabase, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get user's Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription?.stripe_customer_id) {
      console.error('No subscription found for user:', userId, error);
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const stripe = (await import('stripe')).default(env.STRIPE_SECRET_KEY);

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: 'https://yenze.io/dashboard.html',
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Portal session error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Stub for add custom domain
async function handleAddCustomDomain(request, env, supabase, corsHeaders) {
  // TODO: Implement custom domain logic
  return new Response('Domain added', { status: 200, headers: corsHeaders });
}

// HTML templates
function getBadgeHTML() {
  return `
    <div id="yenze-badge" style="position: fixed; bottom: 20px; right: 20px; background: rgba(102, 126, 234, 0.95); color: white; padding: 12px 20px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; backdrop-filter: blur(10px);">
      <a href="https://yenze.io" target="_blank" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 3v18"/>
        </svg>
        <span>Powered by YENZE</span>
      </a>
      <div style="margin-top: 8px; font-size: 12px; opacity: 0.9; text-align: center;">
        <a href="https://yenze.io/dashboard.html" target="_blank" style="color: white; text-decoration: underline;">Upgrade for custom subdomain</a>
      </div>
    </div>
  `;
}

function get404HTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Not Found - YENZE</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
        }
        h1 {
          font-size: 4rem;
          margin: 0 0 1rem 0;
        }
        p {
          font-size: 1.25rem;
          margin: 0 0 2rem 0;
          opacity: 0.9;
        }
        a {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        a:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>This site hasn't been published yet.</p>
        <a href="https://yenze.io">Create Your Own Website</a>
      </div>
    </body>
    </html>
  `;
}

function getErrorHTML(errorMsg) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - YENZE</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f5f5f5;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 600px;
        }
        h1 {
          color: #e53e3e;
          margin: 0 0 1rem 0;
        }
        p {
          color: #666;
          margin: 0 0 1rem 0;
        }
        .debug {
          margin-top: 1rem;
          padding: 1rem;
          background: #f0f0f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          text-align: left;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Oops! Something went wrong</h1>
        <p>Please try again later.</p>
        <div class="debug">Error: ${errorMsg}</div>
      </div>
    </body>
    </html>
  `;
}
