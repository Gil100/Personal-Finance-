// TransactionList Component - Hebrew Interface
// Advanced transaction list with infinite scroll, filtering, and search

class TransactionList {
    constructor(options = {}) {
        this.options = {
            pageSize: 20,
            enableInfiniteScroll: true,
            enableSearch: true,
            enableFilters: true,
            enableSort: true,
            showBalance: true,
            showDateGroups: true,
            ...options
        };
        
        this.transactions = [];
        this.filteredTransactions = [];
        this.displayedTransactions = [];
        this.currentPage = 0;
        this.isLoading = false;
        this.hasMore = true;
        
        // Filters
        this.filters = {
            search: '',
            type: 'all', // 'all', 'income', 'expense'
            category: 'all',
            dateRange: 'all', // 'all', 'today', 'week', 'month', 'year', 'custom'
            amountRange: { min: null, max: null },
            customDateRange: { start: null, end: null }
        };
        
        // Sort options
        this.sortBy = 'date'; // 'date', 'amount', 'description', 'category'
        this.sortOrder = 'desc'; // 'asc', 'desc'
        
        // Elements
        this.element = null;
        this.listContainer = null;
        this.observer = null;
        
        // Load data
        this.loadTransactions();
    }
    
    async loadTransactions() {
        try {
            if (window.DataAPI) {
                this.transactions = DataAPI.transactions.getAll();
            } else {
                this.transactions = this.getDefaultTransactions();
            }
            
            this.applyFilters();
            console.log(`📋 Loaded ${this.transactions.length} transactions`);
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = this.getDefaultTransactions();
        }
    }
    
    getDefaultTransactions() {
        return [
            { id: '1', description: 'משכורת מרץ', amount: 12000, category: 'הכנסה', date: new Date('2024-03-01'), type: 'income', account: 'חשבון עיקרי' },
            { id: '2', description: 'ארנונה פברואר', amount: -890, category: 'ארנונה', date: new Date('2024-02-28'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '3', description: 'קניות סופר', amount: -350, category: 'מזון', date: new Date('2024-02-27'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '4', description: 'חשמל ינואר', amount: -245, category: 'חשמל', date: new Date('2024-02-26'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '5', description: 'דלק', amount: -180, category: 'תחבורה', date: new Date('2024-02-25'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '6', description: 'ביטוח לאומי', amount: -1200, category: 'ביטוח לאומי', date: new Date('2024-02-24'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '7', description: 'מסעדה', amount: -120, category: 'בידור', date: new Date('2024-02-23'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '8', description: 'תוספת משכורת', amount: 800, category: 'הכנסה', date: new Date('2024-02-22'), type: 'income', account: 'חשבון עיקרי' },
            { id: '9', description: 'ביגוד', amount: -450, category: 'קניות', date: new Date('2024-02-21'), type: 'expense', account: 'חשבון עיקרי' },
            { id: '10', description: 'אוטובוס', amount: -25, category: 'תחבורה', date: new Date('2024-02-20'), type: 'expense', account: 'חשבון עיקרי' },
            // Generate more transactions for demonstration
            ...Array.from({ length: 40 }, (_, i) => ({
                id: `demo-${i + 11}`,
                description: this.getRandomDescription(i),
                amount: this.getRandomAmount(i),
                category: this.getRandomCategory(i),
                date: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000),
                type: Math.random() > 0.7 ? 'income' : 'expense',
                account: 'חשבון עיקרי'
            }))
        ];
    }
    
    getRandomDescription(index) {
        const descriptions = [
            'קניות באינטרנט', 'תחבורה ציבורית', 'קפה', 'ביטוח רכב', 'תרופות',
            'ספר', 'מוסיקה', 'כביסה', 'מספרה', 'מתנה', 'צדקה', 'משלוח',
            'חנייה', 'הלוואה', 'פיצה', 'מכולת', 'דואר', 'אוכל מהיר',
            'תחזוקת רכב', 'משקאות', 'ירקות', 'פירות', 'לחם', 'חלב'
        ];
        return descriptions[index % descriptions.length];
    }
    
    getRandomAmount(index) {
        const amounts = [-50, -120, -350, -25, -80, -200, -15, -400, -60, -300];
        return amounts[index % amounts.length];
    }
    
    getRandomCategory(index) {
        const categories = [
            'מזון', 'תחבורה', 'בידור', 'בריאות', 'חינוך', 'קניות',
            'ביטוח', 'תחזוקה', 'תקשורת', 'ספורט'
        ];
        return categories[index % categories.length];
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'transaction-list-component';
        container.innerHTML = `
            <div class="transaction-list-header">
                <div class="header-title">
                    <h2>רשימת עסקאות</h2>
                    <div class="transaction-count">
                        <span class="count">${this.filteredTransactions.length}</span>
                        <span class="label">עסקאות</span>
                    </div>
                </div>
                <div class="header-actions">
                    ${this.renderHeaderActions()}
                </div>
            </div>
            
            ${this.options.enableSearch || this.options.enableFilters ? this.renderFiltersBar() : ''}
            
            <div class="transaction-list-container">
                ${this.renderList()}
            </div>
            
            ${this.renderLoadingIndicator()}
        `;
        
        this.element = container;
        this.listContainer = container.querySelector('.transactions-list');
        
        this.attachEventListeners();
        this.setupInfiniteScroll();
        
        return container;
    }
    
    renderHeaderActions() {
        return `
            <div class="header-action-buttons">
                <button class="action-btn refresh-btn" data-action="refresh">
                    <span class="icon">🔄</span>
                    <span>רענן</span>
                </button>
                <button class="action-btn export-btn" data-action="export">
                    <span class="icon">📊</span>
                    <span>יצא</span>
                </button>
                <button class="action-btn add-btn" data-action="add">
                    <span class="icon">➕</span>
                    <span>עסקה חדשה</span>
                </button>
            </div>
        `;
    }
    
    renderFiltersBar() {
        return `
            <div class="filters-bar">
                ${this.options.enableSearch ? `
                    <div class="search-box">
                        <input type="text" 
                               placeholder="חיפוש עסקאות..." 
                               value="${this.filters.search}"
                               class="search-input">
                        <span class="search-icon">🔍</span>
                    </div>
                ` : ''}
                
                ${this.options.enableFilters ? `
                    <div class="filter-controls">
                        <select class="filter-select type-filter">
                            <option value="all">כל הסוגים</option>
                            <option value="income" ${this.filters.type === 'income' ? 'selected' : ''}>הכנסות</option>
                            <option value="expense" ${this.filters.type === 'expense' ? 'selected' : ''}>הוצאות</option>
                        </select>
                        
                        <select class="filter-select category-filter">
                            <option value="all">כל הקטגוריות</option>
                            ${this.getUniqueCategories().map(cat => 
                                `<option value="${cat}" ${this.filters.category === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                        
                        <select class="filter-select date-filter">
                            <option value="all">כל התאריכים</option>
                            <option value="today" ${this.filters.dateRange === 'today' ? 'selected' : ''}>היום</option>
                            <option value="week" ${this.filters.dateRange === 'week' ? 'selected' : ''}>השבוע</option>
                            <option value="month" ${this.filters.dateRange === 'month' ? 'selected' : ''}>החודש</option>
                            <option value="year" ${this.filters.dateRange === 'year' ? 'selected' : ''}>השנה</option>
                        </select>
                    </div>
                ` : ''}
                
                ${this.options.enableSort ? `
                    <div class="sort-controls">
                        <select class="sort-select">
                            <option value="date-desc" ${this.sortBy === 'date' && this.sortOrder === 'desc' ? 'selected' : ''}>תאריך (חדש לישן)</option>
                            <option value="date-asc" ${this.sortBy === 'date' && this.sortOrder === 'asc' ? 'selected' : ''}>תאריך (ישן לחדש)</option>
                            <option value="amount-desc" ${this.sortBy === 'amount' && this.sortOrder === 'desc' ? 'selected' : ''}>סכום (גבוה לנמוך)</option>
                            <option value="amount-asc" ${this.sortBy === 'amount' && this.sortOrder === 'asc' ? 'selected' : ''}>סכום (נמוך לגבוה)</option>
                            <option value="description-asc" ${this.sortBy === 'description' && this.sortOrder === 'asc' ? 'selected' : ''}>תיאור (א-ת)</option>
                        </select>
                    </div>
                ` : ''}
                
                <div class="clear-filters">
                    <button class="clear-btn" data-action="clear-filters">
                        נקה מסננים
                    </button>
                </div>
            </div>
        `;
    }
    
    renderList() {
        return `
            <div class="transactions-list">
                ${this.renderTransactions()}
            </div>
        `;
    }
    
    renderTransactions() {
        if (this.displayedTransactions.length === 0) {
            return this.renderEmptyState();
        }
        
        let html = '';
        let currentGroup = '';
        
        this.displayedTransactions.forEach((transaction, index) => {
            if (this.options.showDateGroups) {
                const group = this.getDateGroup(transaction.date);
                if (group !== currentGroup) {
                    currentGroup = group;
                    html += `<div class="date-group-header">${group}</div>`;
                }
            }
            
            html += this.renderTransaction(transaction, index);
        });
        
        return html;
    }
    
    renderTransaction(transaction, index) {
        const icon = this.getTransactionIcon(transaction.category);
        const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
        const formattedDate = this.formatTransactionDate(transaction.date);
        
        return `
            <div class="transaction-item ${transaction.type}" data-transaction-id="${transaction.id}">
                <div class="transaction-main">
                    <div class="transaction-icon">
                        ${icon}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-meta">
                            <span class="category">${transaction.category}</span>
                            <span class="separator">•</span>
                            <span class="account">${transaction.account}</span>
                            <span class="separator">•</span>
                            <span class="date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        <button class="action-icon edit-btn" data-action="edit" data-id="${transaction.id}" title="ערוך">
                            ✏️
                        </button>
                        <button class="action-icon delete-btn" data-action="delete" data-id="${transaction.id}" title="מחק">
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${this.renderRunningBalance(index)}
            </div>
        `;
    }
    
    renderRunningBalance(index) {
        if (!this.options.showBalance || index % 5 !== 4) return '';
        
        const balance = this.calculateRunningBalance(index);
        return `
            <div class="running-balance">
                <span class="balance-label">יתרה:</span>
                <span class="balance-amount">${formatCurrency(balance)}</span>
            </div>
        `;
    }
    
    renderEmptyState() {
        const hasFilters = this.filters.search || 
                          this.filters.type !== 'all' || 
                          this.filters.category !== 'all' || 
                          this.filters.dateRange !== 'all';
        
        return `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>${hasFilters ? 'לא נמצאו תוצאות' : 'אין עסקאות להצגה'}</h3>
                <p>${hasFilters ? 'נסה לשנות את הגדרות החיפוש והמסננים' : 'התחל לרשום עסקאות לצפייה כאן'}</p>
                <div class="empty-actions">
                    ${hasFilters ? `
                        <button class="primary-btn" data-action="clear-filters">
                            נקה מסננים
                        </button>
                    ` : `
                        <button class="primary-btn" data-action="add">
                            הוסף עסקה ראשונה
                        </button>
                    `}
                </div>
            </div>
        `;
    }
    
    renderLoadingIndicator() {
        return `
            <div class="loading-indicator" style="display: none;">
                <div class="loading-spinner"></div>
                <p>טוען עסקאות נוספות...</p>
            </div>
        `;
    }
    
    // Helper methods
    getDateGroup(date) {
        const now = new Date();
        const transactionDate = new Date(date);
        
        // Check if today
        if (this.isSameDay(transactionDate, now)) {
            return 'היום';
        }
        
        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (this.isSameDay(transactionDate, yesterday)) {
            return 'אתמול';
        }
        
        // Check if this week
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        if (transactionDate >= weekStart) {
            return 'השבוע';
        }
        
        // Check if this month
        if (transactionDate.getMonth() === now.getMonth() && 
            transactionDate.getFullYear() === now.getFullYear()) {
            return 'החודש';
        }
        
        // Format month and year
        return transactionDate.toLocaleDateString('he-IL', { 
            year: 'numeric', 
            month: 'long' 
        });
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    formatTransactionDate(date) {
        const now = new Date();
        const transactionDate = new Date(date);
        const diffTime = now - transactionDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'היום';
        if (diffDays === 1) return 'אתמול';
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        
        return transactionDate.toLocaleDateString('he-IL');
    }
    
    getTransactionIcon(category) {
        const icons = {
            'הכנסה': '💰',
            'מזון': '🛒',
            'תחבורה': '🚗',
            'ארנונה': '🏠',
            'חשמל': '⚡',
            'ביטוח לאומי': '🏛️',
            'בידור': '🎬',
            'בריאות': '🏥',
            'חינוך': '📚',
            'קניות': '🛍️',
            'ביטוח': '🛡️',
            'תחזוקה': '🔧',
            'תקשורת': '📱',
            'ספורט': '⚽'
        };
        return icons[category] || '💳';
    }
    
    getUniqueCategories() {
        const categories = [...new Set(this.transactions.map(t => t.category))];
        return categories.sort();
    }
    
    calculateRunningBalance(upToIndex) {
        let balance = 60950; // Starting balance
        for (let i = 0; i <= upToIndex; i++) {
            balance += this.displayedTransactions[i].amount;
        }
        return balance;
    }
    
    // Filter and sort methods
    applyFilters() {
        let filtered = [...this.transactions];
        
        // Search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(search) ||
                t.category.toLowerCase().includes(search)
            );
        }
        
        // Type filter
        if (this.filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === this.filters.type);
        }
        
        // Category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === this.filters.category);
        }
        
        // Date range filter
        if (this.filters.dateRange !== 'all') {
            filtered = this.applyDateFilter(filtered);
        }
        
        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortBy) {
                case 'date':
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case 'amount':
                    comparison = Math.abs(a.amount) - Math.abs(b.amount);
                    break;
                case 'description':
                    comparison = a.description.localeCompare(b.description, 'he');
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category, 'he');
                    break;
            }
            
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        this.filteredTransactions = filtered;
        this.resetPagination();
        this.updateDisplayedTransactions();
    }
    
    applyDateFilter(transactions) {
        const now = new Date();
        
        switch (this.filters.dateRange) {
            case 'today':
                return transactions.filter(t => this.isSameDay(new Date(t.date), now));
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                return transactions.filter(t => new Date(t.date) >= weekStart);
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return transactions.filter(t => new Date(t.date) >= monthStart);
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                return transactions.filter(t => new Date(t.date) >= yearStart);
            default:
                return transactions;
        }
    }
    
    resetPagination() {
        this.currentPage = 0;
        this.displayedTransactions = [];
        this.hasMore = true;
    }
    
    updateDisplayedTransactions() {
        const startIndex = this.currentPage * this.options.pageSize;
        const endIndex = startIndex + this.options.pageSize;
        const newTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        if (this.currentPage === 0) {
            this.displayedTransactions = newTransactions;
        } else {
            this.displayedTransactions.push(...newTransactions);
        }
        
        this.hasMore = endIndex < this.filteredTransactions.length;
        this.currentPage++;
    }
    
    // Event handlers
    attachEventListeners() {
        if (!this.element) return;
        
        // Search input
        const searchInput = this.element.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
                this.refreshList();
            });
        }
        
        // Filter selects
        const typeFilter = this.element.querySelector('.type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
                this.refreshList();
            });
        }
        
        const categoryFilter = this.element.querySelector('.category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
                this.refreshList();
            });
        }
        
        const dateFilter = this.element.querySelector('.date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.applyFilters();
                this.refreshList();
            });
        }
        
        // Sort select
        const sortSelect = this.element.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                this.sortBy = sortBy;
                this.sortOrder = sortOrder;
                this.applyFilters();
                this.refreshList();
            });
        }
        
        // Action buttons
        this.element.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;
                this.handleAction(action, id, e);
            });
        });
    }
    
    handleAction(action, id, event) {
        console.log('Transaction list action:', action, id);
        
        switch (action) {
            case 'refresh':
                this.refresh();
                break;
            case 'export':
                this.exportTransactions();
                break;
            case 'add':
                this.addTransaction();
                break;
            case 'edit':
                this.editTransaction(id);
                break;
            case 'delete':
                this.deleteTransaction(id);
                break;
            case 'clear-filters':
                this.clearFilters();
                break;
            default:
                HebrewToasts?.info(`פעולה: ${action}`, 'רשימת עסקאות');
        }
    }
    
    async refresh() {
        this.isLoading = true;
        this.showLoading();
        
        try {
            await this.loadTransactions();
            this.refreshList();
            HebrewToasts?.success('רשימת העסקאות עודכנה', 'רענון');
        } catch (error) {
            console.error('Error refreshing transactions:', error);
            HebrewToasts?.error('שגיאה בעדכון הרשימה', 'רענון');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    refreshList() {
        if (this.listContainer) {
            this.listContainer.innerHTML = this.renderTransactions();
            this.updateTransactionCount();
        }
    }
    
    updateTransactionCount() {
        const countElement = this.element?.querySelector('.count');
        if (countElement) {
            countElement.textContent = this.filteredTransactions.length;
        }
    }
    
    clearFilters() {
        this.filters = {
            search: '',
            type: 'all',
            category: 'all',
            dateRange: 'all',
            amountRange: { min: null, max: null },
            customDateRange: { start: null, end: null }
        };
        
        // Reset form inputs
        const searchInput = this.element?.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
        
        const selects = this.element?.querySelectorAll('select');
        selects?.forEach(select => {
            if (select.classList.contains('sort-select')) return;
            select.value = 'all';
        });
        
        this.applyFilters();
        this.refreshList();
        
        HebrewToasts?.info('המסננים נוקו', 'רשימת עסקאות');
    }
    
    exportTransactions() {
        HebrewToasts?.info('יצוא עסקאות - בקרוב', 'רשימת עסקאות');
    }
    
    addTransaction() {
        if (window.HebrewModals) {
            HebrewModals.addTransaction().open();
        } else {
            HebrewToasts?.info('הוספת עסקה - בקרוב', 'רשימת עסקאות');
        }
    }
    
    editTransaction(id) {
        HebrewToasts?.info(`עריכת עסקה ${id} - בקרוב`, 'רשימת עסקאות');
    }
    
    deleteTransaction(id) {
        if (window.HebrewModals) {
            HebrewModals.confirm(
                'האם אתה בטוח שברצונך למחוק את העסקה?',
                () => {
                    // Remove from data
                    this.transactions = this.transactions.filter(t => t.id !== id);
                    this.applyFilters();
                    this.refreshList();
                    HebrewToasts?.success('העסקה נמחקה', 'רשימת עסקאות');
                },
                () => HebrewToasts?.info('מחיקת העסקה בוטלה')
            ).open();
        } else {
            HebrewToasts?.info(`מחיקת עסקה ${id} - בקרוב`, 'רשימת עסקאות');
        }
    }
    
    // Infinite scroll
    setupInfiniteScroll() {
        if (!this.options.enableInfiniteScroll || !this.element) return;
        
        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        this.listContainer?.appendChild(sentinel);
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMore && !this.isLoading) {
                    this.loadMoreTransactions();
                }
            });
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });
        
        this.observer.observe(sentinel);
    }
    
    async loadMoreTransactions() {
        if (this.isLoading || !this.hasMore) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
            
            this.updateDisplayedTransactions();
            
            // Append new transactions to list
            const newTransactions = this.displayedTransactions.slice(-this.options.pageSize);
            newTransactions.forEach((transaction, index) => {
                const transactionElement = document.createElement('div');
                transactionElement.innerHTML = this.renderTransaction(
                    transaction, 
                    this.displayedTransactions.length - this.options.pageSize + index
                );
                this.listContainer?.appendChild(transactionElement.firstElementChild);
            });
            
        } catch (error) {
            console.error('Error loading more transactions:', error);
            HebrewToasts?.error('שגיאה בטעינת עסקאות נוספות');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    showLoading() {
        const loadingIndicator = this.element?.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingIndicator = this.element?.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

// Make TransactionList available globally
window.TransactionList = TransactionList;

console.log('📋 TransactionList component loaded');