// Personal Finance Dashboard - Israeli Edition
// Main application entry point

console.log('🏦 Israeli Finance Dashboard - Starting up...');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
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
}

function setupEventListeners() {
    // Start app button
    window.startApp = function() {
        console.log('🚀 Starting main application...');
        // This will be expanded in future phases
        alert('ברוכים הבאים! המערכת תהיה זמינה בקרוב.');
    };
    
    // Navigation clicks
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            console.log(`Navigating to: ${section}`);
            // Navigation logic will be implemented in future phases
        });
    });
}

function initializeHebrewFormatting() {
    // Hebrew/Israeli number formatting utilities
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
    
    console.log('🔤 Hebrew formatting initialized');
    
    // Test formatting
    console.log('Currency test:', window.formatCurrency(1234.56));
    console.log('Number test:', window.formatNumber(1234567));
    console.log('Date test:', window.formatDate(new Date()));
}

function checkStoredData() {
    // Check if user has existing data in localStorage
    const userData = localStorage.getItem('israeli-finance-data');
    if (userData) {
        console.log('📊 Found existing user data');
        // Data loading logic will be implemented in future phases
    } else {
        console.log('🆕 New user - no stored data found');
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