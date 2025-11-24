# Configuración DNS para framerlms.com

## Problema Detectado ❌

El dominio `framerlms.com` ya está agregado en Vercel y verificado, pero la configuración DNS es incorrecta.

## Configuración Actual (INCORRECTA):

```
Type: A
Name: @
Value: 76.76.21.21  ← No es la IP de Vercel

Type: CNAME
Name: www
Value: cname.vercel-dns.com  ← No es el dominio específico del proyecto
```

## Configuración Correcta:

### Opción 1: Usar CNAME en root (si tu proveedor lo permite)

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Opción 2: Usar solo www (MÁS FÁCIL - RECOMENDADO)

1. **Elimina el registro A actual** (`@ → 76.76.21.21`)

2. **Actualiza el CNAME de www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

3. **Configura redirección en tu proveedor DNS:**
   - Redirige `framerlms.com` → `www.framerlms.com`
   - Esto se hace en la configuración de tu registrador (GoDaddy/Namecheap/etc.)

### Opción 3: Usar registros A de Vercel (si no puedes usar CNAME en root)

1. **Elimina el registro A actual** (`@ → 76.76.21.21`)

2. **Agrega los registros A de Vercel:**
```
Type: A
Name: @
Value: 76.76.2.3
TTL: 3600
```

3. **IPv6 (opcional pero recomendado):**
```
Type: AAAA
Name: @
Value: 2606:4700:10::6814:4c03
TTL: 3600
```

4. **CNAME para www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

## Verificar DNS

Después de hacer los cambios, espera 5-30 minutos y verifica:

```bash
# Verificar CNAME de www
dig www.framerlms.com CNAME +short

# Debería mostrar: cname.vercel-dns.com

# Verificar que resuelve correctamente
curl -I https://www.framerlms.com
```

## Verificar en Vercel

Vercel ya tiene el dominio verificado. Una vez que el DNS esté correcto, debería funcionar automáticamente.

Para verificar el estado en Vercel:
```bash
node verify-vercel-connection.js
```

## Troubleshooting

### El dominio no carga después de configurar DNS

1. **Espera más tiempo** - DNS puede tardar hasta 48 horas (normalmente 5-30 minutos)

2. **Verifica con DNS Checker:**
   - https://dnschecker.org/#CNAME/www.framerlms.com

3. **Si usas Cloudflare como DNS:**
   - Desactiva el proxy (nube gris, no naranja)
   - El proxy de Cloudflare puede interferir con Vercel

4. **Revisa los logs de Vercel:**
   ```bash
   vercel logs https://yenzehtml-pz84ojdx1-josus-projects-95701179.vercel.app
   ```

## Estado Actual

- ✅ Dominio agregado en Vercel: `framerlms.com`
- ✅ Verificado en Vercel: Sí
- ❌ DNS configurado correctamente: No
- ⏳ Esperando cambios DNS del usuario

## Próximos Pasos

1. Ve a tu proveedor DNS (donde compraste framerlms.com)
2. Actualiza los registros según una de las opciones arriba
3. Espera 5-30 minutos
4. Prueba acceder a https://www.framerlms.com (o https://framerlms.com según qué opción elegiste)
