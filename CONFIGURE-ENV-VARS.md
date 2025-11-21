# 🔐 Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel y configura estas variables de entorno:

👉 https://vercel.com/josus-projects-95701179/yenzehtml/settings/environment-variables

---

## Variables a Configurar

Para cada variable, haz click en **"Add New"** y completa:

### 1. STRIPE_PUBLIC_KEY
```
pk_live_51MC0CNIDLJ66zkJzWkTaTmIrxYYaIUYwIhXWoAibHOqOQykhnbaZm57Cf7mFWUcuVruqq8iQCboJB1bgFwluGJCq00RzMk6vtK
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2. STRIPE_SECRET_KEY
```
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
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3. STRIPE_WEBHOOK_SECRET
```
whsec_PYlsvBREe63guL3XH4tIcAROFznXWePY
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 4. STRIPE_PRICE_ONE_TIME
```
price_1SVheLIDLJ66zkJzd9xC2wlK
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 5. STRIPE_PRICE_PRO
```
price_1SVheoIDLJ66zkJzV3GkWvRr
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 6. SUPABASE_URL
```
https://xssdcphepracobbsvqmg.supabase.co
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 7. SUPABASE_SERVICE_ROLE_KEY
```
[PENDIENTE - Necesitas copiar esta clave desde Supabase Dashboard]
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**IMPORTANTE**: NO uses la `anon` key aquí. Debe ser la `service_role` key.

---

## Cómo obtener SUPABASE_SERVICE_ROLE_KEY

1. Ve a: https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/settings/api
2. Busca la sección **Project API keys**
3. Encuentra la clave **`service_role`** (NOT anon)
4. Haz click en **"Reveal"** o el ícono del ojo
5. Copia la clave completa
6. Pégala en Vercel como variable de entorno

---

## ✅ Después de Configurar

Una vez hayas agregado todas las variables:

1. Las variables se aplicarán automáticamente en el próximo deploy
2. Puedes forzar un redeploy con: `vercel --prod`
3. O simplemente haz `git push` si tienes Git conectado

---

## 🧪 Probar que Funciona

1. Ve a tu sitio: https://yenzehtml-gix0qwyyf-josus-projects-95701179.vercel.app
2. Inicia sesión
3. Click en "Upgrade to Pro" o "Get Custom Domain"
4. Deberías ser redirigido a Stripe Checkout
5. Usa una tarjeta de prueba: `4242 4242 4242 4242` (solo si estás en modo test)

**NOTA**: Como estás usando claves LIVE, los pagos serán REALES. Asegúrate de probar bien antes de publicitar.

---

## 🔒 Seguridad

- ✅ Las claves `STRIPE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` son secretas
- ✅ NUNCA las expongas en el código frontend
- ✅ Solo se usan en las funciones serverless (API routes)
- ✅ Vercel las protege automáticamente

---

## ❓ Problemas Comunes

**Error: "Stripe is not defined"**
- Verifica que agregaste `STRIPE_PUBLIC_KEY` en las variables de entorno
- Redeploy con `vercel --prod`

**Error: "Invalid API Key"**
- Verifica que las claves sean correctas
- Asegúrate de no tener espacios extra al copiar/pegar

**Webhook no funciona**
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado
- Revisa los logs de Vercel: `vercel logs --follow`
- Verifica el endpoint en Stripe Dashboard
