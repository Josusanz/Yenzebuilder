# ✅ YENZE 2.0 - Migration Checklist

## 🎯 Estado Actual de Migración

### Tablas Requeridas

| Tabla | ¿Existe? | ¿RLS? | ¿Políticas? | Estado |
|-------|----------|-------|-------------|--------|
| `user_components` | ⬜ Por verificar | ⬜ | ⬜ | ⏳ Pendiente |
| `analytics_sessions` | ⬜ Por verificar | ⬜ | ⬜ | ⏳ Pendiente |
| `analytics_events` | ⬜ Por verificar | ⬜ | ⬜ | ⏳ Pendiente |

---

## 📝 Pasos para Verificar

### 1️⃣ VERIFICACIÓN RÁPIDA (2 minutos)

**Opción A: Dashboard Supabase**
1. Ir a https://supabase.com/dashboard
2. Abrir proyecto YENZE
3. Click en "Table Editor"
4. Buscar las 3 tablas arriba

**Opción B: SQL Query**
1. Ir a "SQL Editor"
2. Copiar y ejecutar:

\`\`\`sql
SELECT tablename,
       CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events');
\`\`\`

---

### 2️⃣ CREAR TABLAS FALTANTES (5 minutos)

Si falta alguna tabla:

1. **Abrir SQL Editor** en Supabase
2. **Abrir archivo**: `migrations/v2-tables-migration.sql`
3. **Copiar TODO** el contenido
4. **Pegar** en SQL Editor
5. **Click "Run"**
6. Esperar mensaje: "✅ YENZE 2.0 migration completed successfully!"

---

### 3️⃣ VERIFICAR RESULTADO (1 minuto)

Ejecutar de nuevo la query de verificación:

\`\`\`sql
SELECT
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF' END as security,
    (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policies
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_components', 'analytics_sessions', 'analytics_events');
\`\`\`

**Resultado esperado:**
\`\`\`
tablename           | security   | policies
--------------------|------------|----------
user_components     | ✅ RLS ON | 4
analytics_sessions  | ✅ RLS ON | 2
analytics_events    | ✅ RLS ON | 2
\`\`\`

---

## 🚀 Marcar Como Completado

Una vez verificado, actualiza esta checklist:

### Tablas Requeridas (ACTUALIZADO)

| Tabla | ¿Existe? | ¿RLS? | ¿Políticas? | Estado |
|-------|----------|-------|-------------|--------|
| `user_components` | ✅ Sí | ✅ Sí | ✅ 4 políticas | ✅ Completado |
| `analytics_sessions` | ✅ Sí | ✅ Sí | ✅ 2 políticas | ✅ Completado |
| `analytics_events` | ✅ Sí | ✅ Sí | ✅ 2 políticas | ✅ Completado |

---

## 📊 Detalles de las Tablas

### user_components (Biblioteca de Componentes)

**Propósito:** Guardar componentes reutilizables creados por usuarios

**Columnas principales:**
- `id` - ID único del componente
- `user_id` - Propietario del componente
- `name` - Nombre del componente
- `html` - Código HTML del componente
- `thumbnail` - Miniatura visual
- `tags` - Etiquetas para búsqueda

**Políticas RLS:**
1. ✅ Users can view own components (SELECT)
2. ✅ Users can create own components (INSERT)
3. ✅ Users can update own components (UPDATE)
4. ✅ Users can delete own components (DELETE)

---

### analytics_sessions (Sesiones de Análisis)

**Propósito:** Rastrear sesiones de visitantes con datos mejorados

**Columnas principales:**
- `id` - ID único de sesión
- `project_id` - Proyecto visitado
- `session_id` - Identificador de sesión
- `device` - Tipo de dispositivo (mobile/tablet/desktop)
- `referrer` - De dónde vino el visitante
- `duration` - Duración de la sesión
- `is_bounce` - Si rebotó (1 página vista)

**Políticas RLS:**
1. ✅ Users can view own project sessions (SELECT)
2. ✅ Service role can insert sessions (INSERT)

---

### analytics_events (Eventos de Análisis)

**Propósito:** Rastrear eventos específicos (clicks, forms, etc.)

**Columnas principales:**
- `id` - ID único del evento
- `project_id` - Proyecto donde ocurrió
- `session_id` - Sesión asociada
- `event_type` - Tipo (page_view, click, form_submit, etc.)
- `event_data` - Datos adicionales (JSON)

**Políticas RLS:**
1. ✅ Users can view own project events (SELECT)
2. ✅ Service role can insert events (INSERT)

---

## 🎁 Bonus: Vistas Creadas

La migración también crea estas vistas útiles:

1. **analytics_daily_stats**
   - Estadísticas diarias por proyecto
   - Sessions, pageviews, bounce rate

2. **analytics_top_pages**
   - Páginas más visitadas
   - View count por URL

3. **analytics_traffic_sources**
   - Fuentes de tráfico
   - Visitors por referrer

Puedes consultarlas con:
\`\`\`sql
SELECT * FROM analytics_daily_stats WHERE project_id = 'tu-project-id';
\`\`\`

---

## 📁 Archivos Relacionados

- 📄 `migrations/v2-tables-migration.sql` - Script de migración completo
- 📄 `scripts/check-v2-tables.sql` - Query de verificación
- 📄 `scripts/check-v2-migration.js` - Script Node.js automatizado
- 📄 `CHECK_MIGRATION_STATUS.md` - Guía detallada

---

## ✅ Confirmación Final

Una vez que hayas verificado que TODO está OK:

\`\`\`bash
# Marcar como completado
echo "✅ Migration verified on $(date)" > .migration-complete
git add .migration-complete
git commit -m "docs: verify v2 migration completed"
\`\`\`

---

## 🎉 ¡Listo!

Si todas las tablas tienen ✅, tu base de datos está lista para YENZE 2.0 y puedes usar:

- 📚 Component Library
- 📊 Enhanced Analytics
- 🎯 Session Tracking
- 📈 Advanced Insights

---

**Última actualización:** Por verificar
**Estado global:** ⏳ Pendiente de verificación
