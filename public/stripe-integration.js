// Stripe Integration for YENZE Builder
// Handles subscription creation and management

class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Initialize Stripe.js with publishable key
            this.stripe = Stripe(STRIPE_CONFIG.publicKey);
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    async createCheckoutSession(plan) {
        console.log('[StripeIntegration] createCheckoutSession called with plan:', plan);

        if (!supabaseClient.isAuthenticated()) {
            console.error('[StripeIntegration] User not authenticated');
            throw new Error('User must be authenticated');
        }

        try {
            console.log('[StripeIntegration] Getting session...');
            const sessionData = await supabaseClient.client.auth.getSession();
            console.log('[StripeIntegration] Session data:', sessionData.data.session ? 'exists' : 'null');

            const requestBody = {
                plan: plan,
                userId: supabaseClient.currentUser.id,
                email: supabaseClient.currentUser.email
            };
            console.log('[StripeIntegration] Request body:', requestBody);

            // Call backend API to create Stripe checkout session
            console.log('[StripeIntegration] Calling /api/create-checkout-session...');
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.data.session.access_token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[StripeIntegration] Response status:', response.status);
            console.log('[StripeIntegration] Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[StripeIntegration] Checkout session error:', errorData);
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const responseData = await response.json();
            console.log('[StripeIntegration] Response data:', responseData);

            const { sessionId } = responseData;
            console.log('[StripeIntegration] Session ID:', sessionId);

            if (!this.stripe) {
                console.error('[StripeIntegration] Stripe not initialized!');
                throw new Error('Stripe not initialized');
            }

            // Redirect to Stripe Checkout
            console.log('[StripeIntegration] Redirecting to Stripe checkout...');
            const result = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (result.error) {
                console.error('[StripeIntegration] Stripe redirect error:', result.error);
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('[StripeIntegration] Checkout error:', error);
            console.error('[StripeIntegration] Error stack:', error.stack);
            throw error;
        }
    }

    async createPortalSession() {
        if (!supabaseClient.isAuthenticated()) {
            throw new Error('User must be authenticated');
        }

        try {
            // Call backend API to create Stripe portal session
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabaseClient.client.auth.getSession()).data.session.access_token}`
                },
                body: JSON.stringify({
                    userId: supabaseClient.currentUser.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create portal session');
            }

            const { url } = await response.json();

            // Redirect to Stripe Customer Portal
            window.location.href = url;

        } catch (error) {
            console.error('Portal error:', error);
            throw error;
        }
    }

    getPlanDetails(plan) {
        return PLANS[plan.toUpperCase()] || PLANS.FREE;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
}

// Create singleton instance
const stripeIntegration = new StripeIntegration();
window.stripeIntegration = stripeIntegration;

// Helper function to handle successful checkout
function handleCheckoutSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        // Verify the checkout session and update subscription
        verifyCheckoutSession(sessionId);
    }
}

async function verifyCheckoutSession(sessionId) {
    try {
        const response = await fetch('/api/verify-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabaseClient.client.auth.getSession()).data.session.access_token}`
            },
            body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
            throw new Error('Failed to verify checkout');
        }

        const { subscription } = await response.json();

        // Show success message
        showToast('✅ Subscription activated! Welcome to ' + subscription.plan.toUpperCase(), 'success');

        // Remove session_id from URL
        window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
        console.error('Verification error:', error);
        showToast('❌ Failed to verify subscription', 'error');
    }
}

// Initialize Stripe on page load
document.addEventListener('DOMContentLoaded', async () => {
    await stripeIntegration.init();
    handleCheckoutSuccess();
});
