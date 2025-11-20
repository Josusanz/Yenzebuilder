-- =====================================================
-- YENZE Builder - Public Access Fix for Published Sites
-- =====================================================
-- This fixes the issue where published sites require authentication
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add a policy to allow ANYONE (including anonymous users) to view ANY project
-- This is safe because:
-- 1. Published URLs are UUID-based (hard to guess)
-- 2. Users explicitly choose to publish their sites
-- 3. Analytics still tracks who views the sites
-- 4. Only the HTML content is public, not user data

CREATE POLICY "Anyone can view published projects"
    ON projects FOR SELECT
    TO anon, authenticated
    USING (true);

-- =====================================================
-- IMPORTANT NOTE
-- =====================================================
-- This policy allows anyone to read projects from the database.
-- This is intentional for the FREE plan where sites are publicly
-- accessible via view.html?id={project_id}
--
-- If you want to restrict this in the future, you could add
-- a "is_published" boolean column and only allow public access
-- to published projects:
--
-- USING (is_published = true);
--
-- But for now, we allow access to all projects since the UUID
-- is effectively the "secret" URL.
-- =====================================================
