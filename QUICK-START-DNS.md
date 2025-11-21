# 🚀 Quick Start - Configurar DNS para yenze.io

Tienes **2 opciones** para configurar tu dominio:

---

## ✨ Opción 1: Automático (Recomendado)

### Paso 1: Obtener API Keys de GoDaddy

1. Ve a: **https://developer.godaddy.com/keys**
2. Click en **"Create New API Key"**
3. Configuración:
   - **Name**: `YENZE DNS Setup`
   - **Environment**: ✅ **Production** (importante!)
4. Click **"Next"**
5. **Copia ambas claves inmediatamente** (no las podrás ver después):
   - API Key (empieza con algo como `dGH7j8K...`)
   - API Secret (empieza con algo como `Hs9Kj2...`)

### Paso 2: Ejecutar el Script

Abre tu terminal y ejecuta:

```bash
cd /Users/josu/yenzehtml
./setup-godaddy-dns.sh
```

Cuando te pida las claves, pégalas y presiona Enter.

**¡Listo!** El script configurará automáticamente:
- ✅ A record: `yenze.io` → `76.76.21.21`
- ✅ CNAME record: `www.yenze.io` → `cname.vercel-dns.com`

---

## 🖱️ Opción 2: Manual

Si prefieres hacerlo manualmente, sigue estos pasos:

### Paso 1: Ir a GoDaddy DNS

1. Ve a: **https://godaddy.com**
2. Inicia sesión
3. Ve a **"My Products"**
4. Encuentra **yenze.io**
5. Click en **"DNS"**

### Paso 2: Agregar/Editar Registros

#### Registro 1: A Record
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   600
```

#### Registro 2: CNAME Record
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   600
```

**IMPORTANTE**: Si ya existen registros para `@` o `www`, **edítalos** en lugar de crear nuevos.

### Paso 3: Guardar

Click en **"Save"**

---

## ⏰ Después de Configurar

Da igual qué opción elijas, ahora debes:

1. **Esperar 5-15 minutos** para propagación de DNS
2. **Vercel verificará automáticamente** el dominio
3. **Recibirás un email** cuando esté listo

### Verificar el Estado

```bash
# Ver estado de dominios en Vercel
vercel domains ls

# Después de 10-15 minutos, verificar DNS
dig yenze.io
dig www.yenze.io
```

---

## ✅ Resultado Final

Cuando esté listo verás:

```bash
$ vercel domains ls
✓ yenze.io (verified)
✓ www.yenze.io (verified)
```

Y podrás acceder a:
- **https://yenze.io** → Tu aplicación YENZE
- **https://www.yenze.io** → Tu aplicación YENZE
- ✅ SSL automático (HTTPS)
- ✅ Redirección automática HTTP → HTTPS

---

## 🆘 Si Algo No Funciona

### El script da error de autenticación
- Verifica que usaste las claves correctas
- Asegúrate de haber seleccionado **"Production"** en GoDaddy
- Verifica que no haya espacios al copiar las claves

### Después de 15 minutos el dominio no funciona
- Ve a GoDaddy DNS y verifica los registros manualmente
- Asegúrate de que no haya registros duplicados
- Ejecuta `dig yenze.io` para ver a dónde apunta

### Necesitas ayuda
Revisa el archivo completo: `GODADDY-DNS-SETUP.md`

---

## 📊 Resumen

| Opción | Tiempo | Dificultad | Requiere |
|--------|--------|------------|----------|
| **Automático** | 2 min | ⭐️ Fácil | API Keys de GoDaddy |
| **Manual** | 5 min | ⭐️⭐️ Media | Acceso a GoDaddy UI |

**Recomendación**: Usa el método automático si te sientes cómodo con el terminal. Es más rápido y menos propenso a errores.
