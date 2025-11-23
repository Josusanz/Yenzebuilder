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
            'billing': 'billingSection',
            'integrations': 'integrationsSection'
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
            case 'integrations':
                this.loadIntegrations();
                break;
        }
    }

    async loadCurrentPlan() {
        try {
            const { data: subscriptions, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active');

            let planName = 'Free';
            let planDescription = 'Unlimited publishes on yenze.app';
            let subscriptionCount = 0;

            if (subscriptions && subscriptions.length > 0) {
                // Get the highest tier plan
                const planPriority = { 'PRO': 3, 'STARTER': 2, 'FREE': 1, 'ONE_TIME': 2 };
                const highestPlan = subscriptions.reduce((highest, sub) => {
                    const currentPriority = planPriority[sub.plan.toUpperCase()] || 0;
                    const highestPriority = planPriority[highest.plan.toUpperCase()] || 0;
                    return currentPriority > highestPriority ? sub : highest;
                }, subscriptions[0]);

                const plan = highestPlan.plan.toUpperCase();
                subscriptionCount = subscriptions.filter(s => s.plan.toUpperCase() === plan).length;

                if (PLANS[plan]) {
                    planName = PLANS[plan].name;
                    if (subscriptionCount > 1) {
                        planName += ` (${subscriptionCount}x)`;
                    }
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
            // Get user's subscription first
            const { data: subscription } = await supabaseClient.client
                .from('subscriptions')
                .select('plan')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            this.userPlan = subscription?.plan || 'free';

            const { data: projects, error } = await supabaseClient.client
                .from('projects')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false});

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

            // Get custom domains to determine which projects are on paid plans
            const { data: customDomains } = await supabaseClient.client
                .from('custom_domains')
                .select('project_id, domain')
                .eq('user_id', this.currentUser.id);

            // Create a map of project_id -> custom domain
            const domainMap = {};
            if (customDomains) {
                customDomains.forEach(cd => {
                    domainMap[cd.project_id] = cd.domain;
                });
            }

            // Render projects
            const projectsHTML = await Promise.all(this.projects.map(async (project) => {
                // Get analytics for this project
                const stats = await this.getProjectStats(project.id);

                // Determine project plan based on whether it has a custom domain
                const projectPlan = domainMap[project.id] ? this.userPlan : 'free';

                // Create a data URL for the preview iframe
                const previewDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(project.html)}`;

                return `
                    <div class="project-card">
                        <div class="project-thumbnail" onclick="dashboardApp.viewProject('${project.id}')" style="cursor: pointer;">
                            <iframe
                                src="${previewDataUrl}"
                                sandbox="allow-same-origin"
                                scrolling="no"
                                style="width: 100%; height: 100%; border: none; pointer-events: none; transform: scale(0.3); transform-origin: 0 0; width: 333.33%; height: 333.33%;">
                            </iframe>
                        </div>
                        <div class="project-info">
                            <h3 class="project-name" onclick="dashboardApp.showRenameModal('${project.id}', '${(project.name || 'Untitled Project').replace(/'/g, "\\'")}')" style="cursor: pointer;" title="Click to rename">${project.name || 'Untitled Project'}</h3>
                            <div class="project-meta">
                                <span>📅 ${new Date(project.created_at).toLocaleDateString()}</span>
                                <span>📦 ${projectPlan}</span>
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
                .from('custom_domains')
                .select(`
                    id,
                    domain,
                    status,
                    project_id,
                    projects:project_id (
                        name
                    )
                `)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            // Transform the data to match the expected format
            this.domains = (domains || []).map(d => ({
                id: d.project_id,
                custom_domain: d.domain,
                name: d.projects?.name || 'Untitled Project',
                domain_id: d.id
            }));

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
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="domain-status active">Active</span>
                        <button class="btn-secondary" onclick="dashboardApp.editProject('${domain.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                        <button class="btn-danger" onclick="dashboardApp.removeDomain('${domain.domain_id}')">Remove</button>
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
            const { data: subscriptions, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active');

            if (error) {
                console.error('Error checking domain access:', error);
                return false;
            }

            if (subscriptions && subscriptions.length > 0) {
                // Check if any subscription is paid (not free)
                return subscriptions.some(sub => {
                    const plan = sub.plan.toUpperCase();
                    return plan === 'STARTER' || plan === 'PRO' || plan === 'ONE_TIME';
                });
            }

            return false;
        } catch (error) {
            console.error('Error in checkCustomDomainAccess:', error);
            return false;
        }
    }

    async showAddDomainModal() {
        // Check if user has a paid plan
        const { data: subscriptions } = await supabaseClient.client
            .from('subscriptions')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .eq('status', 'active');

        // If no active subscription, show plan modal instead
        if (!subscriptions || subscriptions.length === 0) {
            authUI.showPlanModal();
            return;
        }

        // Check if user has reached domain limit
        const maxDomains = await this.getMaxDomains();
        const currentDomains = this.domains.length;

        if (currentDomains >= maxDomains) {
            alert(`You've reached your domain limit (${currentDomains}/${maxDomains}). Please upgrade your plan to add more domains.`);
            return;
        }

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
            // Insert into custom_domains table
            const { error } = await supabaseClient.client
                .from('custom_domains')
                .insert({
                    user_id: this.currentUser.id,
                    project_id: projectId,
                    domain: domainName,
                    status: 'active'
                });

            if (error) throw error;

            alert('Domain added successfully! Please configure your DNS settings as shown in the instructions.');
            this.closeAddDomainModal();
            this.loadDomains();
            this.loadProjects(); // Refresh projects to update plan display

        } catch (error) {
            console.error('Error adding domain:', error);
            alert('Failed to add domain: ' + error.message);
        }
    }

    async removeDomain(domainId) {
        if (!confirm('Are you sure you want to remove this custom domain?')) {
            return;
        }

        try {
            // Delete from custom_domains table
            const { error } = await supabaseClient.client
                .from('custom_domains')
                .delete()
                .eq('id', domainId);

            if (error) throw error;

            alert('Domain removed successfully');
            this.loadDomains();
            this.loadProjects(); // Refresh projects to update plan display

        } catch (error) {
            console.error('Error removing domain:', error);
            alert('Failed to remove domain: ' + error.message);
        }
    }

    showRenameModal(projectId, projectName) {
        document.getElementById('renameProjectId').value = projectId;
        document.getElementById('renameProjectName').value = projectName;
        document.getElementById('renameProjectModal').style.display = 'flex';
    }

    closeRenameModal() {
        document.getElementById('renameProjectModal').style.display = 'none';
        document.getElementById('renameProjectForm').reset();
    }

    async handleRenameProject(event) {
        event.preventDefault();

        const projectId = document.getElementById('renameProjectId').value;
        const newName = document.getElementById('renameProjectName').value.trim();

        if (!newName) {
            alert('Please enter a project name');
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('projects')
                .update({ name: newName })
                .eq('id', projectId);

            if (error) throw error;

            alert('Project renamed successfully!');
            this.closeRenameModal();
            this.loadProjects();

        } catch (error) {
            console.error('Error renaming project:', error);
            alert('Failed to rename project: ' + error.message);
        }
    }

    async loadBilling() {
        // Load current plan info
        await this.loadBillingPlanInfo();

        // Load usage stats
        await this.loadUsageStats();

        // Load payment history
        await this.loadPaymentHistory();

        // Update available plans section to mark current plan
        await this.updateAvailablePlans();
    }

    async updateAvailablePlans() {
        try {
            const { data: subscription } = await supabaseClient.client
                .from('subscriptions')
                .select('plan')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            const currentPlan = subscription?.plan || 'free';

            // Update all plan buttons to show which is current
            const planButtons = document.querySelectorAll('.plan-option button');
            planButtons.forEach(button => {
                const planDiv = button.closest('.plan-option');
                const planTitle = planDiv.querySelector('h4').textContent.toLowerCase();

                if (planTitle === currentPlan) {
                    button.textContent = 'Current Plan';
                    button.disabled = true;
                    button.className = 'btn-secondary';
                } else if (button.textContent === 'Current Plan') {
                    // Reset other buttons
                    button.textContent = planTitle === 'free' ? 'Current Plan' : `Get ${planDiv.querySelector('h4').textContent}`;
                    button.disabled = planTitle === 'free' && currentPlan !== 'free';
                    button.className = 'btn-primary';
                }
            });
        } catch (error) {
            console.error('Error updating available plans:', error);
        }
    }

    async loadBillingPlanInfo() {
        const container = document.getElementById('billingPlanInfo');

        try {
            const { data: subscriptions, error } = await supabaseClient.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active');

            let planHTML = '';

            if (subscriptions && subscriptions.length > 0) {
                // Get the highest tier plan
                const planPriority = { 'PRO': 3, 'STARTER': 2, 'FREE': 1, 'ONE_TIME': 2 };
                const highestPlan = subscriptions.reduce((highest, sub) => {
                    const currentPriority = planPriority[sub.plan.toUpperCase()] || 0;
                    const highestPriority = planPriority[highest.plan.toUpperCase()] || 0;
                    return currentPriority > highestPriority ? sub : highest;
                }, subscriptions[0]);

                const plan = highestPlan.plan.toUpperCase();
                const planConfig = PLANS[plan];
                const subscriptionCount = subscriptions.filter(s => s.plan.toUpperCase() === plan).length;

                planHTML = `
                    <div style="margin-bottom: 15px;">
                        <h4 style="font-size: 24px; color: #667eea; margin-bottom: 5px;">${planConfig.name}${subscriptionCount > 1 ? ` (${subscriptionCount}x)` : ''}</h4>
                        <p style="color: #6b7280;">$${planConfig.price}/${planConfig.period}</p>
                    </div>
                    <div style="padding-top: 15px; border-top: 1px solid #f3f4f6;">
                        <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                            <strong>Status:</strong> ${highestPlan.status}
                        </p>
                        ${highestPlan.current_period_end ? `
                            <p style="font-size: 14px; color: #6b7280;">
                                <strong>Renews:</strong> ${new Date(highestPlan.current_period_end).toLocaleDateString()}
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
            // Get ALL active subscriptions for this user
            const { data: subscriptions } = await supabaseClient.client
                .from('subscriptions')
                .select('plan')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active');

            if (!subscriptions || subscriptions.length === 0) {
                return 0;
            }

            // Sum up maxDomains from all active subscriptions
            const totalMaxDomains = subscriptions.reduce((total, subscription) => {
                const plan = subscription.plan.toUpperCase();
                return total + (PLANS[plan]?.maxDomains || 0);
            }, 0);

            return totalMaxDomains;
        } catch (error) {
            console.error('Error getting max domains:', error);
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
        try {
            // Initialize Stripe if not already
            if (!stripeIntegration.initialized) {
                await stripeIntegration.init();
            }

            // Redirect to Stripe Customer Portal
            await stripeIntegration.createPortalSession();

        } catch (error) {
            console.error('Billing portal error:', error);
            alert('Failed to open billing portal: ' + error.message);
        }
    }

    // Integration methods
    async saveWeb3FormsKey() {
        const key = document.getElementById('web3formsKey').value.trim();

        if (!key) {
            alert('Please enter a Web3Forms API key');
            return;
        }

        try {
            // Save to user metadata
            const { error } = await supabaseClient.client
                .from('user_integrations')
                .upsert({
                    user_id: this.currentUser.id,
                    service: 'web3forms',
                    api_key: key,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,service'
                });

            if (error) throw error;

            alert('Web3Forms key saved successfully!');
        } catch (error) {
            console.error('Error saving Web3Forms key:', error);
            alert('Failed to save key: ' + error.message);
        }
    }

    async saveLoopsFormId() {
        const formId = document.getElementById('loopsFormId').value.trim();

        if (!formId) {
            alert('Please enter a Loops.so Form ID');
            return;
        }

        try {
            // Save to user metadata
            const { error } = await supabaseClient.client
                .from('user_integrations')
                .upsert({
                    user_id: this.currentUser.id,
                    service: 'loops',
                    api_key: formId,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,service'
                });

            if (error) throw error;

            alert('Loops.so Form ID saved successfully!');
        } catch (error) {
            console.error('Error saving Loops Form ID:', error);
            alert('Failed to save Form ID: ' + error.message);
        }
    }

    async loadIntegrations() {
        try {
            const { data: integrations, error } = await supabaseClient.client
                .from('user_integrations')
                .select('*')
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            // Load saved keys into inputs
            if (integrations) {
                integrations.forEach(integration => {
                    if (integration.service === 'web3forms') {
                        const input = document.getElementById('web3formsKey');
                        if (input) input.value = integration.api_key;
                    } else if (integration.service === 'loops') {
                        const input = document.getElementById('loopsFormId');
                        if (input) input.value = integration.api_key;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading integrations:', error);
        }
    }
}

// Initialize dashboard when DOM is ready
let dashboardApp;
document.addEventListener('DOMContentLoaded', () => {
    dashboardApp = new DashboardApp();
});
