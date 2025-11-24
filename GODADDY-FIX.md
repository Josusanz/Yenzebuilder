# 🔧 Cómo arreglar framerlms.com en GoDaddy

## Problema Detectado

El dominio `framerlms.com` está devolviendo una página de redirect a `/lander` en lugar del contenido de Vercel.

**Prueba realizada:**
```bash
curl http://framerlms.com
# Devuelve: <script>window.onload=function(){window.location.href="/lander"}</script>
```

Esto confirma que GoDaddy tiene un servicio activo que está interceptando las peticiones.

## ✅ Verificación: Todo lo demás funciona

- ✅ Registros DNS configurados correctamente (A: 76.76.21.21, CNAME: cname.vercel-dns.com)
- ✅ Vercel tiene el dominio agregado y verificado
- ✅ La base de datos tiene el dominio vinculado al proyecto correcto
- ✅ Acceso directo a la IP de Vercel funciona: `curl -H "Host: framerlms.com" https://76.76.21.21/`

## 🎯 Solución: Desactivar servicios de GoDaddy

En GoDaddy, busca y desactiva CUALQUIERA de estos servicios:

### 1. Domain Forwarding / Reenvío de Dominio
**Ubicación:** Domain Settings > Forwarding o Additional Settings > Manage > Forwarding

**Qué buscar:**
- "Forward this domain"
- "Domain Forwarding"
- "Redirect domain"

**Acción:** Si está activado, haz clic en "Edit" o "Manage" y luego "Delete" o "Disable"

---

### 2. Website Builder / Constructor de Sitios
**Ubicación:** My Products > Websites + Marketing

**Qué buscar:**
- "Website Builder"
- "Websites + Marketing"
- "GoCentral"

**Acción:** Si ves que framerlms.com está asociado con algún website builder de GoDaddy, desvinculalo o cancela el servicio.

---

### 3. Parking Page / Página de Parking
**Ubicación:** Domain Settings > Parking

**Qué buscar:**
- "Cash Parking"
- "Monetize this domain"
- "Parked page"

**Acción:** Desactiva el parking si está habilitado.

---

### 4. HTTP Redirect / Redirección HTTP
**Ubicación:** Domain Settings > Manage DNS > Forwarding

Algunos dominios tienen configurado un "HTTP redirect" invisible que no aparece en la sección principal de Forwarding.

**Acción:** Verifica que no haya ninguna regla de redirección activa.

---

## 📋 Pasos detallados

1. **Inicia sesión en GoDaddy:** https://dcc.godaddy.com/

2. **Encuentra tu dominio:**
   - En "My Products" > "All Products and Services"
   - O en "Domain Manager" busca `framerlms.com`

3. **Revisa cada sección:**
   - Haz clic en el dominio `framerlms.com`
   - Revisa las pestañas: Settings, DNS, Forwarding, etc.

4. **Desactiva servicios activos:**
   - Si encuentras algún forwarding: Elimínalo
   - Si hay parking: Desactívalo
   - Si hay website builder: Desvincúlalo

5. **NO toques los registros DNS:**
   - El A record (@) → 76.76.21.21 debe permanecer
   - El CNAME (www) → cname.vercel-dns.com debe permanecer

6. **Guarda y espera:**
   - Los cambios pueden tardar 5-10 minutos en propagarse

---

## 🧪 Cómo verificar que funciona

Después de hacer los cambios en GoDaddy, ejecuta:

```bash
node diagnose-domain-issue.js
```

Deberías ver:
- ✅ "API works correctly!"
- ✅ Content length > 20000 characters

---

## 💡 ¿Por qué pasa esto?

GoDaddy tiene varios servicios que pueden interceptar tu dominio:
- **Parking pages**: Para mostrar anuncios cuando el dominio no está en uso
- **Website builders**: Si usaste alguna vez el constructor de sitios de GoDaddy
- **Forwarding**: Redirecciones configuradas manualmente

Estos servicios tienen prioridad sobre los registros DNS normales, por eso aunque el A record esté bien configurado, GoDaddy sigue mostrando su contenido en lugar del de Vercel.

---

## ⚠️ Si no encuentras ningún servicio activo

Si revisaste todo y no encuentras ningún forwarding/parking/website builder, intenta:

1. **Contactar soporte de GoDaddy:**
   - Diles: "Mi dominio framerlms.com está devolviendo una página con redirect a /lander, necesito desactivar cualquier servicio de GoDaddy que esté interceptando el tráfico"

2. **Transferir el dominio:**
   - Como última opción, puedes transferir el dominio a otro registrar (Cloudflare Registrar, Namecheap, etc.)

---

## 📞 Soporte GoDaddy

- **Teléfono:** Busca el número de tu país en godaddy.com/contact-us
- **Chat:** Disponible 24/7 desde tu panel de GoDaddy
- **Lo que debes decir:** "Mi dominio framerlms.com está mostrando una página de redirect en lugar de resolver a los registros A y CNAME configurados. Necesito desactivar cualquier servicio de proxy, forwarding o parking."
