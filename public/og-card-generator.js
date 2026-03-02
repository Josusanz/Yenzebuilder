// OG Card Generator - Dynamic Open Graph Image Generation
class OGCardGenerator {
    constructor() {
        this.defaultTemplate = {
            width: 1200,
            height: 630,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        };
    }

    async generateOGCard(options = {}) {
        const {
            title = 'Untitled Page',
            description = '',
            siteName = 'YENZE',
            logo = null,
            background = this.defaultTemplate.background,
            theme = 'gradient' // gradient, solid, image
        } = options;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');

        // Draw background
        await this.drawBackground(ctx, background, theme);

        // Draw overlay for better text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 1200, 630);

        // Draw logo if provided
        if (logo) {
            await this.drawLogo(ctx, logo);
        }

        // Draw site name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 32px ' + this.defaultTemplate.fontFamily;
        ctx.fillText(siteName, 80, 100);

        // Draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px ' + this.defaultTemplate.fontFamily;
        const titleLines = this.wrapText(ctx, title, 1040);
        let y = 280;
        titleLines.forEach(line => {
            ctx.fillText(line, 80, y);
            y += 80;
        });

        // Draw description if provided
        if (description) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = '28px ' + this.defaultTemplate.fontFamily;
            const descLines = this.wrapText(ctx, description, 1040);
            descLines.slice(0, 2).forEach(line => {
                ctx.fillText(line, 80, y);
                y += 40;
            });
        }

        // Draw YENZE branding
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '20px ' + this.defaultTemplate.fontFamily;
        ctx.fillText('Built with YENZE', 80, 580);

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    async drawBackground(ctx, background, theme) {
        if (theme === 'gradient' || theme === 'solid') {
            // Parse gradient or solid color
            if (background.startsWith('linear-gradient')) {
                const gradient = this.parseGradient(ctx, background);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = background;
            }
            ctx.fillRect(0, 0, 1200, 630);
        } else if (theme === 'image' && background) {
            // Load and draw image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, 1200, 630);
                    resolve();
                };
                img.src = background;
            });
        }
    }

    parseGradient(ctx, gradientString) {
        // Simple gradient parser for linear gradients
        // Example: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
        const gradient = ctx.createLinearGradient(0, 0, 1200, 630);

        // Extract colors (simplified - in production use a proper parser)
        const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
        if (colorMatches && colorMatches.length >= 2) {
            gradient.addColorStop(0, colorMatches[0]);
            gradient.addColorStop(1, colorMatches[1]);
        } else {
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        }

        return gradient;
    }

    async drawLogo(ctx, logoUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
            img.onload = () => {
                // Draw logo in top-left corner
                const logoSize = 60;
                ctx.drawImage(img, 80, 30, logoSize, logoSize);
                resolve();
            };
            img.onerror = () => resolve(); // Skip if fails
            img.src = logoUrl;
        });
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    async uploadOGCard(blob, projectName) {
        if (!window.supabaseClient || !window.supabaseClient.client) {
            throw new Error('Supabase not initialized');
        }

        const fileName = `og-${projectName}-${Date.now()}.png`;
        const filePath = `og-cards/${fileName}`;

        const { data, error } = await window.supabaseClient.client.storage
            .from('images')
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'image/png'
            });

        if (error) throw error;

        const { data: { publicUrl } } = window.supabaseClient.client.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    async generateAndUpload(options, projectName) {
        try {
            const blob = await this.generateOGCard(options);
            const url = await this.uploadOGCard(blob, projectName);
            return { success: true, url };
        } catch (error) {
            console.error('OG Card generation error:', error);
            return { success: false, error: error.message };
        }
    }

    injectOGTags(ogImageUrl, title, description, siteName = 'YENZE') {
        // Generate meta tags to inject into HTML
        return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${this.escapeHtml(title)}">
    <meta property="og:description" content="${this.escapeHtml(description)}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:site_name" content="${this.escapeHtml(siteName)}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHtml(title)}">
    <meta name="twitter:description" content="${this.escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImageUrl}">
        `.trim();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showPreviewModal(options = {}) {
        const modalHTML = `
            <div id="ogPreviewModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; border-radius: 16px; max-width: 700px; width: 90%; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">Social Media Preview</h2>
                        <button onclick="document.getElementById('ogPreviewModal').remove()" style="width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; color: #6b7280; font-size: 20px;">×</button>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Title</label>
                        <input id="ogTitle" type="text" value="${options.title || 'My Awesome Website'}" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Description</label>
                        <textarea id="ogDescription" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; resize: vertical; min-height: 80px;">${options.description || 'Built with YENZE - The easiest website builder'}</textarea>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Background</label>
                        <select id="ogTheme" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            <option value="gradient-purple">Purple Gradient</option>
                            <option value="gradient-blue">Blue Gradient</option>
                            <option value="gradient-green">Green Gradient</option>
                            <option value="gradient-orange">Orange Gradient</option>
                            <option value="solid-dark">Dark Solid</option>
                        </select>
                    </div>

                    <div id="ogPreview" style="border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                        <canvas id="ogCanvas" width="1200" height="630" style="width: 100%; height: auto; display: block;"></canvas>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button onclick="document.getElementById('ogPreviewModal').remove()" style="flex: 1; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                        <button id="generateOGBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Generate & Apply
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup preview update
        const updatePreview = async () => {
            const title = document.getElementById('ogTitle').value;
            const description = document.getElementById('ogDescription').value;
            const theme = document.getElementById('ogTheme').value;

            const backgrounds = {
                'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                'gradient-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                'solid-dark': '#1f2937'
            };

            const blob = await this.generateOGCard({
                title,
                description,
                background: backgrounds[theme]
            });

            // Display preview
            const canvas = document.getElementById('ogCanvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, 1200, 630);
                ctx.drawImage(img, 0, 0);
            };
            img.src = URL.createObjectURL(blob);
        };

        // Initial preview
        updatePreview();

        // Update on changes
        ['ogTitle', 'ogDescription', 'ogTheme'].forEach(id => {
            document.getElementById(id).addEventListener('input', updatePreview);
        });

        // Generate button
        document.getElementById('generateOGBtn').addEventListener('click', async () => {
            const btn = document.getElementById('generateOGBtn');
            btn.textContent = 'Generating...';
            btn.disabled = true;

            const title = document.getElementById('ogTitle').value;
            const description = document.getElementById('ogDescription').value;
            const theme = document.getElementById('ogTheme').value;

            const backgrounds = {
                'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                'gradient-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                'solid-dark': '#1f2937'
            };

            const projectName = window.app?.projectData?.name || 'site';
            const result = await this.generateAndUpload({
                title,
                description,
                background: backgrounds[theme]
            }, projectName);

            if (result.success) {
                // Inject OG tags into HTML
                const ogTags = this.injectOGTags(result.url, title, description);

                if (window.app) {
                    // Store OG image URL in project data
                    window.app.projectData.ogImageUrl = result.url;
                    window.app.showToast('OG Card generated successfully!', 'success');
                }

                document.getElementById('ogPreviewModal').remove();
            } else {
                alert('Failed to generate OG card: ' + result.error);
                btn.textContent = 'Generate & Apply';
                btn.disabled = false;
            }
        });
    }
}

// Initialize global instance
window.ogCardGenerator = new OGCardGenerator();
