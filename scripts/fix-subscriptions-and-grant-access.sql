-- Fix subscriptions table and grant Business Plan access
-- Execute this in Supabase SQL Editor

-- Step 1: Add UNIQUE constraint to user_id if it doesn't exist
-- First check if the constraint exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'subscriptions_user_id_key'
    ) THEN
        ALTER TABLE subscriptions
        ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Step 2: Create or update subscription for unlimited access
INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan,
    status,
    current_period_end,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'j.sanzuriz@gmail.com'),
    'manual_admin_grant',  -- Manual grant, not via Stripe
    'unlimited_access',     -- Special subscription ID for unlimited access
    'business',             -- Business plan = unlimited projects
    'active',
    '2099-12-31 23:59:59+00',  -- Far future date (never expires)
    NOW(),
    NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
    plan = 'business',
    status = 'active',
    current_period_end = '2099-12-31 23:59:59+00',
    stripe_subscription_id = 'unlimited_access',
    updated_at = NOW();

-- Step 3: Verify the subscription was created/updated
SELECT
    u.email,
    s.plan,
    s.status,
    s.current_period_end,
    s.stripe_subscription_id
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'j.sanzuriz@gmail.com';
