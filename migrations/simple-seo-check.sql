-- =====================================================
-- CHECK SIMPLE: SEO sin filtros
-- =====================================================

-- 1. Ver tu user_id
SELECT 'Tu user_id:' as info, auth.uid() as user_id;

-- 2. Ver TODOS los proyectos sin filtro
SELECT
    'Total proyectos (todos):' as info,
    COUNT(*) as total
FROM projects;

-- 3. Ver proyectos con user_id = auth.uid()
SELECT
    'Proyectos con auth.uid():' as info,
    COUNT(*) as total
FROM projects
WHERE user_id = auth.uid();

-- 4. Ver los primeros 3 proyectos sin filtro, con seo_metadata
SELECT
    id,
    name,
    user_id,
    seo_metadata,
    CASE
        WHEN seo_metadata IS NULL THEN 'NULL'
        WHEN seo_metadata::text = '{}' THEN 'VACÍO'
        ELSE 'TIENE DATOS'
    END as estado
FROM projects
LIMIT 3;

-- 5. Verificar si seo_metadata existe como columna
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'seo_metadata';
