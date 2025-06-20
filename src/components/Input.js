// Input Component - Hebrew-native with RTL support
class Input {
    constructor(options = {}) {
        this.options = {
            type: 'text', // text, number, email, tel, password, currency
            placeholder: '',
            label: '',
            value: '',
            required: false,
            disabled: false,
            error: '',
            helpText: '',
            icon: null,
            iconPosition: 'start', // start, end
            size: 'medium', // small, medium, large
            dir: 'rtl', // rtl, ltr (for numbers/English text)
            ...options
        };
        this.id = `input-${Math.random().toString(36).substr(2, 9)}`;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = this.getWrapperClasses();

        // Add label if provided
        if (this.options.label) {
            const label = this.createLabel();
            wrapper.appendChild(label);
        }

        // Create input container
        const inputContainer = this.createInputContainer();
        wrapper.appendChild(inputContainer);

        // Add help text if provided
        if (this.options.helpText && !this.options.error) {
            const helpText = this.createHelpText();
            wrapper.appendChild(helpText);
        }

        // Add error message if provided
        if (this.options.error) {
            const errorText = this.createErrorText();
            wrapper.appendChild(errorText);
        }

        return wrapper;
    }

    getWrapperClasses() {
        const classes = ['form-group'];
        if (this.options.error) classes.push('form-group-error');
        if (this.options.disabled) classes.push('form-group-disabled');
        return classes.join(' ');
    }

    createLabel() {
        const label = document.createElement('label');
        label.className = 'form-label';
        label.htmlFor = this.id;
        label.textContent = this.options.label;
        
        if (this.options.required) {
            const required = document.createElement('span');
            required.className = 'form-required';
            required.textContent = ' *';
            label.appendChild(required);
        }
        
        return label;
    }

    createInputContainer() {
        const container = document.createElement('div');
        container.className = 'form-input-container';

        // Add start icon
        if (this.options.icon && this.options.iconPosition === 'start') {
            const icon = this.createIcon();
            container.appendChild(icon);
        }

        // Create input
        const input = this.createInput();
        container.appendChild(input);

        // Add end icon
        if (this.options.icon && this.options.iconPosition === 'end') {
            const icon = this.createIcon();
            container.appendChild(icon);
        }

        // Add currency symbol for currency inputs
        if (this.options.type === 'currency') {
            const symbol = this.createCurrencySymbol();
            container.appendChild(symbol);
        }

        return container;
    }

    createInput() {
        const input = document.createElement('input');
        input.id = this.id;
        input.className = this.getInputClasses();
        input.type = this.getInputType();
        input.placeholder = this.options.placeholder;
        input.value = this.options.value;
        input.disabled = this.options.disabled;
        input.required = this.options.required;
        input.dir = this.options.dir;

        // Add Hebrew-specific attributes
        if (this.options.dir === 'rtl') {
            input.style.textAlign = 'right';
        }

        // Add currency formatting for currency inputs
        if (this.options.type === 'currency') {
            input.addEventListener('input', this.handleCurrencyInput.bind(this));
            input.addEventListener('blur', this.handleCurrencyBlur.bind(this));
        }

        // Add phone number formatting for Israeli phone numbers
        if (this.options.type === 'tel') {
            input.addEventListener('input', this.handlePhoneInput.bind(this));
        }

        return input;
    }

    getInputClasses() {
        const classes = ['form-input'];
        
        // Size classes
        if (this.options.size !== 'medium') {
            classes.push(`form-input-${this.options.size}`);
        }
        
        // State classes
        if (this.options.error) classes.push('form-input-error');
        if (this.options.icon) classes.push(`form-input-with-icon-${this.options.iconPosition}`);
        if (this.options.type === 'currency') classes.push('form-input-currency');
        
        return classes.join(' ');
    }

    getInputType() {
        // Map our custom types to HTML input types
        const typeMap = {
            'currency': 'text',
            'tel': 'tel',
            'text': 'text',
            'number': 'number',
            'email': 'email',
            'password': 'password'
        };
        return typeMap[this.options.type] || 'text';
    }

    createIcon() {
        const icon = document.createElement('span');
        icon.className = 'form-input-icon';
        icon.innerHTML = this.options.icon;
        return icon;
    }

    createCurrencySymbol() {
        const symbol = document.createElement('span');
        symbol.className = 'form-input-currency-symbol';
        symbol.textContent = '₪';
        return symbol;
    }

    createHelpText() {
        const helpText = document.createElement('div');
        helpText.className = 'form-help-text';
        helpText.textContent = this.options.helpText;
        return helpText;
    }

    createErrorText() {
        const errorText = document.createElement('div');
        errorText.className = 'form-error-text';
        errorText.textContent = this.options.error;
        return errorText;
    }

    handleCurrencyInput(event) {
        let value = event.target.value.replace(/[^\d.-]/g, '');
        
        // Format as currency (add commas)
        if (value) {
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            value = parts.join('.');
        }
        
        event.target.value = value;
    }

    handleCurrencyBlur(event) {
        let value = event.target.value.replace(/[^\d.-]/g, '');
        if (value && !isNaN(value)) {
            // Format to 2 decimal places
            value = parseFloat(value).toFixed(2);
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            event.target.value = parts.join('.');
        }
    }

    handlePhoneInput(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        // Format Israeli phone number (050-123-4567)
        if (value.length >= 3) {
            if (value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        
        event.target.value = value;
    }

    // Get the actual value (without formatting)
    getValue() {
        const input = document.getElementById(this.id);
        if (!input) return '';
        
        if (this.options.type === 'currency') {
            return input.value.replace(/[^\d.-]/g, '');
        }
        
        if (this.options.type === 'tel') {
            return input.value.replace(/\D/g, '');
        }
        
        return input.value;
    }
}

// Hebrew-specific input presets
class HebrewInputs {
    static amount() {
        return new Input({
            type: 'currency',
            label: 'סכום',
            placeholder: '0.00',
            icon: '₪',
            iconPosition: 'end',
            dir: 'ltr'
        });
    }

    static description() {
        return new Input({
            type: 'text',
            label: 'תיאור',
            placeholder: 'הכנס תיאור...',
            dir: 'rtl'
        });
    }

    static israeliPhone() {
        return new Input({
            type: 'tel',
            label: 'מספר טלפון',
            placeholder: '050-123-4567',
            dir: 'ltr'
        });
    }

    static email() {
        return new Input({
            type: 'email',
            label: 'כתובת אימייל',
            placeholder: 'example@email.com',
            dir: 'ltr'
        });
    }

    static bankAccount() {
        return new Input({
            type: 'text',
            label: 'מספר חשבון בנק',
            placeholder: '123-456789',
            dir: 'ltr',
            icon: '🏦',
            iconPosition: 'start'
        });
    }

    static category() {
        return new Input({
            type: 'text',
            label: 'קטגוריה',
            placeholder: 'בחר קטגוריה...',
            dir: 'rtl'
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Input, HebrewInputs };
} else {
    window.Input = Input;
    window.HebrewInputs = HebrewInputs;
}