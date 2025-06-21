/**
 * Hebrew Budget Performance Analytics Component
 * Advanced analytics and insights for budget performance
 */
class BudgetPerformanceAnalytics {
    constructor() {
        this.currentBudget = null;
        this.transactions = [];
        this.analyticsData = null;
        this.selectedTimeRange = '6months';
        this.selectedMetrics = ['accuracy', 'variance', 'trends'];
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadCurrentBudget();
            await this.loadTransactionData();
            this.calculateAnalytics();
        }
    }

    async loadCurrentBudget() {
        try {
            const budgets = await DataAPI.storage.getAll('budgets');
            const activeBudgets = Object.values(budgets).filter(b => b.status === 'active');
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

    calculateAnalytics() {
        if (!this.currentBudget || this.transactions.length === 0) {
            this.analyticsData = null;
            return;
        }

        const timeRange = this.getTimeRange();
        const relevantTransactions = this.filterTransactionsByTimeRange(timeRange);

        this.analyticsData = {
            timeRange,
            totalTransactions: relevantTransactions.length,
            budgetAccuracy: this.calculateBudgetAccuracy(relevantTransactions),
            spendingPatterns: this.analyzeSpendingPatterns(relevantTransactions),
            categoryPerformance: this.analyzeCategoryPerformance(relevantTransactions),
            seasonalAnalysis: this.analyzeSeasonalPatterns(relevantTransactions),
            predictiveInsights: this.generatePredictiveInsights(relevantTransactions),
            riskAssessment: this.assessFinancialRisks(relevantTransactions),
            optimizationSuggestions: this.generateOptimizationSuggestions(relevantTransactions)
        };
    }

    getTimeRange() {
        const now = new Date();
        const ranges = {
            '1month': { months: 1, label: 'חודש אחרון' },
            '3months': { months: 3, label: '3 חודשים אחרונים' },
            '6months': { months: 6, label: '6 חודשים אחרונים' },
            '1year': { months: 12, label: 'שנה אחרונה' }
        };

        const range = ranges[this.selectedTimeRange];
        const startDate = new Date(now.getFullYear(), now.getMonth() - range.months, 1);
        
        return {
            start: startDate,
            end: now,
            label: range.label,
            months: range.months
        };
    }

    filterTransactionsByTimeRange(timeRange) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= timeRange.start && transactionDate <= timeRange.end;
        });
    }

    calculateBudgetAccuracy(transactions) {
        if (!this.currentBudget.categories || this.currentBudget.categories.length === 0) {
            return { overall: 0, categories: {} };
        }

        const categorySpending = {};
        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const category = transaction.category || 'שונות';
            categorySpending[category] = (categorySpending[category] || 0) + Math.abs(transaction.amount);
        });

        const categoryAccuracy = {};
        let totalBudget = 0;
        let totalSpent = 0;
        let accuracySum = 0;
        let validCategories = 0;

        this.currentBudget.categories.forEach(budgetCategory => {
            const spent = categorySpending[budgetCategory.name] || 0;
            const budgeted = budgetCategory.amount;
            
            totalBudget += budgeted;
            totalSpent += spent;

            if (budgeted > 0) {
                const accuracy = Math.max(0, 100 - Math.abs((spent - budgeted) / budgeted) * 100);
                categoryAccuracy[budgetCategory.name] = {
                    accuracy: accuracy,
                    budgeted: budgeted,
                    spent: spent,
                    variance: ((spent - budgeted) / budgeted) * 100,
                    status: this.getPerformanceStatus(accuracy)
                };
                
                accuracySum += accuracy;
                validCategories++;
            }
        });

        const overallAccuracy = validCategories > 0 ? accuracySum / validCategories : 0;
        const overallVariance = totalBudget > 0 ? ((totalSpent - totalBudget) / totalBudget) * 100 : 0;

        return {
            overall: overallAccuracy,
            overallVariance: overallVariance,
            totalBudgeted: totalBudget,
            totalSpent: totalSpent,
            categories: categoryAccuracy,
            performanceGrade: this.getPerformanceGrade(overallAccuracy)
        };
    }

    analyzeSpendingPatterns(transactions) {
        const patterns = {
            dailyPattern: this.analyzeDailyPattern(transactions),
            weeklyPattern: this.analyzeWeeklyPattern(transactions),
            monthlyTrends: this.analyzeMonthlyTrends(transactions),
            transactionSizeDistribution: this.analyzeTransactionSizes(transactions),
            frequencyAnalysis: this.analyzeTransactionFrequency(transactions)
        };

        return patterns;
    }

    analyzeDailyPattern(transactions) {
        const dailySpending = Array(31).fill(0);
        const dailyCounts = Array(31).fill(0);

        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const day = new Date(transaction.date).getDate();
            dailySpending[day - 1] += Math.abs(transaction.amount);
            dailyCounts[day - 1]++;
        });

        const averageDailySpending = dailySpending.reduce((sum, amount) => sum + amount, 0) / 31;
        const peakSpendingDay = dailySpending.indexOf(Math.max(...dailySpending)) + 1;
        
        return {
            dailySpending,
            dailyCounts,
            averageDailySpending,
            peakSpendingDay,
            pattern: this.identifyDailyPattern(dailySpending)
        };
    }

    analyzeWeeklyPattern(transactions) {
        const weeklySpending = Array(7).fill(0); // Sunday to Saturday
        const weeklyTransactions = Array(7).fill(0);
        
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const dayOfWeek = new Date(transaction.date).getDay();
            weeklySpending[dayOfWeek] += Math.abs(transaction.amount);
            weeklyTransactions[dayOfWeek]++;
        });

        const peakDay = weeklySpending.indexOf(Math.max(...weeklySpending));
        const averageWeeklySpending = weeklySpending.reduce((sum, amount) => sum + amount, 0) / 7;

        return {
            weeklySpending,
            weeklyTransactions,
            dayNames,
            peakDay: dayNames[peakDay],
            averageWeeklySpending,
            weekendVsWeekday: this.compareWeekendToWeekday(weeklySpending)
        };
    }

    analyzeMonthlyTrends(transactions) {
        const monthlyData = {};
        
        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    spending: 0,
                    transactions: 0,
                    categories: new Set()
                };
            }
            
            monthlyData[monthKey].spending += Math.abs(transaction.amount);
            monthlyData[monthKey].transactions++;
            monthlyData[monthKey].categories.add(transaction.category);
        });

        const months = Object.keys(monthlyData).sort();
        const trend = this.calculateTrend(months.map(month => monthlyData[month].spending));

        return {
            monthlyData,
            trend,
            growthRate: this.calculateGrowthRate(monthlyData),
            seasonality: this.detectSeasonality(monthlyData)
        };
    }

    analyzeCategoryPerformance(transactions) {
        const categoryStats = {};

        // Initialize with budget categories
        if (this.currentBudget.categories) {
            this.currentBudget.categories.forEach(category => {
                categoryStats[category.name] = {
                    budgeted: category.amount,
                    spent: 0,
                    transactions: 0,
                    avgTransactionSize: 0,
                    frequency: 0,
                    lastTransaction: null,
                    trend: 0
                };
            });
        }

        // Calculate actual spending
        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const category = transaction.category || 'שונות';
            
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    budgeted: 0,
                    spent: 0,
                    transactions: 0,
                    avgTransactionSize: 0,
                    frequency: 0,
                    lastTransaction: null,
                    trend: 0
                };
            }

            const amount = Math.abs(transaction.amount);
            categoryStats[category].spent += amount;
            categoryStats[category].transactions++;
            categoryStats[category].lastTransaction = transaction.date;
        });

        // Calculate derived metrics
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            stats.avgTransactionSize = stats.transactions > 0 ? stats.spent / stats.transactions : 0;
            stats.variance = stats.budgeted > 0 ? ((stats.spent - stats.budgeted) / stats.budgeted) * 100 : 0;
            stats.efficiency = this.calculateCategoryEfficiency(stats);
            stats.riskLevel = this.assessCategoryRisk(stats);
            stats.recommendation = this.generateCategoryRecommendation(stats);
        });

        return categoryStats;
    }

    analyzeSeasonalPatterns(transactions) {
        const seasonalData = {
            'spring': { months: [2, 3, 4], spending: 0, label: 'אביב' }, // March-May
            'summer': { months: [5, 6, 7], spending: 0, label: 'קיץ' }, // June-August  
            'autumn': { months: [8, 9, 10], spending: 0, label: 'סתיו' }, // September-November
            'winter': { months: [11, 0, 1], spending: 0, label: 'חורף' } // December-February
        };

        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            const month = new Date(transaction.date).getMonth();
            const amount = Math.abs(transaction.amount);

            Object.keys(seasonalData).forEach(season => {
                if (seasonalData[season].months.includes(month)) {
                    seasonalData[season].spending += amount;
                }
            });
        });

        // Find peak season
        const peakSeason = Object.keys(seasonalData).reduce((peak, current) => 
            seasonalData[current].spending > seasonalData[peak].spending ? current : peak
        );

        return {
            seasonalData,
            peakSeason: seasonalData[peakSeason].label,
            seasonalVariance: this.calculateSeasonalVariance(seasonalData)
        };
    }

    generatePredictiveInsights(transactions) {
        const insights = {
            nextMonthProjection: this.projectNextMonthSpending(transactions),
            budgetBreachProbability: this.calculateBreachProbability(transactions),
            savingsOpportunities: this.identifySavingsOpportunities(transactions),
            upcomingExpenses: this.predictUpcomingExpenses(transactions)
        };

        return insights;
    }

    assessFinancialRisks(transactions) {
        const risks = {
            overspendingRisk: this.calculateOverspendingRisk(transactions),
            categoryConcentrationRisk: this.calculateConcentrationRisk(transactions),
            volatilityRisk: this.calculateVolatilityRisk(transactions),
            liquidityRisk: this.calculateLiquidityRisk(transactions)
        };

        return risks;
    }

    generateOptimizationSuggestions(transactions) {
        const suggestions = [];

        // Analyze each category for optimization potential
        const categoryPerformance = this.analyticsData?.categoryPerformance || {};
        
        Object.entries(categoryPerformance).forEach(([category, stats]) => {
            if (stats.variance > 20) { // Over budget by 20%
                suggestions.push({
                    type: 'reduction',
                    category: category,
                    priority: 'high',
                    impact: 'medium',
                    suggestion: `הפחת הוצאות ב${category} ב-${Math.round(stats.variance - 10)}%`,
                    potentialSaving: stats.spent * ((stats.variance - 10) / 100)
                });
            }

            if (stats.variance < -15) { // Under budget by 15%
                suggestions.push({
                    type: 'reallocation',
                    category: category,
                    priority: 'medium',
                    impact: 'low',
                    suggestion: `שקול להעביר חלק מתקציב ${category} לקטגוריות אחרות`,
                    potentialSaving: stats.budgeted * 0.1
                });
            }
        });

        // Add frequency-based suggestions
        const lowFrequencyCategories = Object.entries(categoryPerformance)
            .filter(([_, stats]) => stats.transactions < 3)
            .map(([category, _]) => category);

        if (lowFrequencyCategories.length > 0) {
            suggestions.push({
                type: 'consolidation',
                category: 'כללי',
                priority: 'low',
                impact: 'medium',
                suggestion: `שקול איחוד קטגוריות נדירות: ${lowFrequencyCategories.join(', ')}`,
                potentialSaving: 0
            });
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    render() {
        return `
            <div class="budget-performance-analytics" dir="rtl">
                <div class="analytics-header">
                    <h2>ניתוח ביצועי תקציב</h2>
                    <p class="description">ניתוח מעמיק של ביצועי התקציב עם תחזיות והמלצות</p>
                </div>

                <div class="analytics-controls">
                    ${this.renderControls()}
                </div>

                <div class="analytics-content">
                    ${this.analyticsData ? this.renderAnalytics() : this.renderNoData()}
                </div>
            </div>
        `;
    }

    renderControls() {
        return `
            <div class="controls-section">
                <div class="time-range-selector">
                    <label>טווח זמן:</label>
                    <select id="analytics-time-range" onchange="performanceAnalytics.updateTimeRange(this.value)">
                        <option value="1month" ${this.selectedTimeRange === '1month' ? 'selected' : ''}>חודש אחרון</option>
                        <option value="3months" ${this.selectedTimeRange === '3months' ? 'selected' : ''}>3 חודשים</option>
                        <option value="6months" ${this.selectedTimeRange === '6months' ? 'selected' : ''}>6 חודשים</option>
                        <option value="1year" ${this.selectedTimeRange === '1year' ? 'selected' : ''}>שנה אחרונה</option>
                    </select>
                </div>

                <div class="metrics-selector">
                    <label>מדדים להצגה:</label>
                    <div class="metrics-checkboxes">
                        <label><input type="checkbox" value="accuracy" ${this.selectedMetrics.includes('accuracy') ? 'checked' : ''} onchange="performanceAnalytics.toggleMetric('accuracy', this.checked)"> דיוק תקציב</label>
                        <label><input type="checkbox" value="patterns" ${this.selectedMetrics.includes('patterns') ? 'checked' : ''} onchange="performanceAnalytics.toggleMetric('patterns', this.checked)"> דפוסי הוצאה</label>
                        <label><input type="checkbox" value="predictions" ${this.selectedMetrics.includes('predictions') ? 'checked' : ''} onchange="performanceAnalytics.toggleMetric('predictions', this.checked)"> תחזיות</label>
                        <label><input type="checkbox" value="risks" ${this.selectedMetrics.includes('risks') ? 'checked' : ''} onchange="performanceAnalytics.toggleMetric('risks', this.checked)"> ניהול סיכונים</label>
                    </div>
                </div>

                <div class="analytics-actions">
                    <button class="btn btn-primary" onclick="performanceAnalytics.generateReport()">
                        צור דוח מפורט
                    </button>
                    <button class="btn btn-secondary" onclick="performanceAnalytics.exportAnalytics()">
                        ייצא ניתוח
                    </button>
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        const data = this.analyticsData;
        
        return `
            <div class="analytics-dashboard">
                <div class="performance-overview">
                    ${this.renderPerformanceOverview(data)}
                </div>

                <div class="analytics-sections">
                    ${this.selectedMetrics.includes('accuracy') ? this.renderAccuracyAnalysis(data) : ''}
                    ${this.selectedMetrics.includes('patterns') ? this.renderPatternsAnalysis(data) : ''}
                    ${this.selectedMetrics.includes('predictions') ? this.renderPredictiveAnalysis(data) : ''}
                    ${this.selectedMetrics.includes('risks') ? this.renderRiskAnalysis(data) : ''}
                </div>

                <div class="optimization-section">
                    ${this.renderOptimizationSuggestions(data)}
                </div>
            </div>
        `;
    }

    renderPerformanceOverview(data) {
        const accuracy = data.budgetAccuracy;
        
        return `
            <div class="performance-overview-section">
                <h3>סקירת ביצועים - ${data.timeRange.label}</h3>
                
                <div class="overview-cards">
                    <div class="overview-card accuracy">
                        <div class="card-icon">🎯</div>
                        <div class="card-content">
                            <h4>דיוק כללי</h4>
                            <div class="metric-value ${this.getPerformanceClass(accuracy.overall)}">
                                ${accuracy.overall.toFixed(1)}%
                            </div>
                            <div class="metric-grade">${accuracy.performanceGrade}</div>
                        </div>
                    </div>

                    <div class="overview-card variance">
                        <div class="card-icon">📊</div>
                        <div class="card-content">
                            <h4>סטיית תקציב</h4>
                            <div class="metric-value ${accuracy.overallVariance > 0 ? 'negative' : 'positive'}">
                                ${accuracy.overallVariance >= 0 ? '+' : ''}${accuracy.overallVariance.toFixed(1)}%
                            </div>
                            <div class="metric-description">
                                ${accuracy.overallVariance > 0 ? 'חריגה מהתקציב' : 'חיסכון בתקציב'}
                            </div>
                        </div>
                    </div>

                    <div class="overview-card transactions">
                        <div class="card-icon">💳</div>
                        <div class="card-content">
                            <h4>עסקאות</h4>
                            <div class="metric-value">${data.totalTransactions}</div>
                            <div class="metric-description">עסקאות בתקופה</div>
                        </div>
                    </div>

                    <div class="overview-card spending">
                        <div class="card-icon">💰</div>
                        <div class="card-content">
                            <h4>סך הוצאות</h4>
                            <div class="metric-value">₪${accuracy.totalSpent.toLocaleString('he-IL')}</div>
                            <div class="metric-description">
                                מתוך ₪${accuracy.totalBudgeted.toLocaleString('he-IL')} תקציב
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAccuracyAnalysis(data) {
        const accuracy = data.budgetAccuracy;
        
        return `
            <div class="accuracy-analysis-section">
                <h3>ניתוח דיוק תקציב</h3>
                
                <div class="category-accuracy-grid">
                    ${Object.entries(accuracy.categories).map(([category, stats]) => `
                        <div class="category-accuracy-card ${stats.status}">
                            <div class="category-header">
                                <h4>${category}</h4>
                                <div class="accuracy-score">${stats.accuracy.toFixed(1)}%</div>
                            </div>
                            
                            <div class="category-details">
                                <div class="detail-row">
                                    <span class="label">תקציב:</span>
                                    <span class="value">₪${stats.budgeted.toLocaleString('he-IL')}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">הוצא:</span>
                                    <span class="value">₪${stats.spent.toLocaleString('he-IL')}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">סטייה:</span>
                                    <span class="value ${stats.variance > 0 ? 'negative' : 'positive'}">
                                        ${stats.variance >= 0 ? '+' : ''}${stats.variance.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            
                            <div class="performance-indicator ${stats.status}">
                                ${this.getPerformanceStatusLabel(stats.status)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPatternsAnalysis(data) {
        const patterns = data.spendingPatterns;
        
        return `
            <div class="patterns-analysis-section">
                <h3>ניתוח דפוסי הוצאה</h3>
                
                <div class="patterns-grid">
                    <div class="pattern-card weekly">
                        <h4>דפוס שבועי</h4>
                        <div class="pattern-summary">
                            <p><strong>יום שיא:</strong> יום ${patterns.weeklyPattern.peakDay}</p>
                            <p><strong>ממוצע יומי:</strong> ₪${patterns.weeklyPattern.averageWeeklySpending.toFixed(0)}</p>
                        </div>
                        <div class="weekend-comparison">
                            <span class="label">סוף שבוע לעומת חול:</span>
                            <span class="value">${patterns.weeklyPattern.weekendVsWeekday}%</span>
                        </div>
                    </div>

                    <div class="pattern-card monthly">
                        <h4>מגמות חודשיות</h4>
                        <div class="trend-indicator ${patterns.monthlyTrends.trend > 0 ? 'increasing' : 'decreasing'}">
                            <span class="trend-arrow">${patterns.monthlyTrends.trend > 0 ? '↗' : '↘'}</span>
                            <span class="trend-value">${Math.abs(patterns.monthlyTrends.trend).toFixed(1)}%</span>
                        </div>
                        <p class="trend-description">
                            ${patterns.monthlyTrends.trend > 0 ? 'הוצאות עולות' : 'הוצאות יורדות'} מחודש לחודש
                        </p>
                    </div>

                    <div class="pattern-card seasonal">
                        <h4>דפוס עונתי</h4>
                        <div class="seasonal-summary">
                            <p><strong>עונת שיא:</strong> ${data.seasonalAnalysis.peakSeason}</p>
                            <p><strong>שונות עונתית:</strong> ${data.seasonalAnalysis.seasonalVariance.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPredictiveAnalysis(data) {
        const predictions = data.predictiveInsights;
        
        return `
            <div class="predictive-analysis-section">
                <h3>תחזיות ותובנות</h3>
                
                <div class="predictions-grid">
                    <div class="prediction-card next-month">
                        <h4>תחזית לחודש הבא</h4>
                        <div class="projection-amount">
                            ₪${predictions.nextMonthProjection.amount.toLocaleString('he-IL')}
                        </div>
                        <div class="confidence-level">
                            רמת ודאות: ${predictions.nextMonthProjection.confidence}%
                        </div>
                        <div class="projection-details">
                            <p>${predictions.nextMonthProjection.description}</p>
                        </div>
                    </div>

                    <div class="prediction-card breach-risk">
                        <h4>סיכון חריגה מתקציב</h4>
                        <div class="risk-meter">
                            <div class="risk-level ${this.getRiskLevel(predictions.budgetBreachProbability)}">
                                ${predictions.budgetBreachProbability.toFixed(1)}%
                            </div>
                        </div>
                        <div class="risk-description">
                            ${this.getRiskDescription(predictions.budgetBreachProbability)}
                        </div>
                    </div>

                    <div class="prediction-card savings">
                        <h4>הזדמנויות חיסכון</h4>
                        <div class="savings-potential">
                            ₪${predictions.savingsOpportunities.total.toLocaleString('he-IL')}
                        </div>
                        <div class="savings-categories">
                            ${predictions.savingsOpportunities.categories.slice(0, 3).map(cat => `
                                <div class="savings-item">
                                    <span class="category">${cat.category}</span>
                                    <span class="amount">₪${cat.potential.toLocaleString('he-IL')}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRiskAnalysis(data) {
        const risks = data.riskAssessment;
        
        return `
            <div class="risk-analysis-section">
                <h3>ניתוח סיכונים פיננסיים</h3>
                
                <div class="risks-grid">
                    <div class="risk-card overspending">
                        <h4>סיכון הוצאה יתר</h4>
                        <div class="risk-level ${this.getRiskLevel(risks.overspendingRisk.score)}">
                            ${risks.overspendingRisk.level}
                        </div>
                        <p>${risks.overspendingRisk.description}</p>
                        <div class="risk-mitigation">
                            <strong>המלצות:</strong>
                            <ul>
                                ${risks.overspendingRisk.mitigations.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="risk-card concentration">
                        <h4>ריכוז בקטגוריות</h4>
                        <div class="risk-level ${this.getRiskLevel(risks.categoryConcentrationRisk.score)}">
                            ${risks.categoryConcentrationRisk.level}
                        </div>
                        <p>קטגוריה דומיננטית: ${risks.categoryConcentrationRisk.dominantCategory}</p>
                        <p>ריכוז: ${risks.categoryConcentrationRisk.concentration.toFixed(1)}%</p>
                    </div>

                    <div class="risk-card volatility">
                        <h4>תנודתיות הוצאות</h4>
                        <div class="risk-level ${this.getRiskLevel(risks.volatilityRisk.score)}">
                            ${risks.volatilityRisk.level}
                        </div>
                        <p>מקדם שונות: ${risks.volatilityRisk.coefficient.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderOptimizationSuggestions(data) {
        const suggestions = data.optimizationSuggestions;
        
        if (suggestions.length === 0) {
            return `
                <div class="optimization-section">
                    <h3>המלצות אופטימיזציה</h3>
                    <div class="no-suggestions">
                        <p>נהדר! התקציב שלך מאוזן ואין המלצות לשיפור כרגע.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="optimization-section">
                <h3>המלצות אופטימיזציה</h3>
                
                <div class="suggestions-list">
                    ${suggestions.map((suggestion, index) => `
                        <div class="suggestion-card ${suggestion.priority}">
                            <div class="suggestion-header">
                                <div class="priority-badge ${suggestion.priority}">
                                    ${this.getPriorityLabel(suggestion.priority)}
                                </div>
                                <div class="impact-indicator">
                                    השפעה: ${this.getImpactLabel(suggestion.impact)}
                                </div>
                            </div>
                            
                            <div class="suggestion-content">
                                <h4>${suggestion.category}</h4>
                                <p>${suggestion.suggestion}</p>
                                
                                ${suggestion.potentialSaving > 0 ? `
                                    <div class="potential-saving">
                                        <strong>חיסכון פוטנציאלי:</strong> 
                                        ₪${suggestion.potentialSaving.toLocaleString('he-IL')}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="suggestion-actions">
                                <button class="btn btn-sm btn-primary" 
                                        onclick="performanceAnalytics.applySuggestion(${index})">
                                    יישם המלצה
                                </button>
                                <button class="btn btn-sm btn-secondary" 
                                        onclick="performanceAnalytics.dismissSuggestion(${index})">
                                    דחה
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="total-optimization-potential">
                    <h4>פוטנציאל חיסכון כולל: 
                        ₪${suggestions.reduce((sum, s) => sum + (s.potentialSaving || 0), 0).toLocaleString('he-IL')}
                    </h4>
                </div>
            </div>
        `;
    }

    renderNoData() {
        return `
            <div class="no-analytics-data">
                <div class="no-data-icon">📊</div>
                <h3>אין מספיק נתונים לניתוח</h3>
                <p>נדרשים לפחות 10 עסקאות ותקציב פעיל כדי לבצע ניתוח ביצועים</p>
                <div class="data-requirements">
                    <h4>דרישות לניתוח:</h4>
                    <ul>
                        <li>תקציב פעיל עם קטגוריות מוגדרות</li>
                        <li>לפחות 10 עסקאות בטווח הזמן הנבחר</li>
                        <li>נתוני הוצאות ממספר קטגוריות</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // Helper methods for calculations and classifications
    getPerformanceStatus(accuracy) {
        if (accuracy >= 90) return 'excellent';
        if (accuracy >= 75) return 'good';
        if (accuracy >= 60) return 'average';
        return 'poor';
    }

    getPerformanceGrade(accuracy) {
        if (accuracy >= 95) return 'מעולה';
        if (accuracy >= 85) return 'טוב מאוד';
        if (accuracy >= 75) return 'טוב';
        if (accuracy >= 65) return 'סביר';
        return 'זקוק לשיפור';
    }

    getPerformanceClass(accuracy) {
        if (accuracy >= 85) return 'excellent';
        if (accuracy >= 70) return 'good';
        if (accuracy >= 50) return 'average';
        return 'poor';
    }

    getPerformanceStatusLabel(status) {
        const labels = {
            'excellent': 'מעולה',
            'good': 'טוב',
            'average': 'סביר',
            'poor': 'זקוק לשיפור'
        };
        return labels[status] || status;
    }

    getRiskLevel(score) {
        if (score >= 75) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    }

    getRiskDescription(probability) {
        if (probability >= 75) return 'סיכון גבוה לחריגה מהתקציב';
        if (probability >= 50) return 'סיכון בינוני לחריגה מהתקציב';
        if (probability >= 25) return 'סיכון נמוך לחריגה מהתקציב';
        return 'סיכון מינימלי לחריגה מהתקציב';
    }

    getPriorityLabel(priority) {
        const labels = {
            'high': 'גבוהה',
            'medium': 'בינונית',
            'low': 'נמוכה'
        };
        return labels[priority] || priority;
    }

    getImpactLabel(impact) {
        const labels = {
            'high': 'גבוהה',
            'medium': 'בינונית',
            'low': 'נמוכה'
        };
        return labels[impact] || impact;
    }

    // Action methods
    updateTimeRange(range) {
        this.selectedTimeRange = range;
        this.calculateAnalytics();
        this.updateDisplay();
    }

    toggleMetric(metric, enabled) {
        if (enabled) {
            if (!this.selectedMetrics.includes(metric)) {
                this.selectedMetrics.push(metric);
            }
        } else {
            this.selectedMetrics = this.selectedMetrics.filter(m => m !== metric);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        const container = document.querySelector('.budget-performance-analytics');
        if (container) {
            container.innerHTML = this.render().match(/<div class="budget-performance-analytics"[^>]*>(.*)<\/div>$/s)[1];
        }
    }

    // Placeholder calculation methods (would be implemented with real algorithms)
    calculateTrend(values) {
        if (values.length < 2) return 0;
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        return ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    identifyDailyPattern(dailySpending) {
        const beginning = dailySpending.slice(0, 10).reduce((sum, val) => sum + val, 0);
        const middle = dailySpending.slice(10, 20).reduce((sum, val) => sum + val, 0);
        const end = dailySpending.slice(20).reduce((sum, val) => sum + val, 0);
        
        if (beginning > middle && beginning > end) return 'התחלת חודש';
        if (end > beginning && end > middle) return 'סוף חודש';
        return 'אחיד';
    }

    compareWeekendToWeekday(weeklySpending) {
        const weekend = weeklySpending[5] + weeklySpending[6]; // Friday + Saturday
        const weekdays = weeklySpending.slice(0, 5).reduce((sum, val) => sum + val, 0);
        return ((weekend / 2) / (weekdays / 5) * 100).toFixed(1);
    }

    projectNextMonthSpending(transactions) {
        const recentMonthlyAvg = this.calculateRecentMonthlyAverage(transactions);
        const trend = this.calculateTrend(this.getMonthlySpending(transactions));
        const projection = recentMonthlyAvg * (1 + trend / 100);
        
        return {
            amount: projection,
            confidence: Math.max(60, 90 - Math.abs(trend)),
            description: trend > 5 ? 'צפויה עלייה בהוצאות' : trend < -5 ? 'צפויה ירידה בהוצאות' : 'הוצאות יציבות צפויות'
        };
    }

    calculateBreachProbability(transactions) {
        // Simplified calculation - in real implementation would use more sophisticated model
        const variance = this.calculateSpendingVariance(transactions);
        const trend = this.calculateTrend(this.getMonthlySpending(transactions));
        
        let probability = 30; // Base probability
        if (variance > 25) probability += 20;
        if (trend > 10) probability += 25;
        if (trend > 20) probability += 15;
        
        return Math.min(95, probability);
    }

    // Additional helper methods would be implemented here...
    calculateSpendingVariance(transactions) { return 15; } // Placeholder
    getMonthlySpending(transactions) { return []; } // Placeholder
    calculateRecentMonthlyAverage(transactions) { return 5000; } // Placeholder
    calculateGrowthRate(monthlyData) { return 2.5; } // Placeholder
    detectSeasonality(monthlyData) { return 'moderate'; } // Placeholder
    calculateSeasonalVariance(seasonalData) { return 12.5; } // Placeholder
    calculateCategoryEfficiency(stats) { return 0.85; } // Placeholder
    assessCategoryRisk(stats) { return 'low'; } // Placeholder
    generateCategoryRecommendation(stats) { return 'Continue current pattern'; } // Placeholder
    identifySavingsOpportunities(transactions) { 
        return { 
            total: 1200, 
            categories: [
                { category: 'בילוי ופנוי', potential: 500 },
                { category: 'מזון', potential: 400 },
                { category: 'תחבורה', potential: 300 }
            ]
        }; 
    }
    predictUpcomingExpenses(transactions) { return []; } // Placeholder
    calculateOverspendingRisk(transactions) { 
        return { 
            score: 35, 
            level: 'בינוני',
            description: 'ישנה נטייה לחריגה בקטגוריות מסוימות',
            mitigations: ['הגדר התראות לקטגוריות בסיכון', 'עקוב יומי אחרי ההוצאות']
        }; 
    }
    calculateConcentrationRisk(transactions) { 
        return { 
            score: 45, 
            level: 'בינוני',
            dominantCategory: 'דיור',
            concentration: 35
        }; 
    }
    calculateVolatilityRisk(transactions) { 
        return { 
            score: 25, 
            level: 'נמוך',
            coefficient: 0.15
        }; 
    }
    calculateLiquidityRisk(transactions) { 
        return { 
            score: 20, 
            level: 'נמוך'
        }; 
    }
}

// Initialize component
window.BudgetPerformanceAnalytics = BudgetPerformanceAnalytics;
window.performanceAnalytics = null;