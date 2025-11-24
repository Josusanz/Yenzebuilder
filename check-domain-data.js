// Check what data is stored for framerlms.com in database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDomain() {
  console.log('🔍 Checking framerlms.com data in database...\n');

  const { data, error } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('domain', 'framerlms.com')
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data) {
    console.log('⚠️  Domain not found in database');
    return;
  }

  console.log('✅ Domain found:');
  console.log('─'.repeat(50));
  console.log('Domain:', data.domain);
  console.log('Status:', data.status);
  console.log('CNAME Target:', data.cname_target);
  console.log('Vercel Verified:', data.vercel_verified);
  console.log('Verification Record:', JSON.stringify(data.verification_record, null, 2));
  console.log('─'.repeat(50));
  console.log('\n📋 Expected CNAME target should be:');
  console.log('   prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M.vercel.app');
  console.log('\n💡 If CNAME target is wrong, update it with:');
  console.log(`
UPDATE custom_domains
SET cname_target = 'prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M.vercel.app'
WHERE domain = 'framerlms.com';
  `);
}

checkDomain();
