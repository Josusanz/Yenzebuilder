// YENZE Analytics - Simple, privacy-focused analytics
class YenzeAnalytics {
    constructor() {
        this.endpoint = '/api/analytics';
        this.sessionId = this.getOrCreateSessionId();
        this.isEnabled = true;
    }

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('yenze_session_id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('yenze_session_id', sessionId);
        }
        return sessionId;
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    async track(event, data = {}) {
        if (!this.isEnabled) return;

        try {
            const payload = {
                event,
                data,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language
            };

            // Send to backend
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Common events
    trackPageView() {
        this.track('pageview', {
            title: document.title,
            url: window.location.href
        });
    }

    trackClick(elementName, data = {}) {
        this.track('click', {
            element: elementName,
            ...data
        });
    }

    trackFormSubmit(formName, data = {}) {
        this.track('form_submit', {
            form: formName,
            ...data
        });
    }

    trackDownload(fileName) {
        this.track('download', {
            fileName
        });
    }

    trackPublish(platform, url) {
        this.track('publish', {
            platform,
            url
        });
    }

    trackError(error, context = {}) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            ...context
        });
    }

    // Initialize automatic tracking
    init() {
        // Track initial page view
        this.trackPageView();

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_hidden');
            } else {
                this.track('page_visible');
            }
        });

        // Track time spent on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            this.track('page_exit', { duration });
        });

        // Track errors
        window.addEventListener('error', (event) => {
            this.trackError(event.error);
        });
    }

    disable() {
        this.isEnabled = false;
    }

    enable() {
        this.isEnabled = true;
    }
}

// Analytics Dashboard Component
class AnalyticsDashboard {
    constructor() {
        this.supabaseClient = window.supabaseClient;
    }

    async getStats(projectId, days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await this.supabaseClient.client
                .from('analytics_events')
                .select('*')
                .eq('project_id', projectId)
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            return this.processStats(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            return null;
        }
    }

    processStats(events) {
        const stats = {
            totalViews: 0,
            uniqueVisitors: new Set(),
            topPages: {},
            topReferrers: {},
            devices: {
                mobile: 0,
                desktop: 0,
                tablet: 0
            },
            browsers: {},
            countries: {},
            dailyViews: {}
        };

        events.forEach(event => {
            if (event.event === 'pageview') {
                stats.totalViews++;
                stats.uniqueVisitors.add(event.session_id);

                // Count page views
                const page = event.data.url || event.page;
                stats.topPages[page] = (stats.topPages[page] || 0) + 1;

                // Count referrers
                if (event.referrer) {
                    stats.topReferrers[event.referrer] = (stats.topReferrers[event.referrer] || 0) + 1;
                }

                // Device detection (simple)
                const ua = event.user_agent?.toLowerCase() || '';
                if (ua.includes('mobile')) {
                    stats.devices.mobile++;
                } else if (ua.includes('tablet')) {
                    stats.devices.tablet++;
                } else {
                    stats.devices.desktop++;
                }

                // Daily views
                const date = event.created_at.split('T')[0];
                stats.dailyViews[date] = (stats.dailyViews[date] || 0) + 1;
            }
        });

        stats.uniqueVisitors = stats.uniqueVisitors.size;

        return stats;
    }

    showDashboard(projectId) {
        const modalHTML = `
            <div id="analyticsDashboard" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow-y: auto; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; padding: 32px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">Analytics Dashboard</h2>
                        <button onclick="document.getElementById('analyticsDashboard').remove()" style="width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; color: #6b7280; font-size: 20px;">×</button>
                    </div>

                    <div id="analyticsContent" style="text-align: center; padding: 48px;">
                        <div style="display: inline-block; width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #3B82F6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin: 16px 0 0; color: #6b7280;">Loading analytics...</p>
                    </div>
                </div>
            </div>

            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Load and display stats
        this.loadAndDisplayStats(projectId);
    }

    async loadAndDisplayStats(projectId) {
        const stats = await this.getStats(projectId);

        if (!stats) {
            document.getElementById('analyticsContent').innerHTML = `
                <p style="color: #6b7280;">Failed to load analytics data</p>
            `;
            return;
        }

        const topPages = Object.entries(stats.topPages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const dailyViews = Object.entries(stats.dailyViews)
            .sort((a, b) => a[0].localeCompare(b[0]));

        document.getElementById('analyticsContent').innerHTML = `
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 24px; border-radius: 12px;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total Views</div>
                    <div style="font-size: 36px; font-weight: 700;">${stats.totalViews}</div>
                </div>
                <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 24px; border-radius: 12px;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Unique Visitors</div>
                    <div style="font-size: 36px; font-weight: 700;">${stats.uniqueVisitors}</div>
                </div>
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 24px; border-radius: 12px;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Avg. Views/Visitor</div>
                    <div style="font-size: 36px; font-weight: 700;">${stats.uniqueVisitors > 0 ? (stats.totalViews / stats.uniqueVisitors).toFixed(1) : 0}</div>
                </div>
            </div>

            <!-- Devices -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">Devices</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: #3B82F6;">${stats.devices.desktop}</div>
                        <div style="font-size: 14px; color: #6b7280;">Desktop</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: #10B981;">${stats.devices.mobile}</div>
                        <div style="font-size: 14px; color: #6b7280;">Mobile</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: #f97316;">${stats.devices.tablet}</div>
                        <div style="font-size: 14px; color: #6b7280;">Tablet</div>
                    </div>
                </div>
            </div>

            <!-- Top Pages -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">Top Pages</h3>
                ${topPages.length > 0 ? topPages.map(([page, views]) => `
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px;">
                        <span style="color: #374151; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${page}</span>
                        <span style="color: #6b7280; font-weight: 600; font-size: 14px;">${views} views</span>
                    </div>
                `).join('') : '<p style="color: #6b7280; text-align: center;">No data yet</p>'}
            </div>

            <!-- Daily Views Chart -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">Daily Views (Last 7 Days)</h3>
                <div style="display: flex; align-items: flex-end; gap: 8px; height: 150px;">
                    ${dailyViews.map(([date, views]) => {
                        const maxViews = Math.max(...Object.values(stats.dailyViews));
                        const height = maxViews > 0 ? (views / maxViews) * 100 : 0;
                        return `
                            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); width: 100%; height: ${height}%; border-radius: 4px 4px 0 0; min-height: ${views > 0 ? '20px' : '0'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
                                    ${views}
                                </div>
                                <div style="font-size: 10px; color: #6b7280; text-align: center;">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize global instances
if (typeof window !== 'undefined') {
    window.yenzeAnalytics = new YenzeAnalytics();
    window.analyticsDashboard = new AnalyticsDashboard();

    // Auto-initialize for published sites
    if (window.location.pathname.startsWith('/s/') || window.location.pathname.startsWith('/sites/')) {
        window.yenzeAnalytics.init();
    }
}
