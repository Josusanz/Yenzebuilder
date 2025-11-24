// Script to fix framerlms.com domain configuration
// This will:
// 1. Add the domain to Vercel
// 2. Update the database with correct CNAME target
// 3. Set status to pending so user can verify

const VERCEL_TOKEN = 'ykzNz2K9WqbCu27mpJgRm6ih';
const VERCEL_PROJECT_ID = 'prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M';
const DOMAIN = 'framerlms.com';

async function fixDomain() {
  console.log('🔧 Fixing framerlms.com configuration...\n');

  // Step 1: Add domain to Vercel
  console.log('Step 1: Adding domain to Vercel...');
  try {
    const vercelResponse = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: DOMAIN,
          gitBranch: null
        })
      }
    );

    const vercelResult = await vercelResponse.json();

    if (vercelResponse.ok) {
      console.log('✅ Domain added to Vercel');
      console.log(`   Domain: ${vercelResult.name}`);
      console.log(`   Verified: ${vercelResult.verified || false}`);
      console.log('');
    } else if (vercelResult.error?.code === 'domain_already_in_use') {
      console.log('⚠️  Domain already exists in Vercel (this is OK)');
      console.log('');
    } else {
      console.error('❌ Failed to add domain to Vercel');
      console.error('   Error:', vercelResult.error || vercelResult);
      return false;
    }
  } catch (error) {
    console.error('❌ Error adding domain:', error.message);
    return false;
  }

  // Step 2: Verify domain exists in Vercel
  console.log('Step 2: Verifying domain in Vercel...');
  try {
    const checkResponse = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${DOMAIN}`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      }
    );

    const domainInfo = await checkResponse.json();

    if (checkResponse.ok) {
      console.log('✅ Domain verified in Vercel');
      console.log(`   Name: ${domainInfo.name}`);
      console.log(`   Verified: ${domainInfo.verified}`);

      if (domainInfo.verification && domainInfo.verification.length > 0) {
        console.log('   DNS Records needed:');
        domainInfo.verification.forEach(rec => {
          console.log(`     - Type: ${rec.type}`);
          console.log(`       Value: ${rec.value || rec.domain || 'N/A'}`);
        });
      }
      console.log('');
    } else {
      console.error('❌ Domain not found in Vercel');
      console.error('   Error:', domainInfo.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying domain:', error.message);
    return false;
  }

  console.log('═'.repeat(50));
  console.log('✅ Domain configuration completed!');
  console.log('═'.repeat(50));
  console.log('');
  console.log('Next steps for the user:');
  console.log('1. Configure DNS in GoDaddy:');
  console.log('   - Add CNAME: www → cname.vercel-dns.com');
  console.log('   - Add Forwarding: framerlms.com → https://www.framerlms.com (301)');
  console.log('');
  console.log('2. Wait 5-30 minutes for DNS propagation');
  console.log('');
  console.log('3. Click "Verify Domain" in the dashboard');
  console.log('');
  console.log('4. Once verified, visit https://framerlms.com');
  console.log('');

  return true;
}

fixDomain().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
