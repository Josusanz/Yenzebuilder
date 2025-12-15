#!/usr/bin/env node

/**
 * Check YENZE 2.0 Migration Status
 * Verifies if all required tables exist in Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    console.error('Make sure you have a .env file with these variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') {
                return { exists: false, count: 0, error: 'Table does not exist' };
            }
            return { exists: false, count: 0, error: error.message };
        }

        return { exists: true, count: data?.length || 0, error: null };
    } catch (err) {
        return { exists: false, count: 0, error: err.message };
    }
}

async function checkMigrationStatus() {
    console.log('🔍 Checking YENZE 2.0 Migration Status...\n');

    const tables = [
        'user_components',
        'analytics_sessions',
        'analytics_events'
    ];

    const results = [];

    for (const table of tables) {
        process.stdout.write(`Checking ${table}... `);
        const result = await checkTable(table);
        results.push({ table, ...result });

        if (result.exists) {
            console.log(`✅ EXISTS`);
        } else {
            console.log(`❌ MISSING`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION STATUS SUMMARY');
    console.log('='.repeat(60) + '\n');

    let allExist = true;

    results.forEach(({ table, exists, count, error }) => {
        const status = exists ? '✅' : '❌';
        const info = exists ? `${count} rows` : error;
        console.log(`${status} ${table.padEnd(25)} ${info}`);
        if (!exists) allExist = false;
    });

    console.log('\n' + '='.repeat(60));

    if (allExist) {
        console.log('✅ All tables exist! Migration is complete.\n');
        console.log('You can now use YENZE 2.0 features:');
        console.log('  - Component Library');
        console.log('  - Enhanced Analytics');
        console.log('  - Session Tracking\n');
    } else {
        console.log('❌ Some tables are missing. Migration needed.\n');
        console.log('To fix this:');
        console.log('  1. Open Supabase Dashboard → SQL Editor');
        console.log('  2. Run: migrations/v2-tables-migration.sql');
        console.log('  3. Run this script again to verify\n');
    }

    return allExist;
}

// Run the check
checkMigrationStatus()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
