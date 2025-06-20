// Navigation Component - Hebrew-native with RTL support
class Navigation {
    constructor(options = {}) {
        this.options = {
            brand: 'לוח מעקב פיננסי',
            brandIcon: '₪',
            items: [
                { text: 'לוח בקרה', href: '#dashboard', icon: '📊', active: true },
                { text: 'עסקאות', href: '#transactions', icon: '💳' },
                { text: 'תקציב', href: '#budget', icon: '📋' },
                { text: 'דוחות', href: '#reports', icon: '📈' },
                { text: 'הגדרות', href: '#settings', icon: '⚙️' }
            ],
            actions: [
                { text: 'הוסף עסקה', type: 'primary', icon: '+' },
                { text: 'יצא נתונים', type: 'secondary', icon: '📤' }
            ],
            onItemClick: null,
            onActionClick: null,
            ...options
        };
        this.mobileMenuOpen = false;
    }

    render() {
        const nav = document.createElement('nav');
        nav.className = 'nav-container';

        const container = document.createElement('div');
        container.className = 'container nav-content';

        // Brand section
        const brand = this.createBrand();
        container.appendChild(brand);

        // Desktop menu
        const menu = this.createMenu();
        container.appendChild(menu);

        // Actions section
        const actions = this.createActions();
        container.appendChild(actions);

        // Mobile toggle button
        const mobileToggle = this.createMobileToggle();
        container.appendChild(mobileToggle);

        nav.appendChild(container);

        // Mobile menu
        const mobileMenu = this.createMobileMenu();
        nav.appendChild(mobileMenu);

        return nav;
    }

    createBrand() {
        const brand = document.createElement('div');
        brand.className = 'nav-brand';

        if (this.options.brandIcon) {
            const icon = document.createElement('span');
            icon.textContent = this.options.brandIcon;
            brand.appendChild(icon);
        }

        const text = document.createElement('span');
        text.textContent = this.options.brand;
        brand.appendChild(text);

        return brand;
    }

    createMenu() {
        const menu = document.createElement('ul');
        menu.className = 'nav-menu';

        this.options.items.forEach(item => {
            const menuItem = this.createMenuItem(item);
            menu.appendChild(menuItem);
        });

        return menu;
    }

    createMenuItem(item) {
        const li = document.createElement('li');
        li.className = 'nav-menu-item';

        const link = document.createElement('a');
        link.className = 'nav-menu-link';
        link.href = item.href;
        
        if (item.active) {
            link.classList.add('active');
        }

        // Add click handler
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleItemClick(item, link);
        });

        // Add icon if provided
        if (item.icon) {
            const icon = document.createElement('span');
            icon.textContent = item.icon;
            link.appendChild(icon);
        }

        // Add text
        const text = document.createElement('span');
        text.textContent = item.text;
        link.appendChild(text);

        li.appendChild(link);
        return li;
    }

    createActions() {
        const actions = document.createElement('div');
        actions.className = 'nav-actions';

        this.options.actions.forEach(action => {
            const button = this.createActionButton(action);
            actions.appendChild(button);
        });

        return actions;
    }

    createActionButton(action) {
        const button = document.createElement('button');
        button.className = `btn btn-${action.type || 'primary'}`;
        
        // Add click handler
        button.addEventListener('click', () => {
            this.handleActionClick(action);
        });

        // Create button content
        const content = document.createElement('span');
        content.className = 'btn-content';

        // Add icon if provided
        if (action.icon) {
            const icon = document.createElement('span');
            icon.textContent = action.icon;
            content.appendChild(icon);
        }

        // Add text
        const text = document.createElement('span');
        text.textContent = action.text;
        content.appendChild(text);

        button.appendChild(content);
        return button;
    }

    createMobileToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'nav-mobile-toggle';
        toggle.innerHTML = '☰';
        
        toggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        return toggle;
    }

    createMobileMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'nav-mobile-menu';

        const container = document.createElement('div');
        container.className = 'container';

        // Mobile menu items
        const menu = document.createElement('ul');
        menu.className = 'nav-menu';

        this.options.items.forEach(item => {
            const menuItem = this.createMenuItem(item);
            menu.appendChild(menuItem);
        });

        container.appendChild(menu);

        // Mobile actions
        const actions = document.createElement('div');
        actions.className = 'nav-actions';
        actions.style.flexDirection = 'column';
        actions.style.gap = 'var(--spacing-sm)';

        this.options.actions.forEach(action => {
            const button = this.createActionButton(action);
            button.style.width = '100%';
            actions.appendChild(button);
        });

        container.appendChild(actions);
        mobileMenu.appendChild(container);

        return mobileMenu;
    }

    handleItemClick(item, linkElement) {
        // Update active state
        document.querySelectorAll('.nav-menu-link').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');

        // Close mobile menu if open
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }

        // Call custom handler if provided
        if (this.options.onItemClick) {
            this.options.onItemClick(item);
        }

        // Default navigation behavior
        console.log(`Navigating to: ${item.text} (${item.href})`);
    }

    handleActionClick(action) {
        // Close mobile menu if open
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }

        // Call custom handler if provided
        if (this.options.onActionClick) {
            this.options.onActionClick(action);
        }

        // Default action behavior
        console.log(`Action clicked: ${action.text}`);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const mobileMenu = document.querySelector('.nav-mobile-menu');
        
        if (this.mobileMenuOpen) {
            mobileMenu.classList.add('active');
        } else {
            mobileMenu.classList.remove('active');
        }
    }

    setActiveItem(href) {
        document.querySelectorAll('.nav-menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }

    updateBadge(itemHref, count) {
        const links = document.querySelectorAll(`.nav-menu-link[href="${itemHref}"]`);
        links.forEach(link => {
            // Remove existing badge
            const existingBadge = link.querySelector('.nav-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Add new badge if count > 0
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'nav-badge';
                badge.textContent = count > 99 ? '99+' : count.toString();
                link.appendChild(badge);
            }
        });
    }
}

// Hebrew navigation presets
class HebrewNavigation {
    static main() {
        return new Navigation({
            brand: 'מעקב פיננסי',
            brandIcon: '₪',
            items: [
                { text: 'לוח בקרה', href: '#dashboard', icon: '📊', active: true },
                { text: 'עסקאות', href: '#transactions', icon: '💳' },
                { text: 'תקציב', href: '#budget', icon: '📋' },
                { text: 'דוחות', href: '#reports', icon: '📈' },
                { text: 'הגדרות', href: '#settings', icon: '⚙️' }
            ],
            actions: [
                { text: 'הוסף עסקה', type: 'primary', icon: '+' },
                { text: 'תפריט', type: 'secondary', icon: '⋮' }
            ]
        });
    }

    static business() {
        return new Navigation({
            brand: 'ניהול עסקי',
            brandIcon: '🏢',
            items: [
                { text: 'לוח בקרה', href: '#dashboard', icon: '📊', active: true },
                { text: 'עסקאות', href: '#transactions', icon: '💳' },
                { text: 'הכנסות', href: '#income', icon: '📈' },
                { text: 'הוצאות', href: '#expenses', icon: '📉' },
                { text: 'מע"מ', href: '#vat', icon: '🧾' },
                { text: 'דוחות', href: '#reports', icon: '📊' }
            ],
            actions: [
                { text: 'הוסף עסקה', type: 'primary', icon: '+' },
                { text: 'יצא דוח', type: 'secondary', icon: '📤' }
            ]
        });
    }

    static simple() {
        return new Navigation({
            brand: 'מעקב הוצאות',
            brandIcon: '💰',
            items: [
                { text: 'הוצאות', href: '#expenses', icon: '💸', active: true },
                { text: 'הכנסות', href: '#income', icon: '💰' },
                { text: 'דוחות', href: '#reports', icon: '📊' }
            ],
            actions: [
                { text: 'הוסף', type: 'primary', icon: '+' }
            ]
        });
    }
}

// Add badge styles to CSS
const badgeStyles = `
.nav-badge {
    background: var(--error-color);
    color: white;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    padding: 2px 6px;
    border-radius: 10px;
    position: absolute;
    top: -5px;
    left: -5px;
    min-width: 18px;
    text-align: center;
    z-index: 1;
}

.nav-menu-item {
    position: relative;
}
`;

// Inject badge styles
if (!document.getElementById('nav-badge-styles')) {
    const style = document.createElement('style');
    style.id = 'nav-badge-styles';
    style.textContent = badgeStyles;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, HebrewNavigation };
} else {
    window.Navigation = Navigation;
    window.HebrewNavigation = HebrewNavigation;
}