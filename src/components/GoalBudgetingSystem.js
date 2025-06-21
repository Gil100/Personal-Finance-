/**
 * Hebrew Goal-Based Budgeting System Component
 * Integrates financial goals with budget management
 */
class GoalBudgetingSystem {
    constructor() {
        this.goals = [];
        this.budgets = [];
        this.transactions = [];
        this.goalCategories = this.getIsraeliGoalCategories();
        this.savingsStrategies = this.getSavingsStrategies();
        this.achievementMilestones = [];
        this.initializeSystem();
    }

    getIsraeliGoalCategories() {
        return {
            'emergency': {
                name: 'קרן חירום',
                description: 'חיסכון לצרכים דחופים',
                icon: '🛡️',
                priority: 'critical',
                defaultAmount: 30000,
                timeframe: 12,
                tips: [
                    'מטרה: 3-6 חודשי הוצאות',
                    'שמור בחשבון נפרד',
                    'השקע בפקדונות נזילים',
                    'עדכן סכום כל שנה'
                ]
            },
            'home': {
                name: 'דירה/בית',
                description: 'מקדמה לרכישת נכס',
                icon: '🏠',
                priority: 'high',
                defaultAmount: 200000,
                timeframe: 60,
                tips: [
                    'חסוך 25-30% מערך הנכס',
                    'שקול תכניות חיסכון מותאמות',
                    'בדוק זכאות למשכנתא',
                    'התחשב בעלויות נוספות'
                ]
            },
            'retirement': {
                name: 'פנסיה',
                description: 'חיסכון לגיל הזהב',
                icon: '👴',
                priority: 'high',
                defaultAmount: 500000,
                timeframe: 240,
                tips: [
                    'השתמש בקרן פנסיה',
                    'נצל מעסיק מכפיל',
                    'התחל מוקדם ככל האפשר',
                    'סקור תיק השקעות'
                ]
            },
            'education': {
                name: 'השכלה',
                description: 'לימודים עליונים',
                icon: '🎓',
                priority: 'medium',
                defaultAmount: 50000,
                timeframe: 36,
                tips: [
                    'בדוק מלגות זמינות',
                    'שקול הלוואת סטודנטים',
                    'חפש תכניות סיוע',
                    'תכנן מראש'
                ]
            },
            'vacation': {
                name: 'חופשה',
                description: 'נסיעות ובילויים',
                icon: '🏖️',
                priority: 'medium',
                defaultAmount: 15000,
                timeframe: 12,
                tips: [
                    'הזמן מראש לחיסכון',
                    'חפש הנחות מוקדמות',
                    'שקול ביטוח נסיעות',
                    'תכנן תקציב יומי'
                ]
            },
            'car': {
                name: 'רכב',
                description: 'רכישת רכב חדש',
                icon: '🚗',
                priority: 'medium',
                defaultAmount: 80000,
                timeframe: 24,
                tips: [
                    'שקול רכב יד שנייה',
                    'בדוק אפשרויות ליסינג',
                    'חשב עלויות תחזוקה',
                    'נצל מבצעי סוף שנה'
                ]
            },
            'wedding': {
                name: 'חתונה',
                description: 'חתונה ואירועים',
                icon: '💒',
                priority: 'medium',
                defaultAmount: 120000,
                timeframe: 18,
                tips: [
                    'קבע תקציב מראש',
                    'חלק הוצאות עם המשפחות',
                    'שמור על רשימת אורחים',
                    'השווה מחירים'
                ]
            },
            'business': {
                name: 'עסק',
                description: 'השקעה בעסק',
                icon: '💼',
                priority: 'high',
                defaultAmount: 100000,
                timeframe: 36,
                tips: [
                    'הכן תוכנית עסקית',
                    'בדוק מקורות מימון',
                    'שמור הון חירום נפרד',
                    'התייעץ עם רואה חשבון'
                ]
            },
            'children': {
                name: 'ילדים',
                description: 'הוצאות ילדים',
                icon: '👶',
                priority: 'high',
                defaultAmount: 150000,
                timeframe: 216,
                tips: [
                    'חסוך מוקדם ככל האפשר',
                    'נצל תוכניות חיסכון ילדים',
                    'תכנן חינוך פרטי',
                    'שקול ביטוח חיים'
                ]
            },
            'investment': {
                name: 'השקעות',
                description: 'תיק השקעות',
                icon: '📈',
                priority: 'medium',
                defaultAmount: 75000,
                timeframe: 60,
                tips: [
                    'פזר השקעות',
                    'התחל בסכומים קטנים',
                    'למד על שוק ההון',
                    'התייעץ עם יועץ השקעות'
                ]
            }
        };
    }

    getSavingsStrategies() {
        return {
            'aggressive': {
                name: 'אגרסיבי',
                description: 'חיסכון מקסימלי למטרה',
                percentage: 25,
                pros: ['מגיע למטרה מהר', 'משמעת פיננסית גבוהה'],
                cons: ['פחות גמישות', 'לחץ על התקציב השוטף'],
                suitable: 'מתאים לבעלי הכנסה גבוהה או למטרות דחופות'
            },
            'moderate': {
                name: 'מתון',
                description: 'איזון בין חיסכון ואיכות חיים',
                percentage: 15,
                pros: ['איזון טוב', 'בר קיימא לטווח ארוך'],
                cons: ['זמן יותר ארוך להשגת המטרה'],
                suitable: 'מתאים לרוב האנשים'
            },
            'conservative': {
                name: 'זהיר',
                description: 'חיסכון נוח ללא לחץ',
                percentage: 10,
                pros: ['נוח ונעים', 'מתאים לתקציב מוגבל'],
                cons: ['זמן ארוך מאוד להשגת המטרה'],
                suitable: 'מתאים לתקציבים מוגבלים או מטרות לא דחופות'
            },
            'flexible': {
                name: 'גמיש',
                description: 'סכום משתנה לפי יכולת',
                percentage: 'variable',
                pros: ['מתאים לכל תקופה', 'ללא לחץ קבוע'],
                cons: ['קשה לחזות זמן השגת המטרה'],
                suitable: 'מתאים להכנסה לא קבועה'
            }
        };
    }

    async initializeSystem() {
        await this.loadData();
        this.calculateGoalProgress();
        this.generateRecommendations();
    }

    async loadData() {
        if (window.DataAPI) {
            try {
                const [goalsData, budgetsData, transactionsData] = await Promise.all([
                    DataAPI.storage.getAll('goals'),
                    DataAPI.storage.getAll('budgets'),
                    DataAPI.storage.getAll('transactions')
                ]);

                this.goals = Object.values(goalsData);
                this.budgets = Object.values(budgetsData).filter(b => b.status === 'active');
                this.transactions = Object.values(transactionsData);
            } catch (error) {
                console.error('Failed to load goal budgeting data:', error);
            }
        }
    }

    calculateGoalProgress() {
        this.goals.forEach(goal => {
            // Calculate savings toward this goal
            const goalTransactions = this.transactions.filter(t => 
                t.type === 'transfer' && 
                t.category === 'חיסכון' && 
                t.goalId === goal.id
            );

            const totalSaved = goalTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const progress = goal.targetAmount > 0 ? (totalSaved / goal.targetAmount) * 100 : 0;
            
            // Calculate time progress
            const startDate = new Date(goal.startDate || goal.createdAt);
            const targetDate = new Date(goal.targetDate);
            const now = new Date();
            const totalTime = targetDate.getTime() - startDate.getTime();
            const elapsedTime = now.getTime() - startDate.getTime();
            const timeProgress = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;

            goal.progress = {
                amount: totalSaved,
                percentage: Math.min(progress, 100),
                timeProgress: Math.min(Math.max(timeProgress, 0), 100),
                remaining: Math.max(goal.targetAmount - totalSaved, 0),
                onTrack: progress >= timeProgress * 0.9, // Allow 10% tolerance
                monthlyRequired: this.calculateMonthlyRequired(goal, totalSaved)
            };
        });
    }

    calculateMonthlyRequired(goal, currentAmount) {
        const remaining = goal.targetAmount - currentAmount;
        const targetDate = new Date(goal.targetDate);
        const now = new Date();
        const monthsRemaining = Math.max(
            (targetDate.getFullYear() - now.getFullYear()) * 12 + 
            (targetDate.getMonth() - now.getMonth()), 
            1
        );
        
        return Math.ceil(remaining / monthsRemaining);
    }

    generateRecommendations() {
        this.recommendations = [];

        // Goal prioritization recommendations
        const criticalGoals = this.goals.filter(g => 
            this.goalCategories[g.type]?.priority === 'critical' && 
            g.progress.percentage < 50
        );

        if (criticalGoals.length > 0) {
            this.recommendations.push({
                type: 'priority',
                level: 'high',
                title: 'יעדים קריטיים',
                message: `יש לך ${criticalGoals.length} יעדים קריטיים שטרם הושגו`,
                suggestion: 'מומלץ להתמקד תחילה ביעדים הקריטיים כמו קרן חירום',
                goals: criticalGoals.map(g => g.id)
            });
        }

        // Savings rate recommendations
        const totalMonthlyRequired = this.goals.reduce((sum, goal) => 
            sum + (goal.progress.monthlyRequired || 0), 0
        );

        const currentBudget = this.budgets[0];
        if (currentBudget && totalMonthlyRequired > 0) {
            const savingsRate = (totalMonthlyRequired / currentBudget.totalIncome) * 100;
            
            if (savingsRate > 30) {
                this.recommendations.push({
                    type: 'budget',
                    level: 'warning',
                    title: 'קצב חיסכון גבוה',
                    message: `נדרש חיסכון של ${savingsRate.toFixed(1)}% מההכנסה`,
                    suggestion: 'שקול להאריך לוחות זמנים או לתעדף יעדים חשובים יותר'
                });
            } else if (savingsRate < 10) {
                this.recommendations.push({
                    type: 'opportunity',
                    level: 'info',
                    title: 'הזדמנות להגדיל חיסכון',
                    message: `אתה חוסך רק ${savingsRate.toFixed(1)}% מההכנסה`,
                    suggestion: 'יש לך מקום להגדיל את החיסכון ולהוסיף יעדים נוספים'
                });
            }
        }

        // Goal achievement recommendations
        const achievableGoals = this.goals.filter(g => 
            g.progress.percentage > 90 && g.progress.percentage < 100
        );

        if (achievableGoals.length > 0) {
            this.recommendations.push({
                type: 'achievement',
                level: 'success',
                title: 'יעדים קרובים להשגה',
                message: `${achievableGoals.length} יעדים קרובים להשגה`,
                suggestion: 'עוד מעט והגעת ליעד! שקול מאמץ נוסף קטן',
                goals: achievableGoals.map(g => g.id)
            });
        }
    }

    render() {
        return `
            <div class="goal-budgeting-system">
                ${this.renderHeader()}
                ${this.renderGoalsDashboard()}
                ${this.renderBudgetIntegration()}
                ${this.renderRecommendations()}
                ${this.renderGoalWizard()}
            </div>
        `;
    }

    renderHeader() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.progress?.percentage >= 100).length;
        const totalTargetAmount = this.goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalSavedAmount = this.goals.reduce((sum, g) => sum + (g.progress?.amount || 0), 0);
        const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

        return `
            <div class="goal-system-header">
                <div class="header-title">
                    <h1>מערכת יעדים פיננסיים</h1>
                    <p>נהל את כל היעדים הפיננסיים שלך במקום אחד</p>
                </div>

                <div class="goal-overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <span class="stat-label">יעדים פעילים</span>
                            <span class="stat-value">${totalGoals}</span>
                            <span class="stat-secondary">${completedGoals} הושגו</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <span class="stat-label">סך חסכון יעדים</span>
                            <span class="stat-value">₪${totalSavedAmount.toLocaleString('he-IL')}</span>
                            <span class="stat-secondary">מתוך ₪${totalTargetAmount.toLocaleString('he-IL')}</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <span class="stat-label">התקדמות כללית</span>
                            <span class="stat-value">${Math.round(overallProgress)}%</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-content">
                            <span class="stat-label">יעדים בלוח זמנים</span>
                            <span class="stat-value">${this.goals.filter(g => g.progress?.onTrack).length}</span>
                            <span class="stat-secondary">מתוך ${totalGoals}</span>
                        </div>
                    </div>
                </div>

                <div class="overall-progress-bar">
                    <div class="progress-bar large">
                        <div class="progress-fill" style="width: ${overallProgress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(overallProgress)}% מכלל היעדים הושגו</span>
                </div>
            </div>
        `;
    }

    renderGoalsDashboard() {
        if (this.goals.length === 0) {
            return this.renderNoGoals();
        }

        const sortedGoals = this.goals.sort((a, b) => {
            // Sort by priority and progress
            const aPriority = this.goalCategories[a.type]?.priority || 'low';
            const bPriority = this.goalCategories[b.type]?.priority || 'low';
            const priorities = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
            
            if (priorities[aPriority] !== priorities[bPriority]) {
                return priorities[bPriority] - priorities[aPriority];
            }
            
            return (b.progress?.percentage || 0) - (a.progress?.percentage || 0);
        });

        return `
            <div class="goals-dashboard">
                <div class="dashboard-header">
                    <h2>היעדים שלי</h2>
                    <div class="dashboard-actions">
                        <button type="button" class="action-btn secondary" id="sort-goals">
                            🔄 מיין
                        </button>
                        <button type="button" class="action-btn primary" id="add-goal">
                            ➕ יעד חדש
                        </button>
                    </div>
                </div>

                <div class="goals-grid">
                    ${sortedGoals.map(goal => this.renderGoalCard(goal)).join('')}
                </div>
            </div>
        `;
    }

    renderNoGoals() {
        return `
            <div class="no-goals-state">
                <div class="no-goals-content">
                    <div class="no-goals-icon">🎯</div>
                    <h2>טרם הגדרת יעדים פיננסיים</h2>
                    <p>הגדרת יעדים תעזור לך להישאר מוטיב ולהגיע למקום שאתה רוצה</p>
                    
                    <button type="button" class="create-first-goal-btn" id="create-first-goal">
                        צור יעד ראשון
                    </button>

                    <div class="goal-categories-preview">
                        <h3>קטגוריות יעדים פופולריות:</h3>
                        <div class="categories-grid">
                            ${Object.entries(this.goalCategories).slice(0, 6).map(([key, category]) => `
                                <div class="category-preview" data-category="${key}">
                                    <div class="category-icon">${category.icon}</div>
                                    <span class="category-name">${category.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoalCard(goal) {
        const category = this.goalCategories[goal.type] || {};
        const progress = goal.progress || {};
        const statusClass = progress.onTrack ? 'on-track' : 'behind-schedule';
        const completedClass = progress.percentage >= 100 ? 'completed' : '';

        return `
            <div class="goal-card ${statusClass} ${completedClass}" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-identity">
                        <div class="goal-icon">${category.icon || '🎯'}</div>
                        <div class="goal-info">
                            <h3 class="goal-name">${goal.name}</h3>
                            <span class="goal-category">${category.name || goal.type}</span>
                        </div>
                    </div>
                    <div class="goal-status">
                        ${progress.percentage >= 100 ? '✅' : progress.onTrack ? '🟢' : '🟡'}
                    </div>
                </div>

                <div class="goal-amounts">
                    <div class="amount-row primary">
                        <span class="amount-label">יעד:</span>
                        <span class="amount-value">₪${goal.targetAmount.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">נחסך:</span>
                        <span class="amount-value saved">₪${(progress.amount || 0).toLocaleString('he-IL')}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">נותר:</span>
                        <span class="amount-value remaining">₪${(progress.remaining || goal.targetAmount).toLocaleString('he-IL')}</span>
                    </div>
                </div>

                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage || 0}%"></div>
                        <div class="time-indicator" style="left: ${progress.timeProgress || 0}%"></div>
                    </div>
                    <div class="progress-details">
                        <span class="progress-text">${Math.round(progress.percentage || 0)}% הושג</span>
                        <span class="time-text">${Math.round(progress.timeProgress || 0)}% מהזמן עבר</span>
                    </div>
                </div>

                <div class="goal-timeline">
                    <div class="timeline-item">
                        <span class="timeline-label">תאריך יעד:</span>
                        <span class="timeline-date">${this.formatDate(goal.targetDate)}</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-label">נדרש חודשי:</span>
                        <span class="timeline-amount">₪${(progress.monthlyRequired || 0).toLocaleString('he-IL')}</span>
                    </div>
                </div>

                <div class="goal-actions">
                    <button type="button" class="goal-action-btn primary" data-action="add-savings" data-goal-id="${goal.id}">
                        💰 הוסף חיסכון
                    </button>
                    <button type="button" class="goal-action-btn secondary" data-action="view-details" data-goal-id="${goal.id}">
                        📊 פרטים
                    </button>
                    <button type="button" class="goal-action-btn secondary" data-action="edit-goal" data-goal-id="${goal.id}">
                        ✏️ ערוך
                    </button>
                </div>

                ${progress.percentage >= 100 ? `
                    <div class="achievement-celebration">
                        <div class="celebration-message">
                            🎉 מזל טוב! הגעת ליעד! 🎉
                        </div>
                        <button type="button" class="celebrate-btn" data-goal-id="${goal.id}">
                            חגוג הישג
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderBudgetIntegration() {
        const currentBudget = this.budgets[0];
        if (!currentBudget) {
            return `
                <div class="budget-integration-section">
                    <h2>קישור לתקציב</h2>
                    <div class="no-budget-notice">
                        <p>צור תקציב כדי לקשר את היעדים שלך לתכנון החודשי</p>
                        <button type="button" class="create-budget-btn" id="create-budget-for-goals">
                            צור תקציב
                        </button>
                    </div>
                </div>
            `;
        }

        const totalMonthlyRequired = this.goals.reduce((sum, goal) => 
            sum + (goal.progress?.monthlyRequired || 0), 0
        );
        const budgetedSavings = currentBudget.categories.find(c => c.name === 'חיסכון')?.amount || 0;
        const savingsGap = totalMonthlyRequired - budgetedSavings;

        return `
            <div class="budget-integration-section">
                <h2>קישור לתקציב החודשי</h2>
                
                <div class="integration-overview">
                    <div class="integration-card">
                        <h3>סיכום חיסכון יעדים</h3>
                        <div class="savings-comparison">
                            <div class="comparison-item">
                                <span class="comparison-label">נדרש ליעדים:</span>
                                <span class="comparison-value required">₪${totalMonthlyRequired.toLocaleString('he-IL')}</span>
                            </div>
                            <div class="comparison-item">
                                <span class="comparison-label">מתוקצב לחיסכון:</span>
                                <span class="comparison-value budgeted">₪${budgetedSavings.toLocaleString('he-IL')}</span>
                            </div>
                            <div class="comparison-item ${savingsGap > 0 ? 'gap' : 'surplus'}">
                                <span class="comparison-label">${savingsGap > 0 ? 'חסר:' : 'עודף:'}</span>
                                <span class="comparison-value">₪${Math.abs(savingsGap).toLocaleString('he-IL')}</span>
                            </div>
                        </div>

                        ${savingsGap > 0 ? `
                            <div class="integration-alert warning">
                                <div class="alert-icon">⚠️</div>
                                <div class="alert-content">
                                    <strong>פער בתקציב החיסכון</strong>
                                    <p>אתה צריך ₪${savingsGap.toLocaleString('he-IL')} נוספים בחודש כדי להגיע לכל היעדים</p>
                                </div>
                            </div>
                        ` : savingsGap < -1000 ? `
                            <div class="integration-alert success">
                                <div class="alert-icon">✅</div>
                                <div class="alert-content">
                                    <strong>עודף בתקציב החיסכון</strong>
                                    <p>יש לך ₪${Math.abs(savingsGap).toLocaleString('he-IL')} נוספים - שקול יעדים חדשים</p>
                                </div>
                            </div>
                        ` : `
                            <div class="integration-alert success">
                                <div class="alert-icon">🎯</div>
                                <div class="alert-content">
                                    <strong>תקציב מאוזן</strong>
                                    <p>התקציב שלך מאוזן עם היעדים שלך</p>
                                </div>
                            </div>
                        `}
                    </div>

                    <div class="goal-breakdown">
                        <h3>פירוט יעדים בתקציב</h3>
                        <div class="breakdown-list">
                            ${this.goals.map(goal => `
                                <div class="breakdown-item">
                                    <div class="breakdown-goal">
                                        <span class="goal-icon">${this.goalCategories[goal.type]?.icon || '🎯'}</span>
                                        <span class="goal-name">${goal.name}</span>
                                    </div>
                                    <div class="breakdown-amount">
                                        ₪${(goal.progress?.monthlyRequired || 0).toLocaleString('he-IL')}/חודש
                                    </div>
                                    <div class="breakdown-progress">
                                        <div class="mini-progress-bar">
                                            <div class="mini-progress-fill" style="width: ${goal.progress?.percentage || 0}%"></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="integration-actions">
                    ${savingsGap > 0 ? `
                        <button type="button" class="action-btn primary" id="adjust-budget-for-goals">
                            🎯 התאם תקציב ליעדים
                        </button>
                        <button type="button" class="action-btn secondary" id="prioritize-goals">
                            📊 תעדף יעדים
                        </button>
                    ` : `
                        <button type="button" class="action-btn primary" id="add-new-goal">
                            ➕ הוסף יעד חדש
                        </button>
                        <button type="button" class="action-btn secondary" id="optimize-savings">
                            ⚡ אופטימיזציה
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderRecommendations() {
        if (this.recommendations.length === 0) {
            return '';
        }

        return `
            <div class="goal-recommendations-section">
                <h2>המלצות אישיות</h2>
                <div class="recommendations-list">
                    ${this.recommendations.map(rec => `
                        <div class="recommendation-card ${rec.level}">
                            <div class="recommendation-icon">
                                ${rec.level === 'high' ? '🚨' : 
                                  rec.level === 'warning' ? '⚠️' : 
                                  rec.level === 'success' ? '✅' : '💡'}
                            </div>
                            <div class="recommendation-content">
                                <h4>${rec.title}</h4>
                                <p class="recommendation-message">${rec.message}</p>
                                <p class="recommendation-suggestion">${rec.suggestion}</p>
                            </div>
                            <div class="recommendation-actions">
                                <button type="button" class="recommendation-action-btn" data-rec-type="${rec.type}">
                                    טפל בזה
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGoalWizard() {
        return `
            <div class="goal-wizard-section">
                <h2>אשף יצירת יעד</h2>
                <p>אשף פשוט וחכם ליצירת יעדים פיננסיים מותאמים אישית</p>
                
                <div class="wizard-preview">
                    <div class="wizard-steps">
                        <div class="wizard-step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>בחר סוג יעד</h4>
                                <p>מתוך 10 קטגוריות מותאמות לישראל</p>
                            </div>
                        </div>
                        <div class="wizard-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>הגדר פרטים</h4>
                                <p>סכום, לוח זמנים ואסטרטגיית חיסכון</p>
                            </div>
                        </div>
                        <div class="wizard-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>קישור לתקציב</h4>
                                <p>אינטגרציה אוטומטית עם התקציב החודשי</p>
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" class="start-wizard-btn" id="start-goal-wizard">
                        התחל אשף יצירת יעד
                    </button>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    attachEventListeners() {
        // Goal actions
        document.querySelectorAll('.goal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const goalId = e.target.dataset.goalId;
                this.handleGoalAction(action, goalId);
            });
        });

        // Category preview clicks
        document.querySelectorAll('.category-preview').forEach(card => {
            card.addEventListener('click', (e) => {
                const categoryType = e.target.closest('.category-preview').dataset.category;
                this.createGoalFromCategory(categoryType);
            });
        });

        // Main action buttons
        document.getElementById('add-goal')?.addEventListener('click', () => this.showGoalCreationWizard());
        document.getElementById('create-first-goal')?.addEventListener('click', () => this.showGoalCreationWizard());
        document.getElementById('start-goal-wizard')?.addEventListener('click', () => this.showGoalCreationWizard());

        // Integration actions
        document.getElementById('adjust-budget-for-goals')?.addEventListener('click', () => this.adjustBudgetForGoals());
        document.getElementById('prioritize-goals')?.addEventListener('click', () => this.showGoalPrioritization());
        document.getElementById('add-new-goal')?.addEventListener('click', () => this.showGoalCreationWizard());

        // Recommendation actions
        document.querySelectorAll('.recommendation-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recType = e.target.dataset.recType;
                this.handleRecommendationAction(recType);
            });
        });
    }

    handleGoalAction(action, goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        switch(action) {
            case 'add-savings':
                this.showAddSavingsModal(goal);
                break;
            case 'view-details':
                this.showGoalDetails(goal);
                break;
            case 'edit-goal':
                this.showEditGoalModal(goal);
                break;
        }
    }

    createGoalFromCategory(categoryType) {
        const category = this.goalCategories[categoryType];
        if (category && window.BudgetWizard) {
            // Pre-fill goal creation with category defaults
            this.showGoalCreationWizard({
                type: categoryType,
                name: category.name,
                targetAmount: category.defaultAmount,
                timeframe: category.timeframe
            });
        }
    }

    showGoalCreationWizard(presetData = {}) {
        // Implementation would show goal creation wizard
        console.log('Opening goal creation wizard with preset:', presetData);
    }

    showAddSavingsModal(goal) {
        // Implementation would show modal for adding savings to a goal
        console.log('Adding savings to goal:', goal.name);
    }

    showGoalDetails(goal) {
        // Implementation would show detailed goal view
        console.log('Showing details for goal:', goal.name);
    }

    adjustBudgetForGoals() {
        // Implementation would help adjust budget to accommodate goals
        console.log('Adjusting budget for goals');
    }

    handleRecommendationAction(recType) {
        switch(recType) {
            case 'priority':
                this.showGoalPrioritization();
                break;
            case 'budget':
                this.adjustBudgetForGoals();
                break;
            case 'opportunity':
                this.showGoalCreationWizard();
                break;
            case 'achievement':
                this.showAchievementCelebration();
                break;
        }
    }

    showAchievementCelebration() {
        if (window.HebrewToasts) {
            HebrewToasts.show('🎉 מזל טוב על ההישגים המעולים! 🎉', 'success', { duration: 5000 });
        }
    }

    updateDisplay() {
        const container = document.querySelector('.goal-budgeting-system');
        if (container) {
            container.outerHTML = this.render();
            this.attachEventListeners();
        }
    }
}

// Export for use in other components
window.GoalBudgetingSystem = GoalBudgetingSystem;