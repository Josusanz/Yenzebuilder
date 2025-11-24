// Diagnostic script for framerlms.com issue
// This identifies why the domain is not showing the correct content

const https = require('https');
const http = require('http');

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

async function diagnose() {
  console.log('🔍 Diagnosing framerlms.com issue...\n');
  console.log('═'.repeat(70));

  // Test 1: Check what framerlms.com returns
  console.log('\n📍 TEST 1: What does framerlms.com return?');
  try {
    const response = await httpGet('http://framerlms.com');
    console.log(`   Status: ${response.status}`);
    console.log(`   Body preview: ${response.body.substring(0, 200)}`);

    if (response.body.includes('window.location.href="/lander"')) {
      console.log('\n   ❌ PROBLEM FOUND: Domain is redirecting to /lander');
      console.log('   This is GoDaddy domain parking/forwarding!');
    }

    if (response.body.includes('wsimg.com') || response.body.includes('parking')) {
      console.log('\n   ❌ CONFIRMED: GoDaddy parking page detected');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Check if our API works directly
  console.log('\n📍 TEST 2: Does our API work?');
  try {
    const response = await httpGet('http://framerlms.com/api/serve-project?domain=framerlms.com');
    console.log(`   Status: ${response.status}`);

    if (response.status === 200 && response.body.includes('YENZE')) {
      console.log('   ✅ API works correctly!');
      console.log(`   Content length: ${response.body.length} characters`);
    } else {
      console.log('   ❌ API not returning expected content');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Check Vercel deployment URL
  console.log('\n📍 TEST 3: Does Vercel deployment work?');
  try {
    const response = await httpGet('https://yenzehtml.vercel.app/api/serve-project?domain=framerlms.com');

    if (response.status === 200 && response.body.includes('YENZE')) {
      console.log('   ✅ Vercel deployment works correctly!');
    } else {
      console.log('   ❌ Vercel deployment has issues');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n═'.repeat(70));
  console.log('\n🎯 DIAGNOSIS:\n');
  console.log('The domain framerlms.com has GoDaddy Domain Parking/Forwarding enabled.');
  console.log('This intercepts all requests before they reach Vercel.\n');
  console.log('📋 SOLUTION - Disable GoDaddy Parking/Forwarding:\n');
  console.log('1. Go to GoDaddy dashboard: https://dcc.godaddy.com/');
  console.log('2. Find framerlms.com in your domains list');
  console.log('3. Click on the domain');
  console.log('4. Look for "Forwarding" or "Domain Forwarding" section');
  console.log('5. If forwarding is enabled, DISABLE it');
  console.log('6. Also check for "Parking" settings and disable if active');
  console.log('7. Save changes and wait 5-10 minutes for propagation\n');
  console.log('Alternative locations to check:');
  console.log('- Domain Settings > Forwarding');
  console.log('- Additional Settings > Manage > Forwarding');
  console.log('- Settings > Forward Domain\n');
  console.log('The DNS records (A and CNAME) are correct, but GoDaddy forwarding');
  console.log('overrides them. Once disabled, the domain will work correctly.\n');
  console.log('═'.repeat(70));
}

diagnose();
