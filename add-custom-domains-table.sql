-- Custom Domains Table
-- Stores user custom domains for STARTER and PRO plans

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'deleted')),

  -- Cloudflare data
  cloudflare_id TEXT,
  cloudflare_status TEXT,
  ssl_status TEXT,
  verification_errors TEXT[],

  -- Nameservers to show user
  nameservers TEXT[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,

  -- Prevent users from exceeding plan limits
  CONSTRAINT check_domain_format CHECK (domain ~* '^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_project ON custom_domains(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);

-- Enable Row Level Security
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own domains
CREATE POLICY "Users can view their own custom domains"
  ON custom_domains
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own domains (with plan limit check)
CREATE POLICY "Users can add custom domains within plan limits"
  ON custom_domains
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    -- Check user has STARTER or PRO plan
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan IN ('starter', 'pro')
    ) AND
    -- Check domain limit based on plan
    (
      SELECT COUNT(*)
      FROM custom_domains
      WHERE user_id = auth.uid() AND status = 'active'
    ) < (
      SELECT
        CASE
          WHEN plan = 'starter' THEN 1
          WHEN plan = 'pro' THEN 10
          ELSE 0
        END
      FROM subscriptions
      WHERE user_id = auth.uid() AND status = 'active'
      LIMIT 1
    )
  );

-- Policy: Users can update their own domains
CREATE POLICY "Users can update their own custom domains"
  ON custom_domains
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own domains
CREATE POLICY "Users can delete their own custom domains"
  ON custom_domains
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_domains_timestamp
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_domains_updated_at();

-- Comments
COMMENT ON TABLE custom_domains IS 'Stores custom domains for STARTER and PRO users';
COMMENT ON COLUMN custom_domains.domain IS 'Full domain name (e.g., "miempresa.com")';
COMMENT ON COLUMN custom_domains.status IS 'pending: awaiting DNS, active: working, failed: error, deleted: removed';
COMMENT ON COLUMN custom_domains.cloudflare_id IS 'Cloudflare custom hostname ID';
COMMENT ON COLUMN custom_domains.nameservers IS 'Cloudflare nameservers to show user';
