// Dashboard Component - Hebrew Interface
// Main financial dashboard with Hebrew labels and Israeli formatting

class Dashboard {
    constructor(options = {}) {
        this.options = {
            showWelcome: true,
            refreshInterval: 30000, // 30 seconds
            showTips: true,
            layout: 'auto', // 'compact', 'full', 'auto'
            ...options
        };
        
        this.data = null;
        this.refreshTimer = null;
        this.element = null;
        
        // Dashboard sections
        this.sections = {
            summary: true,
            quickActions: true,
            recentTransactions: true,
            categoryBreakdown: true,
            budgetProgress: true,
            insights: true
        };
        
        // Initialize with default data
        this.initializeData();
    }
    
    async initializeData() {
        if (window.DataAPI) {
            try {
                // Get dashboard data
                this.data = {
                    accounts: DataAPI.accounts.getAll(),
                    transactions: DataAPI.transactions.getRecent(10),
                    categories: DataAPI.categories.getAll(),
                    budgets: DataAPI.budgets.getAll(),
                    summary: this.calculateSummary()
                };
                
                console.log('📊 Dashboard data loaded:', this.data);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                this.data = this.getDefaultData();
            }
        } else {
            this.data = this.getDefaultData();
        }
    }
    
    getDefaultData() {
        return {
            accounts: [
                { id: 'main', name: 'חשבון עיקרי', balance: 15750, currency: 'ILS' },
                { id: 'savings', name: 'חשבון חיסכון', balance: 45200, currency: 'ILS' }
            ],
            transactions: [
                { id: '1', description: 'משכורת', amount: 12000, category: 'הכנסה', date: new Date(), type: 'income' },
                { id: '2', description: 'ארנונה', amount: -890, category: 'ארנונה', date: new Date(Date.now() - 86400000), type: 'expense' },
                { id: '3', description: 'קניות', amount: -350, category: 'מזון', date: new Date(Date.now() - 172800000), type: 'expense' }
            ],
            categories: [
                { id: 'income', name: 'הכנסה', type: 'income', color: '#22c55e' },
                { id: 'food', name: 'מזון', type: 'expense', color: '#f59e0b' },
                { id: 'housing', name: 'דיור', type: 'expense', color: '#3b82f6' }
            ],
            budgets: [
                { id: '1', category: 'מזון', budget: 2000, spent: 1250, period: 'monthly' },
                { id: '2', category: 'תחבורה', budget: 800, spent: 450, period: 'monthly' }
            ],
            summary: {
                totalBalance: 60950,
                monthlyIncome: 12000,
                monthlyExpenses: 8400,
                netSavings: 3600,
                savingsRate: 30
            }
        };
    }
    
    calculateSummary() {
        if (!window.DataAPI) return this.getDefaultData().summary;
        
        try {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            // Get monthly transactions
            const monthlyTransactions = DataAPI.transactions.getByDateRange({
                start: new Date(currentYear, currentMonth, 1),
                end: new Date(currentYear, currentMonth + 1, 0)
            });
            
            // Calculate totals
            const income = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const expenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            const accounts = DataAPI.accounts.getAll();
            const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
            
            const netSavings = income - expenses;
            const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
            
            return {
                totalBalance,
                monthlyIncome: income,
                monthlyExpenses: expenses,
                netSavings,
                savingsRate
            };
        } catch (error) {
            console.error('Error calculating summary:', error);
            return this.getDefaultData().summary;
        }
    }
    
    render() {
        if (!this.data) {
            return this.renderLoading();
        }
        
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <div class="dashboard-title">
                    <h1>לוח הבקרה הפיננסי</h1>
                    <p class="dashboard-subtitle">סקירה כללית של המצב הפיננסי שלך</p>
                </div>
                <div class="dashboard-actions">
                    ${this.renderQuickActions()}
                </div>
            </div>
            
            <div class="dashboard-grid">
                ${this.renderSummaryCards()}
                ${this.renderRecentTransactions()}
                ${this.renderCategoryBreakdown()}
                ${this.renderBudgetProgress()}
                ${this.renderInsights()}
            </div>
        `;
        
        this.element = dashboard;
        this.attachEventListeners();
        
        // Set up auto-refresh
        if (this.options.refreshInterval > 0) {
            this.startAutoRefresh();
        }
        
        return dashboard;
    }
    
    renderLoading() {
        const loading = document.createElement('div');
        loading.className = 'dashboard-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>טוען נתונים פיננסיים...</p>
        `;
        return loading;
    }
    
    renderQuickActions() {
        return `
            <div class="quick-actions">
                <button class="quick-action-btn" data-action="add-income">
                    <span class="icon">💰</span>
                    <span>הוסף הכנסה</span>
                </button>
                <button class="quick-action-btn" data-action="add-expense">
                    <span class="icon">💸</span>
                    <span>הוסף הוצאה</span>
                </button>
                <button class="quick-action-btn" data-action="transfer">
                    <span class="icon">🔄</span>
                    <span>העברה</span>
                </button>
                <button class="quick-action-btn" data-action="refresh">
                    <span class="icon">🔄</span>
                    <span>רענן</span>
                </button>
            </div>
        `;
    }
    
    renderSummaryCards() {
        const { summary } = this.data;
        
        return `
            <div class="summary-section">
                <div class="summary-cards">
                    <div class="summary-card balance">
                        <div class="card-header">
                            <h3>יתרה כוללת</h3>
                            <span class="icon">💰</span>
                        </div>
                        <div class="card-value">${formatCurrency(summary.totalBalance)}</div>
                        <div class="card-trend positive">↗ יתרה בעלייה</div>
                    </div>
                    
                    <div class="summary-card income">
                        <div class="card-header">
                            <h3>הכנסות החודש</h3>
                            <span class="icon">📈</span>
                        </div>
                        <div class="card-value">${formatCurrency(summary.monthlyIncome)}</div>
                        <div class="card-description">הכנסות חודש ${this.getCurrentMonth()}</div>
                    </div>
                    
                    <div class="summary-card expense">
                        <div class="card-header">
                            <h3>הוצאות החודש</h3>
                            <span class="icon">📉</span>
                        </div>
                        <div class="card-value">${formatCurrency(summary.monthlyExpenses)}</div>
                        <div class="card-description">הוצאות חודש ${this.getCurrentMonth()}</div>
                    </div>
                    
                    <div class="summary-card savings">
                        <div class="card-header">
                            <h3>חיסכון נטו</h3>
                            <span class="icon">🎯</span>
                        </div>
                        <div class="card-value">${formatCurrency(summary.netSavings)}</div>
                        <div class="card-description">${summary.savingsRate}% שיעור חיסכון</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRecentTransactions() {
        const { transactions } = this.data;
        
        return `
            <div class="recent-transactions-section">
                <div class="section-header">
                    <h2>עסקאות אחרונות</h2>
                    <button class="see-all-btn" data-action="view-all-transactions">
                        צפה בכל העסקאות
                    </button>
                </div>
                <div class="transactions-list">
                    ${transactions.slice(0, 5).map(transaction => `
                        <div class="transaction-item ${transaction.type}">
                            <div class="transaction-icon">
                                ${this.getTransactionIcon(transaction.category)}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-description">${transaction.description}</div>
                                <div class="transaction-meta">
                                    <span class="category">${transaction.category}</span>
                                    <span class="date">${this.formatTransactionDate(transaction.date)}</span>
                                </div>
                            </div>
                            <div class="transaction-amount ${transaction.type}">
                                ${formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${transactions.length === 0 ? `
                    <div class="empty-state">
                        <p>אין עסקאות להצגה</p>
                        <button class="add-transaction-btn" data-action="add-transaction">
                            הוסף עסקה ראשונה
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderCategoryBreakdown() {
        const { categories, transactions } = this.data;
        
        // Calculate spending by category
        const categorySpending = this.calculateCategorySpending(transactions);
        const topCategories = Object.entries(categorySpending)
            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
            .slice(0, 5);
        
        return `
            <div class="category-breakdown-section">
                <div class="section-header">
                    <h2>פילוח לפי קטגוריות</h2>
                    <button class="view-chart-btn" data-action="view-category-chart">
                        תרשים מפורט
                    </button>
                </div>
                <div class="category-list">
                    ${topCategories.map(([category, amount]) => {
                        const percentage = this.calculateCategoryPercentage(amount, categorySpending);
                        return `
                            <div class="category-item">
                                <div class="category-info">
                                    <span class="category-name">${category}</span>
                                    <span class="category-amount">${formatCurrency(Math.abs(amount))}</span>
                                </div>
                                <div class="category-bar">
                                    <div class="category-progress" style="width: ${percentage}%"></div>
                                </div>
                                <span class="category-percentage">${percentage}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    renderBudgetProgress() {
        const { budgets } = this.data;
        
        return `
            <div class="budget-progress-section">
                <div class="section-header">
                    <h2>התקדמות תקציב</h2>
                    <button class="manage-budgets-btn" data-action="manage-budgets">
                        נהל תקציבים
                    </button>
                </div>
                <div class="budget-list">
                    ${budgets.map(budget => {
                        const percentage = Math.round((budget.spent / budget.budget) * 100);
                        const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good';
                        
                        return `
                            <div class="budget-item ${status}">
                                <div class="budget-header">
                                    <span class="budget-category">${budget.category}</span>
                                    <span class="budget-amount">
                                        ${formatCurrency(budget.spent)} / ${formatCurrency(budget.budget)}
                                    </span>
                                </div>
                                <div class="budget-bar">
                                    <div class="budget-progress" style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                                <div class="budget-status">
                                    ${percentage >= 100 ? 
                                        `<span class="over-budget">חריגה בסכום ${formatCurrency(budget.spent - budget.budget)}</span>` :
                                        `<span class="remaining">נותרו ${formatCurrency(budget.budget - budget.spent)}</span>`
                                    }
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${budgets.length === 0 ? `
                    <div class="empty-state">
                        <p>לא הוגדרו תקציבים</p>
                        <button class="create-budget-btn" data-action="create-budget">
                            צור תקציב ראשון
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderInsights() {
        const insights = this.generateInsights();
        
        return `
            <div class="insights-section">
                <div class="section-header">
                    <h2>תובנות פיננסיות</h2>
                </div>
                <div class="insights-list">
                    ${insights.map(insight => `
                        <div class="insight-item ${insight.type}">
                            <div class="insight-icon">${insight.icon}</div>
                            <div class="insight-content">
                                <h4 class="insight-title">${insight.title}</h4>
                                <p class="insight-description">${insight.description}</p>
                                ${insight.action ? `
                                    <button class="insight-action" data-action="${insight.action}">
                                        ${insight.actionText}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    generateInsights() {
        const { summary, budgets, transactions } = this.data;
        const insights = [];
        
        // Savings rate insight
        if (summary.savingsRate > 20) {
            insights.push({
                type: 'positive',
                icon: '🎉',
                title: 'שיעור חיסכון מעולה!',
                description: `אתה חוסך ${summary.savingsRate}% מההכנסות שלך - זה מעל הממוצע הלאומי!`,
                action: 'investment-options',
                actionText: 'צפה באפשרויות השקעה'
            });
        } else if (summary.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'שיעור חיסכון נמוך',
                description: `שיעור החיסכון שלך הוא ${summary.savingsRate}%. מומלץ לשאוף ל-20% לפחות.`,
                action: 'budget-optimization',
                actionText: 'קבל עצות לחיסכון'
            });
        }
        
        // Budget alerts
        const overBudget = budgets.filter(b => b.spent > b.budget);
        if (overBudget.length > 0) {
            insights.push({
                type: 'alert',
                icon: '🚨',
                title: 'חריגה מתקציב',
                description: `יש לך חריגה ב-${overBudget.length} קטגוריות. בדוק את ההוצאות שלך.`,
                action: 'review-budget',
                actionText: 'סקור תקציב'
            });
        }
        
        // Transaction patterns
        const recentExpenses = transactions
            .filter(t => t.type === 'expense' && this.isRecentTransaction(t.date))
            .length;
            
        if (recentExpenses > 10) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'פעילות תשלומים גבוהה',
                description: `ביצעת ${recentExpenses} הוצאות השבוע. בדוק שכל התשלומים נחוצים.`,
                action: 'review-transactions',
                actionText: 'סקור עסקאות'
            });
        }
        
        // Default insight if no specific insights
        if (insights.length === 0) {
            insights.push({
                type: 'tip',
                icon: '💡',
                title: 'טיפ פיננסי',
                description: 'עקוב אחר ההוצאות שלך באמצעות קטגוריות מפורטות לשליטה טובה יותר בתקציב.',
                action: 'categorize-transactions',
                actionText: 'קבל עזרה בקטגוריות'
            });
        }
        
        return insights.slice(0, 3); // Show max 3 insights
    }
    
    // Helper methods
    getCurrentMonth() {
        const months = [
            'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
            'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
        ];
        return months[new Date().getMonth()];
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
            'קניות': '🛍️'
        };
        return icons[category] || '💳';
    }
    
    calculateCategorySpending(transactions) {
        const spending = {};
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                spending[transaction.category] = (spending[transaction.category] || 0) + Math.abs(transaction.amount);
            }
        });
        return spending;
    }
    
    calculateCategoryPercentage(amount, allSpending) {
        const total = Object.values(allSpending).reduce((sum, val) => sum + Math.abs(val), 0);
        return total > 0 ? Math.round((Math.abs(amount) / total) * 100) : 0;
    }
    
    isRecentTransaction(date) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(date) >= oneWeekAgo;
    }
    
    // Event handling
    attachEventListeners() {
        if (!this.element) return;
        
        // Quick action buttons
        this.element.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action, e);
            });
        });
    }
    
    handleAction(action, event) {
        console.log('Dashboard action:', action);
        
        switch (action) {
            case 'add-income':
                this.showAddTransactionModal('income');
                break;
            case 'add-expense':
                this.showAddTransactionModal('expense');
                break;
            case 'transfer':
                this.showTransferModal();
                break;
            case 'refresh':
                this.refresh();
                break;
            case 'view-all-transactions':
                this.navigateToTransactions();
                break;
            case 'view-category-chart':
                this.showCategoryChart();
                break;
            case 'manage-budgets':
                this.navigateToBudgets();
                break;
            case 'create-budget':
                this.showCreateBudgetModal();
                break;
            default:
                if (window.HebrewToasts) {
                    HebrewToasts.info(`פעולה: ${action}`, 'לוח בקרה');
                }
        }
    }
    
    showAddTransactionModal(type) {
        if (window.HebrewModals) {
            const modal = type === 'income' ? 
                HebrewModals.addIncome() : 
                HebrewModals.addExpense();
            modal.open();
        } else {
            HebrewToasts?.info(`הוספת ${type === 'income' ? 'הכנסה' : 'הוצאה'} - בקרוב`);
        }
    }
    
    showTransferModal() {
        if (window.HebrewModals) {
            HebrewModals.transfer().open();
        } else {
            HebrewToasts?.info('העברה בין חשבונות - בקרוב');
        }
    }
    
    showCategoryChart() {
        HebrewToasts?.info('תרשים קטגוריות מפורט - בקרוב');
    }
    
    showCreateBudgetModal() {
        if (window.HebrewModals) {
            HebrewModals.createBudget().open();
        } else {
            HebrewToasts?.info('יצירת תקציב - בקרוב');
        }
    }
    
    navigateToTransactions() {
        HebrewToasts?.info('מעבר לעמוד העסקאות - בקרוב');
    }
    
    navigateToBudgets() {
        HebrewToasts?.info('מעבר לעמוד התקציבים - בקרוב');
    }
    
    async refresh() {
        HebrewToasts?.info('מרענן נתונים...', 'לוח בקרה');
        
        try {
            await this.initializeData();
            
            // Re-render dashboard
            if (this.element && this.element.parentNode) {
                const newElement = this.render();
                this.element.parentNode.replaceChild(newElement, this.element);
            }
            
            HebrewToasts?.success('הנתונים עודכנו בהצלחה', 'לוח בקרה');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            HebrewToasts?.error('שגיאה ברענון הנתונים', 'לוח בקרה');
        }
    }
    
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, this.options.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    destroy() {
        this.stopAutoRefresh();
        
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

// Make Dashboard available globally
window.Dashboard = Dashboard;

console.log('📊 Dashboard component loaded');