-- =====================================================
-- VERIFICAR: Usuario actual y proyectos
-- =====================================================

-- 1. Ver tu user_id actual
SELECT 'Tu user_id:' as info, auth.uid() as user_id;

-- 2. Ver TODOS los proyectos (sin filtro de usuario)
SELECT 'Total proyectos en la DB (de todos los usuarios):' as info, COUNT(*) as total FROM projects;

-- 3. Ver los últimos 5 proyectos con sus dueños
SELECT
    id,
    user_id,
    name,
    subdomain_slug,
    public_slug,
    created_at,
    CASE
        WHEN user_id = auth.uid() THEN '✅ TUYO'
        ELSE '❌ DE OTRO USUARIO'
    END as ownership
FROM projects
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar si tu usuario existe en auth.users
SELECT
    'Tu información de usuario:' as info,
    id,
    email,
    created_at
FROM auth.users
WHERE id = auth.uid();
