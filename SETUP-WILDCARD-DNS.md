# 🌐 Configurar Wildcard DNS para Subdominios

## ✅ Lo Que Vamos a Lograr

Después de esta configuración, TODOS los subdominios de yenze.io funcionarán automáticamente:
- `usuario1.yenze.io` ✅
- `empresa.yenze.io` ✅
- `miproyecto.yenze.io` ✅
- `cualquier-cosa.yenze.io` ✅

**Sin tener que configurar cada uno manualmente!**

---

## 🔧 Paso 1: Agregar Wildcard Record en GoDaddy

1. Ve a: **https://dcc.godaddy.com/control/yenze.io/dns**
   (O GoDaddy → My Products → yenze.io → DNS)

2. En la sección **"Registros DNS"**, click en **"Añadir un registro nuevo"**

3. Configuración del registro:

```
Tipo:  A
Nombre: *
Valor: 76.76.21.21
TTL:   600 (o 1 hora)
```

**IMPORTANTE**: El nombre es literalmente un asterisco: `*`

4. Click en **"Guardar"**

---

## 🚀 Paso 2: Agregar Wildcard Domain a Vercel

Después de configurar el DNS, ejecuta:

```bash
vercel domains add *.yenze.io
```

Vercel te preguntará si estás seguro, confirma con `y`.

---

## ⏰ Paso 3: Esperar Propagación

- **Tiempo estimado**: 5-15 minutos
- **Máximo**: 1-2 horas (raro)

Para verificar si ya propagó:

```bash
# Verificar DNS
dig random-test.yenze.io

# Deberías ver 76.76.21.21 en la respuesta
```

---

## ✅ Verificación

Una vez configurado, prueba:

```bash
# Verificar que Vercel aceptó el wildcard
vercel domains ls

# Deberías ver:
# *.yenze.io    Third Party    Third Party    -    tu-usuario    Xm ago
```

---

## 🎯 Cómo Funcionará

### Usuario FREE crea proyecto "mi-portfolio"
1. Usuario elige nombre: `mi-portfolio`
2. Sistema crea subdomain: `mi-portfolio.yenze.io`
3. DNS wildcard automáticamente lo resuelve a 76.76.21.21
4. Vercel recibe la petición
5. Nuestro código detecta subdomain = "mi-portfolio"
6. Busca proyecto con slug "mi-portfolio" en DB
7. Sirve el HTML del proyecto

**Todo automático, sin configuración manual!**

---

## 📋 Resumen Visual

```
Antes (actual):
usuario.yenze.io ❌ No funciona
empresa.yenze.io ❌ No funciona

Después (con wildcard):
*.yenze.io → 76.76.21.21 (Vercel)
  ↓
usuario.yenze.io ✅ Funciona
empresa.yenze.io ✅ Funciona
miproyecto.yenze.io ✅ Funciona
cualquier-cosa.yenze.io ✅ Funciona
```

---

## 🔍 Troubleshooting

### Error: "Domain not verified" en Vercel
- Espera 10-15 minutos para propagación DNS
- Verifica que el registro `*` esté en GoDaddy
- Ejecuta: `dig random.yenze.io` y verifica que responda con 76.76.21.21

### Error: "Wildcard domains not supported"
- Asegúrate de usar exactamente: `*.yenze.io`
- No uses: `www.*.yenze.io` o `*` solo

### Subdominio no carga
- Verifica que Vercel aceptó el wildcard: `vercel domains ls`
- Verifica DNS: `dig tuprueba.yenze.io`
- Revisa logs de Vercel: `vercel logs --follow`

---

## 💰 Costo

**$0 adicional**

- DNS wildcard en GoDaddy: Gratis (incluido con el dominio)
- Wildcard domain en Vercel: Gratis
- Subdominios ilimitados: Gratis
- SSL para todos los subdominios: Gratis (Vercel lo maneja)

---

## 🎉 Siguiente Paso

Una vez configurado el wildcard DNS y agregado a Vercel, estarás listo para implementar el sistema de subdominios en el código.

Avísame cuando:
1. ✅ Hayas agregado el registro `*` en GoDaddy
2. ✅ Hayas ejecutado `vercel domains add *.yenze.io`
3. ✅ Veas `*.yenze.io` en `vercel domains ls`

Entonces procederemos a implementar el código para servir contenido dinámico por subdominio!
