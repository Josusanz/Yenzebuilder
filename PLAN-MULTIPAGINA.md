# Plan de Implementación: Sistema Multipágina

## Inspiración
- Google Stitch: https://stitch.withgoogle.com/
- Framer: Sistema híbrido single/multi página

## Objetivos

1. **Compatibilidad**: Mantener proyectos single-page existentes funcionando
2. **Flexibilidad**: Permitir crear proyectos multipágina desde cero
3. **SEO Mejorado**: Cada página con sus propios metadatos
4. **Navegación**: Sistema de rutas y enlaces internos
5. **Gestión Fácil**: UI intuitiva para añadir/editar/eliminar páginas

## Arquitectura de Datos

### Estructura actual:
```json
{
  "id": "uuid",
  "name": "My Project",
  "html": "<html>...</html>",  // Single page
  "seo_metadata": {}
}
```

### Nueva estructura (multipágina):
```json
{
  "id": "uuid",
  "name": "My Project",
  "project_type": "single" | "multi",  // Nuevo campo
  "html": "<html>...</html>",  // Para single-page (legacy)
  "pages": [  // Nuevo: para multipágina
    {
      "id": "page-1",
      "slug": "home" | "",  // "" = homepage
      "name": "Home",
      "title": "Home Page",
      "html": "<html>...</html>",
      "seo_metadata": {
        "meta_title": "",
        "meta_description": "",
        "og_image": ""
      },
      "is_homepage": true,
      "created_at": "2025-01-15",
      "updated_at": "2025-01-15"
    },
    {
      "id": "page-2",
      "slug": "about",
      "name": "About Us",
      "title": "About Us",
      "html": "<html>...</html>",
      "seo_metadata": {},
      "is_homepage": false
    },
    {
      "id": "page-3",
      "slug": "contact",
      "name": "Contact",
      "title": "Contact Us",
      "html": "<html>...</html>",
      "seo_metadata": {}
    }
  ],
  "navigation": {  // Navegación global del sitio
    "items": [
      { "label": "Home", "link": "/", "page_id": "page-1" },
      { "label": "About", "link": "/about", "page_id": "page-2" },
      { "label": "Contact", "link": "/contact", "page_id": "page-3" }
    ]
  }
}
```

## Cambios en Base de Datos

### Migración SQL:
```sql
-- Añadir columnas para soporte multipágina
ALTER TABLE projects
  ADD COLUMN project_type VARCHAR(10) DEFAULT 'single' CHECK (project_type IN ('single', 'multi')),
  ADD COLUMN pages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN navigation JSONB DEFAULT '{}'::jsonb;

-- Index para búsqueda de páginas por slug
CREATE INDEX idx_projects_pages ON projects USING GIN (pages);
```

## Flujo de URLs

### Single-page (actual):
- `https://proyecto.yenze.io` → Muestra el HTML único

### Multipágina (nuevo):
- `https://proyecto.yenze.io/` → Homepage (página con slug = "")
- `https://proyecto.yenze.io/about` → Página About
- `https://proyecto.yenze.io/contact` → Página Contact
- `https://proyecto.yenze.io/blog/post-1` → Soporte para rutas anidadas

## API Endpoints Necesarios

### 1. **Crear nueva página**
`POST /api/pages/create`
```json
{
  "projectId": "uuid",
  "slug": "about",
  "name": "About Us",
  "html": "<html>...</html>"
}
```

### 2. **Listar páginas del proyecto**
`GET /api/pages/list?projectId=uuid`

### 3. **Actualizar página**
`PUT /api/pages/update`
```json
{
  "projectId": "uuid",
  "pageId": "page-1",
  "html": "<html>...</html>",
  "seo_metadata": {}
}
```

### 4. **Eliminar página**
`DELETE /api/pages/delete`
```json
{
  "projectId": "uuid",
  "pageId": "page-2"
}
```

### 5. **Convertir proyecto single → multi**
`POST /api/projects/convert-to-multi`

### 6. **Reordenar páginas**
`POST /api/pages/reorder`

## Servidor de Rutas (Routing)

### Archivo: `api/route-handler.js`
Intercepta todas las requests y:
1. Detecta si el proyecto es single o multi
2. Si es multi, extrae el slug de la URL
3. Sirve el HTML de la página correspondiente
4. Si la página no existe, muestra 404

```javascript
// Ejemplo de lógica
const slug = url.pathname.replace(/^\//, '') || '';  // "" = homepage
const page = project.pages.find(p => p.slug === slug);

if (page) {
  return page.html;
} else {
  return render404Page();
}
```

## UI/UX - Dashboard

### Panel de Páginas (nuevo tab)
```
┌─────────────────────────────────────────┐
│  📄 Pages (3)              [+ New Page] │
├─────────────────────────────────────────┤
│  🏠 Home          /           [Edit] ⋮  │
│  📋 About         /about      [Edit] ⋮  │
│  ✉️  Contact      /contact    [Edit] ⋮  │
└─────────────────────────────────────────┘
```

### Cada página tiene:
- **Preview**: Vista previa del diseño
- **Edit**: Abrir en editor visual
- **SEO**: Configurar metadatos específicos de la página
- **Duplicate**: Duplicar página
- **Delete**: Eliminar página
- **Settings**: Slug, título, configuración

### Navegación Builder
Visual drag-and-drop para crear menús:
```
┌─────────────────────────────────────┐
│  Navigation Menu                    │
├─────────────────────────────────────┤
│  ≡ Home       →  /                  │
│  ≡ About      →  /about             │
│  ≡ Services   →  /services          │
│    ≡ Web      →  /services/web      │
│    ≡ Mobile   →  /services/mobile   │
│  ≡ Contact    →  /contact           │
│                                     │
│  [+ Add Menu Item]                  │
└─────────────────────────────────────┘
```

## Generación de Sitemap (actualizado)

Para multipágina, el sitemap incluye TODAS las páginas:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://proyecto.yenze.io/</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://proyecto.yenze.io/about</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://proyecto.yenze.io/contact</loc>
    <lastmod>2025-01-14</lastmod>
    <priority>0.7</priority>
  </url>
</urlset>
```

## Compatibilidad con Google Stitch

Google Stitch genera sitios multipágina con:
- ✅ Navegación entre páginas
- ✅ Diseño responsivo
- ✅ Componentes reutilizables
- ✅ SEO optimizado por página

Nuestro sistema soportará:
1. **Importar proyectos de Stitch**: Detectar estructura y convertir
2. **Componentes compartidos**: Header/Footer globales
3. **Temas**: Aplicar estilos consistentes a todas las páginas

## Fases de Implementación

### Fase 1: Backend (Base)
- [ ] Migración de base de datos
- [ ] API para CRUD de páginas
- [ ] Router para manejar múltiples URLs
- [ ] Actualizar generación de sitemap

### Fase 2: Dashboard UI
- [ ] Panel de gestión de páginas
- [ ] Editor para cada página individual
- [ ] Navigation builder
- [ ] Convertir proyecto single → multi

### Fase 3: SEO Multipágina
- [ ] SEO metadata por página
- [ ] Audit SEO por página
- [ ] Sitemap dinámico
- [ ] Robots.txt actualizado

### Fase 4: Features Avanzados
- [ ] Templates de página (Home, About, Contact, Blog, etc.)
- [ ] Componentes globales (Header, Footer)
- [ ] Temas y estilos compartidos
- [ ] Sistema de preview para todas las páginas

### Fase 5: Importación/Exportación
- [ ] Importar proyectos de Google Stitch
- [ ] Exportar como zip con todas las páginas
- [ ] Integración con otros builders

## Beneficios

1. **SEO**: Cada página optimizada individualmente
2. **Escalabilidad**: Sitios con decenas de páginas
3. **Profesionalismo**: Sitios más completos y profesionales
4. **Compatibilidad**: Con herramientas modernas como Stitch
5. **Flexibilidad**: El usuario elige single o multi

## Próximos Pasos

1. ¿Aprobar el plan?
2. Empezar con Fase 1 (Backend)
3. Crear migración de base de datos
4. Desarrollar APIs de páginas
5. Implementar router

---

**Nota**: Todo esto mantendrá compatibilidad con proyectos single-page existentes.
