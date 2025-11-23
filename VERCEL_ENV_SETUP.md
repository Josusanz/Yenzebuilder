# ⚙️ Variables de Entorno en Vercel

Para que Stripe funcione correctamente, necesitas configurar estas variables de entorno en Vercel:

## 📝 Pasos para Configurar

1. Ve a tu proyecto en Vercel Dashboard: https://vercel.com/josus-projects-95701179/yenzehtml

2. Click en **"Settings"** → **"Environment Variables"**

3. Añade las siguientes variables:

---

### 🔑 Variables Requeridas

#### STRIPE_SECRET_KEY
- **Nombre**: `STRIPE_SECRET_KEY`
- **Valor**: Tu Stripe Secret Key (empieza con `sk_live_...`)
- **Dónde obtenerla**: Stripe Dashboard → Developers → API Keys → Secret key
- **Environments**: Production, Preview, Development

#### STRIPE_WEBHOOK_SECRET
- **Nombre**: `STRIPE_WEBHOOK_SECRET`
- **Valor**: Tu Webhook Signing Secret (empieza con `whsec_...`)
- **Dónde obtenerla**: Stripe Dashboard → Developers → Webhooks → Endpoint → Signing secret
- **Environments**: Production, Preview, Development

#### SUPABASE_URL
- **Nombre**: `SUPABASE_URL`
- **Valor**: `https://xssdcphepracobbsvqmg.supabase.co`
- **Environments**: Production, Preview, Development

#### SUPABASE_SERVICE_ROLE_KEY
- **Nombre**: `SUPABASE_SERVICE_ROLE_KEY`
- **Valor**: Tu Supabase Service Role Key (NO es la anon key)
- **Dónde obtenerla**: Supabase Dashboard → Settings → API → Service Role Key (⚠️ SECRETA)
- **Environments**: Production, Preview, Development

---

### 🎯 Variables Opcionales (Mejores Prácticas)

Estas son opcionales porque ya están hardcoded en el código, pero es mejor práctica usar env vars:

#### STRIPE_PRICE_STARTER
- **Nombre**: `STRIPE_PRICE_STARTER`
- **Valor**: `price_1SWi7yIDLJ66zkJzH1MJXNY6`
- **Environments**: Production

#### STRIPE_PRICE_PRO
- **Nombre**: `STRIPE_PRICE_PRO`
- **Valor**: `price_1SWiCYIDLJ66zkJzlw0IY25L`
- **Environments**: Production

#### STRIPE_PRICE_BUSINESS
- **Nombre**: `STRIPE_PRICE_BUSINESS`
- **Valor**: `price_1SWiDFIDLJ66zkJzyNmDga03`
- **Environments**: Production

#### NEXT_PUBLIC_URL
- **Nombre**: `NEXT_PUBLIC_URL`
- **Valor**: `https://yenze.io`
- **Environments**: Production

---

## 🔐 Cómo Obtener las Claves

### Stripe Secret Key

1. Ve a https://dashboard.stripe.com/apikeys
2. Busca **"Secret key"** en la sección "Standard keys"
3. Si está oculta, click en "Reveal test key" o "Reveal live key"
4. Copia el valor (empieza con `sk_live_...` para producción)

### Stripe Webhook Secret

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en tu endpoint (o créalo si no existe):
   - URL: `https://yenze.io/api/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.*`
3. En la página del endpoint, busca **"Signing secret"**
4. Click en "Reveal" y copia el valor (empieza con `whsec_...`)

### Supabase Service Role Key

⚠️ **MUY IMPORTANTE**: Esta NO es la anon key que está en config.js

1. Ve a https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/settings/api
2. Busca **"Service Role Key"** (no "anon public")
3. Copia el valor (es un JWT muy largo)

---

## ✅ Verificar que Funciona

Después de configurar las variables:

1. Ve a https://yenze.io/public/dashboard.html
2. Haz login
3. Ve a la sección "Billing"
4. Click en "Get Starter" o "Go Pro"
5. Deberías ser redirigido a Stripe Checkout

Si ves un error, revisa los logs en Vercel:
```bash
vercel logs --prod
```

---

## 🚨 Seguridad

- **NUNCA** commitees las Secret Keys al repositorio Git
- **NUNCA** compartas la Service Role Key públicamente
- Solo usa las Live Keys en producción
- Usa Test Keys para desarrollo local

---

## 🧪 Testing Local

Para testing local, crea un archivo `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://xssdcphepracobbsvqmg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Luego ejecuta:
```bash
vercel dev
```

---

## 📊 Monitoreo

Después de configurar, monitorea:

1. **Stripe Dashboard** → Payments: Ver pagos exitosos
2. **Supabase** → Table Editor → subscriptions: Ver suscripciones guardadas
3. **Vercel** → Functions: Ver logs de las API functions

¡Listo! Tu sistema de pagos está configurado 🎉
