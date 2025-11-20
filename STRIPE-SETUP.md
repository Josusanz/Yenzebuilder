# 💳 Stripe Setup Guide for YENZE

Esta guía te ayudará a configurar Stripe para aceptar pagos en YENZE.

## 📋 Prerequisitos

- Cuenta de Stripe (https://stripe.com)
- Proyecto desplegado en Vercel
- Acceso a variables de entorno en Vercel

---

## Paso 1: Crear Cuenta de Stripe

1. Ve a https://stripe.com y crea una cuenta
2. Activa tu cuenta (necesitarás proporcionar información de negocio)
3. Ve a **Developers > API Keys**

---

## Paso 2: Crear Productos en Stripe

### Producto 1: Custom Domain (ONE_TIME)

1. Ve a **Products** en Stripe Dashboard
2. Click en **"Add product"**
3. Configuración:
   - **Name**: `YENZE Custom Domain`
   - **Description**: `One-time payment for deploying with custom domain`
   - **Pricing**:
     - **Price**: `$7.99`
     - **Billing period**: `One time`
   - **Tax code**: `Software as a Service (SaaS)`
4. Click **"Save product"**
5. **Copia el Price ID** (empieza con `price_...`)

### Producto 2: Pro (ANNUAL SUBSCRIPTION)

1. Click en **"Add product"** de nuevo
2. Configuración:
   - **Name**: `YENZE Pro`
   - **Description**: `Annual subscription with unlimited deploys and 10 custom domains`
   - **Pricing**:
     - **Price**: `$19.99`
     - **Billing period**: `Yearly`
   - **Tax code**: `Software as a Service (SaaS)`
3. Click **"Save product"**
4. **Copia el Price ID** (empieza con `price_...`)

---

## Paso 3: Configurar Webhook

1. Ve a **Developers > Webhooks**
2. Click en **"Add endpoint"**
3. Configuración:
   - **Endpoint URL**: `https://TU-DOMINIO.vercel.app/api/stripe-webhook`
   - Ejemplo: `https://yenzehtml.vercel.app/api/stripe-webhook`
   - **Events to send**:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
4. Click **"Add endpoint"**
5. **Copia el Webhook Signing Secret** (empieza con `whsec_...`)

---

## Paso 4: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings > Environment Variables**
3. Agrega las siguientes variables:

### Variables de Stripe

```bash
# Stripe Public Key (desde Stripe Dashboard > Developers > API Keys)
STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Stripe Secret Key (desde Stripe Dashboard > Developers > API Keys)
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Webhook Secret (desde Stripe Dashboard > Developers > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs (desde tus productos creados)
STRIPE_PRICE_ONE_TIME=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
```

### Variables de Supabase (ya deberías tenerlas)

```bash
SUPABASE_URL=https://xssdcphepracobbsvqmg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**IMPORTANTE**: Usa `SUPABASE_SERVICE_ROLE_KEY` (NO la anon key) para las funciones serverless.

4. Click **"Save"** en cada variable

---

## Paso 5: Actualizar config.js

Edita el archivo `config.js` y reemplaza:

```javascript
// Stripe Configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_test_xxxxx' // Tu Stripe Public Key
};

// Plans Configuration
const PLANS = {
    // ... (FREE permanece igual)
    ONE_TIME: {
        name: 'Custom Domain',
        price: 7.99,
        period: 'one-time',
        priceId: 'price_xxxxx', // ← Reemplaza con tu Price ID real
        // ... resto igual
    },
    PRO: {
        name: 'Pro',
        price: 19.99,
        period: 'year',
        priceId: 'price_xxxxx', // ← Reemplaza con tu Price ID real
        // ... resto igual
    }
};
```

---

## Paso 6: Habilitar Stripe Customer Portal

1. Ve a **Settings > Billing > Customer Portal**
2. Click en **"Activate test link"**
3. Configuración recomendada:
   - ✅ **Allow customers to update payment methods**
   - ✅ **Allow customers to update billing information**
   - ✅ **Allow customers to view invoices**
   - ✅ **Allow customers to cancel subscriptions** (solo PRO)
   - ❌ **Don't allow cancellation for ONE_TIME** (es pago único)
4. Click **"Save changes"**

---

## Paso 7: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `stripe` - SDK de Stripe
- `@supabase/supabase-js` - Cliente de Supabase
- `micro` - Para parsear webhooks

---

## Paso 8: Deploy a Vercel

```bash
vercel --prod
```

O simplemente haz `git push` si tienes Git integrado con Vercel.

---

## 🧪 Paso 9: Probar en Modo Test

### Tarjetas de Prueba de Stripe

Usa estas tarjetas en modo test:

- ✅ **Pago exitoso**: `4242 4242 4242 4242`
- ❌ **Pago rechazado**: `4000 0000 0000 0002`
- ⏳ **Requiere autenticación**: `4000 0027 6000 3184`

**Datos adicionales para cualquier tarjeta de prueba:**
- **Fecha de expiración**: Cualquier fecha futura (ej: `12/25`)
- **CVC**: Cualquier 3 dígitos (ej: `123`)
- **ZIP**: Cualquier 5 dígitos (ej: `12345`)

### Flujo de Prueba

1. Ve a tu sitio: `https://tu-dominio.vercel.app`
2. Crea una cuenta o inicia sesión
3. Click en **"Upgrade to Pro"** o **"Get Custom Domain"**
4. Usa una tarjeta de prueba
5. Completa el checkout
6. Verifica que:
   - ✅ Stripe webhook se ejecuta (revisa Vercel logs)
   - ✅ La suscripción aparece en Supabase `subscriptions` table
   - ✅ El usuario ve su plan actualizado en el dashboard

---

## 🚀 Paso 10: Pasar a Producción

Cuando estés listo para aceptar pagos reales:

1. **Activa tu cuenta de Stripe**:
   - Completa la información de negocio
   - Conecta una cuenta bancaria

2. **Cambia a claves de producción**:
   - Ve a Stripe Dashboard
   - Cambia de "Test mode" a "Live mode"
   - Copia las nuevas API keys (empiezan con `pk_live_` y `sk_live_`)

3. **Actualiza variables de entorno en Vercel**:
   ```bash
   STRIPE_PUBLIC_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Nuevo webhook para producción
   ```

4. **Crea productos en modo Live**:
   - Repite el Paso 2 pero en modo "Live"
   - Actualiza los Price IDs en las variables de entorno

5. **Configura webhook en modo Live**:
   - Repite el Paso 3 pero en modo "Live"
   - Usa la misma URL: `https://tu-dominio.vercel.app/api/stripe-webhook`

6. **Actualiza config.js** con la `STRIPE_PUBLIC_KEY` de producción

7. **Deploy final**:
   ```bash
   vercel --prod
   ```

---

## 🔍 Debugging

### Ver logs de Stripe Webhook

```bash
vercel logs --follow
```

### Ver eventos en Stripe Dashboard

1. Ve a **Developers > Events**
2. Busca eventos recientes
3. Haz click para ver detalles

### Problemas Comunes

**Error: "No signature found"**
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado
- Asegúrate de que la URL del webhook sea correcta

**Error: "Price not found"**
- Verifica que los Price IDs en las variables de entorno sean correctos
- Asegúrate de estar en el modo correcto (test vs live)

**Webhook no se ejecuta**
- Verifica que la URL sea accesible públicamente
- Revisa los logs de Vercel
- Ve a Stripe Dashboard > Webhooks y revisa el estado

---

## 📊 Monitoreo

### Dashboard de Stripe

- **Payments**: Ver todos los pagos
- **Customers**: Ver clientes
- **Subscriptions**: Ver suscripciones activas
- **Invoices**: Ver facturas

### Supabase Database

Revisa la tabla `subscriptions` para ver:
- Usuarios con planes activos
- Estado de suscripciones
- Fechas de renovación

---

## 💡 Mejoras Futuras (Opcionales)

1. **Cupones y descuentos**: Stripe soporta códigos promocionales
2. **Precios regionales**: Crear precios diferentes por país
3. **Trials gratuitos**: Ofrecer 7-14 días gratis en PRO
4. **Facturación automática**: Email de recibos (Stripe lo hace automático)
5. **Analytics de conversión**: Trackear cuántos usuarios compran

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] Cuenta de Stripe activada
- [ ] Productos creados en modo Live
- [ ] Variables de entorno configuradas en Vercel
- [ ] Webhook configurado y funcionando
- [ ] Probado flujo completo de pago
- [ ] Customer Portal habilitado
- [ ] Stripe Dashboard monitoreado
- [ ] Información legal (Terms of Service, Privacy Policy) actualizada

---

¿Necesitas ayuda? Revisa:
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
