// Component Index - Load all components
// Main component library for Israeli Finance Dashboard

// Import component modules (for module environments)
if (typeof module !== 'undefined' && module.exports) {
    const { Button, HebrewButtons } = require('./Button');
    const { Input, HebrewInputs } = require('./Input');
    const { Navigation, HebrewNavigation } = require('./Navigation');
    const { Modal, HebrewModals } = require('./Modal');
    const { Toast, HebrewToasts } = require('./Toast');
    
    module.exports = {
        Button, HebrewButtons,
        Input, HebrewInputs,
        Navigation, HebrewNavigation,
        Modal, HebrewModals,
        Toast, HebrewToasts
    };
} else {
    // Browser environment - components are already loaded globally
    console.log('📦 Hebrew UI Components loaded successfully');
}

// Component utilities and helpers
class ComponentUtils {
    // Create a demo page showcasing all components
    static createDemo() {
        const container = document.createElement('div');
        container.className = 'demo-container';
        container.style.padding = 'var(--spacing-xl)';
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';

        // Demo sections
        const sections = [
            { title: 'כפתורים (Buttons)', content: ComponentUtils.createButtonDemo() },
            { title: 'שדות קלט (Inputs)', content: ComponentUtils.createInputDemo() },
            { title: 'ניווט (Navigation)', content: ComponentUtils.createNavigationDemo() },
            { title: 'חלונות מודאלים (Modals)', content: ComponentUtils.createModalDemo() },
            { title: 'התראות (Toasts)', content: ComponentUtils.createToastDemo() }
        ];

        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = 'var(--spacing-2xl)';

            const title = document.createElement('h2');
            title.textContent = section.title;
            title.style.marginBottom = 'var(--spacing-lg)';
            title.style.borderBottom = '2px solid var(--primary-color)';
            title.style.paddingBottom = 'var(--spacing-sm)';

            sectionDiv.appendChild(title);
            sectionDiv.appendChild(section.content);
            container.appendChild(sectionDiv);
        });

        return container;
    }

    static createButtonDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const buttons = [
            { button: new Button({ type: 'primary' }), text: 'כפתור ראשי' },
            { button: new Button({ type: 'secondary' }), text: 'כפתור משני' },
            { button: new Button({ type: 'success' }), text: 'הצלחה' },
            { button: new Button({ type: 'warning' }), text: 'אזהרה' },
            { button: new Button({ type: 'error' }), text: 'שגיאה' },
            { button: new Button({ type: 'ghost' }), text: 'שקוף' },
            { button: new Button({ type: 'primary', loading: true }), text: 'טוען...' },
            { button: new Button({ type: 'primary', disabled: true }), text: 'לא זמין' }
        ];

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        buttons.forEach(({ button, text }) => {
            const btnElement = button.render(text, () => {
                HebrewToasts.info(`לחצת על: ${text}`);
            });
            buttonContainer.appendChild(btnElement);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    static createInputDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const inputs = [
            HebrewInputs.amount(),
            HebrewInputs.description(),
            HebrewInputs.israeliPhone(),
            HebrewInputs.email(),
            HebrewInputs.bankAccount(),
            HebrewInputs.category()
        ];

        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'grid';
        inputContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        inputContainer.style.gap = 'var(--spacing-lg)';

        inputs.forEach(input => {
            const inputElement = input.render();
            inputContainer.appendChild(inputElement);
        });

        container.appendChild(inputContainer);
        return container;
    }

    static createNavigationDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const nav1 = HebrewNavigation.main();
        const nav2 = HebrewNavigation.business();
        const nav3 = HebrewNavigation.simple();

        const navContainer = document.createElement('div');
        navContainer.style.display = 'flex';
        navContainer.style.flexDirection = 'column';
        navContainer.style.gap = 'var(--spacing-lg)';

        [nav1, nav2, nav3].forEach(nav => {
            const navElement = nav.render();
            navContainer.appendChild(navElement);
        });

        container.appendChild(navContainer);
        return container;
    }

    static createModalDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const modalButtons = [
            {
                text: 'מודאל אישור',
                action: () => {
                    HebrewModals.confirm(
                        'האם אתה בטוח שברצונך למחוק את העסקה?',
                        () => HebrewToasts.success('העסקה נמחקה'),
                        () => HebrewToasts.info('הפעולה בוטלה')
                    ).open();
                }
            },
            {
                text: 'מודאל התראה',
                action: () => {
                    HebrewModals.alert('זהו מודאל התראה פשוט').open();
                }
            },
            {
                text: 'מודאל שגיאה',
                action: () => {
                    HebrewModals.error('אירעה שגיאה בלתי צפויה').open();
                }
            },
            {
                text: 'הוסף עסקה',
                action: () => {
                    HebrewModals.addTransaction().open();
                }
            },
            {
                text: 'יצא נתונים',
                action: () => {
                    HebrewModals.exportData().open();
                }
            }
        ];

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        modalButtons.forEach(({ text, action }) => {
            const button = new Button({ type: 'primary' }).render(text, action);
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    static createToastDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const toastButtons = [
            {
                text: 'הצלחה',
                action: () => HebrewToasts.success('פעולה הושלמה בהצלחה!')
            },
            {
                text: 'שגיאה',
                action: () => HebrewToasts.error('אירעה שגיאה במערכת')
            },
            {
                text: 'אזהרה',
                action: () => HebrewToasts.warning('שים לב: התקציב מתקרב לסיום')
            },
            {
                text: 'מידע',
                action: () => HebrewToasts.info('עדכון חדש זמין במערכת')
            },
            {
                text: 'עסקה נשמרה',
                action: () => HebrewToasts.transactionSaved()
            },
            {
                text: 'חריגה מתקציב',
                action: () => HebrewToasts.budgetExceeded('מזון', '150')
            },
            {
                text: 'סנכרון בנק',
                action: () => HebrewToasts.bankSyncComplete('בנק הפועלים', 12)
            },
            {
                text: 'נקה הכל',
                action: () => HebrewToasts.clearAll()
            }
        ];

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        toastButtons.forEach(({ text, action }) => {
            const button = new Button({ type: 'secondary' }).render(text, action);
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    // Helper to load components dynamically
    static async loadComponents() {
        const componentFiles = [
            'Button.js',
            'Input.js',
            'Navigation.js',
            'Modal.js',
            'Toast.js'
        ];

        const loadPromises = componentFiles.map(file => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `./src/components/${file}`;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        });

        try {
            await Promise.all(loadPromises);
            console.log('✅ All Hebrew components loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading components:', error);
            return false;
        }
    }

    // Helper to validate Hebrew text input
    static isHebrewText(text) {
        const hebrewRegex = /[\u0590-\u05FF]/;
        return hebrewRegex.test(text);
    }

    // Helper to format Israeli currency
    static formatCurrency(amount, options = {}) {
        const { showSymbol = true, showSign = false } = options;
        
        let formatted = new Intl.NumberFormat('he-IL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));

        if (showSymbol) {
            formatted = `${formatted} ₪`;
        }

        if (showSign && amount < 0) {
            formatted = `-${formatted}`;
        }

        return formatted;
    }

    // Helper to format Israeli phone number
    static formatIsraeliPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        
        return phone;
    }

    // Helper to validate Israeli ID number
    static validateIsraeliId(id) {
        const cleaned = id.replace(/\D/g, '');
        
        if (cleaned.length !== 9) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            let digit = parseInt(cleaned[i]);
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        
        return sum % 10 === 0;
    }
}

// Make ComponentUtils available globally
if (typeof window !== 'undefined') {
    window.ComponentUtils = ComponentUtils;
}