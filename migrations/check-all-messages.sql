-- =====================================================
-- VER TODOS LOS MENSAJES (sin filtro RLS)
-- =====================================================
-- Este script ignora temporalmente RLS para ver TODOS los mensajes

-- 1. Ver TODOS los mensajes sin filtro
SELECT
    'TODOS los mensajes (incluyendo huérfanos):' as info,
    COUNT(*) as total
FROM form_submissions;

-- 2. Ver los últimos 10 mensajes con detalles
SELECT
    fs.id,
    fs.name,
    fs.email,
    fs.subject,
    fs.project_id,
    fs.site_url,
    fs.created_at,
    p.name as project_name,
    CASE
        WHEN fs.project_id IS NULL THEN '❌ HUÉRFANO (sin project_id)'
        WHEN p.id IS NULL THEN '⚠️ PROJECT_ID INVÁLIDO (proyecto no existe)'
        WHEN p.user_id = auth.uid() THEN '✅ TUYO Y VÁLIDO'
        ELSE '⚠️ DE OTRO USUARIO'
    END as status
FROM form_submissions fs
LEFT JOIN projects p ON fs.project_id = p.id
ORDER BY fs.created_at DESC
LIMIT 10;

-- 3. Contar mensajes por estado
SELECT
    'Mensajes por estado:' as info,
    COUNT(*) FILTER (WHERE project_id IS NULL) as huerfanos,
    COUNT(*) FILTER (WHERE project_id IS NOT NULL) as con_proyecto,
    COUNT(*) as total
FROM form_submissions;
