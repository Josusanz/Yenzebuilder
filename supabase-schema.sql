-- =====================================================
-- YENZE Builder - Supabase Database Schema
-- =====================================================
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Run the query
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROJECTS TABLE
-- Stores user HTML projects
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
    html TEXT NOT NULL,
    published_url TEXT,
    subdomain_slug TEXT UNIQUE,
    public_slug TEXT UNIQUE,
    plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'one_time', 'pro')),
    custom_domain TEXT,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_seo_metadata ON projects USING GIN (seo_metadata);
CREATE INDEX IF NOT EXISTS idx_projects_subdomain_slug ON projects(subdomain_slug);
CREATE INDEX IF NOT EXISTS idx_projects_public_slug ON projects(public_slug);

-- Row Level Security (RLS) Policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Stores Stripe subscription data
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('one_time', 'pro')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Row Level Security (RLS) Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via Stripe webhooks)
-- Users cannot directly modify subscriptions
CREATE POLICY "Service role can insert subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (false); -- Will be handled by service role key

CREATE POLICY "Service role can update subscriptions"
    ON subscriptions FOR UPDATE
    USING (false); -- Will be handled by service role key

-- =====================================================
-- DEPLOYMENTS TABLE
-- Tracks deployment history
-- =====================================================
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deployment_url TEXT NOT NULL,
    custom_domain TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error')),
    vercel_deployment_id TEXT,
    error_message TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON deployments(deployed_at DESC);

-- Row Level Security (RLS) Policies for deployments
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Users can view their own deployments
CREATE POLICY "Users can view own deployments"
    ON deployments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own deployments
CREATE POLICY "Users can insert own deployments"
    ON deployments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ANALYTICS EVENTS TABLE
-- Stores page views and events for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL DEFAULT 'page_view' CHECK (event_type IN ('page_view', 'click', 'form_submit', 'custom')),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

-- Row Level Security (RLS) Policies for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (for tracking on published sites)
CREATE POLICY "Anyone can insert analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

-- Users can view analytics for their own projects
CREATE POLICY "Users can view own project analytics"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = analytics_events.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- FORM SUBMISSIONS TABLE
-- Stores contact form submissions from published websites
-- =====================================================
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT DEFAULT 'New Contact Form Submission',
    message TEXT NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    site_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_project_id ON form_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_is_read ON form_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Row Level Security (RLS) Policies for form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions (from public websites)
CREATE POLICY "Anyone can insert form submissions"
    ON form_submissions FOR INSERT
    WITH CHECK (true);

-- Users can view submissions for their own projects
CREATE POLICY "Users can view own project submissions"
    ON form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update (mark as read) submissions for their own projects
CREATE POLICY "Users can update own project submissions"
    ON form_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can delete submissions for their own projects
CREATE POLICY "Users can delete own project submissions"
    ON form_submissions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- USER PROFILES TABLE (Optional - for additional user data)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT,
    website TEXT,
    plan VARCHAR(20) DEFAULT 'free',
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View to get user's active subscription with project count
CREATE OR REPLACE VIEW user_subscription_info AS
SELECT
    u.id as user_id,
    u.email,
    s.plan,
    s.status,
    s.current_period_end,
    COUNT(p.id) as project_count,
    CASE
        WHEN s.plan = 'pro' THEN 5
        WHEN s.plan = 'business' THEN 999999
        ELSE 1
    END as max_projects
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.email, s.plan, s.status, s.current_period_end;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample data for testing

-- INSERT INTO projects (user_id, name, html, plan) VALUES
-- (auth.uid(), 'Sample Project', '<html><body>Hello World</body></html>', 'free');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- DONE!
-- =====================================================
-- Your database schema is now set up.
-- Next steps:
-- 1. Enable Google/GitHub OAuth providers in Supabase Auth settings
-- 2. Configure Stripe webhook in your Supabase Edge Functions
-- 3. Update config.js with your Supabase URL and anon key
