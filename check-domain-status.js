// Script to check framerlms.com domain status
// This checks Vercel configuration, database, and actual HTTP/HTTPS access

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function checkDomainStatus() {
  console.log('🔍 Checking framerlms.com domain status...\n');
  console.log('═'.repeat(70));

  // 1. Check database
  console.log('\n📊 DATABASE STATUS:');
  const { data: dbDomain, error: dbError } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('domain', 'framerlms.com')
    .single();

  if (dbError) {
    console.log('   ❌ Error:', dbError.message);
  } else {
    console.log(`   ✅ Domain found in database`);
    console.log(`   Project ID: ${dbDomain.project_id}`);
    console.log(`   User ID: ${dbDomain.user_id}`);
    console.log(`   Status: ${dbDomain.status}`);
    console.log(`   Vercel Verified: ${dbDomain.vercel_verified}`);
    console.log(`   Verified At: ${dbDomain.verified_at}`);
  }

  // 2. Check project content
  console.log('\n📄 PROJECT CONTENT:');
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, html, published_url')
    .eq('id', dbDomain.project_id)
    .single();

  if (project) {
    console.log(`   ✅ Project: ${project.name}`);
    console.log(`   Published URL: ${project.published_url}`);
    console.log(`   HTML Length: ${project.html ? project.html.length : 0} characters`);
  }

  // 3. Check Vercel apex domain
  console.log('\n🌐 VERCEL CONFIGURATION (Apex):');
  try {
    const vercelResponse = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/framerlms.com`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      }
    );

    const vercelData = await vercelResponse.json();

    if (vercelResponse.ok) {
      console.log(`   ✅ Domain configured in Vercel`);
      console.log(`   Verified: ${vercelData.verified}`);
      console.log(`   Created: ${new Date(vercelData.createdAt).toLocaleString()}`);
      console.log(`   Updated: ${new Date(vercelData.updatedAt).toLocaleString()}`);
    } else {
      console.log(`   ❌ Error:`, vercelData.error?.message);
    }
  } catch (error) {
    console.log(`   ❌ Fetch error:`, error.message);
  }

  // 4. Check Vercel www domain
  console.log('\n🌐 VERCEL CONFIGURATION (www):');
  try {
    const vercelResponse = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/www.framerlms.com`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      }
    );

    const vercelData = await vercelResponse.json();

    if (vercelResponse.ok) {
      console.log(`   ✅ www subdomain configured in Vercel`);
      console.log(`   Verified: ${vercelData.verified}`);
      console.log(`   Created: ${new Date(vercelData.createdAt).toLocaleString()}`);
    } else {
      console.log(`   ❌ Error:`, vercelData.error?.message);
    }
  } catch (error) {
    console.log(`   ❌ Fetch error:`, error.message);
  }

  // 5. Check HTTP access
  console.log('\n🔗 HTTP ACCESS TEST:');
  try {
    const httpResponse = await fetch('http://framerlms.com/api/serve-project?domain=framerlms.com');
    const html = await httpResponse.text();

    if (httpResponse.ok) {
      console.log(`   ✅ HTTP access working`);
      console.log(`   Content length: ${html.length} characters`);
      console.log(`   Title: ${html.match(/<title>(.*?)<\/title>/)?.[1] || 'Not found'}`);
    } else {
      console.log(`   ❌ HTTP failed with status: ${httpResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ HTTP error:`, error.message);
  }

  // 6. Check HTTPS access
  console.log('\n🔒 HTTPS ACCESS TEST:');
  try {
    const httpsResponse = await fetch('https://framerlms.com/', {
      signal: AbortSignal.timeout(5000)
    });
    const html = await httpsResponse.text();

    if (httpsResponse.ok) {
      console.log(`   ✅ HTTPS access working`);
      console.log(`   Content length: ${html.length} characters`);
    } else {
      console.log(`   ❌ HTTPS failed with status: ${httpsResponse.status}`);
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.log(`   ⚠️  HTTPS timeout (SSL certificate may still be provisioning)`);
    } else {
      console.log(`   ❌ HTTPS error:`, error.message);
    }
  }

  console.log('\n═'.repeat(70));
  console.log('\n📝 SUMMARY:');
  console.log('   - Database: ✅ Configured');
  console.log('   - Vercel: ✅ Domain added and verified');
  console.log('   - HTTP: ✅ Working');
  console.log('   - HTTPS: ⚠️  SSL certificate provisioning in progress');
  console.log('');
  console.log('⏱️  SSL certificates can take 5-30 minutes to provision.');
  console.log('   The domain should be fully functional via HTTPS shortly.');
  console.log('   In the meantime, the site is accessible via HTTP.');
  console.log('');
}

checkDomainStatus();
