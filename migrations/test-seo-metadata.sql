-- =====================================================
-- VERIFICAR: Sistema de SEO
-- =====================================================

-- 1. Verificar que la columna seo_metadata existe
SELECT
    'Columna seo_metadata existe:' as check,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'projects' AND column_name = 'seo_metadata'
        ) THEN '✅ SÍ'
        ELSE '❌ NO'
    END as result;

-- 2. Ver proyectos con sus datos SEO
SELECT
    id,
    name,
    subdomain_slug,
    seo_metadata,
    CASE
        WHEN seo_metadata IS NULL THEN '⚠️ NULL'
        WHEN seo_metadata = '{}'::jsonb THEN '⚠️ VACÍO'
        ELSE '✅ TIENE DATOS'
    END as seo_status
FROM projects
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- 3. Contar proyectos por estado de SEO
SELECT
    'Proyectos por estado SEO:' as info,
    COUNT(*) FILTER (WHERE seo_metadata IS NULL) as sin_seo_metadata,
    COUNT(*) FILTER (WHERE seo_metadata = '{}'::jsonb) as seo_vacio,
    COUNT(*) FILTER (WHERE seo_metadata != '{}'::jsonb AND seo_metadata IS NOT NULL) as con_datos_seo,
    COUNT(*) as total
FROM projects
WHERE user_id = auth.uid();

-- 4. Prueba: Actualizar SEO de un proyecto
UPDATE projects
SET seo_metadata = jsonb_build_object(
    'audit_score', 85,
    'last_audit', NOW()::text,
    'sitemap_generated', true,
    'test', 'SEO funcionando correctamente'
)
WHERE user_id = auth.uid()
AND id = (SELECT id FROM projects WHERE user_id = auth.uid() LIMIT 1)
RETURNING id, name, seo_metadata;

-- 5. Verificar que se guardó correctamente
SELECT
    'Verificación final:' as check,
    id,
    name,
    seo_metadata->>'audit_score' as audit_score,
    seo_metadata->>'test' as test_message,
    seo_metadata
FROM projects
WHERE user_id = auth.uid()
AND seo_metadata IS NOT NULL
AND seo_metadata != '{}'::jsonb
LIMIT 1;
