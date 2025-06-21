/**
 * Hebrew Budget vs Actual Spending Tracker Component
 * Real-time tracking and comparison of budget vs actual spending
 */
class BudgetTracker {
    constructor() {
        this.trackingData = {};
        this.alertThresholds = {
            warning: 75, // Show warning at 75% of budget used
            danger: 90,  // Show danger at 90% of budget used
            critical: 100 // Show critical when over budget
        };
        this.trackingInterval = null;
        this.notifications = [];
        this.initializeTracking();
    }

    async initializeTracking() {
        await this.loadTrackingData();
        this.startRealTimeTracking();
    }

    async loadTrackingData() {
        if (window.DataAPI) {
            try {
                // Load budgets and transactions
                const budgets = await DataAPI.storage.getAll('budgets');
                const transactions = await DataAPI.storage.getAll('transactions');
                
                const activeBudgets = Object.values(budgets).filter(b => b.status === 'active');
                
                if (activeBudgets.length > 0) {
                    this.currentBudget = activeBudgets[0];
                    this.transactions = Object.values(transactions);
                    this.calculateTrackingData();
                }
            } catch (error) {
                console.error('Failed to load tracking data:', error);
            }
        }
    }

    calculateTrackingData() {
        if (!this.currentBudget) return;

        const now = new Date();
        const periodStart = this.getBudgetPeriodStart(now);
        const periodEnd = this.getBudgetPeriodEnd(periodStart);
        const daysInPeriod = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((now - periodStart) / (1000 * 60 * 60 * 24));
        const periodProgress = Math.min(daysPassed / daysInPeriod, 1);

        // Calculate actual spending by category
        const periodTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && 
                   transactionDate <= periodEnd && 
                   t.type === 'expense';
        });

        const actualSpending = {};
        const dailySpending = {};
        
        periodTransactions.forEach(transaction => {
            const category = transaction.category;
            const amount = Math.abs(transaction.amount);
            const date = new Date(transaction.date).toDateString();
            
            actualSpending[category] = (actualSpending[category] || 0) + amount;
            
            if (!dailySpending[date]) dailySpending[date] = {};
            dailySpending[date][category] = (dailySpending[date][category] || 0) + amount;
        });

        // Calculate expected spending based on time progress
        const expectedSpending = {};
        const projectedSpending = {};
        const categoryAlerts = {};

        this.currentBudget.categories.forEach(category => {
            const budgetAmount = category.amount;
            const actualAmount = actualSpending[category.name] || 0;
            const expectedAmount = budgetAmount * periodProgress;
            
            // Calculate projected spending for end of period
            const dailyAverage = daysPassed > 0 ? actualAmount / daysPassed : 0;
            const projected = dailyAverage * daysInPeriod;
            
            expectedSpending[category.name] = expectedAmount;
            projectedSpending[category.name] = projected;
            
            // Calculate usage percentage
            const usagePercentage = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
            const projectedPercentage = budgetAmount > 0 ? (projected / budgetAmount) * 100 : 0;
            
            // Generate alerts
            categoryAlerts[category.name] = this.generateCategoryAlerts(
                category.name, 
                budgetAmount, 
                actualAmount, 
                projected, 
                usagePercentage, 
                projectedPercentage,
                periodProgress
            );
        });

        this.trackingData = {
            periodStart,
            periodEnd,
            daysInPeriod,
            daysPassed,
            periodProgress,
            actualSpending,
            expectedSpending,
            projectedSpending,
            categoryAlerts,
            dailySpending,
            totalActual: Object.values(actualSpending).reduce((sum, amount) => sum + amount, 0),
            totalBudget: this.currentBudget.categories.reduce((sum, cat) => sum + cat.amount, 0)
        };

        this.checkForNewAlerts();
    }

    generateCategoryAlerts(categoryName, budget, actual, projected, usagePercentage, projectedPercentage, periodProgress) {
        const alerts = [];
        
        // Over budget alert
        if (usagePercentage >= this.alertThresholds.critical) {
            alerts.push({
                type: 'critical',
                level: 'danger',
                icon: '🚨',
                title: 'חריגה מהתקציב',
                message: `הקטגוריה "${categoryName}" חרגה מהתקציב ב-${Math.round(usagePercentage - 100)}%`,
                suggestion: 'שקול להפחית הוצאות בקטגוריה זו או להעביר תקציב מקטגוריות אחרות',
                action: 'adjust-budget'
            });
        }
        // High usage alert
        else if (usagePercentage >= this.alertThresholds.danger) {
            alerts.push({
                type: 'high-usage',
                level: 'warning',
                icon: '⚠️',
                title: 'שימוש גבוה בתקציב',
                message: `הקטגוריה "${categoryName}" השתמשה ב-${Math.round(usagePercentage)}% מהתקציב`,
                suggestion: 'עקוב היטב על ההוצאות בקטגוריה זו להימנעות מחריגה',
                action: 'monitor-spending'
            });
        }
        // Approaching limit alert
        else if (usagePercentage >= this.alertThresholds.warning) {
            alerts.push({
                type: 'approaching-limit',
                level: 'info',
                icon: '💡',
                title: 'התקרבות לגבול התקציב',
                message: `הקטגוריה "${categoryName}" השתמשה ב-${Math.round(usagePercentage)}% מהתקציב`,
                suggestion: 'תכנן את ההוצאות הבאות בקטגוריה זו בזהירות',
                action: 'review-upcoming'
            });
        }

        // Projected overspending alert
        if (projectedPercentage > 110 && usagePercentage < this.alertThresholds.critical) {
            alerts.push({
                type: 'projected-overspend',
                level: 'warning',
                icon: '📈',
                title: 'צפוי חריגה מהתקציב',
                message: `בקצב הנוכחי, הקטגוריה "${categoryName}" תחרוג ב- ${Math.round(projectedPercentage - 100)}%`,
                suggestion: 'הפחת את קצב ההוצאות כדי להישאר במסגרת התקציב',
                action: 'reduce-spending'
            });
        }

        // Slow spending (potential savings)
        if (periodProgress > 0.5 && usagePercentage < 30) {
            alerts.push({
                type: 'slow-spending',
                level: 'success',
                icon: '💰',
                title: 'חיסכון פוטנציאלי',
                message: `הקטגוריה "${categoryName}" בשימוש נמוך (${Math.round(usagePercentage)}%)`,
                suggestion: 'שקול להעביר חלק מהתקציב לקטגוריות אחרות או לחיסכון',
                action: 'reallocate-budget'
            });
        }

        return alerts;
    }

    render() {
        if (!this.currentBudget || !this.trackingData) {
            return this.renderNoData();
        }

        return `
            <div class="budget-tracker">
                ${this.renderHeader()}
                ${this.renderOverallProgress()}
                ${this.renderCategoryTracking()}
                ${this.renderSpendingTrends()}
                ${this.renderAlerts()}
            </div>
        `;
    }

    renderNoData() {
        return `
            <div class="no-tracking-data">
                <div class="no-data-content">
                    <div class="no-data-icon">📊</div>
                    <h2>אין נתוני מעקב זמינים</h2>
                    <p>צור תקציב ורשום הוצאות כדי לראות מעקב בזמן אמת</p>
                    <button type="button" class="create-budget-btn" id="create-budget-for-tracking">
                        צור תקציב חדש
                    </button>
                </div>
            </div>
        `;
    }

    renderHeader() {
        const { periodProgress, daysInPeriod, daysPassed } = this.trackingData;
        const remainingDays = daysInPeriod - daysPassed;

        return `
            <div class="tracker-header">
                <div class="tracker-title">
                    <h1>מעקב תקציב - ${this.currentBudget.name}</h1>
                    <div class="period-info">
                        <span class="period-progress">${Math.round(periodProgress * 100)}% מהתקופה עברה</span>
                        <span class="remaining-days">${remainingDays} ימים נותרו</span>
                    </div>
                </div>

                <div class="quick-stats">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <span class="stat-label">נוצל מהתקציב</span>
                            <span class="stat-value">₪${this.trackingData.totalActual.toLocaleString('he-IL')}</span>
                            <span class="stat-percentage">${Math.round((this.trackingData.totalActual / this.trackingData.totalBudget) * 100)}%</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <span class="stat-label">צפוי היום</span>
                            <span class="stat-value">₪${Math.round(this.trackingData.totalBudget * periodProgress).toLocaleString('he-IL')}</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <span class="stat-label">יעד יומי ממוצע</span>
                            <span class="stat-value">₪${Math.round(this.trackingData.totalBudget / daysInPeriod).toLocaleString('he-IL')}</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <span class="stat-label">קצב יומי נוכחי</span>
                            <span class="stat-value">₪${Math.round(this.trackingData.totalActual / Math.max(daysPassed, 1)).toLocaleString('he-IL')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOverallProgress() {
        const { totalActual, totalBudget, periodProgress } = this.trackingData;
        const usagePercentage = (totalActual / totalBudget) * 100;
        const expectedAmount = totalBudget * periodProgress;
        const variance = totalActual - expectedAmount;
        const variancePercentage = expectedAmount > 0 ? (variance / expectedAmount) * 100 : 0;

        return `
            <div class="overall-progress-section">
                <h2 class="section-title">מצב כללי</h2>
                
                <div class="progress-visualization">
                    <div class="progress-chart">
                        <div class="budget-line">
                            <div class="budget-bar total-budget">
                                <span class="bar-label">תקציב כולל</span>
                                <div class="bar-fill" style="width: 100%; background: var(--color-primary-200);">
                                    <span class="bar-amount">₪${totalBudget.toLocaleString('he-IL')}</span>
                                </div>
                            </div>
                            
                            <div class="budget-bar expected">
                                <span class="bar-label">צפוי עד היום</span>
                                <div class="bar-fill" style="width: ${periodProgress * 100}%; background: var(--color-info-300);">
                                    <span class="bar-amount">₪${Math.round(expectedAmount).toLocaleString('he-IL')}</span>
                                </div>
                            </div>
                            
                            <div class="budget-bar actual">
                                <span class="bar-label">בפועל</span>
                                <div class="bar-fill ${usagePercentage > 100 ? 'over-budget' : ''}" 
                                     style="width: ${Math.min(usagePercentage, 100)}%; background: ${usagePercentage > periodProgress * 100 ? 'var(--color-warning-400)' : 'var(--color-success-400)'};">
                                    <span class="bar-amount">₪${totalActual.toLocaleString('he-IL')}</span>
                                </div>
                                ${usagePercentage > 100 ? 
                                    `<div class="bar-overflow" style="width: ${Math.min(usagePercentage - 100, 50)}%; background: var(--color-danger-400);"></div>` : 
                                    ''
                                }
                            </div>
                        </div>
                        
                        <div class="progress-indicators">
                            <div class="indicator-line time-indicator" style="left: ${periodProgress * 100}%;">
                                <span class="indicator-label">היום</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="variance-analysis">
                        <div class="analysis-card ${variance > 0 ? 'overspending' : 'underspending'}">
                            <div class="analysis-icon">
                                ${variance > 0 ? '📈' : '📉'}
                            </div>
                            <div class="analysis-content">
                                <h3>${variance > 0 ? 'הוצאה מעל הצפוי' : 'הוצאה מתחת לצפוי'}</h3>
                                <p class="variance-amount">
                                    ${variance > 0 ? '+' : ''}₪${Math.abs(variance).toLocaleString('he-IL')}
                                    <span class="variance-percentage">(${variancePercentage > 0 ? '+' : ''}${Math.round(variancePercentage)}%)</span>
                                </p>
                                <p class="analysis-suggestion">
                                    ${variance > 0 ? 
                                        'את/ה מוצא/ת יותר מהמתוכנן. שקול/י להפחית הוצאות.' : 
                                        'את/ה מוצא/ת פחות מהמתוכנן. יש לך מרווח נוסף בתקציב.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoryTracking() {
        return `
            <div class="category-tracking-section">
                <h2 class="section-title">מעקב לפי קטגוריות</h2>
                
                <div class="categories-tracking-grid">
                    ${this.currentBudget.categories.map(category => this.renderCategoryTracker(category)).join('')}
                </div>
            </div>
        `;
    }

    renderCategoryTracker(category) {
        const categoryName = category.name;
        const budgetAmount = category.amount;
        const actualAmount = this.trackingData.actualSpending[categoryName] || 0;
        const expectedAmount = this.trackingData.expectedSpending[categoryName] || 0;
        const projectedAmount = this.trackingData.projectedSpending[categoryName] || 0;
        
        const usagePercentage = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
        const projectedPercentage = budgetAmount > 0 ? (projectedAmount / budgetAmount) * 100 : 0;
        const variance = actualAmount - expectedAmount;
        
        const alerts = this.trackingData.categoryAlerts[categoryName] || [];
        const highestAlert = alerts.reduce((highest, alert) => {
            const levels = { success: 0, info: 1, warning: 2, danger: 3 };
            return levels[alert.level] > levels[highest.level] ? alert : highest;
        }, { level: 'success' });

        return `
            <div class="category-tracker-card ${highestAlert.level}">
                <div class="category-header">
                    <h3 class="category-name">${categoryName}</h3>
                    <div class="category-status">
                        ${alerts.length > 0 ? alerts[0].icon : '✅'}
                        ${alerts.length > 1 ? `<span class="alert-count">+${alerts.length - 1}</span>` : ''}
                    </div>
                </div>
                
                <div class="category-amounts">
                    <div class="amount-row primary">
                        <span class="amount-label">תקציב:</span>
                        <span class="amount-value">₪${budgetAmount.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">בפועל:</span>
                        <span class="amount-value actual">₪${actualAmount.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">צפוי:</span>
                        <span class="amount-value expected">₪${Math.round(expectedAmount).toLocaleString('he-IL')}</span>
                    </div>
                    <div class="amount-row ${variance > 0 ? 'over' : 'under'}">
                        <span class="amount-label">הפרש:</span>
                        <span class="amount-value variance">
                            ${variance > 0 ? '+' : ''}₪${Math.abs(variance).toLocaleString('he-IL')}
                        </span>
                    </div>
                </div>
                
                <div class="category-progress">
                    <div class="progress-bars">
                        <div class="progress-bar expected-bar">
                            <div class="progress-fill expected" 
                                 style="width: ${(expectedAmount / budgetAmount) * 100}%"></div>
                            <span class="progress-label">צפוי</span>
                        </div>
                        <div class="progress-bar actual-bar">
                            <div class="progress-fill actual ${usagePercentage > 100 ? 'over-budget' : ''}" 
                                 style="width: ${Math.min(usagePercentage, 100)}%"></div>
                            <span class="progress-label">בפועל (${Math.round(usagePercentage)}%)</span>
                        </div>
                        ${projectedPercentage !== usagePercentage ? `
                            <div class="progress-bar projected-bar">
                                <div class="progress-fill projected ${projectedPercentage > 100 ? 'over-budget' : ''}" 
                                     style="width: ${Math.min(projectedPercentage, 100)}%"></div>
                                <span class="progress-label">צפוי לסוף התקופה (${Math.round(projectedPercentage)}%)</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${alerts.length > 0 ? `
                    <div class="category-alerts">
                        ${alerts.slice(0, 2).map(alert => `
                            <div class="category-alert ${alert.level}">
                                <span class="alert-icon">${alert.icon}</span>
                                <span class="alert-message">${alert.message}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="category-actions">
                    <button type="button" class="category-action-btn" data-action="view-details" data-category="${categoryName}">
                        📊 פרטים
                    </button>
                    <button type="button" class="category-action-btn" data-action="add-transaction" data-category="${categoryName}">
                        ➕ הוסף הוצאה
                    </button>
                    ${alerts.length > 0 ? `
                        <button type="button" class="category-action-btn" data-action="view-alerts" data-category="${categoryName}">
                            🔔 התראות (${alerts.length})
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderSpendingTrends() {
        const dailyData = this.calculateDailyTrends();
        
        return `
            <div class="spending-trends-section">
                <h2 class="section-title">מגמות הוצאות</h2>
                
                <div class="trends-container">
                    <div class="daily-trend-chart">
                        <h3>הוצאות يום לפי יום</h3>
                        <div class="chart-container">
                            ${this.renderDailyChart(dailyData)}
                        </div>
                    </div>
                    
                    <div class="trend-insights">
                        <h3>תובנות</h3>
                        ${this.renderTrendInsights(dailyData)}
                    </div>
                </div>
            </div>
        `;
    }

    calculateDailyTrends() {
        const { periodStart, daysInPeriod } = this.trackingData;
        const dailyData = [];
        
        for (let i = 0; i < daysInPeriod; i++) {
            const date = new Date(periodStart);
            date.setDate(date.getDate() + i);
            const dateString = date.toDateString();
            
            const daySpending = this.trackingData.dailySpending[dateString] || {};
            const totalDay = Object.values(daySpending).reduce((sum, amount) => sum + amount, 0);
            
            dailyData.push({
                date: date,
                dateString: dateString,
                spending: totalDay,
                categories: daySpending,
                isPast: date <= new Date()
            });
        }
        
        return dailyData;
    }

    renderDailyChart(dailyData) {
        const maxSpending = Math.max(...dailyData.map(d => d.spending));
        const avgDailyBudget = this.trackingData.totalBudget / this.trackingData.daysInPeriod;
        
        return `
            <div class="daily-chart">
                <div class="chart-grid">
                    ${dailyData.map((day, index) => {
                        const heightPercentage = maxSpending > 0 ? (day.spending / maxSpending) * 100 : 0;
                        const isToday = day.date.toDateString() === new Date().toDateString();
                        const isOverBudget = day.spending > avgDailyBudget * 1.5;
                        
                        return `
                            <div class="chart-bar ${!day.isPast ? 'future' : ''} ${isToday ? 'today' : ''} ${isOverBudget ? 'high' : ''}"
                                 style="height: ${heightPercentage}%"
                                 title="${day.date.toLocaleDateString('he-IL')}: ₪${day.spending.toLocaleString('he-IL')}">
                                <div class="bar-amount">₪${Math.round(day.spending)}</div>
                                <div class="bar-date">${day.date.getDate()}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color normal"></div>
                        <span>יום רגיל</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color high"></div>
                        <span>הוצאה גבוהה</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color today"></div>
                        <span>היום</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color future"></div>
                        <span>עתיד</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrendInsights(dailyData) {
        const insights = this.generateTrendInsights(dailyData);
        
        return `
            <div class="trend-insights-list">
                ${insights.map(insight => `
                    <div class="insight-item ${insight.type}">
                        <div class="insight-icon">${insight.icon}</div>
                        <div class="insight-content">
                            <h4>${insight.title}</h4>
                            <p>${insight.message}</p>
                            ${insight.suggestion ? `<p class="insight-suggestion">${insight.suggestion}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateTrendInsights(dailyData) {
        const insights = [];
        const pastDays = dailyData.filter(d => d.isPast && d.spending > 0);
        
        if (pastDays.length === 0) return insights;
        
        // Calculate averages
        const avgDailySpending = pastDays.reduce((sum, day) => sum + day.spending, 0) / pastDays.length;
        const avgDailyBudget = this.trackingData.totalBudget / this.trackingData.daysInPeriod;
        
        // High spending days
        const highSpendingDays = pastDays.filter(d => d.spending > avgDailyBudget * 1.5);
        if (highSpendingDays.length > 0) {
            insights.push({
                type: 'warning',
                icon: '📈',
                title: 'ימים עם הוצאות גבוהות',
                message: `${highSpendingDays.length} ימים עם הוצאות גבוהות מהרגיל`,
                suggestion: 'בדוק מה גרם להוצאות הגבוהות ותכנן איך למנוע זאת'
            });
        }
        
        // Spending pattern
        if (avgDailySpending > avgDailyBudget * 1.1) {
            insights.push({
                type: 'danger',
                icon: '⚠️',
                title: 'קצב הוצאות גבוה',
                message: `הקצב היומי הממוצע גבוה מהתקציב המתוכנן`,
                suggestion: 'שקול להפחית הוצאות או להתאים את התקציב'
            });
        } else if (avgDailySpending < avgDailyBudget * 0.8) {
            insights.push({
                type: 'success',
                icon: '💰',
                title: 'חיסכון מעולה',
                message: `את/ה מוצא/ת פחות מהתקציב המתוכנן`,
                suggestion: 'שקול להעביר חלק מהתקציב לחסכונות או למטרות אחרות'
            });
        }
        
        // Weekend spending (if applicable)
        const weekendSpending = pastDays.filter(d => {
            const dayOfWeek = d.date.getDay();
            return dayOfWeek === 5 || dayOfWeek === 6; // Friday and Saturday
        });
        
        if (weekendSpending.length > 0) {
            const weekendAvg = weekendSpending.reduce((sum, day) => sum + day.spending, 0) / weekendSpending.length;
            const weekdayAvg = pastDays.filter(d => d.date.getDay() !== 5 && d.date.getDay() !== 6)
                                    .reduce((sum, day) => sum + day.spending, 0) / Math.max(pastDays.length - weekendSpending.length, 1);
            
            if (weekendAvg > weekdayAvg * 1.3) {
                insights.push({
                    type: 'info',
                    icon: '🏖️',
                    title: 'הוצאות סוף שבוע',
                    message: 'הוצאות סוף השבוع גבוהות יותר מאמצע השבוע',
                    suggestion: 'תכנן מראש הוצאות לסוף השבוע כדי לשמור על התקציב'
                });
            }
        }
        
        return insights;
    }

    renderAlerts() {
        const allAlerts = Object.values(this.trackingData.categoryAlerts)
            .flat()
            .sort((a, b) => {
                const levels = { danger: 3, warning: 2, info: 1, success: 0 };
                return levels[b.level] - levels[a.level];
            });

        if (allAlerts.length === 0) {
            return `
                <div class="alerts-section">
                    <h2 class="section-title">התראות</h2>
                    <div class="no-alerts">
                        <div class="no-alerts-icon">✅</div>
                        <p>אין התראות פעילות - התקציב שלך תקין!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="alerts-section">
                <h2 class="section-title">התראות פעילות (${allAlerts.length})</h2>
                
                <div class="alerts-list">
                    ${allAlerts.slice(0, 10).map(alert => `
                        <div class="budget-alert ${alert.level}">
                            <div class="alert-icon">${alert.icon}</div>
                            <div class="alert-content">
                                <h4>${alert.title}</h4>
                                <p class="alert-message">${alert.message}</p>
                                ${alert.suggestion ? `<p class="alert-suggestion">${alert.suggestion}</p>` : ''}
                            </div>
                            ${alert.action ? `
                                <div class="alert-actions">
                                    <button type="button" class="alert-action-btn" data-action="${alert.action}">
                                        טפל בזה
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${allAlerts.length > 10 ? `
                    <button type="button" class="view-all-alerts-btn" id="view-all-alerts">
                        צפה בכל ההתראות (${allAlerts.length})
                    </button>
                ` : ''}
            </div>
        `;
    }

    startRealTimeTracking() {
        // Update tracking data every minute
        this.trackingInterval = setInterval(() => {
            this.loadTrackingData();
        }, 60000);
    }

    stopRealTimeTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
    }

    checkForNewAlerts() {
        // Implementation for checking and showing new alerts
        // This would integrate with the notification system
    }

    attachEventListeners() {
        // Category actions
        document.querySelectorAll('.category-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const category = e.target.dataset.category;
                this.handleCategoryAction(action, category);
            });
        });

        // Alert actions
        document.querySelectorAll('.alert-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAlertAction(action);
            });
        });
    }

    handleCategoryAction(action, category) {
        switch(action) {
            case 'view-details':
                this.showCategoryDetails(category);
                break;
            case 'add-transaction':
                this.showAddTransactionModal(category);
                break;
            case 'view-alerts':
                this.showCategoryAlerts(category);
                break;
        }
    }

    handleAlertAction(action) {
        switch(action) {
            case 'adjust-budget':
                this.showBudgetAdjustmentModal();
                break;
            case 'monitor-spending':
                this.showSpendingMonitorModal();
                break;
            case 'reduce-spending':
                this.showSpendingReductionTips();
                break;
        }
    }

    getBudgetPeriodStart(date) {
        // Implementation matches BudgetManager
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
        // Implementation matches BudgetManager
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

    updateDisplay() {
        const container = document.querySelector('.budget-tracker, .no-tracking-data');
        if (container) {
            container.outerHTML = this.render();
            this.attachEventListeners();
        }
    }

    destroy() {
        this.stopRealTimeTracking();
    }
}

// Export for use in other components
window.BudgetTracker = BudgetTracker;