-- Add form_submissions table for Messages feature
-- This table stores contact form submissions from published websites

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_project_id ON form_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_read ON form_submissions(read);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions (from public websites)
CREATE POLICY "Anyone can insert form submissions"
    ON form_submissions FOR INSERT
    WITH CHECK (true);

-- Users can view submissions for their own projects
CREATE POLICY "Users can view own project submissions"
    ON form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update (mark as read) submissions for their own projects
CREATE POLICY "Users can update own project submissions"
    ON form_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can delete submissions for their own projects
CREATE POLICY "Users can delete own project submissions"
    ON form_submissions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add comment
COMMENT ON TABLE form_submissions IS 'Stores contact form submissions from published websites';
