# 🔍 Troubleshooting: Mensajes no aparecen

Ejecutaste el script de migración pero aún no ves mensajes. Vamos a diagnosticar el problema paso a paso.

## 🎯 Paso 1: Ejecutar Diagnóstico SQL

1. **Ve a Supabase Dashboard**
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Abre SQL Editor**
   - Menú lateral → **SQL Editor**
   - Click en **New Query**

3. **Ejecuta el script de diagnóstico**
   - Abre: [`migrations/diagnose-messages-issue.sql`](./migrations/diagnose-messages-issue.sql)
   - Copia TODO el contenido
   - Pega en SQL Editor
   - Click **Run**

4. **Lee los resultados**
   - Verás varias tablas con información
   - Al final verás un resumen en la pestaña "Messages"
   - **COPIA TODO EL RESULTADO** y guárdalo para referencia

## 📊 Interpretando los Resultados

### Resultado A: Tabla no existe
```
❌ PROBLEMA CRÍTICO: La tabla form_submissions NO EXISTE
```

**Solución:**
El script de migración no se ejecutó correctamente. Ejecuta nuevamente:
```sql
-- Copia el contenido completo de migrations/fix-missing-columns-and-tables.sql
```

---

### Resultado B: Tabla existe pero sin mensajes
```
✅ La tabla form_submissions existe
Total de mensajes en la tabla: 0
```

**Esto significa:** La tabla está lista pero nunca has recibido mensajes.

**Solución:** Ve al [Paso 2: Probar Envío de Mensaje](#-paso-2-probar-envío-de-mensaje)

---

### Resultado C: Hay mensajes pero son huérfanos
```
✅ La tabla form_submissions existe
Total de mensajes en la tabla: 5
Mensajes huérfanos (sin project_id): 5
Mensajes vinculados a tus proyectos: 0
```

**Esto significa:** Los mensajes se guardaron pero sin `project_id`, por lo que no están vinculados a ningún proyecto.

**Causa probable:**
1. El formulario no está enviando el `project_id` correcto
2. El sitio no está publicado correctamente

**Solución:** Ve al [Paso 3: Arreglar Project ID](#-paso-3-arreglar-project-id)

---

### Resultado D: Hay mensajes vinculados correctamente
```
✅ La tabla form_submissions existe
Total de mensajes en la tabla: 5
Mensajes vinculados a tus proyectos: 5
```

**Esto significa:** Los mensajes ESTÁN en la base de datos y vinculados correctamente.

**El problema está en el frontend (dashboard).**

**Solución:** Ve al [Paso 4: Debugear el Dashboard](#-paso-4-debugear-el-dashboard)

---

## 📝 Paso 2: Probar Envío de Mensaje

Si no tienes mensajes, vamos a crear uno de prueba.

### Opción A: Usar archivo de prueba (Recomendado)

1. **Configura el archivo de prueba:**
   - Abre [`test-form-submission.html`](./test-form-submission.html) en un editor
   - En las líneas 194-195, reemplaza:
     ```javascript
     const SUPABASE_URL = 'YOUR_SUPABASE_URL';
     const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
     ```
   - Con tus valores de Supabase (Settings → API)

2. **Ejecuta el archivo:**
   ```bash
   # Desde la raíz del proyecto
   npx serve .
   ```
   - Abre http://localhost:3000/test-form-submission.html

3. **Envía un mensaje de prueba:**
   - Selecciona uno de tus proyectos
   - Llena el formulario
   - Click "Enviar Mensaje de Prueba"
   - Deberías ver "✅ ¡Mensaje enviado correctamente!"

4. **Verifica en Supabase:**
   ```sql
   SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1;
   ```
   - Deberías ver tu mensaje de prueba

### Opción B: Insertar mensaje manualmente

```sql
-- Primero, obtén el ID de uno de tus proyectos
SELECT id, name FROM projects WHERE user_id = auth.uid() LIMIT 1;

-- Copia el ID del proyecto y úsalo aquí (reemplaza 'YOUR_PROJECT_ID')
INSERT INTO form_submissions (
    project_id,
    name,
    email,
    subject,
    message,
    created_at
) VALUES (
    'YOUR_PROJECT_ID',
    'Test User',
    'test@example.com',
    'Mensaje de prueba',
    'Este es un mensaje de prueba insertado manualmente',
    NOW()
);

-- Verifica que se insertó
SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1;
```

---

## 🔧 Paso 3: Arreglar Project ID

Si tienes mensajes huérfanos (sin `project_id`), necesitamos vincularlos.

### Ver mensajes huérfanos:

```sql
SELECT
    id,
    name,
    email,
    subject,
    site_url,
    created_at
FROM form_submissions
WHERE project_id IS NULL
ORDER BY created_at DESC;
```

### Vincular mensajes huérfanos a un proyecto:

```sql
-- 1. Primero, identifica tu proyecto
SELECT id, name, subdomain_slug, public_slug
FROM projects
WHERE user_id = auth.uid();

-- 2. Actualiza los mensajes huérfanos (reemplaza 'YOUR_PROJECT_ID')
UPDATE form_submissions
SET project_id = 'YOUR_PROJECT_ID'
WHERE project_id IS NULL;

-- 3. Verifica
SELECT COUNT(*) as mensajes_vinculados
FROM form_submissions
WHERE project_id = 'YOUR_PROJECT_ID';
```

### Prevenir mensajes huérfanos en el futuro:

El problema está en cómo se publica el sitio. Asegúrate de que:

1. **El proyecto tiene un `subdomain_slug` o `public_slug`:**
   ```sql
   SELECT id, name, subdomain_slug, public_slug
   FROM projects
   WHERE user_id = auth.uid();
   ```

2. **El formulario HTML incluye el project_id:**
   - Ve a Dashboard → Tu Proyecto → Edit
   - Busca el formulario de contacto
   - Debería tener algo como:
     ```html
     <input type="hidden" name="project_id" value="xxx-xxx-xxx">
     ```

---

## 🐛 Paso 4: Debugear el Dashboard

Si los mensajes están en la base de datos pero no aparecen en el dashboard:

### 1. Abre la Consola del Navegador

1. Ve a tu Dashboard → Mensajes
2. Presiona **F12** (o Click derecho → Inspeccionar)
3. Ve a la pestaña **Console**
4. Busca errores en rojo

### 2. Errores comunes y soluciones:

#### Error: "Failed to load messages: permission denied"

**Causa:** Problema con políticas RLS

**Solución:**
```sql
-- Verificar políticas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'form_submissions';

-- Si no hay 4 políticas, ejecuta nuevamente el script de migración
```

#### Error: "column 'is_read' does not exist"

**Causa:** La tabla usa `read` en lugar de `is_read`

**Solución:**
```sql
-- Renombrar columna
ALTER TABLE form_submissions RENAME COLUMN read TO is_read;
```

#### Error: "projects is not defined" o similar

**Causa:** El dashboard no puede cargar tus proyectos

**Solución:**
```sql
-- Verificar que tienes proyectos
SELECT id, name FROM projects WHERE user_id = auth.uid();

-- Si no hay proyectos, los mensajes no se mostrarán
-- Crea al menos un proyecto primero
```

### 3. Verificar manualmente los datos:

Ejecuta esto en SQL Editor:

```sql
-- Ver tus proyectos
SELECT id, name, subdomain_slug, public_slug
FROM projects
WHERE user_id = auth.uid();

-- Ver mensajes vinculados a tus proyectos
SELECT
    fs.id,
    fs.name as sender_name,
    fs.email,
    fs.subject,
    fs.is_read,
    fs.created_at,
    p.name as project_name
FROM form_submissions fs
INNER JOIN projects p ON fs.project_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY fs.created_at DESC;
```

Si esto muestra mensajes, pero el dashboard no, el problema está en el JavaScript del dashboard.

### 4. Forzar recarga del Dashboard:

1. En el dashboard, presiona **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac)
2. Esto hace hard refresh y limpia cache
3. Ve nuevamente a la sección Mensajes

---

## 🔍 Paso 5: Verificar Permisos RLS en Detalle

```sql
-- Ver todas las políticas de form_submissions
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'form_submissions';
```

**Deberías ver exactamente 4 políticas:**

1. `Anyone can insert form submissions` (INSERT)
2. `Users can view own project submissions` (SELECT)
3. `Users can update own project submissions` (UPDATE)
4. `Users can delete own project submissions` (DELETE)

Si faltan políticas, ejecuta nuevamente el script de migración.

---

## ✅ Checklist Final

Antes de pedir ayuda, verifica que:

- [ ] La tabla `form_submissions` existe
- [ ] La tabla tiene la columna `is_read` (NO `read`)
- [ ] Existen 4 políticas RLS para `form_submissions`
- [ ] Tienes al menos 1 proyecto creado
- [ ] Hay mensajes en la tabla (aunque sea 1 de prueba)
- [ ] Los mensajes tienen un `project_id` válido (no NULL)
- [ ] El `project_id` corresponde a uno de tus proyectos
- [ ] No hay errores en la consola del navegador
- [ ] Hiciste hard refresh del dashboard (Ctrl+Shift+R)

---

## 📞 Si Nada Funciona

Si después de seguir TODOS estos pasos aún no funciona, comparte:

1. **Resultado del script de diagnóstico** ([Paso 1](#-paso-1-ejecutar-diagnóstico-sql))

2. **Resultado de estas queries:**
   ```sql
   -- 1. Columnas de form_submissions
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'form_submissions'
   ORDER BY ordinal_position;

   -- 2. Tus proyectos
   SELECT id, name, user_id
   FROM projects
   WHERE user_id = auth.uid();

   -- 3. Mensajes en la tabla
   SELECT
       fs.*,
       p.name as project_name,
       p.user_id as project_owner_id
   FROM form_submissions fs
   LEFT JOIN projects p ON fs.project_id = p.id
   ORDER BY fs.created_at DESC
   LIMIT 5;
   ```

3. **Errores de la consola del navegador** (captura de pantalla)

4. **Tu user_id actual:**
   ```sql
   SELECT auth.uid();
   ```

---

## 🚀 Accesos Rápidos

- [Script de Diagnóstico](./migrations/diagnose-messages-issue.sql)
- [Script de Migración](./migrations/fix-missing-columns-and-tables.sql)
- [Archivo de Prueba](./test-form-submission.html)
- [Guía de Solución Original](./FIX-MESSAGES-AND-SEO.md)

---

**¡Buena suerte! Si sigues estos pasos encontrarás el problema.** 🎯
