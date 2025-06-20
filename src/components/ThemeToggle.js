// Theme Toggle Component for Personal Finance Dashboard
// Hebrew-native theme switcher with light/dark mode support

export class ThemeToggle {
    constructor(options = {}) {
        this.options = {
            container: document.body,
            position: 'top-left', // top-left, top-right, bottom-left, bottom-right
            showLabel: true,
            ...options
        };
        
        this.currentTheme = this.getCurrentTheme();
        this.toggleButton = null;
        
        this.init();
    }

    init() {
        this.createToggleButton();
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    getCurrentTheme() {
        // Check localStorage first, then system preference, default to light
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'מעבר בין מצב יום ולילה');
        button.title = 'מעבר בין מצב יום ולילה';
        
        // Create icon container
        const iconContainer = document.createElement('span');
        iconContainer.className = 'theme-toggle-icon';
        
        // Create label if needed
        let labelContainer = null;
        if (this.options.showLabel) {
            labelContainer = document.createElement('span');
            labelContainer.className = 'theme-toggle-label';
            labelContainer.textContent = this.currentTheme === 'dark' ? 'מצב יום' : 'מצב לילה';
        }
        
        button.appendChild(iconContainer);
        if (labelContainer) {
            button.appendChild(labelContainer);
        }
        
        this.updateButtonIcon(button, this.currentTheme);
        
        this.toggleButton = button;
        return button;
    }

    updateButtonIcon(button, theme) {
        const iconContainer = button.querySelector('.theme-toggle-icon');
        const labelContainer = button.querySelector('.theme-toggle-label');
        
        if (theme === 'dark') {
            // Sun icon for switching to light mode
            iconContainer.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
            `;
            if (labelContainer) labelContainer.textContent = 'מצב יום';
        } else {
            // Moon icon for switching to dark mode
            iconContainer.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            `;
            if (labelContainer) labelContainer.textContent = 'מצב לילה';
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        if (this.toggleButton) {
            this.updateButtonIcon(this.toggleButton, theme);
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a theme
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Method to insert toggle button into DOM
    render(container = null) {
        const targetContainer = container || this.options.container;
        if (targetContainer && this.toggleButton) {
            targetContainer.appendChild(this.toggleButton);
        }
        return this.toggleButton;
    }

    // Method to get HTML string for the toggle button
    getHTML() {
        const theme = this.currentTheme;
        const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`;
        
        const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
        
        const icon = theme === 'dark' ? sunIcon : moonIcon;
        const label = this.options.showLabel ? 
            `<span class="theme-toggle-label">${theme === 'dark' ? 'מצב יום' : 'מצב לילה'}</span>` : '';
        
        return `
            <button class="theme-toggle" aria-label="מעבר בין מצב יום ולילה" title="מעבר בין מצב יום ולילה">
                <span class="theme-toggle-icon">${icon}</span>
                ${label}
            </button>
        `;
    }

    // Static method to create a simple toggle
    static createSimpleToggle() {
        return new ThemeToggle({
            showLabel: false,
            position: 'top-right'
        });
    }

    // Static method to create a labeled toggle
    static createLabeledToggle() {
        return new ThemeToggle({
            showLabel: true,
            position: 'top-left'
        });
    }
}

// Export as default for easy importing
export default ThemeToggle;