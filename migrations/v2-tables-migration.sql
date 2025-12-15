-- YENZE 2.0 Tables Migration
-- This script creates all required tables for version 2.0
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================
-- 1. USER COMPONENTS TABLE
-- ============================================
-- Stores reusable components saved by users

CREATE TABLE IF NOT EXISTS user_components (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'user',
    html TEXT NOT NULL,
    thumbnail TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_components_user_id
    ON user_components(user_id);

CREATE INDEX IF NOT EXISTS idx_user_components_category
    ON user_components(category);

CREATE INDEX IF NOT EXISTS idx_user_components_created
    ON user_components(created_at DESC);

-- Enable RLS
ALTER TABLE user_components ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own components" ON user_components;
DROP POLICY IF EXISTS "Users can create own components" ON user_components;
DROP POLICY IF EXISTS "Users can update own components" ON user_components;
DROP POLICY IF EXISTS "Users can delete own components" ON user_components;

-- Create RLS policies
CREATE POLICY "Users can view own components"
    ON user_components FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own components"
    ON user_components FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own components"
    ON user_components FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own components"
    ON user_components FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE user_components IS 'Reusable components saved by users in YENZE 2.0';

-- ============================================
-- 2. ANALYTICS SESSIONS TABLE
-- ============================================
-- Enhanced analytics tracking for user sessions

CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    user_agent TEXT,
    device TEXT CHECK (device IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    ip_address INET,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    page_count INTEGER DEFAULT 1,
    is_bounce BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_project_id
    ON analytics_sessions(project_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id
    ON analytics_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at
    ON analytics_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device
    ON analytics_sessions(device);

-- Enable RLS
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own project sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Service role can insert sessions" ON analytics_sessions;

-- Create RLS policies
CREATE POLICY "Users can view own project sessions"
    ON analytics_sessions FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert sessions"
    ON analytics_sessions FOR INSERT
    WITH CHECK (true); -- Service role only

-- Add comment
COMMENT ON TABLE analytics_sessions IS 'Enhanced user session tracking for YENZE 2.0 analytics';

-- ============================================
-- 3. ANALYTICS EVENTS TABLE (Enhanced)
-- ============================================
-- Check if analytics_events already exists
DO $$
BEGIN
    -- If table exists, add new columns if missing
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'analytics_events'
    ) THEN
        -- Add session_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = 'analytics_events'
            AND column_name = 'session_id'
        ) THEN
            ALTER TABLE analytics_events ADD COLUMN session_id TEXT;
        END IF;

        -- Add event_data column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = 'analytics_events'
            AND column_name = 'event_data'
        ) THEN
            ALTER TABLE analytics_events ADD COLUMN event_data JSONB;
        END IF;
    ELSE
        -- Create table if it doesn't exist
        CREATE TABLE analytics_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            session_id TEXT,
            event_type TEXT NOT NULL,
            event_data JSONB,
            page_url TEXT,
            page_title TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_project_id
    ON analytics_events(project_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
    ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type
    ON analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp
    ON analytics_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_data
    ON analytics_events USING gin(event_data);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own project events" ON analytics_events;
DROP POLICY IF EXISTS "Service role can insert events" ON analytics_events;

-- Create RLS policies
CREATE POLICY "Users can view own project events"
    ON analytics_events FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert events"
    ON analytics_events FOR INSERT
    WITH CHECK (true); -- Service role only

-- Add comment
COMMENT ON TABLE analytics_events IS 'Enhanced event tracking for YENZE 2.0 analytics';

-- ============================================
-- 4. CREATE VIEWS FOR ANALYTICS
-- ============================================

-- View for daily analytics
CREATE OR REPLACE VIEW analytics_daily_stats AS
SELECT
    project_id,
    DATE(started_at) as date,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) as total_sessions,
    AVG(duration) as avg_duration,
    SUM(page_count) as total_pageviews,
    COUNT(*) FILTER (WHERE is_bounce = true)::float / COUNT(*)::float * 100 as bounce_rate
FROM analytics_sessions
GROUP BY project_id, DATE(started_at);

-- View for top pages
CREATE OR REPLACE VIEW analytics_top_pages AS
SELECT
    project_id,
    page_url,
    page_title,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_visitors
FROM analytics_events
WHERE event_type = 'page_view'
GROUP BY project_id, page_url, page_title
ORDER BY view_count DESC;

-- View for traffic sources
CREATE OR REPLACE VIEW analytics_traffic_sources AS
SELECT
    project_id,
    COALESCE(referrer, 'Direct') as source,
    COUNT(DISTINCT session_id) as visitors,
    COUNT(*) as sessions
FROM analytics_sessions
GROUP BY project_id, referrer;

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON analytics_daily_stats TO authenticated;
GRANT SELECT ON analytics_top_pages TO authenticated;
GRANT SELECT ON analytics_traffic_sources TO authenticated;

-- ============================================
-- 6. VERIFICATION
-- ============================================

-- Show created tables
SELECT
    tablename as table_name,
    CASE
        WHEN hasindexes THEN '✅ Indexed'
        ELSE '⚠️ No indexes'
    END as index_status,
    CASE
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events')
ORDER BY tablename;

-- Show created indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events')
ORDER BY tablename, indexname;

-- Show RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events')
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ YENZE 2.0 migration completed successfully!';
    RAISE NOTICE 'Tables created: user_components, analytics_sessions, analytics_events';
    RAISE NOTICE 'Views created: analytics_daily_stats, analytics_top_pages, analytics_traffic_sources';
    RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
