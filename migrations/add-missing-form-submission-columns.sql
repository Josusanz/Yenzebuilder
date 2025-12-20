-- =====================================================
-- FIX: Agregar columnas faltantes a form_submissions
-- =====================================================
-- Este script agrega las columnas que faltan en la tabla
-- form_submissions que ya existe
-- =====================================================

-- 1. Verificar qué columnas existen actualmente
SELECT
    'Columnas actuales en form_submissions:' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'form_submissions'
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes (solo si no existen)

-- Agregar site_url
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'site_url'
    ) THEN
        ALTER TABLE form_submissions ADD COLUMN site_url TEXT;
        RAISE NOTICE '✅ Column site_url added';
    ELSE
        RAISE NOTICE 'ℹ️  Column site_url already exists';
    END IF;
END $$;

-- Agregar ip_address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE form_submissions ADD COLUMN ip_address TEXT;
        RAISE NOTICE '✅ Column ip_address added';
    ELSE
        RAISE NOTICE 'ℹ️  Column ip_address already exists';
    END IF;
END $$;

-- Agregar user_agent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE form_submissions ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Column user_agent added';
    ELSE
        RAISE NOTICE 'ℹ️  Column user_agent already exists';
    END IF;
END $$;

-- Agregar custom_fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'custom_fields'
    ) THEN
        ALTER TABLE form_submissions ADD COLUMN custom_fields JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE '✅ Column custom_fields added';
    ELSE
        RAISE NOTICE 'ℹ️  Column custom_fields already exists';
    END IF;
END $$;

-- Verificar si is_read existe o si está como 'read'
DO $$
DECLARE
    has_is_read BOOLEAN;
    has_read BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'is_read'
    ) INTO has_is_read;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'form_submissions' AND column_name = 'read'
    ) INTO has_read;

    IF has_read AND NOT has_is_read THEN
        -- Renombrar 'read' a 'is_read'
        ALTER TABLE form_submissions RENAME COLUMN "read" TO is_read;
        RAISE NOTICE '✅ Column renamed from "read" to "is_read"';
    ELSIF NOT has_is_read AND NOT has_read THEN
        -- Agregar is_read si no existe ninguna
        ALTER TABLE form_submissions ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Column is_read added';
    ELSE
        RAISE NOTICE 'ℹ️  Column is_read already exists';
    END IF;
END $$;

-- 3. Verificar columnas después del fix
SELECT
    'Columnas después del fix:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'form_submissions'
ORDER BY ordinal_position;

-- 4. Recrear índices si no existen
CREATE INDEX IF NOT EXISTS idx_form_submissions_is_read ON form_submissions(is_read);

-- 5. Verificación final
DO $$
DECLARE
    required_columns TEXT[] := ARRAY['id', 'project_id', 'name', 'email', 'phone', 'subject', 'message', 'custom_fields', 'site_url', 'ip_address', 'user_agent', 'is_read', 'created_at'];
    existing_columns TEXT[];
    missing_columns TEXT[];
    col TEXT;
BEGIN
    -- Obtener columnas existentes
    SELECT ARRAY_AGG(column_name)
    INTO existing_columns
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions';

    -- Encontrar columnas faltantes
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT (col = ANY(existing_columns)) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL';
    RAISE NOTICE '========================================';

    IF missing_columns IS NULL OR array_length(missing_columns, 1) IS NULL THEN
        RAISE NOTICE '✅ TODAS LAS COLUMNAS NECESARIAS ESTÁN PRESENTES';
        RAISE NOTICE '   Total de columnas: %', array_length(existing_columns, 1);
    ELSE
        RAISE WARNING '⚠️  FALTAN COLUMNAS: %', array_to_string(missing_columns, ', ');
    END IF;

    RAISE NOTICE '========================================';
END $$;
