// Authentication UI Components
// Handles login, signup, and authentication modals

class AuthUI {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        this.createAuthModal();
        this.createPlanModal();
        this.setupEventListeners();
    }

    createAuthModal() {
        const modalHTML = `
            <div id="authModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 450px;">
                    <span class="close" onclick="authUI.closeAuthModal()">&times;</span>

                    <div id="authModalContent">
                        <!-- Login/Signup tabs -->
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">Log In</button>
                            <button class="auth-tab" data-tab="signup">Sign Up</button>
                        </div>

                        <!-- Login Form -->
                        <div id="loginForm" class="auth-form active">
                            <h2 style="margin-top: 20px; margin-bottom: 20px;">Welcome back!</h2>

                            <div class="social-auth-buttons">
                                <button class="social-btn google-btn" onclick="authUI.signInWithGoogle()">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"></path>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"></path>
                                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"></path>
                                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"></path>
                                    </svg>
                                    Continue with Google
                                </button>
                                <button class="social-btn github-btn" onclick="authUI.signInWithGithub()">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    Continue with GitHub
                                </button>
                            </div>

                            <div class="divider"><span>or</span></div>

                            <form onsubmit="authUI.handleLogin(event)">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="loginEmail" placeholder="your@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label>Password</label>
                                    <input type="password" id="loginPassword" placeholder="••••••••" required>
                                </div>
                                <div class="form-group" style="text-align: right;">
                                    <a href="#" onclick="authUI.showForgotPassword(); return false;" style="font-size: 14px;">Forgot password?</a>
                                </div>
                                <button type="submit" class="primary-btn" style="width: 100%;">Log In</button>
                            </form>
                        </div>

                        <!-- Signup Form -->
                        <div id="signupForm" class="auth-form">
                            <h2 style="margin-top: 20px; margin-bottom: 20px;">Create your account</h2>

                            <div class="social-auth-buttons">
                                <button class="social-btn google-btn" onclick="authUI.signInWithGoogle()">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"></path>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"></path>
                                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"></path>
                                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"></path>
                                    </svg>
                                    Continue with Google
                                </button>
                                <button class="social-btn github-btn" onclick="authUI.signInWithGithub()">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    Continue with GitHub
                                </button>
                            </div>

                            <div class="divider"><span>or</span></div>

                            <form onsubmit="authUI.handleSignup(event)">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="signupEmail" placeholder="your@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label>Password</label>
                                    <input type="password" id="signupPassword" placeholder="••••••••" minlength="6" required>
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" id="signupPasswordConfirm" placeholder="••••••••" minlength="6" required>
                                </div>
                                <button type="submit" class="primary-btn" style="width: 100%;">Create Account</button>
                            </form>

                            <p style="font-size: 12px; color: #666; margin-top: 15px; text-align: center;">
                                By signing up, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>

                        <!-- Forgot Password Form -->
                        <div id="forgotPasswordForm" class="auth-form">
                            <h2 style="margin-top: 20px; margin-bottom: 10px;">Reset Password</h2>
                            <p style="color: #666; margin-bottom: 20px;">Enter your email and we'll send you a reset link.</p>

                            <form onsubmit="authUI.handleForgotPassword(event)">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="forgotPasswordEmail" placeholder="your@email.com" required>
                                </div>
                                <button type="submit" class="primary-btn" style="width: 100%;">Send Reset Link</button>
                                <button type="button" onclick="authUI.showLogin()" style="width: 100%; margin-top: 10px; background: transparent; color: #667eea; border: 1px solid #667eea;">
                                    Back to Login
                                </button>
                            </form>
                        </div>

                        <div id="authMessage" class="auth-message"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modals.auth = document.getElementById('authModal');
    }

    createPlanModal() {
        const modalHTML = `
            <div id="planModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 900px;">
                    <span class="close" onclick="authUI.closePlanModal()">&times;</span>

                    <h2 style="text-align: center; margin-bottom: 10px;">Choose Your Plan</h2>
                    <p style="text-align: center; color: #666; margin-bottom: 40px;">
                        Publish your website to the world
                    </p>

                    <div class="plans-grid">
                        <!-- FREE Plan -->
                        <div class="plan-card">
                            <div class="plan-header">
                                <h3>Free</h3>
                                <div class="plan-price">
                                    <span class="price">$0</span>
                                    <span class="period">/forever</span>
                                </div>
                            </div>
                            <ul class="plan-features">
                                <li>✓ Unlimited editing</li>
                                <li>✓ Unlimited publishes</li>
                                <li>✓ Deploy to yenze.app subdomain</li>
                                <li>✓ Basic analytics (views, visits)</li>
                                <li>⚠️ Includes "Made with YENZE" badge</li>
                                <li>✗ Custom domain</li>
                            </ul>
                            <button class="plan-btn secondary" onclick="authUI.selectPlan('free')">
                                Publish for Free
                            </button>
                        </div>

                        <!-- STARTER Plan -->
                        <div class="plan-card">
                            <div class="plan-header">
                                <h3>Starter</h3>
                                <div class="plan-price">
                                    <span class="price">$12</span>
                                    <span class="period">/year</span>
                                </div>
                            </div>
                            <ul class="plan-features">
                                <li>✓ Everything in Free</li>
                                <li>✓ 1 custom domain (midominio.com)</li>
                                <li>✓ Remove YENZE badge</li>
                                <li>✓ Automatic DNS configuration</li>
                                <li>✓ Basic analytics dashboard</li>
                                <li>✓ SSL certificate included</li>
                                <li>✓ Email support</li>
                            </ul>
                            <button class="plan-btn secondary" onclick="authUI.selectPlan('starter')">
                                Get Starter
                            </button>
                        </div>

                        <!-- PRO Plan -->
                        <div class="plan-card featured">
                            <div class="plan-badge">BEST VALUE</div>
                            <div class="plan-header">
                                <h3>Pro</h3>
                                <div class="plan-price">
                                    <span class="price">$49</span>
                                    <span class="period">/year</span>
                                </div>
                            </div>
                            <ul class="plan-features">
                                <li>✓ Everything in Starter</li>
                                <li>✓ Up to 10 custom domains (midominio.com)</li>
                                <li>✓ Automatic DNS configuration</li>
                                <li>✓ Unlimited projects</li>
                                <li>✓ Advanced analytics dashboard</li>
                                <li>✓ Custom domain management</li>
                                <li>✓ Priority support</li>
                                <li>✓ White-label (no YENZE branding)</li>
                            </ul>
                            <button class="plan-btn primary" onclick="authUI.selectPlan('pro')">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modals.plan = document.getElementById('planModal');
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Listen for auth changes
        window.addEventListener('auth-change', (e) => {
            const { event, user } = e.detail;
            if (event === 'SIGNED_IN') {
                this.closeAuthModal();
                this.onAuthSuccess(user);
            }
        });
    }

    // Modal management
    showAuthModal(initialTab = 'login') {
        this.switchTab(initialTab);
        this.modals.auth.style.display = 'flex';
    }

    closeAuthModal() {
        this.modals.auth.style.display = 'none';
        this.clearAuthMessage();
    }

    showPlanModal() {
        this.modals.plan.style.display = 'flex';
    }

    closePlanModal() {
        this.modals.plan.style.display = 'none';
    }

    // Tab switching
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        if (tabName === 'login') {
            document.getElementById('loginForm').classList.add('active');
        } else if (tabName === 'signup') {
            document.getElementById('signupForm').classList.add('active');
        }

        this.clearAuthMessage();
    }

    showLogin() {
        this.switchTab('login');
    }

    showForgotPassword() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('forgotPasswordForm').classList.add('active');
        this.clearAuthMessage();
    }

    // Auth handlers
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.showAuthMessage('Logging in...', 'info');

        const { data, error } = await supabaseClient.signIn(email, password);

        if (error) {
            this.showAuthMessage(error.message, 'error');
        } else {
            this.showAuthMessage('Success! Logging you in...', 'success');
            // Modal will close automatically via auth-change event
        }
    }

    async handleSignup(event) {
        event.preventDefault();

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupPasswordConfirm').value;

        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }

        this.showAuthMessage('Creating your account...', 'info');

        const { data, error } = await supabaseClient.signUp(email, password);

        if (error) {
            this.showAuthMessage(error.message, 'error');
        } else {
            this.showAuthMessage('Success! Please check your email to confirm your account.', 'success');
            setTimeout(() => {
                this.switchTab('login');
            }, 3000);
        }
    }

    async handleForgotPassword(event) {
        event.preventDefault();

        const email = document.getElementById('forgotPasswordEmail').value;

        this.showAuthMessage('Sending reset link...', 'info');

        const { data, error } = await supabaseClient.resetPassword(email);

        if (error) {
            this.showAuthMessage(error.message, 'error');
        } else {
            this.showAuthMessage('Reset link sent! Check your email.', 'success');
        }
    }

    async signInWithGoogle() {
        this.showAuthMessage('Redirecting to Google...', 'info');
        const { error } = await supabaseClient.signInWithGoogle();

        if (error) {
            this.showAuthMessage(error.message, 'error');
        }
    }

    async signInWithGithub() {
        this.showAuthMessage('Redirecting to GitHub...', 'info');
        const { error } = await supabaseClient.signInWithGithub();

        if (error) {
            this.showAuthMessage(error.message, 'error');
        }
    }

    // Plan selection
    async selectPlan(plan) {
        if (!supabaseClient.isAuthenticated()) {
            this.closePlanModal();
            this.showAuthModal('login');
            this.showAuthMessage('Please log in first to continue', 'info');
            return;
        }

        if (plan === 'free') {
            this.closePlanModal();
            // Trigger free deployment
            if (window.app && window.app.publishWithPlan) {
                window.app.publishWithPlan('free');
            }
        } else {
            // Redirect to Stripe checkout
            this.redirectToCheckout(plan);
        }
    }

    async redirectToCheckout(plan) {
        try {
            this.showAuthMessage('Redirecting to checkout...', 'info');

            // Initialize Stripe if not already
            if (!stripeIntegration.initialized) {
                await stripeIntegration.init();
            }

            // Create checkout session and redirect
            await stripeIntegration.createCheckoutSession(plan);

        } catch (error) {
            console.error('Checkout error:', error);
            this.showAuthMessage('Failed to start checkout: ' + error.message, 'error');
        }
    }

    // Message management
    showAuthMessage(message, type = 'info') {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
    }

    clearAuthMessage() {
        const messageEl = document.getElementById('authMessage');
        messageEl.style.display = 'none';
        messageEl.textContent = '';
    }

    // Callback for successful authentication
    onAuthSuccess(user) {
        console.log('User authenticated:', user.email);
        // Show plan modal after successful login
        this.showPlanModal();
    }
}

// Create singleton instance
const authUI = new AuthUI();
