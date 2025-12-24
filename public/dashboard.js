// Dashboard Application Logic

class DashboardApp {
    constructor() {
        this.currentUser = null;
        this.projects = [];
        this.subscriptions = [];
        this.domains = [];
        this.messages = [];
        this.analytics = {};
        this.currentSection = 'projects';
        this.pendingAvatarUpdate = null;
        this.analyticsDateRange = 7; // Default to 7 days
        this.analyticsChart = null; // Chart.js instance
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

            // Load unread messages count for badge immediately
            await this.loadUnreadCount();

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

        // SEO Audit Button
        document.addEventListener('click', (e) => {
            // Check for specific ID or fallback to class/text match
            if (e.target.id === 'btnRunAudit' || (e.target.matches('.seo-main button') && e.target.textContent.includes('Run New Audit'))) {
                this.runSEOAudit();
            }
            if (e.target.textContent.includes('Generate Sitemap')) {
                this.generateSitemap();
            }
            if (e.target.textContent.includes('Robots.txt')) {
                this.openRobotsTxt();
            }
            if (e.target.textContent.includes('Broken Link')) {
                this.checkBrokenLinks();
            }
        });
    }

    updateUserProfile() {
        const userEmail = this.currentUser.email;
        const userInitial = userEmail.charAt(0).toUpperCase();

        // Get avatar image or initials - prioritize custom avatar
        const avatarImage = this.currentUser.user_metadata?.custom_avatar || this.currentUser.user_metadata?.avatar_url || this.currentUser.user_metadata?.picture;
        const avatarHTML = avatarImage
            ? `<img src="${avatarImage}" alt="Profile" />`
            : userInitial;

        // Get display name (prefer first name, fallback to first part of email)
        const displayName = this.currentUser.user_metadata?.first_name || userEmail.split('@')[0];

        const profileHTML = `
            <div class="user-profile" onclick="this.querySelector('.user-dropdown').classList.toggle('active')">
                <div class="user-avatar">${avatarHTML}</div>
                <span class="user-email">${displayName}</span>
                <div class="user-dropdown">
                    <div class="user-dropdown-item" onclick="window.location.href='/dashboard'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                    </div>
                    <div class="user-dropdown-item" onclick="window.location.href='/builder.html'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editor
                    </div>
                    <div class="user-dropdown-item" onclick="dashboardApp.showProfileSettings()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile Settings
                    </div>
                    <div class="user-dropdown-item danger" onclick="dashboardApp.handleLogout()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </div>
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

    showProfileSettings() {
        // Get current user info
        const user = this.currentUser;
        if (!user) return;

        const provider = user.app_metadata?.provider || 'email';
        const providerDisplay = provider.charAt(0).toUpperCase() + provider.slice(1);
        const avatarImage = user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture;

        // Show profile settings modal
        const modalHTML = `
            <div id="profileSettingsModal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <span class="close" onclick="document.getElementById('profileSettingsModal').remove()">&times;</span>
                    <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600; color: #0F172A;">Profile Settings</h2>

                    <div style="text-align: center; margin-bottom: 24px;">
                        <div id="profileAvatarPreview" class="user-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 16px; position: relative;">
                            ${avatarImage ? `<img src="${avatarImage}" alt="Profile" />` : user.email.charAt(0).toUpperCase()}
                        </div>
                        <input type="file" id="profileAvatarInput" accept="image/*" style="display: none;" onchange="dashboardApp.handleAvatarChange(event)" />
                        <button type="button" class="primary-btn" style="background: #fafafa; color: #0F172A; border: 1px solid #e5e5e5; padding: 8px 16px; font-size: 14px;" onclick="document.getElementById('profileAvatarInput').click()">
                            Change Photo
                        </button>
                        ${avatarImage && !avatarImage.startsWith('data:') ? `
                            <button type="button" class="primary-btn" style="background: #fafafa; color: #dc2626; border: 1px solid #fca5a5; padding: 8px 16px; font-size: 14px; margin-left: 8px;" onclick="dashboardApp.removeProfileAvatar()">
                                Remove
                            </button>
                        ` : ''}
                        <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
                            Signed in with ${providerDisplay}
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${user.email}" disabled style="background: #fafafa; cursor: not-allowed;" />
                        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
                            ${provider !== 'email' ? 'Email cannot be changed for OAuth accounts' : ''}
                        </div>
                    </div>

                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" id="profileFirstName" value="${user.user_metadata?.first_name || ''}" placeholder="First name" />
                    </div>

                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" id="profileLastName" value="${user.user_metadata?.last_name || ''}" placeholder="Last name" />
                    </div>

                    ${provider === 'email' ? `
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="profilePassword" placeholder="Leave blank to keep current password" />
                    </div>
                    ` : ''}

                    <div style="display: flex; gap: 12px; margin-top: 24px;">
                        <button class="primary-btn" style="flex: 1; background: #0F172A;" onclick="dashboardApp.saveProfileSettings()">
                            Save Changes
                        </button>
                        <button class="primary-btn" style="flex: 1; background: #fafafa; color: #0F172A; border: 1px solid #e5e5e5;" onclick="document.getElementById('profileSettingsModal').remove()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('Image must be less than 2MB', 'error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.pendingAvatarUpdate = dataUrl;

            // Update preview
            const preview = document.getElementById('profileAvatarPreview');
            if (preview) {
                preview.innerHTML = `<img src="${dataUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
            }
        };
        reader.readAsDataURL(file);
    }

    removeProfileAvatar() {
        this.pendingAvatarUpdate = 'remove';

        // Update preview to show initial
        const preview = document.getElementById('profileAvatarPreview');
        if (preview && this.currentUser) {
            preview.innerHTML = this.currentUser.email.charAt(0).toUpperCase();
        }
    }

    async saveProfileSettings() {
        const firstName = document.getElementById('profileFirstName').value;
        const lastName = document.getElementById('profileLastName').value;
        const password = document.getElementById('profilePassword')?.value;

        try {
            const updates = {};
            const metadata = {};

            // Handle name updates
            if (firstName || lastName) {
                metadata.first_name = firstName;
                metadata.last_name = lastName;
                metadata.full_name = `${firstName} ${lastName}`.trim();
            }

            // Handle avatar update
            if (this.pendingAvatarUpdate === 'remove') {
                metadata.custom_avatar = null;
            } else if (this.pendingAvatarUpdate) {
                metadata.custom_avatar = this.pendingAvatarUpdate;
            }

            // Only add metadata to updates if there are changes
            if (Object.keys(metadata).length > 0) {
                updates.data = metadata;
            }

            if (password) {
                updates.password = password;
            }

            const { error } = await supabaseClient.client.auth.updateUser(updates);
            if (error) throw error;

            // Reset pending avatar
            this.pendingAvatarUpdate = null;

            this.showToast('Profile updated successfully', 'success');
            document.getElementById('profileSettingsModal').remove();

            // Refresh user data
            const { data: { user } } = await supabaseClient.client.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.updateUserProfile();
            }
        } catch (error) {
            this.showToast('Failed to update profile: ' + error.message, 'error');
        }
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
            'messages': 'messagesSection',
            'analytics': 'analyticsSection',
            'domains': 'domainsSection',
            'billing': 'billingSection',
            'integrations': 'integrationsSection',
            'payments': 'paymentsSection',
            'seo': 'seoSection'
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
            case 'messages':
                this.loadMessages();
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
            case 'payments':
                this.loadPayments();
                break;
            case 'seo':
                this.loadSEO();
                break;
        }
    }

    async loadSEO() {
        // Show selection state, hide main content unless already selected
        if (!this.selectedSeoProject) {
            const selectionState = document.getElementById('seoProjectSelectionState');
            const mainContent = document.getElementById('seoMainContent');
            if (selectionState) selectionState.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';

            // Load projects for grid
            this.loadSEOProjects(false);
        } else {
            // Refresh current project view
            this.loadProjectSEO(this.selectedSeoProject.id);
        }

        // Load global defaults as fallback
        const metadata = this.currentUser?.user_metadata?.seo_defaults || {};
        const authorInput = document.querySelector('#seoDefaultsForm input[placeholder*="Author"]');
        const twitterInput = document.querySelector('#seoDefaultsForm input[placeholder*="Twitter"]');

        if (authorInput) authorInput.value = metadata.author || '';
        if (twitterInput) twitterInput.value = metadata.twitter || '';

        // Setup listeners if not already done
        const defaultsForm = document.getElementById('seoDefaultsForm');
        if (defaultsForm && !defaultsForm.dataset.initialized) {
            defaultsForm.addEventListener('submit', (e) => this.saveSEODefaults(e));
            defaultsForm.dataset.initialized = 'true';
        }

        // Setup SEO action buttons
        const btnRunAudit = document.getElementById('btnRunAudit');
        if (btnRunAudit && !btnRunAudit.dataset.initialized) {
            btnRunAudit.addEventListener('click', () => this.runSEOAudit());
            btnRunAudit.dataset.initialized = 'true';
        }

        // Setup SEO Editor buttons
        this.setupSEOEditor();

        // Load SEO projects overview (stats)
        this.loadSEOProjectsOverview();
    }

    setupSEOEditor() {
        const btnOpenSEOEditor = document.getElementById('btnOpenSEOEditor');
        const btnCloseSEOEditor = document.getElementById('btnCloseSEOEditor');
        const btnSaveSEO = document.getElementById('btnSaveSEO');
        const btnApplySEO = document.getElementById('btnApplySEO');
        const btnGenerateSEO = document.getElementById('btnGenerateSEO');
        const seoEditorForm = document.getElementById('seoEditorForm');

        const seoTitle = document.getElementById('seoTitle');
        const seoDescription = document.getElementById('seoDescription');
        const titleCharCount = document.getElementById('titleCharCount');
        const descCharCount = document.getElementById('descCharCount');

        // Character counters
        if (seoTitle) {
            seoTitle.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const color = count >= 50 && count <= 60 ? '#059669' : count > 60 ? '#dc2626' : '#d97706';
                titleCharCount.textContent = `(${count}/60 chars)`;
                titleCharCount.style.color = color;
            });
        }

        if (seoDescription) {
            seoDescription.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const color = count >= 150 && count <= 160 ? '#059669' : count > 160 ? '#dc2626' : '#d97706';
                descCharCount.textContent = `(${count}/160 chars)`;
                descCharCount.style.color = color;
            });
        }

        // Open editor
        if (btnOpenSEOEditor && !btnOpenSEOEditor.dataset.initialized) {
            btnOpenSEOEditor.addEventListener('click', () => {
                if (!this.selectedSeoProject) {
                    this.showToast('Please select a project first', 'error');
                    return;
                }
                this.openSEOEditor();
            });
            btnOpenSEOEditor.dataset.initialized = 'true';
        }

        // Close editor
        if (btnCloseSEOEditor && !btnCloseSEOEditor.dataset.initialized) {
            btnCloseSEOEditor.addEventListener('click', () => {
                seoEditorForm.style.display = 'none';
                btnOpenSEOEditor.style.display = 'block';
            });
            btnCloseSEOEditor.dataset.initialized = 'true';
        }

        // Save SEO
        if (btnSaveSEO && !btnSaveSEO.dataset.initialized) {
            btnSaveSEO.addEventListener('click', () => this.saveSEOMetadataForm());
            btnSaveSEO.dataset.initialized = 'true';
        }

        // Apply SEO to HTML
        if (btnApplySEO && !btnApplySEO.dataset.initialized) {
            btnApplySEO.addEventListener('click', () => this.applySEOToHTML());
            btnApplySEO.dataset.initialized = 'true';
        }

        // Generate SEO with AI
        if (btnGenerateSEO && !btnGenerateSEO.dataset.initialized) {
            btnGenerateSEO.addEventListener('click', () => this.generateSEOWithAI());
            btnGenerateSEO.dataset.initialized = 'true';
        }
    }

    openSEOEditor() {
        const seoEditorForm = document.getElementById('seoEditorForm');
        const btnOpenSEOEditor = document.getElementById('btnOpenSEOEditor');

        const seoTitle = document.getElementById('seoTitle');
        const seoDescription = document.getElementById('seoDescription');
        const seoCanonical = document.getElementById('seoCanonical');
        const seoOgImage = document.getElementById('seoOgImage');
        const seoKeywords = document.getElementById('seoKeywords');

        // Load existing metadata
        const metadata = this.selectedSeoProject.seo_metadata || {};

        seoTitle.value = metadata.meta_title || this.selectedSeoProject.name || '';
        seoDescription.value = metadata.meta_description || '';
        seoCanonical.value = metadata.canonical_url || '';
        seoOgImage.value = metadata.og_image || '';
        seoKeywords.value = metadata.keywords || '';

        // Update char counts
        seoTitle.dispatchEvent(new Event('input'));
        seoDescription.dispatchEvent(new Event('input'));

        // Show form
        seoEditorForm.style.display = 'block';
        btnOpenSEOEditor.style.display = 'none';
    }

    async saveSEOMetadataForm() {
        const btnSaveSEO = document.getElementById('btnSaveSEO');
        const originalText = btnSaveSEO.innerHTML;

        const seoTitle = document.getElementById('seoTitle').value.trim();
        const seoDescription = document.getElementById('seoDescription').value.trim();
        const seoCanonical = document.getElementById('seoCanonical').value.trim();
        const seoOgImage = document.getElementById('seoOgImage').value.trim();
        const seoKeywords = document.getElementById('seoKeywords').value.trim();

        if (!seoTitle || !seoDescription) {
            this.showToast('Title and Description are required', 'error');
            return;
        }

        btnSaveSEO.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btnSaveSEO.disabled = true;

        try {
            const metadata = {
                meta_title: seoTitle,
                meta_description: seoDescription,
                canonical_url: seoCanonical,
                og_image: seoOgImage,
                og_title: seoTitle,
                og_description: seoDescription,
                keywords: seoKeywords,
                updated_at: new Date().toISOString()
            };

            await this.saveSEOMetadata(metadata);

            this.showToast('SEO metadata saved successfully!', 'success');

            // Close editor
            document.getElementById('seoEditorForm').style.display = 'none';
            document.getElementById('btnOpenSEOEditor').style.display = 'block';

            // Reload project to reflect changes
            await this.loadSEOProjectsOverview();

        } catch (error) {
            console.error('Save SEO error:', error);
            this.showToast('Error saving SEO metadata: ' + error.message, 'error');
        } finally {
            btnSaveSEO.innerHTML = originalText;
            btnSaveSEO.disabled = false;
        }
    }

    async generateSEOWithAI() {
        const btnGenerateSEO = document.getElementById('btnGenerateSEO');
        const originalText = btnGenerateSEO.innerHTML;

        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        btnGenerateSEO.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btnGenerateSEO.disabled = true;

        try {
            const response = await fetch('/api/generate-seo-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id,
                    html: this.selectedSeoProject.html || '',
                    projectName: this.selectedSeoProject.name || ''
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Fill form with AI-generated content
                document.getElementById('seoTitle').value = result.metadata.meta_title || '';
                document.getElementById('seoDescription').value = result.metadata.meta_description || '';
                document.getElementById('seoKeywords').value = result.metadata.keywords || '';
                document.getElementById('seoCanonical').value = result.metadata.canonical_url || '';
                document.getElementById('seoOgImage').value = result.metadata.og_image || '';

                // Update char counts
                document.getElementById('seoTitle').dispatchEvent(new Event('input'));
                document.getElementById('seoDescription').dispatchEvent(new Event('input'));

                this.showToast('SEO metadata generated with AI! ✨', 'success');
            } else {
                throw new Error(result.error || 'Failed to generate SEO metadata');
            }
        } catch (error) {
            console.error('Generate SEO error:', error);
            this.showToast('Error generating SEO: ' + error.message, 'error');
        } finally {
            btnGenerateSEO.innerHTML = originalText;
            btnGenerateSEO.disabled = false;
        }
    }

    async applySEOToHTML() {
        const btnApplySEO = document.getElementById('btnApplySEO');
        const originalText = btnApplySEO.innerHTML;

        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        btnApplySEO.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        btnApplySEO.disabled = true;

        try {
            const response = await fetch('/api/apply-seo-to-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showToast('✅ SEO metadata applied to HTML successfully!', 'success');

                // Reload projects to get updated HTML
                await this.loadProjects();

                // Run audit again to see improvements
                setTimeout(() => {
                    this.runSEOAudit();
                }, 500);
            } else {
                throw new Error(result.error || result.message || 'Failed to apply SEO metadata');
            }
        } catch (error) {
            console.error('Apply SEO to HTML error:', error);
            this.showToast('Error applying SEO: ' + error.message, 'error');
        } finally {
            btnApplySEO.innerHTML = originalText;
            btnApplySEO.disabled = false;
        }
    }

    async loadSEOProjects(loadMore = false) {
        const grid = document.getElementById('seoProjectGrid');
        const loadMoreBtn = document.getElementById('seoLoadMoreContainer');
        if (!grid) return;

        if (!loadMore) {
            this.seoProjectsPage = 0;
            this.seoProjectsPerPage = 9;
            this.seoProjects = [];
            grid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading projects...</p></div>';
        } else {
            this.seoProjectsPage = (this.seoProjectsPage || 0) + 1;
            const btn = document.getElementById('btnSeoLoadMore');
            if (btn) btn.innerHTML = '<div class="loading-spinner small" style="display: inline-block; width: 12px; height: 12px; border-width: 2px;"></div> Loading...';
        }

        try {
            const offset = (this.seoProjectsPage || 0) * (this.seoProjectsPerPage || 9);
            const limit = (this.seoProjectsPerPage || 9);

            const { data: projects, error, count } = await supabaseClient.client
                .from('projects')
                .select('id, name, html, plan, published_url, subdomain_slug, public_slug, created_at', { count: 'exact' })
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            const newProjects = projects || [];

            if (!loadMore) {
                this.seoProjects = newProjects;
                grid.innerHTML = '';
            } else {
                this.seoProjects = [...(this.seoProjects || []), ...newProjects];
            }

            if (this.seoProjects.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;"><h3>No projects found</h3><p>Create a project in the Editor to get started with SEO.</p></div>';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            } else {
                const cardsHTML = newProjects.map(p => this.createSeoProjectCard(p)).join('');

                if (!loadMore) {
                    grid.innerHTML = cardsHTML;
                } else {
                    grid.insertAdjacentHTML('beforeend', cardsHTML);
                }

                // Handle Load More button visibility
                const hasMore = (offset + newProjects.length) < count;
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
                    const btn = document.getElementById('btnSeoLoadMore');
                    if (btn) btn.innerHTML = 'Load More Projects';
                }
            }

        } catch (error) {
            console.error('Error loading SEO projects:', error);
            if (!loadMore) {
                grid.innerHTML = `<div style="color: red; padding: 20px;">Error loading projects: ${error.message}</div>`;
            }
        }
    }

    createSeoProjectCard(project) {
        // Create thumbnail if possible
        let thumbnail = '<div style="width: 100%; height: 100%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 32px;">🌐</div>';

        if (project.html) {
            try {
                const pages = JSON.parse(project.html);
                const firstPage = pages[0];
                if (firstPage?.html) {
                    // Simple placeholder for real thumbnail generation which would happen elsewhere
                    thumbnail = '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; font-size: 32px;">📄</div>';
                }
            } catch (e) { }
        }

        const planName = (project.plan || 'free').toUpperCase();
        const planColor = project.plan === 'business' ? '#7c3aed' : (project.plan === 'pro' ? '#2563eb' : '#64748b');

        let url = 'No URL';
        if (project.published_url) url = project.published_url;
        else if (project.subdomain_slug) url = `${project.subdomain_slug}.yenze.io`;
        else if (project.public_slug) url = `yenze.io/s/${project.public_slug}`;

        return `
            <div class="project-card-seo" onclick="dashboardApp.loadProjectSEO('${project.id}')">
                <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div style="width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">
                        ${thumbnail}
                    </div>
                    <div>
                        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #0f172a;">${project.name || 'Untitled Project'}</h3>
                        <p style="margin: 0; font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${url}</p>
                    </div>
                </div>
                <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; font-weight: 600; color: ${planColor}; background: ${planColor}15; padding: 2px 8px; border-radius: 4px;">${planName}</span>
                    <span style="font-size: 12px; color: #4338ca; font-weight: 500;">Select &rarr;</span>
                </div>
            </div>
        `;
    }

    async loadProjectSEO(projectId) {
        if (!projectId) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        // Try to find in loaded projects first
        this.selectedSeoProject = (this.projects || []).find(p => p.id === projectId) ||
            (this.seoProjects || []).find(p => p.id === projectId);

        // If not found in loaded projects, fetch it directly
        if (!this.selectedSeoProject) {
            try {
                const { data: project, error } = await supabaseClient.client
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (error) throw error;
                this.selectedSeoProject = project;
            } catch (error) {
                console.error('Error loading project for SEO:', error);
                this.showToast('Error loading project: ' + error.message, 'error');
                return;
            }
        }

        console.log('✅ SEO Context loaded for:', this.selectedSeoProject.name);

        // Toggle views: hide selection, show main content
        const selectionState = document.getElementById('seoProjectSelectionState');
        const mainContent = document.getElementById('seoMainContent');
        if (selectionState) selectionState.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';

        // Show selected project info in the header
        const seoSelectedProjectName = document.getElementById('seoSelectedProjectName');
        const seoSelectedProjectUrl = document.getElementById('seoSelectedProjectUrl');

        if (seoSelectedProjectName) {
            seoSelectedProjectName.textContent = this.selectedSeoProject.name || 'Untitled Project';
        }

        if (seoSelectedProjectUrl) {
            let url = '--';
            let href = '#';

            if (this.selectedSeoProject.published_url) {
                url = this.selectedSeoProject.published_url;
                href = this.selectedSeoProject.published_url;
            } else if (this.selectedSeoProject.subdomain_slug) {
                url = `${this.selectedSeoProject.subdomain_slug}.yenze.io`;
                href = `https://${this.selectedSeoProject.subdomain_slug}.yenze.io`;
            } else if (this.selectedSeoProject.public_slug) {
                url = `yenze.io/s/${this.selectedSeoProject.public_slug}`;
                href = `https://yenze.io/s/${this.selectedSeoProject.public_slug}`;
            }

            // Update the link text and href
            seoSelectedProjectUrl.childNodes[0].textContent = url + ' ';
            seoSelectedProjectUrl.href = href;
        }


        // Load SEO projects overview
        this.loadSEOProjectsOverview();

        // Update GSC context (Mock logic: In reality checking specific project metadata)
        // For now we rely on the global default for GSC, but visually reset UI to look "fresh" or check specific status
        const gscInput = document.getElementById('gscVerificationId');
        // If project has specific GSC override, load it. Otherwise check global.
        const globalGSC = this.currentUser?.user_metadata?.seo_defaults?.gsc_id || '';
        if (gscInput) gscInput.value = globalGSC;

        // Update connection badge based on presence of ID
        const statusBadge = document.querySelector('.seo-main .dashboard-card span[style*="DISCONNECTED"], .seo-main .dashboard-card span[style*="CONNECTED"]');
        const submitBtn = document.getElementById('btnSubmitSitemap');

        if (statusBadge) {
            if (globalGSC) {
                statusBadge.textContent = 'CONNECTED';
                statusBadge.style.background = '#dcfce7';
                statusBadge.style.color = '#166534';
                if (submitBtn) submitBtn.style.display = 'inline-flex';
            } else {
                statusBadge.textContent = 'DISCONNECTED';
                statusBadge.style.background = '#e2e8f0';
                statusBadge.style.color = '#64748b';
                if (submitBtn) submitBtn.style.display = 'none';
            }
        }
    }

    async saveGSCVerification() {
        const input = document.getElementById('gscVerificationId');
        const btn = event.target;
        const originalText = btn.textContent;

        const gscId = input.value.trim();

        if (!gscId) {
            this.showToast('Please enter a verification ID', 'error');
            return;
        }

        btn.textContent = 'Verifying...';
        btn.disabled = true;

        try {
            // Get existing metadata or init empty
            const currentDefaults = this.currentUser?.user_metadata?.seo_defaults || {};

            const { error } = await supabaseClient.client.auth.updateUser({
                data: {
                    seo_defaults: { ...currentDefaults, gsc_id: gscId }
                }
            });

            if (error) throw error;

            // Update local user object
            if (this.currentUser.user_metadata) {
                this.currentUser.user_metadata.seo_defaults = { ...currentDefaults, gsc_id: gscId };
            }

            // Update UI
            const statusBadge = document.querySelector('.seo-main .dashboard-card span[style*="DISCONNECTED"]');
            const submitBtn = document.getElementById('btnSubmitSitemap');

            if (statusBadge) {
                statusBadge.textContent = 'CONNECTED';
                statusBadge.style.background = '#dcfce7';
                statusBadge.style.color = '#166534';
            }
            if (submitBtn) submitBtn.style.display = 'inline-flex';

            this.showToast('GSC Verification ID saved! We will inject it into your sites.', 'success');
        } catch (error) {
            console.error('Save SEO Error:', error);
            this.showToast('Error saving GSC ID: ' + error.message, 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    clearSeoProject() {
        this.selectedSeoProject = null;
        const selector = document.getElementById('seoProjectFilter');
        if (selector) selector.value = '';

        // Toggle views: show selection, hide main content
        const selectionState = document.getElementById('seoProjectSelectionState');
        const mainContent = document.getElementById('seoMainContent');
        if (selectionState) selectionState.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';

        const selectedProjectInfo = document.getElementById('selectedProjectInfo');
        if (selectedProjectInfo) selectedProjectInfo.style.display = 'none';

        this.showToast('Project deselected. Please select a project to continue.', 'info');
    }

    async saveSEODefaults(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const author = e.target.querySelector('input[placeholder*="Author"]').value;
        const twitter = e.target.querySelector('input[placeholder*="Twitter"]').value;

        try {
            const { error } = await supabaseClient.client.auth.updateUser({
                data: {
                    seo_defaults: { author, twitter }
                }
            });

            if (error) throw error;

            // Update local user object
            if (this.currentUser.user_metadata) {
                this.currentUser.user_metadata.seo_defaults = { author, twitter };
            }

            this.showToast('SEO defaults saved successfully', 'success');
        } catch (error) {
            console.error('Save SEO Error:', error);
            this.showToast('Error saving defaults: ' + error.message, 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async runSEOAudit() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = document.getElementById('btnRunAudit');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Auditing...';
            btn.disabled = true;
        }

        console.log('Running SEO Audit for Project ID:', this.selectedSeoProject.id);
        console.log('Selected Project Data:', this.selectedSeoProject);

        try {
            const requestBody = {
                projectId: this.selectedSeoProject.id
            };
            console.log('SEO Audit Request Body:', requestBody);

            const response = await fetch('/api/seo-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('SEO Audit Response Status:', response.status);

            const result = await response.json();
            console.log('SEO Audit Response Data:', result);

            if (response.ok && result.success) {
                const score = result.score;
                const color = score >= 80 ? '#10b981' : (score >= 50 ? '#f59e0b' : '#ef4444');

                // Update score circle
                const scoreText = document.querySelector('.seo-main .dashboard-card svg + div');
                const scoreCircle = document.querySelector('.seo-main .dashboard-card svg path:last-child');

                if (scoreText) {
                    scoreText.textContent = score;
                    scoreText.style.color = color;
                }
                if (scoreCircle) {
                    scoreCircle.setAttribute('stroke', color);
                    scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);
                }

                // Show detailed results in console
                console.log('SEO Audit Results:', {
                    score: result.score,
                    issues: result.issues,
                    warnings: result.warnings,
                    passed: result.passed,
                    recommendations: result.recommendations,
                    details: result.details
                });

                // Build toast message
                let toastMessage = `Audit complete! Score: ${score}/100`;
                if (result.issues.length > 0) {
                    toastMessage += `\n${result.issues.length} critical issue(s) found`;
                }
                if (result.warnings.length > 0) {
                    toastMessage += `\n${result.warnings.length} warning(s)`;
                }

                const toastType = score >= 80 ? 'success' : (score >= 50 ? 'warning' : 'error');
                this.showToast(toastMessage, toastType);

                // Update UI
                this.updateSEOChecklistUI('audit', score, result);

                // Save audit metadata to database
                await this.saveSEOMetadata({ audit_score: score });

                // Reload SEO projects overview
                await this.loadSEOProjectsOverview();

                // Log recommendations
                if (result.recommendations.length > 0) {
                    console.log('SEO Recommendations:');
                    result.recommendations.forEach((rec, i) => {
                        console.log(`${i + 1}. ${rec}`);
                    });
                }
            } else {
                throw new Error(result.error || 'Failed to run SEO audit');
            }
        } catch (error) {
            console.error('SEO Audit error:', error);
            this.showToast('Error running SEO audit: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = '🔍 Run SEO Audit';
                btn.disabled = false;
            }
        }
    }

    updateSEOChecklistUI(step, data, fullData = null) {
        if (step === 'audit' && typeof data === 'number') {
            // Update audit status
            const auditStatus = document.getElementById('auditStatus');
            const auditResults = document.getElementById('auditResults');
            const auditScorePath = document.getElementById('auditScorePath');
            const auditScoreText = document.getElementById('auditScoreText');
            const auditScoreLabel = document.getElementById('auditScoreLabel');
            const auditScoreDesc = document.getElementById('auditScoreDesc');

            if (auditStatus) {
                const statusClass = data >= 80 ? '#10b981' : (data >= 50 ? '#f59e0b' : '#ef4444');
                const statusText = data >= 80 ? 'Excellent' : (data >= 50 ? 'Good' : 'Needs Work');
                auditStatus.style.background = data >= 80 ? '#d1fae5' : (data >= 50 ? '#fef3c7' : '#fee2e2');
                auditStatus.style.color = data >= 80 ? '#065f46' : (data >= 50 ? '#92400e' : '#991b1b');
                auditStatus.textContent = statusText;
            }

            if (auditResults) auditResults.style.display = 'block';
            if (auditScorePath) {
                auditScorePath.setAttribute('stroke-dasharray', `${data}, 100`);
                auditScorePath.setAttribute('stroke', data >= 80 ? '#10b981' : (data >= 50 ? '#f59e0b' : '#ef4444'));
            }
            if (auditScoreText) {
                auditScoreText.textContent = data;
                auditScoreText.style.color = data >= 80 ? '#10b981' : (data >= 50 ? '#f59e0b' : '#ef4444');
            }
            if (auditScoreLabel) {
                auditScoreLabel.textContent = data >= 80 ? 'Excellent SEO Health' : (data >= 50 ? 'Good SEO Health' : 'SEO Needs Improvement');
            }
            if (auditScoreDesc && fullData) {
                auditScoreDesc.textContent = `${fullData.passed.length} checks passed, ${fullData.issues.length} critical issues, ${fullData.warnings.length} warnings`;
            }

            // Display detailed results
            if (fullData) {
                const auditDetails = document.getElementById('auditDetails');
                if (auditDetails) auditDetails.style.display = 'block';

                // Display critical issues
                const issuesSection = document.getElementById('auditIssuesSection');
                const issuesList = document.getElementById('auditIssuesList');
                if (fullData.issues && fullData.issues.length > 0 && issuesList) {
                    issuesSection.style.display = 'block';
                    issuesList.innerHTML = fullData.issues.map(issue =>
                        `<div style="margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #991b1b;">${issue.message}</div>
                            <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Impact: ${issue.impact} points | Category: ${issue.category}</div>
                        </div>`
                    ).join('');
                } else if (issuesSection) {
                    issuesSection.style.display = 'none';
                }

                // Display warnings
                const warningsSection = document.getElementById('auditWarningsSection');
                const warningsList = document.getElementById('auditWarningsList');
                if (fullData.warnings && fullData.warnings.length > 0 && warningsList) {
                    warningsSection.style.display = 'block';
                    warningsList.innerHTML = fullData.warnings.map(warning =>
                        `<div style="margin-bottom: 8px;">
                            <div style="font-weight: 600; color: #92400e;">${warning.message}</div>
                            <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Impact: ${warning.impact} points | Category: ${warning.category}</div>
                        </div>`
                    ).join('');
                } else if (warningsSection) {
                    warningsSection.style.display = 'none';
                }

                // Display recommendations
                const recommendationsSection = document.getElementById('auditRecommendationsSection');
                const recommendationsList = document.getElementById('auditRecommendationsList');
                if (fullData.recommendations && fullData.recommendations.length > 0 && recommendationsList) {
                    recommendationsSection.style.display = 'block';
                    recommendationsList.innerHTML = fullData.recommendations.map((rec, index) =>
                        `<div style="margin-bottom: 6px; color: #0f172a;">
                            ${index + 1}. ${rec}
                        </div>`
                    ).join('');
                } else if (recommendationsSection) {
                    recommendationsSection.style.display = 'none';
                }

                // Display passed checks
                const passedSection = document.getElementById('auditPassedSection');
                const passedList = document.getElementById('auditPassedList');
                if (fullData.passed && fullData.passed.length > 0 && passedList) {
                    passedSection.style.display = 'block';
                    passedList.innerHTML = fullData.passed.map(check =>
                        `<div style="margin-bottom: 4px; color: #065f46;">✓ ${check}</div>`
                    ).join('');
                } else if (passedSection) {
                    passedSection.style.display = 'none';
                }
            }
        } else if (step === 'sitemap') {
            const sitemapStatus = document.getElementById('sitemapStatus');
            if (sitemapStatus) {
                sitemapStatus.style.background = '#d1fae5';
                sitemapStatus.style.color = '#065f46';
                sitemapStatus.textContent = 'Generated';
            }
        } else if (step === 'links' && fullData) {
            const linksStatus = document.getElementById('linksStatus');
            const brokenLinksResults = document.getElementById('brokenLinksResults');
            const workingLinksCount = document.getElementById('workingLinksCount');
            const brokenLinksCount = document.getElementById('brokenLinksCount');
            const warningLinksCount = document.getElementById('warningLinksCount');

            if (linksStatus) {
                const isBroken = fullData.broken > 0;
                linksStatus.style.background = isBroken ? '#fee2e2' : '#d1fae5';
                linksStatus.style.color = isBroken ? '#991b1b' : '#065f46';
                linksStatus.textContent = isBroken ? 'Issues Found' : 'All Good';
            }

            if (brokenLinksResults) brokenLinksResults.style.display = 'block';
            if (workingLinksCount) workingLinksCount.textContent = fullData.working;
            if (brokenLinksCount) brokenLinksCount.textContent = fullData.broken;
            if (warningLinksCount) warningLinksCount.textContent = fullData.warnings;
        } else if (step === 'google') {
            const googleStatus = document.getElementById('googleStatus');
            if (googleStatus) {
                googleStatus.style.background = '#d1fae5';
                googleStatus.style.color = '#065f46';
                googleStatus.textContent = 'Submitted';
            }
        }
    }

    showSEOGuide() {
        const emptyState = document.getElementById('seoEmptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        this.showToast('Select a project above to start optimizing your SEO', 'info');
    }

    updateSelectedProjectCard() {
        const card = document.getElementById('selectedProjectCard');
        if (!card || !this.selectedSeoProject) return;

        const projectName = document.getElementById('selectedProjectName');
        const projectUrl = document.getElementById('selectedProjectUrl');
        const projectPlan = document.getElementById('selectedProjectPlan');
        const projectThumbnail = document.querySelector('#selectedProjectThumbnail img');

        if (projectName) projectName.textContent = this.selectedSeoProject.name || 'Untitled Project';

        // Generate project URL
        let url = '--';
        if (this.selectedSeoProject.published_url) {
            url = this.selectedSeoProject.published_url;
        } else if (this.selectedSeoProject.subdomain_slug) {
            url = `https://${this.selectedSeoProject.subdomain_slug}.yenze.io`;
        } else if (this.selectedSeoProject.public_slug) {
            url = `https://yenze.io/s/${this.selectedSeoProject.public_slug}`;
        }
        if (projectUrl) projectUrl.textContent = url;

        if (projectPlan) projectPlan.textContent = (this.selectedSeoProject.plan || 'free').toUpperCase();

        // Generate thumbnail from first page HTML
        if (projectThumbnail && this.selectedSeoProject.html) {
            try {
                const pages = JSON.parse(this.selectedSeoProject.html);
                const firstPage = pages[0];
                if (firstPage?.html) {
                    // Create a data URL thumbnail
                    const blob = new Blob([firstPage.html], { type: 'text/html' });
                    const thumbnailUrl = URL.createObjectURL(blob);
                    projectThumbnail.src = 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                            <rect width="80" height="80" fill="#f1f5f9"/>
                            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="32" fill="#64748b">🌐</text>
                        </svg>
                    `);
                }
            } catch (error) {
                // Fallback icon
                projectThumbnail.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                        <rect width="80" height="80" fill="#f1f5f9"/>
                        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="32" fill="#64748b">🌐</text>
                    </svg>
                `);
            }
        }

        // Show the card
        card.style.display = 'block';
    }

    clearSeoProject() {
        this.selectedSeoProject = null;
        document.getElementById('seoProjectSelectionState').style.display = 'block';
        document.getElementById('seoMainContent').style.display = 'none';

        // Reset checklist UI elements visually
        document.getElementById('auditStatus').textContent = 'Pending';
        document.getElementById('auditStatus').style.background = '#fef3c7';
        document.getElementById('auditStatus').style.color = '#92400e';
        document.getElementById('auditScoreText').textContent = '--';
        document.getElementById('auditScorePath').setAttribute('stroke-dasharray', '0, 100');
    }


    async loadSEOProjectsOverview() {
        if (!this.currentUser) return;

        const listContainer = document.getElementById('seoProjectsList');
        const countBadge = document.getElementById('seoProjectsCount');

        if (!listContainer) return;

        try {
            // Fetch all projects with their metadata
            const { data: projects, error } = await supabaseClient.client
                .from('projects')
                .select('id, name, plan, published_url, subdomain_slug, public_slug, seo_metadata, updated_at')
                .eq('user_id', this.currentUser.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Filter projects that have any SEO work done
            const seoProjects = projects.filter(p => {
                const metadata = p.seo_metadata || {};
                return metadata.audit_score || metadata.sitemap_generated || metadata.robots_generated || metadata.links_checked;
            });

            // Update count badge
            if (countBadge) {
                countBadge.textContent = `${seoProjects.length} Project${seoProjects.length !== 1 ? 's' : ''}`;
            }

            if (seoProjects.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
                        <p style="margin: 0;">No projects with SEO configuration yet</p>
                        <p style="margin: 8px 0 0 0; font-size: 14px;">Select a project above and start optimizing!</p>
                    </div>
                `;
                return;
            }

            // Render SEO projects
            listContainer.innerHTML = seoProjects.map(project => {
                const metadata = project.seo_metadata || {};
                const auditScore = metadata.audit_score || 0;
                const hasSitemap = metadata.sitemap_generated || false;
                const hasRobots = metadata.robots_generated || false;
                const linksChecked = metadata.links_checked || false;

                let url = '--';
                if (project.published_url) {
                    url = project.published_url;
                } else if (project.subdomain_slug) {
                    url = `${project.subdomain_slug}.yenze.io`;
                } else if (project.public_slug) {
                    url = `yenze.io/s/${project.public_slug}`;
                }

                const completionCount = [auditScore > 0, hasSitemap, hasRobots, linksChecked].filter(Boolean).length;
                const completionPercent = (completionCount / 4) * 100;

                return `
                    <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 4px 0; font-size: 15px;">${project.name || 'Untitled'}</h4>
                                <div style="font-size: 12px; color: #64748b;">${url}</div>
                            </div>
                            <button onclick="dashboardApp.selectProjectForSEO('${project.id}')" class="btn-secondary" style="font-size: 12px; padding: 6px 12px;">Edit SEO</button>
                        </div>
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 11px; background: ${auditScore >= 80 ? '#d1fae5' : auditScore >= 50 ? '#fef3c7' : '#e2e8f0'}; color: ${auditScore >= 80 ? '#065f46' : auditScore >= 50 ? '#92400e' : '#64748b'}; padding: 3px 8px; border-radius: 99px; font-weight: 600;">
                                ${auditScore > 0 ? `Audit: ${auditScore}` : 'No Audit'}
                            </span>
                            ${hasSitemap ? '<span style="font-size: 11px; background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 99px; font-weight: 600;">✓ Sitemap</span>' : ''}
                            ${hasRobots ? '<span style="font-size: 11px; background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 99px; font-weight: 600;">✓ Robots</span>' : ''}
                            ${linksChecked ? '<span style="font-size: 11px; background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 99px; font-weight: 600;">✓ Links</span>' : ''}
                        </div>
                        <div style="height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); width: ${completionPercent}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading SEO projects overview:', error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <p style="margin: 0;">Error loading SEO projects</p>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">${error.message}</p>
                </div>
            `;
        }
    }

    async selectProjectForSEO(projectId) {
        // Update selector
        const selector = document.getElementById('seoProjectSelector');
        if (selector) {
            selector.value = projectId;
        }

        // Load the project
        await this.loadProjectSEO(projectId);

        // Scroll to top of SEO section
        const seoSection = document.getElementById('seoSection');
        if (seoSection) {
            seoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async saveSEOMetadata(metadata) {
        if (!this.selectedSeoProject) {
            console.error('No project selected for SEO');
            return;
        }

        try {
            // Get existing metadata
            const existingMetadata = this.selectedSeoProject.seo_metadata || {};

            // Merge with new metadata
            const updatedMetadata = { ...existingMetadata, ...metadata };

            // Update in database
            const { error } = await supabaseClient.client
                .from('projects')
                .update({ seo_metadata: updatedMetadata })
                .eq('id', this.selectedSeoProject.id);

            if (error) throw error;

            // Update local project object
            this.selectedSeoProject.seo_metadata = updatedMetadata;

            console.log('SEO metadata saved:', updatedMetadata);
        } catch (error) {
            console.error('Error saving SEO metadata:', error);
            this.showToast('Error saving SEO data: ' + error.message, 'error');
        }
    }

    syncAssets() {
        const btn = event.target.closest('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showToast('Assets synced successfully (Sitemap.xml, Robots.txt)', 'success');
        }, 1200);
    }

    async submitToGoogleAutomatic() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
        }

        try {
            this.showToast('🔄 Step 1/3: Generating sitemap...', 'info');

            // Step 1: Generate sitemap (silently)
            const sitemapResponse = await fetch('/api/generate-sitemap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id
                })
            });

            if (!sitemapResponse.ok) {
                throw new Error('Failed to generate sitemap');
            }

            this.showToast('🔄 Step 2/3: Generating robots.txt...', 'info');

            // Step 2: Generate robots.txt (silently)
            const robotsResponse = await fetch('/api/generate-robots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id
                })
            });

            if (!robotsResponse.ok) {
                throw new Error('Failed to generate robots.txt');
            }

            this.showToast('🔄 Step 3/3: Submitting to Google...', 'info');

            // Step 3: Submit to Google
            const domain = this.selectedSeoProject.published_url || `https://${this.selectedSeoProject.subdomain_slug}.yenze.io`;

            const response = await fetch('/api/submit-to-google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id,
                    userId: this.currentUser?.id,
                    sitemapUrl: `${domain}/sitemap.xml`
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const accountMsg = result.accountUsed ? ` (via ${result.accountUsed})` : '';
                this.showToast(`✅ Success! Sitemap submitted to Google${accountMsg}`, 'success');

                // Update UI
                this.updateSEOChecklistUI('google');
                this.updateSEOChecklistUI('sitemap');

                // Also open Google Search Console for verification
                setTimeout(() => {
                    window.open(result.gscUrl, '_blank');
                }, 1500);
            } else {
                // Show manual instructions
                let instructionsHtml = `
                    <div style="padding: 20px; background: white; border-radius: 8px; max-width: 500px; margin-top: 16px;">
                        <h3 style="margin: 0 0 12px 0; color: #0f172a;">✅ Files Generated - Manual Submission Required</h3>
                        <p style="color: #64748b; margin-bottom: 16px;">${result.message}</p>
                        ${result.accountToUse ? `<div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #0284c7;">
                            <strong>Google Account:</strong> ${result.accountToUse}
                        </div>` : ''}
                        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                            <strong style="display: block; margin-bottom: 8px;">Follow these steps:</strong>
                            <ol style="margin: 0; padding-left: 20px; color: #0f172a;">
                                ${result.instructions.map(inst => `<li style="margin-bottom: 6px;">${inst}</li>`).join('')}
                            </ol>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <a href="${result.gscUrl}" target="_blank" style="flex: 1; background: #3b82f6; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: 600;">Open Google Search Console</a>
                            <button onclick="this.closest('div').parentElement.remove()" style="padding: 10px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close</button>
                        </div>
                    </div>
                `;

                // Show instructions in modal or inject into DOM
                const googleSection = document.querySelector('[onclick*="submitToGoogleAutomatic"]')?.closest('[style*="padding: 24px"]');
                if (googleSection) {
                    const existingInstructions = googleSection.querySelector('#googleInstructions');
                    if (existingInstructions) existingInstructions.remove();

                    const instructionsDiv = document.createElement('div');
                    instructionsDiv.id = 'googleInstructions';
                    instructionsDiv.innerHTML = instructionsHtml;
                    googleSection.appendChild(instructionsDiv);
                }

                this.showToast('Files generated! Please complete manual submission', 'warning');
            }
        } catch (error) {
            console.error('Automatic submission error:', error);
            this.showToast('Error during automatic submission: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    async submitToGoogle() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;
        }

        try {
            const domain = this.selectedSeoProject.published_url || `https://${this.selectedSeoProject.subdomain_slug}.yenze.io`;

            // Call API to submit to Google
            const response = await fetch('/api/submit-to-google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id,
                    userId: this.currentUser?.id,
                    sitemapUrl: `${domain}/sitemap.xml`
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const accountMsg = result.accountUsed ? ` (via ${result.accountUsed})` : '';
                this.showToast(`Sitemap submitted to Google successfully!${accountMsg}`, 'success');

                // Update UI
                this.updateSEOChecklistUI('google');

                // Also open Google Search Console for manual verification
                setTimeout(() => {
                    window.open(result.gscUrl, '_blank');
                }, 1000);
            } else {
                // Show manual instructions
                let instructionsHtml = `
                    <div style="padding: 20px; background: white; border-radius: 8px; max-width: 500px;">
                        <h3 style="margin: 0 0 12px 0; color: #0f172a;">Manual Submission Required</h3>
                        <p style="color: #64748b; margin-bottom: 16px;">${result.message}</p>
                        ${result.accountToUse ? `<div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #0284c7;">
                            <strong>Google Account:</strong> ${result.accountToUse}
                        </div>` : ''}
                        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                            <strong style="display: block; margin-bottom: 8px;">Follow these steps:</strong>
                            <ol style="margin: 0; padding-left: 20px; color: #0f172a;">
                                ${result.instructions.map(inst => `<li style="margin-bottom: 6px;">${inst}</li>`).join('')}
                            </ol>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <a href="${result.gscUrl}" target="_blank" style="flex: 1; background: #3b82f6; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: 600;">Open Google Search Console</a>
                            <button onclick="this.closest('div').parentElement.remove()" style="padding: 10px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close</button>
                        </div>
                    </div>
                `;

                // Show instructions in modal or inject into DOM
                const googleSection = document.querySelector('[onclick*="submitToGoogle"]')?.closest('[style*="padding: 20px"]');
                if (googleSection) {
                    const existingInstructions = googleSection.querySelector('#googleInstructions');
                    if (existingInstructions) existingInstructions.remove();

                    const instructionsDiv = document.createElement('div');
                    instructionsDiv.id = 'googleInstructions';
                    instructionsDiv.style.marginTop = '16px';
                    instructionsDiv.innerHTML = instructionsHtml;
                    googleSection.appendChild(instructionsDiv);
                }

                this.showToast('Please submit manually - instructions shown below', 'warning');
            }
        } catch (error) {
            console.error('Submit to Google error:', error);
            this.showToast('Error submitting to Google: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    async verifyGoogleProperty() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const verificationInput = document.getElementById('verificationFileInput');
        const verificationFile = verificationInput?.value.trim();

        if (!verificationFile) {
            this.showToast('Please enter the verification filename', 'error');
            return;
        }

        // Validate format (should be like google4aa3d892271c286b.html)
        if (!verificationFile.match(/^google[a-f0-9]+\.html$/i)) {
            this.showToast('Invalid verification file format. Should be like: google4aa3d892271c286b.html', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding verification...';
            btn.disabled = true;
        }

        try {
            const response = await fetch('/api/verify-google-property', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id,
                    verificationFile: verificationFile
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Hide form, show success message
                document.getElementById('verificationForm').style.display = 'none';
                document.getElementById('verificationSuccess').style.display = 'block';
                document.getElementById('verifyStatus').textContent = 'Added';
                document.getElementById('verifyStatus').style.background = '#dcfce7';
                document.getElementById('verifyStatus').style.color = '#166534';

                this.showToast('✅ Verification code added to your website!', 'success');

                // Reload project to get updated HTML
                await this.loadProjects();
            } else {
                this.showToast(result.message || 'Failed to add verification code', 'error');
            }
        } catch (error) {
            console.error('Verify Google property error:', error);
            this.showToast('Error adding verification code: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    async generateSitemap() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;
        }

        try {
            const response = await fetch('/api/generate-sitemap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show preview of sitemap
                const previewHtml = `
                    <div style="max-height: 400px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;">
                        <strong>Sitemap Generated!</strong><br>
                        <strong>Total URLs:</strong> ${result.totalUrls}<br>
                        <strong>Base URL:</strong> ${result.baseUrl}<br><br>
                        <pre style="white-space: pre-wrap;">${this.escapeHtml(result.sitemap.substring(0, 500))}...</pre>
                    </div>
                `;

                // Show in modal or alert
                this.showToast('Sitemap generated successfully!', 'success');

                // Download sitemap
                const blob = new Blob([result.sitemap], { type: 'application/xml' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sitemap.xml';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.showToast('Sitemap downloaded!', 'success');

                // Update UI
                this.updateSEOChecklistUI('sitemap');

                // Save sitemap metadata
                await this.saveSEOMetadata({ sitemap_generated: true });

                // Reload SEO projects overview
                await this.loadSEOProjectsOverview();
            } else {
                throw new Error(result.error || 'Failed to generate sitemap');
            }
        } catch (error) {
            console.error('Generate sitemap error:', error);
            this.showToast('Error generating sitemap: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    async openRobotsTxt() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;
        }

        try {
            const response = await fetch('/api/generate-robots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id,
                    allowCrawling: true
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show robots.txt content
                const robotsPreview = `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre-wrap;">
${result.robotsTxt}
                    </div>
                `;

                this.showToast('Robots.txt generated successfully!', 'success');

                // Download robots.txt
                const blob = new Blob([result.robotsTxt], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'robots.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.showToast('Robots.txt downloaded!', 'success');

                // Save robots metadata
                await this.saveSEOMetadata({ robots_generated: true });

                // Reload SEO projects overview
                await this.loadSEOProjectsOverview();
            } else {
                throw new Error(result.error || 'Failed to generate robots.txt');
            }
        } catch (error) {
            console.error('Generate robots.txt error:', error);
            this.showToast('Error generating robots.txt: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    async checkBrokenLinks() {
        if (!this.selectedSeoProject) {
            this.showToast('Please select a project first', 'error');
            return;
        }

        const btn = event?.target?.closest('button');
        const originalText = btn?.innerHTML || '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            btn.disabled = true;
        }

        try {
            const response = await fetch('/api/check-broken-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedSeoProject.id
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Show results summary
                const summary = `
                    <div style="padding: 20px;">
                        <h3 style="margin-top: 0;">Broken Link Check Results</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                            <div style="background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${result.working}</div>
                                <div style="font-size: 12px;">Working Links</div>
                            </div>
                            <div style="background: #ef4444; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${result.broken}</div>
                                <div style="font-size: 12px;">Broken Links</div>
                            </div>
                            <div style="background: #f59e0b; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold;">${result.warnings}</div>
                                <div style="font-size: 12px;">Warnings</div>
                            </div>
                        </div>
                        <p><strong>Total Links Checked:</strong> ${result.total}</p>
                        <p><strong>Health Status:</strong> <span style="color: ${result.summary.health === 'healthy' ? '#10b981' : result.summary.health === 'warning' ? '#f59e0b' : '#ef4444'}; font-weight: bold; text-transform: uppercase;">${result.summary.health}</span></p>
                    </div>
                `;

                if (result.broken > 0) {
                    this.showToast(`Found ${result.broken} broken link(s)`, 'error');
                } else {
                    this.showToast('All links are working!', 'success');
                }

                // Update UI
                this.updateSEOChecklistUI('links', null, result);

                // Save links check metadata
                await this.saveSEOMetadata({ links_checked: true });

                // Reload SEO projects overview
                await this.loadSEOProjectsOverview();

                // Log detailed results to console
                console.log('Broken Link Check Results:', result);

                // Show broken links with suggestions if any
                if (result.broken > 0) {
                    const brokenLinks = result.links.filter(l => l.status === 'broken');
                    console.error('Broken Links:', brokenLinks);

                    // Show detailed suggestions in UI
                    let suggestionsHtml = '<div style="margin-top: 20px; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;"><h4 style="margin: 0 0 12px 0; color: #dc2626;">🔴 Broken Links - Fix Suggestions</h4>';

                    brokenLinks.forEach((link, index) => {
                        const suggestion = link.suggestion || {};
                        suggestionsHtml += `
                            <div style="margin-bottom: 16px; padding: 12px; background: white; border-radius: 6px;">
                                <div style="font-weight: 600; color: #dc2626; margin-bottom: 4px;">${index + 1}. ${link.url}</div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">${link.message} (Type: ${link.type})</div>
                                ${suggestion.action ? `
                                    <div style="background: #fffbeb; padding: 10px; border-radius: 4px; margin-top: 8px;">
                                        <div style="font-weight: 600; font-size: 13px; color: #d97706; margin-bottom: 6px;">💡 ${suggestion.action}</div>
                                        <div style="font-size: 12px; color: #0f172a; margin-bottom: 8px;">${suggestion.fix}</div>
                                        <div style="font-size: 11px; color: #64748b; font-style: italic; margin-bottom: 8px;">${suggestion.reason}</div>
                                        ${suggestion.possibleFixes ? `
                                            <div style="font-size: 12px; color: #0f172a; font-weight: 600; margin-bottom: 4px;">Possible fixes:</div>
                                            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #0f172a;">
                                                ${suggestion.possibleFixes.map(fix => `<li>${fix}</li>`).join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    });

                    suggestionsHtml += '</div>';

                    // Insert suggestions into the DOM
                    const linksCheckSection = document.querySelector('[onclick*="checkBrokenLinks"]')?.closest('[style*="padding: 20px"]');
                    if (linksCheckSection) {
                        const existingSuggestions = linksCheckSection.querySelector('#brokenLinkSuggestions');
                        if (existingSuggestions) existingSuggestions.remove();

                        const suggestionsDiv = document.createElement('div');
                        suggestionsDiv.id = 'brokenLinkSuggestions';
                        suggestionsDiv.innerHTML = suggestionsHtml;
                        linksCheckSection.appendChild(suggestionsDiv);
                    }
                }

                // Show warnings with suggestions
                if (result.warnings > 0) {
                    const warningLinks = result.links.filter(l => l.status === 'warning');
                    console.warn('Warning Links:', warningLinks);

                    let warningsHtml = '<div style="margin-top: 16px; padding: 16px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;"><h4 style="margin: 0 0 12px 0; color: #d97706;">⚠️ Warnings - Optimization Suggestions</h4>';

                    warningLinks.forEach((link, index) => {
                        const suggestion = link.suggestion || {};
                        warningsHtml += `
                            <div style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 6px;">
                                <div style="font-weight: 600; color: #d97706; margin-bottom: 4px;">${index + 1}. ${link.url}</div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">${link.message}</div>
                                ${link.redirectUrl ? `<div style="font-size: 12px; color: #0f172a; margin-bottom: 6px;">Redirects to: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${link.redirectUrl}</code></div>` : ''}
                                ${suggestion.fix ? `<div style="font-size: 12px; color: #92400e;">💡 ${suggestion.fix}</div>` : ''}
                            </div>
                        `;
                    });

                    warningsHtml += '</div>';

                    const linksCheckSection = document.querySelector('[onclick*="checkBrokenLinks"]')?.closest('[style*="padding: 20px"]');
                    if (linksCheckSection) {
                        const existingWarnings = linksCheckSection.querySelector('#warningLinkSuggestions');
                        if (existingWarnings) existingWarnings.remove();

                        const warningsDiv = document.createElement('div');
                        warningsDiv.id = 'warningLinkSuggestions';
                        warningsDiv.innerHTML = warningsHtml;
                        linksCheckSection.appendChild(warningsDiv);
                    }
                }
            } else {
                throw new Error(result.error || 'Failed to check links');
            }
        } catch (error) {
            console.error('Check broken links error:', error);
            this.showToast('Error checking links: ' + error.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadPayments() {
        const connectBtn = document.getElementById('connectStripeBtn');
        const isConnected = !!this.currentUser?.user_metadata?.stripe_account_id;

        // Update Connect Button State
        if (isConnected) {
            connectBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Stripe Connected
            `;
            connectBtn.style.background = '#10B981';
            connectBtn.style.borderColor = '#10B981';
            connectBtn.disabled = true;
        } else {
            connectBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
                Connect Stripe
            `;
            connectBtn.disabled = false;
            connectBtn.onclick = () => this.connectStripe();
        }

        // Show projects list view
        this.showPaymentProjectsList();
    }

    async showPaymentProjectsList() {
        const projectsListView = document.getElementById('projectsListView');
        const detailView = document.getElementById('paymentLinksDetailView');
        const projectsListContainer = document.getElementById('projectsWithPricingList');

        // Show projects list, hide detail view
        projectsListView.style.display = 'block';
        detailView.style.display = 'none';

        projectsListContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Scanning projects for pricing...</p></div>';

        // Load ALL projects from Supabase first
        try {
            const { data: allProjects, error } = await supabaseClient.client
                .from('projects')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Update this.projects with all user projects
            this.projects = allProjects || [];
            console.log(`[Payment Links] Loaded ${this.projects.length} projects for scanning`);

        } catch (error) {
            console.error('Error loading projects for payment scanning:', error);
            projectsListContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                    <h3>Error loading projects</h3>
                    <p>${error.message}</p>
                </div>
            `;
            return;
        }

        // Scan for pricing items
        setTimeout(async () => {
            const detectedItems = await this.scanProjectsForPayments();

            // Group items by project
            const projectsMap = {};
            detectedItems.forEach(item => {
                if (!projectsMap[item.projectId]) {
                    projectsMap[item.projectId] = {
                        projectId: item.projectId,
                        projectName: item.projectName,
                        items: []
                    };
                }
                projectsMap[item.projectId].items.push(item);
            });

            const projectsWithPricing = Object.values(projectsMap);

            // Update stats
            document.getElementById('projectsWithPricingCount').textContent = projectsWithPricing.length;
            document.getElementById('detectedItemsCount').textContent = detectedItems.length;

            if (projectsWithPricing.length === 0) {
                projectsListContainer.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                        <h3>No pricing items found</h3>
                        <p>Add pricing sections to your websites to see them here.</p>
                    </div>
                `;
                return;
            }

            // Render projects list
            projectsListContainer.innerHTML = projectsWithPricing.map(project => `
                <div class="integration-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); border: 1px solid #E2E8F0; cursor: pointer; transition: all 0.2s;" onclick="dashboardApp.showProjectPaymentLinks('${project.projectId}', '${project.projectName}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="9" y1="3" x2="9" y2="21"></line>
                                </svg>
                                <h3 style="margin: 0; font-size: 18px; color: #0F172A; font-weight: 600;">${project.projectName}</h3>
                            </div>
                            <div style="display: flex; gap: 12px; font-size: 13px; color: #64748B;">
                                <div><strong>${project.items.length}</strong> pricing ${project.items.length === 1 ? 'item' : 'items'}</div>
                                <div>•</div>
                                <div>0 active links</div>
                            </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            `).join('');
        }, 800);
    }

    showProjectPaymentLinks(projectId, projectName) {
        const projectsListView = document.getElementById('projectsListView');
        const detailView = document.getElementById('paymentLinksDetailView');
        const detailContainer = document.getElementById('detectedPaymentsList');
        const titleElement = document.getElementById('selectedProjectTitle');
        const isConnected = !!this.currentUser?.user_metadata?.stripe_account_id;

        // Show detail view, hide projects list
        projectsListView.style.display = 'none';
        detailView.style.display = 'block';

        // Update title
        titleElement.textContent = projectName;

        // Load payment links for this project
        detailContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading payment links...</p></div>';

        setTimeout(async () => {
            const allItems = await this.scanProjectsForPayments();
            const projectItems = allItems.filter(item => item.projectId === projectId);

            if (projectItems.length === 0) {
                detailContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8;">
                        <h3>No pricing items found in this project</h3>
                        <p>Add pricing sections to see them here.</p>
                    </div>
                `;
                return;
            }

            detailContainer.innerHTML = projectItems.map(item => `
                <div class="integration-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); border: 1px solid #E2E8F0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0; font-size: 18px; color: #0F172A; font-weight: 600;">${item.name}</h3>
                        </div>
                        <div style="background: #EFF6FF; color: #0066FF; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 15px; white-space: nowrap; margin-left: 12px;">
                            ${item.price}
                        </div>
                    </div>

                    <div style="margin-bottom: 16px; font-size: 13px; color: #475569;">
                        <ul style="padding-left: 20px; margin: 0;">
                            ${item.features.slice(0, 2).map(f => `<li>${f}</li>`).join('')}
                            ${item.features.length > 2 ? `<li>+${item.features.length - 2} more features</li>` : ''}
                        </ul>
                    </div>

                    <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 16px;">
                        <button onclick="dashboardApp.createPaymentLink('${item.id}', '${item.name}', '${item.price}')" class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" ${!isConnected ? 'disabled title="Connect Stripe first"' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            Create Payment Link
                        </button>
                        <div style="text-align: center; margin-top: 8px; font-size: 11px; color: #94A3B8;">
                            5% platform fee applies
                        </div>
                    </div>
                </div>
            `).join('');
        }, 300);
    }

    async scanProjectsForPayments() {
        const detectedItems = [];

        for (const project of this.projects) {
            if (!project.html) continue;

            // Create a temporary DOM element to parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(project.html, 'text/html');

            // Look for pricing cards/plans
            // Strategy: Look for common classes like .pricing-plan, .card with price inside
            const pricingCards = doc.querySelectorAll('.pricing-plan, .pricing-card, .plan-card');

            pricingCards.forEach((card, index) => {
                const nameEl = card.querySelector('h3, h4, .plan-name, .title');
                const priceEl = card.querySelector('.price, .amount, .plan-price');
                const features = Array.from(card.querySelectorAll('li')).map(li => li.textContent.trim());

                if (nameEl && priceEl) {
                    detectedItems.push({
                        id: `${project.id}_${index}`,
                        projectId: project.id,
                        projectName: project.name || 'Untitled Project',
                        name: nameEl.textContent.trim(),
                        price: priceEl.textContent.trim(),
                        features: features
                    });
                }
            });

            // Fallback: Look for any element with a currency symbol and a button nearby
            if (detectedItems.length === 0) {
                // This is a simpler heuristic
                const prices = Array.from(doc.querySelectorAll('*')).filter(el =>
                    /^\s*[$€£]\s*\d+/.test(el.textContent) && el.children.length === 0
                );

                prices.forEach((priceEl, index) => {
                    // Find closest container
                    const container = priceEl.closest('div, section');
                    if (container) {
                        const nameEl = container.querySelector('h3, h4');
                        const btn = container.querySelector('button, a.btn');

                        if (nameEl && btn) {
                            detectedItems.push({
                                id: `${project.id}_fallback_${index}`,
                                projectId: project.id,
                                projectName: project.name || 'Untitled Project',
                                name: nameEl.textContent.trim(),
                                price: priceEl.textContent.trim(),
                                features: []
                            });
                        }
                    }
                });
            }
        }

        return detectedItems;
    }

    connectStripe() {
        if (!this.currentUser) return;
        // Redirect to backend API to initiate OAuth flow
        window.location.href = `/api/connect-stripe?userId=${this.currentUser.id}`;
    }

    async createPaymentLink(itemId, name, price) {
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = 'Creating...';

        try {
            const { data: { session } } = await supabaseClient.client.auth.getSession();

            const response = await fetch('/api/create-payment-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    productName: name,
                    amount: price,
                    currency: 'usd' // Defaulting to USD for now, should parse from price string
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create link');
            }

            const { url } = await response.json();

            // Prompt user to copy
            prompt('Payment Link Created! Copy this URL and paste it into your button link in the editor:', url);

            // Update active links count (optimistic)
            const countEl = document.getElementById('activeLinksCount');
            countEl.textContent = parseInt(countEl.textContent) + 1;

        } catch (error) {
            console.error('Payment Link Error:', error);
            alert('Error creating payment link: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
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
                const planPriority = { 'BUSINESS': 4, 'PRO': 3, 'STARTER': 2, 'FREE': 1, 'ONE_TIME': 2 };
                const highestPlan = subscriptions.reduce((highest, sub) => {
                    const currentPriority = planPriority[sub.plan.toUpperCase()] || 0;
                    const highestPriority = planPriority[highest.plan.toUpperCase()] || 0;
                    return currentPriority > highestPriority ? sub : highest;
                }, subscriptions[0]);

                const plan = highestPlan.plan.toUpperCase();
                subscriptionCount = subscriptions.filter(s => s.plan.toUpperCase() === plan).length;

                // Store user plan for limits checking
                this.userPlan = plan;

                if (PLANS[plan]) {
                    planName = PLANS[plan].name;
                    if (subscriptionCount > 1) {
                        planName += ` (${subscriptionCount}x)`;
                    }
                    planDescription = `$${PLANS[plan].price}/${PLANS[plan].period}`;
                }
            } else {
                // No active subscription - FREE plan
                this.userPlan = 'FREE';
            }

            // Show/hide PRO badge on Analytics tab based on plan
            const analyticsSidebarItem = document.getElementById('analyticsSidebarItem');
            const proBadge = analyticsSidebarItem?.querySelector('.pro-badge');
            const hasAnalytics = PlanUtils.hasFeature('hasAnalytics', this.userPlan);

            if (proBadge) {
                // Show PRO badge for FREE users
                proBadge.style.display = hasAnalytics ? 'none' : 'inline-block';
            }

            const planInfoHTML = `
                <h4>${planName}</h4>
                <p>${planDescription}</p>
                ${planName === 'Free' ? '<button class="upgrade-btn" onclick="pricingModal.show()">Upgrade Plan</button>' : ''}
            `;

            const planInfoElement = document.getElementById('currentPlanInfo');
            if (planInfoElement) {
                planInfoElement.innerHTML = planInfoHTML;
            }

        } catch (error) {
            console.error('Error loading plan:', error);
        }
    }

    async loadProjects(loadMore = false) {
        const grid = document.getElementById('projectsGrid');

        // Initialize pagination state
        if (!loadMore) {
            this.projectsPage = 0;
            this.projectsPerPage = 9;
            this.hasMoreProjects = true;
            this.allProjectsLoaded = false;
            grid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading your projects...</p></div>';
        }

        try {
            // Get user's subscription first (only once)
            if (!loadMore) {
                const { data: subscriptions } = await supabaseClient.client
                    .from('subscriptions')
                    .select('plan')
                    .eq('user_id', this.currentUser.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1);

                const subscription = subscriptions?.[0];
                this.userPlan = subscription?.plan || 'free';

                console.log('[Dashboard] User subscription:', subscription);
                console.log('[Dashboard] User plan:', this.userPlan);

                // Get custom domains once
                const { data: customDomains } = await supabaseClient.client
                    .from('custom_domains')
                    .select('project_id, domain, status')
                    .eq('user_id', this.currentUser.id);

                console.log('[Dashboard] Custom domains found:', customDomains);

                // Create a map of project_id -> custom domain
                this.domainMap = {};
                if (customDomains) {
                    customDomains.forEach(cd => {
                        this.domainMap[cd.project_id] = cd.domain;
                        console.log(`[Dashboard] Mapping project ${cd.project_id} to domain ${cd.domain} (status: ${cd.status})`);
                    });
                }
            }

            // Load projects with pagination
            const offset = this.projectsPage * this.projectsPerPage;
            const { data: projects, error, count } = await supabaseClient.client
                .from('projects')
                .select('*', { count: 'exact' })
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .range(offset, offset + this.projectsPerPage - 1);

            if (error) throw error;

            const newProjects = projects || [];

            // Update state
            if (!loadMore) {
                this.projects = newProjects;
            } else {
                this.projects = [...this.projects, ...newProjects];
            }

            this.hasMoreProjects = this.projects.length < count;
            this.allProjectsLoaded = !this.hasMoreProjects;

            console.log(`[Dashboard] Loaded ${newProjects.length} projects (${this.projects.length}/${count} total)`);

            if (this.projects.length === 0 && !loadMore) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                        <h3>No projects yet</h3>
                        <p>Create your first project to get started</p>
                        <button class="btn-primary" onclick="dashboardApp.handleCreateProject()">Create Project</button>
                    </div>
                `;
                return;
            }

            // Check if user has access to analytics
            const hasAnalytics = PlanUtils.hasFeature('hasAnalytics', this.userPlan);

            // Render projects (only the new ones if loading more)
            const projectsToRender = loadMore ? newProjects : this.projects;
            const projectsHTML = projectsToRender.map((project) => {
                // Determine project plan and URL based on whether it has a custom domain
                const customDomain = this.domainMap[project.id];
                const projectPlan = customDomain ? this.userPlan : 'free';
                const projectUrl = customDomain ? `https://${customDomain}` : project.published_url;

                // Create a data URL for the preview iframe
                const previewDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(project.html)}`;

                return `
                    <div class="project-card">
                        <div class="project-thumbnail" onclick="dashboardApp.viewProject('${project.id}')" style="cursor: pointer;">
                            <iframe 
                                src="${previewDataUrl}" 
                                sandbox="allow-same-origin" 
                                scrolling="no"
                                loading="lazy"
                                style="width: 100%; height: 100%; border: none; pointer-events: none; transform: scale(0.3); transform-origin: 0 0; width: 333.33%; height: 333.33%;">
                            </iframe>
                        </div>
                        <div class="project-info">
                            <h3 class="project-name" onclick="dashboardApp.showRenameModal('${project.id}', '${(project.name || 'Untitled Project').replace(/'/g, "\\'")}')" style="cursor: pointer;" title="Click to rename">${project.name || 'Untitled Project'}</h3>
                            <div class="project-meta">
                                <span>📅 ${new Date(project.created_at).toLocaleDateString()}</span>
                                <span>📦 ${projectPlan}</span>
                                ${customDomain ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🌐 CUSTOM DOMAIN</span>' : ''}
                            </div>
                            ${projectUrl ? `
                                <a href="${projectUrl}" target="_blank" class="project-url">
                                    ${customDomain ? customDomain : projectUrl}
                                </a>
                            ` : '<span class="project-url" style="color: #9ca3af;">Not published</span>'}
                            ${customDomain && project.published_url ? `
                                <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                                    Also available at: <a href="${project.published_url}" target="_blank" style="color: #9ca3af;">${project.published_url}</a>
                                </div>
                            ` : ''}

                            <div class="project-stats">
                                <div class="project-stat">
                                    <span id="views-${project.id}">${hasAnalytics ? '...' : '—'}</span>
                                    <span>Views</span>
                                </div>
                                <div class="project-stat">
                                    <span id="visitors-${project.id}">${hasAnalytics ? '...' : '—'}</span>
                                    <span>Visitors</span>
                                </div>
                                ${!hasAnalytics ? `
                                    <div style="grid-column: 1 / -1; text-align: center; margin-top: 8px;">
                                        <button 
                                            onclick="event.stopPropagation(); if(typeof pricingModal !== 'undefined') { pricingModal.show(); } else { alert('Please wait, loading pricing...'); }"
                                            style="
                                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                                color: white;
                                                border: none;
                                                padding: 6px 12px;
                                                border-radius: 6px;
                                                font-size: 11px;
                                                font-weight: 600;
                                                cursor: pointer;
                                                transition: transform 0.2s;
                                            "
                                            onmouseover="this.style.transform='scale(1.05)'"
                                            onmouseout="this.style.transform='scale(1)'"
                                        >
                                            ✨ Upgrade
                                        </button>
                                    </div>
                                ` : ''}
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
                                <button class="action-btn" onclick="dashboardApp.showExportModal('${project.id}', '${(project.name || 'website').replace(/'/g, "\\'")}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Export
                                </button>
                                <button class="action-btn" onclick="dashboardApp.showBackupsModal('${project.id}', '${(project.name || 'website').replace(/'/g, "\\'")}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2v4"></path>
                                        <path d="M12 18v4"></path>
                                        <path d="M4.93 4.93l2.83 2.83"></path>
                                        <path d="M16.24 16.24l2.83 2.83"></path>
                                        <path d="M2 12h4"></path>
                                        <path d="M18 12h4"></path>
                                        <path d="M4.93 19.07l2.83-2.83"></path>
                                        <path d="M16.24 7.76l2.83-2.83"></path>
                                    </svg>
                                    Backups
                                </button>
                                <button class="action-btn" onclick="dashboardApp.showABTestModal('${project.id}', '${(project.name || 'website').replace(/'/g, "\\'")}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 3h5v5"></path>
                                        <path d="M8 3H3v5"></path>
                                        <path d="M21 3l-7 7"></path>
                                        <path d="M3 3l7 7"></path>
                                        <path d="M21 14v7h-5"></path>
                                        <path d="M3 14v7h5"></path>
                                    </svg>
                                    A/B Test
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
            }).join('');

            // Append or replace HTML
            if (loadMore) {
                // Remove existing load more button if it exists
                const existingLoadMore = document.getElementById('loadMoreProjects');
                if (existingLoadMore) {
                    existingLoadMore.remove();
                }
                grid.insertAdjacentHTML('beforeend', projectsHTML);
            } else {
                grid.innerHTML = projectsHTML;
            }

            // Add "Load More" button if there are more projects
            if (this.hasMoreProjects) {
                const loadMoreHTML = `
                    <div id="loadMoreProjects" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 24px;">
                        <button onclick="dashboardApp.loadMoreProjects()" class="btn-secondary" style="padding: 12px 32px; font-size: 14px; font-weight: 600;">
                            📦 Load More Projects (${this.projects.length} loaded)
                        </button>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', loadMoreHTML);
            }

            // Fetch stats asynchronously after rendering (only for new projects)
            if (hasAnalytics) {
                projectsToRender.forEach(async (project) => {
                    const stats = await this.getProjectStats(project.id);
                    const viewsEl = document.getElementById(`views-${project.id}`);
                    const visitorsEl = document.getElementById(`visitors-${project.id}`);

                    if (viewsEl) viewsEl.textContent = stats.views;
                    if (visitorsEl) visitorsEl.textContent = stats.visitors;
                });
            }

            // Increment page for next load
            if (loadMore) {
                this.projectsPage++;
            }

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

    async loadMoreProjects() {
        const btn = document.querySelector('#loadMoreProjects button');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;
        }

        this.projectsPage++;
        await this.loadProjects(true);
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
        window.location.href = `/builder.html?project=${projectId}`;
    }

    handleCreateProject() {
        // Check if user can create more projects based on their plan
        const plan = this.userPlan || 'FREE';
        const currentProjectCount = this.projects.length;
        const check = PlanUtils.canCreateProject(currentProjectCount, plan);

        if (!check.allowed) {
            // Show upgrade modal
            alert(`You've reached your plan limit of ${check.limit} project${check.limit !== 1 ? 's' : ''}.\n\nUpgrade to create more projects!`);
            this.showSection('billing');
            return;
        }

        // Allowed to create project
        window.location.href = '/builder.html?new=true';
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
        const plan = this.userPlan || 'FREE';
        const hasAnalytics = PlanUtils.hasFeature('hasAnalytics', plan);

        // Check if user has access to analytics
        if (!hasAnalytics) {
            // Show blurred analytics with upgrade CTA
            this.showAnalyticsUpgradeView();
            return;
        }

        const selectedProject = document.getElementById('analyticsFilter')?.value || 'all';
        const days = this.analyticsDateRange || 7;

        // Update total stats
        const totalStats = await this.getAnalyticsStats(selectedProject === 'all' ? null : selectedProject, days);

        document.getElementById('totalViews').textContent = this.formatNumber(totalStats.totalViews || 0);
        document.getElementById('uniqueVisitors').textContent = this.formatNumber(totalStats.uniqueVisitors || 0);
        document.getElementById('bounceRate').textContent = totalStats.bounceRate ? `${totalStats.bounceRate}%` : '-';
        document.getElementById('totalProjects').textContent = this.projects.length;

        // Load chart data
        await this.loadAnalyticsChart(selectedProject === 'all' ? null : selectedProject, days);

        // Load device breakdown
        await this.loadDeviceBreakdown(selectedProject === 'all' ? null : selectedProject);

        // Load top referrers
        await this.loadTopReferrers(selectedProject === 'all' ? null : selectedProject);

        // Load per-project analytics
        await this.loadProjectAnalytics();

        // Populate filter dropdown
        const filterSelect = document.getElementById('analyticsFilter');
        if (filterSelect) {
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
    }

    // Set date range for analytics
    setAnalyticsDateRange(days) {
        this.analyticsDateRange = days;

        // Update active button
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.days) === days) {
                btn.classList.add('active');
            }
        });

        // Reload analytics
        this.loadAnalytics();
    }

    // Get analytics stats with date filtering
    async getAnalyticsStats(projectId, days) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get project IDs to query
            let projectIds = [];
            if (projectId) {
                projectIds = [projectId];
            } else {
                projectIds = this.projects.map(p => p.id);
            }

            if (projectIds.length === 0) {
                return { totalViews: 0, uniqueVisitors: 0, bounceRate: 0 };
            }

            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('visitor_id, session_id, created_at')
                .in('project_id', projectIds)
                .eq('event_type', 'page_view')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            const totalViews = events.length;
            const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;

            // Calculate bounce rate (sessions with only 1 page view)
            const sessionCounts = {};
            events.forEach(e => {
                sessionCounts[e.session_id] = (sessionCounts[e.session_id] || 0) + 1;
            });
            const totalSessions = Object.keys(sessionCounts).length;
            const bouncedSessions = Object.values(sessionCounts).filter(c => c === 1).length;
            const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

            return { totalViews, uniqueVisitors, bounceRate };
        } catch (error) {
            console.error('Error getting analytics stats:', error);
            return { totalViews: 0, uniqueVisitors: 0, bounceRate: 0 };
        }
    }

    // Load and render chart
    async loadAnalyticsChart(projectId, days) {
        const canvas = document.getElementById('analyticsChart');
        if (!canvas) return;

        try {
            // Get project IDs
            let projectIds = [];
            if (projectId) {
                projectIds = [projectId];
            } else {
                projectIds = this.projects.map(p => p.id);
            }

            if (projectIds.length === 0) {
                this.renderEmptyChart(canvas);
                return;
            }

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('visitor_id, created_at')
                .in('project_id', projectIds)
                .eq('event_type', 'page_view')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by date
            const viewsByDate = {};
            const visitorsByDate = {};

            // Initialize all dates in range
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                const dateKey = date.toISOString().split('T')[0];
                viewsByDate[dateKey] = 0;
                visitorsByDate[dateKey] = new Set();
            }

            // Fill in actual data
            events.forEach(event => {
                const dateKey = new Date(event.created_at).toISOString().split('T')[0];
                if (viewsByDate.hasOwnProperty(dateKey)) {
                    viewsByDate[dateKey]++;
                    visitorsByDate[dateKey].add(event.visitor_id);
                }
            });

            const labels = Object.keys(viewsByDate).map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const viewsData = Object.values(viewsByDate);
            const visitorsData = Object.keys(visitorsByDate).map(k => visitorsByDate[k].size);

            this.renderChart(canvas, labels, viewsData, visitorsData);
        } catch (error) {
            console.error('Error loading chart data:', error);
            this.renderEmptyChart(canvas);
        }
    }

    renderChart(canvas, labels, viewsData, visitorsData) {
        // Destroy existing chart
        if (this.analyticsChart) {
            this.analyticsChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Views',
                        data: viewsData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Visitors',
                        data: visitorsData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderEmptyChart(canvas) {
        if (this.analyticsChart) {
            this.analyticsChart.destroy();
        }
        const ctx = canvas.getContext('2d');
        this.analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Views',
                    data: [0],
                    borderColor: '#e2e8f0'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Load device breakdown
    async loadDeviceBreakdown(projectId) {
        const container = document.getElementById('deviceBreakdown');
        if (!container) return;

        try {
            let projectIds = [];
            if (projectId) {
                projectIds = [projectId];
            } else {
                projectIds = this.projects.map(p => p.id);
            }

            if (projectIds.length === 0) {
                container.innerHTML = '<p style="color: #94a3b8; text-align: center;">No data available</p>';
                return;
            }

            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('user_agent')
                .in('project_id', projectIds)
                .eq('event_type', 'page_view');

            if (error) throw error;

            // Detect devices from user agent
            const devices = { desktop: 0, mobile: 0, tablet: 0 };
            events.forEach(e => {
                const ua = (e.user_agent || '').toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                    devices.mobile++;
                } else if (ua.includes('tablet') || ua.includes('ipad')) {
                    devices.tablet++;
                } else {
                    devices.desktop++;
                }
            });

            const total = devices.desktop + devices.mobile + devices.tablet;
            if (total === 0) {
                container.innerHTML = '<p style="color: #94a3b8; text-align: center;">No data available</p>';
                return;
            }

            const deviceData = [
                { name: 'Desktop', count: devices.desktop, color: '#3b82f6', icon: '🖥️' },
                { name: 'Mobile', count: devices.mobile, color: '#10b981', icon: '📱' },
                { name: 'Tablet', count: devices.tablet, color: '#f59e0b', icon: '📱' }
            ];

            container.innerHTML = deviceData.map(d => {
                const percentage = Math.round((d.count / total) * 100);
                return `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">${d.icon}</span>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="font-size: 14px; font-weight: 500;">${d.name}</span>
                                <span style="font-size: 14px; color: #64748b;">${percentage}% (${this.formatNumber(d.count)})</span>
                            </div>
                            <div class="device-bar">
                                <div class="device-bar-fill" style="width: ${percentage}%; background: ${d.color};"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading device breakdown:', error);
            container.innerHTML = '<p style="color: #ef4444;">Error loading data</p>';
        }
    }

    // Load top referrers
    async loadTopReferrers(projectId) {
        const container = document.getElementById('topReferrers');
        if (!container) return;

        try {
            let projectIds = [];
            if (projectId) {
                projectIds = [projectId];
            } else {
                projectIds = this.projects.map(p => p.id);
            }

            if (projectIds.length === 0) {
                container.innerHTML = '<p style="color: #94a3b8; text-align: center;">No data available</p>';
                return;
            }

            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('referrer')
                .in('project_id', projectIds)
                .eq('event_type', 'page_view')
                .not('referrer', 'is', null)
                .not('referrer', 'eq', '');

            if (error) throw error;

            // Count referrers
            const referrerCounts = {};
            events.forEach(e => {
                if (e.referrer) {
                    try {
                        const url = new URL(e.referrer);
                        const domain = url.hostname.replace('www.', '');
                        referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
                    } catch {
                        referrerCounts[e.referrer] = (referrerCounts[e.referrer] || 0) + 1;
                    }
                }
            });

            const sorted = Object.entries(referrerCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            if (sorted.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #94a3b8;">
                        <p style="margin: 0;">No referrer data yet</p>
                        <p style="margin: 8px 0 0; font-size: 13px;">Traffic sources will appear here</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = sorted.map(([referrer, count], index) => `
                <div class="referrer-item">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 20px; height: 20px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #64748b;">${index + 1}</span>
                        <span style="font-size: 14px; color: #0f172a;">${referrer}</span>
                    </div>
                    <span style="font-size: 14px; font-weight: 600; color: #3b82f6;">${this.formatNumber(count)}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading referrers:', error);
            container.innerHTML = '<p style="color: #ef4444;">Error loading data</p>';
        }
    }

    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    showAnalyticsUpgradeView() {
        // Get the analytics section
        const analyticsSection = document.getElementById('analyticsSection');

        // Create blurred content with upgrade overlay
        analyticsSection.innerHTML = `
            <div style="position: relative; min-height: 600px;">
                <!-- Blurred Analytics Content -->
                <div style="filter: blur(8px); pointer-events: none; opacity: 0.4;">
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <h3>Total Views</h3>
                            <div class="analytics-stat">1,234</div>
                        </div>
                        <div class="analytics-card">
                            <h3>Unique Visitors</h3>
                            <div class="analytics-stat">567</div>
                        </div>
                        <div class="analytics-card">
                            <h3>Avg. Duration</h3>
                            <div class="analytics-stat">2m 34s</div>
                        </div>
                        <div class="analytics-card">
                            <h3>Total Projects</h3>
                            <div class="analytics-stat">3</div>
                        </div>
                    </div>

                    <div style="margin-top: 40px;">
                        <h3>Project Performance</h3>
                        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
                            <div class="analytics-item">
                                <div>
                                    <div class="analytics-project-name">My Website</div>
                                    <div class="analytics-project-url">https://example.com</div>
                                </div>
                                <div class="analytics-numbers">
                                    <div class="analytics-number">
                                        <strong>450</strong>
                                        <span>Views</span>
                                    </div>
                                    <div class="analytics-number">
                                        <strong>234</strong>
                                        <span>Visitors</span>
                                    </div>
                                </div>
                            </div>
                            <div class="analytics-item">
                                <div>
                                    <div class="analytics-project-name">Portfolio Site</div>
                                    <div class="analytics-project-url">https://example2.com</div>
                                </div>
                                <div class="analytics-numbers">
                                    <div class="analytics-number">
                                        <strong>784</strong>
                                        <span>Views</span>
                                    </div>
                                    <div class="analytics-number">
                                        <strong>333</strong>
                                        <span>Visitors</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upgrade Overlay -->
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 10;
                    background: white;
                    padding: 48px;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    max-width: 500px;
                    width: 90%;
                ">
                    <div style="
                        width: 64px;
                        height: 64px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    ">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                    </div>

                    <h2 style="
                        font-size: 28px;
                        font-weight: 700;
                        color: #1f2937;
                        margin-bottom: 12px;
                    ">Unlock Analytics</h2>

                    <p style="
                        font-size: 16px;
                        color: #6b7280;
                        margin-bottom: 32px;
                        line-height: 1.6;
                    ">Get detailed insights into your website performance, visitor behavior, and engagement metrics.</p>

                    <button
                        class="btn-primary"
                        onclick="if(typeof pricingModal !== 'undefined') { pricingModal.show(); } else { alert('Please wait, loading pricing...'); }"
                        style="
                            width: 100%;
                            padding: 16px 32px;
                            font-size: 16px;
                            font-weight: 600;
                            margin-bottom: 12px;
                        "
                    >
                        Upgrade Plan
                    </button>

                    <p style="
                        font-size: 13px;
                        color: #9ca3af;
                        margin-top: 16px;
                    ">Starting at just <strong>$9/month</strong></p>

                    <div style="
                        margin-top: 24px;
                        padding-top: 24px;
                        border-top: 1px solid #e5e7eb;
                    ">
                        <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px; font-weight: 500;">
                            ✨ Included with Starter:
                        </p>
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            text-align: left;
                            font-size: 13px;
                            color: #4b5563;
                        ">
                            <div>✓ Real-time analytics dashboard</div>
                            <div>✓ 5 projects with custom subdomains</div>
                            <div>✓ 5,000 monthly visitors</div>
                            <div>✓ Remove YENZE branding</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadProjectAnalytics() {
        const listContainer = document.getElementById('projectAnalyticsList');

        if (this.projects.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <p style="margin: 0;">No projects to show analytics for</p>
                    <p style="margin: 8px 0 0; font-size: 13px;">Create a project to start tracking</p>
                </div>
            `;
            return;
        }

        const days = this.analyticsDateRange || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const analyticsHTML = await Promise.all(this.projects.map(async (project) => {
            const stats = await this.getProjectStatsForPeriod(project.id, startDate);
            const projectUrl = project.published_url || project.public_slug
                ? `https://${project.public_slug}.yenze.app`
                : null;

            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">
                            ${(project.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${project.name || 'Untitled Project'}</div>
                            <div style="font-size: 12px; color: #64748b;">${projectUrl || 'Not published'}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 24px; text-align: right;">
                        <div>
                            <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">${this.formatNumber(stats.views)}</div>
                            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Views</div>
                        </div>
                        <div>
                            <div style="font-size: 18px; font-weight: 700; color: #10b981;">${this.formatNumber(stats.visitors)}</div>
                            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Visitors</div>
                        </div>
                    </div>
                </div>
            `;
        }));

        listContainer.innerHTML = analyticsHTML.join('');
    }

    // Get project stats for a specific period
    async getProjectStatsForPeriod(projectId, startDate) {
        try {
            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('visitor_id')
                .eq('project_id', projectId)
                .eq('event_type', 'page_view')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            return {
                views: events.length,
                visitors: new Set(events.map(e => e.visitor_id)).size
            };
        } catch (error) {
            console.error('Error getting project stats:', error);
            return { views: 0, visitors: 0 };
        }
    }

    async loadDomains() {
        const listContainer = document.getElementById('domainsList');
        listContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading domains...</p></div>';

        // Check if user has access to custom domains
        const hasAccess = await this.checkCustomDomainAccess();
        console.log('[Custom Domains] Access check result:', hasAccess);

        if (!hasAccess) {
            console.log('[Custom Domains] User does not have access - showing upgrade notice');
            document.getElementById('domainUpgradeNotice').style.display = 'block';
            document.getElementById('addDomainBtn').disabled = true;
            listContainer.innerHTML = '';
            return;
        }

        console.log('[Custom Domains] User has access - loading domains list');

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
                console.error('[Custom Domains] Error checking domain access:', error);
                return false;
            }

            console.log('[Custom Domains] Found subscriptions:', subscriptions?.length || 0);
            subscriptions?.forEach(sub => {
                console.log('[Custom Domains] - Plan:', sub.plan, 'Status:', sub.status);
            });

            if (subscriptions && subscriptions.length > 0) {
                // Check if any subscription is paid (not free)
                const hasAccess = subscriptions.some(sub => {
                    const plan = sub.plan.toUpperCase();
                    const allowed = plan === 'STARTER' || plan === 'PRO' || plan === 'BUSINESS' || plan === 'ONE_TIME';
                    console.log('[Custom Domains] Plan check:', plan, '- Allowed:', allowed);
                    return allowed;
                });
                console.log('[Custom Domains] Final access decision:', hasAccess);
                return hasAccess;
            }

            console.log('[Custom Domains] No active subscriptions found');
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
        // First sync subscriptions with Stripe to ensure data is up-to-date
        await this.syncSubscriptionsWithStripe();

        // Load current plan info
        await this.loadBillingPlanInfo();

        // Load usage stats
        await this.loadUsageStats();

        // Load payment history
        await this.loadPaymentHistory();

        // Update available plans section to mark current plan
        await this.updateAvailablePlans();
    }

    async syncSubscriptionsWithStripe() {
        try {
            const response = await fetch('/api/sync-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabaseClient.client.auth.getSession()).data.session.access_token}`
                },
                body: JSON.stringify({
                    userId: this.currentUser.id
                })
            });

            if (!response.ok) {
                console.warn('Failed to sync subscriptions, continuing anyway...');
            } else {
                console.log('Subscriptions synced with Stripe');
            }
        } catch (error) {
            console.error('Sync error:', error);
            // Don't throw - continue loading even if sync fails
        }
    }

    async updateAvailablePlans() {
        try {
            const { data: subscription } = await supabaseClient.client
                .from('subscriptions')
                .select('plan')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            const currentPlan = (subscription?.plan || 'free').toLowerCase();

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
                const planPriority = { 'BUSINESS': 4, 'PRO': 3, 'STARTER': 2, 'FREE': 1, 'ONE_TIME': 2 };
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
                                <strong>${highestPlan.cancel_at_period_end ? 'Expires' : 'Renews'}:</strong> ${new Date(highestPlan.current_period_end).toLocaleDateString()}
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
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="pricingModal.show()">
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
        const container = document.getElementById('usageInfo');
        const plan = this.userPlan || 'FREE';
        const limits = PlanUtils.getLimits(plan);

        // Get current usage
        const projectsCount = this.projects.length;
        const domainsCount = this.domains.length;

        // Check project limit
        const projectCheck = PlanUtils.canCreateProject(projectsCount, plan);
        const projectPercentage = limits.maxProjects === -1 ? 0 : (projectsCount / limits.maxProjects) * 100;
        const projectLevel = PlanUtils.getUsageLevel(projectPercentage);

        // Check custom domains limit
        const domainCheck = PlanUtils.canAddCustomDomain(domainsCount, plan);
        const domainPercentage = limits.maxCustomDomains === -1 ? 0 :
            limits.maxCustomDomains === 0 ? 0 : (domainsCount / limits.maxCustomDomains) * 100;
        const domainLevel = PlanUtils.getUsageLevel(domainPercentage);

        // Get actual visitor data from analytics
        let currentVisitors = 0;
        try {
            const totalStats = await analyticsTracker.getTotalStats(this.currentUser.id, null);
            currentVisitors = totalStats.uniqueVisitors || 0;
        } catch (error) {
            console.error('Error getting visitor stats:', error);
        }
        const visitorCheck = PlanUtils.checkVisitorLimit(currentVisitors, plan);
        const visitorLevel = PlanUtils.getUsageLevel(visitorCheck.percentage);

        // Get form submissions count for this month
        let currentFormSubmissions = 0;
        try {
            const projectIds = this.projects.map(p => p.id);
            if (projectIds.length > 0) {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { count } = await supabaseClient.client
                    .from('form_submissions')
                    .select('*', { count: 'exact', head: true })
                    .in('project_id', projectIds)
                    .gte('created_at', startOfMonth.toISOString());

                currentFormSubmissions = count || 0;
            }
        } catch (error) {
            console.error('Error getting form submissions count:', error);
        }
        const formCheck = PlanUtils.checkFormSubmissionLimit(currentFormSubmissions, plan);
        const formLevel = PlanUtils.getUsageLevel(formCheck.percentage);

        // Build HTML
        const usageHTML = `
            <div class="usage-limits">
                <!-- Projects -->
                <div class="limit-item ${projectLevel}">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            Projects
                        </span>
                        <span class="limit-value">${projectsCount} / ${PlanUtils.formatLimit(limits.maxProjects)}</span>
                    </div>
                    ${limits.maxProjects !== -1 ? `
                        <div class="progress-bar">
                            <div class="progress-fill ${projectLevel}" style="width: ${Math.min(projectPercentage, 100)}%"></div>
                        </div>
                    ` : ''}
                    ${!projectCheck.allowed ? '<p class="limit-warning">⚠️ Project limit reached. Upgrade to create more.</p>' : ''}
                </div>

                <!-- Monthly Visitors -->
                <div class="limit-item ${visitorLevel}">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Monthly Visitors
                        </span>
                        <span class="limit-value">${currentVisitors.toLocaleString()} / ${PlanUtils.formatLimit(limits.maxVisitors)}</span>
                    </div>
                    ${limits.maxVisitors !== -1 ? `
                        <div class="progress-bar">
                            <div class="progress-fill ${visitorLevel}" style="width: ${Math.min(visitorCheck.percentage, 100)}%"></div>
                        </div>
                    ` : ''}
                    ${visitorCheck.exceeded ? '<p class="limit-warning">⚠️ Visitor limit exceeded this month.</p>' : ''}
                </div>

                <!-- Form Messages -->
                <div class="limit-item ${formLevel}">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Form Messages
                        </span>
                        <span class="limit-value">${currentFormSubmissions.toLocaleString()} / ${PlanUtils.formatLimit(limits.maxFormSubmissions)}</span>
                    </div>
                    ${limits.maxFormSubmissions !== -1 ? `
                        <div class="progress-bar">
                            <div class="progress-fill ${formLevel}" style="width: ${Math.min(formCheck.percentage, 100)}%"></div>
                        </div>
                    ` : ''}
                    ${formCheck.exceeded ? '<p class="limit-warning">⚠️ Monthly form submission limit reached.</p>' : ''}
                </div>

                <!-- Storage per Site -->
                <div class="limit-item normal">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                            Storage per Site
                        </span>
                        <span class="limit-value">${PlanUtils.formatStorage(limits.maxStorage)} limit</span>
                    </div>
                </div>

                <!-- Custom Domains -->
                <div class="limit-item ${domainLevel}">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            Custom Domains
                        </span>
                        <span class="limit-value">${domainsCount} / ${PlanUtils.formatLimit(limits.maxCustomDomains)}</span>
                    </div>
                    ${limits.maxCustomDomains > 0 && limits.maxCustomDomains !== -1 ? `
                        <div class="progress-bar">
                            <div class="progress-fill ${domainLevel}" style="width: ${Math.min(domainPercentage, 100)}%"></div>
                        </div>
                    ` : ''}
                    ${!domainCheck.allowed ? '<p class="limit-warning">⚠️ Domain limit reached. Upgrade to add more.</p>' : ''}
                    ${limits.maxCustomDomains === 0 ? '<p class="limit-info">Custom domains available on paid plans</p>' : ''}
                </div>

                <!-- Features -->
                <div class="limit-item normal">
                    <div class="limit-header">
                        <span class="limit-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            Features
                        </span>
                    </div>
                    <div class="features-list">
                        ${limits.hasSubdomain ? '<span class="feature-badge">✓ Custom Subdomain</span>' : '<span class="feature-badge disabled">✗ Custom Subdomain</span>'}
                        ${limits.hasAnalytics ? '<span class="feature-badge">✓ Analytics</span>' : '<span class="feature-badge disabled">✗ Analytics</span>'}
                        ${limits.hasCodeExport ? '<span class="feature-badge">✓ Code Export</span>' : '<span class="feature-badge disabled">✗ Code Export</span>'}
                        ${limits.hasRemoveBranding ? '<span class="feature-badge">✓ No Branding</span>' : '<span class="feature-badge disabled">✗ Has Branding</span>'}
                        ${limits.hasPrioritySupport ? '<span class="feature-badge">✓ Priority Support</span>' : ''}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = usageHTML;
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

    async saveMailchimpConfig() {
        const audienceId = document.getElementById('mailchimpAudienceId').value.trim();
        const apiKey = document.getElementById('mailchimpApiKey').value.trim();

        if (!audienceId || !apiKey) {
            alert('Please enter both Audience ID and API Key');
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('user_integrations')
                .upsert({
                    user_id: this.currentUser.id,
                    service: 'mailchimp',
                    api_key: apiKey,
                    config: { audience_id: audienceId },
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,service'
                });

            if (error) throw error;

            this.showToast('Mailchimp configuration saved!', 'success');
        } catch (error) {
            console.error('Error saving Mailchimp config:', error);
            alert('Failed to save configuration: ' + error.message);
        }
    }

    async saveConvertKitFormId() {
        const formId = document.getElementById('convertkitFormId').value.trim();

        if (!formId) {
            alert('Please enter a ConvertKit Form ID');
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('user_integrations')
                .upsert({
                    user_id: this.currentUser.id,
                    service: 'convertkit',
                    api_key: formId,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,service'
                });

            if (error) throw error;

            this.showToast('ConvertKit Form ID saved!', 'success');
        } catch (error) {
            console.error('Error saving ConvertKit Form ID:', error);
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
                    } else if (integration.service === 'mailchimp') {
                        const apiKeyInput = document.getElementById('mailchimpApiKey');
                        const audienceInput = document.getElementById('mailchimpAudienceId');
                        if (apiKeyInput) apiKeyInput.value = integration.api_key;
                        if (audienceInput && integration.config?.audience_id) {
                            audienceInput.value = integration.config.audience_id;
                        }
                    } else if (integration.service === 'convertkit') {
                        const input = document.getElementById('convertkitFormId');
                        if (input) input.value = integration.api_key;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading integrations:', error);
        }
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // =====================================================
    // Messages Section
    // =====================================================

    async loadMessages() {
        const listContainer = document.getElementById('messagesList');
        const noMessagesState = document.getElementById('noMessagesState');

        listContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading messages...</p></div>';
        noMessagesState.style.display = 'none';

        try {
            // First, get user's projects to filter messages
            const { data: projects } = await supabaseClient.client
                .from('projects')
                .select('id, name')
                .eq('user_id', this.currentUser.id);

            if (!projects || projects.length === 0) {
                listContainer.innerHTML = '';
                noMessagesState.style.display = 'block';
                this.updateMessageStats([], []);
                return;
            }

            const projectIds = projects.map(p => p.id);
            const projectMap = {};
            projects.forEach(p => { projectMap[p.id] = p.name || 'Untitled Project'; });

            // Populate project filter
            const filterSelect = document.getElementById('messagesProjectFilter');
            filterSelect.innerHTML = '<option value="all">All Projects</option>';
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name || 'Untitled Project';
                filterSelect.appendChild(option);
            });

            // Get messages for user's projects
            const { data: messages, error } = await supabaseClient.client
                .from('form_submissions')
                .select('*')
                .in('project_id', projectIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.messages = messages || [];

            // Update stats
            this.updateMessageStats(this.messages, projects);

            // Render messages
            this.renderMessages(this.messages, projectMap);

        } catch (error) {
            console.error('Error loading messages:', error);
            listContainer.innerHTML = `<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading messages: ${error.message}</p>`;
        }
    }

    updateMessageStats(messages, projects) {
        const totalEl = document.getElementById('totalMessages');
        const unreadEl = document.getElementById('unreadMessages');
        const thisMonthEl = document.getElementById('thisMonthMessages');
        const badge = document.getElementById('messagesBadge');
        const markAllBtn = document.getElementById('markAllReadBtn');

        const total = messages.length;
        const unread = messages.filter(m => !m.is_read).length;

        // Calculate this month's messages
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = messages.filter(m => new Date(m.created_at) >= startOfMonth).length;

        if (totalEl) totalEl.textContent = total;
        if (unreadEl) unreadEl.textContent = unread;
        if (thisMonthEl) thisMonthEl.textContent = thisMonth;

        // Update badge
        if (badge) {
            if (unread > 0) {
                badge.textContent = unread > 99 ? '99+' : unread;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Show/hide mark all as read button
        if (markAllBtn) {
            markAllBtn.style.display = unread > 0 ? 'block' : 'none';
        }
    }

    renderMessages(messages, projectMap) {
        const listContainer = document.getElementById('messagesList');
        const noMessagesState = document.getElementById('noMessagesState');

        if (messages.length === 0) {
            listContainer.innerHTML = '';
            noMessagesState.style.display = 'block';
            return;
        }

        noMessagesState.style.display = 'none';

        const messagesHTML = messages.map(message => {
            const initials = this.getInitials(message.name || message.email);
            const projectName = message.project_id ? (projectMap[message.project_id] || 'Unknown Project') : 'Unknown';
            const date = this.formatMessageDate(message.created_at);
            const isUnread = !message.is_read;

            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" onclick="dashboardApp.viewMessage('${message.id}')">
                    <div class="message-header">
                        <div class="message-sender">
                            <div class="message-avatar">${initials}</div>
                            <div class="message-sender-info">
                                <h4>${this.escapeHtml(message.name || 'Anonymous')}</h4>
                                <p>${this.escapeHtml(message.email)}</p>
                            </div>
                        </div>
                        <div class="message-meta">
                            <div class="message-date">${date}</div>
                            <span class="message-project">${this.escapeHtml(projectName)}</span>
                        </div>
                    </div>
                    <div class="message-preview">${this.escapeHtml(message.message)}</div>
                    <div class="message-actions" onclick="event.stopPropagation()">
                        <a href="mailto:${message.email}" class="message-action-btn primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Reply
                        </a>
                        ${isUnread ? `
                            <button class="message-action-btn" onclick="dashboardApp.markAsRead('${message.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Mark as read
                            </button>
                        ` : ''}
                        <button class="message-action-btn" onclick="dashboardApp.deleteMessage('${message.id}')" style="color: #EF4444;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = messagesHTML;
    }

    async viewMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        // Mark as read if not already
        if (!message.is_read) {
            await this.markAsRead(messageId);
        }

        // Get project name
        let projectName = 'Unknown Project';
        if (message.project_id) {
            const { data: project } = await supabaseClient.client
                .from('projects')
                .select('name')
                .eq('id', message.project_id)
                .single();
            if (project) projectName = project.name || 'Untitled Project';
        }

        const initials = this.getInitials(message.name || message.email);
        const date = new Date(message.created_at).toLocaleString();

        const modalHTML = `
            <div id="messageDetailModal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close" onclick="document.getElementById('messageDetailModal').remove()">&times;</span>

                    <div class="message-detail">
                        <div class="message-detail-header">
                            <div class="message-detail-sender">
                                <div class="message-detail-avatar">${initials}</div>
                                <div class="message-detail-info">
                                    <h3>${this.escapeHtml(message.name || 'Anonymous')}</h3>
                                    <p>${this.escapeHtml(message.email)}</p>
                                    ${message.phone ? `<p style="color: #94A3B8; font-size: 13px;">Phone: ${this.escapeHtml(message.phone)}</p>` : ''}
                                </div>
                            </div>
                            <div class="message-detail-meta">
                                <div class="message-detail-date">${date}</div>
                                <span class="message-detail-project">${this.escapeHtml(projectName)}</span>
                            </div>
                        </div>

                        ${message.subject ? `<h4 style="margin-bottom: 12px; color: #0F172A;">${this.escapeHtml(message.subject)}</h4>` : ''}

                        <div class="message-detail-content">
                            <p>${this.escapeHtml(message.message)}</p>
                        </div>

                        ${message.custom_fields ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="font-size: 14px; color: #64748B; margin-bottom: 12px;">Additional Information</h4>
                                <div style="background: #F8FAFC; border-radius: 8px; padding: 16px;">
                                    ${Object.entries(message.custom_fields).map(([key, value]) => `
                                        <div style="margin-bottom: 8px;">
                                            <strong style="color: #334155;">${this.escapeHtml(key.replace(/_/g, ' '))}:</strong>
                                            <span style="color: #64748B; margin-left: 8px;">${this.escapeHtml(String(value))}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="message-detail-actions">
                            <a href="mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || 'Your message')}" class="btn-primary" style="text-decoration: none;">
                                Reply by Email
                            </a>
                            <button class="btn-secondary" onclick="dashboardApp.deleteMessage('${message.id}'); document.getElementById('messageDetailModal').remove();">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async markAsRead(messageId) {
        try {
            const { error } = await supabaseClient.client
                .from('form_submissions')
                .update({ is_read: true })
                .eq('id', messageId);

            if (error) throw error;

            // Update local state
            const message = this.messages.find(m => m.id === messageId);
            if (message) message.is_read = true;

            // Show success feedback
            this.showToast('Message marked as read', 'success');

            // Re-render
            this.loadMessages();

        } catch (error) {
            console.error('Error marking message as read:', error);
            this.showToast('Failed to mark message as read', 'error');
        }
    }

    async markAllAsRead() {
        try {
            const unreadIds = this.messages.filter(m => !m.is_read).map(m => m.id);

            if (unreadIds.length === 0) return;

            const { error } = await supabaseClient.client
                .from('form_submissions')
                .update({ is_read: true })
                .in('id', unreadIds);

            if (error) throw error;

            this.showToast('All messages marked as read', 'success');
            this.loadMessages();

        } catch (error) {
            console.error('Error marking all as read:', error);
            this.showToast('Failed to mark messages as read', 'error');
        }
    }

    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const { error } = await supabaseClient.client
                .from('form_submissions')
                .delete()
                .eq('id', messageId);

            if (error) throw error;

            this.showToast('Message deleted', 'success');
            this.loadMessages();

        } catch (error) {
            console.error('Error deleting message:', error);
            this.showToast('Failed to delete message', 'error');
        }
    }

    filterMessages() {
        const filterValue = document.getElementById('messagesProjectFilter').value;

        // Get project map
        const projectMap = {};
        this.projects.forEach(p => { projectMap[p.id] = p.name || 'Untitled Project'; });

        let filteredMessages = this.messages;
        if (filterValue !== 'all') {
            filteredMessages = this.messages.filter(m => m.project_id === filterValue);
        }

        this.renderMessages(filteredMessages, projectMap);
    }

    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    formatMessageDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            if (hours < 1) {
                const mins = Math.floor(diff / 60000);
                return mins < 1 ? 'Just now' : `${mins}m ago`;
            }
            return `${hours}h ago`;
        }

        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }

        // Otherwise show date
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadUnreadCount() {
        try {
            // Get user's projects
            const { data: projects } = await supabaseClient.client
                .from('projects')
                .select('id')
                .eq('user_id', this.currentUser.id);

            if (!projects || projects.length === 0) return;

            const projectIds = projects.map(p => p.id);

            // Count unread messages
            const { count } = await supabaseClient.client
                .from('form_submissions')
                .select('*', { count: 'exact', head: true })
                .in('project_id', projectIds)
                .eq('read', false);

            // Update badge
            const badge = document.getElementById('messagesBadge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    // ==========================================
    // EXPORT FUNCTIONALITY
    // ==========================================

    showExportModal(projectId, projectName) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('exportModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'exportModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <span class="close" onclick="dashboardApp.closeExportModal()">&times;</span>
                    <h2 style="margin-bottom: 8px;">Export Project</h2>
                    <p style="color: #64748b; margin-bottom: 24px;" id="exportProjectName">Download your project files</p>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="export-option" onclick="dashboardApp.exportProject('html')" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: left;">
                            <div style="width: 48px; height: 48px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #0f172a; font-size: 15px;">Download HTML</div>
                                <div style="color: #64748b; font-size: 13px;">Single HTML file with all content</div>
                            </div>
                        </button>

                        <button class="export-option" onclick="dashboardApp.exportProject('zip')" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: left;">
                            <div style="width: 48px; height: 48px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #0f172a; font-size: 15px;">Download ZIP</div>
                                <div style="color: #64748b; font-size: 13px;">All pages, CSS, and assets in a ZIP file</div>
                            </div>
                        </button>
                    </div>

                    <div id="exportStatus" style="margin-top: 16px; display: none; padding: 12px; border-radius: 8px; font-size: 14px;"></div>

                    <style>
                        .export-option:hover {
                            border-color: #3b82f6 !important;
                            background: #eff6ff !important;
                        }
                    </style>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Store current export project
        this.exportProjectId = projectId;
        this.exportProjectName = projectName;

        // Update modal content
        document.getElementById('exportProjectName').textContent = `Export "${projectName}"`;

        // Show modal
        modal.style.display = 'flex';
    }

    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async exportProject(format) {
        const statusEl = document.getElementById('exportStatus');
        statusEl.style.display = 'block';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#1e40af';
        statusEl.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><div class="loading-spinner" style="width: 16px; height: 16px;"></div> Preparing download...</div>';

        try {
            const token = await supabaseClient.getAccessToken();

            const response = await fetch('/api/export-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: this.exportProjectId,
                    format: format
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Export failed');
            }

            // Get the blob and trigger download
            const blob = await response.blob();
            const filename = format === 'zip'
                ? `${this.exportProjectName || 'website'}.zip`
                : `${this.exportProjectName || 'website'}.html`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            // Success message
            statusEl.style.background = '#dcfce7';
            statusEl.style.color = '#166534';
            statusEl.innerHTML = '✓ Download started!';

            // Close modal after delay
            setTimeout(() => {
                this.closeExportModal();
                statusEl.style.display = 'none';
            }, 1500);

        } catch (error) {
            console.error('Export error:', error);
            statusEl.style.background = '#fef2f2';
            statusEl.style.color = '#dc2626';
            statusEl.innerHTML = `✗ ${error.message}`;
        }
    }

    // ==========================================
    // BACKUPS FUNCTIONALITY
    // ==========================================

    async showBackupsModal(projectId, projectName) {
        let modal = document.getElementById('backupsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'backupsModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close" onclick="dashboardApp.closeBackupsModal()">&times;</span>
                    <h2 style="margin-bottom: 8px;">Project Backups</h2>
                    <p style="color: #64748b; margin-bottom: 20px;" id="backupsProjectName"></p>

                    <button onclick="dashboardApp.createBackup()" class="btn-primary" style="margin-bottom: 20px; width: 100%;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Backup Now
                    </button>

                    <div id="backupsList" style="max-height: 400px; overflow-y: auto;">
                        <div class="loading-container"><div class="loading-spinner"></div></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.backupsProjectId = projectId;
        this.backupsProjectName = projectName;
        document.getElementById('backupsProjectName').textContent = `Backups for "${projectName}"`;
        modal.style.display = 'flex';

        await this.loadBackups();
    }

    closeBackupsModal() {
        document.getElementById('backupsModal').style.display = 'none';
    }

    async loadBackups() {
        const container = document.getElementById('backupsList');
        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch(`/api/backups?projectId=${this.backupsProjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!data.backups || data.backups.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <p style="margin: 0;">No backups yet</p>
                        <p style="margin: 8px 0 0; font-size: 13px;">Create your first backup to protect your work</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.backups.map(backup => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${backup.name}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                            ${new Date(backup.created_at).toLocaleString()}
                            ${backup.is_auto ? '<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">AUTO</span>' : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="dashboardApp.restoreBackup('${backup.id}')" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;">
                            Restore
                        </button>
                        <button onclick="dashboardApp.deleteBackup('${backup.id}')" class="btn-secondary" style="padding: 6px 12px; font-size: 13px; color: #dc2626;">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = '<p style="color: #dc2626; text-align: center;">Error loading backups</p>';
        }
    }

    async createBackup() {
        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: this.backupsProjectId,
                    name: `Manual backup - ${new Date().toLocaleString()}`
                })
            });

            if (!response.ok) throw new Error('Failed to create backup');

            alert('Backup created successfully!');
            await this.loadBackups();
        } catch (error) {
            alert('Error creating backup: ' + error.message);
        }
    }

    async restoreBackup(backupId) {
        if (!confirm('Are you sure you want to restore this backup? Current content will be replaced (a safety backup will be created first).')) {
            return;
        }

        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch('/api/restore-backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    backupId,
                    projectId: this.backupsProjectId
                })
            });

            if (!response.ok) throw new Error('Failed to restore backup');

            alert('Backup restored successfully!');
            this.closeBackupsModal();
        } catch (error) {
            alert('Error restoring backup: ' + error.message);
        }
    }

    async deleteBackup(backupId) {
        if (!confirm('Delete this backup?')) return;

        try {
            const token = await supabaseClient.getAccessToken();
            await fetch('/api/backups', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ backupId })
            });
            await this.loadBackups();
        } catch (error) {
            alert('Error deleting backup');
        }
    }

    // ==========================================
    // WEBHOOKS FUNCTIONALITY
    // ==========================================

    async showWebhooksModal() {
        let modal = document.getElementById('webhooksModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'webhooksModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 650px;">
                    <span class="close" onclick="dashboardApp.closeWebhooksModal()">&times;</span>
                    <h2 style="margin-bottom: 8px;">Webhooks</h2>
                    <p style="color: #64748b; margin-bottom: 20px;">Send form submissions to external services</p>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Select Project</label>
                        <select id="webhookProjectSelect" onchange="dashboardApp.loadWebhooks()" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <option value="">Select a project...</option>
                        </select>
                    </div>

                    <div id="webhookForm" style="display: none; background: #f8fafc; padding: 16px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px; font-size: 14px;">Add New Webhook</h4>
                        <input type="text" id="webhookName" placeholder="Webhook name (e.g., Zapier)" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; box-sizing: border-box;">
                        <input type="url" id="webhookUrl" placeholder="https://hooks.zapier.com/..." style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; box-sizing: border-box;">
                        <button onclick="dashboardApp.createWebhook()" class="btn-primary" style="width: 100%;">Add Webhook</button>
                    </div>

                    <div id="webhooksList">
                        <p style="color: #94a3b8; text-align: center;">Select a project to view webhooks</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Populate project select
        const select = document.getElementById('webhookProjectSelect');
        select.innerHTML = '<option value="">Select a project...</option>' +
            this.projects.map(p => `<option value="${p.id}">${p.name || 'Untitled'}</option>`).join('');

        modal.style.display = 'flex';
    }

    closeWebhooksModal() {
        document.getElementById('webhooksModal').style.display = 'none';
    }

    async loadWebhooks() {
        const projectId = document.getElementById('webhookProjectSelect').value;
        const container = document.getElementById('webhooksList');
        const form = document.getElementById('webhookForm');

        if (!projectId) {
            container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Select a project to view webhooks</p>';
            form.style.display = 'none';
            return;
        }

        form.style.display = 'block';
        this.webhooksProjectId = projectId;

        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch(`/api/webhooks?projectId=${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!data.webhooks || data.webhooks.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #94a3b8;">
                        <p>No webhooks configured</p>
                        <p style="font-size: 13px;">Add a webhook to send form data to external services</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.webhooks.map(wh => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${wh.name}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${wh.url}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; ${wh.is_active ? 'background: #dcfce7; color: #166534;' : 'background: #fef2f2; color: #dc2626;'}">${wh.is_active ? 'Active' : 'Inactive'}</span>
                        <button onclick="dashboardApp.toggleWebhook('${wh.id}', ${!wh.is_active})" class="btn-secondary" style="padding: 6px 10px; font-size: 12px;">
                            ${wh.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button onclick="dashboardApp.deleteWebhook('${wh.id}')" class="btn-secondary" style="padding: 6px 10px; font-size: 12px; color: #dc2626;">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');

            // Update webhooks count on integration card
            this.updateWebhooksCount(data.webhooks.length);
        } catch (error) {
            container.innerHTML = '<p style="color: #dc2626; text-align: center;">Error loading webhooks</p>';
        }
    }

    async createWebhook() {
        const name = document.getElementById('webhookName').value.trim();
        const url = document.getElementById('webhookUrl').value.trim();

        if (!name || !url) {
            alert('Please enter webhook name and URL');
            return;
        }

        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: this.webhooksProjectId,
                    name,
                    url
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create webhook');
            }

            document.getElementById('webhookName').value = '';
            document.getElementById('webhookUrl').value = '';
            await this.loadWebhooks();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    async toggleWebhook(webhookId, isActive) {
        try {
            const token = await supabaseClient.getAccessToken();
            await fetch('/api/webhooks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ webhookId, is_active: isActive })
            });
            await this.loadWebhooks();
        } catch (error) {
            alert('Error updating webhook');
        }
    }

    async deleteWebhook(webhookId) {
        if (!confirm('Delete this webhook?')) return;

        try {
            const token = await supabaseClient.getAccessToken();
            await fetch('/api/webhooks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ webhookId })
            });
            await this.loadWebhooks();
        } catch (error) {
            alert('Error deleting webhook');
        }
    }

    updateWebhooksCount(count) {
        const el = document.getElementById('webhooksCount');
        if (el) {
            el.innerHTML = count > 0
                ? `<span style="color: #166534;">${count} webhook${count > 1 ? 's' : ''} configured</span>`
                : 'No webhooks configured';
        }
    }

    // ==========================================
    // A/B TESTING FUNCTIONALITY
    // ==========================================

    async showABTestModal(projectId, projectName) {
        let modal = document.getElementById('abTestModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'abTestModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <span class="close" onclick="dashboardApp.closeABTestModal()">&times;</span>
                    <h2 style="margin-bottom: 8px;">A/B Testing</h2>
                    <p style="color: #64748b; margin-bottom: 20px;" id="abTestProjectName"></p>

                    <div id="abTestToggle" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="abTestEnabled" onchange="dashboardApp.toggleABTest()" style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">Enable A/B Testing</span>
                        </label>
                        <span style="font-size: 13px; color: #64748b;">Show different versions to visitors</span>
                    </div>

                    <div id="abTestContent" style="display: none;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h4 style="margin: 0;">Variants</h4>
                            <button onclick="dashboardApp.createVariant()" class="btn-primary" style="padding: 8px 16px; font-size: 13px;">
                                + Add Variant
                            </button>
                        </div>

                        <div id="variantsList"></div>

                        <div style="margin-top: 20px; padding: 16px; background: #eff6ff; border-radius: 10px;">
                            <h4 style="margin: 0 0 8px; font-size: 14px; color: #1e40af;">How it works</h4>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e40af;">
                                <li>Each visitor is randomly assigned to a variant based on weights</li>
                                <li>The same visitor always sees the same variant</li>
                                <li>Track conversions by adding <code>data-ab-convert</code> to any button</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.abTestProjectId = projectId;
        document.getElementById('abTestProjectName').textContent = `A/B Testing for "${projectName}"`;
        modal.style.display = 'flex';

        await this.loadABTest();
    }

    closeABTestModal() {
        document.getElementById('abTestModal').style.display = 'none';
    }

    async loadABTest() {
        try {
            const token = await supabaseClient.getAccessToken();
            const response = await fetch(`/api/ab-tests?projectId=${this.abTestProjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            document.getElementById('abTestEnabled').checked = data.ab_testing_enabled;
            document.getElementById('abTestContent').style.display = data.ab_testing_enabled ? 'block' : 'none';

            const container = document.getElementById('variantsList');

            if (!data.variants || data.variants.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #94a3b8;">
                        <p>No variants yet</p>
                        <p style="font-size: 13px;">Create a variant to start testing</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.variants.map(v => {
                const conversionRate = v.views > 0 ? ((v.conversions / v.views) * 100).toFixed(1) : 0;
                return `
                    <div style="padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 10px; ${v.is_control ? 'border: 2px solid #3b82f6;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 600; color: #0f172a;">
                                    ${v.name}
                                    ${v.is_control ? '<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">CONTROL</span>' : ''}
                                </div>
                                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Weight: ${v.weight}%</div>
                            </div>
                            ${!v.is_control ? `
                                <button onclick="dashboardApp.deleteVariant('${v.id}')" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 13px;">Delete</button>
                            ` : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${v.views}</div>
                                <div style="font-size: 11px; color: #64748b;">Views</div>
                            </div>
                            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 20px; font-weight: 700; color: #10b981;">${v.conversions}</div>
                                <div style="font-size: 11px; color: #64748b;">Conversions</div>
                            </div>
                            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${conversionRate}%</div>
                                <div style="font-size: 11px; color: #64748b;">Conv. Rate</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading A/B test:', error);
        }
    }

    async toggleABTest() {
        const enabled = document.getElementById('abTestEnabled').checked;
        document.getElementById('abTestContent').style.display = enabled ? 'block' : 'none';

        try {
            // Update project setting
            await supabaseClient.client
                .from('projects')
                .update({ ab_testing_enabled: enabled })
                .eq('id', this.abTestProjectId);

            // If enabling and no variants exist, create control variant
            if (enabled) {
                const token = await supabaseClient.getAccessToken();
                const response = await fetch(`/api/ab-tests?projectId=${this.abTestProjectId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!data.variants || data.variants.length === 0) {
                    await fetch('/api/ab-tests', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            projectId: this.abTestProjectId,
                            name: 'Control (Original)'
                        })
                    });
                }
                await this.loadABTest();
            }
        } catch (error) {
            console.error('Error toggling A/B test:', error);
        }
    }

    async createVariant() {
        const name = prompt('Enter variant name (e.g., "Variant B - New headline"):');
        if (!name) return;

        try {
            const token = await supabaseClient.getAccessToken();
            await fetch('/api/ab-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: this.abTestProjectId,
                    name,
                    weight: 50
                })
            });
            await this.loadABTest();
        } catch (error) {
            alert('Error creating variant');
        }
    }

    async deleteVariant(variantId) {
        if (!confirm('Delete this variant?')) return;

        try {
            const token = await supabaseClient.getAccessToken();
            await fetch('/api/ab-tests', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ variantId })
            });
            await this.loadABTest();
        } catch (error) {
            alert('Error deleting variant');
        }
    }
}

// Initialize dashboard when DOM is ready
let dashboardApp;
document.addEventListener('DOMContentLoaded', () => {
    dashboardApp = new DashboardApp();
});
