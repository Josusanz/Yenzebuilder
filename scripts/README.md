# Admin Scripts

Scripts de administración para gestionar usuarios y suscripciones en YENZE.

## 📋 Grant Unlimited Access

Otorga acceso ilimitado (plan Business) a un usuario específico.

### Opción 1: SQL Directo (Recomendado)

1. Ve a tu [Supabase SQL Editor](https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/sql)

2. Abre el archivo `grant-unlimited-access.sql` y copia el contenido

3. Ejecuta el SQL en el editor

4. El usuario **j.sanzuriz@gmail.com** tendrá:
   - ✅ Proyectos ilimitados
   - ✅ Dominios ilimitados
   - ✅ 2GB storage por sitio
   - ✅ 100K visitantes/mes
   - ✅ White-label completo
   - ✅ Analytics avanzados
   - ✅ Acceso API
   - ✅ Válido hasta 2099 (nunca expira)

### Opción 2: Script Node.js

1. **Obtener la Service Role Key:**

   Ve a: https://supabase.com/dashboard/project/xssdcphepracobbsvqmg/settings/api

   Copia la **Service Role Key** (⚠️ NO es la anon key, es la secreta)

2. **Configurar variable de entorno:**

   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
   ```

3. **Ejecutar el script:**

   ```bash
   node scripts/grant-unlimited-access.js j.sanzuriz@gmail.com
   ```

4. **Verificar el resultado:**

   El script mostrará:
   ```
   ✅ SUCCESS! Unlimited access granted:
      Email: j.sanzuriz@gmail.com
      Plan: BUSINESS
      Status: active
      Expires: 2099-12-31T23:59:59Z

   🎉 User now has unlimited projects, domains, and storage!
   ```

## 🔍 Verificar Suscripción

Para verificar que el usuario tiene el plan correcto:

```sql
-- En Supabase SQL Editor
SELECT
    u.email,
    s.plan,
    s.status,
    s.current_period_end,
    s.stripe_subscription_id
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'j.sanzuriz@gmail.com';
```

## 📊 Plan Business - Características

El plan Business incluye:

| Característica | Límite |
|----------------|--------|
| Proyectos | ♾️ Ilimitados |
| Dominios personalizados | ♾️ Ilimitados (999 en config) |
| Visitantes/mes | 100,000 |
| Storage por sitio | 2GB |
| Páginas por sitio | ♾️ Ilimitadas |
| Integraciones | Todas + API |
| Analytics | Avanzados ✓ |
| White-label | Completo ✓ |
| Soporte | Prioritario (24h) |
| API Access | ✓ |
| Branding | Removido ✓ |

## ⚠️ Seguridad

- **NUNCA** compartas la Service Role Key públicamente
- **NUNCA** la subas a Git
- Solo úsala en scripts de administración locales o en Vercel como variable de entorno
- La Service Role Key tiene acceso completo a tu base de datos

## 🎯 Casos de Uso

### Dar acceso gratuito a beta testers
```bash
node scripts/grant-unlimited-access.js beta@example.com
```

### Dar acceso a colaboradores del equipo
```bash
node scripts/grant-unlimited-access.js team@yenze.io
```

### Dar acceso lifetime a clientes especiales
```bash
# Ya configurado para nunca expirar (2099-12-31)
node scripts/grant-unlimited-access.js premium@customer.com
```

## 🔄 Revocar Acceso

Para remover el acceso ilimitado:

```sql
-- Cambiar a plan Free
UPDATE subscriptions
SET
    plan = 'free',
    status = 'canceled',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'usuario@example.com');
```

O eliminar la suscripción completamente:

```sql
DELETE FROM subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'usuario@example.com');
```

## 📝 Notas

- El script usa `stripe_subscription_id = 'unlimited_access'` para identificar grants manuales
- El `stripe_customer_id = 'manual_admin_grant'` indica que no fue vía Stripe
- Estos valores especiales evitan conflictos con suscripciones reales de Stripe
