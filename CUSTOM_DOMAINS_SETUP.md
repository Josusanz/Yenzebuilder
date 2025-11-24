# Custom Domains Setup with Vercel

Este documento explica cómo configurar custom domains usando Vercel en lugar de Cloudflare.

## 🔧 Configuración Inicial

### 1. Obtener Token de Vercel

1. Ve a [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Crea un nuevo token con permisos completos
3. Guarda el token de forma segura

### 2. Obtener Project ID

1. Ve a tu proyecto en Vercel
2. Settings → General
3. Copia el "Project ID"

### 3. Configurar Variables de Entorno

Añade estas variables en Vercel (Settings → Environment Variables):

```
VERCEL_TOKEN=your_vercel_api_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=optional_for_team_accounts
```

También añádelas localmente en tu archivo `.env`:
```bash
cp .env.example .env
# Edita .env y completa los valores
```

## 📊 Migración de Base de Datos

Ejecuta la migración SQL en Supabase:

```sql
-- Ver archivo: migrations/migrate-custom-domains-to-vercel.sql
```

Esta migración:
- ✅ Añade columnas para Vercel: `vercel_verified`, `verification_record`, `cname_target`
- ✅ Crea trigger para `updated_at` automático
- ✅ Añade índices para mejor rendimiento
- ⚠️ Mantiene columnas de Cloudflare por compatibilidad (puedes eliminarlas manualmente)

## 🚀 Cómo Funciona

### Para el Usuario:

1. **Añadir dominio:**
   - Usuario selecciona un proyecto
   - Ingresa su dominio (ej: `midominio.com`)
   - Sistema añade el dominio a Vercel vía API

2. **Configurar DNS:**
   - Sistema muestra instrucciones con el CNAME correcto
   - Usuario añade CNAME en su registrador (GoDaddy, Namecheap, etc.)
   - Ejemplo:
     ```
     Type: CNAME
     Name: @ (o www)
     Value: cname.vercel-dns.com (o tu-proyecto.vercel.app)
     TTL: 3600
     ```

3. **Verificar:**
   - Usuario hace click en "Verify Domain"
   - Sistema consulta Vercel API para verificar DNS
   - Si está configurado correctamente, dominio pasa a "active"
   - Vercel provisiona SSL automáticamente

### Limitaciones por Plan:

- **Free / Starter:** No custom domains
- **Pro ($6.99/mo):** 1 custom domain
- **Business ($14.99/mo):** Unlimited custom domains

## 🔗 API Endpoints

### POST /api/add-custom-domain
Añade un dominio personalizado al proyecto Vercel

**Body:**
```json
{
  "domain": "midominio.com",
  "projectId": "proyecto_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "domain": { ... },
  "instructions": {
    "title": "Configure DNS Records",
    "records": [
      {
        "type": "CNAME",
        "name": "@",
        "value": "cname.vercel-dns.com",
        "ttl": "3600"
      }
    ]
  }
}
```

### POST /api/verify-custom-domain
Verifica el estado de un dominio

**Body:**
```json
{
  "domainId": "domain_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "domain": { ... },
  "vercel": {
    "verified": true,
    "verification": [...]
  },
  "message": "Domain is active and SSL is configured"
}
```

## 🛠️ Troubleshooting

### Dominio no verifica

1. **Espera 30 minutos** - DNS puede tardar en propagar
2. **Verifica el CNAME** - Usa herramientas como [DNS Checker](https://dnschecker.org)
3. **Revisa el valor correcto** - Debe apuntar al dominio de Vercel mostrado
4. **Elimina proxies** - Si usas Cloudflare, desactiva el proxy (nube gris)

### Error: "Failed to configure domain with Vercel"

- Verifica que `VERCEL_TOKEN` y `VERCEL_PROJECT_ID` estén configurados
- Revisa que el token tenga permisos suficientes
- Chequea los logs de Vercel para más detalles

### Error: "Custom domains require PRO or BUSINESS plan"

- Usuario necesita upgrade a Pro ($6.99/mo) o Business ($14.99/mo)
- Redirige a `/dashboard.html?section=billing`

## 📝 Notas Adicionales

- **SSL Automático:** Vercel provisiona certificados SSL automáticamente una vez verificado el DNS
- **WWW vs Root:** Puedes usar tanto `example.com` como `www.example.com`
- **Subdominios:** También soportados (ej: `blog.example.com`)
- **DNS Providers:** Compatible con todos los registradores (GoDaddy, Namecheap, Cloudflare DNS, etc.)

## 🔄 Diferencias con Cloudflare

| Aspecto | Cloudflare (anterior) | Vercel (nuevo) |
|---------|---------------------|----------------|
| Hosting | Cloudflare Workers | Vercel Edge Network |
| DNS Config | Nameservers completos | Solo CNAME |
| SSL | Manual con TXT | Automático |
| Verificación | Compleja | Simple |
| Tiempo | 24-48 horas | 5-30 minutos |

## ✅ Checklist de Migración

- [x] Actualizar `add-custom-domain.js` para usar Vercel API
- [x] Actualizar `verify-custom-domain.js` para usar Vercel API
- [x] Crear migración SQL para nuevas columnas
- [x] Actualizar UI frontend con instrucciones DNS correctas
- [x] Actualizar límites de planes (Pro: 1, Business: unlimited)
- [x] Crear `.env.example` con variables Vercel
- [ ] Ejecutar migración SQL en Supabase
- [ ] Configurar variables de entorno en Vercel
- [ ] Probar añadir dominio de prueba
- [ ] Verificar SSL automático funciona

## 📞 Soporte

Si necesitas ayuda, contacta al equipo de desarrollo con:
- Logs de Vercel
- ID del dominio problemático
- Registrador DNS usado
