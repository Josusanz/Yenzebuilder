// Usage Tracker - Enforces plan limits and tracks usage
// Integrates with Supabase for real-time limit checking

class UsageTracker {
    constructor() {
        this.currentUsage = null;
        this.userPlan = 'free';
        this.limits = null;
    }

    async init() {
        await this.loadUsageAndLimits();
    }

    async loadUsageAndLimits() {
        if (!supabaseClient.isAuthenticated()) {
            this.userPlan = 'free';
            this.limits = PLANS.FREE.limits;
            return;
        }

        try {
            // Get user's current plan
            const plan = await supabaseClient.getUserPlan();
            this.userPlan = plan.toLowerCase();
            this.limits = PLANS[plan].limits;

            // Get current usage
            const monthYear = new Date().toISOString().substring(0, 7); // "2025-01"

            const { data: usage, error } = await supabaseClient.client
                .from('usage_tracking')
                .select('*')
                .eq('user_id', supabaseClient.currentUser.id)
                .eq('month_year', monthYear)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found is OK
                console.error('Error loading usage:', error);
            }

            // Get project count
            const { data: projects } = await supabaseClient.getProjects();

            this.currentUsage = {
                projects: projects?.length || 0,
                monthlyViews: usage?.page_views || 0,
                storage: usage?.storage_used_bytes || 0,
                monthYear: monthYear
            };

            console.log('Usage loaded:', this.currentUsage, 'Limits:', this.limits);

        } catch (error) {
            console.error('Failed to load usage:', error);
            this.userPlan = 'free';
            this.limits = PLANS.FREE.limits;
            this.currentUsage = {
                projects: 0,
                monthlyViews: 0,
                storage: 0
            };
        }
    }

    // Check if user can perform an action
    async canPerformAction(action, context = {}) {
        await this.loadUsageAndLimits(); // Refresh usage

        switch(action) {
            case 'create_project':
                if (this.limits.maxProjects === -1) return { allowed: true };
                if (this.currentUsage.projects >= this.limits.maxProjects) {
                    return {
                        allowed: false,
                        message: this.getUpgradeMessage(action),
                        currentPlan: this.userPlan,
                        upgradeNeeded: true,
                        limit: this.limits.maxProjects,
                        current: this.currentUsage.projects
                    };
                }
                return { allowed: true };

            case 'create_page':
                // Check pages in current project
                if (this.limits.maxPages === -1) return { allowed: true };
                const currentPages = context.currentPageCount || 0;
                if (currentPages >= this.limits.maxPages) {
                    return {
                        allowed: false,
                        message: this.getUpgradeMessage(action),
                        currentPlan: this.userPlan,
                        upgradeNeeded: true,
                        limit: this.limits.maxPages,
                        current: currentPages
                    };
                }
                return { allowed: true };

            case 'add_custom_domain':
                if (!this.limits.customDomain) {
                    return {
                        allowed: false,
                        message: this.getUpgradeMessage(action),
                        currentPlan: this.userPlan,
                        upgradeNeeded: true
                    };
                }
                return { allowed: true };

            case 'remove_branding':
                if (!this.limits.removeBranding) {
                    return {
                        allowed: false,
                        message: this.getUpgradeMessage(action),
                        currentPlan: this.userPlan,
                        upgradeNeeded: true
                    };
                }
                return { allowed: true };

            case 'view_analytics':
                if (!this.limits.analytics) {
                    return {
                        allowed: false,
                        message: this.getUpgradeMessage(action),
                        currentPlan: this.userPlan,
                        upgradeNeeded: true
                    };
                }
                return { allowed: true };

            case 'check_monthly_views':
                if (this.limits.maxViews === -1) return { allowed: true };
                if (this.currentUsage.monthlyViews >= this.limits.maxViews) {
                    return {
                        allowed: false,
                        message: `You've reached your monthly view limit (${this.limits.maxViews.toLocaleString()}). Upgrade for more!`,
                        currentPlan: this.userPlan,
                        upgradeNeeded: true,
                        limit: this.limits.maxViews,
                        current: this.currentUsage.monthlyViews
                    };
                }
                return {
                    allowed: true,
                    remaining: this.limits.maxViews - this.currentUsage.monthlyViews,
                    percentage: (this.currentUsage.monthlyViews / this.limits.maxViews * 100).toFixed(1)
                };

            default:
                return { allowed: true };
        }
    }

    getUpgradeMessage(action) {
        const upgradePaths = {
            free: {
                create_project: 'Upgrade to STARTER ($2.99/mo) to create up to 3 projects!',
                create_page: 'Upgrade to STARTER ($2.99/mo) to create up to 3 pages!',
                add_custom_domain: 'Upgrade to PRO ($6.99/mo) to use your custom domain!',
                remove_branding: 'Upgrade to STARTER ($2.99/mo) to remove YENZE branding!',
                view_analytics: 'Upgrade to PRO ($6.99/mo) for analytics dashboard!'
            },
            starter: {
                create_project: 'Upgrade to PRO ($6.99/mo) for 10 projects!',
                create_page: 'Upgrade to PRO ($6.99/mo) for unlimited pages!',
                add_custom_domain: 'Upgrade to PRO ($6.99/mo) to use custom domains!',
                view_analytics: 'Upgrade to PRO ($6.99/mo) for analytics dashboard!'
            },
            pro: {
                create_project: 'Upgrade to BUSINESS ($14.99/mo) for unlimited projects!',
                create_page: 'You already have unlimited pages! 🎉'
            }
        };

        return upgradePaths[this.userPlan]?.[action] || 'Upgrade to unlock this feature!';
    }

    // Show upgrade modal with plan comparison
    showUpgradeModal(action, denialInfo) {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="upgrade-modal-content">
                <button class="upgrade-modal-close" onclick="this.closest('.upgrade-modal').remove()">×</button>

                <div class="upgrade-modal-header">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #667eea;">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                    <h2>Upgrade to Unlock</h2>
                    <p>${denialInfo.message}</p>
                </div>

                <div class="upgrade-stats">
                    <div class="upgrade-stat">
                        <span class="upgrade-stat-label">Current Plan</span>
                        <span class="upgrade-stat-value">${PLANS[this.userPlan.toUpperCase()].name}</span>
                    </div>
                    ${denialInfo.limit ? `
                    <div class="upgrade-stat">
                        <span class="upgrade-stat-label">Your Usage</span>
                        <span class="upgrade-stat-value">${denialInfo.current} / ${denialInfo.limit}</span>
                    </div>
                    ` : ''}
                </div>

                ${this.getUpgradePlansHTML()}

                <div class="upgrade-modal-footer">
                    <p style="color: #6b7280; font-size: 0.875rem; text-align: center;">
                        ✨ All plans include SSL, subdomain, and integrations
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles if not already present
        if (!document.getElementById('upgrade-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'upgrade-modal-styles';
            styles.textContent = `
                .upgrade-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease-out;
                }
                .upgrade-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }
                .upgrade-modal-content {
                    position: relative;
                    background: white;
                    border-radius: 16px;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;
                }
                .upgrade-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: #f3f4f6;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #6b7280;
                }
                .upgrade-modal-close:hover {
                    background: #e5e7eb;
                    transform: rotate(90deg);
                }
                .upgrade-modal-header {
                    text-align: center;
                    padding: 2rem 2rem 1rem;
                }
                .upgrade-modal-header h2 {
                    margin: 1rem 0 0.5rem;
                    font-size: 1.75rem;
                    color: #1a1a2e;
                }
                .upgrade-modal-header p {
                    color: #6b7280;
                    font-size: 1.125rem;
                    margin: 0;
                }
                .upgrade-stats {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 2rem;
                    justify-content: center;
                }
                .upgrade-stat {
                    text-align: center;
                    padding: 1rem 2rem;
                    background: #f9fafb;
                    border-radius: 12px;
                }
                .upgrade-stat-label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #9ca3af;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .upgrade-stat-value {
                    display: block;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1a1a2e;
                }
                .upgrade-plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    padding: 1rem 2rem 2rem;
                }
                .upgrade-plan-card {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .upgrade-plan-card:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                }
                .upgrade-plan-card.popular {
                    border-color: #667eea;
                    background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%);
                    position: relative;
                }
                .upgrade-plan-badge {
                    position: absolute;
                    top: -10px;
                    right: 10px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .upgrade-plan-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin-bottom: 0.5rem;
                }
                .upgrade-plan-price {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #667eea;
                    margin-bottom: 0.25rem;
                }
                .upgrade-plan-period {
                    font-size: 0.875rem;
                    color: #9ca3af;
                    margin-bottom: 1rem;
                }
                .upgrade-plan-button {
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .upgrade-plan-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    getUpgradePlansHTML() {
        const plans = ['STARTER', 'PRO', 'BUSINESS'];
        const currentPlanIndex = plans.indexOf(this.userPlan.toUpperCase());

        // Only show plans higher than current
        const availablePlans = plans.filter((_, index) => index > currentPlanIndex);

        return `
            <div class="upgrade-plans-grid">
                ${availablePlans.map(planKey => {
                    const plan = PLANS[planKey];
                    return `
                        <div class="upgrade-plan-card ${plan.popular ? 'popular' : ''}" onclick="usageTracker.selectUpgradePlan('${plan.id}')">
                            ${plan.badge_text ? `<div class="upgrade-plan-badge">${plan.badge_text}</div>` : ''}
                            <div class="upgrade-plan-name">${plan.name}</div>
                            <div class="upgrade-plan-price">$${plan.monthlyPrice}</div>
                            <div class="upgrade-plan-period">per month</div>
                            <button class="upgrade-plan-button">${plan.cta}</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    async selectUpgradePlan(planId) {
        // Close modal
        document.querySelector('.upgrade-modal')?.remove();

        // Redirect to billing page or initiate checkout
        if (window.location.pathname.includes('dashboard')) {
            // Already on dashboard, switch to billing tab
            const billingTab = document.querySelector('[data-section="billing"]');
            if (billingTab) {
                billingTab.click();
            }
        } else {
            // Redirect to dashboard billing
            window.location.href = '/public/dashboard.html#billing';
        }

        // Optionally auto-select the plan
        setTimeout(() => {
            if (window.authUI && window.authUI.selectPlan) {
                window.authUI.selectPlan(planId);
            }
        }, 500);
    }

    // Helper to show usage warnings (90% of limit)
    async checkAndWarnUsage() {
        const viewCheck = await this.canPerformAction('check_monthly_views');

        if (viewCheck.allowed && viewCheck.percentage >= 90) {
            this.showUsageWarning('views', viewCheck);
        }
    }

    showUsageWarning(type, info) {
        // Show a non-blocking toast notification
        const toast = document.createElement('div');
        toast.className = 'usage-warning-toast';
        toast.innerHTML = `
            <div class="usage-warning-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div>
                    <strong>You're at ${info.percentage}% of your monthly views</strong>
                    <p>${info.remaining.toLocaleString()} views remaining. Consider upgrading!</p>
                </div>
                <button onclick="this.closest('.usage-warning-toast').remove()">×</button>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 10000); // Auto-dismiss after 10s
    }

    // Get usage summary for display
    async getUsageSummary() {
        await this.loadUsageAndLimits();

        return {
            plan: PLANS[this.userPlan.toUpperCase()],
            usage: this.currentUsage,
            limits: this.limits,
            percentages: {
                projects: this.limits.maxProjects === -1 ? 0 : (this.currentUsage.projects / this.limits.maxProjects * 100),
                views: this.limits.maxViews === -1 ? 0 : (this.currentUsage.monthlyViews / this.limits.maxViews * 100),
                storage: (this.currentUsage.storage / this.limits.maxStorage * 100)
            }
        };
    }
}

// Create global instance
const usageTracker = new UsageTracker();
