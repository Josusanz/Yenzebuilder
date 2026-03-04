-- Migration: Add email column to subscriptions for anonymous users
-- Run this in Supabase SQL Editor

-- Add email column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);

-- Make user_id nullable (for anonymous subscribers)
ALTER TABLE subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN subscriptions.email IS 'Email of subscriber (used for anonymous users without user_id)';
