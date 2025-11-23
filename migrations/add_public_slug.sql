-- Migration: Add public_slug column for FREE tier projects
-- This allows FREE users to publish at yenze.io/s/slug

-- Add public_slug column to projects table (without UNIQUE constraint initially)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS public_slug VARCHAR(255);

-- Create a unique index that filters out NULL values
-- This allows multiple NULL values but ensures non-NULL values are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_public_slug_unique
ON projects(public_slug)
WHERE public_slug IS NOT NULL;

-- Create a regular index for faster lookups (including NULLs)
CREATE INDEX IF NOT EXISTS idx_projects_public_slug ON projects(public_slug);

-- Add comment explaining the column
COMMENT ON COLUMN projects.public_slug IS 'URL slug for FREE tier projects (yenze.io/s/slug). NULL for non-FREE projects.';
