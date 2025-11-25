-- Fix duplicate subscriptions and grant Business Plan access
-- Execute this in Supabase SQL Editor

-- Step 1: Check for duplicates
SELECT user_id, COUNT(*) as count
FROM subscriptions
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Step 2: Remove duplicates, keeping only the most recent one for each user
DELETE FROM subscriptions
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM subscriptions
    ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
);

-- Step 3: Add UNIQUE constraint to user_id
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);

-- Step 4: Create or update subscription for unlimited access
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

-- Step 5: Verify the subscription was created/updated
SELECT
    u.email,
    s.plan,
    s.status,
    s.current_period_end,
    s.stripe_subscription_id
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'j.sanzuriz@gmail.com';
