-- =====================================================
-- CHECK RÁPIDO: Estado de mensajes
-- =====================================================

-- 1. ¿Cuántos mensajes hay en total?
SELECT 'Total mensajes:' as info, COUNT(*) as total FROM form_submissions;

-- 2. ¿Cuántos proyectos tienes?
SELECT 'Tus proyectos:' as info, COUNT(*) as total FROM projects WHERE user_id = auth.uid();

-- 3. ¿Cuántos mensajes están vinculados a tus proyectos?
SELECT 'Mensajes tuyos:' as info, COUNT(*) as total
FROM form_submissions fs
INNER JOIN projects p ON fs.project_id = p.id
WHERE p.user_id = auth.uid();

-- 4. Ver los últimos 3 mensajes con sus proyectos
SELECT
    fs.id,
    fs.name,
    fs.email,
    fs.subject,
    fs.project_id,
    p.name as project_name,
    p.user_id as project_owner,
    auth.uid() as your_user_id,
    CASE
        WHEN p.user_id = auth.uid() THEN '✅ TUYO'
        WHEN p.user_id IS NULL THEN '❌ SIN PROYECTO'
        ELSE '⚠️ DE OTRO USUARIO'
    END as ownership,
    fs.created_at
FROM form_submissions fs
LEFT JOIN projects p ON fs.project_id = p.id
ORDER BY fs.created_at DESC
LIMIT 3;
