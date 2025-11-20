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
        if (!supabaseClient.isAuthenticated()) {
            throw new Error('User must be authenticated');
        }

        try {
            // Call backend API to create Stripe checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabaseClient.client.auth.getSession()).data.session.access_token}`
                },
                body: JSON.stringify({
                    plan: plan,
                    userId: supabaseClient.currentUser.id,
                    email: supabaseClient.currentUser.email
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { sessionId } = await response.json();

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Checkout error:', error);
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
