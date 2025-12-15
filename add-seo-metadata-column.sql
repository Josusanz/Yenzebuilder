-- Add seo_metadata column to projects table
-- This stores SEO optimization status for each project

-- Add seo_metadata JSONB column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_projects_seo_metadata ON projects USING GIN (seo_metadata);

-- Add comments
COMMENT ON COLUMN projects.seo_metadata IS 'Stores SEO optimization status including audit_score, sitemap_generated, robots_generated, links_checked';
