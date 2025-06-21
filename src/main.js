// Personal Finance Dashboard - Israeli Edition
// Main application entry point

console.log('🏦 Israeli Finance Dashboard - Starting up...');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Load component library
    await loadComponentLibrary();
    
    // Hide loading screen and show app
    setTimeout(() => {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading) loading.style.display = 'none';
        if (app) app.style.display = 'block';
        
        console.log('✅ App initialized successfully');
    }, 1000);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize Hebrew number formatting
    initializeHebrewFormatting();
    
    // Check for saved data
    checkStoredData();
    
    // Initialize UI components
    initializeUIComponents();
    
    // Initialize theme system
    initializeThemeSystem();
}

async function loadComponentLibrary() {
    const componentFiles = [
        './src/utils/israeli-formatting.js',
        './src/utils/israeli-salary-calculator.js',
        './src/utils/hebrew-financial-terms.js',
        './src/utils/israeli-financial-tips.js',
        './src/components/Button.js',
        './src/components/Input.js', 
        './src/components/Navigation.js',
        './src/components/Modal.js',
        './src/components/Toast.js',
        './src/components/ThemeToggle.js',
        './src/components/TransactionForm.js',
        './src/components/CategoryManager.js',
        './src/components/Dashboard.js',
        './src/components/TransactionList.js',
        './src/components/Charts.js',
        './src/components/index.js',
        './src/data/index.js'
    ];

    try {
        for (const file of componentFiles) {
            await loadScript(file);
        }
        console.log('📦 Hebrew UI Components loaded successfully');
        console.log('💾 Data Management System loaded successfully');
    } catch (error) {
        console.error('❌ Error loading components:', error);
        HebrewToasts?.error('שגיאה בטעינת רכיבי ממשק המשתמש');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function setupEventListeners() {
    // Start app button
    window.startApp = function() {
        console.log('🚀 Starting main application...');
        
        // Show demo of our component library
        if (window.ComponentUtils) {
            showComponentDemo();
        } else {
            // Fallback for when components aren't loaded yet
            HebrewToasts?.info('מערכת הרכיבים עדיין נטענת...') || 
            alert('ברוכים הבאים! המערכת תהיה זמינה בקרוב.');
        }
    };
    
    // Navigation clicks
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            console.log(`Navigating to: ${section}`);
            
            // Show appropriate section
            if (window.HebrewToasts) {
                HebrewToasts.info(`ניווט אל: ${getSectionName(section)}`);
            }
        });
    });
}

function getSectionName(section) {
    const sectionNames = {
        'dashboard': 'לוח בקרה',
        'transactions': 'עסקאות', 
        'budget': 'תקציב',
        'reports': 'דוחות',
        'settings': 'הגדרות'
    };
    return sectionNames[section] || section;
}

function showComponentDemo() {
    // Create and show component demo
    const demo = ComponentUtils.createDemo();
    
    // Replace main content with demo
    const mainContent = document.querySelector('.main');
    if (mainContent) {
        // Store original content
        const originalContent = mainContent.innerHTML;
        
        // Add back button
        const backButton = new Button({ type: 'secondary', icon: '←' })
            .render('חזור לדף הבית', () => {
                mainContent.innerHTML = originalContent;
                // Re-attach event listeners
                setupEventListeners();
                HebrewToasts.info('חזרת לדף הבית');
            });
        
        demo.insertBefore(backButton, demo.firstChild);
        
        // Replace content
        mainContent.innerHTML = '';
        mainContent.appendChild(demo);
        
        // Show success message
        HebrewToasts.success('ברוכים הבאים למערכת הרכיבים החדשה!', 'מערכת רכיבים');
    }
}

function initializeUIComponents() {
    // Initialize global UI components after everything is loaded
    if (typeof HebrewNavigation !== 'undefined') {
        console.log('🎨 UI Components ready');
        
        // Add component demo button to header if in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addDemoButton();
        }
        
        // Initialize tooltips, keyboard shortcuts, etc.
        initializeKeyboardShortcuts();
        
        // Show welcome toast
        setTimeout(() => {
            if (window.HebrewToasts) {
                HebrewToasts.info('מערכת הרכיבים הישראלית מוכנה לשימוש!', 'מוכן');
            }
        }, 2000);
    }
}

function addDemoButton() {
    // Add a demo button to the header for development
    const headerActions = document.querySelector('.header-content');
    if (headerActions && window.Button) {
        const demoBtn = new Button({ 
            type: 'ghost', 
            size: 'small', 
            icon: '🎨' 
        }).render('רכיבים', showComponentDemo);
        
        demoBtn.style.marginLeft = 'var(--spacing-md)';
        headerActions.appendChild(demoBtn);
    }
}

function initializeKeyboardShortcuts() {
    // Add useful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for quick actions
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (window.HebrewModals) {
                HebrewModals.addTransaction().open();
            }
        }
        
        // Escape to close any open modals/toasts
        if (e.key === 'Escape') {
            if (window.HebrewToasts) {
                HebrewToasts.clearAll();
            }
        }
        
        // Alt + N for new transaction
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            if (window.HebrewToasts) {
                HebrewToasts.info('קיצור מקלדת: Alt+N להוספת עסקה חדשה');
            }
        }
    });
}

function initializeHebrewFormatting() {
    // Enhanced Hebrew/Israeli formatting utilities are loaded via israeli-formatting.js
    console.log('🔤 Enhanced Hebrew formatting initialized');
    
    // Test enhanced formatting
    if (window.israeliFormatter) {
        console.log('✅ Israeli Formatter loaded successfully');
        
        // Test currency formatting
        console.log('Currency test (basic):', formatCurrency(1234.56));
        console.log('Currency test (compact):', formatCurrency(1500000, { compact: true }));
        console.log('Currency test (no symbol):', formatCurrency(999.99, { showSymbol: false }));
        
        // Test number formatting
        console.log('Number test (basic):', formatNumber(1234567));
        console.log('Number test (compact):', formatNumber(2500000, { compact: true }));
        
        // Test date formatting
        console.log('Date test (medium):', formatDate(new Date()));
        console.log('Date test (long):', formatDate(new Date(), { style: 'long' }));
        
        // Test Israeli-specific formatting
        console.log('Tax year test:', formatTaxYear());
        console.log('Phone test:', formatPhoneNumber('0523456789'));
        console.log('ID test:', formatIsraeliId('123456789'));
        console.log('Percentage test:', formatPercentage(15.5));
        
        // Display current tax year info
        const taxYear = getTaxYearPeriod();
        console.log('📅 Current tax year:', taxYear.label);
        console.log('📅 Tax year period:', formatDate(taxYear.start) + ' - ' + formatDate(taxYear.end));
        
        // Test salary calculator
        if (window.salaryCalculator) {
            console.log('💰 Testing Israeli Salary Calculator...');
            const testSalary = calculateMonthlySalary(15000, { children: 2 });
            console.log('💼 Salary test (₪15,000 gross, 2 children):');
            console.log('  📊 Net salary:', formatCurrency(testSalary.net));
            console.log('  🏛️ Total taxes:', formatCurrency(testSalary.totalTaxes));
            console.log('  📈 Effective rate:', testSalary.effectiveTaxRate.toFixed(1) + '%');
        }
        
        // Test Hebrew financial terms
        if (window.hebrewTerms) {
            console.log('🔤 Testing Hebrew Financial Terms...');
            console.log('💰 Income:', getTerm('income'));
            console.log('💸 Expense:', getTerm('expense'));
            console.log('🏦 Bank:', getTerm('bank'));
            console.log('📊 Budget:', getTerm('budget'));
            console.log('✅ Success phrase:', getSuccess('saved'));
        }
        
        // Test Israeli financial tips
        if (window.financialTips) {
            console.log('💡 Testing Israeli Financial Tips...');
            const tipOfDay = getTipOfTheDay();
            console.log('📅 Tip of the day:', tipOfDay.title);
            console.log('🎯 High priority tips:', getHighPriorityTips().length, 'available');
            const taxTips = getTipsByCategory('taxes');
            console.log('🏛️ Tax tips:', taxTips.length, 'available');
        }
    } else {
        console.warn('⚠️ Israeli Formatter not loaded - using basic formatting');
        
        // Fallback basic formatting
        window.formatCurrency = function(amount) {
            return new Intl.NumberFormat('he-IL', {
                style: 'currency',
                currency: 'ILS',
                currencyDisplay: 'symbol'
            }).format(amount);
        };
        
        window.formatNumber = function(number) {
            return new Intl.NumberFormat('he-IL').format(number);
        };
        
        window.formatDate = function(date) {
            return new Intl.DateTimeFormat('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        };
        
        // Basic tests
        console.log('Currency test:', formatCurrency(1234.56));
        console.log('Number test:', formatNumber(1234567));
        console.log('Date test:', formatDate(new Date()));
    }
}

async function checkStoredData() {
    // Check data system status using DataAPI
    if (window.DataAPI) {
        try {
            const status = DataAPI.system.getStatus();
            const stats = DataAPI.system.getStats();
            
            console.log('📊 Data System Status:', status);
            console.log('📈 Data Stats:', stats);
            
            if (stats.transactions > 0 || stats.categories > 0) {
                console.log(`💰 Found ${stats.transactions} transactions, ${stats.categories} categories`);
                
                // Show welcome back message
                setTimeout(() => {
                    if (window.HebrewToasts) {
                        HebrewToasts.info(
                            `ברוך שובך! יש לך ${stats.transactions} עסקאות ו-${stats.categories} קטגוריות`,
                            'נתונים קיימים'
                        );
                    }
                }, 3000);
            } else {
                console.log('🆕 New user - initializing default data');
                
                // Show welcome message for new users
                setTimeout(() => {
                    if (window.HebrewToasts) {
                        HebrewToasts.success(
                            'ברוכים הבאים! המערכת מוכנה לשימוש עם קטגוריות ישראליות',
                            'משתמש חדש'
                        );
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Error checking data:', error);
        }
    } else {
        console.log('⏳ DataAPI not loaded yet - will check data later');
    }
}

function initializeThemeSystem() {
    // Initialize theme system with Hebrew support
    if (typeof ThemeToggle !== 'undefined') {
        console.log('🎨 Initializing theme system...');
        
        // Create theme toggle instance
        const themeToggle = new ThemeToggle({
            showLabel: true,
            position: 'top-right'
        });
        
        // Add to navigation or header
        const headerActions = document.querySelector('.header-content');
        if (headerActions) {
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'theme-toggle-container';
            toggleContainer.style.marginLeft = 'var(--spacing-md)';
            
            // Create toggle button HTML
            toggleContainer.innerHTML = themeToggle.getHTML();
            headerActions.appendChild(toggleContainer);
            
            // Set up click handler
            const toggleButton = toggleContainer.querySelector('.theme-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    themeToggle.toggleTheme();
                });
            }
        } else {
            // Fallback: add as fixed position toggle
            document.body.appendChild(themeToggle.render());
            themeToggle.toggleButton.classList.add('theme-toggle-fixed', 'theme-toggle-top-right');
        }
        
        // Listen for theme changes
        document.addEventListener('themeChanged', (e) => {
            console.log('🌓 Theme changed to:', e.detail.theme);
            
            // Show theme change notification
            if (window.HebrewToasts) {
                const message = e.detail.theme === 'dark' ? 'עברת למצב לילה' : 'עברת למצב יום';
                HebrewToasts.info(message, 'שינוי נושא');
            }
        });
        
        // Apply saved theme on startup
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        console.log('✅ Theme system initialized');
    } else {
        console.warn('⚠️ ThemeToggle component not loaded');
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Error reporting will be implemented in future phases
});

// Service worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Use relative path for service worker to work with GitHub Pages subdirectory
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

console.log('🏁 Main.js loaded successfully');