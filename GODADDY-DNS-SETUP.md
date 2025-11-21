# 🌐 Configurar yenze.io en GoDaddy para Vercel

## ✅ Estado: Dominios agregados a Vercel

- ✅ `yenze.io` - agregado
- ✅ `www.yenze.io` - agregado

Ahora solo falta configurar los DNS en GoDaddy.

---

## Paso 1: Acceder a GoDaddy DNS

1. Ve a https://godaddy.com
2. Inicia sesión con tu cuenta
3. Ve a **"My Products"** (Mis Productos)
4. Encuentra **yenze.io** en la lista de dominios
5. Click en **"DNS"** o **"Manage DNS"**

---

## Paso 2: Configurar DNS Records en GoDaddy

Ve a la sección **DNS Records** y configura estos dos registros:

### Registro 1: Dominio raíz (yenze.io)

```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   600 (o 1 Hour)
```

### Registro 2: Subdominio WWW (www.yenze.io)

```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   600 (o 1 Hour)
```

**IMPORTANTE**: Si ya existen registros A o CNAME para `@` o `www`, **edítalos** en lugar de crear nuevos.

---

## Paso 3: Guardar y Esperar

1. Click **"Save"** en GoDaddy
2. Espera **5-15 minutos** para que los cambios se propaguen
3. Vercel automáticamente verificará el dominio
4. Recibirás un email de Vercel cuando esté listo

---

## Paso 4: Verificar configuración

### Desde tu terminal:

```bash
# Ver estado de dominios
vercel domains ls

# Verificar DNS (después de 10-15 minutos)
dig yenze.io
dig www.yenze.io
```

### Desde el navegador:

- https://dnschecker.org - Busca `yenze.io`
- Verifica que apunte a `76.76.21.21`

---

## 🎯 Resultado Final

Una vez propagado el DNS (5-15 minutos):

- ✅ **https://yenze.io** → Tu aplicación YENZE HTML Builder
- ✅ **https://www.yenze.io** → Tu aplicación YENZE HTML Builder
- ✅ Certificado SSL automático (HTTPS)
- ✅ Redirección HTTP → HTTPS automática
- ✅ Todas las URLs de Vercel redirigen al dominio personalizado

---

## 📊 Resumen de DNS Records

| Type  | Name | Value                | TTL | Propósito          |
|-------|------|----------------------|-----|--------------------|
| A     | @    | 76.76.21.21          | 600 | Dominio raíz       |
| CNAME | www  | cname.vercel-dns.com | 600 | Subdominio www     |

---

## 🔧 Solución de Problemas

### Error: "Domain not configured" después de 15 minutos

**Posibles causas:**
- DNS no ha propagado completamente (espera hasta 48 horas)
- El registro A no apunta a `76.76.21.21`
- Hay múltiples registros A conflictivos
- El TTL es muy alto (debería ser 600 o 3600)

**Solución:**
1. Ve a GoDaddy DNS
2. Borra todos los registros A duplicados para `@`
3. Asegúrate de que solo haya uno apuntando a `76.76.21.21`
4. Espera otros 10 minutos

### Error: "SSL certificate pending"

**Esto es normal!** Vercel tarda 2-5 minutos en generar el certificado SSL después de verificar el dominio.

### www.yenze.io no funciona

**Verifica:**
1. Que el registro CNAME para `www` exista
2. Que apunte a `cname.vercel-dns.com` (no a una IP)
3. Que no haya otros registros CNAME o A para `www`

---

## ⚡ Comandos Útiles

```bash
# Ver todos los dominios configurados
vercel domains ls

# Ver información del proyecto
vercel

# Forzar nuevo deploy en producción
vercel --prod

# Remover un dominio (si necesitas)
vercel domains rm yenze.io
```

---

## 📧 Notificaciones

Vercel te enviará emails a tu cuenta cuando:
- ✅ El dominio sea verificado exitosamente
- ✅ El certificado SSL esté listo
- ❌ Haya algún error en la configuración

---

## 🎉 ¡Listo!

Una vez que veas en la consola:

```bash
vercel domains ls
```

Algo como:
```
✓ yenze.io (verified)
✓ www.yenze.io (verified)
```

¡Tu dominio personalizado está funcionando! 🚀

Visita: **https://yenze.io**
