# 🔧 Solución: builder.yenze.io muestra landing en lugar del builder

## 🔍 Problema

`builder.yenze.io` está mostrando la landing page (`/index.html`) en lugar del editor (`/public/index.html`).

**Causa:** Los rewrites condicionales con `has: [{ type: "host" }]` en `vercel.json` solo funcionan DESPUÉS de que el subdominio esté configurado en Vercel Dashboard.

## ✅ Solución Paso a Paso

### 1. Agregar `builder.yenze.io` en Vercel Dashboard

1. Ve a: https://vercel.com/josus-projects-95701179/yenzehtml/settings/domains

2. Click en **"Add Domain"**

3. Escribe: `builder.yenze.io`

4. Click **"Add"**

5. Vercel te mostrará instrucciones de DNS (probablemente ya están configuradas si usas Vercel DNS)

### 2. Verificar DNS

Si gestionas DNS fuera de Vercel:

```
Type: CNAME
Name: builder
Value: cname.vercel-dns.com
TTL: Auto
```

Si usas **Vercel DNS**: No necesitas hacer nada, Vercel lo configura automáticamente.

### 3. Esperar Propagación (5-30 minutos)

Después de agregar el dominio, espera unos minutos para que:
- Vercel genere el certificado SSL
- DNS se propague
- Los rewrites condicionales empiecen a funcionar

### 4. Verificar

Abre estas URLs en ventana incógnita:

- **yenze.io** → Debería mostrar landing page
- **builder.yenze.io** → Debería mostrar el editor
- **builder.yenze.io/dashboard.html** → Debería mostrar dashboard

## 🔄 Si Sigue Sin Funcionar

Si después de agregar el dominio en Vercel aún no funciona:

### Opción A: Force Redeploy

```bash
vercel --prod --yes --force
```

### Opción B: Verificar en Vercel Logs

```bash
vercel logs --prod
```

Busca errores relacionados con rewrites o routing.

### Opción C: Verificar que el dominio esté "Ready"

En Vercel Dashboard → Domains, `builder.yenze.io` debe mostrar:
- ✅ **Valid Configuration**
- 🔒 **SSL Certificate: Active**

Si muestra "Pending" o "Invalid", hay un problema de DNS.

## 🎯 Cómo Funciona la Configuración Actual

### vercel.json

```json
{
  "rewrites": [
    {
      "source": "/s/:slug",
      "destination": "/api/view-project?slug=:slug"
    },
    {
      "source": "/",
      "destination": "/public/index.html",
      "has": [
        {
          "type": "host",
          "value": "builder.yenze.io"
        }
      ]
    },
    {
      "source": "/:path*",
      "destination": "/public/:path*",
      "has": [
        {
          "type": "host",
          "value": "builder.yenze.io"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/public/:path*",
      "destination": "https://builder.yenze.io/:path*",
      "permanent": true
    }
  ]
}
```

**Explicación:**
1. Si el host es `builder.yenze.io`, sirve archivos de `/public/`
2. Si el host es `yenze.io` (o cualquier otro), sirve `/index.html` (landing)
3. Si alguien intenta `/public/`, redirige a `builder.yenze.io`

## 📁 Estructura de Archivos

```
/
├── index.html              # Landing page (yenze.io)
├── landing/
│   └── index.html          # Backup de landing
├── public/
│   ├── index.html          # Editor (builder.yenze.io)
│   ├── dashboard.html      # Dashboard
│   ├── login.html          # Login
│   ├── signup.html         # Signup
│   └── ...                 # Todos los archivos del builder
└── api/
    └── ...                 # API functions
```

## 🧪 Testing

### Desde tu terminal:

```bash
# Test landing page
curl -I https://yenze.io

# Test builder (debería redirigir o dar 200)
curl -I https://builder.yenze.io

# Check DNS
dig builder.yenze.io
```

### Desde el navegador:

1. Abre ventana incógnita (para evitar cache)
2. Ve a `https://builder.yenze.io`
3. Si muestra el editor → ✅ FUNCIONA
4. Si muestra la landing → ⏳ Espera más tiempo o verifica que el dominio esté agregado

## 🚨 Troubleshooting

### Error: "This domain is not configured"

**Solución:** Necesitas agregar `builder.yenze.io` en Vercel Dashboard primero.

### Error: Certificate Error / SSL Error

**Solución:** Espera a que Vercel genere el certificado SSL (5-10 minutos después de agregar el dominio).

### Error: Muestra 404

**Solución:**
1. Verifica que `/public/index.html` exista
2. Haz force redeploy: `vercel --prod --yes --force`

### Error: Redirige a yenze.io

**Solución:** El DNS puede estar apuntando incorrectamente. Verifica:
```bash
dig builder.yenze.io
```
Debe mostrar `cname.vercel-dns.com` en la respuesta.

## ✅ Checklist Final

- [ ] `builder.yenze.io` agregado en Vercel Dashboard
- [ ] DNS configurado (CNAME a cname.vercel-dns.com)
- [ ] SSL Certificate activo (check verde en Vercel)
- [ ] Wait 5-30 minutos para propagación
- [ ] Test en ventana incógnita
- [ ] Force redeploy si es necesario

## 📞 Si Nada Funciona

Alternativa temporal: Puedes usar la URL directa de Vercel para el builder:

```
https://yenzehtml.vercel.app/public/
```

Pero esto no es la solución final. El dominio `builder.yenze.io` DEBE estar agregado en Vercel para que los rewrites condicionales funcionen.
