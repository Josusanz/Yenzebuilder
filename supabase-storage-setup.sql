-- =====================================================
-- YENZE Builder - Supabase Storage Configuration
-- =====================================================
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Storage
-- 3. Create a new bucket called "published-sites"
-- 4. Then run this SQL in the SQL Editor
-- =====================================================

-- Create storage bucket for published sites (if not exists via UI)
-- Note: You should create this via Supabase UI: Storage > Create Bucket > "published-sites"

-- Set bucket to PUBLIC so sites can be accessed without auth
UPDATE storage.buckets
SET public = true
WHERE id = 'published-sites';

-- Row Level Security Policies for published-sites bucket
-- Allow anyone to read published sites (public access)
CREATE POLICY "Public Access to Published Sites"
ON storage.objects FOR SELECT
USING (bucket_id = 'published-sites');

-- Allow authenticated users to upload their own sites
CREATE POLICY "Users can upload their own sites"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'published-sites'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own sites
CREATE POLICY "Users can update their own sites"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'published-sites'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own sites
CREATE POLICY "Users can delete their own sites"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'published-sites'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- DONE!
-- =====================================================
-- Your storage bucket is now configured.
--
-- File structure will be:
-- published-sites/
--   {user_id}/
--     {project_id}/
--       index.html
--
-- Public URL format:
-- https://xssdcphepracobbsvqmg.supabase.co/storage/v1/object/public/published-sites/{user_id}/{project_id}/index.html
