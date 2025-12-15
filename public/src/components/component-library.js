/**
 * Component Library System
 * User-saved reusable components
 */

export class ComponentLibrary {
    constructor() {
        this.components = new Map();
        this.categories = ['saved', 'templates', 'user', 'shared'];
    }

    /**
     * Initialize component library
     */
    async init() {
        await this.loadFromLocalStorage();
        await this.loadFromSupabase();
        this._createUI();
    }

    /**
     * Save component to library
     */
    async saveComponent(element, metadata = {}) {
        const component = {
            id: this._generateId(),
            name: metadata.name || 'Untitled Component',
            category: metadata.category || 'user',
            html: element.outerHTML,
            thumbnail: await this._generateThumbnail(element),
            tags: metadata.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: supabaseClient?.getUser()?.id
        };

        this.components.set(component.id, component);

        // Save to localStorage
        this._saveToLocalStorage();

        // Save to Supabase if logged in
        if (component.userId) {
            await this._saveToSupabase(component);
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('component-saved', {
            detail: { component }
        }));

        return component;
    }

    /**
     * Load component by ID
     */
    getComponent(id) {
        return this.components.get(id);
    }

    /**
     * Get all components
     */
    getAllComponents() {
        return Array.from(this.components.values());
    }

    /**
     * Get components by category
     */
    getComponentsByCategory(category) {
        return this.getAllComponents().filter(c => c.category === category);
    }

    /**
     * Search components
     */
    searchComponents(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllComponents().filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Delete component
     */
    async deleteComponent(id) {
        const component = this.components.get(id);
        if (!component) return false;

        this.components.delete(id);
        this._saveToLocalStorage();

        if (component.userId) {
            await this._deleteFromSupabase(id);
        }

        window.dispatchEvent(new CustomEvent('component-deleted', {
            detail: { componentId: id }
        }));

        return true;
    }

    /**
     * Update component
     */
    async updateComponent(id, updates) {
        const component = this.components.get(id);
        if (!component) return false;

        Object.assign(component, updates, {
            updatedAt: new Date().toISOString()
        });

        this._saveToLocalStorage();

        if (component.userId) {
            await this._saveToSupabase(component);
        }

        return true;
    }

    /**
     * Generate thumbnail from element
     */
    async _generateThumbnail(element) {
        try {
            // Create a small canvas
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');

            // Draw element (simplified - would need html2canvas in production)
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 200, 150);
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.fillText(element.tagName, 10, 75);

            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    }

    /**
     * Generate unique ID
     */
    _generateId() {
        return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save to localStorage
     */
    _saveToLocalStorage() {
        const data = Array.from(this.components.values());
        localStorage.setItem('yenze_components', JSON.stringify(data));
    }

    /**
     * Load from localStorage
     */
    async loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('yenze_components');
            if (data) {
                const components = JSON.parse(data);
                components.forEach(c => this.components.set(c.id, c));
            }
        } catch (error) {
            console.error('Failed to load components from localStorage:', error);
        }
    }

    /**
     * Save to Supabase
     */
    async _saveToSupabase(component) {
        if (!supabaseClient?.client) return;

        try {
            const { error } = await supabaseClient.client
                .from('user_components')
                .upsert({
                    id: component.id,
                    user_id: component.userId,
                    name: component.name,
                    category: component.category,
                    html: component.html,
                    thumbnail: component.thumbnail,
                    tags: component.tags,
                    created_at: component.createdAt,
                    updated_at: component.updatedAt
                });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to save component to Supabase:', error);
        }
    }

    /**
     * Load from Supabase
     */
    async loadFromSupabase() {
        if (!supabaseClient?.client || !supabaseClient.getUser()) return;

        try {
            const { data, error } = await supabaseClient.client
                .from('user_components')
                .select('*')
                .eq('user_id', supabaseClient.getUser().id);

            if (error) throw error;

            if (data) {
                data.forEach(item => {
                    this.components.set(item.id, {
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        html: item.html,
                        thumbnail: item.thumbnail,
                        tags: item.tags || [],
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                        userId: item.user_id
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load components from Supabase:', error);
        }
    }

    /**
     * Delete from Supabase
     */
    async _deleteFromSupabase(id) {
        if (!supabaseClient?.client) return;

        try {
            const { error } = await supabaseClient.client
                .from('user_components')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to delete component from Supabase:', error);
        }
    }

    /**
     * Create component library UI
     */
    _createUI() {
        const panel = document.createElement('div');
        panel.id = 'component-library-panel';
        panel.className = 'component-library hidden';
        panel.innerHTML = `
            <div class="library-header">
                <h3>Component Library</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="library-search">
                <input type="text" placeholder="Search components..." id="component-search">
            </div>
            <div class="library-categories">
                ${this.categories.map(cat => `
                    <button class="category-btn" data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div class="library-grid" id="components-grid">
                <!-- Components will be rendered here -->
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .component-library {
                position: fixed;
                top: var(--topbar-height);
                right: 0;
                width: 320px;
                height: calc(100vh - var(--topbar-height));
                background: var(--bg-secondary);
                border-left: 1px solid var(--border);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }

            .component-library:not(.hidden) {
                transform: translateX(0);
            }

            .library-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid var(--border);
            }

            .library-header h3 {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-secondary);
            }

            .library-search {
                padding: 1rem;
            }

            .library-search input {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                font-size: 0.875rem;
            }

            .library-categories {
                display: flex;
                gap: 0.5rem;
                padding: 0 1rem;
                overflow-x: auto;
            }

            .category-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--border);
                background: white;
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: 0.75rem;
                white-space: nowrap;
            }

            .category-btn.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .library-grid {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }

            .component-card {
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .component-card:hover {
                border-color: var(--primary);
                box-shadow: var(--shadow-md);
            }

            .component-thumbnail {
                width: 100%;
                height: 100px;
                background: var(--bg);
                border-radius: var(--radius-sm);
                margin-bottom: 0.5rem;
                object-fit: cover;
            }

            .component-name {
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.25rem;
            }

            .component-tags {
                display: flex;
                gap: 0.25rem;
                flex-wrap: wrap;
            }

            .component-tag {
                font-size: 0.625rem;
                padding: 0.125rem 0.5rem;
                background: var(--accent-light);
                border-radius: 12px;
                color: var(--text-secondary);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(panel);

        this._attachUIListeners();
    }

    /**
     * Attach UI event listeners
     */
    _attachUIListeners() {
        // Close button
        document.querySelector('.close-btn')?.addEventListener('click', () => {
            document.getElementById('component-library-panel').classList.add('hidden');
        });

        // Search
        document.getElementById('component-search')?.addEventListener('input', (e) => {
            this._renderComponents(this.searchComponents(e.target.value));
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                this._renderComponents(this.getComponentsByCategory(category));
            });
        });
    }

    /**
     * Render components in grid
     */
    _renderComponents(components) {
        const grid = document.getElementById('components-grid');
        if (!grid) return;

        grid.innerHTML = components.map(c => `
            <div class="component-card" data-component-id="${c.id}">
                ${c.thumbnail ? `<img src="${c.thumbnail}" class="component-thumbnail" alt="${c.name}">` : '<div class="component-thumbnail"></div>'}
                <div class="component-name">${c.name}</div>
                <div class="component-tags">
                    ${c.tags.map(tag => `<span class="component-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Attach click handlers
        grid.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.componentId;
                this._insertComponent(id);
            });
        });
    }

    /**
     * Insert component into canvas
     */
    _insertComponent(id) {
        const component = this.getComponent(id);
        if (!component) return;

        window.dispatchEvent(new CustomEvent('insert-component', {
            detail: { component }
        }));
    }

    /**
     * Toggle library visibility
     */
    toggle() {
        const panel = document.getElementById('component-library-panel');
        panel?.classList.toggle('hidden');
    }
}

// Export singleton
export const componentLibrary = new ComponentLibrary();
window.componentLibrary = componentLibrary;
