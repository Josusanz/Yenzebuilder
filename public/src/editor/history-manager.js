/**
 * History Manager - Undo/Redo System
 * Implements Command Pattern for reversible operations
 */

export class HistoryManager {
    constructor(maxHistorySize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = maxHistorySize;
        this.isExecuting = false;
    }

    /**
     * Execute a command and add it to history
     * @param {Command} command - Command to execute
     */
    execute(command) {
        if (this.isExecuting) return;

        this.isExecuting = true;

        try {
            command.execute();

            // Remove any commands after current index (they're now invalidated)
            this.history = this.history.slice(0, this.currentIndex + 1);

            // Add new command
            this.history.push(command);
            this.currentIndex++;

            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
                this.currentIndex--;
            }

            this._notifyChange();
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Undo last command
     */
    undo() {
        if (!this.canUndo()) return;

        this.isExecuting = true;

        try {
            const command = this.history[this.currentIndex];
            command.undo();
            this.currentIndex--;
            this._notifyChange();
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Redo next command
     */
    redo() {
        if (!this.canRedo()) return;

        this.isExecuting = true;

        try {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            command.redo();
            this._notifyChange();
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this._notifyChange();
    }

    /**
     * Get current state description
     */
    getCurrentState() {
        if (this.currentIndex < 0) return null;
        return this.history[this.currentIndex].description;
    }

    /**
     * Notify listeners of history change
     */
    _notifyChange() {
        window.dispatchEvent(new CustomEvent('history-change', {
            detail: {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                currentState: this.getCurrentState()
            }
        }));
    }
}

/**
 * Base Command class
 */
export class Command {
    constructor(description) {
        this.description = description;
    }

    execute() {
        throw new Error('execute() must be implemented');
    }

    undo() {
        throw new Error('undo() must be implemented');
    }

    redo() {
        this.execute();
    }
}

/**
 * Command for editing element properties
 */
export class EditPropertiesCommand extends Command {
    constructor(element, oldProperties, newProperties) {
        super('Edit Properties');
        this.element = element;
        this.oldProperties = { ...oldProperties };
        this.newProperties = { ...newProperties };
    }

    execute() {
        Object.assign(this.element.style, this.newProperties);
    }

    undo() {
        Object.assign(this.element.style, this.oldProperties);
    }
}

/**
 * Command for adding elements
 */
export class AddElementCommand extends Command {
    constructor(parent, element, index = null) {
        super('Add Element');
        this.parent = parent;
        this.element = element;
        this.index = index;
    }

    execute() {
        if (this.index !== null && this.index < this.parent.children.length) {
            this.parent.insertBefore(this.element, this.parent.children[this.index]);
        } else {
            this.parent.appendChild(this.element);
        }
    }

    undo() {
        this.element.remove();
    }

    redo() {
        this.execute();
    }
}

/**
 * Command for removing elements
 */
export class RemoveElementCommand extends Command {
    constructor(element) {
        super('Remove Element');
        this.element = element;
        this.parent = element.parentNode;
        this.nextSibling = element.nextSibling;
    }

    execute() {
        this.element.remove();
    }

    undo() {
        if (this.nextSibling) {
            this.parent.insertBefore(this.element, this.nextSibling);
        } else {
            this.parent.appendChild(this.element);
        }
    }
}

/**
 * Command for editing text content
 */
export class EditTextCommand extends Command {
    constructor(element, oldText, newText) {
        super('Edit Text');
        this.element = element;
        this.oldText = oldText;
        this.newText = newText;
    }

    execute() {
        this.element.textContent = this.newText;
    }

    undo() {
        this.element.textContent = this.oldText;
    }
}

/**
 * Compound command for batch operations
 */
export class CompoundCommand extends Command {
    constructor(commands, description = 'Multiple Changes') {
        super(description);
        this.commands = commands;
    }

    execute() {
        this.commands.forEach(cmd => cmd.execute());
    }

    undo() {
        // Undo in reverse order
        [...this.commands].reverse().forEach(cmd => cmd.undo());
    }

    redo() {
        this.execute();
    }
}

// Global history manager instance
export const historyManager = new HistoryManager();
window.historyManager = historyManager;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Z = Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        historyManager.undo();
    }

    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        historyManager.redo();
    }
});
