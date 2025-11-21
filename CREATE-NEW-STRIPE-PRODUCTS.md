# 💳 Crear Nuevos Productos en Stripe

## ✅ Nueva Estructura de Precios

| Plan | Precio Anterior | Precio Nuevo | Cambio |
|------|----------------|--------------|--------|
| FREE | $0 | $0 | Sin cambios |
| ONE_TIME | $7.99 (one-time) | ❌ **ELIMINADO** | - |
| **STARTER** | - | ✅ **$12/año** | Nuevo |
| PRO | $19.99/año | ✅ **$49/año** | +$29 |

---

## 🚀 Paso 1: Crear Producto STARTER

### En Stripe Dashboard

1. Ve a: **https://dashboard.stripe.com/products**
2. Click en **"Add product"**
3. Configuración:

```
Product name: YENZE Starter
Description: Annual subscription with premium subdomain and analytics

Pricing:
├─ Price: $12.00
├─ Billing period: Yearly
├─ Currency: USD
└─ Tax code: Software as a Service (SaaS) - automatically applied

```

4. Click **"Save product"**
5. **COPIA el Price ID** (empieza con `price_...`)

---

## 🚀 Paso 2: Crear Producto PRO

1. Click en **"Add product"** de nuevo
2. Configuración:

```
Product name: YENZE Pro
Description: Annual subscription with custom domains and advanced features

Pricing:
├─ Price: $49.00
├─ Billing period: Yearly
├─ Currency: USD
└─ Tax code: Software as a Service (SaaS) - automatically applied
```

3. Click **"Save product"**
4. **COPIA el Price ID** (empieza con `price_...`)

---

## 🔧 Paso 3: Actualizar Price IDs en Vercel

Una vez tengas los dos Price IDs, ejecuta:

### Agregar STRIPE_PRICE_STARTER

```bash
echo "price_xxxxx" > /tmp/price_starter.txt
vercel env add STRIPE_PRICE_STARTER production < /tmp/price_starter.txt
vercel env add STRIPE_PRICE_STARTER preview < /tmp/price_starter.txt
vercel env add STRIPE_PRICE_STARTER development < /tmp/price_starter.txt
rm /tmp/price_starter.txt
```

### Actualizar STRIPE_PRICE_PRO

```bash
echo "price_xxxxx" > /tmp/price_pro.txt
vercel env rm STRIPE_PRICE_PRO production
vercel env rm STRIPE_PRICE_PRO preview
vercel env rm STRIPE_PRICE_PRO development
vercel env add STRIPE_PRICE_PRO production < /tmp/price_pro.txt
vercel env add STRIPE_PRICE_PRO preview < /tmp/price_pro.txt
vercel env add STRIPE_PRICE_PRO development < /tmp/price_pro.txt
rm /tmp/price_pro.txt
```

---

## 📝 Paso 4: Actualizar config.js

Reemplaza los Price IDs en el archivo:

```javascript
STARTER: {
    name: 'Starter',
    price: 12.00,
    period: 'year',
    priceId: 'price_xxxxx', // ← TU PRICE ID DE STARTER
    // ...
},
PRO: {
    name: 'Pro',
    price: 49.00,
    period: 'year',
    priceId: 'price_xxxxx', // ← TU PRICE ID DE PRO
    // ...
}
```

---

## 🗑️ Paso 5: Archivar Producto Antiguo (Opcional)

Si quieres limpiar Stripe:

1. Ve a: **https://dashboard.stripe.com/products**
2. Busca el producto **"Custom Domain"** ($7.99)
3. Click en los 3 puntos → **"Archive product"**
4. Busca el producto **"Pro"** ($19.99)
5. Click en los 3 puntos → **"Archive product"**

**IMPORTANTE**: Solo archiva después de migrar todos los usuarios existentes.

---

## 👥 Migrar Usuarios Existentes

Si ya tienes usuarios con el plan anterior ($19.99/año):

### Opción A: Mantenerlos en $19.99 (grandfathered)
- Déjalos con su precio actual
- Obtienen todas las features de PRO
- Marketing: "Early bird pricing"

### Opción B: Migrarlos a $49
- Avísales con 30 días de anticipación
- Ofrece descuento: "Como early adopter, $29/año por siempre"
- En Stripe: Actualiza su suscripción al nuevo producto

---

## ✅ Checklist

Antes de lanzar los nuevos precios:

- [ ] Productos creados en Stripe
- [ ] Price IDs copiados
- [ ] Variables de entorno actualizadas en Vercel
- [ ] config.js actualizado con los Price IDs
- [ ] Redeploy hecho: `vercel --prod`
- [ ] Probado checkout con tarjeta de prueba
- [ ] Verificado webhook funciona
- [ ] Comunicado a usuarios existentes (si aplica)

---

## 🧪 Probar los Nuevos Precios

### Modo Test

1. En Stripe Dashboard, cambia a **"Test mode"**
2. Crea productos de prueba con los mismos precios
3. Actualiza las variables de entorno con los test Price IDs
4. Prueba el flujo completo de compra

### Tarjeta de Prueba

```
Card number: 4242 4242 4242 4242
Expiry: 12/25 (cualquier fecha futura)
CVC: 123
ZIP: 12345
```

---

## 💰 Proyección de Ingresos

### Escenario Conservador (100 usuarios)
- 70 FREE: $0
- 20 STARTER: 20 × $12 = $240/año
- 10 PRO: 10 × $49 = $490/año
- **Total**: $730/año ($60/mes)

### Escenario Optimista (500 usuarios)
- 350 FREE: $0
- 100 STARTER: 100 × $12 = $1,200/año
- 50 PRO: 50 × $49 = $2,450/año
- **Total**: $3,650/año ($304/mes)

### Escenario Ambicioso (1000 usuarios)
- 700 FREE: $0
- 200 STARTER: 200 × $12 = $2,400/año
- 100 PRO: 100 × $49 = $4,900/año
- **Total**: $7,300/año ($608/mes)

**Costo de infraestructura**: $0 (Cloudflare + wildcard subdomain gratis)

---

## 📊 Comparación con Competencia

| Herramienta | Plan Básico | Plan Pro | YENZE |
|-------------|-------------|----------|-------|
| **Webflow** | $14/mes ($168/año) | $23/mes ($276/año) | $12/año o $49/año |
| **Framer** | $20/mes ($240/año) | $30/mes ($360/año) | $12/año o $49/año |
| **Wix** | $16/mes ($192/año) | $27/mes ($324/año) | $12/año o $49/año |
| **Carrd** | $19/año | $49/año | $12/año o $49/año |

**Ventaja competitiva**: Tus precios son muy competitivos, especialmente STARTER a $12/año.

---

## 🎯 Siguiente Paso

Una vez hayas creado los productos en Stripe y actualizado los Price IDs, avísame para:

1. Implementar el sistema de subdominios wildcard
2. Configurar DNS en GoDaddy
3. Hacer el deploy final

¿Listo para crear los productos en Stripe?
