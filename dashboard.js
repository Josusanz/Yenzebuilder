// Dashboard Application Logic

class DashboardApp {
    constructor() {
        this.currentUser = null;
        this.projects = [];
        this.subscriptions = [];
        this.domains = [];
        this.analytics = {};
        this.currentSection = 'projects';
        this.init();
    }

    async init() {
        try {
            // Check authentication
            await supabaseClient.init();
            this.currentUser = supabaseClient.getUser();

            console.log('Dashboard: Current user:', this.currentUser);

            if (!this.currentUser) {
                // Redirect to home if not authenticated
                console.log('Dashboard: No user found, redirecting to home');
                alert('Por favor inicia sesión primero');
                window.location.href = '/';
                return;
            }

            // Initialize UI
            this.setupEventListeners();
            this.updateUserProfile();
            this.loadCurrentPlan();

            // Load initial section (projects)
            this.switchSection('projects');

        } catch (error) {
            console.error('Dashboard initialization error:', error);
            alert('Error al cargar el dashboard: ' + error.message);
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Analytics filter
        const analyticsFilter = document.getElementById('analyticsFilter');
        if (analyticsFilter) {
            analyticsFilter.addEventListener('change', () => {
                this.loadAnalytics();
            });
        }

        // Listen for auth changes
        window.addEventListener('auth-change', (e) => {
            const { event } = e.detail;
            if (event === 'SIGNED_OUT') {
                window.location.href = '/';
            }
        });
    }

    updateUserProfile() {
        const userEmail = this.currentUser.email;
        const userInitial = userEmail.charAt(0).toUpperCase();

        const profileHTML = `
            <div class="user-profile" onclick="this.querySelector('.user-dropdown').classList.toggle('active')">
                <div class="user-avatar">${userInitial}</div>
                <span class="user-email">${userEmail}</span>
                <div class="user-dropdown">
                    <div class="user-dropdown-item" onclick="window.location.href='/dashboard.html'">Dashboard</div>
                    <div class="user-dropdown-item" onclick="window.location.href='/'">Editor</div>
                    <div class="user-dropdown-item danger" onclick="dashboardApp.handleLogout()">Logout</div>
                </div>
            </div>
        `;

        const profileContainer = document.getElementById('userProfileNav');
        if (profileContainer) {
            profileContainer.innerHTML = profileHTML;
        }
    }

    async handleLogout() {
        await supabaseClient.signOut();
        window.location.href = '/';
    }

    switchSection(section) {
        this.currentSection = section;

        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update section visibility
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
        });

        const sectionMap = {
            'projects': 'projectsSection',
            'analytics': 'analyticsSection',
            'domains': 'domainsSection',
            'billing': 'billingSection'
        };

        const targetSection = document.getElementById(sectionMap[section]);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Load section data
        switch (section) {
            case 'projects':
                this.loadProjects();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'domains':
                this.loadDomains();
                break;
            case 'billing':
                this.loadBilling();
                break;
        }
    }

    async loadCurrentPlan() {
        try {
            const { data: subscription, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            let planName = 'Free';
            let planDescription = 'Unlimited publishes on yenze.app';

            if (subscription) {
                const plan = subscription.plan.toUpperCase();
                if (PLANS[plan]) {
                    planName = PLANS[plan].name;
                    planDescription = `$${PLANS[plan].price}/${PLANS[plan].period}`;
                }
            }

            const planInfoHTML = `
                <h4>${planName}</h4>
                <p>${planDescription}</p>
                ${planName === 'Free' ? '<button class="upgrade-btn" onclick="authUI.showPlanModal()">Upgrade Plan</button>' : ''}
            `;

            const planInfoElement = document.getElementById('currentPlanInfo');
            if (planInfoElement) {
                planInfoElement.innerHTML = planInfoHTML;
            }

        } catch (error) {
            console.error('Error loading plan:', error);
        }
    }

    async loadProjects() {
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading your projects...</p></div>';

        try {
            const { data: projects, error } = await supabaseClient.client
                .from('projects')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.projects = projects || [];

            if (this.projects.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                        <h3>No projects yet</h3>
                        <p>Create your first project to get started</p>
                        <button class="btn-primary" onclick="window.location.href='/'">Create Project</button>
                    </div>
                `;
                return;
            }

            // Render projects
            const projectsHTML = await Promise.all(this.projects.map(async (project) => {
                // Get analytics for this project
                const stats = await this.getProjectStats(project.id);

                return `
                    <div class="project-card">
                        <div class="project-thumbnail">
                            <div style="font-size: 48px; color: #667eea;">🌐</div>
                        </div>
                        <div class="project-info">
                            <h3>${project.name || 'Untitled Project'}</h3>
                            <div class="project-meta">
                                <span>📅 ${new Date(project.created_at).toLocaleDateString()}</span>
                                <span>📦 ${project.plan || 'free'}</span>
                            </div>
                            ${project.published_url ? `
                                <a href="${project.published_url}" target="_blank" class="project-url">
                                    ${project.published_url}
                                </a>
                            ` : '<span class="project-url" style="color: #9ca3af;">Not published</span>'}

                            <div class="project-stats">
                                <div class="project-stat">
                                    <span>${stats.views}</span>
                                    <span>Views</span>
                                </div>
                                <div class="project-stat">
                                    <span>${stats.visitors}</span>
                                    <span>Visitors</span>
                                </div>
                            </div>

                            <div class="project-actions">
                                <button class="action-btn" onclick="dashboardApp.viewProject('${project.id}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    View
                                </button>
                                <button class="action-btn" onclick="dashboardApp.editProject('${project.id}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button class="action-btn danger" onclick="dashboardApp.deleteProject('${project.id}', '${project.name}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }));

            grid.innerHTML = projectsHTML.join('');

        } catch (error) {
            console.error('Error loading projects:', error);
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Error loading projects</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async getProjectStats(projectId) {
        try {
            const stats = await analyticsTracker.getProjectStats(projectId);
            return {
                views: stats.totalViews || 0,
                visitors: stats.uniqueVisitors || 0
            };
        } catch (error) {
            return { views: 0, visitors: 0 };
        }
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.published_url) {
            window.open(project.published_url, '_blank');
        }
    }

    editProject(projectId) {
        window.location.href = `/?project=${projectId}`;
    }

    async deleteProject(projectId, projectName) {
        if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            alert('Project deleted successfully');
            this.loadProjects(); // Reload projects

        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project: ' + error.message);
        }
    }

    async loadAnalytics() {
        const selectedProject = document.getElementById('analyticsFilter').value;

        // Update total stats
        const totalStats = await analyticsTracker.getTotalStats(this.currentUser.id, selectedProject === 'all' ? null : selectedProject);

        document.getElementById('totalViews').textContent = totalStats.totalViews || 0;
        document.getElementById('uniqueVisitors').textContent = totalStats.uniqueVisitors || 0;
        document.getElementById('avgDuration').textContent = totalStats.avgDuration ? `${totalStats.avgDuration}s` : '-';
        document.getElementById('totalProjects').textContent = this.projects.length;

        // Load per-project analytics
        await this.loadProjectAnalytics();

        // Populate filter dropdown
        const filterSelect = document.getElementById('analyticsFilter');
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">All Projects</option>';
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name || 'Untitled Project';
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentValue;
    }

    async loadProjectAnalytics() {
        const listContainer = document.getElementById('projectAnalyticsList');

        if (this.projects.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No projects to show analytics for</p>';
            return;
        }

        const analyticsHTML = await Promise.all(this.projects.map(async (project) => {
            const stats = await this.getProjectStats(project.id);

            return `
                <div class="analytics-item">
                    <div>
                        <div class="analytics-project-name">${project.name || 'Untitled Project'}</div>
                        <div class="analytics-project-url">${project.published_url || 'Not published'}</div>
                    </div>
                    <div class="analytics-numbers">
                        <div class="analytics-number">
                            <strong>${stats.views}</strong>
                            <span>Views</span>
                        </div>
                        <div class="analytics-number">
                            <strong>${stats.visitors}</strong>
                            <span>Visitors</span>
                        </div>
                    </div>
                </div>
            `;
        }));

        listContainer.innerHTML = '<h3>Project Performance</h3>' + analyticsHTML.join('');
    }

    async loadDomains() {
        const listContainer = document.getElementById('domainsList');
        listContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading domains...</p></div>';

        // Check if user has access to custom domains
        const hasAccess = await this.checkCustomDomainAccess();

        if (!hasAccess) {
            document.getElementById('domainUpgradeNotice').style.display = 'block';
            document.getElementById('addDomainBtn').disabled = true;
            listContainer.innerHTML = '';
            return;
        }

        try {
            const { data: domains, error } = await supabaseClient.client
                .from('projects')
                .select('id, name, custom_domain, published_url')
                .eq('user_id', this.currentUser.id)
                .not('custom_domain', 'is', null);

            if (error) throw error;

            this.domains = domains || [];

            if (this.domains.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <h3>No custom domains yet</h3>
                        <p>Add your first custom domain to get started</p>
                    </div>
                `;
                return;
            }

            const domainsHTML = this.domains.map(domain => `
                <div class="domain-item">
                    <div class="domain-info">
                        <h4>${domain.custom_domain}</h4>
                        <p class="domain-project">${domain.name || 'Untitled Project'}</p>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="domain-status active">Active</span>
                        <button class="btn-danger" onclick="dashboardApp.removeDomain('${domain.id}')">Remove</button>
                    </div>
                </div>
            `).join('');

            listContainer.innerHTML = domainsHTML;

        } catch (error) {
            console.error('Error loading domains:', error);
            listContainer.innerHTML = `<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading domains: ${error.message}</p>`;
        }
    }

    async checkCustomDomainAccess() {
        try {
            const { data: subscription, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            if (subscription) {
                const plan = subscription.plan.toUpperCase();
                return plan === 'ONE_TIME' || plan === 'PRO';
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    showAddDomainModal() {
        // Populate project select
        const projectSelect = document.getElementById('domainProjectSelect');
        projectSelect.innerHTML = '<option value="">Choose a project...</option>';

        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name || 'Untitled Project';
            projectSelect.appendChild(option);
        });

        document.getElementById('addDomainModal').style.display = 'flex';
    }

    closeAddDomainModal() {
        document.getElementById('addDomainModal').style.display = 'none';
        document.getElementById('addDomainForm').reset();
    }

    async handleAddDomain(event) {
        event.preventDefault();

        const projectId = document.getElementById('domainProjectSelect').value;
        const domainName = document.getElementById('domainName').value.trim();

        try {
            // Update project with custom domain
            const { error } = await supabaseClient.client
                .from('projects')
                .update({ custom_domain: domainName })
                .eq('id', projectId);

            if (error) throw error;

            alert('Domain added successfully! Please configure your DNS settings as shown in the instructions.');
            this.closeAddDomainModal();
            this.loadDomains();

        } catch (error) {
            console.error('Error adding domain:', error);
            alert('Failed to add domain: ' + error.message);
        }
    }

    async removeDomain(projectId) {
        if (!confirm('Are you sure you want to remove this custom domain?')) {
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('projects')
                .update({ custom_domain: null })
                .eq('id', projectId);

            if (error) throw error;

            alert('Domain removed successfully');
            this.loadDomains();

        } catch (error) {
            console.error('Error removing domain:', error);
            alert('Failed to remove domain: ' + error.message);
        }
    }

    async loadBilling() {
        // Load current plan info
        await this.loadBillingPlanInfo();

        // Load usage stats
        await this.loadUsageStats();

        // Load payment history
        await this.loadPaymentHistory();
    }

    async loadBillingPlanInfo() {
        const container = document.getElementById('billingPlanInfo');

        try {
            const { data: subscription, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            let planHTML = '';

            if (subscription) {
                const plan = subscription.plan.toUpperCase();
                const planConfig = PLANS[plan];

                planHTML = `
                    <div style="margin-bottom: 15px;">
                        <h4 style="font-size: 24px; color: #667eea; margin-bottom: 5px;">${planConfig.name}</h4>
                        <p style="color: #6b7280;">$${planConfig.price}/${planConfig.period}</p>
                    </div>
                    <div style="padding-top: 15px; border-top: 1px solid #f3f4f6;">
                        <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                            <strong>Status:</strong> ${subscription.status}
                        </p>
                        ${subscription.current_period_end ? `
                            <p style="font-size: 14px; color: #6b7280;">
                                <strong>Renews:</strong> ${new Date(subscription.current_period_end).toLocaleDateString()}
                            </p>
                        ` : ''}
                    </div>
                    <button class="btn-secondary" style="width: 100%; margin-top: 15px;" onclick="dashboardApp.manageBilling()">
                        Manage Subscription
                    </button>
                `;
            } else {
                planHTML = `
                    <div style="margin-bottom: 15px;">
                        <h4 style="font-size: 24px; color: #667eea; margin-bottom: 5px;">Free Plan</h4>
                        <p style="color: #6b7280;">$0/forever</p>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="authUI.showPlanModal()">
                        Upgrade Plan
                    </button>
                `;
            }

            container.innerHTML = planHTML;

        } catch (error) {
            container.innerHTML = '<p style="color: #dc2626;">Error loading plan information</p>';
        }
    }

    async loadUsageStats() {
        const projectsCount = this.projects.length;
        const domainsCount = this.domains.length;

        document.getElementById('projectsUsage').textContent = `${projectsCount} / ∞`;
        document.getElementById('domainsUsage').textContent = `${domainsCount} / ${await this.getMaxDomains()}`;
    }

    async getMaxDomains() {
        try {
            const { data: subscription } = await supabaseClient.client
                .from('subscriptions')
                .select('plan')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            if (subscription) {
                const plan = subscription.plan.toUpperCase();
                return PLANS[plan]?.maxDomains || 0;
            }

            return 0;
        } catch (error) {
            return 0;
        }
    }

    async loadPaymentHistory() {
        const container = document.getElementById('paymentHistoryList');
        container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading payment history...</p></div>';

        try {
            // In a real implementation, this would fetch from Stripe via backend
            // For now, we'll show subscriptions as payments
            const { data: subscriptions, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!subscriptions || subscriptions.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No payment history</p>';
                return;
            }

            const paymentsHTML = subscriptions.map(sub => {
                const plan = PLANS[sub.plan.toUpperCase()];
                return `
                    <div class="payment-item">
                        <div>
                            <div class="payment-description">${plan.name} Plan</div>
                            <div class="payment-date">${new Date(sub.created_at).toLocaleDateString()}</div>
                        </div>
                        <div class="payment-amount">$${plan.price}</div>
                    </div>
                `;
            }).join('');

            container.innerHTML = paymentsHTML;

        } catch (error) {
            console.error('Error loading payment history:', error);
            container.innerHTML = '<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading payment history</p>';
        }
    }

    async manageBilling() {
        // In production, this would redirect to Stripe Customer Portal
        alert('This would redirect to Stripe Customer Portal to manage subscription, payment methods, and billing history.');
    }
}

// Initialize dashboard when DOM is ready
let dashboardApp;
document.addEventListener('DOMContentLoaded', () => {
    dashboardApp = new DashboardApp();
});
