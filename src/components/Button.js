// Button Component - Hebrew-native with RTL support
class Button {
    constructor(options = {}) {
        this.options = {
            type: 'primary', // primary, secondary, success, warning, error, ghost
            size: 'medium', // small, medium, large
            disabled: false,
            loading: false,
            icon: null,
            iconPosition: 'start', // start, end
            fullWidth: false,
            ...options
        };
    }

    render(text, onClick = () => {}) {
        const btn = document.createElement('button');
        btn.className = this.getClasses();
        btn.disabled = this.options.disabled || this.options.loading;
        btn.onclick = onClick;

        // Create button content
        const content = this.createContent(text);
        btn.appendChild(content);

        return btn;
    }

    getClasses() {
        const classes = ['btn'];
        
        // Type classes
        classes.push(`btn-${this.options.type}`);
        
        // Size classes
        if (this.options.size !== 'medium') {
            classes.push(`btn-${this.options.size}`);
        }
        
        // State classes
        if (this.options.disabled) classes.push('btn-disabled');
        if (this.options.loading) classes.push('btn-loading');
        if (this.options.fullWidth) classes.push('btn-full-width');
        
        return classes.join(' ');
    }

    createContent(text) {
        const content = document.createElement('span');
        content.className = 'btn-content';

        // Add loading spinner if loading
        if (this.options.loading) {
            const spinner = this.createSpinner();
            content.appendChild(spinner);
        }

        // Add icon if provided
        if (this.options.icon && !this.options.loading) {
            const icon = this.createIcon();
            if (this.options.iconPosition === 'start') {
                content.appendChild(icon);
            }
        }

        // Add text
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        content.appendChild(textSpan);

        // Add icon at end if needed
        if (this.options.icon && !this.options.loading && this.options.iconPosition === 'end') {
            const icon = this.createIcon();
            content.appendChild(icon);
        }

        return content;
    }

    createIcon() {
        const icon = document.createElement('span');
        icon.className = 'btn-icon';
        icon.innerHTML = this.options.icon;
        return icon;
    }

    createSpinner() {
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        spinner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-dashoffset="60" opacity="0.75"><animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/></circle></svg>';
        return spinner;
    }
}

// Hebrew-specific button presets
class HebrewButtons {
    static save() {
        return new Button({ type: 'primary', icon: '💾' }).render('שמור');
    }

    static cancel() {
        return new Button({ type: 'secondary' }).render('ביטול');
    }

    static delete() {
        return new Button({ type: 'error', icon: '🗑️' }).render('מחק');
    }

    static edit() {
        return new Button({ type: 'secondary', icon: '✏️' }).render('עריכה');
    }

    static add() {
        return new Button({ type: 'success', icon: '+' }).render('הוסף');
    }

    static export() {
        return new Button({ type: 'secondary', icon: '📤' }).render('יצא נתונים');
    }

    static import() {
        return new Button({ type: 'secondary', icon: '📥' }).render('יבא נתונים');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Button, HebrewButtons };
} else {
    window.Button = Button;
    window.HebrewButtons = HebrewButtons;
}