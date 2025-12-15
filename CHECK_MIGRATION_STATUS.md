# ✅ Verificar Estado de Migración YENZE 2.0

## 📋 Tablas Requeridas

Para YENZE 2.0 necesitas estas 3 tablas:

1. ✅ **user_components** - Biblioteca de componentes reutilizables
2. ✅ **analytics_sessions** - Seguimiento de sesiones de usuario
3. ✅ **analytics_events** - Eventos de analytics mejorados

---

## 🔍 Método 1: Verificación Manual (Supabase Dashboard)

### Paso 1: Abrir Supabase Dashboard
1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto YENZE
3. Ve a **Table Editor** (en el menú lateral)

### Paso 2: Buscar las tablas
Verifica si existen estas tablas:
- [ ] `user_components`
- [ ] `analytics_sessions`
- [ ] `analytics_events`

### Paso 3: Verificar estructura
Si las tablas existen, verifica que tengan estas columnas:

**user_components:**
- id (text)
- user_id (uuid)
- name (text)
- category (text)
- html (text)
- thumbnail (text)
- tags (text[])
- created_at (timestamptz)
- updated_at (timestamptz)

**analytics_sessions:**
- id (uuid)
- project_id (uuid)
- session_id (text)
- user_agent (text)
- device (text)
- referrer (text)
- started_at (timestamptz)
- ended_at (timestamptz)
- duration (integer)
- page_count (integer)
- is_bounce (boolean)

**analytics_events:**
- id (uuid)
- project_id (uuid)
- session_id (text)
- event_type (text)
- event_data (jsonb)
- timestamp (timestamptz)

---

## 🔍 Método 2: SQL Query (Rápido)

### Opción A: Usando SQL Editor de Supabase

1. Ve a **SQL Editor** en Supabase Dashboard
2. Pega este código:

\`\`\`sql
-- Quick check for YENZE 2.0 tables
SELECT
    'user_components' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_components'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT
    'analytics_sessions' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_sessions'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT
    'analytics_events' as table_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'analytics_events'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;
\`\`\`

3. Click **Run**
4. Verás el estado de cada tabla

### Resultado Esperado:

\`\`\`
table_name            | status
---------------------|----------
user_components      | ✅ EXISTS
analytics_sessions   | ✅ EXISTS
analytics_events     | ✅ EXISTS
\`\`\`

---

## 🔍 Método 3: Script Automático (Avanzado)

### Requisitos:
- Tener archivo `.env` configurado con:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Ejecutar:

\`\`\`bash
# Verificar estado
node scripts/check-v2-migration.js
\`\`\`

### Salida esperada si todo está OK:

\`\`\`
🔍 Checking YENZE 2.0 Migration Status...

Checking user_components... ✅ EXISTS
Checking analytics_sessions... ✅ EXISTS
Checking analytics_events... ✅ EXISTS

============================================================
MIGRATION STATUS SUMMARY
============================================================

✅ user_components        0 rows
✅ analytics_sessions     0 rows
✅ analytics_events       142 rows

============================================================
✅ All tables exist! Migration is complete.

You can now use YENZE 2.0 features:
  - Component Library
  - Enhanced Analytics
  - Session Tracking
\`\`\`

---

## ❌ Si Faltan Tablas - Cómo Crear

### Paso 1: Ir a SQL Editor
1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Click **New Query**

### Paso 2: Ejecutar Migración
1. Abre el archivo: `migrations/v2-tables-migration.sql`
2. Copia TODO el contenido
3. Pega en el SQL Editor de Supabase
4. Click **Run**

### Paso 3: Verificar
Espera a que termine (debería tomar ~5-10 segundos) y verás:

\`\`\`
✅ YENZE 2.0 migration completed successfully!
Tables created: user_components, analytics_sessions, analytics_events
Views created: analytics_daily_stats, analytics_top_pages, analytics_traffic_sources
RLS policies enabled for all tables
\`\`\`

### Paso 4: Re-verificar
Vuelve a ejecutar el query de verificación del **Método 2** para confirmar.

---

## 🔒 Verificar Políticas RLS

Las tablas deben tener Row Level Security (RLS) habilitado.

Ejecuta este query en SQL Editor:

\`\`\`sql
-- Check RLS status
SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events');
\`\`\`

### Resultado esperado:

\`\`\`
tablename            | rls_status
--------------------|---------------
user_components     | ✅ RLS Enabled
analytics_sessions  | ✅ RLS Enabled
analytics_events    | ✅ RLS Enabled
\`\`\`

---

## 📊 Verificar Políticas de Seguridad

\`\`\`sql
-- Check RLS policies
SELECT
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events')
ORDER BY tablename, cmd;
\`\`\`

### Políticas esperadas:

**user_components:**
- ✅ Users can view own components (SELECT)
- ✅ Users can create own components (INSERT)
- ✅ Users can update own components (UPDATE)
- ✅ Users can delete own components (DELETE)

**analytics_sessions:**
- ✅ Users can view own project sessions (SELECT)
- ✅ Service role can insert sessions (INSERT)

**analytics_events:**
- ✅ Users can view own project events (SELECT)
- ✅ Service role can insert events (INSERT)

---

## 🎯 Checklist Final

Antes de marcar como completo, verifica:

- [ ] Las 3 tablas existen (`user_components`, `analytics_sessions`, `analytics_events`)
- [ ] Cada tabla tiene RLS habilitado
- [ ] Las políticas RLS están creadas
- [ ] Los índices están creados (verificar en Table Editor → Indexes)
- [ ] Las vistas están creadas (analytics_daily_stats, analytics_top_pages, analytics_traffic_sources)

---

## 🆘 Solución de Problemas

### Error: "permission denied for table"
**Causa:** RLS habilitado pero sin políticas
**Solución:** Re-ejecutar `migrations/v2-tables-migration.sql`

### Error: "relation does not exist"
**Causa:** Tabla no existe
**Solución:** Ejecutar `migrations/v2-tables-migration.sql`

### Error: "column does not exist"
**Causa:** Tabla existe pero con estructura vieja
**Solución:** La migración actualiza automáticamente con `ALTER TABLE`

---

## ✅ Confirmación

Una vez verificado todo, puedes confirmar:

\`\`\`bash
echo "✅ YENZE 2.0 migration verified" >> migration-status.txt
git add migration-status.txt
git commit -m "docs: confirm v2 migration completed"
git push
\`\`\`

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa los logs del SQL Editor en Supabase
2. Verifica que tienes permisos de administrador
3. Asegúrate de estar en el proyecto correcto

**Scripts útiles:**
- `scripts/check-v2-tables.sql` - Verificación completa
- `scripts/check-v2-migration.js` - Script Node.js automatizado
- `migrations/v2-tables-migration.sql` - Migración completa
