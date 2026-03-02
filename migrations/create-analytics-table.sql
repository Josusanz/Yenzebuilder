-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    page TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_size TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view analytics for their own projects
CREATE POLICY "Users can view own project analytics" ON analytics_events
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Anyone can insert analytics events (for tracking)
CREATE POLICY "Anyone can insert analytics" ON analytics_events
    FOR INSERT
    WITH CHECK (true);

-- Create a view for daily stats
CREATE OR REPLACE VIEW daily_analytics AS
SELECT
    project_id,
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event = 'pageview') as total_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'pageview') as unique_visitors,
    COUNT(*) FILTER (WHERE event = 'click') as total_clicks,
    COUNT(*) FILTER (WHERE event = 'form_submit') as form_submissions,
    COUNT(*) FILTER (WHERE event = 'download') as downloads
FROM analytics_events
GROUP BY project_id, DATE(created_at);

-- Grant access to the view
GRANT SELECT ON daily_analytics TO authenticated;
GRANT SELECT ON daily_analytics TO anon;
