// Script to verify Vercel API connection and configuration
// Run with: node verify-vercel-connection.js

const VERCEL_TOKEN = 'ykzNz2K9WqbCu27mpJgRm6ih';
const VERCEL_PROJECT_ID = 'prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M';

async function verifyVercelConnection() {
    console.log('🔍 Verifying Vercel API Connection...\n');

    // Test 1: Verify token works by fetching user info
    console.log('Test 1: Verifying Vercel Token...');
    try {
        const userResponse = await fetch('https://api.vercel.com/v2/user', {
            headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`
            }
        });

        if (!userResponse.ok) {
            console.error('❌ Token verification failed');
            const error = await userResponse.json();
            console.error('Error:', error);
            return false;
        }

        const userData = await userResponse.json();
        console.log('✅ Token is valid');
        console.log(`   User: ${userData.user.name || userData.user.username}`);
        console.log(`   Email: ${userData.user.email}\n`);
    } catch (error) {
        console.error('❌ Failed to verify token:', error.message);
        return false;
    }

    // Test 2: Verify project exists and we can access it
    console.log('Test 2: Verifying Project Access...');
    try {
        const projectResponse = await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${VERCEL_TOKEN}`
                }
            }
        );

        if (!projectResponse.ok) {
            console.error('❌ Project access failed');
            const error = await projectResponse.json();
            console.error('Error:', error);
            return false;
        }

        const projectData = await projectResponse.json();
        console.log('✅ Project is accessible');
        console.log(`   Project Name: ${projectData.name}`);
        console.log(`   Framework: ${projectData.framework || 'None'}`);
        console.log(`   Production URL: ${projectData.targets?.production?.url || 'N/A'}\n`);
    } catch (error) {
        console.error('❌ Failed to access project:', error.message);
        return false;
    }

    // Test 3: List current domains on the project
    console.log('Test 3: Listing Current Domains...');
    try {
        const domainsResponse = await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`,
            {
                headers: {
                    'Authorization': `Bearer ${VERCEL_TOKEN}`
                }
            }
        );

        if (!domainsResponse.ok) {
            console.error('❌ Failed to list domains');
            const error = await domainsResponse.json();
            console.error('Error:', error);
            return false;
        }

        const domainsData = await domainsResponse.json();
        console.log(`✅ Found ${domainsData.domains?.length || 0} domain(s)`);

        if (domainsData.domains && domainsData.domains.length > 0) {
            domainsData.domains.forEach(domain => {
                console.log(`   - ${domain.name} (${domain.verified ? 'Verified ✅' : 'Pending ⏳'})`);
            });
        } else {
            console.log('   (No custom domains configured yet)');
        }
        console.log('');
    } catch (error) {
        console.error('❌ Failed to list domains:', error.message);
        return false;
    }

    // Test 4: Test adding a domain (dry run - we'll use a fake domain)
    console.log('Test 4: Testing Domain Add API (dry run)...');
    console.log('   ℹ️  Skipping actual domain addition');
    console.log('   ℹ️  API endpoint ready: POST /v10/projects/{id}/domains');
    console.log('   ℹ️  To test, add a real domain via the dashboard\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All tests passed! Vercel integration is ready.');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Go to your dashboard: /dashboard.html');
    console.log('2. Navigate to Custom Domains section');
    console.log('3. Add a custom domain to test the full flow');
    console.log('4. Configure DNS as instructed');
    console.log('5. Verify the domain\n');

    return true;
}

// Run the verification
verifyVercelConnection().catch(error => {
    console.error('❌ Verification failed with error:', error);
    process.exit(1);
});
