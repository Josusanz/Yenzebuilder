# ✅ Test Custom Domains - Guía de Verificación

## Estado Actual
- ✅ Migración SQL ejecutada en Supabase
- ✅ Variables de entorno configuradas en Vercel:
  - `VERCEL_TOKEN`: ykzNz2K9WqbCu27mpJgRm6ih
  - `VERCEL_PROJECT_ID`: prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M
- ✅ Código desplegado en producción
- ✅ URL: https://yenzehtml-7270ewzqb-josus-projects-95701179.vercel.app

## Cómo Probar Custom Domains

### 1. Acceder al Dashboard
1. Ve a: https://yenzehtml-7270ewzqb-josus-projects-95701179.vercel.app/dashboard.html
2. Inicia sesión con tu cuenta
3. Asegúrate de tener plan **Pro** o **Business** activo

### 2. Ir a Custom Domains
1. En el sidebar del dashboard, busca la sección "Custom Domains"
2. Haz click para acceder

### 3. Añadir un Dominio de Prueba

**Opción A - Si tienes un dominio real:**
1. Click en "+ Add Domain"
2. Selecciona un proyecto de la lista
3. Ingresa tu dominio (ej: `midominio.com` o `www.midominio.com`)
4. Click "Add Domain"

**Opción B - Dominio de prueba (recomendado primero):**
- Puedes usar un subdominio de un servicio gratuito como:
  - FreeDNS: https://freedns.afraid.org
  - Duck DNS: https://www.duckdns.org
  - No-IP: https://www.noip.com

### 4. Configurar DNS

Después de añadir el dominio, verás instrucciones como:

```
Type: CNAME
Name: @ (o www)
Value: prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M.vercel.app
TTL: 3600
```

**Pasos:**
1. Ve al panel de control de tu registrador de dominios (GoDaddy, Namecheap, etc.)
2. Busca la sección de DNS Management
3. Añade un registro CNAME con los valores mostrados
4. Guarda los cambios

### 5. Verificar el Dominio

1. Espera 5-30 minutos para propagación DNS
2. En el dashboard, click en "🔄 Verify Domain"
3. Si DNS está configurado correctamente:
   - Estado cambiará de "⏳ Pending" a "✅ Active"
   - SSL se provisionará automáticamente
   - Podrás visitar tu sitio en el dominio custom

## 🔍 Verificar que Funciona Correctamente

### Check 1: Variables de Entorno
```bash
# Desde terminal, verifica que las variables existen:
vercel env ls
```
Debes ver `VERCEL_TOKEN` y `VERCEL_PROJECT_ID` listados.

### Check 2: API Endpoints
Puedes probar los endpoints directamente:

**Test Add Domain (requiere auth):**
```bash
curl -X POST https://yenzehtml-7270ewzqb-josus-projects-95701179.vercel.app/api/add-custom-domain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{
    "domain": "test.example.com",
    "projectId": "your-project-uuid"
  }'
```

### Check 3: Base de Datos
En Supabase SQL Editor, verifica que las columnas nuevas existen:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'custom_domains'
AND column_name IN ('vercel_verified', 'verification_record', 'cname_target', 'updated_at');
```

Debes ver 4 filas.

## 🐛 Troubleshooting

### Error: "Custom domains require PRO or BUSINESS plan"
**Solución:**
- Asegúrate de tener una suscripción activa Pro o Business
- Ve a Dashboard → Billing para verificar tu plan actual
- Si es necesario, actualiza tu plan

### Error: "Vercel configuration missing"
**Solución:**
- Verifica que las variables de entorno estén configuradas:
  ```bash
  vercel env pull .env.local
  cat .env.local | grep VERCEL
  ```
- Si faltan, añádelas de nuevo:
  ```bash
  vercel env add VERCEL_TOKEN
  vercel env add VERCEL_PROJECT_ID
  ```

### Error: "Failed to verify domain"
**Posibles causas:**
1. **DNS no propagado aún** - Espera más tiempo (hasta 48h en casos raros)
2. **CNAME incorrecto** - Verifica que apunta a `prj_XvfaglvHZ8n3zh6bhjqzMT3p4O9M.vercel.app`
3. **Proxy activado** - Si usas Cloudflare DNS, desactiva el proxy (nube gris)
4. **Root domain** - Algunos registradores no permiten CNAME en root (@), usa `www` en su lugar

**Herramientas de diagnóstico:**
- DNS Checker: https://dnschecker.org
- DNS Lookup: https://mxtoolbox.com/DNSLookup.aspx
- Vercel CLI: `vercel dns ls`

### El dominio verifica pero no carga el sitio
**Solución:**
1. Verifica que el proyecto esté desplegado y funcionando
2. Revisa los logs de Vercel:
   ```bash
   vercel logs https://yenzehtml-7270ewzqb-josus-projects-95701179.vercel.app
   ```
3. Asegúrate de que el dominio custom apunte al proyecto correcto en Vercel

## 📊 Monitoreo

### Ver logs de API
```bash
vercel logs --follow
```

### Ver dominios en Vercel directamente
1. Ve a: https://vercel.com/josus-projects-95701179/yenzehtml/settings/domains
2. Deberías ver los dominios custom añadidos vía API

### Consultar dominios en base de datos
```sql
SELECT
  domain,
  status,
  vercel_verified,
  cname_target,
  created_at,
  verified_at
FROM custom_domains
ORDER BY created_at DESC;
```

## ✅ Checklist Final

Antes de considerar el sistema 100% funcional:

- [ ] Usuario con plan Pro/Business puede acceder a Custom Domains
- [ ] Usuario con plan Free/Starter ve mensaje de upgrade
- [ ] Se puede añadir un dominio y se crea en Vercel
- [ ] Instrucciones DNS muestran el CNAME correcto
- [ ] Verificación funciona y cambia estado a "active"
- [ ] SSL se provisiona automáticamente
- [ ] Sitio carga correctamente en dominio custom
- [ ] Se respetan límites: Pro (1 dominio), Business (ilimitados)
- [ ] Se puede eliminar un dominio

## 🎯 Próximos Pasos Recomendados

1. **Probar con dominio real** - Usa un dominio que tengas o compra uno barato en Namecheap
2. **Documentar para usuarios** - Crear guía de usuario sobre cómo añadir dominios
3. **Automatizar verificación** - Considerar webhook de Vercel para actualizar estado automáticamente
4. **Mejorar UX** - Mostrar estado de propagación DNS en tiempo real
5. **Email notifications** - Notificar cuando dominio está verificado

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `vercel logs --follow`
2. Verifica variables de entorno: `vercel env ls`
3. Consulta documentación Vercel: https://vercel.com/docs/rest-api/endpoints#domains
4. Revisa este archivo de troubleshooting
