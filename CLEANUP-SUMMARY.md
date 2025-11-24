# Limpieza del Proyecto - Resumen

## 🎯 Problema Resuelto

El proyecto tenía archivos duplicados en la raíz (`/`) y en `/public/`, causando conflictos cuando se hacían cambios. Por ejemplo, `dashboard.js` existía en ambos lugares, y el HTML cargaba el de la raíz en lugar del actualizado en `/public/`.

## 🗂️ Nueva Estructura del Proyecto

### Raíz (`/`)
**Solo contiene:**
- `index.html` - Router principal que detecta hostname y sirve contenido apropiado
- `vercel.json` - Configuración de Vercel
- `package.json` - Dependencias
- `.env.local` - Variables de entorno
- `.gitignore` - Archivos ignorados por git

**Scripts de utilidad (para desarrollo):**
- `check-domain-status.js` - Verifica estado de dominio en DB y Vercel
- `diagnose-domain-issue.js` - Diagnostica problemas de dominio
- `fix-domain-project-link.js` - Arregla vinculación dominio-proyecto
- `verify-framerlms.js` - Verifica funcionamiento de framerlms.com
- `GODADDY-FIX.md` - Documentación para arreglar problemas de GoDaddy

### Directorio `/public/`
**Todos los archivos de la aplicación:**

**HTML:**
- `builder.html` - Editor visual
- `dashboard.html` - Panel de control
- `landing.html` - Página de inicio
- `view.html` - Vista de proyectos

**JavaScript:**
- `app.js` - Lógica principal del editor
- `dashboard.js` - Lógica del dashboard
- `analytics.js` - Tracking de analytics
- `auth-ui.js` - UI de autenticación
- `config.js` - Configuración
- `custom-domains.js` - Gestión de dominios personalizados
- `pricing-modal.js` - Modal de precios
- `stripe-integration.js` - Integración con Stripe
- `supabase-client.js` - Cliente de Supabase
- `usage-tracker.js` - Tracking de uso

**CSS:**
- `auth-styles.css`
- `dashboard.css`

### Directorio `/api/`
**API routes de Vercel:**
- `serve-project.js` - Sirve contenido de proyectos para custom domains
- `view-project.js` - Vista de proyectos por slug
- `get-project.js` - Obtiene datos de proyecto
- `add-custom-domain.js` - Añade dominio personalizado
- Otros endpoints...

## ✅ Archivos Eliminados (18 duplicados)

De la raíz se eliminaron:
- `dashboard.html`, `dashboard.js` ← **Estos causaban el conflicto principal**
- `builder.html`, `landing.html`, `view.html`
- `app.js`, `analytics.js`, `auth-ui.js`
- `config.js`, `custom-domains.js`
- `pricing-modal.js`, `stripe-integration.js`
- `supabase-client.js`, `_subdomain.html`
- Archivos de test: `dashboard-test.html`, `example.html`, `storage-test.html`, `test-subdomain.html`

## 🔧 Cómo Funciona Ahora

1. **Usuario accede a cualquier URL** → `index.html` (router)
2. **index.html detecta el hostname:**
   - `builder.yenze.io` → `/public/builder.html`
   - `yenze.io` → `/public/landing.html`
   - `*.yenze.io` → API `/api/subdomain`
   - `framerlms.com` → API `/api/serve-project`
3. **Vercel sirve automáticamente** archivos de `/public/` como si estuvieran en la raíz
   - Request a `/builder.html` → Sirve `/public/builder.html`
   - Request a `/dashboard.js` → Sirve `/public/dashboard.js`

## 📝 Reglas para el Futuro

### ✅ HAZ:
- Edita archivos en `/public/` para cambios en la aplicación
- Crea nuevos scripts de utilidad en la raíz si son para debugging/desarrollo
- Mantén `index.html` en la raíz (es el router principal)

### ❌ NO HAGAS:
- NO crees archivos HTML/JS duplicados en la raíz
- NO edites archivos de aplicación fuera de `/public/`
- NO modifiques `index.html` a menos que cambies la lógica de routing

## 🚀 Resultado

- ✅ No más conflictos entre archivos duplicados
- ✅ Dashboard ahora muestra correctamente el custom domain
- ✅ Estructura clara y mantenible
- ✅ 18 archivos duplicados eliminados
- ✅ Deploy más rápido (menos archivos para subir)

## 🔍 Verificación

Para verificar que todo funciona:
```bash
# Ver estructura limpia
ls -la /Users/josu/yenzehtml/*.html
# Debe mostrar solo: index.html

# Ver archivos de aplicación
ls -la /Users/josu/yenzehtml/public/*.html
# Debe mostrar: builder.html, dashboard.html, landing.html, view.html

# Probar dashboard
open https://builder.yenze.io/dashboard.html
# Debe mostrar el badge "🌐 CUSTOM DOMAIN" y "starter" en proyecto Yenze
```

---

**Fecha de limpieza:** 23 de Noviembre, 2025
**Deployment:** ✅ Completado en producción
