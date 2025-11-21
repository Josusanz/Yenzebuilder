# 🚀 Cloudflare for SaaS Setup Guide

Esta guía te ayudará a configurar Cloudflare for SaaS para permitir custom domains en YENZE.

---

## 📋 Requisitos Previos

- Cuenta de Cloudflare (gratuita)
- Dominio `yenze.io` agregado a Cloudflare
- Tarjeta de crédito (para activar Cloudflare for SaaS, aunque es gratis hasta 100 hostnames)

---

## Paso 1: Configurar Cloudflare for SaaS

### 1.1 Agregar yenze.io a Cloudflare

1. Ve a: https://dash.cloudflare.com
2. Click en **"Add a Site"**
3. Ingresa: `yenze.io`
4. Selecciona el plan **Free**
5. Cloudflare te dará nameservers:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

### 1.2 Cambiar Nameservers en GoDaddy

1. Ve a GoDaddy DNS settings
2. Cambia los nameservers de GoDaddy a:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. Espera 5-30 minutos para propagación

### 1.3 Activar Cloudflare for SaaS

1. En Cloudflare dashboard, ve a **SSL/TLS** → **Custom Hostnames**
2. Click en **"Enable Cloudflare for SaaS"**
3. Acepta los términos
4. Agrega tu **Fallback Origin**:
   ```
   76.76.21.21
   ```
   (Esta es la IP de Vercel)

---

## Paso 2: Obtener API Credentials

### 2.1 Obtener Zone ID

1. En Cloudflare dashboard, selecciona `yenze.io`
2. En la columna derecha, bajo **"API"**, copia el **Zone ID**
3. Guárdalo (ejemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 2.2 Crear API Token

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Click en **"Create Token"**
3. Usa el template **"Edit Cloudflare for SaaS"** o crea uno custom con estos permisos:

   **Zone Permissions:**
   - Zone → SSL and Certificates → Edit
   - Zone → DNS → Edit
   - Zone → Zone → Read

   **Account Permissions:**
   - Account → Cloudflare for SaaS → Edit

4. Click en **"Continue to summary"**
5. Click en **"Create Token"**
6. **COPIA Y GUARDA EL TOKEN** (solo se muestra una vez)
   - Ejemplo: `1234567890abcdefghijklmnopqrstuvwxyz_ABCD`

---

## Paso 3: Configurar Variables de Entorno en Vercel

### 3.1 Agregar Variables

Ejecuta estos comandos en terminal:

```bash
cd /Users/josu/yenzehtml

# Zone ID de Cloudflare
vercel env add CLOUDFLARE_ZONE_ID

# Pega tu Zone ID cuando se solicite

# API Token de Cloudflare
vercel env add CLOUDFLARE_API_TOKEN

# Pega tu API Token cuando se solicite
```

### 3.2 Seleccionar Entornos

Para ambas variables, selecciona:
- [x] Production
- [x] Preview
- [x] Development

---

## Paso 4: Ejecutar SQL en Supabase

1. Ve a: https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/sql/new

2. Ejecuta el contenido de `add-custom-domains-table.sql`:

```sql
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  -- ... (resto del archivo)
);
```

---

## Paso 5: Configurar DNS Record en Cloudflare

### 5.1 Crear CNAME Fallback

1. En Cloudflare dashboard para `yenze.io`
2. Ve a **DNS** → **Records**
3. Agrega un registro **CNAME**:
   ```
   Name: cname
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   ```

Esto permite que los custom domains apunten a `cname.yenze.io` que redirecciona a Vercel.

---

## Paso 6: Deploy a Producción

```bash
cd /Users/josu/yenzehtml
vercel --prod
```

---

## ✅ Verificación

### Verificar que todo funciona:

1. **Cloudflare configurado**: https://dash.cloudflare.com
2. **Variables de entorno**: `vercel env ls`
3. **SQL ejecutado**: Verifica en Supabase que existe la tabla `custom_domains`
4. **Deploy completado**: https://yenze.io debe cargar

---

## 🧪 Probar Custom Domain

### Flujo de prueba:

1. Usuario hace upgrade a STARTER ($12/año)
2. En dashboard, click en "Add Custom Domain"
3. Ingresa dominio de prueba (ej: `miempresa.com`)
4. YENZE crea el hostname en Cloudflare
5. Usuario configura CNAME en su DNS:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: cname.yenze.io
   ```
6. Esperar 5-30 minutos
7. Click en "Verify Domain"
8. Si está configurado: status → `active`
9. Visitar `miempresa.com` debería mostrar el proyecto

---

## 💰 Costos

| Item | Costo |
|------|-------|
| Cloudflare for SaaS (hasta 100 hostnames) | **$0/mes** |
| Cloudflare for SaaS (más de 100 hostnames) | **$0.10/hostname/mes** |
| SSL Certificates | **$0** (incluido) |
| CDN Global | **$0** (incluido) |

**Total con 1000 usuarios STARTER**: ~$90/mes
**Ingresos con 1000 usuarios STARTER**: $1000/mes ($12/año × 1000 / 12)
**Margen de ganancia**: **91%** 🚀

---

## 🔧 Troubleshooting

### Error: "Custom hostname creation failed"
- Verifica que el API Token tenga los permisos correctos
- Verifica que el Zone ID sea correcto
- Revisa logs en Vercel: `vercel logs`

### Domain no se activa
- Verifica que el CNAME apunte a `cname.yenze.io`
- Usa `dig` o `nslookup` para verificar DNS:
  ```bash
  dig miempresa.com
  ```
- Espera hasta 48h para propagación DNS completa

### SSL no funciona
- Cloudflare genera SSL automáticamente en 5-15 minutos
- Verifica en Cloudflare dashboard → SSL/TLS → Custom Hostnames
- Status debe ser "Active"

---

## 📚 Recursos

- Cloudflare for SaaS Docs: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/
- Cloudflare API Docs: https://developers.cloudflare.com/api/
- Vercel Custom Domains: https://vercel.com/docs/concepts/projects/custom-domains

---

¿Necesitas ayuda? Revisa los logs:
```bash
vercel logs --follow
```
