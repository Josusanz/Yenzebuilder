-- Check if YENZE 2.0 tables exist in Supabase
-- Run this in Supabase SQL Editor to verify migration status

-- Check for user_components table
SELECT
    'user_components' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_components'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Need to create'
    END as status,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_components'
        ) THEN (
            SELECT count(*)::text || ' rows'
            FROM user_components
        )
        ELSE 'N/A'
    END as row_count

UNION ALL

-- Check for analytics_sessions table
SELECT
    'analytics_sessions' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_sessions'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Need to create'
    END as status,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_sessions'
        ) THEN (
            SELECT count(*)::text || ' rows'
            FROM analytics_sessions
        )
        ELSE 'N/A'
    END as row_count

UNION ALL

-- Check for analytics_events table (already exists, checking)
SELECT
    'analytics_events' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_events'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Need to create'
    END as status,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_events'
        ) THEN (
            SELECT count(*)::text || ' rows'
            FROM analytics_events
        )
        ELSE 'N/A'
    END as row_count

ORDER BY table_name;

-- Check RLS policies
SELECT
    'RLS Policies Check' as info,
    tablename as table_name,
    policyname as policy_name,
    CASE
        WHEN cmd = 'SELECT' THEN '🔍 SELECT'
        WHEN cmd = 'INSERT' THEN '➕ INSERT'
        WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
        WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
        ELSE cmd
    END as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events')
ORDER BY tablename, cmd;
