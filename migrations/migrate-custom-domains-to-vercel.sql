-- Migration: Update custom_domains table for Vercel integration
-- Date: 2025-11-23
-- Purpose: Replace Cloudflare-specific columns with Vercel-specific columns

-- Add new Vercel-specific columns
ALTER TABLE custom_domains
ADD COLUMN IF NOT EXISTS vercel_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_record JSONB,
ADD COLUMN IF NOT EXISTS cname_target VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Optional: Remove old Cloudflare columns (comment out if you want to keep historical data)
-- ALTER TABLE custom_domains
-- DROP COLUMN IF EXISTS cloudflare_id,
-- DROP COLUMN IF EXISTS cloudflare_status,
-- DROP COLUMN IF EXISTS ssl_status,
-- DROP COLUMN IF EXISTS verification_errors,
-- DROP COLUMN IF EXISTS nameservers;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_domains_updated_at_trigger ON custom_domains;

CREATE TRIGGER custom_domains_updated_at_trigger
    BEFORE UPDATE ON custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_domains_updated_at();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_status ON custom_domains(user_id, status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verified ON custom_domains(vercel_verified);
