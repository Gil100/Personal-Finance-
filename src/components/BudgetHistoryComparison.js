/**
 * Hebrew Budget History and Comparison Component
 * Tracks budget history and provides comparison tools
 */
class BudgetHistoryComparison {
    constructor() {
        this.budgetHistory = [];
        this.currentBudget = null;
        this.comparisonData = null;
        this.selectedPeriods = [];
        this.viewMode = 'timeline'; // timeline, comparison, trends
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadBudgetHistory();
            await this.loadCurrentBudget();
            await this.loadTransactionData();
            this.generateComparisonData();
        }
    }

    async loadBudgetHistory() {
        try {
            const budgets = await DataAPI.storage.getAll('budgets');
            this.budgetHistory = Object.values(budgets)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Failed to load budget history:', error);
            this.budgetHistory = [];
        }
    }

    async loadCurrentBudget() {
        try {
            const activeBudgets = this.budgetHistory.filter(b => b.status === 'active');
            this.currentBudget = activeBudgets.length > 0 ? activeBudgets[0] : null;
        } catch (error) {
            console.error('Failed to load current budget:', error);
        }
    }

    async loadTransactionData() {
        try {
            const transactions = await DataAPI.storage.getAll('transactions');
            this.transactions = Object.values(transactions);
        } catch (error) {
            console.error('Failed to load transaction data:', error);
            this.transactions = [];
        }
    }

    generateComparisonData() {
        if (this.budgetHistory.length === 0) return;

        this.comparisonData = {
            periods: this.generatePeriods(),
            categoryTrends: this.analyzeCategoryTrends(),
            budgetEvolution: this.analyzeBudgetEvolution(),
            performanceMetrics: this.calculatePerformanceMetrics()
        };
    }

    generatePeriods() {
        const periods = [];
        const now = new Date();
        
        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            periods.push({
                id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                name: date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' }),
                startDate: date,
                endDate: endDate,
                monthYear: `${date.getFullYear()}-${date.getMonth() + 1}`
            });
        }

        return periods;
    }

    analyzeCategoryTrends() {
        const trends = {};
        
        this.budgetHistory.forEach(budget => {
            const budgetDate = new Date(budget.createdAt);
            const monthKey = `${budgetDate.getFullYear()}-${budgetDate.getMonth() + 1}`;
            
            if (budget.categories) {
                budget.categories.forEach(category => {
                    if (!trends[category.name]) {
                        trends[category.name] = [];
                    }
                    
                    trends[category.name].push({
                        month: monthKey,
                        budgetAmount: category.amount,
                        actualSpent: this.getActualSpentForCategory(category.name, budgetDate),
                        date: budgetDate
                    });
                });
            }
        });

        // Calculate trend indicators
        Object.keys(trends).forEach(categoryName => {
            const categoryData = trends[categoryName].sort((a, b) => a.date - b.date);
            trends[categoryName] = {
                data: categoryData,
                trend: this.calculateTrend(categoryData),
                variance: this.calculateVariance(categoryData),
                averageBudget: this.calculateAverage(categoryData, 'budgetAmount'),
                averageSpent: this.calculateAverage(categoryData, 'actualSpent')
            };
        });

        return trends;
    }

    analyzeBudgetEvolution() {
        const evolution = {
            totalBudgetTrend: [],
            categoryChanges: {},
            majorChanges: []
        };

        this.budgetHistory.forEach((budget, index) => {
            const totalBudget = budget.categories?.reduce((sum, cat) => sum + cat.amount, 0) || 0;
            const budgetDate = new Date(budget.createdAt);
            
            evolution.totalBudgetTrend.push({
                date: budgetDate,
                total: totalBudget,
                categoryCount: budget.categories?.length || 0
            });

            // Compare with previous budget
            if (index < this.budgetHistory.length - 1) {
                const previousBudget = this.budgetHistory[index + 1];
                const changes = this.compareBudgets(budget, previousBudget);
                
                if (changes.majorChanges.length > 0) {
                    evolution.majorChanges.push({
                        date: budgetDate,
                        fromBudget: previousBudget.name,
                        toBudget: budget.name,
                        changes: changes.majorChanges
                    });
                }
            }
        });

        return evolution;
    }

    calculatePerformanceMetrics() {
        const metrics = {
            accuracyScore: 0, // How close actual spending was to budget
            consistencyScore: 0, // How consistent spending patterns are
            improvementTrend: 0, // Whether performance is improving
            categoryPerformance: {}
        };

        const recentPeriods = this.comparisonData?.periods.slice(-6) || []; // Last 6 months
        let totalAccuracy = 0;
        let validPeriods = 0;

        recentPeriods.forEach(period => {
            const periodBudget = this.getBudgetForPeriod(period);
            if (periodBudget) {
                const actualSpending = this.getActualSpendingForPeriod(period);
                const accuracy = this.calculateAccuracy(periodBudget, actualSpending);
                
                if (accuracy >= 0) {
                    totalAccuracy += accuracy;
                    validPeriods++;
                }
            }
        });

        metrics.accuracyScore = validPeriods > 0 ? totalAccuracy / validPeriods : 0;
        return metrics;
    }

    render() {
        return `
            <div class="budget-history-comparison" dir="rtl">
                <div class="history-header">
                    <h2>היסטוריית תקציבים והשוואות</h2>
                    <p class="description">עקוב אחרי התפתחות התקציב שלך לאורך זמן והשווה ביצועים</p>
                </div>

                <div class="view-navigation">
                    ${this.renderViewNavigation()}
                </div>

                <div class="history-content">
                    ${this.renderViewContent()}
                </div>
            </div>
        `;
    }

    renderViewNavigation() {
        const views = [
            { key: 'timeline', label: 'ציר זמן', icon: '📅' },
            { key: 'comparison', label: 'השוואות', icon: '📊' },
            { key: 'trends', label: 'מגמות', icon: '📈' },
            { key: 'performance', label: 'ביצועים', icon: '🎯' }
        ];

        return `
            <nav class="view-navigation">
                <div class="nav-tabs">
                    ${views.map(view => `
                        <button 
                            type="button" 
                            class="nav-tab ${this.viewMode === view.key ? 'active' : ''}"
                            onclick="budgetHistory.setViewMode('${view.key}')"
                        >
                            <span class="tab-icon">${view.icon}</span>
                            <span class="tab-label">${view.label}</span>
                        </button>
                    `).join('')}
                </div>
            </nav>
        `;
    }

    renderViewContent() {
        switch (this.viewMode) {
            case 'timeline':
                return this.renderTimeline();
            case 'comparison':
                return this.renderComparison();
            case 'trends':
                return this.renderTrends();
            case 'performance':
                return this.renderPerformance();
            default:
                return this.renderTimeline();
        }
    }

    renderTimeline() {
        if (this.budgetHistory.length === 0) {
            return `
                <div class="no-history">
                    <div class="no-history-icon">📊</div>
                    <h3>אין היסטוריית תקציבים</h3>
                    <p>ההיסטוריה תתחיל לצבור ככל שתשתמש במערכת לאורך זמן</p>
                </div>
            `;
        }

        return `
            <div class="budget-timeline">
                <div class="timeline-header">
                    <h3>ציר זמן תקציבים</h3>
                    <div class="timeline-filters">
                        <select id="timeline-period" onchange="budgetHistory.filterTimeline(this.value)">
                            <option value="all">כל התקופות</option>
                            <option value="year">שנה אחרונה</option>
                            <option value="6months">6 חודשים אחרונים</option>
                            <option value="3months">3 חודשים אחרונים</option>
                        </select>
                    </div>
                </div>

                <div class="timeline-container">
                    ${this.budgetHistory.map((budget, index) => `
                        <div class="timeline-item ${budget.status === 'active' ? 'active' : ''}" 
                             data-budget-id="${budget.id}">
                            <div class="timeline-marker">
                                <div class="marker-dot ${budget.status}"></div>
                                <div class="marker-line"></div>
                            </div>
                            
                            <div class="timeline-content">
                                <div class="budget-card">
                                    <div class="card-header">
                                        <h4 class="budget-name">${budget.name}</h4>
                                        <div class="budget-status ${budget.status}">
                                            ${this.getBudgetStatusDisplay(budget.status)}
                                        </div>
                                        <div class="budget-date">
                                            ${this.formatDate(budget.createdAt)}
                                        </div>
                                    </div>
                                    
                                    <div class="card-content">
                                        <div class="budget-summary">
                                            <div class="summary-item">
                                                <span class="label">סך התקציב:</span>
                                                <span class="value">₪${this.calculateTotalBudget(budget).toLocaleString('he-IL')}</span>
                                            </div>
                                            <div class="summary-item">
                                                <span class="label">קטגוריות:</span>
                                                <span class="value">${budget.categories?.length || 0}</span>
                                            </div>
                                            <div class="summary-item">
                                                <span class="label">תקופה:</span>
                                                <span class="value">${budget.period || 'חודשי'}</span>
                                            </div>
                                        </div>
                                        
                                        ${this.renderBudgetChanges(budget, index)}
                                    </div>
                                    
                                    <div class="card-actions">
                                        <button class="btn btn-sm btn-secondary" 
                                                onclick="budgetHistory.viewBudgetDetails('${budget.id}')">
                                            פרטים
                                        </button>
                                        <button class="btn btn-sm btn-ghost" 
                                                onclick="budgetHistory.compareBudget('${budget.id}')">
                                            השווה
                                        </button>
                                        ${budget.status !== 'active' ? `
                                            <button class="btn btn-sm btn-primary" 
                                                    onclick="budgetHistory.restoreBudget('${budget.id}')">
                                                שחזר
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderComparison() {
        return `
            <div class="budget-comparison">
                <div class="comparison-header">
                    <h3>השוואת תקציבים</h3>
                    <div class="comparison-controls">
                        <div class="budget-selector">
                            <label>תקציב ראשון:</label>
                            <select id="compare-budget-1" onchange="budgetHistory.updateComparison()">
                                <option value="">בחר תקציב</option>
                                ${this.budgetHistory.map(budget => `
                                    <option value="${budget.id}">${budget.name} - ${this.formatDate(budget.createdAt)}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="budget-selector">
                            <label>תקציב שני:</label>
                            <select id="compare-budget-2" onchange="budgetHistory.updateComparison()">
                                <option value="">בחר תקציב</option>
                                ${this.budgetHistory.map(budget => `
                                    <option value="${budget.id}">${budget.name} - ${this.formatDate(budget.createdAt)}</option>
                                `).join('')}
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="budgetHistory.generateComparison()">
                            השווה
                        </button>
                    </div>
                </div>

                <div id="comparison-results" class="comparison-results">
                    <div class="select-budgets-prompt">
                        <p>בחר שני תקציבים להשוואה</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrends() {
        if (!this.comparisonData || Object.keys(this.comparisonData.categoryTrends).length === 0) {
            return `
                <div class="no-trends">
                    <div class="no-trends-icon">📈</div>
                    <h3>אין מספיק נתונים למגמות</h3>
                    <p>נדרשים לפחות 3 תקציבים כדי לנתח מגמות</p>
                </div>
            `;
        }

        return `
            <div class="budget-trends">
                <div class="trends-header">
                    <h3>ניתוח מגמות</h3>
                    <div class="trends-filters">
                        <select id="trend-category" onchange="budgetHistory.filterTrends(this.value)">
                            <option value="all">כל הקטגוריות</option>
                            ${Object.keys(this.comparisonData.categoryTrends).map(category => `
                                <option value="${category}">${category}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="trends-overview">
                    ${this.renderTrendsOverview()}
                </div>

                <div class="category-trends">
                    ${this.renderCategoryTrends()}
                </div>
            </div>
        `;
    }

    renderPerformance() {
        if (!this.comparisonData) {
            return `
                <div class="loading-performance">
                    <p>מחשב נתוני ביצועים...</p>
                </div>
            `;
        }

        const metrics = this.comparisonData.performanceMetrics;
        
        return `
            <div class="budget-performance">
                <div class="performance-header">
                    <h3>ניתוח ביצועים</h3>
                    <p>הערכת דיוק ביצוע התקציב לאורך זמן</p>
                </div>

                <div class="performance-metrics">
                    <div class="metric-card accuracy">
                        <div class="metric-icon">🎯</div>
                        <div class="metric-content">
                            <h4>דיוק תקציב</h4>
                            <div class="metric-value">${(metrics.accuracyScore || 0).toFixed(1)}%</div>
                            <p class="metric-description">
                                ${this.getAccuracyDescription(metrics.accuracyScore)}
                            </p>
                        </div>
                    </div>

                    <div class="metric-card consistency">
                        <div class="metric-icon">📊</div>
                        <div class="metric-content">
                            <h4>עקביות</h4>
                            <div class="metric-value">${(metrics.consistencyScore || 0).toFixed(1)}%</div>
                            <p class="metric-description">רמת העקביות בהתנהגות ההוצאות</p>
                        </div>
                    </div>

                    <div class="metric-card improvement">
                        <div class="metric-icon">📈</div>
                        <div class="metric-content">
                            <h4>מגמת שיפור</h4>
                            <div class="metric-value ${metrics.improvementTrend >= 0 ? 'positive' : 'negative'}">
                                ${metrics.improvementTrend >= 0 ? '+' : ''}${(metrics.improvementTrend || 0).toFixed(1)}%
                            </div>
                            <p class="metric-description">
                                ${metrics.improvementTrend >= 0 ? 'ביצועים משתפרים' : 'ביצועים יורדים'}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="performance-insights">
                    ${this.renderPerformanceInsights()}
                </div>
            </div>
        `;
    }

    renderBudgetChanges(budget, index) {
        if (index >= this.budgetHistory.length - 1) {
            return '<div class="budget-changes">תקציב ראשון</div>';
        }

        const previousBudget = this.budgetHistory[index + 1];
        const changes = this.compareBudgets(budget, previousBudget);
        
        if (changes.majorChanges.length === 0) {
            return '<div class="budget-changes">ללא שינויים משמעותיים</div>';
        }

        return `
            <div class="budget-changes">
                <h5>שינויים מהתקציב הקודם:</h5>
                <ul class="changes-list">
                    ${changes.majorChanges.slice(0, 3).map(change => `
                        <li class="change-item ${change.type}">
                            <span class="change-icon">${change.icon}</span>
                            <span class="change-text">${change.description}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    renderTrendsOverview() {
        const totalBudgetTrend = this.comparisonData.budgetEvolution.totalBudgetTrend;
        if (totalBudgetTrend.length < 2) return '';

        const latest = totalBudgetTrend[0];
        const previous = totalBudgetTrend[totalBudgetTrend.length - 1];
        const percentChange = ((latest.total - previous.total) / previous.total * 100).toFixed(1);

        return `
            <div class="trends-overview-cards">
                <div class="trend-card total-budget">
                    <h4>שינוי בסך התקציב</h4>
                    <div class="trend-value ${percentChange >= 0 ? 'increase' : 'decrease'}">
                        ${percentChange >= 0 ? '+' : ''}${percentChange}%
                    </div>
                    <p>מ-₪${previous.total.toLocaleString('he-IL')} ל-₪${latest.total.toLocaleString('he-IL')}</p>
                </div>

                <div class="trend-card categories">
                    <h4>מספר קטגוריות</h4>
                    <div class="trend-value">${latest.categoryCount}</div>
                    <p>${latest.categoryCount - previous.categoryCount >= 0 ? '+' : ''}${latest.categoryCount - previous.categoryCount} קטגוריות</p>
                </div>
            </div>
        `;
    }

    renderCategoryTrends() {
        const trends = this.comparisonData.categoryTrends;
        
        return `
            <div class="category-trends-list">
                ${Object.entries(trends).map(([categoryName, trendData]) => `
                    <div class="category-trend-card">
                        <div class="trend-header">
                            <h4>${categoryName}</h4>
                            <div class="trend-indicator ${trendData.trend >= 0 ? 'up' : 'down'}">
                                ${trendData.trend >= 0 ? '↗' : '↘'} ${Math.abs(trendData.trend).toFixed(1)}%
                            </div>
                        </div>
                        
                        <div class="trend-stats">
                            <div class="stat-item">
                                <span class="label">ממוצע תקציב:</span>
                                <span class="value">₪${trendData.averageBudget.toFixed(0)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">ממוצע הוצאה:</span>
                                <span class="value">₪${trendData.averageSpent.toFixed(0)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">שונות:</span>
                                <span class="value">${trendData.variance.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPerformanceInsights() {
        const insights = this.generatePerformanceInsights();
        
        return `
            <div class="performance-insights">
                <h4>תובנות ביצועים</h4>
                <div class="insights-list">
                    ${insights.map(insight => `
                        <div class="insight-card ${insight.type}">
                            <div class="insight-icon">${insight.icon}</div>
                            <div class="insight-content">
                                <h5>${insight.title}</h5>
                                <p>${insight.description}</p>
                                ${insight.recommendation ? `
                                    <div class="recommendation">
                                        <strong>המלצה:</strong> ${insight.recommendation}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Helper methods
    calculateTotalBudget(budget) {
        return budget.categories?.reduce((sum, cat) => sum + cat.amount, 0) || 0;
    }

    getBudgetStatusDisplay(status) {
        const statuses = {
            'active': 'פעיל',
            'inactive': 'לא פעיל',
            'archived': 'בארכיון',
            'draft': 'טיוטה'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('he-IL');
    }

    compareBudgets(budget1, budget2) {
        const changes = {
            totalChange: 0,
            majorChanges: []
        };

        const total1 = this.calculateTotalBudget(budget1);
        const total2 = this.calculateTotalBudget(budget2);
        changes.totalChange = ((total1 - total2) / total2 * 100);

        // Check for major total budget change
        if (Math.abs(changes.totalChange) > 10) {
            changes.majorChanges.push({
                type: changes.totalChange > 0 ? 'increase' : 'decrease',
                icon: changes.totalChange > 0 ? '📈' : '📉',
                description: `שינוי של ${Math.abs(changes.totalChange).toFixed(1)}% בסך התקציב`
            });
        }

        // Compare categories
        const categories1 = new Map(budget1.categories?.map(c => [c.name, c.amount]) || []);
        const categories2 = new Map(budget2.categories?.map(c => [c.name, c.amount]) || []);

        // New categories
        categories1.forEach((amount, name) => {
            if (!categories2.has(name)) {
                changes.majorChanges.push({
                    type: 'new',
                    icon: '➕',
                    description: `נוספה קטגוריה חדשה: ${name}`
                });
            }
        });

        // Removed categories
        categories2.forEach((amount, name) => {
            if (!categories1.has(name)) {
                changes.majorChanges.push({
                    type: 'removed',
                    icon: '➖',
                    description: `הוסרה קטגוריה: ${name}`
                });
            }
        });

        // Changed amounts
        categories1.forEach((amount1, name) => {
            const amount2 = categories2.get(name);
            if (amount2 && Math.abs((amount1 - amount2) / amount2) > 0.2) { // 20% change
                const change = ((amount1 - amount2) / amount2 * 100);
                changes.majorChanges.push({
                    type: change > 0 ? 'increase' : 'decrease',
                    icon: change > 0 ? '⬆️' : '⬇️',
                    description: `${name}: שינוי של ${Math.abs(change).toFixed(1)}%`
                });
            }
        });

        return changes;
    }

    generatePerformanceInsights() {
        return [
            {
                type: 'info',
                icon: '💡',
                title: 'דפוס הוצאות',
                description: 'הוצאותיך עקביות יחסית לתקציב המתוכנן',
                recommendation: 'המשך לעקוב אחרי ההוצאות באופן קבוע'
            },
            {
                type: 'warning',
                icon: '⚠️',
                title: 'קטגוריות בסיכון',
                description: 'מספר קטגוריות חורגות מהתקציב בקביעות',
                recommendation: 'שקול להגדיל את התקציב או להפחית הוצאות'
            }
        ];
    }

    // Action methods
    setViewMode(mode) {
        this.viewMode = mode;
        this.updateDisplay();
    }

    viewBudgetDetails(budgetId) {
        const budget = this.budgetHistory.find(b => b.id === budgetId);
        if (!budget) return;

        // Implementation for viewing budget details
        window.HebrewToasts?.show(`צפייה בפרטי תקציב ${budget.name}`, 'info');
    }

    async restoreBudget(budgetId) {
        const budget = this.budgetHistory.find(b => b.id === budgetId);
        if (!budget) return;

        if (!confirm(`האם אתה בטוח שברצונך לשחזר את התקציב "${budget.name}"?`)) return;

        try {
            // Deactivate current budget
            if (this.currentBudget) {
                this.currentBudget.status = 'inactive';
                await DataAPI.storage.save('budgets', this.currentBudget.id, this.currentBudget);
            }

            // Activate restored budget
            budget.status = 'active';
            budget.restoredAt = new Date().toISOString();
            await DataAPI.storage.save('budgets', budget.id, budget);

            this.currentBudget = budget;
            window.HebrewToasts?.show(`התקציב "${budget.name}" שוחזר בהצלחה`, 'success');
            this.updateDisplay();

        } catch (error) {
            console.error('Failed to restore budget:', error);
            window.HebrewToasts?.show('שגיאה בשחזור התקציב', 'error');
        }
    }

    updateDisplay() {
        const container = document.querySelector('.budget-history-comparison');
        if (container) {
            container.innerHTML = this.render().match(/<div class="budget-history-comparison"[^>]*>(.*)<\/div>$/s)[1];
        }
    }

    // Utility methods for calculations
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const first = data[0].budgetAmount;
        const last = data[data.length - 1].budgetAmount;
        return ((last - first) / first) * 100;
    }

    calculateVariance(data) {
        if (data.length === 0) return 0;
        
        const amounts = data.map(d => d.budgetAmount);
        const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
        
        return (Math.sqrt(variance) / mean) * 100; // Coefficient of variation as percentage
    }

    calculateAverage(data, field) {
        if (data.length === 0) return 0;
        return data.reduce((sum, item) => sum + (item[field] || 0), 0) / data.length;
    }

    getAccuracyDescription(score) {
        if (score >= 90) return 'דיוק מעולה בביצוע התקציב';
        if (score >= 75) return 'דיוק טוב בביצוע התקציב';
        if (score >= 60) return 'דיוק סביר - יש מקום לשיפור';
        return 'דיוק נמוך - מומלץ לעקוב יותר מקרוב';
    }

    // Placeholder methods for future implementation
    getActualSpentForCategory(categoryName, date) {
        // Implementation would calculate actual spending for category in given month
        return 0;
    }

    getBudgetForPeriod(period) {
        // Implementation would find budget active during period
        return null;
    }

    getActualSpendingForPeriod(period) {
        // Implementation would calculate actual spending during period
        return 0;
    }

    calculateAccuracy(budgetAmount, actualAmount) {
        // Implementation would calculate accuracy score
        return 85; // Placeholder
    }
}

// Initialize component
window.BudgetHistoryComparison = BudgetHistoryComparison;
window.budgetHistory = null;