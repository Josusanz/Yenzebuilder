-- ================================================
-- YENZE Analytics Setup
-- ================================================
-- Este script crea la tabla analytics_events y configura
-- los permisos necesarios para el sistema de analíticas.
--
-- Instrucciones:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Copia y pega este código completo
-- 4. Haz clic en "Run"
-- ================================================

-- Crear tabla analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read analytics for their projects" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;

-- Política: Los usuarios autenticados pueden leer analytics de sus propios proyectos
CREATE POLICY "Users can read analytics for their projects"
    ON analytics_events FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Política: Cualquiera puede insertar eventos de analytics (necesario para tracking público)
CREATE POLICY "Anyone can insert analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE analytics_events IS 'Almacena eventos de analytics para todos los proyectos publicados';
COMMENT ON COLUMN analytics_events.project_id IS 'ID del proyecto al que pertenece este evento';
COMMENT ON COLUMN analytics_events.event_type IS 'Tipo de evento: page_view, click, etc.';
COMMENT ON COLUMN analytics_events.visitor_id IS 'ID único del visitante (localStorage)';
COMMENT ON COLUMN analytics_events.session_id IS 'ID único de la sesión';
COMMENT ON COLUMN analytics_events.metadata IS 'Datos adicionales en formato JSON';

-- Verificar que todo está correcto
SELECT
    'analytics_events table created successfully!' as message,
    COUNT(*) as total_events
FROM analytics_events;
