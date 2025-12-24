-- Project Backups Table
CREATE TABLE IF NOT EXISTS project_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    backup_data JSONB NOT NULL,
    size_bytes INTEGER DEFAULT 0,
    is_auto BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_backups_project_id ON project_backups(project_id);
CREATE INDEX IF NOT EXISTS idx_project_backups_user_id ON project_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_project_backups_created_at ON project_backups(created_at DESC);

-- RLS policies for backups
ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backups"
    ON project_backups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backups"
    ON project_backups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups"
    ON project_backups FOR DELETE
    USING (auth.uid() = user_id);

-- Webhooks Table for Form Submissions
CREATE TABLE IF NOT EXISTS form_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] DEFAULT ARRAY['form_submission'],
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for webhooks
CREATE INDEX IF NOT EXISTS idx_form_webhooks_project_id ON form_webhooks(project_id);
CREATE INDEX IF NOT EXISTS idx_form_webhooks_user_id ON form_webhooks(user_id);

-- RLS policies for webhooks
ALTER TABLE form_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhooks"
    ON form_webhooks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
    ON form_webhooks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
    ON form_webhooks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
    ON form_webhooks FOR DELETE
    USING (auth.uid() = user_id);

-- Webhook Logs Table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID NOT NULL REFERENCES form_webhooks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- A/B Test Variants Table
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    html_content TEXT,
    weight INTEGER DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),
    is_control BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for A/B variants
CREATE INDEX IF NOT EXISTS idx_ab_variants_project_id ON ab_test_variants(project_id);
CREATE INDEX IF NOT EXISTS idx_ab_variants_user_id ON ab_test_variants(user_id);

-- RLS policies for A/B variants
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own variants"
    ON ab_test_variants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own variants"
    ON ab_test_variants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own variants"
    ON ab_test_variants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own variants"
    ON ab_test_variants FOR DELETE
    USING (auth.uid() = user_id);

-- Add ab_testing_enabled to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ab_testing_enabled BOOLEAN DEFAULT false;
