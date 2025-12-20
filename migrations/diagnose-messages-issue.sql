-- =====================================================
-- DIAGNÓSTICO: Por qué no aparecen los mensajes
-- =====================================================
-- Este script te ayudará a entender exactamente qué está pasando
-- Copia el resultado y compártelo para obtener ayuda
-- =====================================================

-- 1. Verificar que la tabla form_submissions existe
SELECT
    '1. ¿Existe la tabla form_submissions?' as check_description,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'form_submissions'
        ) THEN '✅ SÍ - La tabla existe'
        ELSE '❌ NO - La tabla NO existe (este es el problema)'
    END as result;

-- 2. Ver todas las columnas de form_submissions
SELECT
    '2. Columnas en form_submissions:' as check_description,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'form_submissions'
ORDER BY ordinal_position;

-- 3. Contar mensajes totales en la tabla
SELECT
    '3. ¿Cuántos mensajes hay en total?' as check_description,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
    COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages
FROM form_submissions;

-- 4. Ver los últimos 5 mensajes (si existen)
SELECT
    '4. Últimos 5 mensajes:' as info,
    id,
    name,
    email,
    subject,
    LEFT(message, 50) as message_preview,
    project_id,
    is_read,
    created_at
FROM form_submissions
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar políticas RLS
SELECT
    '5. Políticas RLS en form_submissions:' as check_description,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'form_submissions';

-- 6. Verificar si RLS está habilitado
SELECT
    '6. ¿RLS está habilitado?' as check_description,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'form_submissions';

-- 7. Verificar proyectos del usuario actual
SELECT
    '7. Tus proyectos (para verificar project_id):' as info,
    id,
    name,
    subdomain_slug,
    public_slug,
    created_at
FROM projects
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 8. Verificar mensajes vinculados a tus proyectos
SELECT
    '8. Mensajes vinculados a TUS proyectos:' as info,
    fs.id,
    fs.name as sender_name,
    fs.email,
    fs.subject,
    p.name as project_name,
    p.id as project_id,
    fs.created_at
FROM form_submissions fs
LEFT JOIN projects p ON fs.project_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY fs.created_at DESC;

-- 9. Verificar mensajes huérfanos (sin proyecto asociado)
SELECT
    '9. Mensajes sin proyecto asociado (huérfanos):' as info,
    COUNT(*) as orphan_messages
FROM form_submissions
WHERE project_id IS NULL;

-- 10. Ver mensajes huérfanos en detalle
SELECT
    '10. Detalle de mensajes huérfanos:' as info,
    id,
    name,
    email,
    subject,
    created_at
FROM form_submissions
WHERE project_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- RESUMEN Y DIAGNÓSTICO
-- =====================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    total_messages INTEGER;
    user_projects INTEGER;
    user_messages INTEGER;
    orphan_messages INTEGER;
BEGIN
    -- Verificar tabla
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'form_submissions'
    ) INTO table_exists;

    -- Contar mensajes
    IF table_exists THEN
        SELECT COUNT(*) INTO total_messages FROM form_submissions;
        SELECT COUNT(*) INTO orphan_messages FROM form_submissions WHERE project_id IS NULL;
    ELSE
        total_messages := 0;
        orphan_messages := 0;
    END IF;

    -- Contar proyectos del usuario
    SELECT COUNT(*) INTO user_projects FROM projects WHERE user_id = auth.uid();

    -- Contar mensajes del usuario
    IF table_exists THEN
        SELECT COUNT(*) INTO user_messages
        FROM form_submissions fs
        INNER JOIN projects p ON fs.project_id = p.id
        WHERE p.user_id = auth.uid();
    ELSE
        user_messages := 0;
    END IF;

    -- Mostrar diagnóstico
    RAISE NOTICE '========================================';
    RAISE NOTICE '        DIAGNÓSTICO COMPLETO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    IF NOT table_exists THEN
        RAISE NOTICE '❌ PROBLEMA CRÍTICO: La tabla form_submissions NO EXISTE';
        RAISE NOTICE '   → Ejecuta el script de migración nuevamente';
    ELSE
        RAISE NOTICE '✅ La tabla form_submissions existe';
        RAISE NOTICE '   Total de mensajes en la tabla: %', total_messages;
        RAISE NOTICE '   Mensajes huérfanos (sin project_id): %', orphan_messages;
        RAISE NOTICE '';
        RAISE NOTICE 'Tu información:';
        RAISE NOTICE '   Proyectos que tienes: %', user_projects;
        RAISE NOTICE '   Mensajes vinculados a tus proyectos: %', user_messages;
        RAISE NOTICE '';

        IF user_messages = 0 AND total_messages > 0 THEN
            RAISE NOTICE '⚠️  PROBLEMA: Hay mensajes en la tabla pero NINGUNO está vinculado a tus proyectos';
            RAISE NOTICE '   → Posibles causas:';
            RAISE NOTICE '      1. Los mensajes tienen project_id NULL (huérfanos)';
            RAISE NOTICE '      2. Los mensajes están vinculados a proyectos de otro usuario';
            RAISE NOTICE '      3. Problema con las políticas RLS';
        ELSIF user_messages = 0 AND total_messages = 0 THEN
            RAISE NOTICE 'ℹ️  No hay mensajes en la base de datos todavía';
            RAISE NOTICE '   → Prueba enviando un mensaje desde tu sitio publicado';
        ELSE
            RAISE NOTICE '✅ Tienes % mensajes vinculados correctamente', user_messages;
            RAISE NOTICE '   → Si no los ves en el dashboard, el problema está en el frontend';
        END IF;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
