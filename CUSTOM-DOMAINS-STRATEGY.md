# 🌐 Estrategia de Custom Domains para YENZE

## 💰 Análisis de Rentabilidad

### Opción 1: Vercel Domains
| Concepto | Costo |
|----------|-------|
| Cobro al usuario (ONE_TIME) | +$7.99 |
| Costo Vercel por dominio | -$15-20 |
| **Ganancia** | **-$7-12 (PÉRDIDA)** |

| Concepto | Costo |
|----------|-------|
| Cobro al usuario (PRO/año) | +$19.99 |
| Costo Vercel (10 dominios) | -$150-200 |
| **Ganancia** | **-$130-180 (PÉRDIDA)** |

**Conclusión**: ❌ No rentable con Vercel

---

### Opción 2: Cloudflare (RECOMENDADO)
| Concepto | Costo |
|----------|-------|
| Cobro al usuario (ONE_TIME) | +$7.99 |
| Costo Cloudflare API | $0 |
| **Ganancia** | **+$7.99** |

| Concepto | Costo |
|----------|-------|
| Cobro al usuario (PRO/año) | +$19.99 |
| Costo Cloudflare (10 dominios) | $0 |
| **Ganancia** | **+$19.99** |

**Conclusión**: ✅ 100% rentable

---

### Opción 3: Subdominios yenze.io
| Concepto | Costo |
|----------|-------|
| Cobro al usuario (ONE_TIME) | +$7.99 |
| Costo DNS en GoDaddy | $0 |
| **Ganancia** | **+$7.99** |

| Concepto | Costo |
|----------|-------|
| Cobro al usuario (PRO/año) | +$19.99 |
| Costo DNS (10 subdominios) | $0 |
| **Ganancia** | **+$19.99** |

**Conclusión**: ✅ 100% rentable, pero menos atractivo para usuarios

---

## 🎯 Estrategia Recomendada: Modelo Híbrido

### FREE Plan - $0
```
✅ Subdominios ilimitados: proyecto.yenze.app
✅ Editor completo
✅ Includes YENZE badge
```
**Costo para ti**: $0
**Ganancia**: $0 (adquisición de usuarios)

### STARTER Plan - $7.99 (ONE-TIME)
```
✅ 1 deploy con subdominio premium: empresa.yenze.io
✅ Remove YENZE badge
✅ SSL certificate
✅ Analytics básicos
ℹ️ Custom domain setup assistance (manual)
```
**Costo para ti**: $0
**Ganancia**: $7.99

**Implementación**: Automático para subdominios, manual para custom domains

### PRO Plan - $19.99/año
```
✅ Deploys ilimitados
✅ Hasta 10 custom domains (automático via Cloudflare)
✅ Remove YENZE badge
✅ Analytics avanzados
✅ Priority support
✅ SSL certificates automáticos
```
**Costo para ti**: $0
**Ganancia**: $19.99/año por usuario

**Implementación**: Totalmente automático via Cloudflare API

---

## 🚀 Plan de Implementación

### Fase 1: Subdominios (2-3 horas de desarrollo)
**Para FREE y STARTER:**
1. Usuario crea proyecto
2. Usuario elige nombre: `miempresa`
3. Sistema crea: `miempresa.yenze.io`
4. Deploy automático a ese subdominio

**Implementación:**
```javascript
// Cuando usuario hace deploy
const subdomain = `${projectName}.yenze.io`;

// Agregar dominio a Vercel via CLI
await exec(`vercel domains add ${subdomain} --project=yenzehtml`);

// O via API
await vercel.domains.add(subdomain);
```

**Ventajas:**
- ✅ Rápido de implementar
- ✅ 100% rentable
- ✅ No requiere que usuario configure DNS
- ✅ SSL automático

---

### Fase 2: Custom Domains con Cloudflare (1-2 días de desarrollo)
**Solo para PRO:**

#### Paso 1: Usuario compra PRO y agrega dominio
```javascript
// En el dashboard
user.addCustomDomain('miempresa.com');
```

#### Paso 2: Sistema verifica dominio
```javascript
// Verificar que dominio esté en Cloudflare
const zone = await cloudflare.zones.get(domain);
if (!zone) {
  return 'Please add your domain to Cloudflare first';
}
```

#### Paso 3: Sistema configura DNS automáticamente
```javascript
// Crear A record
await cloudflare.dns.create({
  type: 'A',
  name: '@',
  content: '76.76.21.21', // IP de Vercel
  proxied: true, // Cloudflare proxy = SSL gratis
  ttl: 1
});

// Crear CNAME para www
await cloudflare.dns.create({
  type: 'CNAME',
  name: 'www',
  content: 'cname.vercel-dns.com',
  proxied: true,
  ttl: 1
});
```

#### Paso 4: Deploy automático
```javascript
// Agregar dominio a Vercel
await vercel.domains.add('miempresa.com');

// Deploy proyecto a ese dominio
await vercel.deploy({
  project: userProject,
  domain: 'miempresa.com'
});
```

**Costo total de implementación:**
- API de Cloudflare: Gratis
- API de Vercel: Gratis
- SSL via Cloudflare: Gratis

---

## 📋 Requisitos para Custom Domains (PRO)

### Lo que necesitas implementar:

1. **Cloudflare Account**
   - Crear cuenta gratis en Cloudflare
   - Obtener API Token con permisos de DNS

2. **API Integration**
   - Integrar Cloudflare API en tu backend
   - Crear funciones serverless para gestionar DNS

3. **UI en Dashboard**
   - Sección "Custom Domains" en dashboard de usuario
   - Input para agregar dominio
   - Instrucciones para configurar Cloudflare
   - Estado de verificación (pending → verified)

4. **Verificación de Dominio**
   - Verificar que usuario haya agregado dominio a Cloudflare
   - Verificar que nameservers apunten a Cloudflare
   - Auto-configurar DNS cuando esté listo

5. **Deploy Automático**
   - Cuando dominio esté verificado, deploy automático
   - Configurar SSL automáticamente
   - Redirigir www → dominio principal

---

## 🔧 Código de Ejemplo

### Backend: Agregar Custom Domain (API Route)

```javascript
// /api/add-custom-domain.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import Cloudflare from 'cloudflare';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const cloudflare = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, domain, projectId } = req.body;

  // 1. Verificar que usuario tenga plan PRO
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('plan', 'PRO')
    .eq('status', 'active')
    .single();

  if (!subscription) {
    return res.status(403).json({ error: 'PRO plan required' });
  }

  // 2. Verificar límite de dominios (máximo 10 para PRO)
  const { data: domains } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('user_id', userId);

  if (domains.length >= 10) {
    return res.status(400).json({ error: 'Maximum 10 domains for PRO plan' });
  }

  // 3. Verificar que dominio esté en Cloudflare
  try {
    const zones = await cloudflare.zones.list({ name: domain });

    if (zones.result.length === 0) {
      return res.status(400).json({
        error: 'Domain not found in Cloudflare',
        instructions: 'Please add your domain to Cloudflare first'
      });
    }

    const zoneId = zones.result[0].id;

    // 4. Crear DNS records en Cloudflare
    await cloudflare.dns.records.create(zoneId, {
      type: 'A',
      name: '@',
      content: '76.76.21.21',
      proxied: true,
      ttl: 1
    });

    await cloudflare.dns.records.create(zoneId, {
      type: 'CNAME',
      name: 'www',
      content: 'cname.vercel-dns.com',
      proxied: true,
      ttl: 1
    });

    // 5. Agregar dominio a Vercel
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec(`vercel domains add ${domain} --project=yenzehtml`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // 6. Guardar en base de datos
    await supabase.from('custom_domains').insert({
      user_id: userId,
      project_id: projectId,
      domain: domain,
      status: 'verified',
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Custom domain configured successfully',
      domain: domain,
      ssl: 'Generating (2-5 minutes)'
    });

  } catch (error) {
    console.error('Error configuring custom domain:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 📊 Tabla de Supabase Necesaria

```sql
CREATE TABLE custom_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, error
  cloudflare_zone_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  error_message TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_project ON custom_domains(project_id);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);
```

---

## 🎨 UI Necesaria en Dashboard

### Sección "Custom Domains" (solo visible para PRO)

```
┌─────────────────────────────────────────┐
│ Custom Domains (2/10 used)              │
├─────────────────────────────────────────┤
│                                         │
│ ✅ miempresa.com                        │
│    Status: Verified | SSL: Active      │
│    [Remove]                             │
│                                         │
│ ⏳ otraempresa.com                      │
│    Status: Verifying... | SSL: Pending │
│    [Check Status]                       │
│                                         │
│ [+ Add New Domain]                      │
│                                         │
└─────────────────────────────────────────┘
```

### Modal: Add Domain

```
┌─────────────────────────────────────────┐
│ Add Custom Domain                       │
├─────────────────────────────────────────┤
│                                         │
│ Enter your domain:                      │
│ [miempresa.com                       ]  │
│                                         │
│ Instructions:                           │
│ 1. Add your domain to Cloudflare       │
│ 2. Change nameservers to Cloudflare    │
│ 3. Click "Verify & Configure"          │
│                                         │
│ [Cancel] [Verify & Configure]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💵 Proyección de Ganancias

### Escenario Conservador
- 100 usuarios FREE: $0
- 20 usuarios STARTER: 20 × $7.99 = $159.80
- 10 usuarios PRO: 10 × $19.99 = $199.90
- **Total mes 1**: $359.70
- **Costo infraestructura**: $0 (Cloudflare gratis)
- **Ganancia neta**: $359.70

### Escenario Optimista (6 meses)
- 500 usuarios FREE: $0
- 100 usuarios STARTER: 100 × $7.99 = $799
- 50 usuarios PRO: 50 × $19.99 = $999.50
- **Total**: $1,798.50/mes
- **Costo infraestructura**: $0
- **Ganancia neta**: $1,798.50/mes

---

## ✅ Recomendación Final

**Implementa el Modelo Híbrido:**

1. **AHORA (Esta semana)**:
   - Implementa subdominios para FREE y STARTER
   - Usa `proyecto.yenze.io` para STARTER
   - 100% automático, 100% rentable

2. **PRÓXIMA FASE (Próximas 2 semanas)**:
   - Implementa Cloudflare integration para PRO
   - Custom domains automáticos
   - Límite de 10 dominios por usuario PRO

3. **FUTURO (Opcional)**:
   - Plan ENTERPRISE con dominios ilimitados ($99/año)
   - White-label para agencias

**Ventajas de esta estrategia:**
- ✅ Empiezas a generar ingresos YA con subdominios
- ✅ 100% rentable desde día 1
- ✅ Escalable a custom domains cuando tengas usuarios
- ✅ No pagas nada a terceros
- ✅ Todo automatizado

---

¿Quieres que implemente primero el sistema de subdominios automáticos?
