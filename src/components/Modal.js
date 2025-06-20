// Modal Component - Hebrew-native with RTL support
class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, full
            closable: true,
            backdrop: true, // Close on backdrop click
            keyboard: true, // Close on ESC key
            actions: [], // Array of action buttons
            onOpen: null,
            onClose: null,
            ...options
        };
        this.isOpen = false;
        this.element = null;
    }

    render() {
        if (this.element) {
            return this.element;
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'none';

        // Handle backdrop click
        if (this.options.backdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Create modal content
        const content = document.createElement('div');
        content.className = this.getContentClasses();

        // Create header
        if (this.options.title || this.options.closable) {
            const header = this.createHeader();
            content.appendChild(header);
        }

        // Create body
        const body = this.createBody();
        content.appendChild(body);

        // Create footer with actions
        if (this.options.actions && this.options.actions.length > 0) {
            const footer = this.createFooter();
            content.appendChild(footer);
        }

        overlay.appendChild(content);
        this.element = overlay;

        // Handle keyboard events
        if (this.options.keyboard) {
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        }

        return overlay;
    }

    getContentClasses() {
        const classes = ['modal-content'];
        
        if (this.options.size !== 'medium') {
            classes.push(`modal-${this.options.size}`);
        }
        
        return classes.join(' ');
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'modal-header';

        // Add title
        if (this.options.title) {
            const title = document.createElement('h3');
            title.className = 'modal-title';
            title.textContent = this.options.title;
            header.appendChild(title);
        }

        // Add close button
        if (this.options.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => this.close());
            header.appendChild(closeBtn);
        }

        return header;
    }

    createBody() {
        const body = document.createElement('div');
        body.className = 'modal-body';

        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        }

        return body;
    }

    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        this.options.actions.forEach(action => {
            const button = this.createActionButton(action);
            footer.appendChild(button);
        });

        return footer;
    }

    createActionButton(action) {
        const button = document.createElement('button');
        button.className = `btn btn-${action.type || 'secondary'}`;
        button.textContent = action.text;

        if (action.disabled) {
            button.disabled = true;
        }

        button.addEventListener('click', () => {
            if (action.handler) {
                const result = action.handler(this);
                // Close modal if handler returns true or undefined
                if (result !== false) {
                    this.close();
                }
            } else if (action.close !== false) {
                this.close();
            }
        });

        return button;
    }

    open() {
        if (this.isOpen) return;

        // Render modal if not already rendered
        if (!this.element) {
            this.render();
            document.body.appendChild(this.element);
        }

        // Show modal
        this.element.style.display = 'flex';
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Call onOpen callback
        if (this.options.onOpen) {
            this.options.onOpen(this);
        }

        // Focus first focusable element
        setTimeout(() => {
            const focusable = this.element.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
            }
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        // Hide modal
        this.element.style.display = 'none';
        this.isOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Call onClose callback
        if (this.options.onClose) {
            this.options.onClose(this);
        }
    }

    destroy() {
        this.close();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    handleKeydown(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    setContent(content) {
        if (!this.element) return;
        
        const body = this.element.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }

    setTitle(title) {
        if (!this.element) return;
        
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// Hebrew modal presets
class HebrewModals {
    static confirm(message, onConfirm, onCancel) {
        return new Modal({
            title: 'אישור פעולה',
            content: `<p>${message}</p>`,
            size: 'small',
            actions: [
                {
                    text: 'ביטול',
                    type: 'secondary',
                    handler: () => {
                        if (onCancel) onCancel();
                        return true; // Close modal
                    }
                },
                {
                    text: 'אישור',
                    type: 'primary',
                    handler: () => {
                        if (onConfirm) onConfirm();
                        return true; // Close modal
                    }
                }
            ]
        });
    }

    static alert(message, title = 'הודעה') {
        return new Modal({
            title: title,
            content: `<p>${message}</p>`,
            size: 'small',
            actions: [
                {
                    text: 'הבנתי',
                    type: 'primary'
                }
            ]
        });
    }

    static error(message, title = 'שגיאה') {
        return new Modal({
            title: title,
            content: `<div style="color: var(--error-color); display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-2xl);">⚠️</span>
                        <p>${message}</p>
                      </div>`,
            size: 'small',
            actions: [
                {
                    text: 'סגור',
                    type: 'error'
                }
            ]
        });
    }

    static success(message, title = 'הצלחה') {
        return new Modal({
            title: title,
            content: `<div style="color: var(--success-color); display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-2xl);">✅</span>
                        <p>${message}</p>
                      </div>`,
            size: 'small',
            actions: [
                {
                    text: 'סגור',
                    type: 'success'
                }
            ]
        });
    }

    static addTransaction() {
        const form = `
            <form class="modal-form">
                <div class="form-group">
                    <label class="form-label">סכום *</label>
                    <input type="text" class="form-input form-input-currency" placeholder="0.00" required>
                </div>
                <div class="form-group">
                    <label class="form-label">תיאור *</label>
                    <input type="text" class="form-input" placeholder="תיאור העסקה..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">קטגוריה *</label>
                    <select class="form-input" required>
                        <option value="">בחר קטגוריה...</option>
                        <option value="food">מזון ומשקאות</option>
                        <option value="transport">תחבורה</option>
                        <option value="housing">דיור</option>
                        <option value="health">בריאות</option>
                        <option value="education">חינוך</option>
                        <option value="entertainment">בילויים</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">תאריך</label>
                    <input type="date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </form>
        `;

        return new Modal({
            title: 'הוסף עסקה חדשה',
            content: form,
            size: 'medium',
            actions: [
                {
                    text: 'ביטול',
                    type: 'secondary'
                },
                {
                    text: 'שמור עסקה',
                    type: 'primary',
                    handler: (modal) => {
                        // Validate and save transaction
                        const form = modal.element.querySelector('.modal-form');
                        const formData = new FormData(form);
                        
                        // Add validation logic here
                        console.log('Saving transaction:', Object.fromEntries(formData));
                        
                        // Show success message
                        HebrewModals.success('העסקה נשמרה בהצלחה!').open();
                        
                        return true; // Close modal
                    }
                }
            ]
        });
    }

    static exportData() {
        const content = `
            <div class="export-options">
                <h4>בחר פורמט יצוא:</h4>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="csv" checked> CSV (Excel)
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="pdf"> PDF
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="json"> JSON
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">תקופה:</label>
                    <select class="form-input">
                        <option value="month">החודש הנוכחי</option>
                        <option value="quarter">הרבעון הנוכחי</option>
                        <option value="year">השנה הנוכחית</option>
                        <option value="all">כל הנתונים</option>
                    </select>
                </div>
            </div>
        `;

        return new Modal({
            title: 'יצא נתונים',
            content: content,
            size: 'medium',
            actions: [
                {
                    text: 'ביטול',
                    type: 'secondary'
                },
                {
                    text: 'יצא',
                    type: 'primary',
                    handler: () => {
                        // Export logic here
                        console.log('Exporting data...');
                        HebrewModals.success('הנתונים יוצאו בהצלחה!').open();
                        return true;
                    }
                }
            ]
        });
    }
}

// Add modal size styles to CSS
const modalSizeStyles = `
.modal-small {
    max-width: 400px;
}

.modal-large {
    max-width: 1000px;
}

.modal-full {
    max-width: 95vw;
    max-height: 95vh;
}

.modal-form .form-group {
    margin-bottom: var(--spacing-md);
}

.export-options .form-group {
    margin-bottom: var(--spacing-sm);
}

.export-options h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
}
`;

// Inject modal styles
if (!document.getElementById('modal-size-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-size-styles';
    style.textContent = modalSizeStyles;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Modal, HebrewModals };
} else {
    window.Modal = Modal;
    window.HebrewModals = HebrewModals;
}