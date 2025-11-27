// Plan Limits Configuration
// Centralizes all plan limits and restrictions

const PLAN_LIMITS = {
    FREE: {
        name: 'Free',
        maxProjects: 3,
        maxVisitors: 1000,
        maxStorage: 10, // MB per site
        maxCustomDomains: 0,
        maxFormSubmissions: 50, // Monthly form submissions
        hasSubdomain: false, // Only /s/slug URLs
        hasAnalytics: false,
        hasCodeExport: false,
        hasPrioritySupport: false,
        hasRemoveBranding: false,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true
        }
    },
    STARTER: {
        name: 'Starter',
        maxProjects: 5,
        maxVisitors: 5000,
        maxStorage: 50, // MB per site
        maxCustomDomains: 1,
        maxFormSubmissions: 500, // Monthly form submissions
        hasSubdomain: true, // yoursite.yenze.io
        hasAnalytics: true,
        hasCodeExport: false,
        hasPrioritySupport: false,
        hasRemoveBranding: true,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true,
            emailSupport: true
        }
    },
    PRO: {
        name: 'Pro',
        maxProjects: 10,
        maxVisitors: 25000,
        maxStorage: 500, // MB per site
        maxCustomDomains: -1, // Unlimited
        maxFormSubmissions: 2000, // Monthly form submissions
        hasSubdomain: true,
        hasAnalytics: true,
        hasCodeExport: true,
        hasPrioritySupport: true,
        hasRemoveBranding: true,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true,
            advancedAnalytics: true,
            prioritySupport: true
        }
    },
    PREMIUM: {
        name: 'Premium',
        maxProjects: -1, // Unlimited
        maxVisitors: -1, // Unlimited
        maxStorage: -1, // Unlimited
        maxCustomDomains: -1, // Unlimited
        maxFormSubmissions: -1, // Unlimited
        hasSubdomain: true,
        hasAnalytics: true,
        hasCodeExport: true,
        hasPrioritySupport: true,
        hasRemoveBranding: true,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true,
            advancedAnalytics: true,
            whiteLabel: true,
            teamCollaboration: true,
            sso: true,
            dedicatedManager: true
        }
    },
    BUSINESS: {
        // Legacy plan - treat as PREMIUM
        name: 'Business',
        maxProjects: -1,
        maxVisitors: -1,
        maxStorage: -1,
        maxCustomDomains: -1,
        maxFormSubmissions: -1, // Unlimited
        hasSubdomain: true,
        hasAnalytics: true,
        hasCodeExport: true,
        hasPrioritySupport: true,
        hasRemoveBranding: true,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true,
            advancedAnalytics: true,
            whiteLabel: true,
            teamCollaboration: true,
            sso: true,
            dedicatedManager: true
        }
    }
};

// Helper functions
const PlanUtils = {
    /**
     * Get plan limits for a specific plan
     * @param {string} planName - Plan name (FREE, STARTER, PRO, PREMIUM, BUSINESS)
     * @returns {object} Plan limits object
     */
    getLimits(planName) {
        const plan = (planName || 'FREE').toUpperCase();
        return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
    },

    /**
     * Check if user can create more projects
     * @param {number} currentProjectCount - Current number of projects
     * @param {string} planName - Plan name
     * @returns {object} { allowed: boolean, limit: number, current: number }
     */
    canCreateProject(currentProjectCount, planName) {
        const limits = this.getLimits(planName);
        const allowed = limits.maxProjects === -1 || currentProjectCount < limits.maxProjects;

        return {
            allowed,
            limit: limits.maxProjects,
            current: currentProjectCount,
            remaining: limits.maxProjects === -1 ? -1 : Math.max(0, limits.maxProjects - currentProjectCount)
        };
    },

    /**
     * Check if user has exceeded visitor limit
     * @param {number} currentVisitors - Current monthly visitors
     * @param {string} planName - Plan name
     * @returns {object} { exceeded: boolean, limit: number, current: number, percentage: number }
     */
    checkVisitorLimit(currentVisitors, planName) {
        const limits = this.getLimits(planName);
        const exceeded = limits.maxVisitors !== -1 && currentVisitors > limits.maxVisitors;
        const percentage = limits.maxVisitors === -1 ? 0 : (currentVisitors / limits.maxVisitors) * 100;

        return {
            exceeded,
            limit: limits.maxVisitors,
            current: currentVisitors,
            percentage: Math.min(percentage, 100),
            remaining: limits.maxVisitors === -1 ? -1 : Math.max(0, limits.maxVisitors - currentVisitors)
        };
    },

    /**
     * Check if project storage is within limits
     * @param {number} storageMB - Storage in MB
     * @param {string} planName - Plan name
     * @returns {object} { exceeded: boolean, limit: number, current: number, percentage: number }
     */
    checkStorageLimit(storageMB, planName) {
        const limits = this.getLimits(planName);
        const exceeded = limits.maxStorage !== -1 && storageMB > limits.maxStorage;
        const percentage = limits.maxStorage === -1 ? 0 : (storageMB / limits.maxStorage) * 100;

        return {
            exceeded,
            limit: limits.maxStorage,
            current: storageMB,
            percentage: Math.min(percentage, 100),
            remaining: limits.maxStorage === -1 ? -1 : Math.max(0, limits.maxStorage - storageMB)
        };
    },

    /**
     * Check if user can add more custom domains
     * @param {number} currentDomainCount - Current number of custom domains
     * @param {string} planName - Plan name
     * @returns {object} { allowed: boolean, limit: number, current: number }
     */
    canAddCustomDomain(currentDomainCount, planName) {
        const limits = this.getLimits(planName);
        const allowed = limits.maxCustomDomains === -1 || currentDomainCount < limits.maxCustomDomains;

        return {
            allowed,
            limit: limits.maxCustomDomains,
            current: currentDomainCount,
            remaining: limits.maxCustomDomains === -1 ? -1 : Math.max(0, limits.maxCustomDomains - currentDomainCount)
        };
    },

    /**
     * Check form submission limit
     * @param {number} currentSubmissions - Current monthly form submissions
     * @param {string} planName - Plan name
     * @returns {object} { exceeded: boolean, limit: number, current: number, percentage: number }
     */
    checkFormSubmissionLimit(currentSubmissions, planName) {
        const limits = this.getLimits(planName);
        const exceeded = limits.maxFormSubmissions !== -1 && currentSubmissions >= limits.maxFormSubmissions;
        const percentage = limits.maxFormSubmissions === -1 ? 0 : (currentSubmissions / limits.maxFormSubmissions) * 100;

        return {
            exceeded,
            limit: limits.maxFormSubmissions,
            current: currentSubmissions,
            percentage: Math.min(percentage, 100),
            remaining: limits.maxFormSubmissions === -1 ? -1 : Math.max(0, limits.maxFormSubmissions - currentSubmissions)
        };
    },

    /**
     * Check if user has access to a specific feature
     * @param {string} featureName - Feature name (hasAnalytics, hasCodeExport, etc.)
     * @param {string} planName - Plan name
     * @returns {boolean}
     */
    hasFeature(featureName, planName) {
        const limits = this.getLimits(planName);
        return limits[featureName] === true || limits.features[featureName] === true;
    },

    /**
     * Format limit display (handles unlimited)
     * @param {number} limit - Limit value (-1 for unlimited)
     * @returns {string}
     */
    formatLimit(limit) {
        return limit === -1 ? 'Unlimited' : limit.toLocaleString();
    },

    /**
     * Format storage size
     * @param {number} mb - Storage in MB
     * @returns {string}
     */
    formatStorage(mb) {
        if (mb === -1) return 'Unlimited';
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb} MB`;
    },

    /**
     * Get usage warning level
     * @param {number} percentage - Usage percentage (0-100)
     * @returns {string} 'normal' | 'warning' | 'danger'
     */
    getUsageLevel(percentage) {
        if (percentage >= 90) return 'danger';
        if (percentage >= 75) return 'warning';
        return 'normal';
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLAN_LIMITS, PlanUtils };
}
