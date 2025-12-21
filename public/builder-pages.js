/**
 * Builder Pages Manager
 * Handles multi-page functionality directly in the builder
 */

class BuilderPagesManager {
    constructor() {
        this.currentProject = null;
        this.currentPage = null;
        this.pages = [];
    }

    /**
     * Initialize the pages manager
     */
    async init() {
        // Get current project ID from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project') || localStorage.getItem('currentProjectId');

        if (projectId) {
            await this.loadProject(projectId);
        } else {
            this.showEmptyState();
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const addPageBtn = document.getElementById('addPageBtn');
        if (addPageBtn) {
            addPageBtn.addEventListener('click', () => this.showNewPageModal());
        }

        // Intercept Load HTML button to auto-create first page
        const loadHtmlBtn = document.getElementById('loadHtmlBtn');
        if (loadHtmlBtn) {
            loadHtmlBtn.addEventListener('click', async () => {
                // Wait for HTML to be loaded in canvas
                setTimeout(async () => {
                    await this.handleFirstHTMLLoad();
                }, 1000);
            });
        }
    }

    /**
     * Handle first HTML load - automatically create Home page
     */
    async handleFirstHTMLLoad() {
        // Get HTML from canvas
        const canvas = document.getElementById('canvas');
        if (!canvas || !canvas.contentDocument) return;

        const html = canvas.contentDocument.documentElement.outerHTML;
        if (!html || html.length < 100) return;

        // Check if we already have pages
        if (this.pages.length > 0) return;

        // Get current project ID
        const projectId = this.currentProject?.id || localStorage.getItem('currentProjectId');
        if (!projectId) return;

        try {
            // Auto-create Home page with the loaded HTML
            const response = await fetch('/api/pages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: projectId,
                    name: 'Home',
                    slug: '',
                    html: html,
                    isHomepage: true
                })
            });

            if (response.ok) {
                // Switch to Pages tab automatically
                const pagesTab = document.querySelector('[data-tab="pages"]');
                if (pagesTab) {
                    pagesTab.click();
                }

                // Reload project to show the new page
                await this.loadProject(projectId);

                // Show helpful toast
                this.showToast('🏠 Home page created! Click + to add more pages', 'success');
            }
        } catch (error) {
            console.error('Error auto-creating home page:', error);
        }
    }

    /**
     * Load project and its pages
     */
    async loadProject(projectId) {
        try {
            const response = await fetch(`/api/pages/list?projectId=${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to load project');
            }

            const result = await response.json();
            this.currentProject = result.project;
            this.pages = result.pages || [];

            // If no pages, show empty state
            if (this.pages.length === 0) {
                this.showEmptyState();
            } else {
                this.renderPages();
                // Load first page or homepage
                const homePage = this.pages.find(p => p.is_homepage) || this.pages[0];
                if (homePage) {
                    await this.loadPage(homePage.id);
                }
            }

            localStorage.setItem('currentProjectId', projectId);
        } catch (error) {
            console.error('Error loading project:', error);
            this.showEmptyState();
        }
    }

    /**
     * Render pages list
     */
    renderPages() {
        const pagesList = document.getElementById('pagesList');
        if (!pagesList) return;

        if (this.pages.length === 0) {
            this.showEmptyState();
            return;
        }

        pagesList.innerHTML = this.pages.map(page => this.renderPageItem(page)).join('');

        // Add click listeners
        this.pages.forEach(page => {
            const pageEl = document.querySelector(`[data-page-id="${page.id}"]`);
            if (pageEl) {
                pageEl.addEventListener('click', (e) => {
                    if (!e.target.closest('.page-menu-btn')) {
                        this.loadPage(page.id);
                    }
                });

                // Menu button
                const menuBtn = pageEl.querySelector('.page-menu-btn');
                if (menuBtn) {
                    menuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showPageMenu(page, menuBtn);
                    });
                }
            }
        });
    }

    /**
     * Render individual page item
     */
    renderPageItem(page) {
        const isActive = this.currentPage && this.currentPage.id === page.id;
        const icon = page.is_homepage ? '🏠' : '📄';
        const homeBadge = page.is_homepage ? '<span class="page-badge home">HOME</span>' : '';
        const slug = page.slug || '/';

        return `
            <div class="page-item ${isActive ? 'active' : ''}" data-page-id="${page.id}">
                <div class="page-icon">${icon}</div>
                <div class="page-info">
                    <div class="page-name">${page.name}</div>
                    <div class="page-slug">${slug}</div>
                </div>
                ${homeBadge}
                <button class="page-menu-btn" title="Page options">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const pagesList = document.getElementById('pagesList');
        if (!pagesList) return;

        pagesList.innerHTML = `
            <div class="empty-pages-state">
                <div class="empty-pages-icon">✨</div>
                <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text);">
                    Start Building
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary); line-height: 1.5; margin-bottom: 1rem;">
                    Import HTML below to create your<br>Home page automatically
                </div>
                <div style="display: flex; align-items: center; gap: 8px; justify-content: center; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white; font-size: 0.75rem; font-weight: 600;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    Import creates Home page
                </div>
            </div>
        `;
    }

    /**
     * Load page content into canvas
     */
    async loadPage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        this.currentPage = page;

        // Update active state in UI
        document.querySelectorAll('.page-item').forEach(el => {
            el.classList.remove('active');
        });
        const pageEl = document.querySelector(`[data-page-id="${pageId}"]`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Load page HTML into canvas
        if (typeof loadHTMLToCanvas === 'function') {
            loadHTMLToCanvas(page.html);
        }

        // Update project name in topbar
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput && this.currentProject) {
            projectNameInput.value = this.currentProject.name;
        }
    }

    /**
     * Show new page modal
     */
    showNewPageModal() {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%;">
                <h2 style="margin: 0 0 20px 0; font-size: 1.25rem;">Create New Page</h2>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 6px;">Page Name</label>
                    <input type="text" id="newPageName" placeholder="About Us" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.875rem;">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 6px;">URL Slug</label>
                    <input type="text" id="newPageSlug" placeholder="about" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.875rem; font-family: monospace;">
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">Lowercase, no spaces. Leave empty for homepage.</div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 6px;">Template</label>
                    <select id="newPageTemplate" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.875rem;">
                        <option value="blank">Blank Page</option>
                        <option value="home">Home Page (Hero Section)</option>
                        <option value="about">About Page</option>
                        <option value="contact">Contact Page (with Form)</option>
                        <option value="blog">Blog Page</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="newPageIsHomepage" style="margin-right: 8px;">
                        <span style="font-size: 0.875rem; font-weight: 500;">Set as Homepage</span>
                    </label>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button id="cancelNewPage" style="flex: 1; padding: 10px; background: var(--bg-tertiary); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button id="createNewPage" style="flex: 1; padding: 10px; background: #000; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Create Page</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#cancelNewPage').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#createNewPage').addEventListener('click', async () => {
            await this.createPage();
            document.body.removeChild(modal);
        });

        // Auto-generate slug from name
        const nameInput = modal.querySelector('#newPageName');
        const slugInput = modal.querySelector('#newPageSlug');
        nameInput.addEventListener('input', (e) => {
            if (!slugInput.dataset.userEdited) {
                slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
            }
        });
        slugInput.addEventListener('input', () => {
            slugInput.dataset.userEdited = 'true';
        });

        // Focus name input
        setTimeout(() => nameInput.focus(), 100);
    }

    /**
     * Create new page
     */
    async createPage() {
        const name = document.getElementById('newPageName').value.trim();
        const slug = document.getElementById('newPageSlug').value.trim();
        const template = document.getElementById('newPageTemplate').value;
        const isHomepage = document.getElementById('newPageIsHomepage').checked;

        if (!name) {
            alert('Please enter a page name');
            return;
        }

        try {
            const response = await fetch('/api/pages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.currentProject.id,
                    name,
                    slug: slug.toLowerCase(),
                    template,
                    isHomepage
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create page');
            }

            const result = await response.json();

            // Reload project
            await this.loadProject(this.currentProject.id);

            // Show success message
            this.showToast('Page created successfully!', 'success');
        } catch (error) {
            console.error('Error creating page:', error);
            alert(error.message);
        }
    }

    /**
     * Show page menu
     */
    showPageMenu(page, buttonEl) {
        // Create context menu
        const menu = document.createElement('div');
        menu.style.cssText = 'position: fixed; background: white; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; min-width: 150px;';

        const rect = buttonEl.getBoundingClientRect();
        menu.style.top = rect.bottom + 5 + 'px';
        menu.style.left = rect.left - 120 + 'px';

        menu.innerHTML = `
            <div class="page-menu-item" data-action="edit" style="padding: 10px 16px; cursor: pointer; font-size: 0.875rem; transition: background 0.2s;">
                ⚙️ Settings
            </div>
            <div class="page-menu-item" data-action="duplicate" style="padding: 10px 16px; cursor: pointer; font-size: 0.875rem; transition: background 0.2s;">
                📋 Duplicate
            </div>
            <div style="height: 1px; background: var(--border); margin: 4px 0;"></div>
            <div class="page-menu-item" data-action="delete" style="padding: 10px 16px; cursor: pointer; font-size: 0.875rem; color: #dc2626; transition: background 0.2s;">
                🗑️ Delete
            </div>
        `;

        document.body.appendChild(menu);

        // Add hover effects
        menu.querySelectorAll('.page-menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--bg-tertiary)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });

            item.addEventListener('click', async () => {
                const action = item.dataset.action;
                document.body.removeChild(menu);

                if (action === 'edit') {
                    this.showEditPageModal(page);
                } else if (action === 'duplicate') {
                    await this.duplicatePage(page);
                } else if (action === 'delete') {
                    await this.deletePage(page);
                }
            });
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    if (document.body.contains(menu)) {
                        document.body.removeChild(menu);
                    }
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * Show edit page modal
     */
    showEditPageModal(page) {
        alert('Edit page settings - Coming soon!');
    }

    /**
     * Duplicate page
     */
    async duplicatePage(page) {
        try {
            const newName = `${page.name} (Copy)`;
            const newSlug = `${page.slug}-copy`;

            const response = await fetch('/api/pages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.currentProject.id,
                    name: newName,
                    slug: newSlug,
                    html: page.html,
                    isHomepage: false
                })
            });

            if (!response.ok) throw new Error('Failed to duplicate page');

            await this.loadProject(this.currentProject.id);
            this.showToast('Page duplicated successfully!', 'success');
        } catch (error) {
            console.error('Error duplicating page:', error);
            alert('Failed to duplicate page');
        }
    }

    /**
     * Delete page
     */
    async deletePage(page) {
        if (!confirm(`Are you sure you want to delete "${page.name}"?`)) {
            return;
        }

        try {
            const response = await fetch('/api/pages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.currentProject.id,
                    pageId: page.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete page');
            }

            await this.loadProject(this.currentProject.id);
            this.showToast('Page deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting page:', error);
            alert(error.message);
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
let builderPages = null;

document.addEventListener('DOMContentLoaded', () => {
    builderPages = new BuilderPagesManager();
    builderPages.init();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
