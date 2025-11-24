# 📊 Configuración de Analytics para YENZE

## Problema Actual

Las analíticas no funcionan porque falta la tabla `analytics_events` en la base de datos de Supabase.

## ✅ Solución: Crear la tabla en Supabase

### Paso 1: Ir a Supabase SQL Editor

1. Abre tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto YENZE
3. En el menú izquierdo, haz clic en **SQL Editor**

### Paso 2: Ejecutar el script SQL

1. Haz clic en el botón **"+ New query"**
2. Copia y pega el contenido del archivo `setup-analytics.sql`
3. Haz clic en **"Run"** (botón verde en la esquina inferior derecha)

### Paso 3: Verificar que funcionó

Ejecuta este comando en tu terminal:

```bash
node check-analytics.js
```

Deberías ver:
```
✅ Tabla analytics_events existe
📊 Eventos encontrados: 0

⚠️  No hay eventos de analytics todavía.
   Esto es normal si acabas de crear la tabla.
   Los eventos se crearán cuando alguien visite un proyecto publicado.
```

## 📋 ¿Qué hace la tabla analytics_events?

Esta tabla almacena todos los eventos de analytics:
- **Page views**: Cada vez que alguien visita un proyecto publicado
- **Visitor tracking**: Identifica visitantes únicos
- **Session tracking**: Agrupa visitas en sesiones
- **Metadata**: Información del navegador, dispositivo, ubicación, etc.

## 🔍 Estructura de la tabla

```sql
- id: UUID único del evento
- project_id: A qué proyecto pertenece
- event_type: Tipo de evento (page_view, click, etc.)
- visitor_id: ID único del visitante
- session_id: ID de la sesión
- page_url: URL visitada
- referrer: De dónde vino el visitante
- user_agent: Navegador y sistema operativo
- screen_width/height: Resolución de pantalla
- language: Idioma del navegador
- metadata: Datos adicionales (JSON)
- timestamp: Momento exacto del evento
- created_at: Fecha de creación en BD
```

## 🔐 Permisos (RLS Policies)

El script configura automáticamente:

1. **Lectura**: Los usuarios autenticados pueden leer analytics de sus propios proyectos
2. **Escritura**: Cualquier persona puede insertar eventos (necesario para tracking público)

## 🎯 Cómo funciona después de configurar

1. **Visitante llega a un proyecto publicado** (ej: `framerlms.com`)
2. El script de analytics carga automáticamente
3. Se genera un `visitor_id` único (guardado en localStorage)
4. Se registra el page view en `analytics_events`
5. **Dashboard muestra las estadísticas**:
   - Total de visitas
   - Visitantes únicos
   - Gráficos de tendencias
   - Top referrers
   - Breakdown por dispositivo

## 📈 Métricas disponibles en el Dashboard

Una vez configurado, verás en el dashboard:

- **Total Page Views**: Número total de visitas
- **Unique Visitors**: Visitantes únicos
- **Views Over Time**: Gráfico de visitas en el tiempo
- **Top Referrers**: De dónde vienen tus visitantes
- **Device Breakdown**: Mobile, Tablet, Desktop
- **Analytics por proyecto**: Estadísticas individuales de cada proyecto

## 🚀 Próximos pasos después de crear la tabla

1. ✅ Crear la tabla ejecutando `setup-analytics.sql`
2. ✅ Verificar con `node check-analytics.js`
3. ✅ Visitar un proyecto publicado (ej: framerlms.com)
4. ✅ Ir al dashboard y ver las estadísticas en la sección "Analytics"

## ⚠️ Nota importante

Los eventos de analytics **solo se registran en proyectos publicados** que se acceden a través de:
- Subdominios YENZE (ej: `username.yenze.io`)
- Dominios custom (ej: `framerlms.com`)
- URLs compartidas (ej: `yenze.io/s/project-slug`)

**NO** se registran eventos cuando editas el proyecto en el builder.

## 🛠️ Troubleshooting

### "No veo analytics en mi dashboard"

1. Verifica que la tabla existe: `node check-analytics.js`
2. Asegúrate de haber visitado el proyecto publicado
3. Revisa la consola del navegador por errores
4. Verifica que el proyecto esté realmente publicado

### "Error: PGRST205"

La tabla no existe. Ejecuta `setup-analytics.sql` en Supabase SQL Editor.

### "Error: permission denied"

Las políticas RLS no están configuradas. Ejecuta de nuevo `setup-analytics.sql`.
