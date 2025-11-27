// Unified Pricing Modal for YENZE
// Single source of truth for all pricing displays

class PricingModal {
    constructor() {
        this.modal = null;
        this.onSelectCallback = null;
    }

    // Show the pricing modal
    show(options = {}) {
        const {
            title = 'Choose Your Plan',
            subtitle = 'Select the plan that fits your needs',
            onSelect = null,
            currentPlan = null,
            showFree = true
        } = options;

        this.onSelectCallback = onSelect;

        // Remove existing modal if any
        this.close();

        // Create modal HTML
        const modalHTML = `
            <div id="unifiedPricingModal" class="modal" style="display: flex; align-items: center; justify-content: center;" onclick="if(event.target.id === 'unifiedPricingModal') pricingModal.close()">
                <div class="modal-content" style="max-width: 1200px; width: 95%; max-height: calc(100vh - 80px); overflow-y: auto; margin: 0;" onclick="event.stopPropagation()">
                    <button class="modal-close-btn" onclick="pricingModal.close()">×</button>

                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 12px; color: #0F172A;">${title}</h2>
                        <p style="font-size: 16px; color: #64748B;">${subtitle}</p>
                    </div>

                    <div class="pricing-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                        ${showFree ? this.renderPlanCard('free', currentPlan) : ''}
                        ${this.renderPlanCard('starter', currentPlan)}
                        ${this.renderPlanCard('pro', currentPlan)}
                        ${this.renderPlanCard('business', currentPlan)}
                    </div>

                    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
                        <p style="font-size: 13px; color: #64748B;">
                            All plans include SSL certificates, automatic backups, and 24/7 uptime monitoring
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('unifiedPricingModal');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    renderPlanCard(planId, currentPlan) {
        // Use plans from config.js
        const plansConfig = {
            free: PLANS.FREE,
            starter: PLANS.STARTER,
            pro: PLANS.PRO,
            business: PLANS.BUSINESS
        };

        const planConfig = plansConfig[planId];
        const plan = {
            name: planConfig.name,
            price: planId === 'free' ? '$0' : `$${planConfig.monthlyPrice}`,
            period: planId === 'free' ? '/forever' : '/mo',
            badge: planConfig.badge_text || (planConfig.popular ? 'MOST POPULAR' : null),
            features: planConfig.features,
            cta: planConfig.cta,
            popular: planConfig.popular
        };

        const isCurrent = currentPlan && currentPlan.toLowerCase() === planId;
        const featuredClass = plan.popular ? 'plan-card-featured' : '';

        return `
            <div class="pricing-plan-card ${featuredClass}" style="background: white; border: ${plan.popular ? '2px solid #0066FF' : '1px solid #E2E8F0'}; border-radius: 12px; padding: 24px; position: relative; transition: all 0.2s;">
                ${plan.badge ? `
                    <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #0066FF; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">
                        ${plan.badge}
                    </div>
                ` : ''}

                <div style="text-align: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0F172A;">${plan.name}</h3>
                    <div style="font-size: 48px; font-weight: 800; color: #0F172A; letter-spacing: -2px; line-height: 1;">
                        ${plan.price}<span style="font-size: 16px; font-weight: 500; color: #64748B;">${plan.period}</span>
                    </div>
                </div>

                <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
                    ${plan.features.map(feature => `
                        <li style="padding: 10px 0; color: #334155; font-size: 14px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: start; gap: 8px;">
                            <span style="color: #10B981; font-weight: 600;">✓</span>
                            <span>${feature}</span>
                        </li>
                    `).join('')}
                </ul>

                <button
                    onclick="${planId === 'free' ? 'pricingModal.close()' : `pricingModal.selectPlan('${planId}')`}"
                    class="${isCurrent ? 'btn-secondary' : 'btn-primary'}"
                    ${isCurrent ? 'disabled' : ''}
                    style="width: 100%; padding: 12px; font-size: 14px; ${isCurrent ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
                >
                    ${isCurrent ? 'Current Plan' : plan.cta}
                </button>
            </div>
        `;
    }

    async selectPlan(planId) {
        console.log('[PricingModal] selectPlan called with:', planId);

        // If there's a callback, use it
        if (this.onSelectCallback) {
            console.log('[PricingModal] Using callback');
            this.onSelectCallback(planId);
            this.close();
            return;
        }

        // Default behavior: redirect to Stripe checkout
        if (planId === 'free') {
            console.log('[PricingModal] Free plan selected, closing modal');
            this.close();
            return;
        }

        // For paid plans, redirect to Stripe Payment Link
        try {
            console.log('[PricingModal] Redirecting to Stripe Payment Link for plan:', planId);

            // Check if user is authenticated
            if (!supabaseClient || !supabaseClient.currentUser) {
                console.log('[PricingModal] User not authenticated, redirecting to signup');
                window.location.href = `https://builder.yenze.io/signup.html?plan=${planId}`;
                return;
            }

            // Get the payment link from config
            const paymentLink = STRIPE_CONFIG.paymentLinks[planId.toLowerCase()];

            if (!paymentLink) {
                console.error('[PricingModal] No payment link found for plan:', planId);
                alert('Payment link not configured for this plan. Please contact support.');
                return;
            }

            console.log('[PricingModal] Payment link:', paymentLink);

            // Add customer email as prefill
            const userEmail = supabaseClient.currentUser.email;
            const urlWithEmail = `${paymentLink}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${supabaseClient.currentUser.id}`;

            console.log('[PricingModal] Redirecting to:', urlWithEmail);
            this.close(); // Close modal before redirecting

            // Redirect to Stripe Payment Link
            window.location.href = urlWithEmail;

        } catch (error) {
            console.error('[PricingModal] Error selecting plan:', error);
            console.error('[PricingModal] Error stack:', error.stack);
            alert('An error occurred: ' + (error.message || 'Please try again.'));
        }
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Global instance
const pricingModal = new PricingModal();
window.pricingModal = pricingModal;
