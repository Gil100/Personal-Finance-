// Component Index - Load all components
// Main component library for Israeli Finance Dashboard

// Import component modules (for module environments)
if (typeof module !== 'undefined' && module.exports) {
    const { Button, HebrewButtons } = require('./Button');
    const { Input, HebrewInputs } = require('./Input');
    const { Navigation, HebrewNavigation } = require('./Navigation');
    const { Modal, HebrewModals } = require('./Modal');
    const { Toast, HebrewToasts } = require('./Toast');
    const { ThemeToggle } = require('./ThemeToggle');
    
    module.exports = {
        Button, HebrewButtons,
        Input, HebrewInputs,
        Navigation, HebrewNavigation,
        Modal, HebrewModals,
        Toast, HebrewToasts,
        ThemeToggle
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
            { title: 'לוח בקרה (Dashboard)', content: ComponentUtils.createDashboardDemo() },
            { title: 'רשימת עסקאות (Transaction List)', content: ComponentUtils.createTransactionListDemo() },
            { title: 'תרשימים (Charts)', content: ComponentUtils.createChartsDemo() },
            { title: 'כפתורים (Buttons)', content: ComponentUtils.createButtonDemo() },
            { title: 'שדות קלט (Inputs)', content: ComponentUtils.createInputDemo() },
            { title: 'ניווט (Navigation)', content: ComponentUtils.createNavigationDemo() },
            { title: 'חלונות מודאלים (Modals)', content: ComponentUtils.createModalDemo() },
            { title: 'התראות (Toasts)', content: ComponentUtils.createToastDemo() },
            { title: 'נושא (Theme)', content: ComponentUtils.createThemeDemo() }
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

    static createThemeDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const themeDescription = document.createElement('p');
        themeDescription.textContent = 'מערכת הנושא מאפשרת מעבר בין מצב יום ולילה. השינויים נשמרים אוטומטית.';
        themeDescription.style.marginBottom = 'var(--spacing-lg)';
        themeDescription.style.color = 'var(--text-secondary)';
        container.appendChild(themeDescription);

        // Create theme toggle examples
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.flexWrap = 'wrap';
        toggleContainer.style.gap = 'var(--spacing-lg)';
        toggleContainer.style.alignItems = 'center';

        // Simple theme toggle (icon only)
        if (typeof ThemeToggle !== 'undefined') {
            const simpleToggle = new ThemeToggle({ showLabel: false });
            const simpleWrapper = document.createElement('div');
            simpleWrapper.innerHTML = `
                <h4 style="margin-bottom: var(--spacing-sm);">מעבר פשוט</h4>
                ${simpleToggle.getHTML()}
            `;
            const simpleButton = simpleWrapper.querySelector('.theme-toggle');
            if (simpleButton) {
                simpleButton.addEventListener('click', () => {
                    simpleToggle.toggleTheme();
                });
            }
            toggleContainer.appendChild(simpleWrapper);

            // Labeled theme toggle
            const labeledToggle = new ThemeToggle({ showLabel: true });
            const labeledWrapper = document.createElement('div');
            labeledWrapper.innerHTML = `
                <h4 style="margin-bottom: var(--spacing-sm);">מעבר עם תווית</h4>
                ${labeledToggle.getHTML()}
            `;
            const labeledButton = labeledWrapper.querySelector('.theme-toggle');
            if (labeledButton) {
                labeledButton.addEventListener('click', () => {
                    labeledToggle.toggleTheme();
                });
            }
            toggleContainer.appendChild(labeledWrapper);
        }

        // Theme information display
        const themeInfo = document.createElement('div');
        themeInfo.style.marginTop = 'var(--spacing-lg)';
        themeInfo.style.padding = 'var(--spacing-md)';
        themeInfo.style.backgroundColor = 'var(--bg-tertiary)';
        themeInfo.style.borderRadius = 'var(--radius-md)';
        themeInfo.style.border = '1px solid var(--border-color)';
        
        const updateThemeInfo = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            themeInfo.innerHTML = `
                <h4 style="margin-bottom: var(--spacing-sm);">מידע על הנושא הנוכחי</h4>
                <p><strong>נושא פעיל:</strong> ${currentTheme === 'dark' ? 'מצב לילה' : 'מצב יום'}</p>
                <p><strong>שמירה:</strong> ${localStorage.getItem('theme') ? 'נשמר באופן מקומי' : 'לא נשמר'}</p>
                <p><strong>העדפת מערכת:</strong> ${window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'מצב לילה' : 'מצב יום'}</p>
            `;
        };

        updateThemeInfo();
        
        // Listen for theme changes to update info
        document.addEventListener('themeChanged', updateThemeInfo);

        container.appendChild(toggleContainer);
        container.appendChild(themeInfo);
        return container;
    }

    // Helper to load components dynamically
    static async loadComponents() {
        const componentFiles = [
            'Button.js',
            'Input.js',
            'Navigation.js',
            'Modal.js',
            'Toast.js',
            'ThemeToggle.js'
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

    static createDashboardDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const description = document.createElement('p');
        description.textContent = 'לוח בקרה פיננסי מקיף עם סקירה כללית של המצב הפיננסי שלך';
        description.style.marginBottom = 'var(--spacing-lg)';
        description.style.color = 'var(--text-secondary)';
        container.appendChild(description);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        const dashboardButtons = [
            {
                text: 'הצג לוח בקרה',
                action: () => {
                    if (typeof window.showDashboard === 'function') {
                        window.showDashboard();
                    } else {
                        HebrewToasts?.info('לוח הבקרה יטען בקרוב...');
                    }
                }
            },
            {
                text: 'מסך מלא',
                action: () => {
                    if (typeof window.showDashboardFullscreen === 'function') {
                        window.showDashboardFullscreen();
                    } else {
                        HebrewToasts?.info('מסך מלא יטען בקרוב...');
                    }
                }
            },
            {
                text: 'דמו מוטבע',
                action: () => {
                    ComponentUtils.showEmbeddedDashboard(buttonContainer);
                }
            }
        ];

        dashboardButtons.forEach(({ text, action }) => {
            const button = new Button({ type: 'primary' }).render(text, action);
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    static showEmbeddedDashboard(parentContainer) {
        // Check if dashboard already exists
        const existingDashboard = parentContainer.parentNode.querySelector('.embedded-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
            return;
        }

        if (typeof Dashboard === 'undefined') {
            HebrewToasts?.error('רכיב לוח הבקרה לא נטען');
            return;
        }

        // Create dashboard container
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'embedded-dashboard';
        dashboardContainer.style.cssText = `
            margin-top: var(--spacing-lg);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-lg);
            background: var(--bg-secondary);
            overflow: hidden;
        `;

        // Create dashboard header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--spacing-md);
            background: var(--primary-gradient);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        header.innerHTML = `
            <h4 style="margin: 0;">דמו לוח בקרה מוטבע</h4>
            <button onclick="this.closest('.embedded-dashboard').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer;">
                ✕ סגור
            </button>
        `;

        // Create dashboard
        const dashboard = new Dashboard({
            showWelcome: false,
            refreshInterval: 0
        });

        const dashboardElement = dashboard.render();
        
        // Scale down for embedded view
        dashboardElement.style.transform = 'scale(0.8)';
        dashboardElement.style.transformOrigin = 'top center';
        dashboardElement.style.padding = 'var(--spacing-md)';

        dashboardContainer.appendChild(header);
        dashboardContainer.appendChild(dashboardElement);
        
        // Insert after the button container
        parentContainer.parentNode.insertBefore(dashboardContainer, parentContainer.nextSibling);
        
        HebrewToasts?.success('דמו לוח בקרה מוטבע נטען', 'ברוכים הבאים');
    }

    static createTransactionListDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const description = document.createElement('p');
        description.textContent = 'רשימת עסקאות מתקדמת עם חיפוש, מסננים וגלילה אינסופית';
        description.style.marginBottom = 'var(--spacing-lg)';
        description.style.color = 'var(--text-secondary)';
        container.appendChild(description);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        const transactionListButtons = [
            {
                text: 'רשימה מלאה',
                action: () => {
                    if (typeof window.showTransactionList === 'function') {
                        window.showTransactionList();
                    } else {
                        ComponentUtils.showEmbeddedTransactionList(buttonContainer, 'full');
                    }
                }
            },
            {
                text: 'רשימה קומפקטית',
                action: () => {
                    ComponentUtils.showEmbeddedTransactionList(buttonContainer, 'compact');
                }
            },
            {
                text: 'רק עם מסננים',
                action: () => {
                    ComponentUtils.showEmbeddedTransactionList(buttonContainer, 'filters-only');
                }
            }
        ];

        transactionListButtons.forEach(({ text, action }) => {
            const button = new Button({ type: 'primary' }).render(text, action);
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    static showEmbeddedTransactionList(parentContainer, mode = 'full') {
        // Check if transaction list already exists
        const existingList = parentContainer.parentNode.querySelector('.embedded-transaction-list');
        if (existingList) {
            existingList.remove();
            return;
        }

        if (typeof TransactionList === 'undefined') {
            HebrewToasts?.error('רכיב רשימת העסקאות לא נטען');
            return;
        }

        // Create transaction list container
        const listContainer = document.createElement('div');
        listContainer.className = 'embedded-transaction-list';
        listContainer.style.cssText = `
            margin-top: var(--spacing-lg);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-lg);
            background: var(--bg-secondary);
            overflow: hidden;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--spacing-md);
            background: var(--primary-gradient);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const modeTitle = {
            'full': 'רשימת עסקאות מלאה',
            'compact': 'רשימה קומפקטית',
            'filters-only': 'רשימה עם מסננים בלבד'
        };
        
        header.innerHTML = `
            <h4 style="margin: 0;">${modeTitle[mode] || 'רשימת עסקאות'}</h4>
            <button onclick="this.closest('.embedded-transaction-list').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer;">
                ✕ סגור
            </button>
        `;

        // Configure options based on mode
        const options = {
            full: {
                pageSize: 15,
                enableInfiniteScroll: true,
                enableSearch: true,
                enableFilters: true,
                enableSort: true,
                showBalance: true,
                showDateGroups: true
            },
            compact: {
                pageSize: 10,
                enableInfiniteScroll: false,
                enableSearch: false,
                enableFilters: false,
                enableSort: false,
                showBalance: false,
                showDateGroups: false
            },
            'filters-only': {
                pageSize: 8,
                enableInfiniteScroll: false,
                enableSearch: true,
                enableFilters: true,
                enableSort: true,
                showBalance: false,
                showDateGroups: false
            }
        };

        // Create transaction list
        const transactionList = new TransactionList(options[mode] || options.full);
        const listElement = transactionList.render();
        
        // Scale down for embedded view
        listElement.style.transform = 'scale(0.9)';
        listElement.style.transformOrigin = 'top center';
        listElement.style.maxHeight = '400px';
        listElement.style.overflow = 'hidden';

        listContainer.appendChild(header);
        listContainer.appendChild(listElement);
        
        // Insert after the button container
        parentContainer.parentNode.insertBefore(listContainer, parentContainer.nextSibling);
        
        HebrewToasts?.success(`רשימת עסקאות (${modeTitle[mode]}) נטענה`, 'ברוכים הבאים');
    }

    static createChartsDemo() {
        const container = document.createElement('div');
        container.className = 'demo-section';

        const description = document.createElement('p');
        description.textContent = 'תרשימים פיננסיים מתקדמים עם אנימציות והתאמה לעברית';
        description.style.marginBottom = 'var(--spacing-lg)';
        description.style.color = 'var(--text-secondary)';
        container.appendChild(description);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = 'var(--spacing-md)';

        const chartButtons = [
            {
                text: 'תרשים עוגה',
                action: () => {
                    ComponentUtils.showEmbeddedChart(buttonContainer, 'pie');
                }
            },
            {
                text: 'תרשים עמודות',
                action: () => {
                    ComponentUtils.showEmbeddedChart(buttonContainer, 'bar');
                }
            },
            {
                text: 'תרשים קווים',
                action: () => {
                    ComponentUtils.showEmbeddedChart(buttonContainer, 'line');
                }
            },
            {
                text: 'כל התרשימים',
                action: () => {
                    ComponentUtils.showEmbeddedChart(buttonContainer, 'all');
                }
            }
        ];

        chartButtons.forEach(({ text, action }) => {
            const button = new Button({ type: 'primary' }).render(text, action);
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
        return container;
    }

    static showEmbeddedChart(parentContainer, type = 'pie') {
        // Check if chart already exists
        const existingChart = parentContainer.parentNode.querySelector('.embedded-charts');
        if (existingChart) {
            existingChart.remove();
            return;
        }

        if (typeof Charts === 'undefined') {
            HebrewToasts?.error('רכיב התרשימים לא נטען');
            return;
        }

        // Create charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'embedded-charts';
        chartsContainer.style.cssText = `
            margin-top: var(--spacing-lg);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-lg);
            background: var(--bg-secondary);
            overflow: hidden;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--spacing-md);
            background: var(--primary-gradient);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const chartTitles = {
            'pie': 'תרשים עוגה - פילוח קטגוריות',
            'bar': 'תרשים עמודות - הוצאות חודשיות',
            'line': 'תרשים קווים - מגמות פיננסיות',
            'all': 'כל התרשימים הפיננסיים'
        };
        
        header.innerHTML = `
            <h4 style="margin: 0;">${chartTitles[type] || 'תרשימים פיננסיים'}</h4>
            <button onclick="this.closest('.embedded-charts').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer;">
                ✕ סגור
            </button>
        `;

        // Create charts content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: var(--spacing-md);
            max-height: 500px;
            overflow-y: auto;
        `;

        const charts = new Charts({ width: 350, height: 250 });

        if (type === 'all') {
            // Create all chart types
            const chartsGrid = document.createElement('div');
            chartsGrid.className = 'charts-grid';
            chartsGrid.style.cssText = `
                display: grid;
                grid-template-columns: 1fr;
                gap: var(--spacing-md);
            `;

            // Pie chart
            const pieChart = charts.createPieChart(Charts.getSampleCategoryData(), 'embedded-pie');
            chartsGrid.appendChild(pieChart);

            // Bar chart
            const barChart = charts.createBarChart(Charts.getSampleMonthlyData(), 'embedded-bar');
            chartsGrid.appendChild(barChart);

            // Line chart
            const lineChart = charts.createLineChart(Charts.getSampleTrendData(), 'embedded-line');
            chartsGrid.appendChild(lineChart);

            content.appendChild(chartsGrid);
        } else {
            // Create specific chart type
            let chart;
            switch (type) {
                case 'pie':
                    chart = charts.createPieChart(Charts.getSampleCategoryData(), `embedded-${type}`);
                    break;
                case 'bar':
                    chart = charts.createBarChart(Charts.getSampleMonthlyData(), `embedded-${type}`);
                    break;
                case 'line':
                    chart = charts.createLineChart(Charts.getSampleTrendData(), `embedded-${type}`);
                    break;
            }
            
            if (chart) {
                content.appendChild(chart);
            }
        }

        chartsContainer.appendChild(header);
        chartsContainer.appendChild(content);
        
        // Insert after the button container
        parentContainer.parentNode.insertBefore(chartsContainer, parentContainer.nextSibling);
        
        HebrewToasts?.success(`תרשים ${chartTitles[type]} נטען בהצלחה`, 'ברוכים הבאים');
    }
}

// Make ComponentUtils available globally
if (typeof window !== 'undefined') {
    window.ComponentUtils = ComponentUtils;
}

// Dashboard integration functions
window.showDashboard = function() {
    const main = document.querySelector('.main');
    if (!main) {
        console.error('Main container not found');
        HebrewToasts?.error('לא נמצא מיכל ראשי בעמוד');
        return;
    }
    
    if (typeof Dashboard === 'undefined') {
        console.error('Dashboard component not loaded');
        HebrewToasts?.error('רכיב לוח הבקרה לא נטען');
        return;
    }
    
    // Create dashboard instance
    const dashboard = new Dashboard({
        showWelcome: true,
        refreshInterval: 30000
    });
    
    // Render dashboard
    const dashboardElement = dashboard.render();
    
    // Replace main content
    main.innerHTML = '';
    main.appendChild(dashboardElement);
    
    // Show success message
    if (window.HebrewToasts) {
        HebrewToasts.success('לוח הבקרה נטען בהצלחה', 'ברוכים הבאים');
    }
    
    console.log('📊 Dashboard loaded and displayed');
    return dashboard;
};

window.showDashboardFullscreen = function() {
    if (typeof Dashboard === 'undefined') {
        console.error('Dashboard component not loaded');
        HebrewToasts?.error('רכיב לוח הבקרה לא נטען');
        return;
    }
    
    // Create fullscreen dashboard overlay
    const overlay = document.createElement('div');
    overlay.className = 'dashboard-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary);
        z-index: 9999;
        overflow-y: auto;
        animation: fadeIn 0.3s ease;
    `;
    
    // Add CSS for fade in animation
    if (!document.querySelector('#dashboard-animations')) {
        const style = document.createElement('style');
        style.id = 'dashboard-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create dashboard
    const dashboard = new Dashboard({
        showWelcome: true,
        refreshInterval: 0 // Don't auto-refresh in demo
    });
    
    const dashboardElement = dashboard.render();
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕ סגור';
    closeButton.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        background: var(--error-color);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        transition: all 0.2s ease;
    `;
    
    closeButton.onmouseover = () => {
        closeButton.style.transform = 'scale(1.05)';
        closeButton.style.boxShadow = 'var(--shadow-xl)';
    };
    
    closeButton.onmouseout = () => {
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'var(--shadow-lg)';
    };
    
    closeButton.onclick = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        if (!document.querySelector('#dashboard-fadeout')) {
            const style = document.createElement('style');
            style.id = 'dashboard-fadeout';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
        
        HebrewToasts?.info('לוח הבקרה נסגר');
    };
    
    overlay.appendChild(dashboardElement);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
    
    HebrewToasts?.success('לוח בקרה במסך מלא', 'ברוכים הבאים');
    
    console.log('📊 Dashboard fullscreen mode activated');
};

console.log('📊 Dashboard integration loaded');

// Transaction List integration functions  
window.showTransactionList = function() {
    const main = document.querySelector('.main');
    if (!main) {
        console.error('Main container not found');
        HebrewToasts?.error('לא נמצא מיכל ראשי בעמוד');
        return;
    }
    
    if (typeof TransactionList === 'undefined') {
        console.error('TransactionList component not loaded');
        HebrewToasts?.error('רכיב רשימת העסקאות לא נטען');
        return;
    }
    
    // Create transaction list instance
    const transactionList = new TransactionList({
        pageSize: 20,
        enableInfiniteScroll: true,
        enableSearch: true,
        enableFilters: true,
        enableSort: true,
        showBalance: true,
        showDateGroups: true
    });
    
    // Render transaction list
    const listElement = transactionList.render();
    
    // Replace main content
    main.innerHTML = '';
    main.appendChild(listElement);
    
    // Show success message
    if (window.HebrewToasts) {
        HebrewToasts.success('רשימת העסקאות נטענה בהצלחה', 'ברוכים הבאים');
    }
    
    console.log('📋 Transaction list loaded and displayed');
    return transactionList;
};

console.log('📋 TransactionList integration loaded');