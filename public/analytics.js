// Analytics Tracking System for YENZE

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.visitorId = this.getOrCreateVisitorId();
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getOrCreateVisitorId() {
        // Check if visitor ID exists in localStorage
        let visitorId = localStorage.getItem('yenze_visitor_id');

        if (!visitorId) {
            // Generate new visitor ID
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('yenze_visitor_id', visitorId);
        }

        return visitorId;
    }

    async trackPageView(projectId) {
        if (!projectId) return;

        try {
            // Get visitor information
            const visitorInfo = this.getVisitorInfo();

            // Create analytics event
            const { error } = await supabaseClient.client
                .from('analytics_events')
                .insert({
                    project_id: projectId,
                    event_type: 'page_view',
                    visitor_id: this.visitorId,
                    session_id: this.sessionId,
                    page_url: window.location.href,
                    referrer: document.referrer || null,
                    user_agent: navigator.userAgent,
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    language: navigator.language,
                    timestamp: new Date().toISOString(),
                    metadata: visitorInfo
                });

            if (error) {
                console.error('Analytics tracking error:', error);
            }

        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    }

    getVisitorInfo() {
        return {
            platform: navigator.platform,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    async trackEvent(projectId, eventType, eventData = {}) {
        if (!projectId) return;

        try {
            const { error } = await supabaseClient.client
                .from('analytics_events')
                .insert({
                    project_id: projectId,
                    event_type: eventType,
                    visitor_id: this.visitorId,
                    session_id: this.sessionId,
                    page_url: window.location.href,
                    timestamp: new Date().toISOString(),
                    metadata: eventData
                });

            if (error) {
                console.error('Analytics event tracking error:', error);
            }

        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    // Get analytics statistics for a project
    async getProjectStats(projectId) {
        try {
            // Get total views
            const { count: totalViews, error: viewsError } = await supabaseClient.client
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)
                .eq('event_type', 'page_view');

            if (viewsError) throw viewsError;

            // Get unique visitors
            const { data: uniqueVisitorsData, error: visitorsError } = await supabaseClient.client
                .from('analytics_events')
                .select('visitor_id')
                .eq('project_id', projectId)
                .eq('event_type', 'page_view');

            if (visitorsError) throw visitorsError;

            const uniqueVisitors = new Set(uniqueVisitorsData.map(v => v.visitor_id)).size;

            return {
                totalViews: totalViews || 0,
                uniqueVisitors: uniqueVisitors || 0
            };

        } catch (error) {
            console.error('Error getting project stats:', error);
            return {
                totalViews: 0,
                uniqueVisitors: 0
            };
        }
    }

    // Get total stats for a user across all projects
    async getTotalStats(userId, projectId = null) {
        try {
            // Build query
            let query = supabaseClient.client
                .from('analytics_events')
                .select('project_id, visitor_id, created_at');

            // If projectId specified, filter by it
            if (projectId) {
                query = query.eq('project_id', projectId);
            } else {
                // Otherwise, get all projects for this user first
                const { data: projects } = await supabaseClient.client
                    .from('projects')
                    .select('id')
                    .eq('user_id', userId);

                if (!projects || projects.length === 0) {
                    return {
                        totalViews: 0,
                        uniqueVisitors: 0,
                        avgDuration: 0
                    };
                }

                const projectIds = projects.map(p => p.id);
                query = query.in('project_id', projectIds);
            }

            query = query.eq('event_type', 'page_view');

            const { data: events, error } = await query;

            if (error) throw error;

            const totalViews = events.length;
            const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;

            return {
                totalViews,
                uniqueVisitors,
                avgDuration: null // Would need session tracking for this
            };

        } catch (error) {
            console.error('Error getting total stats:', error);
            return {
                totalViews: 0,
                uniqueVisitors: 0,
                avgDuration: 0
            };
        }
    }

    // Get analytics over time (for charts)
    async getAnalyticsTimeSeries(projectId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('created_at, event_type')
                .eq('project_id', projectId)
                .eq('event_type', 'page_view')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by date
            const groupedByDate = {};
            events.forEach(event => {
                const date = new Date(event.created_at).toLocaleDateString();
                groupedByDate[date] = (groupedByDate[date] || 0) + 1;
            });

            return groupedByDate;

        } catch (error) {
            console.error('Error getting time series:', error);
            return {};
        }
    }

    // Get top referrers
    async getTopReferrers(projectId, limit = 10) {
        try {
            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('referrer')
                .eq('project_id', projectId)
                .eq('event_type', 'page_view')
                .not('referrer', 'is', null);

            if (error) throw error;

            // Count referrers
            const referrerCounts = {};
            events.forEach(event => {
                const referrer = event.referrer;
                referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
            });

            // Sort and limit
            const sorted = Object.entries(referrerCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([referrer, count]) => ({ referrer, count }));

            return sorted;

        } catch (error) {
            console.error('Error getting top referrers:', error);
            return [];
        }
    }

    // Get device breakdown
    async getDeviceBreakdown(projectId) {
        try {
            const { data: events, error } = await supabaseClient.client
                .from('analytics_events')
                .select('user_agent')
                .eq('project_id', projectId)
                .eq('event_type', 'page_view');

            if (error) throw error;

            // Simple device detection from user agent
            const devices = {
                mobile: 0,
                tablet: 0,
                desktop: 0
            };

            events.forEach(event => {
                const ua = event.user_agent.toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                    devices.mobile++;
                } else if (ua.includes('tablet') || ua.includes('ipad')) {
                    devices.tablet++;
                } else {
                    devices.desktop++;
                }
            });

            return devices;

        } catch (error) {
            console.error('Error getting device breakdown:', error);
            return { mobile: 0, tablet: 0, desktop: 0 };
        }
    }
}

// Create singleton instance
const analyticsTracker = new AnalyticsTracker();
