// Check analytics table and data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAnalytics() {
    console.log('🔍 Verificando tabla de analytics...\n');

    try {
        // Check if analytics_events table exists
        const { data: events, error } = await supabase
            .from('analytics_events')
            .select('*')
            .limit(5);

        if (error) {
            console.log('❌ Error al consultar analytics_events:');
            console.log('   Código:', error.code);
            console.log('   Mensaje:', error.message);
            console.log('\n📋 La tabla analytics_events probablemente no existe.');
            console.log('   Necesitas crearla en Supabase con el siguiente SQL:\n');
            console.log(`
CREATE TABLE analytics_events (
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

-- Indexes for better performance
CREATE INDEX idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own analytics
CREATE POLICY "Users can read analytics for their projects"
    ON analytics_events FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy to allow anyone to insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (true);
            `);
            return;
        }

        console.log('✅ Tabla analytics_events existe');
        console.log(`   📊 Eventos encontrados: ${events.length}\n`);

        if (events.length > 0) {
            console.log('Últimos eventos:');
            events.forEach((event, i) => {
                console.log(`\n${i + 1}. Event Type: ${event.event_type}`);
                console.log(`   Project ID: ${event.project_id}`);
                console.log(`   Visitor ID: ${event.visitor_id}`);
                console.log(`   Page URL: ${event.page_url}`);
                console.log(`   Created: ${event.created_at}`);
            });
        } else {
            console.log('⚠️  No hay eventos de analytics todavía.');
            console.log('   Esto es normal si acabas de crear la tabla.');
            console.log('   Los eventos se crearán cuando alguien visite un proyecto publicado.');
        }

        // Check total count
        const { count, error: countError } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`\n📈 Total de eventos en la base de datos: ${count}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAnalytics();
