# 🔍 Debug: Por qué no veo los mensajes - Paso a Paso

## 📋 Paso 1: Ejecutar Script de Diagnóstico

1. **Abre Supabase SQL Editor:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Click en "SQL Editor" (menú izquierdo)
   - Click en "New Query"

2. **Ejecuta el script de diagnóstico:**
   - Abre: `migrations/diagnose-messages-issue.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click en "Run"

3. **Lee los resultados:**
   - Aparecerán varias tablas con información
   - Al final verás un DIAGNÓSTICO COMPLETO
   - **Copia todo el resultado y compártelo conmigo**

---

## 🔎 Paso 2: Verificar en la Consola del Navegador

1. **Abre el Dashboard:**
   - Ve a tu dashboard (ej: `builder.yenze.io/dashboard.html`)
   - Haz click en "Messages" en el menú lateral

2. **Abre DevTools:**
   - Presiona **F12** (o botón derecho → "Inspeccionar")
   - Ve a la pestaña **"Console"**

3. **Busca errores:**
   - ¿Hay algún error en ROJO?
   - ¿Qué dice el error?
   - **Toma screenshot o copia el error**

4. **Busca en Network:**
   - Ve a la pestaña **"Network"**
   - Recarga la página (F5)
   - Busca la petición a `form_submissions`
   - Haz click en ella
   - Ve a "Response"
   - **¿Qué respuesta da?**

---

## 🧪 Paso 3: Probar el API Directamente

Ejecuta esta query en Supabase SQL Editor para ver si hay mensajes:

```sql
-- Ver TODOS los mensajes (ignorando RLS temporalmente)
SELECT
    id,
    name,
    email,
    subject,
    LEFT(message, 50) as message_preview,
    project_id,
    is_read,
    created_at
FROM form_submissions
ORDER BY created_at DESC
LIMIT 10;
```

**Pregunta:** ¿Aparecen mensajes?
- ✅ **SÍ** → El problema está en el frontend o RLS
- ❌ **NO** → No hay mensajes aún, necesitas enviar uno

---

## 📨 Paso 4: Enviar un Mensaje de Prueba

### Opción A: Desde un sitio publicado

1. Ve a uno de tus sitios publicados (ej: `miproyecto.yenze.io`)
2. Llena el formulario de contacto
3. Envía el mensaje
4. Ve al Dashboard → Messages
5. ¿Aparece el mensaje?

### Opción B: Usando el API directamente

Ejecuta esto en Supabase SQL Editor (reemplaza `YOUR_PROJECT_ID`):

```sql
-- Primero, obtén tu project_id
SELECT id, name FROM projects WHERE user_id = auth.uid() LIMIT 1;

-- Luego, inserta un mensaje de prueba (reemplaza 'PROJECT_ID_AQUI')
INSERT INTO form_submissions (
    project_id,
    name,
    email,
    subject,
    message,
    is_read,
    created_at
) VALUES (
    'PROJECT_ID_AQUI',  -- ← Reemplaza con el ID de arriba
    'Test User',
    'test@example.com',
    'Mensaje de Prueba',
    'Este es un mensaje de prueba para verificar que todo funciona correctamente.',
    false,
    NOW()
);

-- Verifica que se insertó
SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1;
```

Ahora ve al Dashboard → Messages. **¿Aparece el mensaje?**

---

## 🔧 Paso 5: Verificar Políticas RLS

Si los mensajes existen pero no aparecen, el problema es RLS:

```sql
-- Ver políticas actuales
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'form_submissions';
```

Deberías ver 4 políticas:
- `Anyone can insert form submissions` (INSERT)
- `Users can view own project submissions` (SELECT)
- `Users can update own project submissions` (UPDATE)
- `Users can delete own project submissions` (DELETE)

**¿Faltan políticas?** Ejecuta nuevamente el script de migración.

---

## 🔍 Paso 6: Verificar la Query del Dashboard

Abre la consola del navegador y ejecuta esto manualmente:

```javascript
// Pega esto en la consola del navegador (F12 → Console)
const checkMessages = async () => {
    console.log('=== CHECKING MESSAGES ===');

    // 1. Verificar usuario actual
    const user = supabaseClient.getUser();
    console.log('Current user:', user);

    // 2. Obtener proyectos
    const { data: projects, error: projectsError } = await supabaseClient.client
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id);

    console.log('Projects:', projects);
    console.log('Projects error:', projectsError);

    if (!projects || projects.length === 0) {
        console.error('❌ NO PROJECTS FOUND');
        return;
    }

    const projectIds = projects.map(p => p.id);
    console.log('Project IDs:', projectIds);

    // 3. Obtener mensajes
    const { data: messages, error: messagesError } = await supabaseClient.client
        .from('form_submissions')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

    console.log('Messages:', messages);
    console.log('Messages error:', messagesError);

    if (messagesError) {
        console.error('❌ ERROR:', messagesError);
    } else if (!messages || messages.length === 0) {
        console.warn('⚠️ NO MESSAGES FOUND');
    } else {
        console.log('✅ FOUND', messages.length, 'MESSAGES');
    }
};

await checkMessages();
```

**¿Qué resultado te da?**

---

## 📊 Posibles Problemas y Soluciones

### ❌ Problema: "Error: relation 'form_submissions' does not exist"
**Solución:** La tabla no existe. Ejecuta el script de migración nuevamente.

### ❌ Problema: "Messages: []" (array vacío) pero la tabla tiene datos
**Solución:** Problema con RLS. Las políticas no permiten ver los mensajes.

**Fix:**
```sql
-- Deshabilitar RLS temporalmente para testing
ALTER TABLE form_submissions DISABLE ROW LEVEL SECURITY;

-- Ahora intenta cargar mensajes en el dashboard
-- Si funciona, el problema era RLS

-- Vuelve a habilitar RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Recrear políticas correctamente (ejecuta el script de migración)
```

### ❌ Problema: "project_id is NULL" en mensajes
**Solución:** Los mensajes no tienen project_id asociado.

**Fix:**
```sql
-- Ver qué proyectos tienes
SELECT id, name, subdomain_slug, public_slug FROM projects WHERE user_id = auth.uid();

-- Asociar mensajes huérfanos a un proyecto (reemplaza IDs)
UPDATE form_submissions
SET project_id = 'TU_PROJECT_ID_AQUI'
WHERE project_id IS NULL;
```

### ❌ Problema: Los mensajes están en la DB pero no se muestran
**Solución:** Problema en el frontend.

**Checks:**
1. Abre `public/dashboard.js` línea 3176
2. Verifica que `loadMessages()` se llame al cambiar a la sección Messages
3. Verifica que los elementos DOM existen: `messagesList`, `noMessagesState`

---

## 🎯 Checklist Final

Ejecuta estos checks uno por uno y marca los que pasen:

- [ ] ✅ Tabla `form_submissions` existe
- [ ] ✅ Tabla tiene la columna `is_read` (no `read`)
- [ ] ✅ Hay al menos 1 mensaje en la tabla
- [ ] ✅ El mensaje tiene un `project_id` válido
- [ ] ✅ El project_id corresponde a un proyecto tuyo
- [ ] ✅ Las 4 políticas RLS existen
- [ ] ✅ RLS está habilitado
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ La query de mensajes se ejecuta sin error
- [ ] ✅ Los mensajes aparecen en el Dashboard

---

## 📞 Siguiente Paso

**Comparte conmigo:**

1. El resultado completo del script de diagnóstico (`diagnose-messages-issue.sql`)
2. Screenshot de los errores de la consola (si hay)
3. El resultado de la query manual de JavaScript
4. Cuántos checks del checklist final pasaron

Con esa información podré darte la solución exacta.

---

## 🔥 Fix Rápido de Emergencia

Si nada funciona, ejecuta esto para resetear completamente:

```sql
-- ⚠️ ADVERTENCIA: Esto borra todos los mensajes
DROP TABLE IF EXISTS form_submissions CASCADE;

-- Recrear tabla desde cero
CREATE TABLE form_submissions (
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

CREATE INDEX idx_form_submissions_project_id ON form_submissions(project_id);
CREATE INDEX idx_form_submissions_is_read ON form_submissions(is_read);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at DESC);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert form submissions"
    ON form_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own project submissions"
    ON form_submissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = form_submissions.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own project submissions"
    ON form_submissions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = form_submissions.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own project submissions"
    ON form_submissions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = form_submissions.project_id
        AND projects.user_id = auth.uid()
    ));

-- Insertar mensaje de prueba
INSERT INTO form_submissions (project_id, name, email, message)
SELECT id, 'Test User', 'test@example.com', 'Test message'
FROM projects WHERE user_id = auth.uid() LIMIT 1;
```

Luego recarga el dashboard.
