-- Migration: Support anonymous publishing
-- Run this in Supabase SQL Editor

-- Add owner_email column for anonymous projects (projects without user_id)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Add slug column if it doesn't exist (for /s/slug URLs)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Create index for owner_email lookups
CREATE INDEX IF NOT EXISTS idx_projects_owner_email ON projects(owner_email);

-- Update RLS policies to allow anonymous project creation
-- Drop existing policies first if they exist
DROP POLICY IF EXISTS "Allow anonymous project creation" ON projects;
DROP POLICY IF EXISTS "Allow reading published projects" ON projects;

-- Policy: Allow inserting projects (both authenticated and anonymous via API)
CREATE POLICY "Allow anonymous project creation" ON projects
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow reading published projects
CREATE POLICY "Allow reading published projects" ON projects
    FOR SELECT
    USING (published = true OR owner_email IS NOT NULL);

-- Policy: Allow updating own projects by email
DROP POLICY IF EXISTS "Allow updating own projects by email" ON projects;
CREATE POLICY "Allow updating own projects by email" ON projects
    FOR UPDATE
    USING (true);

-- Comment for documentation
COMMENT ON COLUMN projects.owner_email IS 'Email of anonymous project owner (for projects without user_id)';
COMMENT ON COLUMN projects.slug IS 'URL slug for /s/slug format (free tier)';
