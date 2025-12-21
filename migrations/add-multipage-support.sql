/**
 * Multi-Page Support Migration
 * Adds support for multi-page projects while maintaining backward compatibility
 */

-- Add project_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'project_type'
    ) THEN
        ALTER TABLE projects
        ADD COLUMN project_type VARCHAR(10) DEFAULT 'single' CHECK (project_type IN ('single', 'multi'));
        RAISE NOTICE 'Column project_type added to projects table';
    ELSE
        RAISE NOTICE 'Column project_type already exists';
    END IF;
END $$;

-- Add pages JSONB column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'pages'
    ) THEN
        ALTER TABLE projects
        ADD COLUMN pages JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Column pages added to projects table';
    ELSE
        RAISE NOTICE 'Column pages already exists';
    END IF;
END $$;

-- Add navigation JSONB column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'navigation'
    ) THEN
        ALTER TABLE projects
        ADD COLUMN navigation JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Column navigation added to projects table';
    ELSE
        RAISE NOTICE 'Column navigation already exists';
    END IF;
END $$;

-- Create index for fast page searching
CREATE INDEX IF NOT EXISTS idx_projects_pages ON projects USING GIN (pages);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects (project_type);

-- Add comment for documentation
COMMENT ON COLUMN projects.project_type IS 'Type of project: single (traditional one-page) or multi (multiple pages)';
COMMENT ON COLUMN projects.pages IS 'Array of pages for multi-page projects. Each page has: id, slug, name, html, seo_metadata, is_homepage';
COMMENT ON COLUMN projects.navigation IS 'Navigation menu structure for multi-page projects';
