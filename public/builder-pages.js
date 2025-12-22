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
        const templateId = urlParams.get('template');
        const projectId = urlParams.get('project') || localStorage.getItem('currentProjectId');

        // Setup event listeners first so they are ready
        this.setupEventListeners();

        if (templateId) {
            await this.handleTemplateLoad(templateId, urlParams.get('templateName'));
        } else if (projectId) {
            await this.loadProject(projectId);
        } else {
            this.showEmptyState();
        }
    }

    /**
     * Handle template loading from URL
     */
    async handleTemplateLoad(templateId, templateName) {
        console.log('🏗️ Loading template:', templateId);

        try {
            // 1. Fetch template HTML
            const response = await fetch(`/templates/${templateId}.html`);
            if (!response.ok) throw new Error(`Template not found: ${templateId}`);
            const html = await response.text();

            // 2. Clear URL params to prevent reload loop (optional but good UX)
            // window.history.replaceState({}, document.title, window.location.pathname);

            // 3. Create a new "Quick Project" with this template
            // We use the offline fallback logic from createProject to be safe
            const projectName = templateName ? `My ${templateName}` : 'My Template Site';

            // Generate a local project ID
            const newProjectId = 'local-' + Date.now();
            this.currentProject = {
                id: newProjectId,
                name: projectName
            };
            localStorage.setItem('currentProjectId', newProjectId);

            // 4. Create the Home page with the template HTML
            const newPage = {
                id: 'page-' + Date.now(),
                projectId: newProjectId,
                name: 'Home',
                slug: '',
                html: html,
                is_homepage: true
            };

            // 5. Initialize state
            this.pages = [newPage];

            // 6. Update UI
            if (document.getElementById('projectName')) {
                document.getElementById('projectName').value = projectName;
            }

            this.renderPages();

            // 7. Load to canvas
            // Use a short delay to ensure app is ready
            setTimeout(() => {
                this.loadPage(newPage.id);
                this.showToast(`✨ Loaded ${templateName || 'Template'}`, 'success');
            }, 500);

        } catch (error) {
            console.error('Error loading template:', error);
            this.showToast('Failed to load template', 'error');
            this.showEmptyState();
        }
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
            <div class="empty-pages-state" style="padding: 2rem 1rem; text-align: center;">
                <div class="empty-pages-icon" style="font-size: 2.5rem; margin-bottom: 1rem;">🚀</div>
                <div style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text);">
                    Let's Build!
                </div>
                <div style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5; margin-bottom: 1.5rem;">
                    Choose how you want to start<br>your new website.
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button id="startAiBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); border: none; border-radius: 8px; color: white; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                            <path d="M12 8v8"></path>
                            <path d="M8 12h8"></path>
                        </svg>
                        Generate with AI
                    </button>

                    <button id="startImportBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: white; border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        Import HTML Code
                    </button>
                    
                    <button id="startBlankBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: transparent; border: 1px dashed var(--border); border-radius: 8px; color: var(--text-tertiary); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                        Use a Template
                    </button>
                </div>
            </div>
        `;

        // Attach listeners
        setTimeout(() => {
            const aiBtn = pagesList.querySelector('#startAiBtn');
            const importBtn = pagesList.querySelector('#startImportBtn');
            const blankBtn = pagesList.querySelector('#startBlankBtn');

            if (aiBtn) {
                aiBtn.onclick = () => window.location.href = '/prompt-generator.html';
            }
            if (importBtn) {
                importBtn.onclick = () => {
                    this.showNewPageModal(); // Creates modal
                    // Short timeout to let modal render, then switch to paste tab
                    setTimeout(() => {
                        const pasteTabBtn = document.querySelector('.import-tab-btn[data-tab="paste"]');
                        if (pasteTabBtn) pasteTabBtn.click();
                    }, 100);
                };
            }
            if (blankBtn) {
                blankBtn.onclick = () => window.location.href = 'https://yenze.io/templates.html';
            }
        }, 0);
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
        if (window.app && typeof window.app.loadHTML === 'function') {
            console.log('Loading page HTML via app.loadHTML...', page.html ? page.html.substring(0, 50) : 'Empty HTML');
            window.app.loadHTML(page.html);
        } else if (typeof window.loadHTMLToCanvas === 'function') {
            window.loadHTMLToCanvas(page.html);
        } else {
            console.error('Cannot load HTML: window.app not ready');
        }

        // Update project name in topbar
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput && this.currentProject) {
            projectNameInput.value = this.currentProject.name;
        }
    }

    /**
     * Show new page modal - Simple Framer-style
     */
    showNewPageModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);';

        modal.innerHTML = `
            <div style="background: white; dark:bg-gray-900; border-radius: 16px; padding: 32px; max-width: 560px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h2 style="margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700; color: #18181B;">New Page</h2>
                <p style="margin: 0 0 24px 0; font-size: 0.875rem; color: #71717A;">Create a new page for your website</p>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 8px; color: #18181B;">Page Name</label>
                    <input type="text" id="newPageName" placeholder="e.g., About, Contact, Services"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #E4E4E7; border-radius: 8px; font-size: 0.9375rem; transition: all 0.2s; outline: none;"
                        onfocus="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)';"
                        onblur="this.style.borderColor='#E4E4E7'; this.style.boxShadow='none';">
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 8px; color: #18181B;">
                        Import HTML
                        <span style="font-weight: 400; color: #71717A; margin-left: 4px;">(Optional)</span>
                    </label>

                    <!-- Import Options Tabs -->
                    <div style="display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 2px solid #F4F4F5; padding-bottom: 0;">
                        <button class="import-tab-btn active" data-tab="paste"
                            style="padding: 8px 16px; border: none; background: none; font-size: 0.875rem; font-weight: 600; color: #71717A; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;">
                            📝 Paste Code
                        </button>
                        <button class="import-tab-btn" data-tab="upload"
                            style="padding: 8px 16px; border: none; background: none; font-size: 0.875rem; font-weight: 600; color: #71717A; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;">
                            📁 Upload File
                        </button>
                    </div>

                    <!-- Paste HTML Tab -->
                    <div id="pasteHtmlTab" class="import-tab-content">
                        <textarea id="newPageHtmlPaste" placeholder="Paste your HTML code here... (optional)"
                            style="width: 100%; min-height: 120px; padding: 12px 16px; border: 2px solid #E4E4E7; border-radius: 8px; font-size: 0.8125rem; font-family: 'Monaco', 'Menlo', monospace; resize: vertical; outline: none; transition: all 0.2s;"
                            onfocus="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)';"
                            onblur="this.style.borderColor='#E4E4E7'; this.style.boxShadow='none';"></textarea>
                    </div>

                    <!-- Upload HTML Tab -->
                    <div id="uploadHtmlTab" class="import-tab-content" style="display: none;">
                        <label style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; border: 2px dashed #E4E4E7; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #FAFAFA;"
                            onmouseover="this.style.borderColor='#3B82F6'; this.style.background='#F0F7FF';"
                            onmouseout="this.style.borderColor='#E4E4E7'; this.style.background='#FAFAFA';">
                            <input type="file" id="newPageHtmlFile" accept=".html,.htm" style="display: none;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" style="margin-bottom: 8px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <span style="font-size: 0.875rem; font-weight: 600; color: #3B82F6;">Choose HTML File</span>
                            <span style="font-size: 0.75rem; color: #71717A; margin-top: 4px;">or drag and drop</span>
                        </label>
                        <div id="uploadedFileName" style="margin-top: 8px; font-size: 0.75rem; color: #71717A; display: none;"></div>
                    </div>

                    <div style="margin-top: 8px; font-size: 0.75rem; color: #71717A;">
                        💡 Tip: Leave empty to start with a blank page
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button id="cancelNewPage" style="flex: 1; padding: 12px 24px; background: #F4F4F5; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s; color: #18181B;"
                        onmouseover="this.style.background='#E4E4E7';"
                        onmouseout="this.style.background='#F4F4F5';">
                        Cancel
                    </button>
                    <button id="createNewPage" style="flex: 1; padding: 12px 24px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);"
                        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)';">
                        Create Page
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Tab switching for import options
        const tabButtons = modal.querySelectorAll('.import-tab-btn');
        const pasteTab = modal.querySelector('#pasteHtmlTab');
        const uploadTab = modal.querySelector('#uploadHtmlTab');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Update buttons
                tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = '#71717A';
                    b.style.borderBottomColor = 'transparent';
                });
                btn.classList.add('active');
                btn.style.color = '#18181B';
                btn.style.borderBottomColor = '#3B82F6';

                // Show/hide tabs
                if (tab === 'paste') {
                    pasteTab.style.display = 'block';
                    uploadTab.style.display = 'none';
                } else {
                    pasteTab.style.display = 'none';
                    uploadTab.style.display = 'block';
                }
            });
        });

        // Set initial active state
        tabButtons[0].style.borderBottomColor = '#3B82F6';
        tabButtons[0].style.color = '#18181B';

        // File upload handler
        const fileInput = modal.querySelector('#newPageHtmlFile');
        const fileNameDisplay = modal.querySelector('#uploadedFileName');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `📄 ${file.name}`;
                fileNameDisplay.style.display = 'block';
            }
        });

        // Event listeners
        modal.querySelector('#cancelNewPage').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#createNewPage').addEventListener('click', async () => {
            await this.createPage(modal);
            document.body.removeChild(modal);
        });

        // Focus name input
        setTimeout(() => modal.querySelector('#newPageName').focus(), 100);
    }

    /**
     * Create new page - Simplified version
     */
    async createPage(modal) {
        const name = modal.querySelector('#newPageName').value.trim();
        const htmlPaste = modal.querySelector('#newPageHtmlPaste').value.trim();
        const htmlFile = modal.querySelector('#newPageHtmlFile').files[0];

        if (!name) {
            alert('Please enter a page name');
            return;
        }

        // Auto-generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Get HTML content
        let html = '';

        if (htmlFile) {
            // Read file content
            html = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(htmlFile);
            });
        } else if (htmlPaste) {
            html = htmlPaste;
        } else {
            // Create blank page with basic structure
            html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <h1>${name}</h1>
    <p>Start building your ${name} page...</p>
</body>
</html>`;
        }

        // Check if project exists, if not create one
        let projectId = this.currentProject?.id;

        if (!projectId) {
            console.log('No project found, creating new project...');
            // Try to find project ID in URL or localStorage
            projectId = new URLSearchParams(window.location.search).get('project') || localStorage.getItem('currentProjectId');

            // If still no project, create a new one
            if (!projectId) {
                try {
                    const projectRes = await fetch('/api/create-project', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'Untitled Project' }) // Default name
                    });

                    if (projectRes.ok) {
                        const projectData = await projectRes.json();
                        projectId = projectData.id;
                        this.currentProject = { id: projectId, name: 'Untitled Project' };
                        localStorage.setItem('currentProjectId', projectId);
                    } else {
                        throw new Error('Failed to create base project');
                    }
                } catch (err) {
                    console.warn('Backend unavailable/Error, switching to Offline Mode. Details:', err);
                    projectId = 'local-' + Date.now();
                    this.currentProject = { id: projectId, name: 'Local Draft' };
                    localStorage.setItem('currentProjectId', projectId);
                    // Do NOT alert the user, just proceed quietly in offline mode
                }
            } else {
                // We have an ID but not the object, mock it
                this.currentProject = { id: projectId, name: 'My Website' };
            }
        }

        try {
            const response = await fetch('/api/pages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: projectId,
                    name,
                    slug,
                    html,
                    isHomepage: this.pages.length === 0 // First page is always homepage
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create page');
            }

            // Reload project
            await this.loadProject(projectId);

            // Show success message
            this.showToast(`✨ ${name} page created!`, 'success');
        } catch (error) {
            console.warn('Page creation API failed, falling back to local page object:', error);

            // Create local page object
            const newPage = {
                id: 'page-' + Date.now(),
                projectId: projectId,
                name: name,
                slug: slug,
                html: html,
                is_homepage: this.pages.length === 0
            };

            this.pages.push(newPage);
            this.renderPages();

            // Ensure loadHTMLToCanvas exists
            if (typeof window.loadHTMLToCanvas !== 'function') {
                window.loadHTMLToCanvas = (htmlContent) => {
                    if (window.app && window.app.loadHTML) {
                        window.app.loadHTML(htmlContent);
                    }
                };
            }

            this.loadPage(newPage.id);
            this.showToast(`✨ ${name} page created (Local Mode)!`, 'success');
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
