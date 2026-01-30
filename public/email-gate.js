// Email Gate - Simple email capture for publish/download actions
// No password, no complex auth - just email to unlock features

class EmailGate {
    constructor() {
        this.storageKey = 'yenze_user_email';
        this.pendingAction = null;
        this.pendingCallback = null;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    // Check if user has provided email
    hasEmail() {
        return !!localStorage.getItem(this.storageKey);
    }

    // Get stored email
    getEmail() {
        return localStorage.getItem(this.storageKey);
    }

    // Store email locally and in Supabase
    async saveEmail(email) {
        localStorage.setItem(this.storageKey, email);

        // Save to Supabase if available
        if (window.supabaseClient && window.supabaseClient.client) {
            try {
                await window.supabaseClient.client
                    .from('leads')
                    .upsert({
                        email: email,
                        source: 'yenze_builder',
                        created_at: new Date().toISOString()
                    }, {
                        onConflict: 'email'
                    });
                console.log('[EmailGate] Email saved to Supabase');
            } catch (error) {
                console.warn('[EmailGate] Could not save to Supabase:', error);
                // Still works locally even if Supabase fails
            }
        }
    }

    // Gate an action - if no email, show modal first
    async gate(action, callback) {
        if (this.hasEmail()) {
            // User already provided email, execute callback
            callback();
            return true;
        }

        // Store pending action and show modal
        this.pendingAction = action;
        this.pendingCallback = callback;
        this.showModal(action);
        return false;
    }

    createModal() {
        const modalHTML = `
            <div id="emailGateModal" class="email-gate-modal" style="display: none;">
                <div class="email-gate-content">
                    <button class="email-gate-close" onclick="emailGate.closeModal()">&times;</button>

                    <div class="email-gate-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>

                    <h2 id="emailGateTitle">Enter your email to continue</h2>
                    <p id="emailGateSubtitle">Get free access to publish and download your projects</p>

                    <form id="emailGateForm" onsubmit="emailGate.handleSubmit(event)">
                        <input
                            type="email"
                            id="emailGateInput"
                            placeholder="your@email.com"
                            required
                            autocomplete="email"
                        >
                        <button type="submit" id="emailGateSubmit">
                            <span class="btn-text">Continue</span>
                            <span class="btn-loading" style="display: none;">
                                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round">
                                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                            </span>
                        </button>
                    </form>

                    <p class="email-gate-privacy">
                        We respect your privacy. No spam, ever.
                        <br>
                        <a href="https://github.com/yourusername/yenze" target="_blank">View source on GitHub</a>
                    </p>
                </div>
            </div>

            <style>
                .email-gate-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .email-gate-content {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 420px;
                    width: 90%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .email-gate-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #9ca3af;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .email-gate-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .email-gate-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: white;
                }

                .email-gate-content h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 8px;
                }

                .email-gate-content p {
                    color: #6b7280;
                    margin: 0 0 24px;
                    font-size: 0.95rem;
                }

                #emailGateForm {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                #emailGateInput {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }

                #emailGateInput:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                #emailGateSubmit {
                    width: 100%;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 48px;
                }

                #emailGateSubmit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                #emailGateSubmit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .email-gate-privacy {
                    font-size: 0.8rem !important;
                    color: #9ca3af !important;
                    margin-top: 16px !important;
                    margin-bottom: 0 !important;
                }

                .email-gate-privacy a {
                    color: #667eea;
                    text-decoration: none;
                }

                .email-gate-privacy a:hover {
                    text-decoration: underline;
                }

                /* Dark mode support */
                .dark .email-gate-content {
                    background: #1f2937;
                }

                .dark .email-gate-content h2 {
                    color: #f9fafb;
                }

                .dark .email-gate-content p {
                    color: #9ca3af;
                }

                .dark #emailGateInput {
                    background: #374151;
                    border-color: #4b5563;
                    color: #f9fafb;
                }

                .dark .email-gate-close:hover {
                    background: #374151;
                    color: #f9fafb;
                }
            </style>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Close on background click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'emailGateModal') {
                this.closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showModal(action = 'continue') {
        const modal = document.getElementById('emailGateModal');
        const title = document.getElementById('emailGateTitle');
        const subtitle = document.getElementById('emailGateSubtitle');

        // Customize text based on action
        if (action === 'publish') {
            title.textContent = 'Enter your email to publish';
            subtitle.textContent = 'Get a free yenze.io subdomain for your website';
        } else if (action === 'download') {
            title.textContent = 'Enter your email to download';
            subtitle.textContent = 'Download your HTML and deploy it anywhere';
        } else {
            title.textContent = 'Enter your email to continue';
            subtitle.textContent = 'Get free access to all features';
        }

        modal.style.display = 'flex';
        document.getElementById('emailGateInput').focus();
    }

    closeModal() {
        const modal = document.getElementById('emailGateModal');
        modal.style.display = 'none';
        this.pendingAction = null;
        this.pendingCallback = null;
    }

    async handleSubmit(event) {
        event.preventDefault();

        const input = document.getElementById('emailGateInput');
        const submit = document.getElementById('emailGateSubmit');
        const btnText = submit.querySelector('.btn-text');
        const btnLoading = submit.querySelector('.btn-loading');

        const email = input.value.trim();

        if (!email || !this.isValidEmail(email)) {
            input.style.borderColor = '#ef4444';
            return;
        }

        // Show loading state
        submit.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';

        try {
            // Save email
            await this.saveEmail(email);

            // Close modal
            this.closeModal();

            // Execute pending callback
            if (this.pendingCallback) {
                this.pendingCallback();
            }

            // Show success toast if available
            if (window.editor && window.editor.showToast) {
                window.editor.showToast('Email saved! You now have full access.', 'success');
            }

        } catch (error) {
            console.error('[EmailGate] Error:', error);
            input.style.borderColor = '#ef4444';
        } finally {
            // Reset button state
            submit.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Initialize email gate
window.emailGate = new EmailGate();
