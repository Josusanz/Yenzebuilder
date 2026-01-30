-- Migration: Sync subdomain_slug with public_slug
-- Description: Ensures all projects have a subdomain_slug matching their public_slug
-- This is required for the form submission system to correctly identify projects by subdomain

UPDATE projects
SET subdomain_slug = public_slug
WHERE subdomain_slug IS NULL AND public_slug IS NOT NULL;

-- Verify the update
SELECT id, name, public_slug, subdomain_slug 
FROM projects 
WHERE subdomain_slug IS NOT NULL 
LIMIT 10;
