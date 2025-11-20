-- =====================================================
-- YENZE Builder - Verify and Fix Policies
-- =====================================================
-- This checks current policies and fixes them if needed
-- =====================================================

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- This will show you all current policies on the projects table
-- You should see:
-- 1. "Anyone can view published projects" - GOOD (allows public access)
-- 2. "Authenticated users can view own projects" - GOOD (allows dashboard)
--
-- If you still see "Users can view own projects" - that's the problem!
