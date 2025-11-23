# Configuración de Stripe para YENZE - Nuevos Precios

## Precios Competitivos a Crear en Stripe

### 1. Plan STARTER

**Opción Mensual:**
- Nombre del producto: "YENZE Starter"
- Precio: $2.99 USD
- Tipo: Recurring
- Intervalo: Monthly
- Copiar Price ID a: `config.js` → `PLANS.STARTER.monthlyPriceId`

**Opción Anual (Recomendada):**
- Nombre del producto: "YENZE Starter (Yearly)"
- Precio: $35.88 USD ($2.99 × 12 = $35.88)
- Tipo: Recurring
- Intervalo: Yearly
- Copiar Price ID a: `config.js` → `PLANS.STARTER.priceId`

### 2. Plan PRO

**Opción Mensual:**
- Nombre del producto: "YENZE Pro"
- Precio: $6.99 USD
- Tipo: Recurring
- Intervalo: Monthly
- Copiar Price ID a: `config.js` → `PLANS.PRO.monthlyPriceId`

**Opción Anual (Recomendada):**
- Nombre del producto: "YENZE Pro (Yearly)"
- Precio: $83.88 USD ($6.99 × 12 = $83.88)
- Tipo: Recurring
- Intervalo: Yearly
- Copiar Price ID a: `config.js` → `PLANS.PRO.priceId`

### 3. Plan BUSINESS

**Opción Mensual:**
- Nombre del producto: "YENZE Business"
- Precio: $14.99 USD
- Tipo: Recurring
- Intervalo: Monthly
- Copiar Price ID a: `config.js` → `PLANS.BUSINESS.monthlyPriceId`

**Opción Anual (Recomendada):**
- Nombre del producto: "YENZE Business (Yearly)"
- Precio: $179.88 USD ($14.99 × 12 = $179.88)
- Tipo: Recurring
- Intervalo: Yearly
- Copiar Price ID a: `config.js` → `PLANS.BUSINESS.priceId`

## Pasos para Crear los Productos en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Click en "Products" en el menú lateral
3. Click en "+ Add product"
4. Rellena los datos según arriba
5. En "Pricing", añade el precio correspondiente
6. Marca como "Recurring"
7. Guarda y copia el Price ID (empieza con `price_`)
8. Pega el Price ID en `public/config.js` en la variable correspondiente

## Configuración de Webhooks

Para manejar eventos de suscripción (pago exitoso, cancelación, etc.), necesitas configurar un webhook:

1. Ve a "Developers" → "Webhooks" en Stripe Dashboard
2. Click "+ Add endpoint"
3. URL del endpoint: `https://yenze.io/api/stripe-webhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el "Signing secret" (empieza con `whsec_`)
6. Guárdalo en variable de entorno: `STRIPE_WEBHOOK_SECRET`

## Metadata Recomendada para Productos

Añade este metadata a cada producto en Stripe para tracking interno:

```json
{
  "plan_id": "starter",  // o "pro", "business"
  "max_projects": "3",   // o "10", "-1" (unlimited)
  "max_pages": "3",      // o "-1" (unlimited)
  "max_views": "5000",   // o "25000", "100000"
  "custom_domain": "false", // o "true"
  "analytics": "false"   // o "true"
}
```

## Estimación de Ingresos con Nuevos Precios

### Escenario Conservador (100 clientes de pago):
- 50 Starter × $2.99 = $149.50/mes
- 40 Pro × $6.99 = $279.60/mes
- 10 Business × $14.99 = $149.90/mes
**Total: $579/mes** = $6,948/año

### Escenario Moderado (500 clientes de pago):
- 200 Starter × $2.99 = $598/mes
- 250 Pro × $6.99 = $1,747.50/mes
- 50 Business × $14.99 = $749.50/mes
**Total: $3,095/mes** = $37,140/año

### Escenario Optimista (1000 clientes de pago):
- 400 Starter × $2.99 = $1,196/mes
- 500 Pro × $6.99 = $3,495/mes
- 100 Business × $14.99 = $1,499/mes
**Total: $6,190/mes** = $74,280/año

## Costos de Vercel por Escenario

### 100 clientes:
- Bandwidth estimado: 10-20GB/mes
- Costo Vercel: $20/mes (Pro plan)
- **Margen: $559/mes (96.5%)**

### 500 clientes:
- Bandwidth estimado: 50-80GB/mes
- Costo Vercel: $20/mes (dentro de 100GB)
- **Margen: $3,075/mes (99.4%)**

### 1000 clientes:
- Bandwidth estimado: 100-150GB/mes
- Costo Vercel: $20-$27.50/mes (100GB + extra)
- **Margen: $6,162-6,170/mes (99.6%)**

## Cálculo de Stripe Fees

Stripe cobra: **2.9% + $0.30 por transacción**

- Starter ($2.99): Fee = $0.39 → Neto = $2.60
- Pro ($6.99): Fee = $0.50 → Neto = $6.49
- Business ($14.99): Fee = $0.74 → Neto = $14.25

## Testing

Usa los test card numbers de Stripe para probar:

**Tarjeta de éxito:**
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

**Tarjeta que requiere autenticación:**
```
Número: 4000 0027 6000 3184
```

## Promociones Recomendadas

### Early Bird (Primeros 100 clientes):
- Starter: $1.99/mes lifetime (33% descuento)
- Pro: $4.99/mes lifetime (29% descuento)
- Crear cupones en Stripe con "duration: forever"

### Black Friday / Cyber Monday:
- 50% descuento en plan anual
- Cupón con "duration: once"

### Referral Program:
- 1 mes gratis por cada referido que pague
- Cupón con "duration: repeating, duration_in_months: 1"
