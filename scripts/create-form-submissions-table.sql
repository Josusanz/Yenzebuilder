-- Create form_submissions table for storing contact form submissions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    subject VARCHAR(255) DEFAULT 'New Contact Form Submission',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    site_url TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    custom_fields JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by project
CREATE INDEX IF NOT EXISTS idx_form_submissions_project_id ON form_submissions(project_id);

-- Create index for date-based queries (for rate limiting)
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view submissions for their own projects
CREATE POLICY "Users can view their project submissions"
ON form_submissions
FOR SELECT
USING (
    project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
    )
);

-- Policy: Anyone can insert (public form submissions)
CREATE POLICY "Anyone can submit forms"
ON form_submissions
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update (mark as read) their own project submissions
CREATE POLICY "Users can update their project submissions"
ON form_submissions
FOR UPDATE
USING (
    project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
    )
);

-- Grant access for the service role (API)
GRANT ALL ON form_submissions TO service_role;
GRANT SELECT, INSERT ON form_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON form_submissions TO authenticated;
