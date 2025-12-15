// Supabase Client
// This file initializes the Supabase client and provides authentication utilities

class SupabaseClient {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        // Return existing promise if initialization is in progress
        if (this.initPromise) {
            return this.initPromise;
        }

        // Return immediately if already initialized
        if (this.initialized) {
            return Promise.resolve();
        }

        // Create and store the initialization promise
        this.initPromise = (async () => {
            try {
                // Load secure configuration from API
                const config = await window.secureConfig.getSupabaseConfig();

                // Initialize Supabase client using CDN
                this.client = supabase.createClient(
                    config.url,
                    config.anonKey
                );

                // Check if we have OAuth hash in URL
                const hash = window.location.hash;
                const hasOAuthHash = hash && (hash.includes('access_token=') || hash.includes('refresh_token='));

                if (hasOAuthHash) {
                    console.log('[OAuth] Detected OAuth hash, waiting for Supabase to process...');
                    // Wait for Supabase to process the hash
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }

                // Check if user is already logged in
                const { data: { session } } = await this.client.auth.getSession();
                if (session) {
                    this.currentUser = session.user;
                    console.log('User session loaded:', session.user.email);

                    // If we just processed OAuth, clean the URL
                    if (hasOAuthHash) {
                        console.log('[OAuth] Session established, cleaning URL...');
                        // Use a short timeout to ensure this happens in the same user gesture context
                        setTimeout(() => {
                            const cleanUrl = window.location.origin + window.location.pathname;
                            window.history.replaceState({}, document.title, cleanUrl);
                            // Force a UI update by dispatching auth event
                            window.dispatchEvent(new CustomEvent('auth-change', {
                                detail: { event: 'SIGNED_IN', user: session.user }
                            }));
                        }, 100);
                    }
                }

                // Listen for auth changes
                this.client.auth.onAuthStateChange((event, session) => {
                    this.currentUser = session?.user || null;
                    this.handleAuthChange(event, session);
                });

                this.initialized = true;
            } catch (error) {
                console.error('Failed to initialize Supabase:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    handleAuthChange(event, session) {
        switch (event) {
            case 'INITIAL_SESSION':
                // Don't trigger events for initial session load
                console.log('Initial session loaded');
                break;
            case 'SIGNED_IN':
                console.log('User signed in:', session.user.email);
                // Trigger UI update if needed
                window.dispatchEvent(new CustomEvent('auth-change', {
                    detail: { event, user: session.user }
                }));
                break;
            case 'SIGNED_OUT':
                console.log('User signed out');
                window.dispatchEvent(new CustomEvent('auth-change', {
                    detail: { event, user: null }
                }));
                break;
            case 'TOKEN_REFRESHED':
                console.log('Token refreshed');
                break;
        }
    }

    // Auth methods
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: 'https://builder.yenze.io'
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }
    }

    async signIn(email, password) {
        try {
            // Ensure client is initialized
            if (!this.client) {
                await this.init();
            }

            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    }

    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        }
    }

    async signInWithGoogle() {
        try {
            // Ensure client is initialized
            if (!this.client) {
                await this.init();
            }

            // Detect Safari browser
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            console.log('[OAuth] Browser detected - Safari:', isSafari);
            console.log('[OAuth] User Agent:', navigator.userAgent);

            // For Safari, we need to handle OAuth differently due to third-party cookie restrictions
            // The solution is to store the intent before redirect and check on return
            if (isSafari) {
                // Store a flag that we're attempting OAuth
                sessionStorage.setItem('yenze_oauth_attempt', Date.now().toString());
                console.log('[OAuth] Safari detected - storing OAuth attempt flag');
            }

            // Use explicit redirect URL based on current domain
            // This ensures builder.yenze.io redirects back to builder.yenze.io
            let redirectUrl = window.location.origin;

            // Ensure we're using the full URL with protocol
            if (window.location.hostname === 'builder.yenze.io') {
                redirectUrl = 'https://builder.yenze.io';
            } else if (window.location.hostname === 'yenze.io' || window.location.hostname === 'www.yenze.io') {
                redirectUrl = 'https://yenze.io';
            }

            console.log('[OAuth] Current hostname:', window.location.hostname);
            console.log('[OAuth] Redirect URL configured:', redirectUrl);

            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false,
                    queryParams: {
                        access_type: 'offline',
                        // Use 'consent' for Safari to force proper session establishment
                        // Use 'select_account' for other browsers for better UX
                        prompt: isSafari ? 'consent' : 'select_account'
                    }
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { data: null, error };
        }
    }

    async signInWithGithub() {
        try {
            // Ensure client is initialized
            if (!this.client) {
                await this.init();
            }

            console.log('[OAuth] Redirect URL configured:', 'https://builder.yenze.io');
            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: 'https://builder.yenze.io'
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Github sign in error:', error);
            return { data: null, error };
        }
    }

    async resetPassword(email) {
        try {
            const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://yenze.io/reset-password'
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Password reset error:', error);
            return { data: null, error };
        }
    }

    async updatePassword(newPassword) {
        try {
            const { data, error } = await this.client.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Password update error:', error);
            return { data: null, error };
        }
    }

    // Database methods for projects
    async saveProject(projectData) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to save project');
        }

        try {
            const { data, error } = await this.client
                .from('projects')
                .upsert({
                    user_id: this.currentUser.id,
                    name: projectData.name || 'Untitled Project',
                    html: projectData.html,
                    plan: projectData.plan || 'free',
                    subdomain_slug: projectData.subdomain_slug || null,
                    public_slug: projectData.public_slug || null,
                    published: projectData.published || false,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Save project error:', error);
            return { data: null, error };
        }
    }

    async getProjects() {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to get projects');
        }

        try {
            const { data, error } = await this.client
                .from('projects')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Get projects error:', error);
            return { data: null, error };
        }
    }

    async getProject(projectId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to get project');
        }

        try {
            const { data, error } = await this.client
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Get project error:', error);
            return { data: null, error };
        }
    }

    async deleteProject(projectId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to delete project');
        }

        try {
            const { error } = await this.client
                .from('projects')
                .delete()
                .eq('id', projectId)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Delete project error:', error);
            return { error };
        }
    }

    async updateProjectUrl(projectId, publishedUrl) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to update project');
        }

        try {
            const { data, error } = await this.client
                .from('projects')
                .update({
                    published_url: publishedUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId)
                .eq('user_id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Update project URL error:', error);
            return { data: null, error };
        }
    }

    // Subscription methods
    async getUserSubscription() {
        if (!this.currentUser) {
            return { data: null, error: null }; // No subscription if not logged in
        }

        try {
            const { data: subscriptions, error } = await this.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active');

            if (error) {
                throw error;
            }

            // If no subscriptions found, return null
            if (!subscriptions || subscriptions.length === 0) {
                return { data: null, error: null };
            }

            // Get the highest tier plan
            const planPriority = { 'BUSINESS': 4, 'PRO': 3, 'STARTER': 2, 'ONE_TIME': 2, 'FREE': 1 };
            const highestPlan = subscriptions.reduce((highest, sub) => {
                const currentPriority = planPriority[sub.plan.toUpperCase()] || 0;
                const highestPriority = planPriority[highest.plan.toUpperCase()] || 0;
                return currentPriority > highestPriority ? sub : highest;
            }, subscriptions[0]);

            return { data: highestPlan, error: null };
        } catch (error) {
            console.error('Get subscription error:', error);
            return { data: null, error };
        }
    }

    async createSubscription(stripeData) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to create subscription');
        }

        try {
            const { data, error } = await this.client
                .from('subscriptions')
                .insert({
                    user_id: this.currentUser.id,
                    stripe_customer_id: stripeData.customerId,
                    stripe_subscription_id: stripeData.subscriptionId,
                    plan: stripeData.plan,
                    status: stripeData.status,
                    current_period_end: stripeData.currentPeriodEnd
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Create subscription error:', error);
            return { data: null, error };
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }

    async getUserPlan() {
        if (!this.currentUser) {
            return 'FREE';
        }

        const { data } = await this.getUserSubscription();
        return data?.plan?.toUpperCase() || 'FREE';
    }
}

// Create singleton instance
window.supabaseClient = new SupabaseClient();
