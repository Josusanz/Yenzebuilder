/**
 * Pages Manager
 * Handles multi-page functionality in the dashboard
 */

class PagesManager {
    constructor() {
        this.selectedProject = null;
        this.currentPages = [];
        this.currentNavigation = null;
    }

    /**
     * Initialize the pages manager
     */
    async init() {
        await this.populateProjectSelector();
    }

    /**
     * Populate project selector dropdown
     */
    async populateProjectSelector() {
        const selector = document.getElementById('pagesProjectSelector');
        if (!selector) return;

        try {
            const { data: projects, error } = await supabase
                .from('projects')
                .select('id, name, project_type')
                .order('created_at', { ascending: false });

            if (error) throw error;

            selector.innerHTML = '<option value="">Choose a project...</option>';

            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                if (project.project_type === 'multi') {
                    option.textContent += ' ✨';
                }
                selector.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    /**
     * Load pages for selected project
     */
    async loadProjectPages(projectId) {
        if (!projectId) {
            this.clearPagesView();
            return;
        }

        try {
            const response = await fetch(`/api/pages/list?projectId=${projectId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load pages');
            }

            this.selectedProject = result.project;
            this.currentPages = result.pages || [];
            this.currentNavigation = result.navigation || { items: [] };

            this.renderProjectInfo();
            this.renderPages();
            this.renderNavigation();
        } catch (error) {
            console.error('Error loading pages:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Render project type info
     */
    renderProjectInfo() {
        const info = document.getElementById('projectTypeInfo');
        const singleInfo = document.getElementById('singlePageInfo');
        const multiInfo = document.getElementById('multiPageInfo');

        if (!this.selectedProject) {
            info.style.display = 'none';
            return;
        }

        info.style.display = 'block';

        if (this.selectedProject.type === 'multi') {
            singleInfo.style.display = 'none';
            multiInfo.style.display = 'block';
        } else {
            singleInfo.style.display = 'block';
            multiInfo.style.display = 'none';
        }
    }

    /**
     * Render pages grid
     */
    renderPages() {
        const grid = document.getElementById('pagesGrid');

        if (!this.currentPages || this.currentPages.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #9ca3af; grid-column: 1 / -1;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.3;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p style="font-size: 16px; margin: 0;">No pages yet. Create your first page!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.currentPages.map(page => this.renderPageCard(page)).join('');
    }

    /**
     * Render individual page card
     */
    renderPageCard(page) {
        const homeBadge = page.is_homepage ? '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">HOME</span>' : '';

        return `
            <div class="page-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseenter="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseleave="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #1f2937;">${page.name}</h3>
                        ${homeBadge}
                    </div>
                    <button onclick="pagesManager.showEditPageModal('${page.id}')" style="background: #f3f4f6; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; color: #374151; font-weight: 500;">
                        ⚙️ Settings
                    </button>
                </div>

                <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${page.slug || '/'}</code>
                    </div>
                    <div style="margin-top: 8px;">
                        📝 ${page.word_count || 0} words •
                        🕒 ${new Date(page.last_modified).toLocaleDateString()}
                    </div>
                </div>

                <div style="display: flex; gap: 8px;">
                    <a href="${page.full_url}" target="_blank" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 10px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                        👁️ Preview
                    </a>
                    <button onclick="pagesManager.editPageContent('${page.id}')" style="flex: 1; background: #10b981; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">
                        ✏️ Edit
                    </button>
                </div>

                ${page.seo_metadata && (!page.seo_metadata.meta_title || !page.seo_metadata.meta_description) ? `
                <div style="margin-top: 12px; padding: 10px; background: #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e;">
                    ⚠️ SEO metadata incomplete
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render navigation builder
     */
    renderNavigation() {
        const builder = document.getElementById('navigationBuilder');
        const items = document.getElementById('navigationItems');

        if (!this.currentNavigation || !this.currentPages || this.currentPages.length === 0) {
            builder.style.display = 'none';
            return;
        }

        builder.style.display = 'block';
        items.innerHTML = this.currentNavigation.items?.map((item, index) => this.renderNavigationItem(item, index)).join('') || '';
    }

    /**
     * Render navigation item
     */
    renderNavigationItem(item, index) {
        return `
            <div style="background: white; padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="cursor: move; color: #9ca3af;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </div>
                <div style="flex: 1;">
                    <input type="text" value="${item.label}"
                        onchange="pagesManager.updateNavItem(${index}, 'label', this.value)"
                        style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px;">
                </div>
                <div style="min-width: 150px; color: #6b7280; font-size: 13px;">
                    ${item.link}
                </div>
                <button onclick="pagesManager.removeNavItem(${index})" style="background: #fee2e2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Remove
                </button>
            </div>
        `;
    }

    /**
     * Show new page modal
     */
    showNewPageModal() {
        if (!this.selectedProject) {
            dashboardApp.showToast('Please select a project first', 'error');
            return;
        }

        document.getElementById('newPageModal').style.display = 'block';
        document.getElementById('newPageForm').reset();
    }

    /**
     * Close new page modal
     */
    closeNewPageModal() {
        document.getElementById('newPageModal').style.display = 'none';
    }

    /**
     * Show edit page modal
     */
    async showEditPageModal(pageId) {
        const page = this.currentPages.find(p => p.id === pageId);
        if (!page) return;

        document.getElementById('editPageId').value = page.id;
        document.getElementById('editPageName').value = page.name;
        document.getElementById('editPageSlug').value = page.slug || '';
        document.getElementById('editPageTitle').value = page.title || '';
        document.getElementById('editPageDescription').value = page.seo_metadata?.meta_description || '';
        document.getElementById('editPageKeywords').value = page.seo_metadata?.keywords || '';
        document.getElementById('editPageOgImage').value = page.seo_metadata?.og_image || '';
        document.getElementById('editPageIsHomepage').checked = page.is_homepage || false;

        document.getElementById('editPageModal').style.display = 'block';
    }

    /**
     * Close edit page modal
     */
    closeEditPageModal() {
        document.getElementById('editPageModal').style.display = 'none';
    }

    /**
     * Handle create page form submission
     */
    async handleCreatePage(event) {
        event.preventDefault();

        const name = document.getElementById('newPageName').value;
        const slug = document.getElementById('newPageSlug').value;
        const title = document.getElementById('newPageTitle').value;
        const template = document.getElementById('newPageTemplate').value;
        const isHomepage = document.getElementById('newPageIsHomepage').checked;

        try {
            const response = await fetch('/api/pages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedProject.id,
                    name,
                    slug: slug.toLowerCase().trim(),
                    title,
                    template,
                    isHomepage
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create page');
            }

            dashboardApp.showToast('Page created successfully!', 'success');
            this.closeNewPageModal();
            await this.loadProjectPages(this.selectedProject.id);
        } catch (error) {
            console.error('Error creating page:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Handle update page form submission
     */
    async handleUpdatePage(event) {
        event.preventDefault();

        const pageId = document.getElementById('editPageId').value;
        const name = document.getElementById('editPageName').value;
        const slug = document.getElementById('editPageSlug').value;
        const title = document.getElementById('editPageTitle').value;
        const description = document.getElementById('editPageDescription').value;
        const keywords = document.getElementById('editPageKeywords').value;
        const ogImage = document.getElementById('editPageOgImage').value;
        const isHomepage = document.getElementById('editPageIsHomepage').checked;

        try {
            const response = await fetch('/api/pages/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedProject.id,
                    pageId,
                    name,
                    slug: slug.toLowerCase().trim(),
                    title,
                    seoMetadata: {
                        meta_title: title,
                        meta_description: description,
                        keywords,
                        og_image: ogImage
                    },
                    isHomepage
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update page');
            }

            dashboardApp.showToast('Page updated successfully!', 'success');
            this.closeEditPageModal();
            await this.loadProjectPages(this.selectedProject.id);
        } catch (error) {
            console.error('Error updating page:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Delete page
     */
    async deletePage() {
        const pageId = document.getElementById('editPageId').value;
        const page = this.currentPages.find(p => p.id === pageId);

        if (!confirm(`Are you sure you want to delete "${page?.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch('/api/pages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedProject.id,
                    pageId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to delete page');
            }

            dashboardApp.showToast('Page deleted successfully', 'success');
            this.closeEditPageModal();
            await this.loadProjectPages(this.selectedProject.id);
        } catch (error) {
            console.error('Error deleting page:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Convert single-page project to multi-page
     */
    async convertToMultiPage() {
        if (!this.selectedProject) return;

        if (!confirm('Convert this project to multi-page? Your existing content will become the homepage.')) {
            return;
        }

        try {
            const response = await fetch('/api/projects/convert-to-multi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedProject.id
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to convert project');
            }

            dashboardApp.showToast('Project converted to multi-page successfully!', 'success');
            await this.loadProjectPages(this.selectedProject.id);
            await this.populateProjectSelector();
        } catch (error) {
            console.error('Error converting project:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Edit page content (redirect to editor)
     */
    editPageContent(pageId) {
        const page = this.currentPages.find(p => p.id === pageId);
        if (!page) return;

        // Redirect to editor with page ID parameter
        window.location.href = `/?project=${this.selectedProject.id}&page=${pageId}`;
    }

    /**
     * Update navigation item
     */
    updateNavItem(index, field, value) {
        if (!this.currentNavigation || !this.currentNavigation.items) return;

        this.currentNavigation.items[index][field] = value;
    }

    /**
     * Remove navigation item
     */
    removeNavItem(index) {
        if (!this.currentNavigation || !this.currentNavigation.items) return;

        this.currentNavigation.items.splice(index, 1);
        this.renderNavigation();
    }

    /**
     * Save navigation changes
     */
    async saveNavigation() {
        try {
            const response = await fetch('/api/pages/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.selectedProject.id,
                    navigation: this.currentNavigation
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save navigation');
            }

            dashboardApp.showToast('Navigation saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving navigation:', error);
            dashboardApp.showToast(error.message, 'error');
        }
    }

    /**
     * Clear pages view
     */
    clearPagesView() {
        this.selectedProject = null;
        this.currentPages = [];
        this.currentNavigation = null;

        document.getElementById('projectTypeInfo').style.display = 'none';
        document.getElementById('pagesGrid').innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #9ca3af; grid-column: 1 / -1;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.3;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p style="font-size: 16px; margin: 0;">Select a project to manage its pages</p>
            </div>
        `;
        document.getElementById('navigationBuilder').style.display = 'none';
    }
}

// Initialize pages manager
const pagesManager = new PagesManager();

// Initialize when dashboard is ready
if (typeof dashboardApp !== 'undefined') {
    const originalInit = dashboardApp.init;
    dashboardApp.init = async function() {
        await originalInit.call(this);
        await pagesManager.init();
    };

    // Add methods to dashboardApp for modal controls
    dashboardApp.showNewPageModal = () => pagesManager.showNewPageModal();
    dashboardApp.closeNewPageModal = () => pagesManager.closeNewPageModal();
    dashboardApp.closeEditPageModal = () => pagesManager.closeEditPageModal();
    dashboardApp.handleCreatePage = (e) => pagesManager.handleCreatePage(e);
    dashboardApp.handleUpdatePage = (e) => pagesManager.handleUpdatePage(e);
    dashboardApp.deletePage = () => pagesManager.deletePage();
    dashboardApp.loadProjectPages = (id) => pagesManager.loadProjectPages(id);
    dashboardApp.convertToMultiPage = () => pagesManager.convertToMultiPage();
}
