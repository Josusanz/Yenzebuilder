-- =====================================================
-- MIGRATION: Fix Missing Columns and Tables
-- =====================================================
-- Este script agrega de forma segura las columnas y tablas faltantes
-- sin borrar ningún dato existente.
--
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto de Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega TODO este archivo
-- 4. Ejecuta el script
-- =====================================================

-- =====================================================
-- 1. AGREGAR COLUMNAS FALTANTES A LA TABLA PROJECTS
-- =====================================================

-- Agregar subdomain_slug (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'subdomain_slug'
    ) THEN
        ALTER TABLE projects ADD COLUMN subdomain_slug TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_projects_subdomain_slug ON projects(subdomain_slug);
        RAISE NOTICE 'Column subdomain_slug added to projects table';
    ELSE
        RAISE NOTICE 'Column subdomain_slug already exists in projects table';
    END IF;
END $$;

-- Agregar public_slug (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'public_slug'
    ) THEN
        ALTER TABLE projects ADD COLUMN public_slug TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_projects_public_slug ON projects(public_slug);
        RAISE NOTICE 'Column public_slug added to projects table';
    ELSE
        RAISE NOTICE 'Column public_slug already exists in projects table';
    END IF;
END $$;

-- Agregar seo_metadata (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'seo_metadata'
    ) THEN
        ALTER TABLE projects ADD COLUMN seo_metadata JSONB DEFAULT '{}'::jsonb;
        CREATE INDEX IF NOT EXISTS idx_projects_seo_metadata ON projects USING GIN (seo_metadata);
        RAISE NOTICE 'Column seo_metadata added to projects table';
    ELSE
        RAISE NOTICE 'Column seo_metadata already exists in projects table';
    END IF;
END $$;

-- =====================================================
-- 2. AGREGAR COLUMNAS FALTANTES A LA TABLA PROFILES
-- =====================================================

-- Agregar plan (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'plan'
    ) THEN
        ALTER TABLE profiles ADD COLUMN plan VARCHAR(20) DEFAULT 'free';
        RAISE NOTICE 'Column plan added to profiles table';
    ELSE
        RAISE NOTICE 'Column plan already exists in profiles table';
    END IF;
END $$;

-- Agregar email (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Column email added to profiles table';
    ELSE
        RAISE NOTICE 'Column email already exists in profiles table';
    END IF;
END $$;

-- =====================================================
-- 3. CREAR TABLA FORM_SUBMISSIONS (si no existe)
-- =====================================================

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT DEFAULT 'New Contact Form Submission',
    message TEXT NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    site_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para form_submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_project_id ON form_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_is_read ON form_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Habilitar RLS para form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. POLÍTICAS DE SEGURIDAD PARA FORM_SUBMISSIONS
-- =====================================================

-- Eliminar políticas existentes si existen (para recrearlas limpias)
DROP POLICY IF EXISTS "Anyone can insert form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users can view own project submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users can update own project submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users can delete own project submissions" ON form_submissions;

-- Permitir a cualquiera insertar envíos (desde sitios web públicos)
CREATE POLICY "Anyone can insert form submissions"
    ON form_submissions FOR INSERT
    WITH CHECK (true);

-- Los usuarios pueden ver envíos de sus propios proyectos
CREATE POLICY "Users can view own project submissions"
    ON form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar (marcar como leído) envíos de sus propios proyectos
CREATE POLICY "Users can update own project submissions"
    ON form_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Los usuarios pueden eliminar envíos de sus propios proyectos
CREATE POLICY "Users can delete own project submissions"
    ON form_submissions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = form_submissions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas existen
DO $$
DECLARE
    tables_exist BOOLEAN;
    projects_columns INTEGER;
    profiles_columns INTEGER;
    form_submissions_columns INTEGER;
BEGIN
    -- Contar columnas en projects
    SELECT COUNT(*) INTO projects_columns
    FROM information_schema.columns
    WHERE table_name = 'projects'
    AND column_name IN ('subdomain_slug', 'public_slug', 'seo_metadata');

    -- Contar columnas en profiles
    SELECT COUNT(*) INTO profiles_columns
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name IN ('plan', 'email');

    -- Contar columnas en form_submissions
    SELECT COUNT(*) INTO form_submissions_columns
    FROM information_schema.columns
    WHERE table_name = 'form_submissions'
    AND column_name IN ('is_read', 'custom_fields', 'site_url');

    -- Mostrar resultados
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Projects table: % columns added/verified', projects_columns;
    RAISE NOTICE 'Profiles table: % columns added/verified', profiles_columns;
    RAISE NOTICE 'Form submissions table: % columns verified', form_submissions_columns;
    RAISE NOTICE '========================================';

    IF projects_columns >= 3 AND profiles_columns >= 2 AND form_submissions_columns >= 3 THEN
        RAISE NOTICE 'STATUS: ✅ ALL COLUMNS AND TABLES ARE READY';
    ELSE
        RAISE WARNING 'STATUS: ⚠️ Some columns may be missing. Please review.';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- DONE!
-- =====================================================
-- Tus tablas y columnas están ahora actualizadas.
-- El sistema de mensajes y SEO deberían funcionar correctamente.
-- =====================================================
