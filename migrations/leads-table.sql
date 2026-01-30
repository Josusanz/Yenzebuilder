-- =====================================================
-- YENZE Builder - Leads Table Migration
-- =====================================================
-- This creates a simple leads table to capture emails
-- from users who want to publish or download their projects
-- =====================================================

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'yenze_builder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Row Level Security - anyone can insert (for email capture)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their email (public access for lead capture)
CREATE POLICY "Anyone can insert leads"
    ON leads FOR INSERT
    WITH CHECK (true);

-- Only service role can read leads (for admin/export)
CREATE POLICY "Service role can read leads"
    ON leads FOR SELECT
    USING (false); -- Public users can't read, only service role can

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- =====================================================
-- Optional: Add source tracking columns
-- =====================================================
-- You can track where leads came from with these additional columns

ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- =====================================================
-- View for easy export of leads
-- =====================================================
CREATE OR REPLACE VIEW leads_export AS
SELECT
    email,
    source,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    created_at
FROM leads
ORDER BY created_at DESC;

-- Grant select on view to authenticated users (for dashboard)
-- GRANT SELECT ON leads_export TO authenticated;
