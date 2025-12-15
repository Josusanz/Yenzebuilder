/**
 * Autosave Manager
 * Automatically saves project state to Supabase
 */

export class AutosaveManager {
    constructor(saveCallback, interval = 30000) {
        this.saveCallback = saveCallback;
        this.interval = interval;
        this.timer = null;
        this.isDirty = false;
        this.isSaving = false;
        this.lastSaveTime = null;
        this.enabled = true;
    }

    /**
     * Start autosave
     */
    start() {
        if (this.timer) return;

        this.timer = setInterval(() => {
            if (this.isDirty && !this.isSaving && this.enabled) {
                this.save();
            }
        }, this.interval);

        console.log(`Autosave started (interval: ${this.interval}ms)`);
    }

    /**
     * Stop autosave
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('Autosave stopped');
        }
    }

    /**
     * Mark content as dirty (needs saving)
     */
    markDirty() {
        this.isDirty = true;
        this._updateStatus('unsaved');
    }

    /**
     * Perform save
     */
    async save() {
        if (this.isSaving) {
            console.log('Save already in progress, skipping');
            return;
        }

        this.isSaving = true;
        this._updateStatus('saving');

        try {
            await this.saveCallback();
            this.isDirty = false;
            this.lastSaveTime = new Date();
            this._updateStatus('saved');
            console.log('Autosave completed at', this.lastSaveTime.toLocaleTimeString());
        } catch (error) {
            console.error('Autosave failed:', error);
            this._updateStatus('error');
            throw error;
        } finally {
            this.isSaving = false;
        }
    }

    /**
     * Force immediate save
     */
    async forceSave() {
        this.stop();
        await this.save();
        this.start();
    }

    /**
     * Enable/disable autosave
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    /**
     * Get time since last save
     */
    getTimeSinceLastSave() {
        if (!this.lastSaveTime) return null;
        return Date.now() - this.lastSaveTime.getTime();
    }

    /**
     * Get save status text
     */
    getStatusText() {
        if (this.isSaving) return 'Saving...';
        if (!this.lastSaveTime) return 'Not saved yet';

        const seconds = Math.floor(this.getTimeSinceLastSave() / 1000);

        if (seconds < 60) return `Saved ${seconds}s ago`;
        if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
        return `Saved ${Math.floor(seconds / 3600)}h ago`;
    }

    /**
     * Update UI status
     */
    _updateStatus(status) {
        window.dispatchEvent(new CustomEvent('autosave-status', {
            detail: {
                status,
                lastSaveTime: this.lastSaveTime,
                isDirty: this.isDirty,
                statusText: this.getStatusText()
            }
        }));
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
    }
}

/**
 * Initialize autosave for the builder
 */
export function initAutosave(builder) {
    const autosave = new AutosaveManager(async () => {
        // Check if user is logged in
        if (!supabaseClient || !supabaseClient.getUser()) {
            console.log('User not logged in, skipping autosave');
            return;
        }

        // Get current project ID
        const projectId = builder.currentProjectId;
        if (!projectId) {
            console.log('No project ID, saving to localStorage only');
            localStorage.setItem('yenze_autosave', builder.getCanvasHTML());
            return;
        }

        // Save to Supabase
        const html = builder.getCanvasHTML();
        const { error } = await supabaseClient.client
            .from('projects')
            .update({
                html: html,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (error) throw error;
    }, 30000); // 30 seconds

    // Listen for changes
    window.addEventListener('content-changed', () => {
        autosave.markDirty();
    });

    // Listen for history changes
    window.addEventListener('history-change', () => {
        autosave.markDirty();
    });

    // Save before page unload
    window.addEventListener('beforeunload', async (e) => {
        if (autosave.isDirty) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';

            // Try to save synchronously
            try {
                await autosave.forceSave();
            } catch (error) {
                console.error('Failed to save before unload:', error);
            }
        }
    });

    autosave.start();
    window.autosaveManager = autosave;

    return autosave;
}
