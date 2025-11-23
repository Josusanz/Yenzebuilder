-- YENZE Pricing System Migration
-- Add plan limits and usage tracking to Supabase

-- 1. Update subscriptions table to include plan details
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS monthly_views_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS storage_limit_mb INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branding_removed BOOLEAN DEFAULT false;

-- 2. Create usage_tracking table for monthly limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Monthly counters (reset each billing cycle)
    month_year TEXT NOT NULL, -- Format: "2025-01"
    page_views INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,

    -- Lifetime counters
    total_projects INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one record per user per month
    UNIQUE(user_id, month_year)
);

-- 3. Create project_stats table for per-project tracking
CREATE TABLE IF NOT EXISTS project_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Stats
    page_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    monthly_views INTEGER DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,
    last_published TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id)
);

-- 4. Create view_logs table for tracking page views
CREATE TABLE IF NOT EXISTS view_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- View details
    slug TEXT,
    viewer_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,

    -- Timestamp
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Index for fast monthly queries
    month_year TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_view_logs_project ON view_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_user_month ON view_logs(user_id, month_year);

-- 5. Update projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 6. Create function to check user plan limits
CREATE OR REPLACE FUNCTION check_user_limit(
    p_user_id UUID,
    p_action TEXT,
    p_current_count INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
    v_subscription RECORD;
    v_plan_limits JSONB;
    v_can_perform BOOLEAN;
    v_message TEXT;
BEGIN
    -- Get user's subscription
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Default to free plan if no subscription
    IF v_subscription IS NULL THEN
        v_subscription.plan := 'free';
        v_subscription.monthly_views_limit := 1000;
        v_subscription.storage_limit_mb := 10;
        v_subscription.custom_domain_enabled := false;
        v_subscription.branding_removed := false;
    END IF;

    -- Check limits based on action
    CASE p_action
        WHEN 'create_page' THEN
            IF v_subscription.plan = 'free' AND p_current_count >= 1 THEN
                v_can_perform := false;
                v_message := 'Upgrade to STARTER ($2.99/mo) to create up to 3 pages!';
            ELSIF v_subscription.plan = 'starter' AND p_current_count >= 3 THEN
                v_can_perform := false;
                v_message := 'Upgrade to PRO ($6.99/mo) for unlimited pages!';
            ELSE
                v_can_perform := true;
                v_message := 'OK';
            END IF;

        WHEN 'create_project' THEN
            IF v_subscription.plan = 'free' AND p_current_count >= 1 THEN
                v_can_perform := false;
                v_message := 'Upgrade to STARTER ($2.99/mo) to create up to 3 projects!';
            ELSIF v_subscription.plan = 'starter' AND p_current_count >= 3 THEN
                v_can_perform := false;
                v_message := 'Upgrade to PRO ($6.99/mo) for 10 projects!';
            ELSIF v_subscription.plan = 'pro' AND p_current_count >= 10 THEN
                v_can_perform := false;
                v_message := 'Upgrade to BUSINESS ($14.99/mo) for unlimited projects!';
            ELSE
                v_can_perform := true;
                v_message := 'OK';
            END IF;

        WHEN 'custom_domain' THEN
            v_can_perform := v_subscription.custom_domain_enabled;
            IF NOT v_can_perform THEN
                v_message := 'Upgrade to PRO ($6.99/mo) to use custom domains!';
            ELSE
                v_message := 'OK';
            END IF;

        ELSE
            v_can_perform := true;
            v_message := 'Unknown action';
    END CASE;

    RETURN jsonb_build_object(
        'allowed', v_can_perform,
        'message', v_message,
        'current_plan', v_subscription.plan,
        'upgrade_needed', NOT v_can_perform
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to track page view
CREATE OR REPLACE FUNCTION track_page_view(
    p_project_id UUID,
    p_slug TEXT DEFAULT NULL,
    p_viewer_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_month_year TEXT;
    v_subscription RECORD;
    v_current_views INTEGER;
    v_limit_reached BOOLEAN;
BEGIN
    -- Get month year
    v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

    -- Get project owner
    SELECT user_id INTO v_user_id
    FROM projects
    WHERE id = p_project_id;

    -- Get user's subscription and current views
    SELECT s.*, COALESCE(u.page_views, 0) as current_views
    INTO v_subscription
    FROM subscriptions s
    LEFT JOIN usage_tracking u ON u.user_id = s.user_id AND u.month_year = v_month_year
    WHERE s.user_id = v_user_id
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Default to free plan
    IF v_subscription IS NULL THEN
        v_subscription.plan := 'free';
        v_subscription.monthly_views_limit := 1000;
        v_subscription.current_views := 0;
    END IF;

    -- Check if limit reached
    v_limit_reached := v_subscription.current_views >= v_subscription.monthly_views_limit;

    -- Only log if under limit (or unlimited plan)
    IF NOT v_limit_reached OR v_subscription.plan IN ('business') THEN
        -- Insert view log
        INSERT INTO view_logs (project_id, user_id, slug, viewer_ip, user_agent, month_year)
        VALUES (p_project_id, v_user_id, p_slug, p_viewer_ip, p_user_agent, v_month_year);

        -- Update usage tracking
        INSERT INTO usage_tracking (user_id, month_year, page_views)
        VALUES (v_user_id, v_month_year, 1)
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET
            page_views = usage_tracking.page_views + 1,
            updated_at = NOW();

        -- Update project stats
        UPDATE projects
        SET views_count = views_count + 1
        WHERE id = p_project_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'limit_reached', v_limit_reached,
        'current_views', v_subscription.current_views + 1,
        'limit', v_subscription.monthly_views_limit,
        'plan', v_subscription.plan
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable Row Level Security
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own project stats" ON project_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own view logs" ON view_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON usage_tracking TO authenticated;
GRANT ALL ON project_stats TO authenticated;
GRANT ALL ON view_logs TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_limit TO authenticated;
GRANT EXECUTE ON FUNCTION track_page_view TO anon, authenticated;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_project_stats_user ON project_stats(user_id);

COMMENT ON TABLE usage_tracking IS 'Tracks monthly usage per user for plan limits';
COMMENT ON TABLE project_stats IS 'Per-project statistics and metadata';
COMMENT ON TABLE view_logs IS 'Detailed view logs for analytics';
COMMENT ON FUNCTION check_user_limit IS 'Checks if user can perform action based on plan limits';
COMMENT ON FUNCTION track_page_view IS 'Tracks a page view and enforces monthly limits';
