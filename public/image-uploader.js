// Image Uploader - Drag & Drop image upload for YENZE Builder
class ImageUploader {
    constructor() {
        this.supabaseClient = window.supabaseClient;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    }

    async uploadImage(file) {
        // Validate file
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP, SVG)');
        }

        if (file.size > this.maxFileSize) {
            throw new Error('File is too large. Maximum size is 5MB');
        }

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `user-uploads/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await this.supabaseClient.client.storage
                .from('images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabaseClient.client.storage
                .from('images')
                .getPublicUrl(filePath);

            return {
                success: true,
                url: publicUrl,
                fileName: fileName,
                filePath: filePath
            };

        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadFromUrl(imageUrl) {
        try {
            // Fetch image from URL
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Failed to fetch image');

            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });

            return await this.uploadImage(file);
        } catch (error) {
            console.error('URL upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    createDropZone(element, onUploadSuccess) {
        const dropZone = element;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                const file = files[0];
                const result = await this.uploadImage(file);

                if (result.success && onUploadSuccess) {
                    onUploadSuccess(result.url);
                } else if (!result.success) {
                    alert('Upload failed: ' + result.error);
                }
            }
        }, false);
    }

    showUploadModal(onUploadSuccess) {
        const modalHTML = `
            <div id="imageUploadModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; border-radius: 16px; max-width: 500px; width: 90%; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">Upload Image</h2>
                        <button onclick="document.getElementById('imageUploadModal').remove()" style="width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; color: #6b7280; font-size: 20px;">×</button>
                    </div>

                    <!-- Drag & Drop Zone -->
                    <div id="dropZone" style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin: 0 auto 16px;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #374151;">Drop image here</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">or click to browse</p>
                        <input type="file" id="fileInput" accept="image/*" style="display: none;">
                    </div>

                    <!-- URL Input -->
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #374151;">Or paste image URL:</p>
                        <div style="display: flex; gap: 8px;">
                            <input id="imageUrlInput" type="text" placeholder="https://example.com/image.jpg" style="flex: 1; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            <button id="urlUploadBtn" style="padding: 12px 20px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Load
                            </button>
                        </div>
                    </div>

                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Max size: 5MB • Supported: JPEG, PNG, GIF, WebP, SVG</p>
                </div>
            </div>

            <style>
                #dropZone.drag-over {
                    border-color: #3B82F6;
                    background: #eff6ff;
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup event listeners
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const urlInput = document.getElementById('imageUrlInput');
        const urlUploadBtn = document.getElementById('urlUploadBtn');

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const result = await this.uploadImage(e.target.files[0]);
                if (result.success) {
                    document.getElementById('imageUploadModal').remove();
                    if (onUploadSuccess) onUploadSuccess(result.url);
                } else {
                    alert('Upload failed: ' + result.error);
                }
            }
        });

        // URL upload
        urlUploadBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            if (!url) return;

            urlUploadBtn.textContent = 'Loading...';
            urlUploadBtn.disabled = true;

            const result = await this.uploadFromUrl(url);

            urlUploadBtn.textContent = 'Load';
            urlUploadBtn.disabled = false;

            if (result.success) {
                document.getElementById('imageUploadModal').remove();
                if (onUploadSuccess) onUploadSuccess(result.url);
            } else {
                alert('Upload failed: ' + result.error);
            }
        });

        // Setup drag & drop
        this.createDropZone(dropZone, (url) => {
            document.getElementById('imageUploadModal').remove();
            if (onUploadSuccess) onUploadSuccess(url);
        });
    }
}

// Initialize global instance
window.imageUploader = new ImageUploader();
