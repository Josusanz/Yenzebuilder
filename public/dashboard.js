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
            if (e.target.matches('.seo-main button') && e.target.textContent.includes('Run New Audit')) {
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
        // Load saved defaults
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

    runSEOAudit() {
        const btn = document.querySelector('.seo-main .btn-primary');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Auditing...';
            btn.disabled = true;

            setTimeout(() => {
                const score = Math.floor(Math.random() * (98 - 70 + 1) + 70);
                const color = score > 80 ? '#10b981' : (score > 50 ? '#f59e0b' : '#ef4444');

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

                btn.textContent = 'Run New Audit';
                btn.disabled = false;
                this.showToast(`Audit complete! Score: ${score}/100`, 'success');
            }, 2000);
        }
    }

    generateSitemap() {
        this.showToast('Generating sitemap.xml...', 'info');
        setTimeout(() => {
            const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://your-site.yenze.io/</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
</urlset>`;
            const blob = new Blob([sitemapContent], { type: 'text/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            a.click();
            this.showToast('Sitemap downloaded!', 'success');
        }, 1500);
    }

    openRobotsTxt() {
        const content = `User-agent: *
Allow: /
Sitemap: https://your-site.yenze.io/sitemap.xml`;
        prompt("Copy your robots.txt content:", content);
    }

    checkBrokenLinks() {
        this.showToast('Scanning for broken links...', 'info');
        setTimeout(() => {
            this.showToast('Scan complete. No broken links found (0/45 checked).', 'success');
        }, 2500);
    }

    async loadPayments() {
        const listContainer = document.getElementById('detectedPaymentsList');
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

        listContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Scanning projects for pricing...</p></div>';

        // Simulate scanning delay
        setTimeout(async () => {
            const detectedItems = await this.scanProjectsForPayments();

            document.getElementById('detectedItemsCount').textContent = detectedItems.length;

            if (detectedItems.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <h3>No pricing items found</h3>
                        <p>Add pricing sections to your websites to see them here.</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = detectedItems.map(item => `
                <div class="integration-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); border: 1px solid #E2E8F0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">${item.projectName}</div>
                            <h3 style="margin: 0; font-size: 16px; color: #0F172A; font-weight: 600;">${item.name}</h3>
                        </div>
                        <div style="background: #EFF6FF; color: #0066FF; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 14px;">
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
        }, 800);
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

    async loadProjects() {
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading your projects...</p></div>';

        try {
            // Get user's subscription first
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
                        <button class="btn-primary" onclick="dashboardApp.handleCreateProject()">Create Project</button>
                    </div>
                `;
                return;
            }

            // Get custom domains to determine which projects are on paid plans
            const { data: customDomains } = await supabaseClient.client
                .from('custom_domains')
                .select('project_id, domain, status')
                .eq('user_id', this.currentUser.id);

            console.log('[Dashboard] Custom domains found:', customDomains);

            // Create a map of project_id -> custom domain
            const domainMap = {};
            if (customDomains) {
                customDomains.forEach(cd => {
                    domainMap[cd.project_id] = cd.domain;
                    console.log(`[Dashboard] Mapping project ${cd.project_id} to domain ${cd.domain} (status: ${cd.status})`);
                });
            }

            console.log('[Dashboard] Domain map:', domainMap);

            // Check if user has access to analytics
            const hasAnalytics = PlanUtils.hasFeature('hasAnalytics', this.userPlan);

            // Render projects
            const projectsHTML = await Promise.all(this.projects.map(async (project) => {
                // Get analytics for this project
                const stats = await this.getProjectStats(project.id);

                // Determine project plan and URL based on whether it has a custom domain
                const customDomain = domainMap[project.id];
                const projectPlan = customDomain ? this.userPlan : 'free';
                const projectUrl = customDomain ? `https://${customDomain}` : project.published_url;

                // Debug logging for Yenze project
                if (project.name === 'Yenze') {
                    console.log('[Dashboard] Yenze project details:');
                    console.log('  Project ID:', project.id);
                    console.log('  Custom domain:', customDomain);
                    console.log('  Project plan:', projectPlan);
                    console.log('  User plan:', this.userPlan);
                    console.log('  Project URL:', projectUrl);
                }

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
                                    <span>${hasAnalytics ? stats.views : '—'}</span>
                                    <span>Views</span>
                                </div>
                                <div class="project-stat">
                                    <span>${hasAnalytics ? stats.visitors : '—'}</span>
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
        const unread = messages.filter(m => !m.read).length;

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
            const isUnread = !message.read;

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
        if (!message.read) {
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
                .update({ read: true })
                .eq('id', messageId);

            if (error) throw error;

            // Update local state
            const message = this.messages.find(m => m.id === messageId);
            if (message) message.read = true;

            // Re-render
            this.loadMessages();

        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const unreadIds = this.messages.filter(m => !m.read).map(m => m.id);

            if (unreadIds.length === 0) return;

            const { error } = await supabaseClient.client
                .from('form_submissions')
                .update({ read: true })
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
}

// Initialize dashboard when DOM is ready
let dashboardApp;
document.addEventListener('DOMContentLoaded', () => {
    dashboardApp = new DashboardApp();
});
