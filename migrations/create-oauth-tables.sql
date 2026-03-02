-- OAuth States table (for CSRF protection)
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- OAuth Integrations table (stores tokens securely)
CREATE TABLE IF NOT EXISTS oauth_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    account_id TEXT,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_integrations_user ON oauth_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_integrations_provider ON oauth_integrations(provider);

-- Enable Row Level Security
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_integrations ENABLE ROW LEVEL SECURITY;

-- Policies for oauth_states (server-side only, no direct access)
CREATE POLICY "Service role can manage oauth_states" ON oauth_states
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policies for oauth_integrations
CREATE POLICY "Users can view own integrations" ON oauth_integrations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage integrations" ON oauth_integrations
    FOR ALL
    USING (auth.role() = 'service_role');

-- Function to clean expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON oauth_states TO authenticated;
GRANT SELECT ON oauth_integrations TO authenticated;
