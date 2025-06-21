/**
 * Hebrew Budget Alerts and Notifications Component
 * Real-time Hebrew notifications for budget management
 */
class BudgetAlerts {
    constructor() {
        this.alertQueue = [];
        this.activeAlerts = [];
        this.alertSettings = {
            soundEnabled: true,
            toastEnabled: true,
            emailEnabled: false,
            pushEnabled: false
        };
        this.alertRules = this.getDefaultAlertRules();
        this.loadSettings();
        this.initializeAlertSystem();
    }

    getDefaultAlertRules() {
        return {
            'budget-exceeded': {
                id: 'budget-exceeded',
                name: 'חריגה מתקציב',
                description: 'התראה כאשר חורגים מתקציב קטגוריה',
                enabled: true,
                threshold: 100,
                frequency: 'immediate',
                priority: 'high',
                sound: 'alert',
                message: 'חרגת מתקציב הקטגוריה "{category}" ב-{percentage}%'
            },
            'approaching-limit': {
                id: 'approaching-limit',
                name: 'התקרבות לגבול',
                description: 'התראה כאשר מתקרבים לגבול התקציב',
                enabled: true,
                threshold: 80,
                frequency: 'once-per-period',
                priority: 'medium',
                sound: 'notification',
                message: 'השתמשת ב-{percentage}% מתקציב "{category}"'
            },
            'high-spending-day': {
                id: 'high-spending-day',
                name: 'יום הוצאות גבוהות',
                description: 'התראה ביום עם הוצאות גבוהות מהרגיל',
                enabled: true,
                threshold: 150,
                frequency: 'daily',
                priority: 'medium',
                sound: 'gentle',
                message: 'הוצאות היום גבוהות מהמתוכנן ב-{amount}₪'
            },
            'monthly-review': {
                id: 'monthly-review',
                name: 'סיכום חודשי',
                description: 'התראה לסיכום ביצועי התקציב',
                enabled: true,
                threshold: 0,
                frequency: 'monthly',
                priority: 'low',
                sound: 'none',
                message: 'זמן לסקור את ביצועי התקציב החודשי'
            },
            'goal-achievement': {
                id: 'goal-achievement',
                name: 'השגת יעד',
                description: 'התראה כאשר מגיעים ליעד חיסכון',
                enabled: true,
                threshold: 100,
                frequency: 'immediate',
                priority: 'high',
                sound: 'success',
                message: 'כל הכבוד! הגעת ליעד "{goal}" 🎉'
            },
            'unusual-spending': {
                id: 'unusual-spending',
                name: 'הוצאה חריגה',
                description: 'התראה על הוצאה גדולה וחריגה',
                enabled: true,
                threshold: 500, // Amount in ILS
                frequency: 'immediate',
                priority: 'medium',
                sound: 'notification',
                message: 'הוצאה גדולה של {amount}₪ בקטגוריה "{category}"'
            },
            'low-balance': {
                id: 'low-balance',
                name: 'יתרה נמוכה',
                description: 'התראה כאשר יתרת החשבון נמוכה',
                enabled: false,
                threshold: 1000,
                frequency: 'daily',
                priority: 'high',
                sound: 'alert',
                message: 'יתרת החשבון נמוכה: {balance}₪'
            },
            'savings-milestone': {
                id: 'savings-milestone',
                name: 'אבן דרך בחיסכון',
                description: 'התראה על הגעה לאבן דרך בחיסכון',
                enabled: true,
                threshold: 10000,
                frequency: 'milestone',
                priority: 'medium',
                sound: 'success',
                message: 'מזל טוב! חסכת {amount}₪ 💰'
            }
        };
    }

    async loadSettings() {
        if (window.DataAPI) {
            try {
                const settings = await DataAPI.storage.get('settings', 'budget-alerts');
                if (settings) {
                    this.alertSettings = { ...this.alertSettings, ...settings.alertSettings };
                    this.alertRules = { ...this.alertRules, ...settings.alertRules };
                }
            } catch (error) {
                console.error('Failed to load alert settings:', error);
            }
        }
    }

    async saveSettings() {
        if (window.DataAPI) {
            try {
                await DataAPI.storage.save('settings', 'budget-alerts', {
                    alertSettings: this.alertSettings,
                    alertRules: this.alertRules,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to save alert settings:', error);
            }
        }
    }

    initializeAlertSystem() {
        // Check for existing conditions on initialization
        this.checkAllAlertConditions();
        
        // Set up periodic checks
        this.startPeriodicChecks();
        
        // Listen for transaction events
        if (window.addEventListener) {
            window.addEventListener('transaction-added', (event) => {
                this.handleTransactionEvent(event.detail);
            });
            
            window.addEventListener('budget-updated', (event) => {
                this.handleBudgetEvent(event.detail);
            });
        }
    }

    startPeriodicChecks() {
        // Check every 5 minutes for various alert conditions
        setInterval(() => {
            this.checkAllAlertConditions();
        }, 5 * 60 * 1000);

        // Daily checks at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.checkDailyAlerts();
            // Then check daily at midnight
            setInterval(() => {
                this.checkDailyAlerts();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    async checkAllAlertConditions() {
        if (!window.DataAPI) return;

        try {
            const budgets = await DataAPI.storage.getAll('budgets');
            const transactions = await DataAPI.storage.getAll('transactions');
            
            const activeBudgets = Object.values(budgets).filter(b => b.status === 'active');
            const allTransactions = Object.values(transactions);

            for (const budget of activeBudgets) {
                await this.checkBudgetAlerts(budget, allTransactions);
            }
        } catch (error) {
            console.error('Failed to check alert conditions:', error);
        }
    }

    async checkBudgetAlerts(budget, transactions) {
        const currentPeriodData = this.getCurrentPeriodData(budget, transactions);
        
        // Check budget exceeded alerts
        this.checkBudgetExceededAlerts(budget, currentPeriodData);
        
        // Check approaching limit alerts
        this.checkApproachingLimitAlerts(budget, currentPeriodData);
        
        // Check unusual spending alerts
        this.checkUnusualSpendingAlerts(budget, currentPeriodData);
        
        // Check high spending day alerts
        this.checkHighSpendingDayAlerts(budget, currentPeriodData);
    }

    checkBudgetExceededAlerts(budget, periodData) {
        const rule = this.alertRules['budget-exceeded'];
        if (!rule.enabled) return;

        budget.categories.forEach(category => {
            const spent = periodData.categorySpending[category.name] || 0;
            const percentage = category.amount > 0 ? (spent / category.amount) * 100 : 0;
            
            if (percentage >= rule.threshold) {
                const alertId = `budget-exceeded-${category.name}-${this.getCurrentPeriodId(budget)}`;
                
                if (!this.hasRecentAlert(alertId)) {
                    this.createAlert({
                        id: alertId,
                        type: 'budget-exceeded',
                        category: category.name,
                        budget: budget.name,
                        percentage: Math.round(percentage),
                        amount: spent,
                        budgetAmount: category.amount,
                        priority: rule.priority,
                        message: rule.message
                            .replace('{category}', category.name)
                            .replace('{percentage}', Math.round(percentage - 100)),
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    checkApproachingLimitAlerts(budget, periodData) {
        const rule = this.alertRules['approaching-limit'];
        if (!rule.enabled) return;

        budget.categories.forEach(category => {
            const spent = periodData.categorySpending[category.name] || 0;
            const percentage = category.amount > 0 ? (spent / category.amount) * 100 : 0;
            
            if (percentage >= rule.threshold && percentage < 100) {
                const alertId = `approaching-limit-${category.name}-${this.getCurrentPeriodId(budget)}`;
                
                if (!this.hasRecentAlert(alertId)) {
                    this.createAlert({
                        id: alertId,
                        type: 'approaching-limit',
                        category: category.name,
                        budget: budget.name,
                        percentage: Math.round(percentage),
                        amount: spent,
                        budgetAmount: category.amount,
                        priority: rule.priority,
                        message: rule.message
                            .replace('{category}', category.name)
                            .replace('{percentage}', Math.round(percentage)),
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    checkUnusualSpendingAlerts(budget, periodData) {
        const rule = this.alertRules['unusual-spending'];
        if (!rule.enabled) return;

        const recentTransactions = periodData.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            return transactionDate >= oneDayAgo && t.type === 'expense';
        });

        recentTransactions.forEach(transaction => {
            if (Math.abs(transaction.amount) >= rule.threshold) {
                const alertId = `unusual-spending-${transaction.id}`;
                
                if (!this.hasRecentAlert(alertId)) {
                    this.createAlert({
                        id: alertId,
                        type: 'unusual-spending',
                        category: transaction.category,
                        amount: Math.abs(transaction.amount),
                        transaction: transaction,
                        priority: rule.priority,
                        message: rule.message
                            .replace('{amount}', Math.abs(transaction.amount).toLocaleString('he-IL'))
                            .replace('{category}', transaction.category),
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    checkHighSpendingDayAlerts(budget, periodData) {
        const rule = this.alertRules['high-spending-day'];
        if (!rule.enabled) return;

        const today = new Date().toDateString();
        const todaySpending = periodData.dailySpending[today] || 0;
        const avgDailyBudget = periodData.totalBudget / periodData.daysInPeriod;
        const thresholdAmount = avgDailyBudget * (rule.threshold / 100);

        if (todaySpending >= thresholdAmount) {
            const alertId = `high-spending-day-${today}`;
            
            if (!this.hasRecentAlert(alertId)) {
                this.createAlert({
                    id: alertId,
                    type: 'high-spending-day',
                    date: today,
                    amount: todaySpending - avgDailyBudget,
                    todaySpending: todaySpending,
                    avgDailyBudget: avgDailyBudget,
                    priority: rule.priority,
                    message: rule.message
                        .replace('{amount}', Math.round(todaySpending - avgDailyBudget).toLocaleString('he-IL')),
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    createAlert(alertData) {
        const alert = {
            ...alertData,
            id: alertData.id || `alert-${Date.now()}`,
            read: false,
            dismissed: false,
            actions: this.getAlertActions(alertData.type)
        };

        this.activeAlerts.push(alert);
        this.alertQueue.push(alert);
        
        // Save alert to storage
        this.saveAlert(alert);
        
        // Show alert based on settings
        this.showAlert(alert);
        
        // Trigger event for other components
        this.triggerAlertEvent(alert);
        
        return alert;
    }

    getAlertActions(alertType) {
        const actions = {
            'budget-exceeded': [
                { type: 'adjust-budget', label: 'התאם תקציב', primary: true },
                { type: 'view-spending', label: 'צפה בהוצאות', primary: false },
                { type: 'dismiss', label: 'התעלם', primary: false }
            ],
            'approaching-limit': [
                { type: 'monitor-spending', label: 'עקוב אחרי', primary: true },
                { type: 'view-details', label: 'פרטים', primary: false },
                { type: 'dismiss', label: 'התעלם', primary: false }
            ],
            'unusual-spending': [
                { type: 'categorize', label: 'סווג מחדש', primary: true },
                { type: 'split-transaction', label: 'פצל עסקה', primary: false },
                { type: 'dismiss', label: 'אישור', primary: false }
            ],
            'high-spending-day': [
                { type: 'review-transactions', label: 'סקור הוצאות', primary: true },
                { type: 'set-daily-limit', label: 'הגדר מגבלה יומית', primary: false },
                { type: 'dismiss', label: 'הבנתי', primary: false }
            ],
            'goal-achievement': [
                { type: 'celebrate', label: 'חגוג! 🎉', primary: true },
                { type: 'set-new-goal', label: 'יעד חדש', primary: false },
                { type: 'dismiss', label: 'סגור', primary: false }
            ]
        };

        return actions[alertType] || [
            { type: 'dismiss', label: 'סגור', primary: true }
        ];
    }

    showAlert(alert) {
        if (!this.alertSettings.toastEnabled) return;

        const rule = this.alertRules[alert.type];
        if (!rule) return;

        // Play sound if enabled
        if (this.alertSettings.soundEnabled && rule.sound !== 'none') {
            this.playAlertSound(rule.sound);
        }

        // Show toast notification
        if (window.HebrewToasts) {
            const toastType = this.getToastType(alert.priority);
            const toast = HebrewToasts.show(alert.message, toastType, {
                duration: alert.priority === 'high' ? 0 : 8000, // High priority stays until dismissed
                actions: alert.actions.slice(0, 2) // Show max 2 actions in toast
            });

            // Handle toast actions
            toast.onAction = (actionType) => {
                this.handleAlertAction(alert.id, actionType);
            };
        }

        // Show in-app notification for high priority alerts
        if (alert.priority === 'high') {
            this.showInAppNotification(alert);
        }
    }

    showInAppNotification(alert) {
        const notification = document.createElement('div');
        notification.className = `budget-notification priority-${alert.priority}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="notification-message">
                    <h4>${this.getAlertTitle(alert.type)}</h4>
                    <p>${alert.message}</p>
                </div>
                <div class="notification-actions">
                    ${alert.actions.map(action => `
                        <button type="button" class="notification-action ${action.primary ? 'primary' : 'secondary'}"
                                data-action="${action.type}" data-alert="${alert.id}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Handle actions
        notification.querySelectorAll('.notification-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionType = e.target.dataset.action;
                const alertId = e.target.dataset.alert;
                this.handleAlertAction(alertId, actionType);
                this.removeNotification(notification);
            });
        });

        // Auto remove after 30 seconds for non-critical alerts
        if (alert.priority !== 'high') {
            setTimeout(() => {
                if (notification.parentNode) {
                    this.removeNotification(notification);
                }
            }, 30000);
        }
    }

    removeNotification(notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getAlertIcon(alertType) {
        const icons = {
            'budget-exceeded': '🚨',
            'approaching-limit': '⚠️',
            'unusual-spending': '💳',
            'high-spending-day': '📈',
            'goal-achievement': '🎯',
            'savings-milestone': '💰',
            'low-balance': '💸',
            'monthly-review': '📊'
        };
        return icons[alertType] || '💡';
    }

    getAlertTitle(alertType) {
        const titles = {
            'budget-exceeded': 'חריגה מתקציב',
            'approaching-limit': 'התקרבות לגבול',
            'unusual-spending': 'הוצאה חריגה',
            'high-spending-day': 'יום הוצאות גבוהות',
            'goal-achievement': 'השגת יעד!',
            'savings-milestone': 'אבן דרך בחיסכון!',
            'low-balance': 'יתרה נמוכה',
            'monthly-review': 'סיכום חודשי'
        };
        return titles[alertType] || 'התראה';
    }

    getToastType(priority) {
        const types = {
            'high': 'error',
            'medium': 'warning',
            'low': 'info'
        };
        return types[priority] || 'info';
    }

    playAlertSound(soundType) {
        // Implementation would play appropriate sound
        // For now, just log
        console.log(`Playing alert sound: ${soundType}`);
    }

    handleAlertAction(alertId, actionType) {
        const alert = this.activeAlerts.find(a => a.id === alertId);
        if (!alert) return;

        switch(actionType) {
            case 'dismiss':
                this.dismissAlert(alertId);
                break;
            case 'adjust-budget':
                this.openBudgetAdjustment(alert);
                break;
            case 'view-spending':
                this.openSpendingView(alert);
                break;
            case 'monitor-spending':
                this.enableSpendingMonitor(alert);
                break;
            case 'categorize':
                this.openTransactionCategorization(alert);
                break;
            case 'review-transactions':
                this.openTransactionReview(alert);
                break;
            case 'celebrate':
                this.showCelebration(alert);
                break;
            case 'set-new-goal':
                this.openGoalSetting(alert);
                break;
        }

        // Mark alert as read
        this.markAlertAsRead(alertId);
    }

    dismissAlert(alertId) {
        const alert = this.activeAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.dismissed = true;
            alert.dismissedAt = new Date().toISOString();
            this.saveAlert(alert);
        }
    }

    markAlertAsRead(alertId) {
        const alert = this.activeAlerts.find(a => a.id === alertId);
        if (alert && !alert.read) {
            alert.read = true;
            alert.readAt = new Date().toISOString();
            this.saveAlert(alert);
        }
    }

    async saveAlert(alert) {
        if (window.DataAPI) {
            try {
                await DataAPI.storage.save('alerts', alert.id, alert);
            } catch (error) {
                console.error('Failed to save alert:', error);
            }
        }
    }

    hasRecentAlert(alertId) {
        return this.activeAlerts.some(alert => 
            alert.id === alertId && !alert.dismissed
        );
    }

    getCurrentPeriodData(budget, transactions) {
        // Implementation similar to BudgetTracker
        const now = new Date();
        const periodStart = this.getBudgetPeriodStart(budget, now);
        const periodEnd = this.getBudgetPeriodEnd(budget, periodStart);
        
        const periodTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && 
                   transactionDate <= periodEnd;
        });

        const categorySpending = {};
        const dailySpending = {};
        
        periodTransactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                const category = transaction.category;
                const amount = Math.abs(transaction.amount);
                const date = new Date(transaction.date).toDateString();
                
                categorySpending[category] = (categorySpending[category] || 0) + amount;
                dailySpending[date] = (dailySpending[date] || 0) + amount;
            });

        return {
            periodStart,
            periodEnd,
            transactions: periodTransactions,
            categorySpending,
            dailySpending,
            totalBudget: budget.categories.reduce((sum, cat) => sum + cat.amount, 0),
            daysInPeriod: Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24))
        };
    }

    getCurrentPeriodId(budget) {
        const now = new Date();
        const periodStart = this.getBudgetPeriodStart(budget, now);
        return `${budget.period}-${periodStart.getFullYear()}-${periodStart.getMonth()}-${periodStart.getDate()}`;
    }

    getBudgetPeriodStart(budget, date) {
        // Implementation matches other budget components
        const period = budget.period;
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

    getBudgetPeriodEnd(budget, startDate) {
        // Implementation matches other budget components
        const period = budget.period;
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

    triggerAlertEvent(alert) {
        if (window.dispatchEvent) {
            const event = new CustomEvent('budget-alert', {
                detail: alert
            });
            window.dispatchEvent(event);
        }
    }

    handleTransactionEvent(transactionData) {
        // Check if this transaction triggers any alerts
        setTimeout(() => {
            this.checkAllAlertConditions();
        }, 100); // Small delay to ensure transaction is saved
    }

    handleBudgetEvent(budgetData) {
        // Recheck all conditions when budget is updated
        setTimeout(() => {
            this.checkAllAlertConditions();
        }, 100);
    }

    checkDailyAlerts() {
        // Check for daily alerts like monthly review
        const rule = this.alertRules['monthly-review'];
        if (rule.enabled) {
            const today = new Date();
            const isLastDayOfMonth = today.getDate() === new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            
            if (isLastDayOfMonth) {
                const alertId = `monthly-review-${today.getFullYear()}-${today.getMonth()}`;
                
                if (!this.hasRecentAlert(alertId)) {
                    this.createAlert({
                        id: alertId,
                        type: 'monthly-review',
                        month: today.getMonth(),
                        year: today.getFullYear(),
                        priority: rule.priority,
                        message: rule.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
    }

    // Placeholder methods for alert actions
    openBudgetAdjustment(alert) {
        console.log('Opening budget adjustment for:', alert);
    }

    openSpendingView(alert) {
        console.log('Opening spending view for:', alert);
    }

    enableSpendingMonitor(alert) {
        console.log('Enabling spending monitor for:', alert);
    }

    openTransactionCategorization(alert) {
        console.log('Opening transaction categorization for:', alert);
    }

    openTransactionReview(alert) {
        console.log('Opening transaction review for:', alert);
    }

    showCelebration(alert) {
        if (window.HebrewToasts) {
            HebrewToasts.show('🎉 כל הכבוד על הישג המעולה! 🎉', 'success', { duration: 5000 });
        }
    }

    openGoalSetting(alert) {
        console.log('Opening goal setting for:', alert);
    }

    // Public API methods
    getActiveAlerts() {
        return this.activeAlerts.filter(a => !a.dismissed);
    }

    getUnreadAlerts() {
        return this.activeAlerts.filter(a => !a.read && !a.dismissed);
    }

    getAllAlerts() {
        return this.activeAlerts;
    }

    updateAlertSettings(newSettings) {
        this.alertSettings = { ...this.alertSettings, ...newSettings };
        this.saveSettings();
    }

    updateAlertRule(ruleId, newRule) {
        if (this.alertRules[ruleId]) {
            this.alertRules[ruleId] = { ...this.alertRules[ruleId], ...newRule };
            this.saveSettings();
        }
    }

    render() {
        return `
            <div class="budget-alerts-manager">
                ${this.renderActiveAlerts()}
                ${this.renderAlertSettings()}
            </div>
        `;
    }

    renderActiveAlerts() {
        const activeAlerts = this.getActiveAlerts();
        
        if (activeAlerts.length === 0) {
            return `
                <div class="no-alerts">
                    <div class="no-alerts-icon">✅</div>
                    <h3>אין התראות פעילות</h3>
                    <p>כל התקציבים שלך תקינים</p>
                </div>
            `;
        }

        return `
            <div class="active-alerts-section">
                <h2>התראות פעילות (${activeAlerts.length})</h2>
                <div class="alerts-list">
                    ${activeAlerts.map(alert => this.renderAlert(alert)).join('')}
                </div>
            </div>
        `;
    }

    renderAlert(alert) {
        return `
            <div class="alert-item priority-${alert.priority} ${alert.read ? 'read' : 'unread'}">
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <h4>${this.getAlertTitle(alert.type)}</h4>
                    <p>${alert.message}</p>
                    <span class="alert-time">${this.formatAlertTime(alert.timestamp)}</span>
                </div>
                <div class="alert-actions">
                    ${alert.actions.map(action => `
                        <button type="button" class="alert-action-btn ${action.primary ? 'primary' : 'secondary'}"
                                data-action="${action.type}" data-alert="${alert.id}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAlertSettings() {
        return `
            <div class="alert-settings-section">
                <h2>הגדרות התראות</h2>
                <!-- Alert settings UI would go here -->
                <p>הגדרות התראות יישמו בגרסה עתידית</p>
            </div>
        `;
    }

    formatAlertTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'עכשיו';
        if (diffMins < 60) return `לפני ${diffMins} דקות`;
        if (diffHours < 24) return `לפני ${diffHours} שעות`;
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        
        return date.toLocaleDateString('he-IL');
    }
}

// Export for use in other components
window.BudgetAlerts = BudgetAlerts;