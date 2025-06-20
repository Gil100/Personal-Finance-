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
            financialGoals: true,
            insights: true
        };
        
        // Load saved settings
        this.loadSettingsFromStorage();
        
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
            financialGoals: [
                { 
                    id: '1', 
                    name: 'חיסכון לקדמה לדירה', 
                    targetAmount: 150000, 
                    currentAmount: 45200, 
                    targetDate: new Date('2024-12-31'),
                    category: 'savings',
                    priority: 'high'
                },
                { 
                    id: '2', 
                    name: 'חופשה במחו"ל', 
                    targetAmount: 15000, 
                    currentAmount: 8500, 
                    targetDate: new Date('2024-08-15'),
                    category: 'vacation',
                    priority: 'medium'
                },
                { 
                    id: '3', 
                    name: 'קרן חירום', 
                    targetAmount: 50000, 
                    currentAmount: 22000, 
                    targetDate: new Date('2025-06-30'),
                    category: 'emergency',
                    priority: 'high'
                }
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
        dashboard.className = `dashboard layout-${this.options.layout}`;
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <div class="dashboard-title">
                    <h1>לוח הבקרה הפיננסי</h1>
                    <p class="dashboard-subtitle">סקירה כללית של המצב הפיננסי שלך</p>
                </div>
                <div class="dashboard-actions">
                    <button class="dashboard-settings-btn" data-action="dashboard-settings">
                        <span class="icon">⚙️</span>
                        <span>הגדרות לוח</span>
                    </button>
                    ${this.renderQuickActions()}
                </div>
            </div>
            
            <div class="dashboard-grid">
                ${this.renderConditionalSections()}
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
    
    renderConditionalSections() {
        let sections = '';
        
        if (this.sections.summary) {
            sections += `<div class="dashboard-section summary-section">${this.renderSummaryCards()}</div>`;
        }
        
        if (this.sections.recentTransactions) {
            sections += `<div class="dashboard-section recent-transactions-section">${this.renderRecentTransactions()}</div>`;
        }
        
        if (this.sections.categoryBreakdown) {
            sections += `<div class="dashboard-section category-breakdown-section">${this.renderCategoryBreakdown()}</div>`;
        }
        
        if (this.sections.budgetProgress) {
            sections += `<div class="dashboard-section budget-progress-section">${this.renderBudgetProgress()}</div>`;
        }
        
        if (this.sections.financialGoals) {
            sections += `<div class="dashboard-section financial-goals-section">${this.renderFinancialGoals()}</div>`;
        }
        
        if (this.sections.insights) {
            sections += `<div class="dashboard-section insights-section">${this.renderInsights()}</div>`;
        }
        
        return sections;
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
    
    renderFinancialGoals() {
        const { financialGoals } = this.data;
        
        return `
            <div class="financial-goals-section">
                <div class="section-header">
                    <h2>יעדים פיננסיים</h2>
                    <button class="manage-goals-btn" data-action="manage-goals">
                        נהל יעדים
                    </button>
                </div>
                <div class="goals-list">
                    ${financialGoals.map(goal => {
                        const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                        const daysLeft = this.calculateDaysUntilTarget(goal.targetDate);
                        const monthlyRequired = this.calculateMonthlyRequired(goal);
                        
                        return `
                            <div class="goal-item ${goal.priority}">
                                <div class="goal-header">
                                    <div class="goal-info">
                                        <h4 class="goal-name">${goal.name}</h4>
                                        <span class="goal-category">${this.getGoalCategoryName(goal.category)}</span>
                                    </div>
                                    <div class="goal-amounts">
                                        <span class="current-amount">${formatCurrency(goal.currentAmount)}</span>
                                        <span class="target-amount">/ ${formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                </div>
                                
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                                    </div>
                                    <span class="progress-percentage">${percentage}%</span>
                                </div>
                                
                                <div class="goal-timeline">
                                    <div class="time-left">
                                        ${daysLeft > 0 ? 
                                            `<span class="days-count">${daysLeft}</span> ימים נותרו` :
                                            `<span class="overdue">פג תוקף ב-${Math.abs(daysLeft)} ימים</span>`
                                        }
                                    </div>
                                    <div class="monthly-required">
                                        ${monthlyRequired > 0 ? 
                                            `נדרש: ${formatCurrency(monthlyRequired)}/חודש` :
                                            `יעד הושג! 🎉`
                                        }
                                    </div>
                                </div>
                                
                                ${this.renderGoalActions(goal)}
                            </div>
                        `;
                    }).join('')}
                </div>
                ${financialGoals.length === 0 ? `
                    <div class="empty-state">
                        <p>לא הוגדרו יעדים פיננסיים</p>
                        <button class="create-goal-btn" data-action="create-goal">
                            צור יעד ראשון
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderGoalActions(goal) {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (percentage >= 100) {
            return `
                <div class="goal-actions completed">
                    <button class="goal-action-btn celebrate" data-action="celebrate-goal" data-goal-id="${goal.id}">
                        🎉 יעד הושג!
                    </button>
                    <button class="goal-action-btn archive" data-action="archive-goal" data-goal-id="${goal.id}">
                        העבר לארכיון
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="goal-actions">
                <button class="goal-action-btn add-money" data-action="add-to-goal" data-goal-id="${goal.id}">
                    הוסף כסף
                </button>
                <button class="goal-action-btn edit" data-action="edit-goal" data-goal-id="${goal.id}">
                    ערוך יעד
                </button>
                <button class="goal-action-btn details" data-action="goal-details" data-goal-id="${goal.id}">
                    פרטים
                </button>
            </div>
        `;
    }
    
    // Goal helper methods
    getGoalCategoryName(category) {
        const categories = {
            'savings': 'חיסכון',
            'vacation': 'חופשה',
            'emergency': 'חירום',
            'education': 'חינוך',
            'health': 'בריאות',
            'home': 'דיור',
            'car': 'רכב',
            'retirement': 'פנסיה',
            'investment': 'השקעה',
            'other': 'אחר'
        };
        return categories[category] || category;
    }
    
    calculateDaysUntilTarget(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diffTime = target - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    calculateMonthlyRequired(goal) {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) return 0;
        
        const daysLeft = this.calculateDaysUntilTarget(goal.targetDate);
        if (daysLeft <= 0) return 0;
        
        const monthsLeft = Math.max(1, daysLeft / 30);
        return Math.ceil(remaining / monthsLeft);
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
            case 'dashboard-settings':
                this.showDashboardSettings();
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
    
    showDashboardSettings() {
        if (!window.HebrewModals) {
            HebrewToasts?.info('הגדרות לוח הבקרה - בקרוב');
            return;
        }
        
        const settingsModal = HebrewModals.create({
            title: 'הגדרות לוח הבקרה',
            size: 'medium',
            content: this.renderDashboardSettingsForm(),
            primaryAction: {
                text: 'שמור הגדרות',
                action: () => this.saveDashboardSettings()
            },
            secondaryAction: {
                text: 'איפוס',
                action: () => this.resetDashboardSettings()
            }
        });
        
        settingsModal.open();
        this.currentSettingsModal = settingsModal;
    }
    
    renderDashboardSettingsForm() {
        return `
            <div class="dashboard-settings-form" dir="rtl">
                <div class="settings-section">
                    <h3>פריסת הלוח</h3>
                    <div class="layout-options">
                        <label class="layout-option">
                            <input type="radio" name="layout" value="auto" ${this.options.layout === 'auto' ? 'checked' : ''}>
                            <span class="layout-preview">
                                <div class="preview-grid auto"></div>
                                <span class="layout-name">אוטומטי</span>
                                <span class="layout-description">התאמה לגודל המסך</span>
                            </span>
                        </label>
                        
                        <label class="layout-option">
                            <input type="radio" name="layout" value="compact" ${this.options.layout === 'compact' ? 'checked' : ''}>
                            <span class="layout-preview">
                                <div class="preview-grid compact"></div>
                                <span class="layout-name">קומפקטי</span>
                                <span class="layout-description">מידע חיוני בלבד</span>
                            </span>
                        </label>
                        
                        <label class="layout-option">
                            <input type="radio" name="layout" value="full" ${this.options.layout === 'full' ? 'checked' : ''}>
                            <span class="layout-preview">
                                <div class="preview-grid full"></div>
                                <span class="layout-name">מלא</span>
                                <span class="layout-description">כל המידע במבט אחד</span>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>אזורים מוצגים</h3>
                    <div class="section-toggles">
                        <label class="section-toggle">
                            <input type="checkbox" data-section="summary" ${this.sections.summary ? 'checked' : ''}>
                            <span class="toggle-text">סיכום פיננסי</span>
                            <span class="toggle-description">יתרה, הכנסות והוצאות</span>
                        </label>
                        
                        <label class="section-toggle">
                            <input type="checkbox" data-section="recentTransactions" ${this.sections.recentTransactions ? 'checked' : ''}>
                            <span class="toggle-text">עסקאות אחרונות</span>
                            <span class="toggle-description">רשימת התשלומים האחרונים</span>
                        </label>
                        
                        <label class="section-toggle">
                            <input type="checkbox" data-section="categoryBreakdown" ${this.sections.categoryBreakdown ? 'checked' : ''}>
                            <span class="toggle-text">פילוח קטגוריות</span>
                            <span class="toggle-description">הוצאות לפי סוגים</span>
                        </label>
                        
                        <label class="section-toggle">
                            <input type="checkbox" data-section="budgetProgress" ${this.sections.budgetProgress ? 'checked' : ''}>
                            <span class="toggle-text">התקדמות תקציב</span>
                            <span class="toggle-description">מעקב אחר מגבלות הוצאות</span>
                        </label>
                        
                        <label class="section-toggle">
                            <input type="checkbox" data-section="financialGoals" ${this.sections.financialGoals ? 'checked' : ''}>
                            <span class="toggle-text">יעדים פיננסיים</span>
                            <span class="toggle-description">מעקב אחר יעדי חיסכון</span>
                        </label>
                        
                        <label class="section-toggle">
                            <input type="checkbox" data-section="insights" ${this.sections.insights ? 'checked' : ''}>
                            <span class="toggle-text">תובנות פיננסיות</span>
                            <span class="toggle-description">המלצות והתראות</span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>הגדרות נוספות</h3>
                    <div class="additional-settings">
                        <label class="setting-toggle">
                            <input type="checkbox" data-setting="showWelcome" ${this.options.showWelcome ? 'checked' : ''}>
                            <span class="toggle-text">הצג הודעת ברוכים הבאים</span>
                        </label>
                        
                        <label class="setting-toggle">
                            <input type="checkbox" data-setting="showTips" ${this.options.showTips ? 'checked' : ''}>
                            <span class="toggle-text">הצג טיפים פיננסיים</span>
                        </label>
                        
                        <div class="setting-field">
                            <label for="refresh-interval">רענון אוטומטי (שניות):</label>
                            <select id="refresh-interval" data-setting="refreshInterval">
                                <option value="0" ${this.options.refreshInterval === 0 ? 'selected' : ''}>ללא רענון</option>
                                <option value="30000" ${this.options.refreshInterval === 30000 ? 'selected' : ''}>30 שניות</option>
                                <option value="60000" ${this.options.refreshInterval === 60000 ? 'selected' : ''}>דקה</option>
                                <option value="300000" ${this.options.refreshInterval === 300000 ? 'selected' : ''}>5 דקות</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    saveDashboardSettings() {
        if (!this.currentSettingsModal?.element) return;
        
        const form = this.currentSettingsModal.element.querySelector('.dashboard-settings-form');
        
        // Get layout setting
        const layoutRadio = form.querySelector('input[name="layout"]:checked');
        if (layoutRadio) {
            this.options.layout = layoutRadio.value;
        }
        
        // Get section toggles
        const sectionToggles = form.querySelectorAll('input[data-section]');
        sectionToggles.forEach(toggle => {
            const section = toggle.dataset.section;
            this.sections[section] = toggle.checked;
        });
        
        // Get additional settings
        const settingToggles = form.querySelectorAll('input[data-setting]');
        settingToggles.forEach(toggle => {
            const setting = toggle.dataset.setting;
            this.options[setting] = toggle.checked;
        });
        
        // Get refresh interval
        const refreshSelect = form.querySelector('#refresh-interval');
        if (refreshSelect) {
            this.options.refreshInterval = parseInt(refreshSelect.value);
        }
        
        // Save to localStorage
        this.saveSettingsToStorage();
        
        // Re-render dashboard with new settings
        this.applySettings();
        
        // Close modal
        this.currentSettingsModal.close();
        
        HebrewToasts?.success('הגדרות הלוח נשמרו בהצלחה', 'לוח בקרה');
    }
    
    resetDashboardSettings() {
        // Reset to defaults
        this.options = {
            showWelcome: true,
            refreshInterval: 30000,
            showTips: true,
            layout: 'auto'
        };
        
        this.sections = {
            summary: true,
            quickActions: true,
            recentTransactions: true,
            categoryBreakdown: true,
            budgetProgress: true,
            insights: true
        };
        
        // Clear localStorage
        localStorage.removeItem('dashboardSettings');
        localStorage.removeItem('dashboardSections');
        
        // Update form and re-render
        this.currentSettingsModal.element.querySelector('.dashboard-settings-form').innerHTML = 
            this.renderDashboardSettingsForm();
        
        HebrewToasts?.info('הגדרות הלוח אופסו לברירת המחדל', 'לוח בקרה');
    }
    
    saveSettingsToStorage() {
        try {
            localStorage.setItem('dashboardSettings', JSON.stringify(this.options));
            localStorage.setItem('dashboardSections', JSON.stringify(this.sections));
        } catch (error) {
            console.error('Error saving dashboard settings:', error);
            HebrewToasts?.error('שגיאה בשמירת ההגדרות', 'לוח בקרה');
        }
    }
    
    loadSettingsFromStorage() {
        try {
            const savedSettings = localStorage.getItem('dashboardSettings');
            const savedSections = localStorage.getItem('dashboardSections');
            
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.options = { ...this.options, ...settings };
            }
            
            if (savedSections) {
                const sections = JSON.parse(savedSections);
                this.sections = { ...this.sections, ...sections };
            }
        } catch (error) {
            console.error('Error loading dashboard settings:', error);
            // Continue with defaults
        }
    }
    
    applySettings() {
        // Update dashboard class for layout
        if (this.element) {
            this.element.className = `dashboard layout-${this.options.layout}`;
        }
        
        // Restart auto-refresh if needed
        if (this.options.refreshInterval > 0) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        
        // Re-render dashboard with new sections
        if (this.element && this.element.parentNode) {
            const newElement = this.render();
            this.element.parentNode.replaceChild(newElement, this.element);
        }
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