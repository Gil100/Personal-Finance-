/**
 * Hebrew Budget Management Component
 * Handles budget allocation, tracking, and management
 */
class BudgetManager {
    constructor() {
        this.currentBudget = null;
        this.categories = [];
        this.transactions = [];
        this.viewMode = 'overview'; // overview, categories, goals, analytics
        this.selectedPeriod = 'current';
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadBudgetData();
            await this.loadTransactionData();
        }
    }

    async loadBudgetData() {
        try {
            const budgets = await DataAPI.storage.getAll('budgets');
            const activeBudgets = Object.values(budgets).filter(b => b.status === 'active');
            this.currentBudget = activeBudgets.length > 0 ? activeBudgets[0] : null;
            
            if (this.currentBudget) {
                this.categories = this.currentBudget.categories || [];
            }
        } catch (error) {
            console.error('Failed to load budget data:', error);
        }
    }

    async loadTransactionData() {
        try {
            const transactions = await DataAPI.storage.getAll('transactions');
            this.transactions = Object.values(transactions);
        } catch (error) {
            console.error('Failed to load transaction data:', error);
        }
    }

    render() {
        if (!this.currentBudget) {
            return this.renderNoBudget();
        }

        return `
            <div class="budget-manager">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                ${this.renderContent()}
            </div>
        `;
    }

    renderNoBudget() {
        return `
            <div class="no-budget-state">
                <div class="no-budget-content">
                    <div class="no-budget-icon">📊</div>
                    <h2>אין תקציב פעיל</h2>
                    <p>צור את התקציב הראשון שלך כדי להתחיל לנהל את הכספים שלך</p>
                    <button type="button" class="create-budget-btn" id="create-first-budget">
                        צור תקציב חדש
                    </button>
                    
                    <div class="budget-benefits">
                        <h3>למה כדאי להשתמש בתקציב?</h3>
                        <ul class="benefits-list">
                            <li>
                                <span class="benefit-icon">💰</span>
                                <span class="benefit-text">שליטה מלאה על ההוצאות</span>
                            </li>
                            <li>
                                <span class="benefit-icon">🎯</span>
                                <span class="benefit-text">השגת יעדים פיננסיים</span>
                            </li>
                            <li>
                                <span class="benefit-icon">📈</span>
                                <span class="benefit-text">הגדלת החסכונות</span>
                            </li>
                            <li>
                                <span class="benefit-icon">😌</span>
                                <span class="benefit-text">שקט נפשי כלכלי</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderHeader() {
        const currentPeriodData = this.getCurrentPeriodData();
        const totalSpent = currentPeriodData.totalSpent;
        const totalBudget = this.currentBudget.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const remaining = totalBudget - totalSpent;
        const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return `
            <div class="budget-header">
                <div class="budget-title-section">
                    <h1 class="budget-name">${this.currentBudget.name}</h1>
                    <div class="budget-period">
                        <span class="period-label">תקופה:</span>
                        <span class="period-value">${this.formatBudgetPeriod()}</span>
                    </div>
                </div>

                <div class="budget-overview-cards">
                    <div class="overview-card total-budget">
                        <div class="card-icon">💰</div>
                        <div class="card-content">
                            <span class="card-label">סך התקציב</span>
                            <span class="card-value">₪${totalBudget.toLocaleString('he-IL')}</span>
                        </div>
                    </div>

                    <div class="overview-card spent-amount ${percentageUsed > 90 ? 'danger' : percentageUsed > 75 ? 'warning' : ''}">
                        <div class="card-icon">📤</div>
                        <div class="card-content">
                            <span class="card-label">נוצל</span>
                            <span class="card-value">₪${totalSpent.toLocaleString('he-IL')}</span>
                            <span class="card-secondary">${Math.round(percentageUsed)}%</span>
                        </div>
                    </div>

                    <div class="overview-card remaining-amount ${remaining < 0 ? 'danger' : ''}">
                        <div class="card-icon">💎</div>
                        <div class="card-content">
                            <span class="card-label">נותר</span>
                            <span class="card-value">₪${Math.abs(remaining).toLocaleString('he-IL')}</span>
                            ${remaining < 0 ? '<span class="card-secondary">חריגה</span>' : ''}
                        </div>
                    </div>

                    <div class="overview-card savings-rate">
                        <div class="card-icon">📈</div>
                        <div class="card-content">
                            <span class="card-label">קצב חיסכון</span>
                            <span class="card-value">${this.calculateSavingsRate()}%</span>
                        </div>
                    </div>
                </div>

                <div class="budget-progress-bar">
                    <div class="progress-bar large">
                        <div class="progress-fill ${percentageUsed > 100 ? 'over-budget' : ''}" 
                             style="width: ${Math.min(percentageUsed, 100)}%"></div>
                        ${percentageUsed > 100 ? `<div class="progress-overflow" style="width: ${Math.min(percentageUsed - 100, 50)}%"></div>` : ''}
                    </div>
                    <div class="progress-labels">
                        <span class="progress-used">${Math.round(percentageUsed)}% נוצל</span>
                        ${percentageUsed > 100 ? `<span class="progress-over">חריגה של ${Math.round(percentageUsed - 100)}%</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderNavigation() {
        const views = [
            { key: 'overview', label: 'סקירה כללית', icon: '📊' },
            { key: 'categories', label: 'קטגוריות', icon: '🏷️' },
            { key: 'goals', label: 'יעדים', icon: '🎯' },
            { key: 'analytics', label: 'ניתוחים', icon: '📈' }
        ];

        return `
            <nav class="budget-navigation">
                <div class="nav-tabs">
                    ${views.map(view => `
                        <button 
                            type="button" 
                            class="nav-tab ${this.viewMode === view.key ? 'active' : ''}"
                            data-view="${view.key}"
                        >
                            <span class="tab-icon">${view.icon}</span>
                            <span class="tab-label">${view.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="nav-actions">
                    <select class="period-selector" id="period-selector">
                        <option value="current" ${this.selectedPeriod === 'current' ? 'selected' : ''}>תקופה נוכחית</option>
                        <option value="last" ${this.selectedPeriod === 'last' ? 'selected' : ''}>תקופה קודמת</option>
                        <option value="year" ${this.selectedPeriod === 'year' ? 'selected' : ''}>השנה</option>
                    </select>

                    <button type="button" class="action-btn secondary" id="adjust-budget">
                        ⚙️ התאם תקציב
                    </button>

                    <button type="button" class="action-btn primary" id="add-transaction">
                        ➕ הוסף הוצאה
                    </button>
                </div>
            </nav>
        `;
    }

    renderContent() {
        switch(this.viewMode) {
            case 'overview': return this.renderOverview();
            case 'categories': return this.renderCategories();
            case 'goals': return this.renderGoals();
            case 'analytics': return this.renderAnalytics();
            default: return this.renderOverview();
        }
    }

    renderOverview() {
        return `
            <div class="budget-overview">
                ${this.renderCategorySummary()}
                ${this.renderRecentTransactions()}
                ${this.renderBudgetAlerts()}
            </div>
        `;
    }

    renderCategorySummary() {
        const currentData = this.getCurrentPeriodData();
        
        return `
            <div class="category-summary-section">
                <h2 class="section-title">התפלגות הוצאות לפי קטגוריות</h2>
                
                <div class="categories-grid">
                    ${this.categories.map(category => {
                        const spent = currentData.categorySpending[category.name] || 0;
                        const percentage = category.amount > 0 ? (spent / category.amount) * 100 : 0;
                        const status = percentage > 100 ? 'over' : percentage > 90 ? 'high' : percentage > 75 ? 'medium' : 'good';
                        
                        return `
                            <div class="category-summary-card ${status}">
                                <div class="category-header">
                                    <h3 class="category-name">${category.name}</h3>
                                    <div class="category-status">
                                        ${percentage > 100 ? '⚠️' : percentage > 90 ? '🟡' : '✅'}
                                    </div>
                                </div>
                                
                                <div class="category-amounts">
                                    <div class="amount-row">
                                        <span class="amount-label">נוצל:</span>
                                        <span class="amount-value spent">₪${spent.toLocaleString('he-IL')}</span>
                                    </div>
                                    <div class="amount-row">
                                        <span class="amount-label">תקציב:</span>
                                        <span class="amount-value budget">₪${category.amount.toLocaleString('he-IL')}</span>
                                    </div>
                                    <div class="amount-row">
                                        <span class="amount-label">נותר:</span>
                                        <span class="amount-value remaining ${category.amount - spent < 0 ? 'negative' : ''}">
                                            ₪${Math.abs(category.amount - spent).toLocaleString('he-IL')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="category-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                                    </div>
                                    <span class="progress-text">${Math.round(percentage)}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderRecentTransactions() {
        const recentTransactions = this.transactions
            .filter(t => this.isInCurrentPeriod(new Date(t.date)))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        return `
            <div class="recent-transactions-section">
                <div class="section-header">
                    <h2 class="section-title">הוצאות אחרונות</h2>
                    <button type="button" class="view-all-btn" id="view-all-transactions">
                        צפה בהכל →
                    </button>
                </div>
                
                <div class="transactions-list compact">
                    ${recentTransactions.length > 0 ? 
                        recentTransactions.map(transaction => `
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <span class="transaction-description">${transaction.description}</span>
                                    <span class="transaction-category">${transaction.category}</span>
                                </div>
                                <div class="transaction-details">
                                    <span class="transaction-amount ${transaction.type === 'expense' ? 'negative' : 'positive'}">
                                        ${transaction.type === 'expense' ? '-' : '+'}₪${Math.abs(transaction.amount).toLocaleString('he-IL')}
                                    </span>
                                    <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="empty-state">אין הוצאות בתקופה זו</div>'
                    }
                </div>
            </div>
        `;
    }

    renderBudgetAlerts() {
        const alerts = this.generateBudgetAlerts();
        
        if (alerts.length === 0) {
            return `
                <div class="budget-alerts-section">
                    <h2 class="section-title">מצב התקציב</h2>
                    <div class="alert success">
                        <div class="alert-icon">✅</div>
                        <div class="alert-content">
                            <strong>מצוין!</strong> התקציב שלך תקין ואין התראות.
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="budget-alerts-section">
                <h2 class="section-title">התראות תקציב</h2>
                <div class="alerts-container">
                    ${alerts.map(alert => `
                        <div class="alert ${alert.type}">
                            <div class="alert-icon">${alert.icon}</div>
                            <div class="alert-content">
                                <strong>${alert.title}</strong>
                                <p>${alert.message}</p>
                                ${alert.action ? `<button type="button" class="alert-action" data-action="${alert.action.type}">${alert.action.label}</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCategories() {
        return `
            <div class="budget-categories">
                <div class="categories-header">
                    <h2>ניהול קטגוריות תקציב</h2>
                    <button type="button" class="add-category-btn" id="add-budget-category">
                        ➕ הוסף קטגוריה
                    </button>
                </div>

                <div class="categories-detailed-list">
                    ${this.renderDetailedCategories()}
                </div>

                <div class="categories-actions">
                    <button type="button" class="action-btn secondary" id="rebalance-budget">
                        ⚖️ איזון תקציב
                    </button>
                    <button type="button" class="action-btn secondary" id="copy-from-template">
                        📋 העתק מתבנית
                    </button>
                </div>
            </div>
        `;
    }

    renderDetailedCategories() {
        const currentData = this.getCurrentPeriodData();
        
        return this.categories.map(category => {
            const spent = currentData.categorySpending[category.name] || 0;
            const percentage = category.amount > 0 ? (spent / category.amount) * 100 : 0;
            const remaining = category.amount - spent;
            
            return `
                <div class="detailed-category-card">
                    <div class="category-main-info">
                        <div class="category-identity">
                            <h3 class="category-name">${category.name}</h3>
                            <div class="category-edit-btn" data-category="${category.name}">✏️</div>
                        </div>
                        
                        <div class="category-amounts-detailed">
                            <div class="amount-item primary">
                                <span class="amount-label">תקציב חודשי</span>
                                <span class="amount-value">₪${category.amount.toLocaleString('he-IL')}</span>
                            </div>
                            <div class="amount-item">
                                <span class="amount-label">נוצל עד כה</span>
                                <span class="amount-value spent">₪${spent.toLocaleString('he-IL')}</span>
                            </div>
                            <div class="amount-item ${remaining < 0 ? 'danger' : ''}">
                                <span class="amount-label">${remaining < 0 ? 'חריגה' : 'נותר'}</span>
                                <span class="amount-value">₪${Math.abs(remaining).toLocaleString('he-IL')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="category-progress-detailed">
                        <div class="progress-bar large">
                            <div class="progress-fill ${percentage > 100 ? 'over-budget' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                            ${percentage > 100 ? 
                                `<div class="progress-overflow" style="width: ${Math.min(percentage - 100, 50)}%"></div>` : ''
                            }
                        </div>
                        <div class="progress-details">
                            <span class="progress-percentage">${Math.round(percentage)}%</span>
                            <span class="progress-status ${percentage > 100 ? 'over' : percentage > 90 ? 'high' : 'normal'}">
                                ${percentage > 100 ? 'חריגה מהתקציב' : 
                                  percentage > 90 ? 'קרוב לגבול' : 
                                  percentage > 75 ? 'בשימוש גבוה' : 'תקין'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="category-actions">
                        <button type="button" class="category-action-btn" data-action="view-transactions" data-category="${category.name}">
                            📊 צפה בהוצאות
                        </button>
                        <button type="button" class="category-action-btn" data-action="adjust-budget" data-category="${category.name}">
                            ⚙️ התאם תקציב
                        </button>
                        <button type="button" class="category-action-btn" data-action="set-alert" data-category="${category.name}">
                            🔔 הגדר התראה
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getCurrentPeriodData() {
        const now = new Date();
        const periodStart = this.getBudgetPeriodStart(now);
        const periodEnd = this.getBudgetPeriodEnd(periodStart);
        
        const periodTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && transactionDate <= periodEnd;
        });

        const totalSpent = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const categorySpending = {};
        periodTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
            });

        return {
            periodStart,
            periodEnd, 
            transactions: periodTransactions,
            totalSpent,
            categorySpending
        };
    }

    getBudgetPeriodStart(date) {
        const period = this.currentBudget.period;
        const startDate = new Date(date);
        
        switch(period) {
            case 'weekly':
                const dayOfWeek = startDate.getDay();
                startDate.setDate(startDate.getDate() - dayOfWeek);
                break;
            case 'monthly':
                startDate.setDate(1);
                break;
            case 'quarterly':
                const quarter = Math.floor(startDate.getMonth() / 3);
                startDate.setMonth(quarter * 3, 1);
                break;
            case 'yearly':
                startDate.setMonth(0, 1);
                break;
        }
        
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    }

    getBudgetPeriodEnd(startDate) {
        const period = this.currentBudget.period;
        const endDate = new Date(startDate);
        
        switch(period) {
            case 'weekly':
                endDate.setDate(endDate.getDate() + 6);
                break;
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1, 0);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3, 0);
                break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1, 0, 0);
                break;
        }
        
        endDate.setHours(23, 59, 59, 999);
        return endDate;
    }

    generateBudgetAlerts() {
        const alerts = [];
        const currentData = this.getCurrentPeriodData();
        
        // Check for over-budget categories
        this.categories.forEach(category => {
            const spent = currentData.categorySpending[category.name] || 0;
            const percentage = category.amount > 0 ? (spent / category.amount) * 100 : 0;
            
            if (percentage > 100) {
                alerts.push({
                    type: 'danger',
                    icon: '🚨',
                    title: 'חריגה מהתקציב',
                    message: `הקטגוריה "${category.name}" חרגה מהתקציב ב-${Math.round(percentage - 100)}%`,
                    action: { type: 'adjust-category', label: 'התאם תקציב', data: category.name }
                });
            } else if (percentage > 90) {
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'התקרבות לגבול התקציב',
                    message: `הקטגוריה "${category.name}" השתמשה ב-${Math.round(percentage)}% מהתקציב`,
                    action: { type: 'monitor-category', label: 'עקוב אחרי', data: category.name }
                });
            }
        });

        // Check overall budget status
        const totalBudget = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const overallPercentage = totalBudget > 0 ? (currentData.totalSpent / totalBudget) * 100 : 0;
        
        if (overallPercentage > 95) {
            alerts.push({
                type: 'warning',
                icon: '💸',
                title: 'התקציב הכללי כמעט נגמר',
                message: `ניצלת ${Math.round(overallPercentage)}% מהתקציב החודשי`,
                action: { type: 'review-spending', label: 'סקור הוצאות' }
            });
        }

        return alerts;
    }

    calculateSavingsRate() {
        const totalIncome = this.currentBudget.totalIncome || 0;
        const currentData = this.getCurrentPeriodData();
        const totalSpent = currentData.totalSpent;
        
        if (totalIncome === 0) return 0;
        
        const saved = totalIncome - totalSpent;
        return Math.round((saved / totalIncome) * 100);
    }

    formatBudgetPeriod() {
        const periodLabels = {
            'weekly': 'שבועי',
            'monthly': 'חודשי', 
            'quarterly': 'רבעוני',
            'yearly': 'שנתי'
        };
        
        return periodLabels[this.currentBudget.period] || 'לא מוגדר';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short'
        });
    }

    isInCurrentPeriod(date) {
        const currentData = this.getCurrentPeriodData();
        return date >= currentData.periodStart && date <= currentData.periodEnd;
    }

    attachEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.viewMode = e.target.closest('.nav-tab').dataset.view;
                this.updateDisplay();
            });
        });

        // Actions
        document.getElementById('create-first-budget')?.addEventListener('click', () => {
            this.showBudgetWizard();
        });

        document.getElementById('add-transaction')?.addEventListener('click', () => {
            this.showAddTransactionModal();
        });

        document.getElementById('adjust-budget')?.addEventListener('click', () => {
            this.showBudgetAdjustmentModal();
        });

        // Period selector
        document.getElementById('period-selector')?.addEventListener('change', (e) => {
            this.selectedPeriod = e.target.value;
            this.updateDisplay();
        });

        // Category actions
        document.querySelectorAll('.category-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const category = e.target.dataset.category;
                this.handleCategoryAction(action, category);
            });
        });
    }

    showBudgetWizard() {
        if (window.BudgetWizard) {
            const wizard = new BudgetWizard();
            const modal = window.HebrewModal.create({
                title: 'יצירת תקציב חדש',
                content: wizard.render(),
                size: 'large',
                showCloseButton: true
            });
            
            modal.show();
            wizard.attachEventListeners();
        }
    }

    updateDisplay() {
        const container = document.querySelector('.budget-manager, .no-budget-state');
        if (container) {
            container.outerHTML = this.render();
            this.attachEventListeners();
        }
    }

    handleCategoryAction(action, category) {
        switch(action) {
            case 'view-transactions':
                this.showCategoryTransactions(category);
                break;
            case 'adjust-budget':
                this.showCategoryBudgetAdjustment(category);
                break;
            case 'set-alert':
                this.showCategoryAlertSettings(category);
                break;
        }
    }

    showCategoryTransactions(category) {
        const categoryTransactions = this.transactions.filter(t => t.category === category);
        // Implementation for showing category transactions
        console.log(`Showing transactions for category: ${category}`, categoryTransactions);
    }

    showBudgetAdjustmentModal() {
        const adjustmentContent = this.renderBudgetAdjustmentModal();
        const modal = window.HebrewModal.create({
            title: 'התאמת תקציב',
            content: adjustmentContent,
            size: 'large',
            showCloseButton: true,
            actions: [
                {
                    text: 'שמור שינויים',
                    type: 'primary',
                    action: () => this.saveBudgetAdjustments()
                },
                {
                    text: 'ביטול',
                    type: 'secondary',
                    action: () => modal.hide()
                }
            ]
        });
        
        modal.show();
        this.attachAdjustmentEventListeners();
    }

    renderBudgetAdjustmentModal() {
        const totalIncome = this.currentBudget.totalIncome || 0;
        const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const unallocated = totalIncome - totalAllocated;

        return `
            <div class="budget-adjustment-content">
                <div class="adjustment-header">
                    <div class="budget-summary">
                        <div class="summary-item">
                            <span class="summary-label">הכנסה חודשית:</span>
                            <span class="summary-value income">₪${totalIncome.toLocaleString('he-IL')}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">סך מוקצה:</span>
                            <span class="summary-value allocated">₪${totalAllocated.toLocaleString('he-IL')}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">לא מוקצה:</span>
                            <span class="summary-value remaining ${unallocated < 0 ? 'negative' : ''}">
                                ₪${Math.abs(unallocated).toLocaleString('he-IL')}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="adjustment-controls">
                    <div class="control-buttons">
                        <button type="button" class="btn-secondary" id="reset-to-template">
                            איפוס לתבנית
                        </button>
                        <button type="button" class="btn-secondary" id="auto-balance">
                            איזון אוטומטי
                        </button>
                        <button type="button" class="btn-secondary" id="add-category">
                            הוסף קטגוריה
                        </button>
                    </div>
                </div>

                <div class="categories-adjustment">
                    <h3>התאמת קטגוריות</h3>
                    <div class="adjustment-list">
                        ${this.categories.map(category => this.renderCategoryAdjustment(category)).join('')}
                    </div>
                </div>

                <div class="adjustment-recommendations">
                    <h3>המלצות</h3>
                    <div class="recommendations-list">
                        ${this.generateAdjustmentRecommendations().map(rec => `
                            <div class="recommendation-item ${rec.type}">
                                <span class="recommendation-icon">${rec.icon}</span>
                                <div class="recommendation-content">
                                    <div class="recommendation-title">${rec.title}</div>
                                    <div class="recommendation-description">${rec.description}</div>
                                </div>
                                ${rec.action ? `
                                    <button type="button" class="recommendation-action" data-action="${rec.action}" data-category="${rec.category || ''}">
                                        ${rec.actionText}
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoryAdjustment(category) {
        const percentage = this.currentBudget.totalIncome > 0 ? 
            (category.amount / this.currentBudget.totalIncome * 100).toFixed(1) : 0;
        
        return `
            <div class="category-adjustment-item" data-category="${category.name}">
                <div class="category-adjustment-header">
                    <h4 class="category-name">${category.name}</h4>
                    <div class="category-actions">
                        <button type="button" class="action-btn delete-category" data-category="${category.name}" title="מחק קטגוריה">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="adjustment-inputs">
                    <div class="input-group">
                        <label for="amount-${category.name}">סכום (₪)</label>
                        <input 
                            type="number" 
                            id="amount-${category.name}" 
                            class="amount-input" 
                            value="${category.amount}" 
                            data-category="${category.name}"
                            min="0"
                            step="50"
                        >
                    </div>
                    
                    <div class="input-group">
                        <label for="percentage-${category.name}">אחוז (%)</label>
                        <input 
                            type="number" 
                            id="percentage-${category.name}" 
                            class="percentage-input" 
                            value="${percentage}" 
                            data-category="${category.name}"
                            min="0"
                            max="100"
                            step="0.5"
                        >
                    </div>
                </div>
                
                <div class="category-suggestions">
                    <div class="quick-adjustments">
                        <span class="suggestions-label">התאמות מהירות:</span>
                        <button type="button" class="quick-adjust" data-category="${category.name}" data-change="-10">-10%</button>
                        <button type="button" class="quick-adjust" data-category="${category.name}" data-change="-5">-5%</button>
                        <button type="button" class="quick-adjust" data-category="${category.name}" data-change="+5">+5%</button>
                        <button type="button" class="quick-adjust" data-category="${category.name}" data-change="+10">+10%</button>
                    </div>
                </div>
            </div>
        `;
    }

    generateAdjustmentRecommendations() {
        const recommendations = [];
        const totalIncome = this.currentBudget.totalIncome || 0;
        const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Check for over-allocation
        if (totalAllocated > totalIncome) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                title: 'תקציב חורג מההכנסה',
                description: `התקציב חורג ב-₪${(totalAllocated - totalIncome).toLocaleString('he-IL')}. צמצם הוצאות או הגדל הכנסה.`,
                action: 'auto-reduce',
                actionText: 'צמצם אוטומטית'
            });
        }
        
        // Check for under-allocation
        if (totalAllocated < totalIncome * 0.95) {
            const unallocated = totalIncome - totalAllocated;
            recommendations.push({
                type: 'info',
                icon: 'ℹ️',
                title: 'יש כסף לא מוקצה',
                description: `₪${unallocated.toLocaleString('he-IL')} לא מוקצים. שקול להגדיל חסכונות או קטגוריות אחרות.`,
                action: 'allocate-savings',
                actionText: 'הוסף לחסכונות'
            });
        }
        
        // Check for categories with unusual percentages
        this.categories.forEach(category => {
            const percentage = (category.amount / totalIncome) * 100;
            
            if (category.name === 'דיור' && percentage > 40) {
                recommendations.push({
                    type: 'warning',
                    icon: '🏠',
                    title: 'הוצאות דיור גבוהות',
                    description: `${percentage.toFixed(1)}% מההכנסה הולך לדיור. המלצה: עד 35%.`,
                    category: category.name,
                    action: 'reduce-category',
                    actionText: 'צמצם ל-35%'
                });
            }
            
            if (category.name === 'חסכונות' && percentage < 10) {
                recommendations.push({
                    type: 'info',
                    icon: '💰',
                    title: 'חסכונות נמוכים',
                    description: `רק ${percentage.toFixed(1)}% הולך לחסכונות. המלצה: לפחות 10%.`,
                    category: category.name,
                    action: 'increase-savings',
                    actionText: 'הגדל ל-10%'
                });
            }
        });
        
        return recommendations;
    }

    showCategoryBudgetAdjustment(categoryName) {
        const category = this.categories.find(c => c.name === categoryName);
        if (!category) return;
        
        const content = `
            <div class="single-category-adjustment">
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p class="category-description">${category.description || ''}</p>
                </div>
                
                ${this.renderCategoryAdjustment(category)}
                
                <div class="spending-analysis">
                    <h4>ניתוח הוצאות</h4>
                    ${this.renderCategorySpendingAnalysis(categoryName)}
                </div>
            </div>
        `;
        
        const modal = window.HebrewModal.create({
            title: `התאמת תקציב - ${categoryName}`,
            content: content,
            size: 'medium',
            showCloseButton: true,
            actions: [
                {
                    text: 'שמור',
                    type: 'primary',
                    action: () => this.saveSingleCategoryAdjustment(categoryName)
                },
                {
                    text: 'ביטול',
                    type: 'secondary',
                    action: () => modal.hide()
                }
            ]
        });
        
        modal.show();
        this.attachSingleCategoryListeners(categoryName);
    }

    renderCategorySpendingAnalysis(categoryName) {
        const categoryTransactions = this.transactions.filter(t => 
            t.category === categoryName && this.isInCurrentPeriod(new Date(t.date))
        );
        
        const totalSpent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const category = this.categories.find(c => c.name === categoryName);
        const budgetAmount = category ? category.amount : 0;
        const remaining = budgetAmount - totalSpent;
        const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
        
        return `
            <div class="spending-summary">
                <div class="spending-stats">
                    <div class="stat-item">
                        <span class="stat-label">נוצל:</span>
                        <span class="stat-value">₪${totalSpent.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">תקציב:</span>
                        <span class="stat-value">₪${budgetAmount.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">נותר:</span>
                        <span class="stat-value ${remaining < 0 ? 'negative' : ''}">
                            ₪${Math.abs(remaining).toLocaleString('he-IL')}
                        </span>
                    </div>
                </div>
                
                <div class="spending-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${percentage > 100 ? 'over-budget' : ''}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <span class="progress-percentage">${percentage.toFixed(1)}%</span>
                </div>
                
                <div class="recent-transactions">
                    <h5>הוצאות אחרונות</h5>
                    <div class="transactions-mini-list">
                        ${categoryTransactions.slice(0, 5).map(t => `
                            <div class="transaction-mini-item">
                                <span class="transaction-date">${new Date(t.date).toLocaleDateString('he-IL')}</span>
                                <span class="transaction-desc">${t.description}</span>
                                <span class="transaction-amount">₪${Math.abs(t.amount).toLocaleString('he-IL')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    attachAdjustmentEventListeners() {
        // Amount inputs
        document.querySelectorAll('.amount-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const categoryName = e.target.dataset.category;
                const amount = parseFloat(e.target.value) || 0;
                this.updateCategoryAmount(categoryName, amount);
                this.updateCategoryPercentage(categoryName, amount);
                this.updateSummary();
            });
        });
        
        // Percentage inputs
        document.querySelectorAll('.percentage-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const categoryName = e.target.dataset.category;
                const percentage = parseFloat(e.target.value) || 0;
                const amount = (this.currentBudget.totalIncome * percentage) / 100;
                this.updateCategoryAmount(categoryName, amount);
                this.updateCategoryAmountInput(categoryName, amount);
                this.updateSummary();
            });
        });
        
        // Quick adjustment buttons
        document.querySelectorAll('.quick-adjust').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryName = e.target.dataset.category;
                const change = parseFloat(e.target.dataset.change);
                this.applyQuickAdjustment(categoryName, change);
            });
        });
        
        // Control buttons
        document.getElementById('reset-to-template')?.addEventListener('click', () => {
            this.resetToTemplate();
        });
        
        document.getElementById('auto-balance')?.addEventListener('click', () => {
            this.autoBalance();
        });
        
        document.getElementById('add-category')?.addEventListener('click', () => {
            this.showAddCategoryModal();
        });
        
        // Delete category buttons
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryName = e.target.dataset.category;
                this.deleteCategory(categoryName);
            });
        });
        
        // Recommendation actions
        document.querySelectorAll('.recommendation-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const category = e.target.dataset.category;
                this.applyRecommendation(action, category);
            });
        });
    }

    updateCategoryAmount(categoryName, amount) {
        const category = this.categories.find(c => c.name === categoryName);
        if (category) {
            category.amount = amount;
        }
    }

    updateCategoryPercentage(categoryName, amount) {
        const percentage = this.currentBudget.totalIncome > 0 ? 
            (amount / this.currentBudget.totalIncome * 100).toFixed(1) : 0;
        
        const percentageInput = document.getElementById(`percentage-${categoryName}`);
        if (percentageInput) {
            percentageInput.value = percentage;
        }
    }

    updateCategoryAmountInput(categoryName, amount) {
        const amountInput = document.getElementById(`amount-${categoryName}`);
        if (amountInput) {
            amountInput.value = Math.round(amount);
        }
    }

    updateSummary() {
        const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const unallocated = this.currentBudget.totalIncome - totalAllocated;
        
        const allocatedElement = document.querySelector('.summary-value.allocated');
        const remainingElement = document.querySelector('.summary-value.remaining');
        
        if (allocatedElement) {
            allocatedElement.textContent = `₪${totalAllocated.toLocaleString('he-IL')}`;
        }
        
        if (remainingElement) {
            remainingElement.textContent = `₪${Math.abs(unallocated).toLocaleString('he-IL')}`;
            remainingElement.className = `summary-value remaining ${unallocated < 0 ? 'negative' : ''}`;
        }
    }

    applyQuickAdjustment(categoryName, changePercentage) {
        const category = this.categories.find(c => c.name === categoryName);
        if (!category || !this.currentBudget.totalIncome) return;
        
        const currentPercentage = (category.amount / this.currentBudget.totalIncome) * 100;
        const newPercentage = Math.max(0, currentPercentage + changePercentage);
        const newAmount = (this.currentBudget.totalIncome * newPercentage) / 100;
        
        this.updateCategoryAmount(categoryName, newAmount);
        this.updateCategoryAmountInput(categoryName, newAmount);
        this.updateCategoryPercentage(categoryName, newAmount);
        this.updateSummary();
    }

    autoBalance() {
        const totalIncome = this.currentBudget.totalIncome;
        const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
        
        if (totalAllocated === 0) return;
        
        // Scale all categories proportionally to fit within income
        const scaleFactor = (totalIncome * 0.95) / totalAllocated; // Leave 5% unallocated
        
        this.categories.forEach(category => {
            const newAmount = Math.round(category.amount * scaleFactor);
            this.updateCategoryAmount(category.name, newAmount);
            this.updateCategoryAmountInput(category.name, newAmount);
            this.updateCategoryPercentage(category.name, newAmount);
        });
        
        this.updateSummary();
        
        if (window.HebrewToasts) {
            HebrewToasts.show('התקציב אוזן בהצלחה', 'success');
        }
    }

    applyRecommendation(action, category) {
        const totalIncome = this.currentBudget.totalIncome;
        
        switch (action) {
            case 'auto-reduce':
                this.autoBalance();
                break;
                
            case 'allocate-savings':
                const savingsCategory = this.categories.find(c => c.name === 'חסכונות');
                if (savingsCategory) {
                    const unallocated = totalIncome - this.categories.reduce((sum, cat) => sum + cat.amount, 0);
                    this.updateCategoryAmount('חסכונות', savingsCategory.amount + unallocated);
                    this.updateCategoryAmountInput('חסכונות', savingsCategory.amount);
                    this.updateCategoryPercentage('חסכונות', savingsCategory.amount);
                }
                break;
                
            case 'reduce-category':
                if (category) {
                    const newAmount = totalIncome * 0.35; // 35% for housing
                    this.updateCategoryAmount(category, newAmount);
                    this.updateCategoryAmountInput(category, newAmount);
                    this.updateCategoryPercentage(category, newAmount);
                }
                break;
                
            case 'increase-savings':
                const newSavingsAmount = totalIncome * 0.10; // 10% for savings
                this.updateCategoryAmount('חסכונות', newSavingsAmount);
                this.updateCategoryAmountInput('חסכונות', newSavingsAmount);
                this.updateCategoryPercentage('חסכונות', newSavingsAmount);
                break;
        }
        
        this.updateSummary();
    }

    saveBudgetAdjustments() {
        if (!this.currentBudget || !window.DataAPI) return;
        
        try {
            // Update the budget with new category amounts
            this.currentBudget.categories = [...this.categories];
            this.currentBudget.updatedAt = new Date().toISOString();
            
            // Save to storage
            DataAPI.storage.save('budgets', this.currentBudget.id, this.currentBudget);
            
            if (window.HebrewToasts) {
                HebrewToasts.show('התקציב עודכן בהצלחה', 'success');
            }
            
            // Close modal and refresh display
            document.querySelector('.modal')?.remove();
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to save budget adjustments:', error);
            if (window.HebrewToasts) {
                HebrewToasts.show('שגיאה בשמירת התקציב', 'error');
            }
        }
    }

    resetToTemplate() {
        if (!this.currentBudget.selectedTemplate || !window.israeliBudgetTemplates) return;
        
        const template = israeliBudgetTemplates.getTemplate(this.currentBudget.selectedTemplate);
        if (template) {
            const appliedTemplate = israeliBudgetTemplates.applyTemplate(
                this.currentBudget.selectedTemplate, 
                this.currentBudget.totalIncome
            );
            
            this.categories = appliedTemplate.categories.map(cat => ({
                name: cat.name,
                amount: cat.amount,
                percentage: cat.percentage,
                description: cat.description
            }));
            
            // Update all inputs
            this.categories.forEach(category => {
                this.updateCategoryAmountInput(category.name, category.amount);
                this.updateCategoryPercentage(category.name, category.amount);
            });
            
            this.updateSummary();
            
            if (window.HebrewToasts) {
                HebrewToasts.show('התקציב אופס לתבנית המקורית', 'success');
            }
        }
    }

    deleteCategory(categoryName) {
        if (this.categories.length <= 3) {
            if (window.HebrewToasts) {
                HebrewToasts.show('לא ניתן למחוק - חייבות להיות לפחות 3 קטגוריות', 'warning');
            }
            return;
        }
        
        const categoryIndex = this.categories.findIndex(c => c.name === categoryName);
        if (categoryIndex > -1) {
            this.categories.splice(categoryIndex, 1);
            
            // Remove the category element from DOM
            const categoryElement = document.querySelector(`[data-category="${categoryName}"]`);
            if (categoryElement) {
                categoryElement.remove();
            }
            
            this.updateSummary();
            
            if (window.HebrewToasts) {
                HebrewToasts.show(`קטגוריית "${categoryName}" נמחקה`, 'success');
            }
        }
    }

    showAddCategoryModal() {
        const content = `
            <div class="add-category-form">
                <div class="form-group">
                    <label for="new-category-name">שם הקטגוריה</label>
                    <input type="text" id="new-category-name" class="form-input" placeholder="לדוגמה: בילוי">
                </div>
                
                <div class="form-group">
                    <label for="new-category-amount">סכום חודשי (₪)</label>
                    <input type="number" id="new-category-amount" class="form-input" min="0" step="50" placeholder="500">
                </div>
                
                <div class="form-group">
                    <label for="new-category-description">תיאור (אופציונלי)</label>
                    <input type="text" id="new-category-description" class="form-input" placeholder="הוצאות בילוי וקניות אישיות">
                </div>
            </div>
        `;
        
        const modal = window.HebrewModal.create({
            title: 'הוספת קטגוריה חדשה',
            content: content,
            size: 'medium',
            showCloseButton: true,
            actions: [
                {
                    text: 'הוסף',
                    type: 'primary',
                    action: () => this.addNewCategory()
                },
                {
                    text: 'ביטול',
                    type: 'secondary',
                    action: () => modal.hide()
                }
            ]
        });
        
        modal.show();
    }

    addNewCategory() {
        const name = document.getElementById('new-category-name')?.value.trim();
        const amount = parseFloat(document.getElementById('new-category-amount')?.value) || 0;
        const description = document.getElementById('new-category-description')?.value.trim();
        
        if (!name) {
            if (window.HebrewToasts) {
                HebrewToasts.show('נא להזין שם קטגוריה', 'warning');
            }
            return;
        }
        
        if (this.categories.some(c => c.name === name)) {
            if (window.HebrewToasts) {
                HebrewToasts.show('קטגוריה זו כבר קיימת', 'warning');
            }
            return;
        }
        
        const newCategory = {
            name,
            amount,
            description,
            percentage: this.currentBudget.totalIncome > 0 ? (amount / this.currentBudget.totalIncome * 100) : 0
        };
        
        this.categories.push(newCategory);
        
        // Add to DOM
        const adjustmentList = document.querySelector('.adjustment-list');
        if (adjustmentList) {
            adjustmentList.insertAdjacentHTML('beforeend', this.renderCategoryAdjustment(newCategory));
            this.attachAdjustmentEventListeners();
        }
        
        this.updateSummary();
        
        if (window.HebrewToasts) {
            HebrewToasts.show(`קטגוריית "${name}" נוספה`, 'success');
        }
        
        // Close modal
        document.querySelector('.modal')?.remove();
    }

    attachSingleCategoryListeners(categoryName) {
        this.attachAdjustmentEventListeners();
    }

    saveSingleCategoryAdjustment(categoryName) {
        this.saveBudgetAdjustments();
    }

    showCategoryAlertSettings(category) {
        // Placeholder for category alert settings
        console.log(`Setting alerts for category: ${category}`);
        if (window.HebrewToasts) {
            HebrewToasts.show('התראות קטגוריה יוטמעו בעתיד', 'info');
        }
    }
}

// Export for use in other components
window.BudgetManager = BudgetManager;