-- Check email confirmation status for users
-- Run this in Supabase SQL Editor to diagnose email confirmation issues

-- 1. Check all users and their confirmation status
SELECT
    email,
    email_confirmed_at,
    confirmed_at,
    created_at,
    CASE
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        WHEN confirmed_at IS NOT NULL THEN 'Confirmed (legacy)'
        ELSE 'Not Confirmed'
    END as status,
    -- Calculate how long since registration
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_registration
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check if there are any unconfirmed users
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 3. Find users created in the last 24 hours who haven't confirmed
SELECT
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- OPTIONAL: If you want to manually confirm a user for testing
-- Uncomment and replace 'user@example.com' with the actual email
-- UPDATE auth.users
-- SET email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email = 'user@example.com';
