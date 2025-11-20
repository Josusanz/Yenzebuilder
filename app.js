// YENZE Builder - Main Application Logic
// Version 1.0.0

class YenzeBuilder {
    constructor() {
        this.currentHTML = '';
        this.selectedElement = null;
        this.currentDevice = 'desktop';
        this.projectData = {
            name: 'My Website',
            html: '',
            assets: [],
            publishedUrl: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProject();
    }

    setupEventListeners() {
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Device toggle
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchDevice(e.target.dataset.device));
        });

        // Import area
        const importArea = document.getElementById('importArea');
        const fileInput = document.getElementById('fileInput');
        
        importArea.addEventListener('click', () => fileInput.click());
        
        importArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            importArea.classList.add('dragover');
        });

        importArea.addEventListener('dragleave', () => {
            importArea.classList.remove('dragover');
        });

        importArea.addEventListener('drop', (e) => {
            e.preventDefault();
            importArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'text/html') {
                this.loadHTMLFile(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadHTMLFile(file);
            }
        });

        // Load HTML from paste
        document.getElementById('loadHtmlBtn').addEventListener('click', () => {
            const html = document.getElementById('htmlPaste').value;
            if (html) {
                this.loadHTML(html);
            }
        });

        // Code view
        document.getElementById('codeViewBtn').addEventListener('click', () => {
            this.toggleCodeEditor();
        });

        document.getElementById('closeCodeBtn').addEventListener('click', () => {
            this.toggleCodeEditor();
        });

        document.getElementById('applyCodeBtn').addEventListener('click', () => {
            const code = document.getElementById('codeContent').value;
            this.loadHTML(code);
            this.toggleCodeEditor();
        });

        // Preview
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.preview();
        });

        // Publish
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.publish();
        });

        // Project name
        document.getElementById('projectName').addEventListener('blur', (e) => {
            this.projectData.name = e.target.value;
            this.saveProject();
        });

        // Asset upload
        document.getElementById('assetUpload').addEventListener('change', (e) => {
            this.handleAssetUpload(e.target.files);
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Panel`).classList.add('active');
    }

    switchDevice(device) {
        this.currentDevice = device;
        
        // Update active button
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-device="${device}"]`).classList.add('active');

        // Update canvas wrapper
        const wrapper = document.getElementById('canvasWrapper');
        wrapper.className = `canvas-wrapper ${device}`;
    }

    loadHTMLFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const html = e.target.result;
            this.loadHTML(html);
        };
        reader.readAsText(file);
    }

    loadHTML(html) {
        this.currentHTML = html;
        this.projectData.html = html;
        
        // Hide empty state
        document.getElementById('emptyState').style.display = 'none';
        
        // Show canvas
        const canvas = document.getElementById('canvas');
        canvas.style.display = 'block';
        
        // Write HTML to iframe
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Make elements editable
        setTimeout(() => {
            this.makeEditable(iframeDoc);
            this.buildLayersTree(iframeDoc);
        }, 500);

        this.showToast('✅ HTML loaded successfully!', 'success');
        this.saveProject();
    }

    makeEditable(doc) {
        // Add click handlers to all elements
        const allElements = doc.querySelectorAll('body *');

        allElements.forEach(el => {
            // Skip script and style tags
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

            el.style.cursor = 'pointer';
            el.style.transition = 'outline 0.15s, box-shadow 0.15s';

            // Hover effect
            el.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                if (el !== this.selectedElement) {
                    e.target.style.outline = '1px solid #0066FF';
                    e.target.style.outlineOffset = '2px';
                }
            });

            el.addEventListener('mouseleave', (e) => {
                if (el !== this.selectedElement) {
                    e.target.style.outline = 'none';
                }
            });

            // Single click to select
            el.addEventListener('click', (e) => {
                // Don't prevent default on links
                if (e.target.tagName !== 'A') {
                    e.preventDefault();
                }
                e.stopPropagation();
                this.selectElement(e.target);
            });

            // Double click to edit
            el.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log('Double click detected on:', e.target.tagName);

                // Enable inline editing for text elements
                if (this.isTextElement(e.target)) {
                    console.log('Enabling inline text edit');
                    this.enableInlineTextEdit(e.target);
                }

                // Enable image replacement for images
                if (e.target.tagName === 'IMG') {
                    console.log('Enabling image edit');
                    this.enableImageEdit(e.target);
                }
            });
        });
    }

    isTextElement(element) {
        const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON', 'LI', 'TD', 'TH', 'LABEL'];
        return textTags.includes(element.tagName) && element.children.length === 0;
    }

    enableInlineTextEdit(element) {
        console.log('enableInlineTextEdit called for', element);

        // Visual feedback - editing mode
        element.style.outline = '2px solid #10B981';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';

        // Make element editable
        element.contentEditable = 'true';
        element.style.cursor = 'text';

        // Focus and select after a small delay
        setTimeout(() => {
            try {
                element.focus();
                console.log('Element focused');

                // Select all text
                const range = element.ownerDocument.createRange();
                range.selectNodeContents(element);
                const sel = element.ownerDocument.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                console.log('Text selected');
            } catch (e) {
                console.error('Selection failed', e);
            }
        }, 100);

        // Save on blur
        const saveText = () => {
            console.log('Saving text changes');
            element.contentEditable = 'false';
            element.style.cursor = 'pointer';
            // Restore selection style
            element.style.outline = '2px solid #0066FF';
            element.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';

            this.updateHTML();
            this.showToast('✅ Text updated', 'success');
        };

        element.addEventListener('blur', saveText, { once: true });

        // Save on Enter key
        const handleKeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
            if (e.key === 'Escape') {
                element.blur();
            }
        };

        element.addEventListener('keydown', handleKeydown, { once: true });
    }

    enableImageEdit(imgElement) {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imgElement.src = event.target.result;
                    this.updateHTML();
                    this.showToast('✅ Image updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        });

        // Trigger file selection
        input.click();
    }

    updateHTML() {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        this.currentHTML = iframeDoc.documentElement.outerHTML;
        this.projectData.html = this.currentHTML;
        this.saveProject();
    }

    selectElement(element) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.style.outline = 'none';
            this.selectedElement.style.boxShadow = 'none';
        }

        // Highlight selected element with Framer-style selection
        this.selectedElement = element;
        element.style.outline = '2px solid #0066FF';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';

        // Show properties
        this.showProperties(element);
    }

    showProperties(element) {
        const panel = document.getElementById('propertiesPanel');

        const tagName = element.tagName.toLowerCase();
        const currentText = element.textContent || '';
        const currentHTML = element.innerHTML || '';

        // Get computed styles from iframe window
        const iframeWindow = element.ownerDocument.defaultView;
        const styles = iframeWindow.getComputedStyle(element);
        const bgColor = this.rgbToHex(styles.backgroundColor);
        const textColor = this.rgbToHex(styles.color);
        const fontSize = styles.fontSize;

        const isTextEl = this.isTextElement(element);
        const isImage = element.tagName === 'IMG';

        panel.innerHTML = `
            <div style="background: #F5F9FF; border: 1px solid #E5E5E5; border-radius: 6px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8125rem; color: #666;">
                💡 ${isTextEl ? 'Double-click text to edit inline' : isImage ? 'Double-click image to replace' : 'Double-click to edit inline'}
            </div>

            <div class="property-group">
                <label class="property-label">Element</label>
                <input type="text" class="property-input" value="${tagName}" readonly style="background: var(--bg);">
            </div>

            ${isTextEl ? `
            <div class="property-group">
                <label class="property-label">Text Content</label>
                <textarea class="property-input" id="propText" style="min-height: 80px;">${currentText.trim()}</textarea>
            </div>
            ` : ''}

            <div class="property-group">
                <label class="property-label">Background</label>
                <div class="color-picker-wrapper">
                    <input type="color" class="color-preview" id="propBgColor" value="${bgColor}">
                    <input type="text" class="property-input color-input" id="propBgColorText" value="${bgColor}">
                </div>
            </div>

            <div class="property-group">
                <label class="property-label">Text Color</label>
                <div class="color-picker-wrapper">
                    <input type="color" class="color-preview" id="propTextColor" value="${textColor}">
                    <input type="text" class="property-input color-input" id="propTextColorText" value="${textColor}">
                </div>
            </div>

            <div class="property-group">
                <label class="property-label">Font Size</label>
                <input type="text" class="property-input" id="propFontSize" value="${fontSize}">
            </div>

            <div class="property-group">
                <button class="btn btn-primary" style="width: 100%;" id="applyPropsBtn">
                    Apply Changes
                </button>
            </div>
        `;

        // Setup property change handlers
        document.getElementById('applyPropsBtn').addEventListener('click', () => {
            this.applyProperties(element);
        });

        // Sync color pickers
        document.getElementById('propBgColor').addEventListener('input', (e) => {
            document.getElementById('propBgColorText').value = e.target.value;
        });

        document.getElementById('propTextColor').addEventListener('input', (e) => {
            document.getElementById('propTextColorText').value = e.target.value;
        });
    }

    applyProperties(element) {
        const newText = document.getElementById('propText').value;
        const bgColor = document.getElementById('propBgColor').value;
        const textColor = document.getElementById('propTextColor').value;
        const fontSize = document.getElementById('propFontSize').value;

        // Apply changes
        if (element.children.length === 0) {
            element.textContent = newText;
        }
        element.style.backgroundColor = bgColor;
        element.style.color = textColor;
        element.style.fontSize = fontSize;

        // Update stored HTML
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        this.currentHTML = iframeDoc.documentElement.outerHTML;
        this.projectData.html = this.currentHTML;

        this.saveProject();
        this.showToast('✅ Properties updated!', 'success');
    }

    buildLayersTree(doc) {
        const tree = document.getElementById('layersTree');
        tree.innerHTML = '';

        const buildNode = (element, level = 0) => {
            const tagName = element.tagName.toLowerCase();
            
            // Skip script and style tags
            if (tagName === 'script' || tagName === 'style') return;

            const li = document.createElement('li');
            li.className = 'layer-item';
            li.style.paddingLeft = `${level * 1.5}rem`;
            
            const icon = this.getElementIcon(tagName);
            li.innerHTML = `
                <span class="layer-icon">${icon}</span>
                <span>${tagName}</span>
            `;

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectElement(element);
                
                // Highlight in tree
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.classList.remove('selected');
                });
                li.classList.add('selected');
            });

            tree.appendChild(li);

            // Add children
            Array.from(element.children).forEach(child => {
                buildNode(child, level + 1);
            });
        };

        if (doc.body) {
            buildNode(doc.body);
        }
    }

    getElementIcon(tagName) {
        const icons = {
            'body': '📄',
            'header': '🔝',
            'nav': '🧭',
            'section': '📦',
            'div': '▪️',
            'p': '📝',
            'h1': '📌',
            'h2': '📌',
            'h3': '📌',
            'button': '🔘',
            'a': '🔗',
            'img': '🖼️',
            'footer': '🔽',
            'ul': '📋',
            'li': '•',
        };
        return icons[tagName] || '▫️';
    }

    toggleCodeEditor() {
        const editor = document.getElementById('codeEditor');
        const isActive = editor.classList.contains('active');

        if (isActive) {
            editor.classList.remove('active');
        } else {
            document.getElementById('codeContent').value = this.currentHTML;
            editor.classList.add('active');
        }
    }

    preview() {
        // Open in new window
        const previewWindow = window.open('', 'Preview', 'width=1200,height=800');
        previewWindow.document.write(this.currentHTML);
        previewWindow.document.close();
        
        this.showToast('👁️ Preview opened in new window', 'success');
    }

    publish() {
        if (!this.currentHTML) {
            this.showToast('⚠️ No content to publish', 'error');
            return;
        }

        // Generate a unique URL (in production, this would be a real deployment)
        const projectSlug = this.projectData.name.toLowerCase().replace(/\s+/g, '-');
        const uniqueId = Date.now().toString(36);
        const publishedUrl = `https://${projectSlug}-${uniqueId}.yenze.io`;
        
        this.projectData.publishedUrl = publishedUrl;
        this.saveProject();

        // Show success modal (simplified version)
        const message = `
🚀 Published Successfully!

Your website is now live at:
${publishedUrl}

(In production, this would deploy to a real URL)
        `;
        
        alert(message);
        this.showToast('🚀 Website published!', 'success');
    }

    handleAssetUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const asset = {
                    name: file.name,
                    url: e.target.result,
                    type: file.type
                };
                this.projectData.assets.push(asset);
                this.renderAssets();
                this.saveProject();
            };
            reader.readAsDataURL(file);
        });
    }

    renderAssets() {
        const assetsList = document.getElementById('assetsList');
        assetsList.innerHTML = '';

        this.projectData.assets.forEach((asset, index) => {
            const assetEl = document.createElement('div');
            assetEl.style.cssText = `
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 6px;
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                cursor: pointer;
                transition: all 0.15s;
            `;
            assetEl.innerHTML = `
                <img src="${asset.url}" style="width: 100%; border-radius: 4px; margin-bottom: 0.5rem;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.name}</div>
            `;

            assetEl.addEventListener('mouseenter', () => {
                assetEl.style.background = 'var(--bg-secondary)';
                assetEl.style.borderColor = 'var(--accent)';
            });

            assetEl.addEventListener('mouseleave', () => {
                assetEl.style.background = 'var(--bg)';
                assetEl.style.borderColor = 'var(--border)';
            });

            assetEl.addEventListener('click', () => {
                navigator.clipboard.writeText(asset.url);
                this.showToast('📋 Asset URL copied!', 'success');
            });

            assetsList.appendChild(assetEl);
        });
    }

    saveProject() {
        localStorage.setItem('yenzeProject', JSON.stringify(this.projectData));
    }

    loadProject() {
        const saved = localStorage.getItem('yenzeProject');
        if (saved) {
            this.projectData = JSON.parse(saved);
            document.getElementById('projectName').value = this.projectData.name;
            
            if (this.projectData.html) {
                this.loadHTML(this.projectData.html);
            }

            if (this.projectData.assets.length > 0) {
                this.renderAssets();
            }
        }
    }

    // Utility functions
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;

        // Check for transparent
        if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
            return '#ffffff';  // Default to white for transparent
        }

        const values = rgb.match(/[\d.]+/g);
        if (!values) return '#ffffff';

        // Check if alpha channel is 0 (transparent)
        if (values.length === 4 && parseFloat(values[3]) === 0) {
            return '#ffffff';  // Transparent, return white
        }

        return '#' + values.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize app
const app = new YenzeBuilder();
