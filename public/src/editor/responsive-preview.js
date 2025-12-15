/**
 * Responsive Preview System
 * Multi-device preview in real-time
 */

export class ResponsivePreview {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.currentDevice = 'desktop';
        this.previewMode = false;
        this.devices = {
            desktop: {
                name: 'Desktop',
                width: '100%',
                height: '100%',
                icon: '🖥️',
                breakpoint: 1920
            },
            laptop: {
                name: 'Laptop',
                width: '1366px',
                height: '768px',
                icon: '💻',
                breakpoint: 1366
            },
            tablet: {
                name: 'Tablet',
                width: '768px',
                height: '1024px',
                icon: '📱',
                orientation: 'portrait',
                breakpoint: 768
            },
            'tablet-landscape': {
                name: 'Tablet (Landscape)',
                width: '1024px',
                height: '768px',
                icon: '📱',
                orientation: 'landscape',
                breakpoint: 1024
            },
            mobile: {
                name: 'Mobile',
                width: '375px',
                height: '667px',
                icon: '📱',
                orientation: 'portrait',
                breakpoint: 375
            },
            'mobile-landscape': {
                name: 'Mobile (Landscape)',
                width: '667px',
                height: '375px',
                icon: '📱',
                orientation: 'landscape',
                breakpoint: 667
            }
        };
    }

    /**
     * Initialize responsive preview UI
     */
    init() {
        this._createPreviewToolbar();
        this._attachEventListeners();
        this.switchDevice('desktop');
    }

    /**
     * Create preview toolbar
     */
    _createPreviewToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'responsive-toolbar';
        toolbar.className = 'responsive-toolbar';
        toolbar.innerHTML = `
            <div class="device-selector">
                ${Object.entries(this.devices).map(([key, device]) => `
                    <button
                        class="device-btn"
                        data-device="${key}"
                        title="${device.name}"
                    >
                        <span class="device-icon">${device.icon}</span>
                        <span class="device-name">${device.name}</span>
                    </button>
                `).join('')}
            </div>
            <div class="preview-controls">
                <button id="preview-split" title="Split View">
                    <i class="fa fa-columns"></i>
                </button>
                <button id="preview-rotate" title="Rotate Device">
                    <i class="fa fa-rotate"></i>
                </button>
                <button id="preview-fullscreen" title="Fullscreen Preview">
                    <i class="fa fa-expand"></i>
                </button>
            </div>
            <div class="preview-info">
                <span id="current-viewport"></span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .responsive-toolbar {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 1rem;
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border);
                box-shadow: var(--shadow-sm);
            }

            .device-selector {
                display: flex;
                gap: 0.5rem;
                flex: 1;
            }

            .device-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: 1px solid var(--border);
                background: white;
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.875rem;
            }

            .device-btn:hover {
                border-color: var(--primary);
                background: var(--primary-light);
            }

            .device-btn.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .device-icon {
                font-size: 1.25rem;
            }

            .device-name {
                display: none;
            }

            @media (min-width: 768px) {
                .device-name {
                    display: inline;
                }
            }

            .preview-controls {
                display: flex;
                gap: 0.5rem;
            }

            .preview-controls button {
                padding: 0.5rem 0.75rem;
                border: 1px solid var(--border);
                background: white;
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.2s;
            }

            .preview-controls button:hover {
                background: var(--accent-light);
            }

            .preview-info {
                font-size: 0.75rem;
                color: var(--text-secondary);
                padding: 0.5rem;
            }

            .canvas-container {
                transition: width 0.3s ease, height 0.3s ease;
                margin: 0 auto;
                box-shadow: var(--shadow-lg);
            }

            .canvas-container.mobile,
            .canvas-container.tablet {
                border: 8px solid #333;
                border-radius: 12px;
            }

            .split-view {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                padding: 1rem;
            }

            .split-view iframe {
                width: 100%;
                height: 100%;
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
            }
        `;

        document.head.appendChild(style);

        // Insert toolbar before canvas
        const canvasParent = this.canvas.parentElement;
        canvasParent.insertBefore(toolbar, this.canvas);
    }

    /**
     * Attach event listeners
     */
    _attachEventListeners() {
        // Device buttons
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.dataset.device;
                this.switchDevice(device);
            });
        });

        // Split view
        document.getElementById('preview-split')?.addEventListener('click', () => {
            this.toggleSplitView();
        });

        // Rotate
        document.getElementById('preview-rotate')?.addEventListener('click', () => {
            this.rotateDevice();
        });

        // Fullscreen
        document.getElementById('preview-fullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    /**
     * Switch to a different device
     */
    switchDevice(deviceKey) {
        const device = this.devices[deviceKey];
        if (!device) return;

        this.currentDevice = deviceKey;

        // Update canvas dimensions
        this.canvas.style.width = device.width;
        this.canvas.style.height = device.height || 'auto';
        this.canvas.style.maxWidth = device.width;

        // Update viewport info
        const viewportInfo = document.getElementById('current-viewport');
        if (viewportInfo) {
            viewportInfo.textContent = `${device.name} (${device.width})`;
        }

        // Update active button
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === deviceKey);
        });

        // Add device class
        this.canvas.className = `canvas ${deviceKey}`;

        // Dispatch event
        window.dispatchEvent(new CustomEvent('device-changed', {
            detail: { device: deviceKey, config: device }
        }));
    }

    /**
     * Rotate current device
     */
    rotateDevice() {
        const current = this.devices[this.currentDevice];
        if (!current) return;

        // Swap width and height
        const temp = current.width;
        current.width = current.height;
        current.height = temp;

        // Update orientation
        current.orientation = current.orientation === 'portrait' ? 'landscape' : 'portrait';

        this.switchDevice(this.currentDevice);
    }

    /**
     * Toggle split view (side by side comparison)
     */
    toggleSplitView() {
        // Implementation for split view with multiple devices
        console.log('Split view toggle');
    }

    /**
     * Toggle fullscreen preview
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.canvas.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Get current device configuration
     */
    getCurrentDevice() {
        return this.devices[this.currentDevice];
    }

    /**
     * Add custom device
     */
    addCustomDevice(key, config) {
        this.devices[key] = config;
        this._createPreviewToolbar(); // Refresh toolbar
    }
}

// Export for use in builder
export function initResponsivePreview(canvas) {
    const preview = new ResponsivePreview(canvas);
    preview.init();
    window.responsivePreview = preview;
    return preview;
}
