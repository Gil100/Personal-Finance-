// Toast/Notification Component - Hebrew-native with RTL support
class Toast {
    constructor(options = {}) {
        this.options = {
            type: 'info', // success, error, warning, info
            title: '',
            message: '',
            duration: 5000, // Auto-close after 5 seconds, 0 = no auto-close
            closable: true,
            icon: null, // Custom icon, if null will use default based on type
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left
            onClose: null,
            ...options
        };
        this.element = null;
        this.timer = null;
    }

    static container = null;

    static getContainer(position = 'top-right') {
        if (!Toast.container || Toast.container.className !== `toast-container toast-${position}`) {
            // Remove existing container
            if (Toast.container) {
                Toast.container.remove();
            }
            
            // Create new container
            Toast.container = document.createElement('div');
            Toast.container.className = `toast-container toast-${position}`;
            document.body.appendChild(Toast.container);
        }
        return Toast.container;
    }

    render() {
        const toast = document.createElement('div');
        toast.className = this.getToastClasses();

        // Add icon
        const icon = this.createIcon();
        toast.appendChild(icon);

        // Add content
        const content = this.createContent();
        toast.appendChild(content);

        // Add close button
        if (this.options.closable) {
            const closeBtn = this.createCloseButton();
            toast.appendChild(closeBtn);
        }

        this.element = toast;
        return toast;
    }

    getToastClasses() {
        const classes = ['toast', `toast-${this.options.type}`];
        return classes.join(' ');
    }

    createIcon() {
        const icon = document.createElement('span');
        icon.className = 'toast-icon';

        if (this.options.icon) {
            icon.textContent = this.options.icon;
        } else {
            // Default icons based on type
            const defaultIcons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            icon.textContent = defaultIcons[this.options.type] || defaultIcons.info;
        }

        return icon;
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'toast-content';

        // Add title if provided
        if (this.options.title) {
            const title = document.createElement('div');
            title.className = 'toast-title';
            title.textContent = this.options.title;
            content.appendChild(title);
        }

        // Add message
        if (this.options.message) {
            const message = document.createElement('div');
            message.className = 'toast-message';
            message.textContent = this.options.message;
            content.appendChild(message);
        }

        return content;
    }

    createCloseButton() {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.close());
        return closeBtn;
    }

    show() {
        // Render toast if not already rendered
        if (!this.element) {
            this.render();
        }

        // Get container and add toast
        const container = Toast.getContainer(this.options.position);
        container.appendChild(this.element);

        // Auto-close timer
        if (this.options.duration > 0) {
            this.timer = setTimeout(() => {
                this.close();
            }, this.options.duration);
        }

        return this;
    }

    close() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.element && this.element.parentNode) {
            // Add fade-out animation
            this.element.style.animation = 'toastFadeOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                
                // Call onClose callback
                if (this.options.onClose) {
                    this.options.onClose(this);
                }
            }, 300);
        }
    }

    update(options) {
        Object.assign(this.options, options);
        
        if (this.element) {
            // Update icon
            const icon = this.element.querySelector('.toast-icon');
            if (icon) {
                if (this.options.icon) {
                    icon.textContent = this.options.icon;
                } else {
                    const defaultIcons = {
                        success: '✅',
                        error: '❌',
                        warning: '⚠️',
                        info: 'ℹ️'
                    };
                    icon.textContent = defaultIcons[this.options.type] || defaultIcons.info;
                }
            }

            // Update title
            const title = this.element.querySelector('.toast-title');
            if (title && this.options.title) {
                title.textContent = this.options.title;
            }

            // Update message
            const message = this.element.querySelector('.toast-message');
            if (message && this.options.message) {
                message.textContent = this.options.message;
            }

            // Update classes
            this.element.className = this.getToastClasses();
        }
    }
}

// Hebrew toast presets and utilities
class HebrewToasts {
    static success(message, title = 'הצלחה') {
        return new Toast({
            type: 'success',
            title: title,
            message: message,
            duration: 4000
        }).show();
    }

    static error(message, title = 'שגיאה') {
        return new Toast({
            type: 'error',
            title: title,
            message: message,
            duration: 6000
        }).show();
    }

    static warning(message, title = 'אזהרה') {
        return new Toast({
            type: 'warning',
            title: title,
            message: message,
            duration: 5000
        }).show();
    }

    static info(message, title = 'מידע') {
        return new Toast({
            type: 'info',
            title: title,
            message: message,
            duration: 4000
        }).show();
    }

    // Financial-specific toasts
    static transactionSaved() {
        return HebrewToasts.success('העסקה נשמרה בהצלחה', 'נשמר');
    }

    static transactionDeleted() {
        return HebrewToasts.success('העסקה נמחקה בהצלחה', 'נמחק');
    }

    static budgetExceeded(category, amount) {
        return HebrewToasts.warning(
            `התקציב עבור ${category} הושלם. חרגת ב-${amount} ₪`,
            'חריגה מתקציב'
        );
    }

    static dataExported(format) {
        return HebrewToasts.success(
            `הנתונים יוצאו בפורמט ${format} בהצלחה`,
            'יצוא הושלם'
        );
    }

    static dataImported(count) {
        return HebrewToasts.success(
            `${count} עסקאות יובאו בהצלחה`,
            'יבוא הושלם'
        );
    }

    static connectionError() {
        return HebrewToasts.error(
            'בעיה בחיבור לאינטרנט. נסה שוב מאוחר יותר',
            'שגיאת חיבור'
        );
    }

    static validationError(field) {
        return HebrewToasts.error(
            `שדה "${field}" הוא חובה`,
            'שגיאת ולידציה'
        );
    }

    static autoSave() {
        return new Toast({
            type: 'info',
            title: 'שמירה אוטומטית',
            message: 'השינויים נשמרו אוטומטית',
            duration: 2000,
            icon: '💾'
        }).show();
    }

    // Progress toast for long operations
    static progress(message, title = 'בטעינה...') {
        return new Toast({
            type: 'info',
            title: title,
            message: message,
            duration: 0, // Don't auto-close
            closable: false,
            icon: '⏳'
        }).show();
    }

    // Banking integration toasts
    static bankSync(bankName) {
        return HebrewToasts.info(
            `מסנכרן נתונים מ${bankName}...`,
            'סנכרון בנק'
        );
    }

    static bankSyncComplete(bankName, count) {
        return HebrewToasts.success(
            `${count} עסקאות חדשות מ${bankName}`,
            'סנכרון הושלם'
        );
    }

    static bankSyncError(bankName) {
        return HebrewToasts.error(
            `לא הצלחנו להתחבר ל${bankName}. בדוק את פרטי הגישה`,
            'שגיאת סנכרון'
        );
    }

    // Clear all toasts
    static clearAll() {
        if (Toast.container) {
            const toasts = Toast.container.querySelectorAll('.toast');
            toasts.forEach(toast => {
                toast.style.animation = 'toastFadeOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            });
        }
    }
}

// Add additional toast styles
const toastPositionStyles = `
.toast-top-right {
    top: var(--spacing-lg);
    right: var(--spacing-lg);
}

.toast-top-left {
    top: var(--spacing-lg);
    left: var(--spacing-lg);
}

.toast-bottom-right {
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
}

.toast-bottom-left {
    bottom: var(--spacing-lg);
    left: var(--spacing-lg);
}

@keyframes toastFadeOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

/* RTL-specific fade out for left positioned toasts */
.toast-top-left .toast,
.toast-bottom-left .toast {
    animation: toastSlideInLeft 0.3s ease-out;
}

@keyframes toastSlideInLeft {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .toast-container {
        left: var(--spacing-sm) !important;
        right: var(--spacing-sm) !important;
        top: var(--spacing-sm) !important;
    }
    
    .toast {
        min-width: auto;
        width: 100%;
    }
}
`;

// Inject toast position styles
if (!document.getElementById('toast-position-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-position-styles';
    style.textContent = toastPositionStyles;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Toast, HebrewToasts };
} else {
    window.Toast = Toast;
    window.HebrewToasts = HebrewToasts;
}