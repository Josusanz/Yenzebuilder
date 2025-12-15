/**
 * YENZE Builder 2.0 - Main Entry Point
 * Orchestrates all modules and initializes the application
 */

// Import core modules
import { htmlSanitizer } from '../html-sanitizer.js';
import { historyManager } from './editor/history-manager.js';
import { initAutosave } from './editor/autosave-manager.js';
import { initResponsivePreview } from './editor/responsive-preview.js';
import { i18n } from './utils/i18n.js';
import { componentLibrary } from './components/component-library.js';
import { onboarding } from './components/onboarding.js';
import { initSentry } from './utils/sentry-init.js';

/**
 * Main Application Class
 */
class YenzeApp {
    constructor() {
        this.initialized = false;
        this.modules = {};
    }

    /**
     * Initialize all modules
     */
    async init() {
        if (this.initialized) return;

        console.log('🚀 Initializing YENZE 2.0...');

        try {
            // Initialize error monitoring first
            if (typeof Sentry !== 'undefined') {
                initSentry();
                console.log('✅ Sentry initialized');
            }

            // Initialize HTML sanitizer
            await htmlSanitizer.init();
            this.modules.sanitizer = htmlSanitizer;
            console.log('✅ HTML Sanitizer initialized');

            // Initialize internationalization
            i18n.init();
            this.modules.i18n = i18n;
            console.log('✅ i18n initialized');

            // Initialize history manager (already initialized globally)
            this.modules.history = historyManager;
            console.log('✅ History Manager initialized');

            // Wait for builder to be ready
            await this._waitForBuilder();

            // Initialize responsive preview
            const canvas = document.getElementById('canvas');
            if (canvas) {
                this.modules.preview = initResponsivePreview(canvas);
                console.log('✅ Responsive Preview initialized');
            }

            // Initialize autosave if user is logged in
            if (window.supabaseClient?.getUser()) {
                this.modules.autosave = initAutosave(window.builder);
                console.log('✅ Autosave initialized');
            }

            // Initialize component library
            await componentLibrary.init();
            this.modules.componentLibrary = componentLibrary;
            console.log('✅ Component Library initialized');

            // Start onboarding for new users
            if (!localStorage.getItem('yenze_onboarding_completed')) {
                setTimeout(() => {
                    onboarding.start();
                }, 1000);
            }
            this.modules.onboarding = onboarding;
            console.log('✅ Onboarding initialized');

            // Setup global event listeners
            this._setupGlobalListeners();

            // Setup keyboard shortcuts
            this._setupKeyboardShortcuts();

            // Update UI
            this._updateUI();

            this.initialized = true;
            console.log('🎉 YENZE 2.0 initialized successfully!');

            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('yenze-ready', {
                detail: { modules: this.modules }
            }));

        } catch (error) {
            console.error('❌ Failed to initialize YENZE:', error);
            if (window.Sentry) {
                Sentry.captureException(error);
            }
        }
    }

    /**
     * Wait for builder to be ready
     */
    async _waitForBuilder() {
        return new Promise((resolve) => {
            const checkBuilder = () => {
                if (window.builder) {
                    resolve();
                } else {
                    setTimeout(checkBuilder, 100);
                }
            };
            checkBuilder();
        });
    }

    /**
     * Setup global event listeners
     */
    _setupGlobalListeners() {
        // Listen for auth changes
        window.addEventListener('auth-change', (e) => {
            const { event, user } = e.detail;

            if (event === 'SIGNED_IN' && user) {
                // Initialize autosave when user logs in
                if (!this.modules.autosave) {
                    this.modules.autosave = initAutosave(window.builder);
                }

                // Load user components
                componentLibrary.loadFromSupabase();

                // Update UI
                this._updateUI();
            } else if (event === 'SIGNED_OUT') {
                // Stop autosave
                if (this.modules.autosave) {
                    this.modules.autosave.destroy();
                    delete this.modules.autosave;
                }
            }
        });

        // Listen for history changes to update UI
        window.addEventListener('history-change', (e) => {
            this._updateHistoryButtons(e.detail);
        });

        // Listen for autosave status
        window.addEventListener('autosave-status', (e) => {
            this._updateAutosaveIndicator(e.detail);
        });

        // Listen for language changes
        window.addEventListener('language-changed', (e) => {
            console.log('Language changed to:', e.detail.language);
        });

        // Track content changes for autosave
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const observer = new MutationObserver(() => {
                window.dispatchEvent(new CustomEvent('content-changed'));
            });

            observer.observe(canvas, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this._handleSave();
            }

            // Cmd/Ctrl + K = Toggle component library
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                componentLibrary.toggle();
            }

            // Cmd/Ctrl + / = Toggle help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this._showHelp();
            }

            // Esc = Close modals
            if (e.key === 'Escape') {
                this._closeModals();
            }
        });
    }

    /**
     * Update UI elements
     */
    _updateUI() {
        // Update undo/redo buttons
        this._updateHistoryButtons({
            canUndo: historyManager.canUndo(),
            canRedo: historyManager.canRedo()
        });

        // Update autosave indicator
        if (this.modules.autosave) {
            this._updateAutosaveIndicator({
                status: 'idle',
                statusText: this.modules.autosave.getStatusText()
            });
        }

        // Update language selector
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            langSelector.value = i18n.getCurrentLanguage();
        }
    }

    /**
     * Update history buttons (undo/redo)
     */
    _updateHistoryButtons(detail) {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) {
            undoBtn.disabled = !detail.canUndo;
            undoBtn.classList.toggle('disabled', !detail.canUndo);
        }

        if (redoBtn) {
            redoBtn.disabled = !detail.canRedo;
            redoBtn.classList.toggle('disabled', !detail.canRedo);
        }
    }

    /**
     * Update autosave indicator
     */
    _updateAutosaveIndicator(detail) {
        const indicator = document.getElementById('autosave-status');
        if (!indicator) return;

        indicator.textContent = detail.statusText;
        indicator.className = `autosave-status ${detail.status}`;
    }

    /**
     * Handle save action
     */
    async _handleSave() {
        if (this.modules.autosave) {
            await this.modules.autosave.forceSave();
        } else {
            // Fallback to local storage
            if (window.builder) {
                const html = window.builder.getCanvasHTML();
                localStorage.setItem('yenze_project', html);
                this._showNotification('Saved to local storage', 'success');
            }
        }
    }

    /**
     * Show help modal
     */
    _showHelp() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.add('active');
        } else {
            this._showNotification('Help: Cmd+S to save, Cmd+Z to undo, Cmd+K for components', 'info');
        }
    }

    /**
     * Close all modals
     */
    _closeModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Show notification
     */
    _showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get all modules
     */
    getAllModules() {
        return this.modules;
    }
}

// Create and export app instance
export const yenzeApp = new YenzeApp();
window.yenzeApp = yenzeApp;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => yenzeApp.init());
} else {
    yenzeApp.init();
}

// Export for use in other modules
export default yenzeApp;
