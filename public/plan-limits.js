// Plan Limits Configuration - FREE VERSION
// All features unlocked for everyone!

const PLAN_LIMITS = {
    FREE: {
        name: 'Free',
        maxProjects: -1, // Unlimited
        maxVisitors: -1, // Unlimited
        maxStorage: -1, // Unlimited
        maxCustomDomains: -1, // Unlimited (self-hosted)
        maxFormSubmissions: -1, // Unlimited
        hasSubdomain: true, // yoursite.yenze.io
        hasAnalytics: true,
        hasCodeExport: true, // Can download HTML
        hasPrioritySupport: false,
        hasRemoveBranding: true,
        features: {
            multipage: true,
            forms: true,
            customCode: true,
            sslCertificate: true,
            emailSupport: false,
            advancedAnalytics: false
        }
    }
};

// Helper functions
const PlanUtils = {
    /**
     * Get plan limits - always returns FREE plan (everything unlocked)
     */
    getLimits(planName) {
        return PLAN_LIMITS.FREE;
    },

    /**
     * Always allow creating projects
     */
    canCreateProject(currentProjectCount, planName) {
        return {
            allowed: true,
            limit: -1,
            current: currentProjectCount,
            remaining: -1
        };
    },

    /**
     * Never exceed visitor limit
     */
    checkVisitorLimit(currentVisitors, planName) {
        return {
            exceeded: false,
            limit: -1,
            current: currentVisitors,
            percentage: 0,
            remaining: -1
        };
    },

    /**
     * Never exceed storage limit
     */
    checkStorageLimit(storageMB, planName) {
        return {
            exceeded: false,
            limit: -1,
            current: storageMB,
            percentage: 0,
            remaining: -1
        };
    },

    /**
     * Always allow custom domains
     */
    canAddCustomDomain(currentDomainCount, planName) {
        return {
            allowed: true,
            limit: -1,
            current: currentDomainCount,
            remaining: -1
        };
    },

    /**
     * Never exceed form submission limit
     */
    checkFormSubmissionLimit(currentSubmissions, planName) {
        return {
            exceeded: false,
            limit: -1,
            current: currentSubmissions,
            percentage: 0,
            remaining: -1
        };
    },

    /**
     * All features are available
     */
    hasFeature(featureName, planName) {
        const limits = PLAN_LIMITS.FREE;
        return limits[featureName] === true || (limits.features && limits.features[featureName] === true);
    },

    /**
     * Format limit display (always unlimited)
     */
    formatLimit(limit) {
        return 'Unlimited';
    },

    /**
     * Format storage size
     */
    formatStorage(mb) {
        return 'Unlimited';
    },

    /**
     * Usage level is always normal
     */
    getUsageLevel(percentage) {
        return 'normal';
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLAN_LIMITS, PlanUtils };
}
