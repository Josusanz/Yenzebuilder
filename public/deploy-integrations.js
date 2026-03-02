// Deploy Integrations - Cloudflare Pages & Vercel
class DeployIntegrations {
    constructor() {
        // Check for manual tokens (legacy)
        this.cloudflareToken = localStorage.getItem('cloudflare_token');
        this.vercelToken = localStorage.getItem('vercel_token');
        this.cloudflareAccountId = localStorage.getItem('cloudflare_account_id');

        // Check for OAuth tokens (new - works without login)
        const cloudflareOAuth = localStorage.getItem('cloudflare_oauth_token');
        if (cloudflareOAuth) {
            try {
                const tokenData = JSON.parse(cloudflareOAuth);
                this.cloudflareToken = tokenData.access_token;
                this.cloudflareAccountId = tokenData.account_id;
                console.log('[DeployIntegrations] Loaded Cloudflare OAuth token from localStorage');
            } catch (e) {
                console.error('Failed to parse Cloudflare OAuth token:', e);
            }
        }

        const vercelOAuth = localStorage.getItem('vercel_oauth_token');
        if (vercelOAuth) {
            try {
                const tokenData = JSON.parse(vercelOAuth);
                this.vercelToken = tokenData.access_token;
                console.log('[DeployIntegrations] Loaded Vercel OAuth token from localStorage');
            } catch (e) {
                console.error('Failed to parse Vercel OAuth token:', e);
            }
        }
    }

    // ==================== CLOUDFLARE PAGES ====================

    async connectCloudflare(apiToken, accountId) {
        try {
            // Validate token by making a test API call
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid Cloudflare credentials');
            }

            // Save credentials
            localStorage.setItem('cloudflare_token', apiToken);
            localStorage.setItem('cloudflare_account_id', accountId);
            this.cloudflareToken = apiToken;
            this.cloudflareAccountId = accountId;

            return { success: true };
        } catch (error) {
            console.error('Cloudflare connection error:', error);
            return { success: false, error: error.message };
        }
    }

    async deployToCloudflare(projectName, htmlContent) {
        if (!this.cloudflareToken || !this.cloudflareAccountId) {
            throw new Error('Cloudflare not connected. Please connect your account first.');
        }

        try {
            // Clean project name for Cloudflare (lowercase, alphanumeric, hyphens)
            const cleanProjectName = projectName.toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '');

            // Create FormData for file upload
            const formData = new FormData();

            // Create a zip-like structure with the HTML file
            const files = {
                'index.html': htmlContent
            };

            // Cloudflare Pages expects files in a specific format
            const blob = new Blob([htmlContent], { type: 'text/html' });
            formData.append('index.html', blob, 'index.html');

            // First, ensure project exists
            let projectExists = await this.checkCloudflareProject(cleanProjectName);

            if (!projectExists) {
                // Create project
                const createResponse = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/pages/projects`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.cloudflareToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: cleanProjectName,
                            production_branch: 'main'
                        })
                    }
                );

                if (!createResponse.ok) {
                    const error = await createResponse.json();
                    throw new Error(error.errors?.[0]?.message || 'Failed to create Cloudflare project');
                }
            }

            // Deploy using Direct Upload
            const uploadResponse = await this.cloudflareDirectUpload(cleanProjectName, htmlContent);

            if (uploadResponse.success) {
                const deploymentUrl = `https://${cleanProjectName}.pages.dev`;
                return {
                    success: true,
                    url: deploymentUrl,
                    projectName: cleanProjectName
                };
            } else {
                throw new Error(uploadResponse.error);
            }

        } catch (error) {
            console.error('Cloudflare deployment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cloudflareDirectUpload(projectName, htmlContent) {
        try {
            // Cloudflare Pages Direct Upload API
            // Step 1: Create hashes for the files
            const manifest = {
                'index.html': await this.sha256(htmlContent)
            };

            // Step 2: Initiate upload
            const uploadResponse = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/pages/projects/${projectName}/deployments`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        manifest: manifest
                    })
                }
            );

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.errors?.[0]?.message || 'Failed to create deployment');
            }

            const uploadData = await uploadResponse.json();
            const jwt = uploadData.result.jwt;

            // Step 3: Upload the actual file content
            const formData = new FormData();
            formData.append('index.html', new Blob([htmlContent], { type: 'text/html' }));

            const uploadFileResponse = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/pages/projects/${projectName}/deployments/${uploadData.result.id}/files`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareToken}`
                    },
                    body: formData
                }
            );

            if (!uploadFileResponse.ok) {
                const error = await uploadFileResponse.json();
                throw new Error(error.errors?.[0]?.message || 'Failed to upload files');
            }

            // Step 4: Finalize deployment
            const finalizeResponse = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/pages/projects/${projectName}/deployments/${uploadData.result.id}/finalize`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareToken}`
                    }
                }
            );

            if (!finalizeResponse.ok) {
                throw new Error('Failed to finalize deployment');
            }

            return { success: true, deploymentId: uploadData.result.id };

        } catch (error) {
            console.error('Direct upload error:', error);
            return { success: false, error: error.message };
        }
    }

    async sha256(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async checkCloudflareProject(projectName) {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/pages/projects/${projectName}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.ok;
        } catch (error) {
            return false;
        }
    }


    disconnectCloudflare() {
        localStorage.removeItem('cloudflare_token');
        localStorage.removeItem('cloudflare_account_id');
        localStorage.removeItem('cloudflare_oauth_token'); // Remove OAuth token too
        this.cloudflareToken = null;
        this.cloudflareAccountId = null;
    }

    isCloudflareConnected() {
        return !!(this.cloudflareToken && this.cloudflareAccountId);
    }

    // ==================== VERCEL ====================

    async connectVercel(apiToken) {
        try {
            // Validate token by making a test API call
            const response = await fetch('https://api.vercel.com/v2/user', {
                headers: {
                    'Authorization': `Bearer ${apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid Vercel token');
            }

            const userData = await response.json();

            // Save credentials
            localStorage.setItem('vercel_token', apiToken);
            localStorage.setItem('vercel_user', JSON.stringify(userData));
            this.vercelToken = apiToken;

            return { success: true, user: userData };
        } catch (error) {
            console.error('Vercel connection error:', error);
            return { success: false, error: error.message };
        }
    }

    async deployToVercel(projectName, htmlContent) {
        if (!this.vercelToken) {
            throw new Error('Vercel not connected. Please connect your account first.');
        }

        try {
            // Clean project name for Vercel
            const cleanProjectName = projectName.toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '');

            // Create deployment using Vercel's API
            const files = {
                'index.html': htmlContent
            };

            // Create deployment
            const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.vercelToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: cleanProjectName,
                    files: [
                        {
                            file: 'index.html',
                            data: btoa(unescape(encodeURIComponent(htmlContent))) // Base64 encode
                        }
                    ],
                    projectSettings: {
                        framework: null // Static HTML
                    }
                })
            });

            if (!deploymentResponse.ok) {
                const error = await deploymentResponse.json();
                throw new Error(error.error?.message || 'Failed to deploy to Vercel');
            }

            const deployment = await deploymentResponse.json();

            // Get the deployment URL
            const deploymentUrl = `https://${deployment.url}`;
            const productionUrl = deployment.alias?.[0] || deploymentUrl;

            return {
                success: true,
                url: productionUrl,
                deploymentUrl: deploymentUrl,
                projectName: cleanProjectName
            };

        } catch (error) {
            console.error('Vercel deployment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    disconnectVercel() {
        localStorage.removeItem('vercel_token');
        localStorage.removeItem('vercel_user');
        localStorage.removeItem('vercel_oauth_token'); // Remove OAuth token too
        this.vercelToken = null;
    }

    isVercelConnected() {
        return !!this.vercelToken;
    }

    // ==================== HELPER METHODS ====================

    getConnectionStatus() {
        return {
            cloudflare: this.isCloudflareConnected(),
            vercel: this.isVercelConnected()
        };
    }

    disconnectAll() {
        this.disconnectCloudflare();
        this.disconnectVercel();
    }
}

// Export as global
window.deployIntegrations = new DeployIntegrations();
