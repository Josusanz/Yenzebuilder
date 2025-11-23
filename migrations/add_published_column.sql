-- Migration: Add published column to projects table
-- This tracks whether a project has been published or is still a draft

-- Add published column (defaults to false for existing projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Create index for faster lookups of published projects
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);

-- Add comment explaining the column
COMMENT ON COLUMN projects.published IS 'Whether the project has been published (true) or is still a draft (false)';

-- Optionally: Mark all existing projects with subdomain_slug or public_slug as published
UPDATE projects
SET published = true
WHERE (subdomain_slug IS NOT NULL OR public_slug IS NOT NULL)
  AND published = false;
