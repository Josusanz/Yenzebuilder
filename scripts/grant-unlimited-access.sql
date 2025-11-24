-- Grant Unlimited Access (Business Plan) to j.sanzuriz@gmail.com
-- Execute this in Supabase SQL Editor

-- Step 1: Find the user ID
-- SELECT id, email FROM auth.users WHERE email = 'j.sanzuriz@gmail.com';

-- Step 2: Create or update subscription for unlimited access
-- Replace 'USER_ID_HERE' with the actual user ID from Step 1

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

-- Verify the subscription was created/updated
SELECT
    u.email,
    s.plan,
    s.status,
    s.current_period_end,
    s.stripe_subscription_id
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'j.sanzuriz@gmail.com';
