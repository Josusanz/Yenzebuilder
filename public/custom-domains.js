// Custom Domains Management for Dashboard
// Handles adding, verifying, and managing custom domains

class CustomDomainsManager {
    constructor(dashboardApp) {
        this.dashboardApp = dashboardApp;
        this.domains = [];
        this.selectedProject = null;
    }

    async loadDomains() {
        try {
            const user = supabaseClient.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = supabaseClient.session?.access_token;
            if (!token) {
                throw new Error('No access token available');
            }

            // Fetch custom domains from database
            const { data, error } = await supabaseClient.client
                .from('custom_domains')
                .select(`
                    *,
                    project:projects(id, name)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading custom domains:', error);
                throw error;
            }

            this.domains = data || [];
            this.renderDomainsList();

        } catch (error) {
            console.error('Error in loadDomains:', error);
            this.showError('Failed to load custom domains: ' + error.message);
        }
    }

    renderDomainsList() {
        const container = document.getElementById('customDomainsContainer');
        if (!container) return;

        if (this.domains.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌐</div>
                    <h3>No Custom Domains</h3>
                    <p>Add a custom domain to use your own domain name for your projects.</p>
                    <button class="btn btn-primary" onclick="customDomainsManager.showAddDomainModal()">
                        Add Custom Domain
                    </button>
                </div>
            `;
            return;
        }

        const domainsHTML = this.domains.map(domain => `
            <div class="domain-card ${domain.status}">
                <div class="domain-header">
                    <div>
                        <h4>${domain.domain}</h4>
                        <p class="domain-project">Project: ${domain.project?.name || 'Unknown'}</p>
                    </div>
                    <span class="domain-status status-${domain.status}">
                        ${this.getStatusLabel(domain.status)}
                    </span>
                </div>

                ${domain.status === 'pending' ? `
                    <div class="domain-instructions">
                        <h5>📝 DNS Configuration Required</h5>
                        <p>Add this CNAME record in your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare):</p>
                        <div class="dns-record">
                            <div class="dns-row">
                                <span class="dns-label">Type:</span>
                                <code>CNAME</code>
                            </div>
                            <div class="dns-row">
                                <span class="dns-label">Name:</span>
                                <code>${domain.domain.startsWith('www') ? 'www' : '@'}</code>
                            </div>
                            <div class="dns-row">
                                <span class="dns-label">Value:</span>
                                <code>${domain.cname_target || 'cname.vercel-dns.com'}</code>
                                <button class="btn-copy" onclick="navigator.clipboard.writeText('${domain.cname_target || 'cname.vercel-dns.com'}')">
                                    📋 Copy
                                </button>
                            </div>
                            <div class="dns-row">
                                <span class="dns-label">TTL:</span>
                                <code>Auto or 3600</code>
                            </div>
                        </div>
                        <div class="dns-note">
                            <p><strong>Note:</strong> DNS propagation can take 5-30 minutes. SSL certificate will be automatically provisioned once verified.</p>
                        </div>
                        <button class="btn btn-secondary" onclick="customDomainsManager.verifyDomain('${domain.id}')">
                            🔄 Verify Domain
                        </button>
                    </div>
                ` : ''}

                ${domain.status === 'active' ? `
                    <div class="domain-active">
                        <p class="success-message">✅ Domain is active and working!</p>
                        <a href="https://${domain.domain}" target="_blank" class="btn btn-link">
                            Visit Site →
                        </a>
                    </div>
                ` : ''}

                ${domain.status === 'failed' ? `
                    <div class="domain-error">
                        <p class="error-message">❌ Domain verification failed</p>
                        ${domain.verification_errors && domain.verification_errors.length > 0 ? `
                            <ul class="error-list">
                                ${domain.verification_errors.map(err => `<li>${err}</li>`).join('')}
                            </ul>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="customDomainsManager.verifyDomain('${domain.id}')">
                            Try Again
                        </button>
                    </div>
                ` : ''}

                <div class="domain-actions">
                    <button class="btn btn-danger btn-sm" onclick="customDomainsManager.deleteDomain('${domain.id}', '${domain.domain}')">
                        🗑️ Remove
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="domains-header">
                <h3>Custom Domains</h3>
                <button class="btn btn-primary" onclick="customDomainsManager.showAddDomainModal()">
                    + Add Domain
                </button>
            </div>
            <div class="domains-list">
                ${domainsHTML}
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'pending': '⏳ Pending',
            'active': '✅ Active',
            'failed': '❌ Failed',
            'deleted': '🗑️ Deleted'
        };
        return labels[status] || status;
    }

    async showAddDomainModal() {
        // Check user's plan
        const subscription = await this.checkSubscription();
        const planName = subscription?.plan?.toLowerCase() || 'free';

        if (!['pro', 'business'].includes(planName)) {
            this.showUpgradeModal();
            return;
        }

        // Check domain limit
        const maxDomains = planName === 'pro' ? 1 : 999; // Pro: 1, Business: unlimited
        const activeDomains = this.domains.filter(d => d.status === 'active').length;

        if (activeDomains >= maxDomains) {
            alert(`You've reached your ${planName.toUpperCase()} plan limit of ${maxDomains} custom domain(s). Upgrade to BUSINESS for unlimited domains.`);
            return;
        }

        // Load user's projects
        const projects = await this.loadUserProjects();

        const modalHTML = `
            <div class="modal-overlay" id="addDomainModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Custom Domain</h3>
                        <button class="modal-close" onclick="document.getElementById('addDomainModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Select Project</label>
                            <select id="domainProject" class="form-control">
                                <option value="">Choose a project...</option>
                                ${projects.map(p => `
                                    <option value="${p.id}">${p.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Domain Name</label>
                            <input
                                type="text"
                                id="domainInput"
                                class="form-control"
                                placeholder="example.com"
                            />
                            <small class="form-hint">Enter your domain without http:// or https:// (e.g., example.com or subdomain.example.com)</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('addDomainModal').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="customDomainsManager.addDomain()">
                            Add Domain
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showUpgradeModal() {
        const modalHTML = `
            <div class="modal-overlay" id="upgradeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Upgrade Required</h3>
                        <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Custom domains are available on PRO and BUSINESS plans.</p>
                        <div class="upgrade-plans">
                            <div class="upgrade-plan">
                                <h4>PRO</h4>
                                <p class="price">$6.99/mo</p>
                                <ul>
                                    <li>1 custom domain</li>
                                    <li>10 websites</li>
                                    <li>25K visitors/mo</li>
                                    <li>SSL certificate included</li>
                                </ul>
                            </div>
                            <div class="upgrade-plan highlighted">
                                <h4>BUSINESS</h4>
                                <p class="price">$14.99/mo</p>
                                <ul>
                                    <li>Unlimited custom domains</li>
                                    <li>Unlimited websites</li>
                                    <li>100K visitors/mo</li>
                                    <li>Priority support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('upgradeModal').remove()">
                            Maybe Later
                        </button>
                        <button class="btn btn-primary" onclick="window.location.href='/dashboard?section=billing'">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async checkSubscription() {
        const { data } = await supabaseClient.client
            .from('subscriptions')
            .select('plan')
            .eq('user_id', supabaseClient.currentUser.id)
            .eq('status', 'active')
            .limit(1);

        return data?.[0] || null;
    }

    async loadUserProjects() {
        const { data } = await supabaseClient.client
            .from('projects')
            .select('id, name')
            .eq('user_id', supabaseClient.currentUser.id)
            .order('updated_at', { ascending: false });

        return data || [];
    }

    async addDomain() {
        const domainInput = document.getElementById('domainInput');
        const projectSelect = document.getElementById('domainProject');

        // Clean and normalize domain input
        let domain = domainInput.value.trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '') // Remove http:// or https://
            .replace(/^www\./, '')       // Remove www.
            .replace(/\/$/, '');         // Remove trailing slash

        const projectId = projectSelect.value;

        if (!domain || !projectId) {
            alert('Please fill in all fields');
            return;
        }

        // Validate domain format
        const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$/;
        if (!domainRegex.test(domain)) {
            alert('Invalid domain format. Please enter a valid domain like "example.com" or "subdomain.example.com"');
            return;
        }

        try {
            const token = supabaseClient.session?.access_token;

            const response = await fetch('/api/add-custom-domain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ domain, projectId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to add domain');
            }

            document.getElementById('addDomainModal').remove();
            this.showSuccess('Domain added successfully! Please configure DNS.');
            this.loadDomains();

        } catch (error) {
            console.error('Error adding domain:', error);
            alert('Error: ' + error.message);
        }
    }

    async verifyDomain(domainId) {
        try {
            const token = supabaseClient.session?.access_token;

            const response = await fetch('/api/verify-custom-domain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ domainId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to verify domain');
            }

            this.showSuccess(result.message);
            this.loadDomains();

        } catch (error) {
            console.error('Error verifying domain:', error);
            alert('Error: ' + error.message);
        }
    }

    async deleteDomain(domainId, domainName) {
        if (!confirm(`Are you sure you want to remove ${domainName}?`)) {
            return;
        }

        try {
            const { error } = await supabaseClient.client
                .from('custom_domains')
                .update({ status: 'deleted' })
                .eq('id', domainId);

            if (error) throw error;

            this.showSuccess('Domain removed successfully');
            this.loadDomains();

        } catch (error) {
            console.error('Error deleting domain:', error);
            alert('Error: ' + error.message);
        }
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 5000);
    }
}

// Initialize when dashboard loads
let customDomainsManager;
document.addEventListener('DOMContentLoaded', () => {
    if (window.dashboardApp) {
        customDomainsManager = new CustomDomainsManager(window.dashboardApp);
    }
});
