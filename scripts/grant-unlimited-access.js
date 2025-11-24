#!/usr/bin/env node

/**
 * Grant Unlimited Access (Business Plan) to a user
 *
 * Usage:
 *   node scripts/grant-unlimited-access.js j.sanzuriz@gmail.com
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 *   - Or configure them in this script directly
 */

const email = process.argv[2] || 'j.sanzuriz@gmail.com';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xssdcphepracobbsvqmg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.error('');
    console.error('Get it from: https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/settings/api');
    console.error('');
    console.error('Then run:');
    console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    console.error('  node scripts/grant-unlimited-access.js j.sanzuriz@gmail.com');
    process.exit(1);
}

async function grantUnlimitedAccess(userEmail) {
    console.log(`\n🔍 Granting unlimited access to: ${userEmail}\n`);

    try {
        // Step 1: Find user ID
        console.log('Step 1: Finding user...');
        const userResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/get_user_by_email`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ email: userEmail })
            }
        );

        // Alternative: Query auth.users directly (requires service role)
        const usersResponse = await fetch(
            `${SUPABASE_URL}/auth/v1/admin/users`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        );

        if (!usersResponse.ok) {
            throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
        }

        const usersData = await usersResponse.json();
        const user = usersData.users?.find(u => u.email === userEmail);

        if (!user) {
            console.error(`❌ User not found: ${userEmail}`);
            process.exit(1);
        }

        console.log(`✓ Found user: ${user.email} (ID: ${user.id})`);

        // Step 2: Create or update subscription
        console.log('\nStep 2: Creating/updating subscription...');

        const subscriptionData = {
            user_id: user.id,
            stripe_customer_id: 'manual_admin_grant',
            stripe_subscription_id: 'unlimited_access',
            plan: 'business',
            status: 'active',
            current_period_end: '2099-12-31T23:59:59Z',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const subResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/subscriptions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(subscriptionData)
            }
        );

        if (!subResponse.ok) {
            const error = await subResponse.text();
            throw new Error(`Failed to create subscription: ${error}`);
        }

        console.log('✓ Subscription created/updated successfully');

        // Step 3: Verify
        console.log('\nStep 3: Verifying subscription...');

        const verifyResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}&select=*`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        );

        const subscriptions = await verifyResponse.json();
        const subscription = subscriptions[0];

        if (subscription) {
            console.log('\n✅ SUCCESS! Unlimited access granted:');
            console.log(`   Email: ${userEmail}`);
            console.log(`   Plan: ${subscription.plan.toUpperCase()}`);
            console.log(`   Status: ${subscription.status}`);
            console.log(`   Expires: ${subscription.current_period_end}`);
            console.log(`\n🎉 User now has unlimited projects, domains, and storage!`);
        } else {
            console.error('\n⚠️  Warning: Could not verify subscription');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
grantUnlimitedAccess(email);
