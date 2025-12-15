/**
 * Enhanced Analytics System
 * Advanced insights and metrics
 */

export class EnhancedAnalytics {
    constructor() {
        this.metrics = {
            pageViews: [],
            sessions: [],
            events: [],
            performance: []
        };
    }

    async getInsights(projectId, dateRange = '7d') {
        const data = await this._fetchAnalytics(projectId, dateRange);

        return {
            overview: {
                totalVisitors: data.visitors.length,
                totalPageviews: data.pageviews.reduce((sum, p) => sum + p.count, 0),
                bounceRate: this._calculateBounceRate(data),
                avgSessionDuration: this._calculateAvgDuration(data)
            },
            topPages: this._getTopPages(data),
            trafficSources: this._getTrafficSources(data),
            devices: this._getDeviceBreakdown(data),
            timeline: this._getTimeline(data),
            conversions: this._getConversions(data)
        };
    }

    _calculateBounceRate(data) {
        const bounced = data.sessions.filter(s => s.pageCount === 1).length;
        return (bounced / data.sessions.length * 100).toFixed(2);
    }

    _calculateAvgDuration(data) {
        const total = data.sessions.reduce((sum, s) => sum + s.duration, 0);
        return (total / data.sessions.length / 1000).toFixed(0); // seconds
    }

    _getTopPages(data) {
        const pages = {};
        data.pageviews.forEach(pv => {
            pages[pv.path] = (pages[pv.path] || 0) + pv.count;
        });
        return Object.entries(pages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([path, views]) => ({ path, views }));
    }

    _getTrafficSources(data) {
        const sources = {};
        data.sessions.forEach(s => {
            const source = s.referrer || 'Direct';
            sources[source] = (sources[source] || 0) + 1;
        });
        return Object.entries(sources).map(([source, count]) => ({ source, count }));
    }

    _getDeviceBreakdown(data) {
        const devices = { desktop: 0, mobile: 0, tablet: 0 };
        data.sessions.forEach(s => {
            devices[s.device] = (devices[s.device] || 0) + 1;
        });
        return devices;
    }

    _getTimeline(data) {
        // Group by day
        const timeline = {};
        data.pageviews.forEach(pv => {
            const date = new Date(pv.timestamp).toISOString().split('T')[0];
            timeline[date] = (timeline[date] || 0) + pv.count;
        });
        return Object.entries(timeline).map(([date, views]) => ({ date, views }));
    }

    _getConversions(data) {
        return {
            formSubmissions: data.events.filter(e => e.type === 'form_submit').length,
            buttonClicks: data.events.filter(e => e.type === 'button_click').length,
            linkClicks: data.events.filter(e => e.type === 'link_click').length
        };
    }

    async _fetchAnalytics(projectId, dateRange) {
        // Simulated - would fetch from Supabase
        return {
            visitors: [],
            pageviews: [],
            sessions: [],
            events: []
        };
    }
}

export const analytics = new EnhancedAnalytics();
window.enhancedAnalytics = analytics;
