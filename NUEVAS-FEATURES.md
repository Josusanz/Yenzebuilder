# 🚀 Nuevas Features Implementadas - YENZE Builder

## ✨ Características Agregadas

### 1. 📸 Sistema de Upload de Imágenes

**Ubicación:** Botón "Image" en el toolbar

**Funcionalidades:**
- Drag & drop de imágenes
- Upload desde URL
- Preview antes de subir
- URL copiada automáticamente al clipboard
- Almacenamiento en Supabase Storage

**Formatos soportados:** JPEG, PNG, GIF, WebP, SVG (max 5MB)

**Cómo usar:**
1. Clic en botón "Image"
2. Arrastra imagen o pega URL
3. URL se copia automáticamente
4. Pegar en tu HTML donde necesites

### 2. 🎨 Generador de OG Cards Dinámico

**Ubicación:** Botón "OG Card" en el toolbar

**Funcionalidades:**
- Generación automática de Open Graph images (1200x630px)
- 5 temas predefinidos (gradientes y sólidos)
- Preview en tiempo real
- Auto-injection de meta tags
- Optimizado para Facebook, Twitter, LinkedIn

**Cómo usar:**
1. Clic en "OG Card"
2. Editar título y descripción
3. Elegir tema
4. Preview en tiempo real
5. "Generate & Apply" → Se guarda automáticamente

**Resultado:** Tu sitio se verá increíble cuando lo compartan en redes sociales

### 3. 📊 Sistema de Analytics

**Ubicación:** Botón "Analytics" (aparece solo después de publicar)

**Métricas:**
- Total de visitas
- Visitantes únicos
- Breakdown por dispositivo (Desktop, Mobile, Tablet)
- Top páginas
- Gráfico de visitas diarias (últimos 7 días)

**Privacy-focused:**
- Sin cookies de terceros
- No trackea información personal
- GDPR compliant
- Session ID solo en sessionStorage

**Cómo usar:**
1. Publica tu sitio primero
2. Botón "Analytics" aparecerá automáticamente
3. Clic para ver dashboard visual

### 4. 🌐 Sistema de Deploy Mejorado

**Ubicación:** Botón "Publish" (modal renovado)

**Opciones disponibles:**

#### Cloudflare Pages ⚡
- Deploy global instantáneo
- CDN automático
- HTTPS gratis
- `your-site.pages.dev`

**Setup:**
1. [Crear API Token](https://dash.cloudflare.com/profile/api-tokens)
2. Permisos: "Cloudflare Pages - Edit"
3. Copiar Account ID del dashboard
4. Conectar en YENZE

#### Vercel 🔺
- Edge network deployment
- SSL automático
- DDoS protection
- `your-site.vercel.app`

**Setup:**
1. [Crear Token](https://vercel.com/account/tokens)
2. Scope: "Full Account"
3. Conectar en YENZE

#### YENZE Hosting 🟢
- **FREE:** `yenze.io/s/your-site`
- **Starter:** `your-site.yenze.io` ($2.99/mo)
- **Pro:** Custom domain ($6.99/mo)
- **Business:** Multiple domains ($14.99/mo)

#### Download HTML ⬇️
- Descarga archivo standalone
- Hostea donde quieras
- No depende de YENZE

---

## 🔧 Setup Requerido

### 1. Supabase Storage (para Images & OG Cards)

**En Supabase Dashboard:**
1. Storage → Create bucket → `images`
2. Hacer público el bucket
3. SQL Editor → Ejecutar:

```sql
-- Permitir lectura pública
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'images'
        AND auth.role() = 'authenticated'
    );
```

### 2. Analytics Database

**Ejecutar migración:**
```bash
psql $DATABASE_URL < /Users/josu/yenzehtml/migrations/create-analytics-table.sql
```

O en Supabase SQL Editor, pegar el contenido de ese archivo.

**Qué hace:**
- Crea tabla `analytics_events`
- Configura índices para performance
- Crea políticas RLS
- Crea vista `daily_analytics`

### 3. Verificar que todo funciona

```javascript
// En la consola del builder:

// 1. Test Image Upload
window.imageUploader.showUploadModal((url) => console.log('Image:', url));

// 2. Test OG Card
window.ogCardGenerator.showPreviewModal();

// 3. Test Analytics (después de publicar)
window.analyticsDashboard.showDashboard('project-id-here');

// 4. Test Deploy Modal
window.deployModal.show();
```

---

## 📱 UI Actualizada

### Desktop
```
[Code] [Preview] [Image] [OG Card] [Analytics] [Download] [Publish]
```

### Mobile
```
[⋮ Menu] [Preview] [Publish]
  └─ Upload Image
  └─ OG Card
  └─ Analytics
```

---

## 🎯 Flujo de Trabajo Recomendado

### Para un nuevo proyecto:

1. **Diseñar** tu sitio en el builder
2. **Upload imágenes** usando el botón "Image"
3. **Generar OG Card** con título y descripción
4. **Preview** para verificar
5. **Publish** eligiendo:
   - Cloudflare (recomendado para performance)
   - Vercel (recomendado para simplicidad)
   - YENZE (gratis para empezar)
   - Download (si tienes tu propio hosting)
6. **Ver Analytics** después de algunas visitas

---

## 🐛 Troubleshooting

### Image Upload no funciona
**Solución:**
- Verifica bucket `images` existe y es público
- Revisa RLS policies en Supabase Storage
- Chequea que estás logueado

### OG Card no se genera
**Solución:**
- Mismo que arriba (usa mismo bucket)
- Verifica que el proyecto tiene un nombre

### Analytics no aparece
**Solución:**
- Publica tu sitio primero
- Botón aparece automáticamente después de publicar
- Verifica que tabla `analytics_events` existe

### Deploy a Cloudflare/Vercel falla
**Solución:**
- Verifica API tokens son válidos
- Chequea permisos del token
- Account ID correcto (Cloudflare)
- Revisa console del navegador para error específico

---

## 📚 Archivos Creados

### Frontend
- `/public/image-uploader.js` - Sistema de upload
- `/public/og-card-generator.js` - Generador OG cards
- `/public/yenze-analytics.js` - Analytics client
- `/public/deploy-integrations.js` - Cloudflare/Vercel API
- `/public/deploy-modal.js` - UI del modal

### Backend
- `/api/analytics.js` - Endpoint de tracking

### Database
- `/migrations/create-analytics-table.sql` - Schema

### Docs
- `/IMPROVEMENTS.md` - Comparación con Framely
- `/NUEVAS-FEATURES.md` - Este archivo

---

## 🎨 Comparación YENZE vs Framely

| Feature | YENZE | Framely |
|---------|-------|---------|
| Drag & Drop Builder | ✅ | ✅ |
| Image Upload | ✅ | ✅ |
| OG Card Generator | ✅ | ✅ |
| Analytics | ✅ | ✅ |
| **Multi-platform Deploy** | ✅ | ❌ |
| **Cloudflare Integration** | ✅ | ❌ |
| **Vercel Integration** | ✅ | ❌ |
| **HTML Download** | ✅ | ❌ |
| **Stripe Payments** | ✅ | ❌ |
| **No Build Step** | ✅ | ❌ |
| Custom Domains | ✅ | ✅ |
| Open Source | ✅ | ✅ |

## 🚀 YENZE es MEJOR porque:

1. **Más opciones de deploy** - No estás atado a un proveedor
2. **Más ligero** - HTML puro vs Next.js framework
3. **Monetización incluida** - Stripe integration lista
4. **Más rápido** - No requiere build step
5. **Más flexible** - Puedes descargar y hostear donde quieras

---

## 💡 Tips Pro

### Para mejores OG Cards:
- Títulos cortos (< 60 caracteres)
- Descripciones concisas (< 160 caracteres)
- Usa gradientes para más impacto visual
- Prueba diferentes temas según tu marca

### Para mejores Analytics:
- Espera al menos 1 día después de publicar
- Comparte tu sitio en redes para generar tráfico
- Usa la data para optimizar tu contenido
- Revisa qué páginas son más populares

### Para mejor Deploy:
- **Cloudflare** → Mejor performance global
- **Vercel** → Más simple, mejor DX
- **YENZE** → Gratis para empezar
- **Download** → Control total

---

## 📞 Soporte

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Verifica setup de Supabase
3. Chequea que estás logueado
4. Lee los mensajes de error
5. Revisa este documento

---

**¡Disfruta las nuevas features! 🎉**
