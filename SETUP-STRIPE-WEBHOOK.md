# 🔗 Configurar Webhook de Stripe para yenze.io

## Paso 1: Ir a Stripe Dashboard

1. Ve a: **https://dashboard.stripe.com/webhooks**
2. (O desde el dashboard principal: **Developers** → **Webhooks**)

---

## Paso 2: Agregar Endpoint

1. Click en el botón **"Add endpoint"** o **"Add an endpoint"**

2. En el formulario que aparece:

### **Endpoint URL**
```
https://yenze.io/api/stripe-webhook
```

**IMPORTANTE**: Usa `yenze.io` (tu dominio personalizado), NO uses las URLs de vercel.app

### **Description** (Opcional)
```
YENZE Payment Webhook
```

### **Events to send**

Click en **"Select events"** y busca/selecciona estos 6 eventos:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Tip**: Puedes usar la búsqueda para encontrarlos rápidamente.

3. Click en **"Add endpoint"** al final del formulario

---

## Paso 3: Copiar el Webhook Signing Secret

Después de crear el endpoint:

1. Verás una pantalla con detalles del webhook
2. Busca la sección **"Signing secret"**
3. Click en **"Reveal"** o el ícono del ojo
4. **Copia el secret completo** (empieza con `whsec_...`)

**IMPORTANTE**: Copia el secret ahora. Lo necesitarás en el siguiente paso.

---

## Paso 4: Agregar el Secret a Vercel

Abre tu terminal y ejecuta:

```bash
vercel env add STRIPE_WEBHOOK_SECRET
```

Te preguntará:

1. **What's the value of STRIPE_WEBHOOK_SECRET?**
   - Pega el secret que copiaste (el que empieza con `whsec_...`)
   - Presiona Enter

2. **Add STRIPE_WEBHOOK_SECRET to which Environments?**
   - Selecciona: **Production** (presiona espacio para seleccionar)
   - Selecciona: **Preview** (presiona espacio)
   - Selecciona: **Development** (presiona espacio)
   - Presiona Enter cuando tengas los 3 seleccionados

---

## Paso 5: Redeploy

Ejecuta:

```bash
vercel --prod
```

Esto hará un nuevo deploy con la variable de entorno configurada.

---

## ✅ Verificación

### Verificar que la variable se agregó:

```bash
vercel env ls
```

Deberías ver `STRIPE_WEBHOOK_SECRET` en la lista.

### Probar el webhook:

1. Ve a Stripe Dashboard → Webhooks
2. Click en tu webhook recién creado
3. Click en la pestaña **"Send test webhook"**
4. Selecciona `checkout.session.completed`
5. Click en **"Send test webhook"**

**Resultado esperado**: Deberías ver un código de respuesta `200 OK` o similar.

---

## 🔍 Troubleshooting

### Error: "No signature found"
- Verifica que agregaste `STRIPE_WEBHOOK_SECRET` correctamente
- Asegúrate de hacer redeploy después de agregar la variable

### Error: "404 Not Found"
- Verifica que la URL sea exactamente: `https://yenze.io/api/stripe-webhook`
- Asegúrate de que el archivo `/api/stripe-webhook.js` existe en tu proyecto

### Webhook no se ejecuta
- Revisa los logs de Vercel: `vercel logs --follow`
- Revisa el historial de webhooks en Stripe Dashboard

---

## 📊 Monitoreo

### Ver eventos del webhook en Stripe:

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click en tu webhook
3. Ve a la pestaña **"Events"**
4. Verás todos los eventos enviados y sus respuestas

### Ver logs en Vercel:

```bash
vercel logs --follow
```

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

- ✅ Los pagos se procesarán correctamente
- ✅ Los usuarios recibirán acceso después de pagar
- ✅ Las suscripciones se sincronizarán con Supabase
- ✅ Los webhooks se registrarán en los logs

---

## 📝 Resumen de URLs

| Servicio | URL |
|----------|-----|
| **Tu sitio** | https://yenze.io |
| **Webhook endpoint** | https://yenze.io/api/stripe-webhook |
| **Stripe Dashboard** | https://dashboard.stripe.com |
| **Stripe Webhooks** | https://dashboard.stripe.com/webhooks |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## 🔐 Seguridad

- ✅ El `STRIPE_WEBHOOK_SECRET` es secreto y está encriptado en Vercel
- ✅ Solo se usa en las funciones serverless (API routes)
- ✅ Nunca se expone en el código frontend
- ✅ Stripe lo usa para verificar que los webhooks son legítimos
