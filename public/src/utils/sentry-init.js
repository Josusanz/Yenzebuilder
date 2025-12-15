/**
 * Sentry Error Monitoring Initialization
 */

import * as Sentry from "@sentry/browser";

export function initSentry() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN || "YOUR_SENTRY_DSN_HERE",
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],

        // Performance Monitoring
        tracesSampleRate: 0.1, // Capture 10% of transactions

        // Session Replay
        replaysSessionSampleRate: 0.1, // Sample 10% of sessions
        replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

        // Environment
        environment: process.env.NODE_ENV || 'production',

        // Release tracking
        release: "yenze@2.0.0",

        // Before sending
        beforeSend(event, hint) {
            // Filter out non-critical errors
            if (event.exception) {
                const error = hint.originalException;

                // Ignore network errors
                if (error && error.message && error.message.includes('fetch')) {
                    return null;
                }
            }

            return event;
        },

        // User context
        initialScope: {
            tags: {
                "app.version": "2.0.0",
                "app.component": "builder"
            }
        }
    });

    // Set user context when available
    window.addEventListener('auth-change', (e) => {
        const { user } = e.detail;
        if (user) {
            Sentry.setUser({
                id: user.id,
                email: user.email,
                username: user.email.split('@')[0]
            });
        } else {
            Sentry.setUser(null);
        }
    });

    console.log('Sentry initialized');
}

// Error boundary for React-like behavior
export function captureError(error, context = {}) {
    Sentry.captureException(error, {
        contexts: {
            custom: context
        }
    });
}

export function captureMessage(message, level = 'info') {
    Sentry.captureMessage(message, level);
}

// Performance monitoring helpers
export function startTransaction(name, op) {
    return Sentry.startTransaction({ name, op });
}

export { Sentry };
