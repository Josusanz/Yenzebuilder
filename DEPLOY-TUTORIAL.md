# Tutorial: Deploy YENZE en Vercel y Cloudflare

Este tutorial te guiara paso a paso para deployar tu propia instancia de YENZE Builder.

---

## Opcion 1: Deploy en Vercel (Recomendado)

Vercel es la opcion mas facil y rapida. Funciona perfecto con el tier gratuito.

### Paso 1: Fork del Repositorio

1. Ve a GitHub y haz login
2. Abre el repositorio de YENZE
3. Click en el boton **"Fork"** (arriba a la derecha)
4. Elige tu cuenta como destino
5. Click en **"Create fork"**

Ahora tienes tu propia copia del codigo.

### Paso 2: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click **"Start your project"** y registrate
3. Click **"New Project"**
4. Configura:
   - **Organization:** Crea una nueva o usa existente
   - **Name:** `yenze` (o el nombre que quieras)
   - **Database Password:** Genera una segura y guardala
   - **Region:** Elige la mas cercana a ti
5. Click **"Create new project"**
6. Espera 2-3 minutos mientras se crea

### Paso 3: Configurar Base de Datos

1. En Supabase, ve a **SQL Editor** (menu izquierdo)
2. Click **"New query"**
3. Abre el archivo `supabase-schema.sql` de tu fork
4. Copia TODO el contenido
5. Pegalo en el SQL Editor
6. Click **"Run"** (o Ctrl+Enter)
7. Deberia decir "Success. No rows returned"

Repite para `migrations/leads-table.sql`:
1. Click **"New query"**
2. Pega el contenido de `leads-table.sql`
3. Click **"Run"**

### Paso 4: Obtener Claves de Supabase

1. Ve a **Settings** > **API** (menu izquierdo)
2. Copia estos valores (los necesitaras):

```
Project URL: https://xxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANTE:** El `service_role` key es secreto. No lo compartas.

### Paso 5: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click **"Sign Up"** y usa tu cuenta de GitHub
3. Autoriza Vercel en GitHub
4. Click **"Add New..."** > **"Project"**
5. Busca tu fork de YENZE y click **"Import"**

### Paso 6: Variables de Entorno

En la pantalla de configuracion de Vercel:

1. Expande **"Environment Variables"**
2. Agrega estas variables:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `SUPABASE_ANON_KEY` | Tu anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key |

3. Click **"Deploy"**
4. Espera 1-2 minutos

### Paso 7: Actualizar Config del Cliente

1. Ve a tu fork en GitHub
2. Abre `public/config.secure.js`
3. Click el lapiz para editar
4. Actualiza:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui'
};
```

5. Click **"Commit changes"**
6. Vercel re-deployara automaticamente

### Listo!

Tu YENZE esta en: `https://tu-proyecto.vercel.app`

---

## Opcion 2: Deploy en Cloudflare Pages

Cloudflare Pages es otra opcion gratuita con CDN global.

### Paso 1: Fork del Repositorio

(Igual que arriba)

### Paso 2-4: Configurar Supabase

(Igual que arriba)

### Paso 5: Deploy en Cloudflare

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Registrate o haz login
3. En el menu izquierdo, click **"Workers & Pages"**
4. Click **"Create application"**
5. Selecciona **"Pages"** tab
6. Click **"Connect to Git"**
7. Autoriza Cloudflare en GitHub
8. Selecciona tu fork de YENZE

### Paso 6: Configurar Build

1. **Project name:** `yenze` (o lo que quieras)
2. **Production branch:** `main`
3. **Framework preset:** None
4. **Build command:** (dejar vacio)
5. **Build output directory:** `public`

### Paso 7: Variables de Entorno

1. Expande **"Environment variables"**
2. Agrega las mismas 3 variables de Supabase
3. Click **"Save and Deploy"**

### Paso 8: Actualizar Config

(Igual que en Vercel - edita `config.secure.js`)

---

## Dominio Personalizado

### En Vercel

1. Ve a tu proyecto en Vercel
2. Click **"Settings"** > **"Domains"**
3. Escribe tu dominio (ej: `editor.tudominio.com`)
4. Click **"Add"**
5. Configura los DNS como indica Vercel

### En Cloudflare

1. Ve a tu proyecto en Pages
2. Click **"Custom domains"**
3. Click **"Set up a custom domain"**
4. Sigue las instrucciones

---

## Subdominio Wildcard (Avanzado)

Para que funcionen los subdominios de usuarios (ej: `usuario.tudominio.com`):

### Vercel

1. En **Domains**, agrega `*.tudominio.com`
2. Configura DNS CNAME: `* -> cname.vercel-dns.com`

### Cloudflare

1. En **Custom domains**, agrega `*.tudominio.com`
2. El DNS se configura automaticamente si usas Cloudflare DNS

---

## Problemas Comunes

### "No puedo guardar proyectos"

- Verifica que las claves de Supabase son correctas
- Revisa la consola del navegador (F12) para errores
- Asegurate de haber ejecutado el schema SQL

### "El sitio no carga"

- Espera unos minutos, el deploy puede tardar
- Verifica que no hay errores en el deploy de Vercel/Cloudflare
- Revisa que `config.secure.js` tiene las URLs correctas

### "Los subdominios no funcionan"

- Necesitas configurar wildcard domain
- Puede tardar hasta 24h en propagarse el DNS

---

## Siguientes Pasos

1. Personaliza el branding en `builder.html`
2. Configura tu dominio personalizado
3. Comparte tu editor con el mundo!

---

## Recursos

- [Documentacion de Vercel](https://vercel.com/docs)
- [Documentacion de Cloudflare Pages](https://developers.cloudflare.com/pages)
- [Documentacion de Supabase](https://supabase.com/docs)

---

**Creado con amor para la comunidad open source**
