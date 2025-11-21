-- Add subdomain_slug column to projects table
-- This stores the subdomain for each project (e.g., "mi-empresa" for mi-empresa.yenze.io)

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS subdomain_slug TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_subdomain_slug ON projects(subdomain_slug);

-- Add comment
COMMENT ON COLUMN projects.subdomain_slug IS 'Unique subdomain slug for this project (e.g., "mi-empresa" for mi-empresa.yenze.io)';

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'visit', etc.
  timestamp TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT
);

-- Add index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_project ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON project_analytics(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analytics for their own projects
CREATE POLICY "Users can view their project analytics"
  ON project_analytics
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow public insert for tracking (anonymous analytics)
CREATE POLICY "Allow public insert for analytics"
  ON project_analytics
  FOR INSERT
  WITH CHECK (true);
