// Deploy Modal - Enhanced publish options with Cloudflare & Vercel
class DeployModal {
    constructor() {
        this.deployIntegrations = window.deployIntegrations;
    }

    async show() {
        const existingModal = document.getElementById('enhancedDeployModal');
        if (existingModal) existingModal.remove();

        // Ensure Supabase client is initialized before showing modal
        if (window.supabaseClient) {
            console.log('[DeployModal] Initializing supabaseClient...');
            await window.supabaseClient.init();
            console.log('[DeployModal] Auth state:', {
                isAuthenticated: window.supabaseClient.isAuthenticated(),
                hasUser: !!window.supabaseClient.currentUser,
                userEmail: window.supabaseClient.currentUser?.email
            });
        }

        const status = this.deployIntegrations.getConnectionStatus();

        const modalHTML = `
            <div id="enhancedDeployModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.2s;">
                <div style="background: white; border-radius: 16px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <div style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">Publish Your Website</h2>
                                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">Choose your deployment method</p>
                            </div>
                            <button onclick="window.deployModal.close()" style="width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; color: #6b7280; font-size: 20px; display: flex; align-items: center; justify-content: center;">×</button>
                        </div>
                    </div>

                    <!-- Options -->
                    <div style="padding: 24px 32px;">

                        <!-- Cloudflare Pages -->
                        <div class="deploy-option" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 24px; margin-bottom: 16px; color: white; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                            <div style="position: relative; z-index: 1;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                    <div>
                                        <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Cloudflare Pages</h3>
                                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Lightning-fast global CDN</p>
                                    </div>
                                </div>
                                ${status.cloudflare ? `
                                    <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                                            <span style="font-size: 13px; font-weight: 600;">Connected</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="window.deployModal.deployCloudflare()" style="flex: 1; padding: 12px; background: white; color: #f97316; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                            Deploy Now →
                                        </button>
                                        <button onclick="window.deployModal.disconnectCloudflare()" style="padding: 12px 16px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                            Disconnect
                                        </button>
                                    </div>
                                ` : `
                                    <p style="font-size: 13px; margin: 0 0 12px; opacity: 0.95;">Deploy directly to Cloudflare's global network</p>
                                    <button onclick="window.deployModal.showCloudflareSetup()" style="width: 100%; padding: 12px; background: white; color: #f97316; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                        Connect Cloudflare →
                                    </button>
                                `}
                            </div>
                        </div>

                        <!-- Vercel -->
                        <div class="deploy-option" style="background: #000; border-radius: 12px; padding: 24px; margin-bottom: 16px; color: white; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                            <div style="position: relative; z-index: 1;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 2L2 22h20L12 2z"/>
                                    </svg>
                                    <div>
                                        <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Vercel</h3>
                                        <p style="margin: 0; font-size: 12px; opacity: 0.7;">Deploy in seconds</p>
                                    </div>
                                </div>
                                ${status.vercel ? `
                                    <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                                            <span style="font-size: 13px; font-weight: 600;">Connected</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="window.deployModal.deployVercel()" style="flex: 1; padding: 12px; background: white; color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                            Deploy Now →
                                        </button>
                                        <button onclick="window.deployModal.disconnectVercel()" style="padding: 12px 16px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                            Disconnect
                                        </button>
                                    </div>
                                ` : `
                                    <p style="font-size: 13px; margin: 0 0 12px; opacity: 0.8;">Deploy with Vercel's edge network</p>
                                    <button onclick="window.deployModal.showVercelSetup()" style="width: 100%; padding: 12px; background: white; color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                        Connect Vercel →
                                    </button>
                                `}
                            </div>
                        </div>

                        <!-- YENZE Hosting -->
                        <div class="deploy-option" style="background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px; padding: 24px; margin-bottom: 16px; color: white;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2" stroke="white" stroke-width="2" fill="none"/>
                                </svg>
                                <div>
                                    <h3 style="margin: 0; font-size: 18px; font-weight: 700;">YENZE Hosting</h3>
                                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">Free hosting on yenze.io</p>
                                </div>
                            </div>
                            <p style="font-size: 13px; margin: 0 0 12px; opacity: 0.95;">Quick publish with free YENZE subdomain</p>
                            <button onclick="window.deployModal.publishYenze()" style="width: 100%; padding: 12px; background: white; color: #10B981; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                Publish Free →
                            </button>
                        </div>

                        <!-- Download Option -->
                        <div class="deploy-option" style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                <div>
                                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Download HTML</h3>
                                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Deploy anywhere you want</p>
                                </div>
                            </div>
                            <p style="font-size: 13px; margin: 0 0 12px; color: #6b7280;">Get the HTML file and host it yourself</p>
                            <button onclick="window.deployModal.download()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                Download HTML
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    close() {
        const modal = document.getElementById('enhancedDeployModal');
        if (modal) modal.remove();
    }

    showCloudflareSetup() {
        const setupHTML = `
            <div id="cloudflareSetupModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10001;">
                <div style="background: white; border-radius: 16px; max-width: 550px; width: 90%; padding: 32px; max-height: 90vh; overflow-y: auto;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">Connect Cloudflare Pages</h2>
                    <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">Deploy your site to Cloudflare's global network</p>

                    <!-- OAuth Method (Recommended) -->
                    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0c4a6e;">Secure OAuth Connection (Recommended)</h3>
                        </div>
                        <p style="margin: 0 0 16px; font-size: 13px; color: #0c4a6e;">Connect with one click - no API tokens needed!</p>
                        <button onclick="window.deployModal.connectCloudflareOAuth()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            Connect with Cloudflare
                        </button>
                    </div>

                    <div style="text-align: center; margin: 20px 0; color: #9ca3af; font-size: 13px;">or use manual setup</div>

                    <!-- Manual Method (Advanced) -->
                    <details style="cursor: pointer;">
                        <summary style="padding: 12px; background: #f9fafb; border-radius: 8px; font-weight: 600; color: #6b7280; font-size: 14px;">Advanced: Manual API Token Setup</summary>
                        <div style="margin-top: 16px;">
                            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">Manual Setup:</h3>
                                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #92400e; line-height: 1.6;">
                                    <li>Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" style="color: #f97316; text-decoration: underline;">Cloudflare API Tokens</a></li>
                                    <li>Click "Create Token" → "Edit Cloudflare Workers" template</li>
                                    <li>Add permission: <strong>Cloudflare Pages - Edit</strong></li>
                                    <li>Copy your <strong>Account ID</strong> from the dashboard</li>
                                </ol>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151;">API Token</label>
                                <input id="cloudflareToken" type="password" placeholder="Enter your Cloudflare API Token" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: monospace;">
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151;">Account ID</label>
                                <input id="cloudflareAccountId" type="text" placeholder="32-character Account ID" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: monospace;">
                            </div>

                            <button onclick="window.deployModal.connectCloudflareManual()" style="width: 100%; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Connect Manually
                            </button>
                        </div>
                    </details>

                    <div style="margin-top: 20px;">
                        <button onclick="document.getElementById('cloudflareSetupModal').remove()" style="width: 100%; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', setupHTML);
    }

    showVercelSetup() {
        const setupHTML = `
            <div id="vercelSetupModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10001;">
                <div style="background: white; border-radius: 16px; max-width: 550px; width: 90%; padding: 32px; max-height: 90vh; overflow-y: auto;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">Connect Vercel</h2>
                    <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">Deploy your site to Vercel's edge network</p>

                    <!-- OAuth Method (Recommended) -->
                    <div style="background: linear-gradient(135deg, #fafafa, #f4f4f5); border: 2px solid #18181b; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #18181b;">Secure OAuth Connection (Recommended)</h3>
                        </div>
                        <p style="margin: 0 0 16px; font-size: 13px; color: #3f3f46;">Connect with one click - no API tokens needed!</p>
                        <button onclick="window.deployModal.connectVercelOAuth()" style="width: 100%; padding: 14px; background: #000; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2L2 22h20L12 2z"/>
                            </svg>
                            Connect with Vercel
                        </button>
                    </div>

                    <div style="text-align: center; margin: 20px 0; color: #9ca3af; font-size: 13px;">or use manual setup</div>

                    <!-- Manual Method (Advanced) -->
                    <details style="cursor: pointer;">
                        <summary style="padding: 12px; background: #f9fafb; border-radius: 8px; font-weight: 600; color: #6b7280; font-size: 14px;">Advanced: Manual API Token Setup</summary>
                        <div style="margin-top: 16px;">
                            <div style="background: #f0f0f0; border: 1px solid #d4d4d4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #171717;">Manual Setup:</h3>
                                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #404040; line-height: 1.6;">
                                    <li>Go to <a href="https://vercel.com/account/tokens" target="_blank" style="color: #000; text-decoration: underline;">Vercel Account Tokens</a></li>
                                    <li>Click "Create" to generate a new token</li>
                                    <li>Give it a name (e.g., "YENZE Builder")</li>
                                    <li>Select scope: <strong>Full Account</strong></li>
                                    <li>Copy the token and paste it below</li>
                                </ol>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151;">API Token</label>
                                <input id="vercelToken" type="password" placeholder="Enter your Vercel API Token" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: monospace;">
                            </div>

                            <button onclick="window.deployModal.connectVercelManual()" style="width: 100%; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Connect Manually
                            </button>
                        </div>
                    </details>

                    <div style="margin-top: 20px;">
                        <button onclick="document.getElementById('vercelSetupModal').remove()" style="width: 100%; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', setupHTML);
    }

    // OAuth connection (new, recommended)
    async connectCloudflareOAuth() {
        try {
            console.log('[OAuth] Cloudflare - Starting connection');
            console.log('[OAuth] supabaseClient exists:', !!window.supabaseClient);

            // Ensure Supabase client is initialized
            if (window.supabaseClient) {
                console.log('[OAuth] Initializing supabaseClient...');
                await window.supabaseClient.init();
                console.log('[OAuth] After init - currentUser:', window.supabaseClient.currentUser);
                console.log('[OAuth] After init - isAuthenticated:', window.supabaseClient.isAuthenticated());
            }

            if (!window.supabaseClient || !window.supabaseClient.currentUser) {
                console.error('[OAuth] Auth check failed:', {
                    hasClient: !!window.supabaseClient,
                    hasCurrentUser: !!window.supabaseClient?.currentUser,
                    isAuthenticated: window.supabaseClient?.isAuthenticated()
                });
                alert('Please log in first');
                return;
            }

            const userId = window.supabaseClient.currentUser.id;
            console.log('[OAuth] Redirecting with userId:', userId);

            // Redirect to OAuth endpoint
            window.location.href = `/api/oauth-cloudflare?userId=${userId}`;
        } catch (error) {
            console.error('OAuth initiation failed:', error);
            alert('Failed to start OAuth flow: ' + error.message);
        }
    }

    // Manual connection (legacy, for advanced users)
    async connectCloudflareManual() {
        const token = document.getElementById('cloudflareToken').value.trim();
        const accountId = document.getElementById('cloudflareAccountId').value.trim();

        if (!token || !accountId) {
            alert('Please fill in all fields');
            return;
        }

        const result = await this.deployIntegrations.connectCloudflare(token, accountId);

        if (result.success) {
            document.getElementById('cloudflareSetupModal').remove();
            this.close();
            this.show(); // Refresh modal to show connected state
            if (window.app) window.app.showToast('Cloudflare connected successfully!', 'success');
        } else {
            alert('Failed to connect: ' + result.error);
        }
    }

    // OAuth connection (new, recommended)
    async connectVercelOAuth() {
        try {
            console.log('[OAuth] Vercel - Starting connection');
            console.log('[OAuth] supabaseClient exists:', !!window.supabaseClient);

            // Ensure Supabase client is initialized
            if (window.supabaseClient) {
                console.log('[OAuth] Initializing supabaseClient...');
                await window.supabaseClient.init();
                console.log('[OAuth] After init - currentUser:', window.supabaseClient.currentUser);
                console.log('[OAuth] After init - isAuthenticated:', window.supabaseClient.isAuthenticated());
            }

            if (!window.supabaseClient || !window.supabaseClient.currentUser) {
                console.error('[OAuth] Auth check failed:', {
                    hasClient: !!window.supabaseClient,
                    hasCurrentUser: !!window.supabaseClient?.currentUser,
                    isAuthenticated: window.supabaseClient?.isAuthenticated()
                });
                alert('Please log in first');
                return;
            }

            const userId = window.supabaseClient.currentUser.id;
            console.log('[OAuth] Redirecting with userId:', userId);

            // Redirect to OAuth endpoint
            window.location.href = `/api/oauth-vercel?userId=${userId}`;
        } catch (error) {
            console.error('OAuth initiation failed:', error);
            alert('Failed to start OAuth flow: ' + error.message);
        }
    }

    // Manual connection (legacy, for advanced users)
    async connectVercelManual() {
        const token = document.getElementById('vercelToken').value.trim();

        if (!token) {
            alert('Please enter your Vercel API token');
            return;
        }

        const result = await this.deployIntegrations.connectVercel(token);

        if (result.success) {
            document.getElementById('vercelSetupModal').remove();
            this.close();
            this.show(); // Refresh modal to show connected state
            if (window.app) window.app.showToast('Vercel connected successfully!', 'success');
        } else {
            alert('Failed to connect: ' + result.error);
        }
    }

    async deployCloudflare() {
        const projectName = window.app?.projectData?.name || 'my-site';
        const htmlContent = window.app?.getCleanHTML?.() || window.app?.currentHTML;

        if (!htmlContent) {
            alert('No content to deploy');
            return;
        }

        this.close();
        if (window.app) window.app.showToast('Deploying to Cloudflare Pages...', 'info');

        const result = await this.deployIntegrations.deployToCloudflare(projectName, htmlContent);

        if (result.success) {
            this.showSuccessModal('Cloudflare Pages', result.url);
            if (window.app) window.app.showToast('Deployed successfully!', 'success');
        } else {
            alert('Deployment failed: ' + result.error);
            if (window.app) window.app.showToast('Deployment failed', 'error');
        }
    }

    async deployVercel() {
        const projectName = window.app?.projectData?.name || 'my-site';
        const htmlContent = window.app?.getCleanHTML?.() || window.app?.currentHTML;

        if (!htmlContent) {
            alert('No content to deploy');
            return;
        }

        this.close();
        if (window.app) window.app.showToast('Deploying to Vercel...', 'info');

        const result = await this.deployIntegrations.deployToVercel(projectName, htmlContent);

        if (result.success) {
            this.showSuccessModal('Vercel', result.url);
            if (window.app) window.app.showToast('Deployed successfully!', 'success');
        } else {
            alert('Deployment failed: ' + result.error);
            if (window.app) window.app.showToast('Deployment failed', 'error');
        }
    }

    disconnectCloudflare() {
        if (confirm('Are you sure you want to disconnect Cloudflare?')) {
            this.deployIntegrations.disconnectCloudflare();
            this.close();
            this.show(); // Refresh modal
            if (window.app) window.app.showToast('Cloudflare disconnected', 'info');
        }
    }

    disconnectVercel() {
        if (confirm('Are you sure you want to disconnect Vercel?')) {
            this.deployIntegrations.disconnectVercel();
            this.close();
            this.show(); // Refresh modal
            if (window.app) window.app.showToast('Vercel disconnected', 'info');
        }
    }

    publishYenze() {
        this.close();
        if (window.app && window.app.showPublishModal) {
            window.app.showPublishModal();
        }
    }

    download() {
        this.close();
        if (window.app && window.app.doDownloadHTML) {
            window.app.doDownloadHTML();
        }
    }

    showSuccessModal(platform, url) {
        const modalHTML = `
            <div id="deploySuccessModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10001;">
                <div style="background: white; border-radius: 16px; max-width: 500px; width: 90%; padding: 32px; text-align: center;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">Deployed Successfully!</h2>
                    <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">Your site is now live on ${platform}</p>

                    <div style="background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <a href="${url}" target="_blank" style="color: #3B82F6; text-decoration: none; word-break: break-all; font-size: 14px; font-weight: 600;">${url}</a>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button onclick="navigator.clipboard.writeText('${url}'); this.textContent='Copied!'" style="flex: 1; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Copy URL
                        </button>
                        <button onclick="window.open('${url}', '_blank')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Visit Site
                        </button>
                    </div>

                    <button onclick="document.getElementById('deploySuccessModal').remove()" style="margin-top: 12px; width: 100%; padding: 12px; background: transparent; color: #6b7280; border: none; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Initialize global instance
window.deployModal = new DeployModal();
