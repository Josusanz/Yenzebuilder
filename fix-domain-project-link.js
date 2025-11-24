// Script to fix framerlms.com domain-project relationship
// This will check and update the project_id in custom_domains table

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDomainProjectLink() {
  console.log('🔧 Fixing framerlms.com domain-project relationship...\n');

  try {
    // Step 1: Get the user ID
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    // Find user with email j.sanzuriz@gmail.com
    const targetUser = user.users.find(u => u.email === 'j.sanzuriz@gmail.com');

    if (!targetUser) {
      console.error('❌ User not found');
      return;
    }

    const userId = targetUser.id;
    console.log(`✅ Found user: ${targetUser.email}`);
    console.log(`   User ID: ${userId}\n`);

    // Step 2: Get all projects for this user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }

    console.log(`📦 Projects found (${projects.length}):`);
    projects.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (ID: ${p.id})`);
    });
    console.log('');

    // Step 3: Get framerlms.com domain info
    const { data: domain, error: domainError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('domain', 'framerlms.com')
      .single();

    if (domainError) {
      console.error('❌ Error fetching domain:', domainError);
      return;
    }

    console.log('🌐 Current domain configuration:');
    console.log(`   Domain: ${domain.domain}`);
    console.log(`   Project ID: ${domain.project_id}`);
    console.log(`   Status: ${domain.status}`);
    console.log(`   User ID: ${domain.user_id}`);
    console.log('');

    // Check if project_id matches any of the user's projects
    const linkedProject = projects.find(p => p.id === domain.project_id);

    if (linkedProject) {
      console.log(`✅ Domain is correctly linked to project: ${linkedProject.name}`);
      return;
    }

    console.log('⚠️  Domain is NOT linked to any of the user\'s projects!');
    console.log('');

    // Step 4: Link to the "Yenze" project (or first project if Yenze not found)
    const yenzeProject = projects.find(p => p.name === 'Yenze') || projects[0];

    if (!yenzeProject) {
      console.error('❌ No projects found to link');
      return;
    }

    console.log(`🔗 Linking framerlms.com to project: ${yenzeProject.name}`);
    console.log(`   New Project ID: ${yenzeProject.id}\n`);

    // Update the custom_domains table
    const { data: updated, error: updateError } = await supabase
      .from('custom_domains')
      .update({
        project_id: yenzeProject.id,
        user_id: userId  // Also ensure user_id is correct
      })
      .eq('domain', 'framerlms.com')
      .select();

    if (updateError) {
      console.error('❌ Error updating domain:', updateError);
      return;
    }

    console.log('✅ Domain successfully updated!');
    console.log('');
    console.log('Updated record:', updated[0]);
    console.log('');
    console.log('═'.repeat(60));
    console.log('✅ Fix completed successfully!');
    console.log('═'.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Refresh the dashboard (Ctrl+Shift+R)');
    console.log('2. Check that the "Yenze" project now shows:');
    console.log('   - Plan: "starter" (not "free")');
    console.log('   - URL: "framerlms.com"');
    console.log('   - Badge: "🌐 CUSTOM DOMAIN"');
    console.log('');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixDomainProjectLink();
