-- Migration: Create creators table for template marketplace
-- Run this in Supabase SQL Editor

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    website TEXT,
    stripe_account_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_verification', 'active', 'suspended')),
    templates_count INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_creators_email ON creators(email);
CREATE INDEX IF NOT EXISTS idx_creators_stripe_account ON creators(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserting new creators (for onboarding)
CREATE POLICY "Allow creator registration" ON creators
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow reading creator info (for status checks)
CREATE POLICY "Allow reading creators" ON creators
    FOR SELECT
    USING (true);

-- Policy: Allow updating creators (for status updates from webhooks)
CREATE POLICY "Allow updating creators" ON creators
    FOR UPDATE
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_creators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER creators_updated_at
    BEFORE UPDATE ON creators
    FOR EACH ROW
    EXECUTE FUNCTION update_creators_updated_at();

-- Add comment for documentation
COMMENT ON TABLE creators IS 'Template creators who sell on the YENZE marketplace';
