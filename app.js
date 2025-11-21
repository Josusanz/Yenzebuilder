// YENZE Builder - Main Application Logic
// Version 1.0.0

// Element Templates
const ELEMENT_TEMPLATES = {
    'contact-form': `
        <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h2 style="font-size: 2rem; margin: 0 0 0.5rem; color: #1a1a2e; font-weight: 700;">Get in Touch</h2>
                <p style="color: #6b7280; margin: 0 0 2rem;">We'd love to hear from you. Send us a message!</p>
                <form>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Name</label>
                        <input type="text" placeholder="Your name" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Email</label>
                        <input type="email" placeholder="your@email.com" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">Message</label>
                        <textarea placeholder="Your message..." rows="4" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                    </div>
                    <button type="submit" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Send Message</button>
                </form>
            </div>
        </section>
    `,
    'newsletter-form': `
        <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="font-size: 1.75rem; color: white; margin: 0 0 0.5rem; font-weight: 700;">Subscribe to our Newsletter</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 2rem;">Get the latest updates delivered to your inbox.</p>
                <form style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
                    <input type="email" placeholder="Enter your email" style="flex: 1; min-width: 250px; padding: 1rem 1.25rem; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 50px; font-size: 1rem; backdrop-filter: blur(10px);" onfocus="this.style.borderColor='white'" onblur="this.style.borderColor='rgba(255,255,255,0.3)'">
                    <button type="submit" style="padding: 1rem 2.5rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; white-space: nowrap;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Subscribe</button>
                </form>
            </div>
        </section>
    `,
    'navbar': `
        <nav style="display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 3rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000;">
            <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">YENZE</div>
            <ul style="display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; align-items: center;">
                <li><a href="#home" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">Home</a></li>
                <li><a href="#about" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">About</a></li>
                <li><a href="#services" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#667eea'" onmouseout="this.style.color='#374151'">Services</a></li>
                <li><a href="#contact" style="padding: 0.625rem 1.5rem; background: #667eea; color: white; text-decoration: none; border-radius: 50px; font-weight: 500; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Contact</a></li>
            </ul>
        </nav>
    `,
    'footer': `
        <footer style="background: #1a1a2e; color: white; padding: 4rem 3rem 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Company</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#about" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">About Us</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#careers" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Careers</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#blog" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Support</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#help" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Help Center</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#contact" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Contact Us</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#faq" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="font-size: 1.25rem; margin: 0 0 1rem; font-weight: 700;">Legal</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="#privacy" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Privacy Policy</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="#terms" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; text-align: center; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">&copy; 2024 YENZE. All rights reserved.</p>
            </div>
        </footer>
    `,
    'hero': `
        <section style="padding: 6rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
            <div style="max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 3.5rem; margin: 0 0 1rem; font-weight: 800; line-height: 1.1;">Build Beautiful Websites in Minutes</h1>
                <p style="font-size: 1.25rem; margin: 0 0 2.5rem; opacity: 0.95;">Create stunning, responsive websites without writing code. Start building your dream site today.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button style="padding: 1rem 2.5rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">Get Started</button>
                    <button style="padding: 1rem 2.5rem; background: transparent; color: white; border: 2px solid white; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='white'; this.style.color='#667eea'" onmouseout="this.style.background='transparent'; this.style.color='white'">Learn More</button>
                </div>
            </div>
        </section>
    `,
    'card': `
        <section style="padding: 4rem 2rem; background: #f9fafb;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="font-size: 2.5rem; text-align: center; margin: 0 0 3rem; color: #1a1a2e; font-weight: 700;">Our Services</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">🚀</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Fast Performance</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Lightning-fast load times and optimized performance for the best user experience.</p>
                    </div>
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">📱</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Responsive Design</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Beautiful layouts that look perfect on all devices, from mobile to desktop.</p>
                    </div>
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 2rem;">🎨</div>
                        <h3 style="font-size: 1.5rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Beautiful UI</h3>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">Modern, clean design with attention to detail and stunning visual appeal.</p>
                    </div>
                </div>
            </div>
        </section>
    `,
    'cta': `
        <section style="padding: 5rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
            <div style="max-width: 700px; margin: 0 auto;">
                <h2 style="font-size: 2.75rem; margin: 0 0 1rem; font-weight: 700;">Ready to Get Started?</h2>
                <p style="font-size: 1.125rem; margin: 0 0 2.5rem; opacity: 0.95;">Join thousands of users who are already building amazing websites with YENZE.</p>
                <button style="padding: 1.25rem 3rem; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 1.125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.2)'">Start Building Now</button>
            </div>
        </section>
    `,
    'two-columns': `
        <section style="padding: 4rem 2rem;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
                <div>
                    <h2 style="font-size: 2.5rem; margin: 0 0 1rem; color: #1a1a2e; font-weight: 700;">Column One</h2>
                    <p style="color: #6b7280; line-height: 1.8; margin: 0;">This is the first column. Add your content here. You can include text, images, or any other elements.</p>
                </div>
                <div>
                    <h2 style="font-size: 2.5rem; margin: 0 0 1rem; color: #1a1a2e; font-weight: 700;">Column Two</h2>
                    <p style="color: #6b7280; line-height: 1.8; margin: 0;">This is the second column. Add your content here. Perfect for side-by-side layouts and comparisons.</p>
                </div>
            </div>
        </section>
    `,
    'three-columns': `
        <section style="padding: 4rem 2rem; background: #f9fafb;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem;">
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">1</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">First Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the first step or feature goes here.</p>
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">2</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Second Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the second step or feature goes here.</p>
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">3</div>
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem; color: #1a1a2e; font-weight: 600;">Third Step</h3>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">Description for the third step or feature goes here.</p>
                </div>
            </div>
        </section>
    `
};

class YenzeBuilder {
    constructor() {
        this.currentHTML = '';
        this.selectedElement = null;
        this.currentDevice = 'desktop';
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.draggedElement = null;
        this.draggedLayerElement = null;
        this.dropIndicator = null;

        // History system for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        this.projectData = {
            name: 'My Website',
            html: '',
            assets: [],
            publishedUrl: null
        };

        // Popular Google Fonts
        this.googleFonts = [
            'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
            'Raleway', 'Nunito', 'Playfair Display', 'Merriweather',
            'PT Sans', 'Ubuntu', 'Oswald', 'Work Sans', 'Bebas Neue',
            'Crimson Text', 'Space Grotesk', 'DM Sans', 'Outfit', 'Manrope',
            'Plus Jakarta Sans', 'Sora', 'Lexend', 'Mulish', 'Quicksand'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProject();
    }

    setupEventListeners() {
        // Left Sidebar tabs
        document.querySelectorAll('.left-sidebar .sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, 'left'));
        });

        // Right Sidebar tabs
        document.querySelectorAll('.right-sidebar .sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, 'right'));
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

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Redo
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
            // Delete selected element with Backspace or Delete key
            else if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectedElement) {
                console.log('🗑️ Delete key pressed. Selected element:', this.selectedElement);

                // Don't delete if user is typing in an input/textarea
                const activeElement = document.activeElement;
                const isTyping = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );

                console.log('Active element:', activeElement, 'Is typing:', isTyping);

                if (!isTyping) {
                    e.preventDefault();
                    this.deleteSelectedElement();
                }
            }
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

        // Asset upload (kept for backwards compatibility, but now hidden)
        document.getElementById('assetUpload')?.addEventListener('change', (e) => {
            this.handleAssetUpload(e.target.files);
        });

        // Element cards drag-and-drop - use event delegation since cards may not exist yet
        document.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.element-card');
            if (card) {
                const elementType = card.dataset.element;
                console.log('🎯 Drag started:', elementType);
                e.dataTransfer.setData('text/plain', elementType); // Use text/plain for better compatibility
                e.dataTransfer.effectAllowed = 'copy';
                card.style.opacity = '0.5';
                card.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            const card = e.target.closest('.element-card');
            if (card) {
                card.style.opacity = '1';
                card.classList.remove('dragging');
            }
        });

        // Click to insert elements (but not if we're dragging)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.element-card');
            if (card && !card.classList.contains('dragging')) {
                const elementType = card.dataset.element;
                this.insertElementTemplate(elementType);
            }
        });

        // Canvas drop zone for elements - on the whole canvas area
        const canvasArea = document.querySelector('.canvas-area');

        if (!canvasArea) {
            console.error('❌ Canvas area not found!');
            return;
        }

        console.log('✅ Canvas area found, adding drag-drop listeners');

        canvasArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            canvasArea.style.background = 'rgba(102, 126, 234, 0.05)';
            console.log('🎯 Dragging over canvas area');
        });

        canvasArea.addEventListener('dragleave', (e) => {
            if (e.target === canvasArea) {
                canvasArea.style.background = '';
            }
        });

        canvasArea.addEventListener('drop', (e) => {
            e.preventDefault();
            canvasArea.style.background = '';
            const elementType = e.dataTransfer.getData('text/plain');
            console.log('🎯 Drop received:', elementType);
            if (elementType && ELEMENT_TEMPLATES[elementType]) {
                this.insertElementTemplate(elementType);
            }
        });

        // Element search
        document.getElementById('elementSearch')?.addEventListener('input', (e) => {
            this.filterElements(e.target.value);
        });

        // Layers action buttons - Always available
        document.getElementById('addSectionBtn')?.addEventListener('click', () => this.addElement('section'));
        document.getElementById('addDivBtn')?.addEventListener('click', () => this.addElement('div'));
        document.getElementById('addColumnsBtn')?.addEventListener('click', () => this.addColumns());
    }

    switchTab(tabName, sidebar = 'left') {
        const sidebarClass = sidebar === 'left' ? '.left-sidebar' : '.right-sidebar';

        // Update active tab in the specific sidebar
        document.querySelectorAll(`${sidebarClass} .sidebar-tab`).forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`${sidebarClass} [data-tab="${tabName}"]`).classList.add('active');

        // Update active panel in the specific sidebar
        document.querySelectorAll(`${sidebarClass} .tab-panel`).forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`${sidebarClass} #${tabName}Panel`).classList.add('active');
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

    loadHTML(html, addToHistory = true) {
        this.currentHTML = html;
        this.projectData.html = html;

        // Add to history only if requested
        if (addToHistory) {
            this.addToHistory(html, 'Import HTML');
        }

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
            this.setupIframeKeyboardShortcuts(iframeDoc);
        }, 500);

        this.showToast('✅ HTML loaded successfully!', 'success');
        this.saveProject();
    }

    setupIframeKeyboardShortcuts(doc) {
        // Add keyboard shortcuts to iframe document
        doc.addEventListener('keydown', (e) => {
            console.log('🎹 Key pressed in iframe:', e.key);

            // Delete selected element with Backspace or Delete key
            if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectedElement) {
                console.log('🗑️ Delete key in iframe. Selected element:', this.selectedElement);

                // Don't delete if user is typing in an input/textarea within the iframe
                const activeElement = doc.activeElement;
                const isTyping = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );

                if (!isTyping) {
                    e.preventDefault();
                    this.deleteSelectedElement();
                }
            }
        });

        // Add drag-and-drop listeners to iframe document
        console.log('🎯 Setting up drag-and-drop in iframe');

        let dropIndicator = null;
        let dropTarget = null;
        let dropPosition = null;

        // Create drop indicator element
        const createDropIndicator = () => {
            if (!dropIndicator) {
                dropIndicator = doc.createElement('div');
                dropIndicator.style.position = 'absolute';
                dropIndicator.style.height = '3px';
                dropIndicator.style.background = '#667eea';
                dropIndicator.style.pointerEvents = 'none';
                dropIndicator.style.zIndex = '99999';
                dropIndicator.style.boxShadow = '0 0 8px rgba(102, 126, 234, 0.6)';
                dropIndicator.style.borderRadius = '2px';
            }
            return dropIndicator;
        };

        const removeDropIndicator = () => {
            if (dropIndicator && dropIndicator.parentNode) {
                dropIndicator.parentNode.removeChild(dropIndicator);
            }
            // Don't reset dropTarget and dropPosition here - we need them for the drop event!
        };

        doc.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            // Get the element being dragged over
            let target = e.target;

            // Skip if target is the drop indicator itself
            if (target === dropIndicator) return;

            // Skip script and style tags
            if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') {
                target = target.parentElement;
            }

            // Find the closest element that's not body
            while (target && target !== doc.body && target.tagName === 'HTML') {
                target = target.parentElement;
            }

            if (!target || target === doc.body) {
                target = doc.body;
            }

            // Calculate if we should insert before or after
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const position = e.clientY < midpoint ? 'before' : 'after';

            // Store drop target and position
            dropTarget = target;
            dropPosition = position;

            console.log('📍 Drag position:', position, 'over:', target.tagName);

            // Show drop indicator
            const indicator = createDropIndicator();

            if (target === doc.body) {
                // Insert at the end of body
                indicator.style.left = '20px';
                indicator.style.right = '20px';
                indicator.style.width = 'calc(100% - 40px)';
                indicator.style.top = (doc.body.scrollHeight - 3) + 'px';
            } else {
                indicator.style.left = rect.left + 'px';
                indicator.style.width = rect.width + 'px';

                if (position === 'before') {
                    indicator.style.top = (rect.top - 2) + 'px';
                } else {
                    indicator.style.top = (rect.bottom - 2) + 'px';
                }
            }

            if (!indicator.parentNode) {
                doc.body.appendChild(indicator);
            }
        });

        doc.body.addEventListener('dragleave', (e) => {
            // Only remove if we're leaving the body completely
            if (e.target === doc.body && !doc.body.contains(e.relatedTarget)) {
                removeDropIndicator();
            }
        });

        doc.body.addEventListener('drop', (e) => {
            e.preventDefault();

            const elementType = e.dataTransfer.getData('text/plain');

            // Save the drop target and position before removing indicator
            const savedTarget = dropTarget;
            const savedPosition = dropPosition;

            console.log('🎯 Drop received:', {
                elementType,
                position: savedPosition,
                targetTag: savedTarget?.tagName,
                targetText: savedTarget?.textContent?.substring(0, 30)
            });

            removeDropIndicator();

            if (elementType && ELEMENT_TEMPLATES[elementType]) {
                this.insertElementTemplateAtPosition(elementType, savedTarget, savedPosition);
            }

            // Reset after insertion
            dropTarget = null;
            dropPosition = null;
        });
    }

    makeEditable(doc) {
        // Add click handlers to all elements
        const allElements = doc.querySelectorAll('body *');

        allElements.forEach(el => {
            this.makeElementEditable(el, doc);
        });
    }

    makeElementEditable(el, doc) {
        // Skip script and style tags
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

            el.style.cursor = 'grab';
            el.style.transition = 'outline 0.15s, box-shadow 0.15s';

            // Hover effect
            el.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                if (el !== this.selectedElement && !this.isDragging) {
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
                // Prevent default for all elements in edit mode
                e.preventDefault();
                e.stopPropagation();
                if (!this.isDragging) {
                    this.selectElement(e.target);
                }
            });

            // Double click to edit
            el.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Enable inline editing for text elements (includes buttons, links, headings)
                if (this.isTextElement(e.target)) {
                    this.enableInlineTextEdit(e.target);
                    return;
                }

                // Enable image replacement for images
                if (e.target.tagName === 'IMG') {
                    this.enableImageEdit(e.target);
                    return;
                }

                // If not editable, show message
                this.showToast('This element is not editable inline. Use the properties panel.', 'warning');
            });

            // Drag and drop to reorder elements (Framer-style)
            el.setAttribute('draggable', 'true');

            el.addEventListener('dragstart', (e) => {
                // Don't drag if in edit mode
                if (e.target.contentEditable === 'true') {
                    e.preventDefault();
                    return;
                }

                this.draggedElement = e.target;
                e.target.style.opacity = '0.5';
                e.target.style.cursor = 'grabbing';

                // Create drop indicator
                if (!this.dropIndicator) {
                    this.dropIndicator = doc.createElement('div');
                    this.dropIndicator.style.cssText = `
                        height: 3px;
                        background: #0066FF;
                        margin: 4px 0;
                        border-radius: 2px;
                        pointer-events: none;
                        box-shadow: 0 0 8px rgba(0, 102, 255, 0.5);
                    `;
                }

                e.dataTransfer.effectAllowed = 'move';
            });

            el.addEventListener('dragend', (e) => {
                e.target.style.opacity = '';
                e.target.style.cursor = 'grab';
                if (this.dropIndicator && this.dropIndicator.parentNode) {
                    this.dropIndicator.parentNode.removeChild(this.dropIndicator);
                }
                this.draggedElement = null;
            });

            el.addEventListener('dragover', (e) => {
                if (!this.draggedElement || this.draggedElement === e.target) return;

                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const parent = e.target.parentNode;
                const draggedParent = this.draggedElement.parentNode;

                // Only allow reordering within same parent or into container elements
                if (parent === draggedParent || this.isContainer(e.target)) {
                    const rect = e.target.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;

                    if (this.isContainer(e.target)) {
                        // Drop inside container
                        if (e.target.children.length === 0) {
                            e.target.appendChild(this.dropIndicator);
                        } else {
                            e.target.insertBefore(this.dropIndicator, e.target.firstChild);
                        }
                    } else if (e.clientY < midpoint) {
                        // Drop before element
                        parent.insertBefore(this.dropIndicator, e.target);
                    } else {
                        // Drop after element
                        parent.insertBefore(this.dropIndicator, e.target.nextSibling);
                    }
                }
            });

            el.addEventListener('drop', (e) => {
                if (!this.draggedElement) return;

                e.preventDefault();
                e.stopPropagation();

                const parent = e.target.parentNode;
                const draggedParent = this.draggedElement.parentNode;

                // Perform the move
                if (this.dropIndicator && this.dropIndicator.parentNode) {
                    const dropParent = this.dropIndicator.parentNode;
                    const nextSibling = this.dropIndicator.nextSibling;

                    // Remove drop indicator
                    this.dropIndicator.parentNode.removeChild(this.dropIndicator);

                    // Insert element at new position
                    if (nextSibling) {
                        dropParent.insertBefore(this.draggedElement, nextSibling);
                    } else {
                        dropParent.appendChild(this.draggedElement);
                    }

                    this.updateHTML('Reorder element');
                    this.buildLayersTree(doc); // Update layers tree
                    this.showToast('✅ Element repositioned', 'success');
                }
            });
    }

    isContainer(element) {
        // Container elements that can receive other elements
        const containerTags = ['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'UL', 'OL', 'FORM'];
        return containerTags.includes(element.tagName);
    }

    isTextElement(element) {
        // Headings are always editable
        const headingTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        if (headingTags.includes(element.tagName)) return true;

        const textTags = ['P', 'SPAN', 'A', 'BUTTON', 'LI', 'TD', 'TH', 'LABEL', 'DIV'];

        // Allow elements with no children OR only inline children (span, strong, em, etc)
        if (!textTags.includes(element.tagName)) return false;

        // If no children, it's editable
        if (element.children.length === 0) return true;

        // If has children, check if they're all inline elements
        const inlineTags = ['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'CODE', 'MARK', 'SMALL'];
        const allInline = Array.from(element.children).every(child =>
            inlineTags.includes(child.tagName)
        );

        return allInline;
    }

    enableInlineTextEdit(element) {
        // Visual feedback - editing mode (green outline)
        element.style.outline = '2px solid #10B981';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';

        // Make element editable
        element.contentEditable = 'true';
        element.style.cursor = 'text';

        // Notify user
        this.showToast('Editing mode - Press Enter or click outside to save', 'success');

        // Focus and select text
        setTimeout(() => {
            element.focus();

            // Select all text content
            try {
                const range = element.ownerDocument.createRange();
                range.selectNodeContents(element);
                const selection = element.ownerDocument.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (err) {
                // Fallback: just focus
            }
        }, 50);

        // Save handler
        const saveChanges = () => {
            element.contentEditable = 'false';
            element.style.cursor = 'pointer';

            // Restore blue selection style
            element.style.outline = '2px solid #0066FF';
            element.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';

            this.updateHTML('Edit text');
            this.showToast('✅ Text updated successfully', 'success');
        };

        // Save on blur (click outside)
        element.addEventListener('blur', saveChanges, { once: true });

        // Save on Enter/Escape
        const keyHandler = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            } else if (e.key === 'Escape') {
                element.blur();
            }
        };

        element.addEventListener('keydown', keyHandler, { once: true });
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

                    // Update the propImgSrc field if it exists (prevents disappearing when changing other properties)
                    const propImgSrc = document.getElementById('propImgSrc');
                    if (propImgSrc) {
                        propImgSrc.value = event.target.result;
                    }

                    this.updateHTML('Change image');
                    this.showToast('✅ Image updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        });

        // Trigger file selection
        input.click();
    }

    updateHTML(action = 'Change') {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
        const newHTML = iframeDoc.documentElement.outerHTML;

        // Only add to history if HTML actually changed
        if (newHTML !== this.currentHTML) {
            this.addToHistory(newHTML, action);
            this.currentHTML = newHTML;
            this.projectData.html = this.currentHTML;
            this.saveProject();
        }
    }

    addToHistory(html, action) {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new state
        this.history.push({
            html: html,
            action: action,
            timestamp: new Date().toLocaleTimeString()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateHistoryUI();
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
            this.showToast('↶ Undone', 'success');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
            this.showToast('↷ Redone', 'success');
        }
    }

    restoreFromHistory() {
        const state = this.history[this.historyIndex];
        if (state) {
            this.currentHTML = state.html;
            this.projectData.html = state.html;
            this.loadHTML(state.html, false); // false = don't add to history
            this.updateHistoryUI();
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem; text-align: center;">No changes yet</div>';
            return;
        }

        historyList.innerHTML = this.history.map((item, index) => {
            const isCurrent = index === this.historyIndex;
            return `
                <div style="padding: 0.75rem; margin-bottom: 0.25rem; background: ${isCurrent ? 'var(--accent)' : 'var(--bg)'};
                     color: ${isCurrent ? 'white' : 'var(--text)'}; border-radius: 6px; cursor: pointer;
                     border: 1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}; transition: all 0.15s;"
                     onmouseover="if(!${isCurrent}) this.style.background='var(--bg-secondary)'"
                     onmouseout="if(!${isCurrent}) this.style.background='var(--bg)'"
                     onclick="app.jumpToHistory(${index})">
                    <div style="font-weight: 500; margin-bottom: 0.25rem;">${item.action}</div>
                    <div style="font-size: 0.75rem; opacity: ${isCurrent ? '0.9' : '0.6'};">${item.timestamp}</div>
                </div>
            `;
        }).reverse().join('');
    }

    jumpToHistory(index) {
        if (index >= 0 && index < this.history.length) {
            this.historyIndex = index;
            this.restoreFromHistory();
        }
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

        // Scroll element into view in the canvas
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        // Highlight in layers panel
        this.highlightInLayers(element);

        // Show properties
        this.showProperties(element);
    }

    highlightInLayers(element) {
        const elementId = this.generateElementId(element);

        // Remove previous layer selection
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Find and highlight the corresponding layer item
        const layerItem = document.querySelector(`[data-element-id="${elementId}"]`);
        if (layerItem) {
            layerItem.classList.add('selected');

            // Scroll into view if needed
            layerItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    showProperties(element) {
        const panel = document.getElementById('propertiesPanel');

        const tagName = element.tagName.toLowerCase();
        const currentText = element.textContent || '';

        // Get computed styles from iframe window
        const iframeWindow = element.ownerDocument.defaultView;
        const styles = iframeWindow.getComputedStyle(element);

        // Get actual background (check parent if transparent)
        let bgColor = styles.backgroundColor;
        let hasInlineBackground = element.style.backgroundColor !== '';
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            let parent = element.parentElement;
            while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
                const parentStyles = iframeWindow.getComputedStyle(parent);
                bgColor = parentStyles.backgroundColor;
                parent = parent.parentElement;
            }
        }
        bgColor = this.rgbToHex(bgColor);

        const textColor = this.rgbToHex(styles.color);
        const hasInlineTextColor = element.style.color !== '';
        const fontSize = parseInt(styles.fontSize);
        const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '');

        // Position & Size
        const position = element.style.position || styles.position || 'static';
        const width = element.style.width || '';
        const height = element.style.height || '';
        const top = element.style.top || '';
        const left = element.style.left || '';

        const isTextEl = this.isTextElement(element);
        const isImage = element.tagName === 'IMG';
        const isLink = element.tagName === 'A';

        const linkHref = isLink ? (element.getAttribute('href') || '') : '';
        const imgSrc = isImage ? (element.getAttribute('src') || '') : '';
        const imgAlt = isImage ? (element.getAttribute('alt') || '') : '';
        const imgObjectFit = isImage ? (element.style.objectFit || 'fill') : '';

        // Store original values to detect changes
        this.originalValues = {
            bgColor: bgColor,
            textColor: textColor,
            hasInlineBackground: hasInlineBackground,
            hasInlineTextColor: hasInlineTextColor
        };

        panel.innerHTML = `
            <div style="background: #F5F9FF; border: 1px solid #E5E5E5; border-radius: 6px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8125rem; color: #666;">
                💡 ${isTextEl ? 'Double-click to edit inline' : isImage ? 'Double-click to replace' : 'Drag to reorder within parent'}
            </div>

            <div class="property-group">
                <label class="property-label">Element</label>
                <input type="text" class="property-input" value="${tagName}" readonly style="background: var(--bg);">
            </div>

            ${isLink ? `
            <div class="property-group">
                <label class="property-label">🔗 Link URL</label>
                <input type="text" class="property-input" id="propLinkHref" value="${linkHref}" placeholder="https://example.com">
            </div>
            ` : ''}

            ${isImage ? `
            <div class="property-group">
                <label class="property-label">🖼️ Image</label>
                <button class="btn btn-secondary" id="uploadImgBtn" style="width: 100%; margin-bottom: 0.5rem;">
                    📤 Upload New Image
                </button>
                <input type="text" class="property-input" id="propImgSrc" value="${imgSrc}" placeholder="https://...">
            </div>
            <div class="property-group">
                <label class="property-label">Alt Text</label>
                <input type="text" class="property-input" id="propImgAlt" value="${imgAlt}" placeholder="Image description">
            </div>
            <div class="property-group">
                <label class="property-label">Image Fit</label>
                <select class="property-input" id="propImgObjectFit">
                    <option value="fill" ${imgObjectFit === 'fill' ? 'selected' : ''}>Fill</option>
                    <option value="contain" ${imgObjectFit === 'contain' ? 'selected' : ''}>Fit</option>
                    <option value="cover" ${imgObjectFit === 'cover' ? 'selected' : ''}>Cover</option>
                    <option value="none" ${imgObjectFit === 'none' ? 'selected' : ''}>None</option>
                    <option value="scale-down" ${imgObjectFit === 'scale-down' ? 'selected' : ''}>Scale Down</option>
                </select>
            </div>
            ` : ''}

            ${isTextEl ? `
            <div class="property-group">
                <label class="property-label">Text Content</label>
                <textarea class="property-input" id="propText" style="min-height: 60px;">${currentText.trim()}</textarea>
            </div>
            ` : ''}

            <div class="property-group">
                <label class="property-label">Position</label>
                <select class="property-input" id="propPosition">
                    <option value="static" ${position === 'static' ? 'selected' : ''}>Static</option>
                    <option value="relative" ${position === 'relative' ? 'selected' : ''}>Relative</option>
                    <option value="absolute" ${position === 'absolute' ? 'selected' : ''}>Absolute</option>
                    <option value="fixed" ${position === 'fixed' ? 'selected' : ''}>Fixed</option>
                    <option value="sticky" ${position === 'sticky' ? 'selected' : ''}>Sticky</option>
                </select>
            </div>

            <div class="property-group">
                <label class="property-label">Size</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <input type="text" class="property-input" id="propWidth" value="${width}" placeholder="auto" style="font-size: 0.8125rem;">
                    <input type="text" class="property-input" id="propHeight" value="${height}" placeholder="auto" style="font-size: 0.8125rem;">
                </div>
            </div>

            ${position !== 'static' ? `
            <div class="property-group">
                <label class="property-label">Position Offset</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <input type="text" class="property-input" id="propTop" value="${top}" placeholder="top" style="font-size: 0.8125rem;">
                    <input type="text" class="property-input" id="propLeft" value="${left}" placeholder="left" style="font-size: 0.8125rem;">
                </div>
            </div>
            ` : ''}

            <div class="property-group">
                <label class="property-label">Font Family</label>
                <div style="position: relative;">
                    <input type="text" class="property-input" id="propFontSearch" value="${fontFamily}" placeholder="Search fonts...">
                    <div id="fontDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border); border-radius: 6px; max-height: 200px; overflow-y: auto; margin-top: 4px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></div>
                </div>
            </div>

            <div class="property-group">
                <label class="property-label">Font Size</label>
                <input type="number" class="property-input" id="propFontSize" value="${fontSize}" min="8" max="200">
            </div>

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
                <button class="btn btn-primary" style="width: 100%;" id="applyPropsBtn">
                    Apply Changes
                </button>
            </div>

            <div class="property-group">
                <button class="btn btn-secondary" style="width: 100%; background: #EF4444; color: white; border-color: #DC2626;" id="deleteElementBtn">
                    🗑️ Delete Element
                </button>
            </div>
        `;

        // Setup font search
        this.setupFontSearch(element);

        // Setup image upload button
        if (isImage) {
            document.getElementById('uploadImgBtn')?.addEventListener('click', () => {
                this.enableImageEdit(element);
            });
        }

        // Setup LIVE property change handlers
        document.getElementById('applyPropsBtn').addEventListener('click', () => {
            this.applyProperties(element, true); // true = save to history
        });

        // Setup delete button
        document.getElementById('deleteElementBtn')?.addEventListener('click', () => {
            this.deleteElement(element);
        });

        // Live updates for all properties
        const applyLive = () => this.applyProperties(element, false); // false = don't save to history yet

        // Text content
        if (isTextEl) {
            document.getElementById('propText')?.addEventListener('input', applyLive);
        }

        // Font size - live update
        document.getElementById('propFontSize')?.addEventListener('input', applyLive);

        // Position
        document.getElementById('propPosition')?.addEventListener('change', applyLive);

        // Size fields
        document.getElementById('propWidth')?.addEventListener('input', applyLive);
        document.getElementById('propHeight')?.addEventListener('input', applyLive);
        document.getElementById('propTop')?.addEventListener('input', applyLive);
        document.getElementById('propLeft')?.addEventListener('input', applyLive);

        // Link URL
        document.getElementById('propLinkHref')?.addEventListener('input', applyLive);

        // Image properties
        document.getElementById('propImgSrc')?.addEventListener('input', applyLive);
        document.getElementById('propImgAlt')?.addEventListener('input', applyLive);
        document.getElementById('propImgObjectFit')?.addEventListener('change', applyLive);

        // Color pickers - sync and apply live
        document.getElementById('propBgColor').addEventListener('input', (e) => {
            document.getElementById('propBgColorText').value = e.target.value;
            applyLive();
        });

        document.getElementById('propTextColor').addEventListener('input', (e) => {
            document.getElementById('propTextColorText').value = e.target.value;
            applyLive();
        });

        document.getElementById('propBgColorText')?.addEventListener('input', (e) => {
            document.getElementById('propBgColor').value = e.target.value;
            applyLive();
        });

        document.getElementById('propTextColorText')?.addEventListener('input', (e) => {
            document.getElementById('propTextColor').value = e.target.value;
            applyLive();
        });
    }

    setupFontSearch(element) {
        const searchInput = document.getElementById('propFontSearch');
        const dropdown = document.getElementById('fontDropdown');

        searchInput.addEventListener('focus', () => {
            this.showFontDropdown('', element);
        });

        searchInput.addEventListener('input', (e) => {
            this.showFontDropdown(e.target.value, element);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    showFontDropdown(query, element) {
        const dropdown = document.getElementById('fontDropdown');
        const filtered = this.googleFonts.filter(font =>
            font.toLowerCase().includes(query.toLowerCase())
        );

        dropdown.innerHTML = filtered.map(font => `
            <div style="padding: 0.5rem 0.75rem; cursor: pointer; font-family: '${font}', sans-serif; transition: background 0.15s;"
                 onmouseover="this.style.background='var(--bg)'"
                 onmouseout="this.style.background='white'"
                 onclick="document.getElementById('propFontSearch').value='${font}'; document.getElementById('fontDropdown').style.display='none'; app.applyProperties(app.selectedElement, false);">
                ${font}
            </div>
        `).join('');

        dropdown.style.display = filtered.length > 0 ? 'block' : 'none';
    }

    loadGoogleFont(fontName) {
        const formattedName = fontName.replace(/ /g, '+');

        // Load in main document
        const link = document.getElementById('dynamicFonts');
        const currentFonts = link.href ? link.href.split('family=')[1]?.split('&')[0] || '' : '';
        const fontsArray = currentFonts ? currentFonts.split('|') : [];

        if (!fontsArray.includes(formattedName)) {
            fontsArray.push(formattedName);
            const fontUrl = `https://fonts.googleapis.com/css2?${fontsArray.map(f => `family=${f}:wght@300;400;500;600;700`).join('&')}&display=swap`;
            link.href = fontUrl;

            // Also load in iframe
            const canvas = document.getElementById('canvas');
            const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
            if (iframeDoc) {
                let iframeLink = iframeDoc.getElementById('dynamicFonts');
                if (!iframeLink) {
                    iframeLink = iframeDoc.createElement('link');
                    iframeLink.id = 'dynamicFonts';
                    iframeLink.rel = 'stylesheet';
                    iframeDoc.head.appendChild(iframeLink);
                }
                iframeLink.href = fontUrl;
            }
        }
    }

    applyProperties(element, saveToHistory = true) {
        const newText = document.getElementById('propText')?.value;
        const bgColor = document.getElementById('propBgColor').value;
        const textColor = document.getElementById('propTextColor').value;
        const fontSize = document.getElementById('propFontSize').value;
        const fontFamily = document.getElementById('propFontSearch')?.value;
        const position = document.getElementById('propPosition')?.value;
        const width = document.getElementById('propWidth')?.value;
        const height = document.getElementById('propHeight')?.value;
        const top = document.getElementById('propTop')?.value;
        const left = document.getElementById('propLeft')?.value;

        // Apply text changes
        if (newText !== undefined && element.children.length === 0) {
            element.textContent = newText;
        }

        // Only apply background if it was changed or already had inline style
        if (this.originalValues.hasInlineBackground || bgColor !== this.originalValues.bgColor) {
            element.style.backgroundColor = bgColor;
        }

        // Only apply text color if it was changed or already had inline style
        if (this.originalValues.hasInlineTextColor || textColor !== this.originalValues.textColor) {
            element.style.color = textColor;
        }

        // Apply font size (always apply because it's a number input)
        if (fontSize) {
            element.style.fontSize = fontSize + 'px';
        }

        // Apply font family
        if (fontFamily) {
            this.loadGoogleFont(fontFamily);
            element.style.fontFamily = `'${fontFamily}', sans-serif`;
        }

        // Apply position & size
        if (position !== undefined && position !== null) {
            element.style.position = position;
        }

        if (width !== undefined && width !== null) {
            element.style.width = width || '';
        }

        if (height !== undefined && height !== null) {
            element.style.height = height || '';
        }

        if (top !== undefined && top !== null) {
            element.style.top = top || '';
        }

        if (left !== undefined && left !== null) {
            element.style.left = left || '';
        }

        // Apply link href
        if (element.tagName === 'A') {
            const newHref = document.getElementById('propLinkHref')?.value;
            if (newHref !== undefined) {
                element.setAttribute('href', newHref);
            }
        }

        // Apply image src, alt, and object-fit
        if (element.tagName === 'IMG') {
            const newSrc = document.getElementById('propImgSrc')?.value;
            const newAlt = document.getElementById('propImgAlt')?.value;
            const objectFit = document.getElementById('propImgObjectFit')?.value;

            if (newSrc !== undefined) {
                element.setAttribute('src', newSrc);
            }
            if (newAlt !== undefined) {
                element.setAttribute('alt', newAlt);
            }
            if (objectFit !== undefined) {
                element.style.objectFit = objectFit;
                // Ensure image has width/height for object-fit to work
                if (!element.style.width && !element.style.height) {
                    element.style.width = '100%';
                    element.style.height = 'auto';
                }
            }
        }

        // Only update HTML and show toast if saving to history
        if (saveToHistory) {
            this.updateHTML('Update properties');
            this.showToast('✅ Properties updated!', 'success');
        } else {
            // For live updates, just update the current HTML without adding to history
            const canvas = document.getElementById('canvas');
            const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;
            const newHTML = iframeDoc.documentElement.outerHTML;
            this.currentHTML = newHTML;
            this.projectData.html = this.currentHTML;
            this.saveProject();
        }
    }

    deleteElement(element) {
        // Don't allow deleting the body element
        if (element.tagName === 'BODY') {
            this.showToast('❌ Cannot delete body element', 'error');
            return;
        }

        const parent = element.parentNode;
        if (parent) {
            parent.removeChild(element);

            // Clear selection
            this.selectedElement = null;

            // Get iframe doc
            const canvas = document.getElementById('canvas');
            const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

            // Update HTML and layers
            this.updateHTML('Delete element');
            this.buildLayersTree(iframeDoc);

            // Clear properties panel
            const panel = document.getElementById('propertiesPanel');
            panel.innerHTML = `
                <p style="color: var(--text-secondary); font-size: 0.875rem; text-align: center; padding: 2rem 1rem;">
                    Select an element to edit
                </p>
            `;

            this.showToast('✅ Element deleted', 'success');
        }
    }

    deleteSelectedElement() {
        if (!this.selectedElement) {
            return;
        }

        // Don't allow deleting the body element
        if (this.selectedElement.tagName === 'BODY') {
            this.showToast('❌ Cannot delete body element', 'error');
            return;
        }

        // Store element info for the toast message
        const elementName = this.selectedElement.tagName.toLowerCase();

        // Delete the element
        this.deleteElement(this.selectedElement);

        console.log('🗑️ Deleted element:', elementName);
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
            li.draggable = true;
            li.dataset.elementId = this.generateElementId(element);

            const icon = this.getElementIcon(tagName);
            li.innerHTML = `
                <span class="layer-icon">${icon}</span>
                <span>${tagName}</span>
            `;

            // Click to select
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectElement(element);

                // Highlight in tree
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.classList.remove('selected');
                });
                li.classList.add('selected');
            });

            // Drag and drop in layers
            li.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedLayerElement = element;
                li.style.opacity = '0.5';
            });

            li.addEventListener('dragend', (e) => {
                li.style.opacity = '1';
                this.draggedLayerElement = null;

                // Clean up all drop indicators
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.style.background = '';
                });
            });

            li.addEventListener('dragover', (e) => {
                if (!this.draggedLayerElement) return;
                e.preventDefault();
                e.stopPropagation();

                // Remove any existing drop indicators
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());

                // Determine drop position based on mouse Y position
                const rect = li.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const isContainer = this.isContainer(element);

                // Create drop indicator line
                const dropLine = document.createElement('div');
                dropLine.className = 'layer-drop-indicator';
                dropLine.style.cssText = `
                    height: 2px;
                    background: #0EA5E9;
                    position: absolute;
                    left: ${level * 1.5}rem;
                    right: 0;
                    pointer-events: none;
                    z-index: 1000;
                    box-shadow: 0 0 4px rgba(14, 165, 233, 0.5);
                `;

                if (isContainer && e.clientY > midpoint) {
                    // Drop inside container (indent the line more)
                    dropLine.style.left = `${(level + 1) * 1.5}rem`;
                    dropLine.style.top = `${rect.bottom - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'inside';
                    li.style.background = 'rgba(14, 165, 233, 0.05)';
                } else if (e.clientY < midpoint) {
                    // Drop before element
                    dropLine.style.top = `${rect.top - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'before';
                } else {
                    // Drop after element
                    dropLine.style.top = `${rect.bottom - li.parentElement.getBoundingClientRect().top}px`;
                    this.dropPosition = 'after';
                }

                li.parentElement.appendChild(dropLine);
            });

            li.addEventListener('dragleave', (e) => {
                // Only remove if actually leaving (not entering child)
                const relatedTarget = e.relatedTarget;
                if (!li.contains(relatedTarget)) {
                    li.style.background = '';
                }
            });

            li.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Clean up visual indicators
                li.style.background = '';
                document.querySelectorAll('.layer-drop-indicator').forEach(indicator => indicator.remove());

                if (this.draggedLayerElement && this.draggedLayerElement !== element) {
                    // Don't allow element to be dropped into itself or its children
                    let checkParent = element;
                    while (checkParent) {
                        if (checkParent === this.draggedLayerElement) {
                            this.showToast('❌ Cannot drop element into itself', 'error');
                            return;
                        }
                        checkParent = checkParent.parentNode;
                    }

                    const parent = element.parentNode;
                    if (!parent) return;

                    // Execute the drop based on the determined position
                    if (this.dropPosition === 'inside' && this.isContainer(element)) {
                        // Drop inside container as first child
                        element.insertBefore(this.draggedLayerElement, element.firstChild);
                    } else if (this.dropPosition === 'before') {
                        // Drop before element
                        parent.insertBefore(this.draggedLayerElement, element);
                    } else {
                        // Drop after element
                        parent.insertBefore(this.draggedLayerElement, element.nextSibling);
                    }

                    // Get the iframe doc for rebuilding layers
                    const canvas = document.getElementById('canvas');
                    const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

                    this.updateHTML('Reorder in layers');
                    this.buildLayersTree(iframeDoc); // Rebuild layers to show new order

                    // Re-highlight the moved element
                    if (this.selectedElement) {
                        this.highlightInLayers(this.selectedElement);
                    }

                    this.showToast('✅ Element reordered', 'success');
                }
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

    generateElementId(element) {
        if (!element._yenzeId) {
            element._yenzeId = 'el_' + Math.random().toString(36).substr(2, 9);
        }
        return element._yenzeId;
    }

    addElement(type) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        const newElement = iframeDoc.createElement(type);
        newElement.textContent = `New ${type}`;
        newElement.style.padding = '1rem';
        newElement.style.margin = '0.5rem 0';
        newElement.style.background = '#f0f0f0';
        newElement.style.borderRadius = '4px';
        newElement.style.minHeight = '50px'; // Ensure it's visible and can receive drops
        newElement.style.border = '1px dashed #ccc'; // Visual indicator that it's empty

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(newElement);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(newElement, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(newElement);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(newElement);
        }

        // Make the new element editable
        this.makeElementEditable(newElement, iframeDoc);

        this.updateHTML(`Add ${type}`);
        this.buildLayersTree(iframeDoc); // Rebuild layers to show new element

        // Select the new element
        this.selectElement(newElement);

        this.showToast(`✅ ${type} added`, 'success');
    }

    addColumns() {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        const row = iframeDoc.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '1rem';
        row.style.margin = '1rem 0';
        row.style.minHeight = '100px'; // Ensure visible

        const col1 = iframeDoc.createElement('div');
        col1.style.flex = '1';
        col1.style.padding = '1rem';
        col1.style.minHeight = '80px'; // Ensure can receive drops
        col1.style.border = '1px dashed #ccc';
        // No text content - empty column
        // No background - inherits from parent

        const col2 = iframeDoc.createElement('div');
        col2.style.flex = '1';
        col2.style.padding = '1rem';
        col2.style.minHeight = '80px'; // Ensure can receive drops
        col2.style.border = '1px dashed #ccc';
        // No text content - empty column
        // No background - inherits from parent

        row.appendChild(col1);
        row.appendChild(col2);

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(row);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(row, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(row);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(row);
        }

        // Make the new elements editable
        this.makeElementEditable(row, iframeDoc);
        this.makeElementEditable(col1, iframeDoc);
        this.makeElementEditable(col2, iframeDoc);

        this.updateHTML('Add columns');
        this.buildLayersTree(iframeDoc); // Rebuild layers to show new elements

        // Select the row
        this.selectElement(row);

        this.showToast('✅ 2 columns added', 'success');
    }

    insertElementTemplate(elementType) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        if (!iframeDoc || !iframeDoc.body) {
            this.showToast('⚠️ Please import HTML first', 'error');
            return;
        }

        const template = ELEMENT_TEMPLATES[elementType];
        if (!template) {
            this.showToast('⚠️ Template not found', 'error');
            return;
        }

        // Create a temporary container to parse the HTML
        const tempDiv = iframeDoc.createElement('div');
        tempDiv.innerHTML = template.trim();
        const newElement = tempDiv.firstElementChild;

        // Insert based on selected element
        if (this.selectedElement) {
            // If selected element is a container, add inside it
            if (this.isContainer(this.selectedElement)) {
                this.selectedElement.appendChild(newElement);
            } else {
                // Otherwise, add after the selected element (as sibling)
                const parent = this.selectedElement.parentNode;
                if (parent) {
                    parent.insertBefore(newElement, this.selectedElement.nextSibling);
                } else {
                    iframeDoc.body.appendChild(newElement);
                }
            }
        } else {
            // No selection, add to body
            iframeDoc.body.appendChild(newElement);
        }

        // Make the new element and its children editable
        this.makeElementEditable(newElement, iframeDoc);

        // Make all descendant elements editable too
        newElement.querySelectorAll('*').forEach(child => {
            this.makeElementEditable(child, iframeDoc);
        });

        this.updateHTML(`Add ${elementType}`);
        this.buildLayersTree(iframeDoc);

        // Select the new element
        this.selectElement(newElement);

        // Switch to Layers tab to show the new element
        this.switchTab('layers', 'left');

        const elementNames = {
            'contact-form': 'Contact Form',
            'newsletter-form': 'Newsletter Form',
            'navbar': 'Navigation Bar',
            'footer': 'Footer',
            'hero': 'Hero Section',
            'card': 'Card Grid',
            'cta': 'Call to Action',
            'two-columns': '2 Columns',
            'three-columns': '3 Columns'
        };

        this.showToast(`✅ ${elementNames[elementType] || elementType} added`, 'success');
    }

    insertElementTemplateAtPosition(elementType, targetElement, position) {
        const canvas = document.getElementById('canvas');
        const iframeDoc = canvas.contentDocument || canvas.contentWindow.document;

        if (!iframeDoc || !iframeDoc.body) {
            this.showToast('⚠️ Please import HTML first', 'error');
            return;
        }

        const template = ELEMENT_TEMPLATES[elementType];
        if (!template) {
            this.showToast('⚠️ Template not found', 'error');
            return;
        }

        // Create a temporary container to parse the HTML
        const tempDiv = iframeDoc.createElement('div');
        tempDiv.innerHTML = template.trim();
        const newElement = tempDiv.firstElementChild;

        // Insert at the specific position
        if (!targetElement || targetElement === iframeDoc.body) {
            // If no target or target is body, append to body
            iframeDoc.body.appendChild(newElement);
        } else {
            const parent = targetElement.parentNode;
            if (position === 'before') {
                parent.insertBefore(newElement, targetElement);
            } else {
                // Insert after
                parent.insertBefore(newElement, targetElement.nextSibling);
            }
        }

        // Make the new element and its children editable
        this.makeElementEditable(newElement, iframeDoc);

        // Make all descendant elements editable too
        newElement.querySelectorAll('*').forEach(child => {
            this.makeElementEditable(child, iframeDoc);
        });

        this.updateHTML(`Add ${elementType}`);
        this.buildLayersTree(iframeDoc);

        // Select the new element
        this.selectElement(newElement);

        // Switch to Layers tab to show the new element
        this.switchTab('layers', 'left');

        const elementNames = {
            'contact-form': 'Contact Form',
            'newsletter-form': 'Newsletter Form',
            'navbar': 'Navigation Bar',
            'footer': 'Footer',
            'hero': 'Hero Section',
            'card': 'Card Grid',
            'cta': 'Call to Action',
            'two-columns': '2 Columns',
            'three-columns': '3 Columns'
        };

        this.showToast(`✅ ${elementNames[elementType] || elementType} added`, 'success');
    }

    filterElements(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const categories = document.querySelectorAll('.element-category');

        categories.forEach(category => {
            const cards = category.querySelectorAll('.element-card');
            let visibleCards = 0;

            cards.forEach(card => {
                const elementName = card.querySelector('.element-name').textContent.toLowerCase();
                const elementType = card.dataset.element.toLowerCase();

                if (elementName.includes(term) || elementType.includes(term)) {
                    card.style.display = 'flex';
                    visibleCards++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Hide category if no visible cards
            if (visibleCards === 0 && term !== '') {
                category.style.display = 'none';
            } else {
                category.style.display = 'flex';
            }
        });
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

    async publish() {
        if (!this.currentHTML) {
            this.showToast('⚠️ No content to publish', 'error');
            return;
        }

        // Check if user is authenticated
        if (!supabaseClient.isAuthenticated()) {
            // Show auth modal first
            authUI.showAuthModal('login');
            this.showToast('Please log in to publish your website', 'info');
            return;
        }

        // User is authenticated - show plan selection modal
        authUI.showPlanModal();
    }

    async publishWithPlan(plan) {
        try {
            this.showToast('Publishing your website...', 'info');

            // Generate subdomain slug from project name
            // Generate unique subdomain slug
            const subdomainSlug = await this.generateUniqueSubdomainSlug(this.projectData.name);

            // Save project to database with subdomain_slug
            const { data: project, error: saveError } = await supabaseClient.saveProject({
                name: this.projectData.name,
                html: this.currentHTML,
                plan: plan,
                subdomain_slug: subdomainSlug
            });

            if (saveError) {
                throw new Error('Failed to save project: ' + saveError.message);
            }

            // Generate deployment URL based on plan
            let publishedUrl;

            if (plan === 'free' || plan === 'starter') {
                // FREE & STARTER: Use subdomain
                publishedUrl = `https://${subdomainSlug}.yenze.io`;
            } else if (plan === 'pro') {
                // PRO: Can use custom domain (to be implemented) or subdomain for now
                publishedUrl = `https://${subdomainSlug}.yenze.io`;
            }

            // Update project with published URL
            const { error: updateError } = await supabaseClient.updateProjectUrl(
                project.id,
                publishedUrl
            );

            if (updateError) {
                throw new Error('Failed to update project URL: ' + updateError.message);
            }

            this.projectData.publishedUrl = publishedUrl;
            this.projectData.subdomainSlug = subdomainSlug;
            this.saveProject(); // Save to localStorage as well

            // Create deployment record
            await supabaseClient.client
                .from('deployments')
                .insert({
                    project_id: project.id,
                    user_id: supabaseClient.currentUser.id,
                    deployment_url: publishedUrl,
                    status: 'ready'
                });

            // Show professional popup with the URL
            showPublishPopup(publishedUrl, plan);
            this.showToast('🚀 Website published!', 'success');

        } catch (error) {
            console.error('Publish error:', error);
            this.showToast('❌ Failed to publish: ' + error.message, 'error');
        }
    }

    generateSubdomainSlug(projectName) {
        // Convert project name to valid subdomain slug
        // Examples:
        // "My Portfolio" → "my-portfolio"
        // "Empresa XYZ!" → "empresa-xyz"
        // "José's Site" → "joses-site"

        return projectName
            .toLowerCase()
            .normalize('NFD') // Normalize accents
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .substring(0, 63); // Max length for subdomain
    }

    async generateUniqueSubdomainSlug(projectName) {
        // Generate base slug from project name
        let baseSlug = this.generateSubdomainSlug(projectName);

        // If slug is empty (project name had no valid chars), use default
        if (!baseSlug) {
            baseSlug = 'project';
        }

        let uniqueSlug = baseSlug;
        let attempt = 1;
        const maxAttempts = 100;

        // Keep trying until we find a unique slug
        while (attempt < maxAttempts) {
            // Check if this slug is available
            const { data: existing } = await supabaseClient.client
                .from('projects')
                .select('id')
                .eq('subdomain_slug', uniqueSlug)
                .neq('id', this.projectData.id || 'none')
                .single();

            if (!existing) {
                // Slug is available!
                if (attempt > 1) {
                    // Show message that we auto-generated a unique slug
                    this.showToast(`Project name was modified to "${uniqueSlug}" to ensure uniqueness`, 'info');
                }
                return uniqueSlug;
            }

            // Slug is taken, try adding a number
            attempt++;
            uniqueSlug = `${baseSlug}-${attempt}`;
        }

        // If we couldn't find a unique slug after 100 attempts, use timestamp
        const timestamp = Date.now().toString().slice(-6);
        uniqueSlug = `${baseSlug}-${timestamp}`;
        this.showToast(`Project name was modified to "${uniqueSlug}" to ensure uniqueness`, 'info');

        return uniqueSlug;
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
// Make app globally accessible for auth-ui integration
const app = new YenzeBuilder();
window.app = app;
