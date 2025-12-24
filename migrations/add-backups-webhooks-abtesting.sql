-- Migration: Add Backups, Webhooks, and A/B Testing tables
-- Run this in Supabase Dashboard > SQL Editor

-- =====================================================
-- 1. PROJECT BACKUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    backup_data JSONB NOT NULL,
    size_bytes INTEGER DEFAULT 0,
    is_auto BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_backups_project_id ON project_backups(project_id);
CREATE INDEX IF NOT EXISTS idx_project_backups_user_id ON project_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_project_backups_created_at ON project_backups(created_at DESC);

-- RLS Policies for project_backups
ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own backups" ON project_backups;
CREATE POLICY "Users can view own backups" ON project_backups
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own backups" ON project_backups;
CREATE POLICY "Users can create own backups" ON project_backups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own backups" ON project_backups;
CREATE POLICY "Users can delete own backups" ON project_backups
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. FORM WEBHOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS form_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_webhooks_project_id ON form_webhooks(project_id);
CREATE INDEX IF NOT EXISTS idx_form_webhooks_user_id ON form_webhooks(user_id);

-- RLS Policies for form_webhooks
ALTER TABLE form_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own webhooks" ON form_webhooks;
CREATE POLICY "Users can view own webhooks" ON form_webhooks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own webhooks" ON form_webhooks;
CREATE POLICY "Users can create own webhooks" ON form_webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own webhooks" ON form_webhooks;
CREATE POLICY "Users can update own webhooks" ON form_webhooks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own webhooks" ON form_webhooks;
CREATE POLICY "Users can delete own webhooks" ON form_webhooks
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. WEBHOOK LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID NOT NULL REFERENCES form_webhooks(id) ON DELETE CASCADE,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- RLS Policies for webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view logs of own webhooks" ON webhook_logs;
CREATE POLICY "Users can view logs of own webhooks" ON webhook_logs
    FOR SELECT USING (
        webhook_id IN (SELECT id FROM form_webhooks WHERE user_id = auth.uid())
    );

-- =====================================================
-- 4. A/B TEST VARIANTS TABLE
-- =====================================================
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_project_id ON ab_test_variants(project_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_user_id ON ab_test_variants(user_id);

-- RLS Policies for ab_test_variants
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own variants" ON ab_test_variants;
CREATE POLICY "Users can view own variants" ON ab_test_variants
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own variants" ON ab_test_variants;
CREATE POLICY "Users can create own variants" ON ab_test_variants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own variants" ON ab_test_variants;
CREATE POLICY "Users can update own variants" ON ab_test_variants
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own variants" ON ab_test_variants;
CREATE POLICY "Users can delete own variants" ON ab_test_variants
    FOR DELETE USING (auth.uid() = user_id);

-- Public read for serving variants to visitors
DROP POLICY IF EXISTS "Public can read active variants" ON ab_test_variants;
CREATE POLICY "Public can read active variants" ON ab_test_variants
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 5. ADD ab_testing_enabled TO PROJECTS TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'ab_testing_enabled'
    ) THEN
        ALTER TABLE projects ADD COLUMN ab_testing_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- GRANT SERVICE ROLE ACCESS (for API)
-- =====================================================
GRANT ALL ON project_backups TO service_role;
GRANT ALL ON form_webhooks TO service_role;
GRANT ALL ON webhook_logs TO service_role;
GRANT ALL ON ab_test_variants TO service_role;

-- Success message
SELECT 'Migration completed successfully!' as status;
