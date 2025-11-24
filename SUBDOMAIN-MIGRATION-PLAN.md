# 🌐 Migración a Sistema de Subdominios

## Estado Actual vs Objetivo

| Aspecto | Actual | Objetivo |
|---------|--------|----------|
| **FREE Plan** | `yenze.io/s/username` | `yenze.io/s/username` (sin cambios) |
| **STARTER Plan** | `yenze.io/s/username` | `username.yenze.io` |
| **PRO Plan** | `yenze.io/s/username` | `username.yenze.io` |
| **BUSINESS Plan** | `yenze.io/s/username` | `username.yenze.io` + custom domain |

## Fase 1: Configuración de Infraestructura

### 1.1 DNS Configuration (Cloudflare/Tu proveedor)
```
Tipo: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: Auto
```

### 1.2 Vercel Domain Configuration
1. Ve a: https://vercel.com/josus-projects-95701179/yenzehtml/settings/domains
2. Click "Add Domain"
3. Añade: `*.yenze.io`
4. Vercel verificará el CNAME
5. SSL se configura automáticamente

## Fase 2: Cambios en Base de Datos

### 2.1 Añadir columna `subdomain_slug` a tabla `projects`

**Ya existe** ✅ - Verificado en el esquema actual

### 2.2 Migrar datos existentes
```sql
-- Migrar public_slug a subdomain_slug para proyectos con planes pagos
UPDATE projects p
SET subdomain_slug = p.public_slug
FROM subscriptions s
WHERE p.user_id = s.user_id
  AND s.status = 'active'
  AND s.plan IN ('starter', 'pro', 'business')
  AND p.subdomain_slug IS NULL;
```

## Fase 3: Cambios en Código

### 3.1 Crear nueva API: `/api/subdomain-handler.js`
Manejará requests a `*.yenze.io` y servirá el proyecto correcto.

### 3.2 Actualizar `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/s/:slug",
      "destination": "/api/view-project?slug=:slug"
    }
  ],
  "functions": {
    "api/subdomain-handler.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 3.3 Modificar lógica de publicación en `app.js`
- Detectar plan del usuario
- FREE → generar `public_slug` (path-based)
- STARTER/PRO/BUSINESS → generar `subdomain_slug` (subdomain)

### 3.4 Actualizar `config.js`
```javascript
FREE: {
    deploymentType: 'path',
    subdomainSupport: false
},
STARTER: {
    deploymentType: 'subdomain',
    subdomainSupport: true,
    customDomain: true
},
PRO: {
    deploymentType: 'subdomain',
    subdomainSupport: true,
    customDomain: true
},
BUSINESS: {
    deploymentType: 'both', // Subdomain + custom domain
    subdomainSupport: true,
    customDomain: true,
    multipleCustomDomains: true
}
```

## Fase 4: UI Changes

### 4.1 Publish Modal
Mostrar preview de la URL según el plan:
- FREE: `yenze.io/s/your-site`
- STARTER+: `your-site.yenze.io`

### 4.2 Dashboard
Mostrar subdomain asignado en la lista de proyectos.

### 4.3 Settings
Permitir cambiar el subdomain (verificando disponibilidad).

## Fase 5: Migración de Usuarios Existentes

### 5.1 Notificación
Email a usuarios con planes pagos informando:
- Nueva URL con subdomain
- URL antigua seguirá funcionando (redirect)
- Pueden personalizar su subdomain

### 5.2 Redirecciones
Mantener `/s/:slug` funcionando con redirect 301 a subdomain para planes pagos.

## Fase 6: Testing

### 6.1 Casos de prueba
- [ ] FREE user publish → `yenze.io/s/test`
- [ ] STARTER user publish → `test.yenze.io`
- [ ] Subdomain availability check
- [ ] Subdomain uniqueness validation
- [ ] SSL certificate auto-generation
- [ ] Analytics tracking en subdominios
- [ ] Badge removal en subdominios

### 6.2 Edge cases
- [ ] Subdomain con caracteres especiales
- [ ] Subdomain ya existente
- [ ] Usuario cambia de plan
- [ ] Multiple projects, same subdomain
- [ ] Reserved subdomains (www, mail, admin, etc.)

## Fase 7: Reserved Subdomains

Prevenir uso de subdominios reservados:
```javascript
const RESERVED_SUBDOMAINS = [
  'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  'admin', 'api', 'app', 'blog', 'shop',
  'dashboard', 'cdn', 'static', 'assets',
  'staging', 'dev', 'test', 'demo'
];
```

## Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Fase 1 (DNS/Vercel) | 5 min | Acceso a DNS |
| Fase 2 (DB) | 2 min | - |
| Fase 3 (Código) | 30 min | - |
| Fase 4 (UI) | 20 min | Fase 3 |
| Fase 5 (Migración) | - | Decisión manual |
| Fase 6 (Testing) | 15 min | Fase 4 |

**Total: ~1.5 horas**

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| DNS no propaga | Baja | Alto | Usar Cloudflare (propagación rápida) |
| Colisión subdominios | Media | Medio | Validación + tabla de subdominios únicos |
| Usuarios confundidos | Media | Bajo | Comunicación clara + redirecciones |
| SSL no se genera | Baja | Alto | Vercel Pro maneja automáticamente |

## Rollback Plan

Si algo sale mal:
1. Comentar rewrites de subdomain en `vercel.json`
2. Deploy
3. Todos los proyectos vuelven a `/s/:slug`
4. Sin pérdida de datos

## Próximos Pasos

1. ✅ Confirmar que tienes Vercel Pro
2. ⏳ Configurar DNS wildcard
3. ⏳ Añadir `*.yenze.io` en Vercel
4. ⏳ Implementar código
5. ⏳ Testing
6. ⏳ Deploy

¿Listo para empezar?
