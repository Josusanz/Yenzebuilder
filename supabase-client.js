// Supabase Client
// This file initializes the Supabase client and provides authentication utilities

class SupabaseClient {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Initialize Supabase client using CDN
            this.client = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );

            // Check if user is already logged in
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
            }

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.handleAuthChange(event, session);
            });

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
        }
    }

    handleAuthChange(event, session) {
        switch (event) {
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
                    data: metadata
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
            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
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
            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin
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
                redirectTo: `${window.location.origin}/reset-password`
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
            const { data, error } = await this.client
                .from('subscriptions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            return { data: data || null, error: null };
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
const supabaseClient = new SupabaseClient();
