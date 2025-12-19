# Plan de Implementación: Sistema Multipágina

## 📋 Resumen Ejecutivo

Implementar un sistema completo de gestión multipágina que permita a los usuarios crear sitios web con páginas separadas físicamente, cada una con su propio archivo HTML, mientras se mantiene compatibilidad con el sistema actual de página única.

**Enfoque:** Sistema híbrido que soporta tanto proyectos de página única como multipágina.

---

## 🎯 Objetivos

✅ Permitir crear y gestionar múltiples páginas independientes
✅ Cada página con su propia URL, metadata SEO y contenido
✅ Editor que permite navegar entre páginas
✅ Publicación que genera archivos HTML separados
✅ Sitemap.xml automático para SEO
✅ Analytics por página
✅ Compatibilidad con proyectos existentes (migración automática)

---

## 📊 Análisis de Situación Actual

### ✅ Lo que YA existe:
- Feature flag `multipage: true` en todos los planes
- Campo `page_url` en tabla `analytics_events`
- Soporte de dominios personalizados y subdominios
- Sistema de publicación con Vercel
- Prompt generator con opción multipágina
- Commits históricos de características multipágina

### ❌ Lo que FALTA:
- Tabla `pages` en la base de datos
- UI para gestionar páginas en el editor
- Lógica de navegación entre páginas
- Sistema de enrutamiento para páginas publicadas
- Generación de múltiples archivos HTML
- Navegación automática entre páginas

---

## 🗄️ FASE 1: Diseño de Base de Datos

### Nueva tabla: `pages`

```sql
-- =====================================================
-- PAGES TABLE
-- Stores individual pages for multi-page projects
-- =====================================================
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Page identification
    slug VARCHAR(255) NOT NULL, -- URL slug (e.g., 'about', 'contact')
    title VARCHAR(500) NOT NULL, -- Page title (for navigation and browser tab)

    -- Content
    html TEXT NOT NULL DEFAULT '<div></div>', -- Page HTML content

    -- SEO & Metadata
    meta_title VARCHAR(255), -- SEO title (overrides page title)
    meta_description TEXT, -- SEO description
    meta_keywords TEXT, -- SEO keywords
    og_image TEXT, -- Open Graph image URL

    -- Page settings
    is_home BOOLEAN DEFAULT FALSE, -- Is this the homepage?
    is_published BOOLEAN DEFAULT TRUE, -- Is page visible on published site?
    order_index INTEGER DEFAULT 0, -- Order in navigation menu

    -- Navigation
    show_in_nav BOOLEAN DEFAULT TRUE, -- Show in navigation menu?
    nav_label VARCHAR(255), -- Custom label for navigation (defaults to title)
    parent_page_id UUID REFERENCES pages(id) ON DELETE SET NULL, -- For nested navigation

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, slug) -- Unique slug per project
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON pages(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_order_index ON pages(order_index);
CREATE INDEX IF NOT EXISTS idx_pages_is_home ON pages(is_home);

-- Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Users can view pages for their own projects
CREATE POLICY "Users can view own project pages"
    ON pages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can insert pages for their own projects
CREATE POLICY "Users can insert own project pages"
    ON pages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update pages for their own projects
CREATE POLICY "Users can update own project pages"
    ON pages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can delete pages for their own projects
CREATE POLICY "Users can delete own project pages"
    ON pages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Anyone can view published pages (for public websites)
CREATE POLICY "Anyone can view published pages"
    ON pages FOR SELECT
    USING (is_published = TRUE);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: Only one homepage per project
CREATE UNIQUE INDEX idx_one_home_per_project
    ON pages(project_id)
    WHERE is_home = TRUE;
```

### Modificar tabla `projects`

```sql
-- Add multipage flag and migration tracking
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS is_multipage BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS migrated_to_pages BOOLEAN DEFAULT FALSE;

-- Index for multipage projects
CREATE INDEX IF NOT EXISTS idx_projects_is_multipage ON projects(is_multipage);
```

### Tabla de recursos compartidos (opcional, para futuro)

```sql
-- =====================================================
-- SHARED_RESOURCES TABLE
-- Stores shared components like headers, footers, CSS
-- =====================================================
CREATE TABLE IF NOT EXISTS shared_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Resource info
    name VARCHAR(255) NOT NULL, -- e.g., 'header', 'footer', 'global-styles'
    type VARCHAR(50) NOT NULL CHECK (type IN ('html', 'css', 'js')),
    content TEXT NOT NULL,

    -- Settings
    auto_inject BOOLEAN DEFAULT TRUE, -- Auto-inject in all pages?
    injection_point VARCHAR(50), -- 'head', 'body-start', 'body-end'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_resources_project_id ON shared_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_resources_type ON shared_resources(type);

-- RLS (similar to pages table)
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shared resources"
    ON shared_resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = shared_resources.project_id
            AND projects.user_id = auth.uid()
        )
    );
```

### Actualizar `form_submissions` y `analytics_events`

```sql
-- Add page_id to form_submissions
ALTER TABLE form_submissions
    ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_page_id ON form_submissions(page_id);

-- Add page_id to analytics_events
ALTER TABLE analytics_events
    ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_id ON analytics_events(page_id);
```

---

## 🎨 FASE 2: Frontend - Editor UI

### 2.1 Nuevo componente: Page Manager Panel

**Ubicación:** `/public/src/components/page-manager.js`

**Funcionalidades:**
- Lista de todas las páginas del proyecto
- Botón "Add Page" para crear nueva página
- Switch entre páginas (carga contenido específico)
- Configuración por página:
  - Título y slug
  - SEO metadata
  - Visibilidad en navegación
  - Marcar como homepage
- Reordenar páginas (drag & drop)
- Eliminar páginas (con confirmación)
- Duplicar páginas

**UI Mock:**
```
┌─────────────────────────────────┐
│ Pages                      [+]  │ ← Add Page button
├─────────────────────────────────┤
│ 🏠 Home (/)            [⚙️][×] │ ← Active page highlighted
│ 📄 About (/about)      [⚙️][×] │
│ 📄 Services (/services)[⚙️][×] │
│ 📧 Contact (/contact)  [⚙️][×] │
└─────────────────────────────────┘
```

### 2.2 Modificar `app.js` (Editor principal)

**Cambios necesarios:**

1. **Estado del proyecto actualizado:**
```javascript
this.projectData = {
    id: null,
    name: 'Untitled Project',
    is_multipage: false,
    current_page_id: null, // NEW: Track active page
    pages: [], // NEW: Array of page objects
    html: '', // Legacy: for single-page projects
    publishedUrl: null
};
```

2. **Función para cambiar de página:**
```javascript
async switchToPage(pageId) {
    // Save current page
    await this.saveCurrentPage();

    // Load new page
    const page = this.projectData.pages.find(p => p.id === pageId);
    if (page) {
        this.projectData.current_page_id = pageId;
        document.getElementById('canvas').innerHTML = page.html;
        this.updateBreadcrumb(page.title);
        this.refreshLayers();
    }
}
```

3. **Función para crear nueva página:**
```javascript
async createNewPage(title, slug) {
    const newPage = {
        id: crypto.randomUUID(),
        project_id: this.projectData.id,
        slug: slug || this.generateSlug(title),
        title: title,
        html: '<div class="container"></div>', // Default template
        meta_title: title,
        meta_description: '',
        is_home: this.projectData.pages.length === 0, // First page is home
        is_published: true,
        show_in_nav: true,
        order_index: this.projectData.pages.length
    };

    // Save to database
    const { data, error } = await supabaseClient.client
        .from('pages')
        .insert([newPage])
        .select();

    if (!error) {
        this.projectData.pages.push(data[0]);
        await this.switchToPage(data[0].id);
    }
}
```

4. **Actualizar autosave:**
```javascript
// In autosave-manager.js
async saveProject() {
    if (this.app.projectData.is_multipage) {
        // Save current page only
        await this.saveCurrentPage();
    } else {
        // Legacy: save entire HTML
        await this.saveSinglePageProject();
    }
}

async saveCurrentPage() {
    const currentPageId = this.app.projectData.current_page_id;
    const html = document.getElementById('canvas').innerHTML;

    await supabaseClient.client
        .from('pages')
        .update({ html: html, updated_at: new Date().toISOString() })
        .eq('id', currentPageId);
}
```

### 2.3 Nuevo botón en toolbar

**Ubicación:** En el toolbar principal del editor

```html
<button id="pagesButton" class="toolbar-button" title="Manage Pages">
    <i class="fas fa-file-alt"></i> Pages
</button>
```

**Evento:**
```javascript
document.getElementById('pagesButton').addEventListener('click', () => {
    this.pageManager.show(); // Opens page manager panel
});
```

### 2.4 Migración de proyectos existentes

**Modal de conversión:**

Cuando un usuario abre un proyecto `is_multipage=false`:

```javascript
async convertToMultipage() {
    // Show confirmation modal
    const confirmed = await this.showConfirmationDialog(
        'Convert to Multi-page',
        'Convert this single-page project to multi-page? You can add more pages after conversion.'
    );

    if (confirmed) {
        // Create homepage from existing HTML
        const homePage = {
            project_id: this.projectData.id,
            slug: '',
            title: 'Home',
            html: this.projectData.html,
            is_home: true,
            is_published: true,
            order_index: 0
        };

        // Insert page
        const { data } = await supabaseClient.client
            .from('pages')
            .insert([homePage])
            .select();

        // Update project
        await supabaseClient.client
            .from('projects')
            .update({
                is_multipage: true,
                migrated_to_pages: true
            })
            .eq('id', this.projectData.id);

        // Reload project
        await this.loadProject(this.projectData.id);
    }
}
```

---

## 🔧 FASE 3: Backend - API Endpoints

### 3.1 Nuevos endpoints para gestión de páginas

#### `/api/pages/create.js`
```javascript
// Create new page
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { project_id, title, slug, html, ...metadata } = req.body;

    // Validate user owns project
    const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', project_id)
        .single();

    if (project.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create page
    const { data, error } = await supabase
        .from('pages')
        .insert([{
            project_id,
            slug: slug || generateSlug(title),
            title,
            html: html || '<div></div>',
            ...metadata
        }])
        .select();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
}
```

#### `/api/pages/list.js`
```javascript
// Get all pages for a project
export default async function handler(req, res) {
    const { project_id } = req.query;

    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', project_id)
        .order('order_index', { ascending: true });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
}
```

#### `/api/pages/update.js`
```javascript
// Update page
export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, ...updates } = req.body;

    const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data[0]);
}
```

#### `/api/pages/delete.js`
```javascript
// Delete page
export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.body;

    // Check if it's the last page or homepage
    const { data: page } = await supabase
        .from('pages')
        .select('project_id, is_home')
        .eq('id', id)
        .single();

    if (page.is_home) {
        return res.status(400).json({
            error: 'Cannot delete homepage. Set another page as home first.'
        });
    }

    const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
}
```

### 3.2 Modificar endpoints de publicación

#### `/api/view-project.js` - Actualizar para multipágina

```javascript
export default async function handler(req, res) {
    const { slug, page } = req.query; // NEW: page parameter

    // Get project by slug
    const { data: project } = await supabase
        .from('projects')
        .select('*, pages(*)')
        .eq('public_slug', slug)
        .eq('published', true)
        .single();

    if (!project) {
        return res.status(404).send('Project not found');
    }

    let html;

    if (project.is_multipage) {
        // Multi-page project
        const pageSlug = page || ''; // Empty slug = homepage
        const pageData = project.pages.find(p => p.slug === pageSlug && p.is_published);

        if (!pageData) {
            return res.status(404).send('Page not found');
        }

        html = pageData.html;

        // Inject navigation menu
        html = injectNavigationMenu(html, project.pages);

        // Track page view
        await trackPageView(project.id, pageData.id, req);

    } else {
        // Single-page project (legacy)
        html = project.html;
    }

    // Inject analytics
    html = injectAnalytics(html, project.id);

    // Inject YENZE badge (if free plan)
    if (project.plan === 'free') {
        html = injectYenzeBadge(html);
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}

function injectNavigationMenu(html, pages) {
    const navPages = pages
        .filter(p => p.show_in_nav && p.is_published)
        .sort((a, b) => a.order_index - b.order_index);

    const navHTML = `
        <nav class="yenze-nav">
            ${navPages.map(p => `
                <a href="${p.slug ? '?page=' + p.slug : ''}">
                    ${p.nav_label || p.title}
                </a>
            `).join('')}
        </nav>
    `;

    // Inject before first <header> or at start of <body>
    return html.replace(/<body[^>]*>/, `$&${navHTML}`);
}
```

#### `/api/serve-project.js` - Actualizar para dominios personalizados

```javascript
export default async function handler(req, res) {
    const domain = req.headers.host;
    const { page } = req.query; // NEW: page parameter

    // Get project by custom domain
    const { data: customDomain } = await supabase
        .from('custom_domains')
        .select('project:projects(*, pages(*))')
        .eq('domain', domain)
        .eq('status', 'active')
        .single();

    if (!customDomain) {
        return res.status(404).send('Domain not found');
    }

    const project = customDomain.project;
    let html;

    if (project.is_multipage) {
        const pageSlug = page || '';
        const pageData = project.pages.find(p => p.slug === pageSlug);

        if (!pageData) {
            return res.status(404).send('Page not found');
        }

        html = pageData.html;
        html = injectNavigationMenu(html, project.pages, true); // Custom domain = clean URLs
    } else {
        html = project.html;
    }

    html = injectAnalytics(html, project.id);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}

function injectNavigationMenu(html, pages, cleanUrls = false) {
    const navPages = pages
        .filter(p => p.show_in_nav && p.is_published)
        .sort((a, b) => a.order_index - b.order_index);

    const navHTML = `
        <nav class="yenze-nav">
            ${navPages.map(p => `
                <a href="${cleanUrls ? '/' + p.slug : '?page=' + p.slug}">
                    ${p.nav_label || p.title}
                </a>
            `).join('')}
        </nav>
    `;

    return html.replace(/<body[^>]*>/, `$&${navHTML}`);
}
```

### 3.3 Generar Sitemap dinámico

#### `/api/generate-sitemap.js` - Actualizar

```javascript
export default async function handler(req, res) {
    const { projectId } = req.query;

    const { data: project } = await supabase
        .from('projects')
        .select('*, pages(*)')
        .eq('id', projectId)
        .single();

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const baseUrl = project.custom_domain
        ? `https://${project.custom_domain}`
        : `https://yenze.io/s/${project.public_slug}`;

    let urls = [];

    if (project.is_multipage) {
        // Multi-page: one URL per page
        urls = project.pages
            .filter(p => p.is_published)
            .map(page => ({
                loc: `${baseUrl}${page.slug ? '?page=' + page.slug : ''}`,
                lastmod: page.updated_at,
                priority: page.is_home ? '1.0' : '0.8'
            }));
    } else {
        // Single-page: one URL
        urls = [{
            loc: baseUrl,
            lastmod: project.updated_at,
            priority: '1.0'
        }];
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>
`).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
}
```

---

## 🚀 FASE 4: Navegación y Enrutamiento

### 4.1 Sistema de enlaces internos

**Funcionalidad:** Detectar enlaces internos y convertirlos automáticamente

```javascript
// In published site injection
function processInternalLinks(html, pages, cleanUrls) {
    const pageMap = {};
    pages.forEach(p => {
        pageMap[p.id] = p.slug;
        pageMap[p.slug] = p.slug;
        pageMap[p.title.toLowerCase()] = p.slug;
    });

    // Replace internal links
    html = html.replace(/<a\s+href=["']#page:([^"']+)["']/gi, (match, ref) => {
        const slug = pageMap[ref.toLowerCase()];
        if (slug !== undefined) {
            const url = cleanUrls ? `/${slug}` : `?page=${slug}`;
            return `<a href="${url}"`;
        }
        return match;
    });

    return html;
}

// Usage in editor: users create links like <a href="#page:about">About</a>
// On publish, converted to <a href="?page=about">About</a> or <a href="/about">About</a>
```

### 4.2 Componente de navegación automática

**Template en editor:**

```javascript
ELEMENT_TEMPLATES.navigation = `
<nav class="site-navigation" data-yenze-nav="auto">
    <!-- Auto-populated on publish -->
</nav>
`;

// On publish, replace with actual page links
function injectAutoNavigation(html, pages) {
    const autoNavPattern = /<nav[^>]*data-yenze-nav=["']auto["'][^>]*>[\s\S]*?<\/nav>/gi;

    const navHTML = `
<nav class="site-navigation" data-yenze-nav="auto">
    ${pages
        .filter(p => p.show_in_nav && p.is_published)
        .sort((a, b) => a.order_index - b.order_index)
        .map(p => `
    <a href="?page=${p.slug}" class="nav-link">
        ${p.nav_label || p.title}
    </a>
        `).join('')}
</nav>
    `;

    return html.replace(autoNavPattern, navHTML);
}
```

---

## 📈 FASE 5: Analytics y SEO

### 5.1 Tracking por página

**Actualizar analytics.js:**

```javascript
function trackPageView(projectId, pageId, pageUrl) {
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            project_id: projectId,
            page_id: pageId, // NEW
            event_type: 'page_view',
            page_url: pageUrl,
            visitor_id: getVisitorId(),
            session_id: getSessionId(),
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            language: navigator.language
        })
    });
}
```

### 5.2 Meta tags por página

**En view-project.js:**

```javascript
function injectPageMetaTags(html, page) {
    const metaTags = `
    <title>${page.meta_title || page.title}</title>
    <meta name="description" content="${page.meta_description || ''}">
    <meta name="keywords" content="${page.meta_keywords || ''}">

    <!-- Open Graph -->
    <meta property="og:title" content="${page.meta_title || page.title}">
    <meta property="og:description" content="${page.meta_description || ''}">
    <meta property="og:image" content="${page.og_image || ''}">
    <meta property="og:url" content="${getCurrentUrl()}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${page.meta_title || page.title}">
    <meta name="twitter:description" content="${page.meta_description || ''}">
    <meta name="twitter:image" content="${page.og_image || ''}">
    `;

    // Inject in <head>
    return html.replace(/<\/head>/i, `${metaTags}</head>`);
}
```

---

## 🔄 FASE 6: Migración de Proyectos Existentes

### 6.1 Script de migración automática

```javascript
// /scripts/migrate-to-multipage.js

async function migrateAllProjects() {
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('is_multipage', false)
        .eq('migrated_to_pages', false);

    console.log(`Migrating ${projects.length} projects...`);

    for (const project of projects) {
        try {
            // Create homepage from existing HTML
            const { data: page } = await supabase
                .from('pages')
                .insert([{
                    project_id: project.id,
                    slug: '',
                    title: project.name || 'Home',
                    html: project.html,
                    meta_title: project.seo_metadata?.title || project.name,
                    meta_description: project.seo_metadata?.description || '',
                    is_home: true,
                    is_published: true,
                    show_in_nav: true,
                    order_index: 0
                }])
                .select()
                .single();

            // Mark as migrated (but keep is_multipage=false for backwards compat)
            await supabase
                .from('projects')
                .update({ migrated_to_pages: true })
                .eq('id', project.id);

            console.log(`✓ Migrated project ${project.id}`);
        } catch (error) {
            console.error(`✗ Error migrating project ${project.id}:`, error);
        }
    }

    console.log('Migration complete!');
}

migrateAllProjects();
```

### 6.2 Botón "Convert to Multi-page" en el editor

En el menú de proyectos:

```html
<button id="convertToMultipage" class="btn-secondary">
    <i class="fas fa-plus-square"></i> Enable Multi-page
</button>
```

Al hacer clic:
1. Mostrar modal explicando la conversión
2. Crear homepage desde HTML actual
3. Marcar proyecto como `is_multipage=true`
4. Recargar editor con page manager visible

---

## 🎯 FASE 7: Dashboard y Gestión

### 7.1 Indicador visual en dashboard

**En dashboard.js:**

```javascript
function renderProjectCard(project) {
    const pageCount = project.is_multipage
        ? `<span class="badge">${project.pages?.length || 0} pages</span>`
        : '';

    return `
    <div class="project-card" data-project-id="${project.id}">
        <h3>${project.name} ${pageCount}</h3>
        <p>Last updated: ${formatDate(project.updated_at)}</p>
        <div class="actions">
            <button onclick="editProject('${project.id}')">Edit</button>
            <button onclick="viewProject('${project.id}')">View</button>
        </div>
    </div>
    `;
}
```

---

## 📝 FASE 8: Documentación y UX

### 8.1 Tutorial en primera carga

**Modal explicativo:**

```javascript
function showMultipageOnboarding() {
    showModal({
        title: 'Multi-page Websites',
        content: `
            <p>You can now create websites with multiple pages!</p>
            <ul>
                <li>✓ Add unlimited pages</li>
                <li>✓ Each page has its own URL</li>
                <li>✓ Better SEO with page-specific metadata</li>
                <li>✓ Auto-generated navigation menus</li>
            </ul>
            <p>Click the "Pages" button in the toolbar to get started.</p>
        `,
        buttons: [
            { text: 'Got it!', action: 'close', primary: true }
        ]
    });
}
```

### 8.2 Tooltips y ayudas contextuales

```html
<!-- En page manager -->
<div class="help-tip" data-tooltip="The slug is the URL path for this page. Example: 'about' becomes '/about'">
    <i class="fas fa-question-circle"></i>
</div>
```

---

## 🧪 FASE 9: Testing

### 9.1 Tests unitarios

**Crear tests para:**
- Creación de páginas
- Cambio entre páginas
- Eliminación de páginas
- Generación de sitemap
- Enrutamiento de páginas
- Migración de proyectos

### 9.2 Tests de integración

**Flujos a probar:**
1. Crear proyecto → Añadir páginas → Publicar → Verificar URLs
2. Convertir proyecto single-page → Verificar migración
3. Cambiar homepage → Verificar enrutamiento
4. Añadir dominio personalizado → Verificar páginas accesibles

---

## 📦 Plan de Rollout

### Fase 1: MVP (Semanas 1-2)
- ✅ Crear tabla `pages`
- ✅ API endpoints básicos (create, list, update, delete)
- ✅ UI básica de page manager
- ✅ Switch entre páginas en editor
- ✅ Publicación multipágina (query params)

### Fase 2: Navegación (Semanas 3-4)
- ✅ Sistema de enlaces internos
- ✅ Navegación automática
- ✅ Breadcrumbs
- ✅ SEO por página

### Fase 3: Migración (Semana 5)
- ✅ Script de migración
- ✅ Botón de conversión en UI
- ✅ Testing exhaustivo

### Fase 4: Optimización (Semana 6)
- ✅ Performance
- ✅ Shared resources
- ✅ Analytics por página
- ✅ Documentación completa

---

## 🎨 Mejoras Futuras (Post-MVP)

1. **Templates de página**
   - Templates pre-diseñados para About, Contact, Services, etc.
   - Biblioteca de layouts

2. **Shared Components**
   - Headers/Footers globales
   - CSS compartido entre páginas
   - JavaScript global

3. **Nested Navigation**
   - Páginas anidadas (parent-child)
   - Menús desplegables automáticos

4. **Page Versioning**
   - Historial de versiones por página
   - Rollback individual

5. **Duplicate Page**
   - Copiar páginas existentes
   - Plantillas personalizadas

6. **Bulk Operations**
   - Eliminar múltiples páginas
   - Cambiar visibilidad en lote
   - Reordenar en masa

7. **Clean URLs** (con Vercel Edge Functions)
   - `/about` en lugar de `?page=about`
   - Reescritura de URLs en edge

---

## 🔧 Consideraciones Técnicas

### Performance
- **Lazy loading:** Solo cargar HTML de página activa
- **Caching:** Cache de páginas en edge (Vercel)
- **Pagination:** Si proyecto tiene >50 páginas

### Seguridad
- **Validación de slugs:** Prevenir XSS en slugs
- **RLS:** Asegurar que usuarios solo vean sus páginas
- **Sanitización:** Limpiar HTML al guardar

### Compatibilidad
- **Backwards compatibility:** Proyectos single-page siguen funcionando
- **Graceful degradation:** Si falla carga de páginas, mostrar error claro

---

## 📊 Métricas de Éxito

- ✅ 100% de proyectos existentes migrados sin errores
- ✅ Tiempo de creación de página < 1 segundo
- ✅ Tiempo de switch entre páginas < 500ms
- ✅ 0 errores en publicación multipágina
- ✅ Sitemap generado correctamente para todos los proyectos
- ✅ Analytics tracking funcionando en todas las páginas

---

## 🚨 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en migración | Baja | Alto | Backup antes de migrar, rollback plan |
| Performance issues con muchas páginas | Media | Medio | Lazy loading, pagination |
| Confusión de usuarios | Media | Bajo | Tutorial, documentación clara |
| Bugs en enrutamiento | Media | Alto | Testing exhaustivo, feature flag |

---

## ✅ Checklist de Implementación

### Base de Datos
- [ ] Crear tabla `pages`
- [ ] Crear tabla `shared_resources` (opcional)
- [ ] Modificar tabla `projects`
- [ ] Actualizar `form_submissions`
- [ ] Actualizar `analytics_events`
- [ ] Crear índices
- [ ] Configurar RLS policies

### Backend API
- [ ] `/api/pages/create.js`
- [ ] `/api/pages/list.js`
- [ ] `/api/pages/update.js`
- [ ] `/api/pages/delete.js`
- [ ] Actualizar `/api/view-project.js`
- [ ] Actualizar `/api/serve-project.js`
- [ ] Actualizar `/api/generate-sitemap.js`
- [ ] Actualizar `/api/analytics/track.js`

### Frontend Editor
- [ ] Crear `/public/src/components/page-manager.js`
- [ ] Actualizar `app.js` (estado, funciones)
- [ ] Actualizar `autosave-manager.js`
- [ ] Actualizar `supabase-client.js`
- [ ] Añadir botón "Pages" al toolbar
- [ ] Modal de conversión a multipágina
- [ ] UI de configuración de página
- [ ] Sistema de navegación en editor

### Publicación
- [ ] Inyección de navegación automática
- [ ] Procesamiento de enlaces internos
- [ ] Meta tags por página
- [ ] Sitemap dinámico
- [ ] Analytics por página

### Testing
- [ ] Tests unitarios de API
- [ ] Tests de UI de page manager
- [ ] Tests de migración
- [ ] Tests de enrutamiento
- [ ] Tests de publicación
- [ ] Tests end-to-end

### Documentación
- [ ] Guía de usuario
- [ ] Tutorial en primera carga
- [ ] Tooltips contextuales
- [ ] Changelog
- [ ] Actualizar README

### Migración
- [ ] Script de migración automática
- [ ] Backup de base de datos
- [ ] Rollback plan
- [ ] Monitorización post-migración

---

## 🎉 Conclusión

Este plan implementa un **sistema completo de gestión multipágina** que:

✅ **Mantiene compatibilidad** con proyectos existentes
✅ **Mejora SEO** con URLs y metadata por página
✅ **Simplifica navegación** con menús automáticos
✅ **Escala perfectamente** de 1 a 1000+ páginas
✅ **Se integra** con todas las features existentes (analytics, forms, dominios)

**Tiempo estimado:** 4-6 semanas de desarrollo
**Complejidad:** Media-Alta
**Beneficio:** Alto (diferenciador clave del producto)

---

**Siguiente paso:** Revisar este plan con el equipo y decidir si comenzar con MVP o implementación completa.
