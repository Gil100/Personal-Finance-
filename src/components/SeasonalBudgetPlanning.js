/**
 * Hebrew Seasonal Budget Planning Component
 * Handles seasonal budget adjustments for Israeli holidays and seasons
 */
class SeasonalBudgetPlanning {
    constructor() {
        this.currentBudget = null;
        this.seasonalPlans = [];
        this.activeSeasonalPlan = null;
        this.israeliSeasons = this.initializeIsraeliSeasons();
        this.currentSeason = this.getCurrentSeason();
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadSeasonalPlans();
            await this.loadCurrentBudget();
        }
    }

    async loadSeasonalPlans() {
        try {
            const plans = await DataAPI.storage.getAll('seasonal_plans');
            this.seasonalPlans = Object.values(plans);
        } catch (error) {
            console.error('Failed to load seasonal plans:', error);
            this.seasonalPlans = [];
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

    initializeIsraeliSeasons() {
        const currentYear = new Date().getFullYear();
        
        return {
            'rosh-hashana': {
                id: 'rosh-hashana',
                name: 'ראש השנה וחגי תשרי',
                hebrewName: 'חגי תשרי',
                period: 'ספטמבר-אוקטובר',
                dates: {
                    start: new Date(currentYear, 8, 1), // September 1
                    end: new Date(currentYear, 9, 31)  // October 31
                },
                icon: '🍎',
                description: 'תקופת החגים - ראש השנה, יום כיפור, סוכות',
                defaultAdjustments: {
                    'מזון': { multiplier: 1.3, reason: 'סעודות חג ומתנות' },
                    'לבוש': { multiplier: 1.4, reason: 'בגדים חדשים לחג' },
                    'בילוי ופנוי': { multiplier: 1.2, reason: 'יציאות וחגיגות' },
                    'שונות': { multiplier: 1.5, reason: 'מתנות ותרומות' }
                },
                tips: [
                    'תכנן מראש רכישת מתנות',
                    'השווה מחירים לסעודות החג',
                    'שקול הכנת מזון בבית',
                    'הקצב תקציב לתרומות'
                ]
            },

            'winter': {
                id: 'winter',
                name: 'חורף',
                hebrewName: 'עונת החורף',
                period: 'נובמבר-פברואר',
                dates: {
                    start: new Date(currentYear, 10, 1), // November 1
                    end: new Date(currentYear + 1, 1, 28) // February 28
                },
                icon: '🌧️',
                description: 'עונת החורף - עלייה בחשמל וחימום',
                defaultAdjustments: {
                    'שירותים': { multiplier: 1.3, reason: 'חשמל וחימום' },
                    'לבוש': { multiplier: 1.2, reason: 'בגדי חורף' },
                    'בריאות': { multiplier: 1.1, reason: 'מחלות חורף' },
                    'בילוי ופנוי': { multiplier: 0.9, reason: 'פחות יציאות' }
                },
                tips: [
                    'הכן לעלייה בחשבון החשמל',
                    'שקול רכישת בגדי חורף באיכות',
                    'תכנן פעילויות בית',
                    'הקצב תקציב לחימום'
                ]
            },

            'pesach': {
                id: 'pesach',
                name: 'פסח',
                hebrewName: 'חג הפסח',
                period: 'מרץ-אפריל',
                dates: {
                    start: new Date(currentYear, 2, 1), // March 1
                    end: new Date(currentYear, 3, 30)  // April 30
                },
                icon: '🍷',
                description: 'הכנות לפסח - ניקיונות, מזון כשר לפסח, חופשה',
                defaultAdjustments: {
                    'מזון': { multiplier: 1.6, reason: 'מזון כשר לפסח ומצות' },
                    'שירותים': { multiplier: 1.2, reason: 'חשמל לניקיונות' },
                    'שונות': { multiplier: 1.4, reason: 'כלים וציוד לפסח' },
                    'בילוי ופנוי': { multiplier: 1.3, reason: 'טיולים בחול המועד' },
                    'תחבורה': { multiplier: 1.2, reason: 'נסיעות לטיולים' }
                },
                tips: [
                    'תכנן רכישות כשר לפסח מראש',
                    'השווה מחירים בין חנויות',
                    'שמור מוצרים שאינם צורכים חמץ',
                    'תקצב טיולי חול המועד'
                ]
            },

            'summer': {
                id: 'summer',
                name: 'קיץ וחופש גדול',
                hebrewName: 'החופש הגדול',
                period: 'יוני-אוגוסט',
                dates: {
                    start: new Date(currentYear, 5, 1), // June 1
                    end: new Date(currentYear, 7, 31)  // August 31
                },
                icon: '☀️',
                description: 'חופשת הקיץ - קייטנות, נופש, פעילויות ילדים',
                defaultAdjustments: {
                    'פעילויות ילדים': { multiplier: 2.0, reason: 'קייטנות וחוגי קיץ' },
                    'בילוי ופנוי': { multiplier: 1.8, reason: 'חופשות ונופש' },
                    'תחבורה': { multiplier: 1.4, reason: 'נסיעות ונופש' },
                    'מזון': { multiplier: 1.2, reason: 'ארוחות בחוץ' },
                    'שירותים': { multiplier: 1.3, reason: 'מזגן וחשמל' }
                },
                tips: [
                    'הרשם מוקדם לקייטנות להנחות',
                    'תכנן נופש מוקדם לחיסכון',
                    'שקול חופשה בארץ',
                    'הכן לעלייה בחשבון החשמל'
                ]
            },

            'back-to-school': {
                id: 'back-to-school',
                name: 'חזרה ללימודים',
                hebrewName: 'תחילת שנת הלימודים',
                period: 'אוגוסט-ספטמבר',
                dates: {
                    start: new Date(currentYear, 7, 15), // August 15
                    end: new Date(currentYear, 8, 30)   // September 30
                },
                icon: '📚',
                description: 'תחילת שנת הלימודים - ציוד, ספרים, בגדים',
                defaultAdjustments: {
                    'חינוך': { multiplier: 2.5, reason: 'שכר לימוד וציוד' },
                    'לבוש': { multiplier: 1.8, reason: 'בגדים חדשים לשנה' },
                    'פעילויות ילדים': { multiplier: 1.5, reason: 'הרשמה לחוגים' },
                    'תחבורה': { multiplier: 1.2, reason: 'נסיעות ללימודים' },
                    'שונות': { multiplier: 1.3, reason: 'ציוד וכלי עבודה' }
                },
                tips: [
                    'רשום ברשימת ציוד בזמן להנחות',
                    'בדוק אפשרות לספרים משומשים',
                    'השוה מחירי חוגים',
                    'תכנן מראש רכישת תיקים וציוד'
                ]
            }
        };
    }

    getCurrentSeason() {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();

        // Check each season's date range
        for (const season of Object.values(this.israeliSeasons)) {
            const start = season.dates.start;
            const end = season.dates.end;
            
            if (this.isDateInRange(now, start, end)) {
                return season.id;
            }
        }
        
        return null;
    }

    isDateInRange(date, start, end) {
        // Handle year transition for winter
        if (start > end) {
            return date >= start || date <= end;
        }
        return date >= start && date <= end;
    }

    render() {
        return `
            <div class="seasonal-budget-planning" dir="rtl">
                <div class="planning-header">
                    <h2>תכנון תקציב עונתי</h2>
                    <p class="description">התאם את התקציב שלך לעונות השנה והחגים הישראליים</p>
                </div>

                <div class="current-season-alert">
                    ${this.renderCurrentSeasonAlert()}
                </div>

                <div class="planning-content">
                    <div class="seasons-overview">
                        ${this.renderSeasonsOverview()}
                    </div>

                    <div class="seasonal-plans">
                        ${this.renderSeasonalPlans()}
                    </div>

                    <div class="planning-tools">
                        ${this.renderPlanningTools()}
                    </div>
                </div>
            </div>
        `;
    }

    renderCurrentSeasonAlert() {
        if (!this.currentSeason) {
            return `
                <div class="season-alert info">
                    <div class="alert-icon">📅</div>
                    <div class="alert-content">
                        <h3>תקופה רגילה</h3>
                        <p>אין עונה מיוחדת כרגע - התקציב הרגיל בתוקף</p>
                    </div>
                </div>
            `;
        }

        const season = this.israeliSeasons[this.currentSeason];
        return `
            <div class="season-alert ${this.currentSeason}">
                <div class="alert-icon">${season.icon}</div>
                <div class="alert-content">
                    <h3>עונה נוכחית: ${season.hebrewName}</h3>
                    <p>${season.description}</p>
                    <div class="season-actions">
                        <button class="btn btn-primary" onclick="seasonalPlanning.applySeasonalAdjustments('${this.currentSeason}')">
                            החל התאמות עונתיות
                        </button>
                        <button class="btn btn-secondary" onclick="seasonalPlanning.viewSeasonalPlan('${this.currentSeason}')">
                            צפה בתכנית
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSeasonsOverview() {
        return `
            <div class="seasons-overview-section">
                <h3>סקירת עונות השנה</h3>
                <div class="seasons-grid">
                    ${Object.values(this.israeliSeasons).map(season => `
                        <div class="season-card ${this.currentSeason === season.id ? 'current' : ''}" 
                             data-season="${season.id}">
                            <div class="season-header">
                                <div class="season-icon">${season.icon}</div>
                                <div class="season-info">
                                    <h4 class="season-name">${season.hebrewName}</h4>
                                    <p class="season-period">${season.period}</p>
                                </div>
                                ${this.currentSeason === season.id ? '<span class="current-badge">עכשיו</span>' : ''}
                            </div>
                            
                            <div class="season-description">
                                <p>${season.description}</p>
                            </div>
                            
                            <div class="season-adjustments">
                                <h5>התאמות עיקריות:</h5>
                                <div class="adjustments-list">
                                    ${Object.entries(season.defaultAdjustments).slice(0, 3).map(([category, adj]) => `
                                        <div class="adjustment-item">
                                            <span class="category">${category}</span>
                                            <span class="multiplier ${adj.multiplier > 1 ? 'increase' : 'decrease'}">
                                                ${adj.multiplier > 1 ? '+' : ''}${Math.round((adj.multiplier - 1) * 100)}%
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="season-actions">
                                <button class="btn btn-sm btn-secondary" 
                                        onclick="seasonalPlanning.createSeasonalPlan('${season.id}')">
                                    צור תכנית
                                </button>
                                <button class="btn btn-sm btn-ghost" 
                                        onclick="seasonalPlanning.viewSeasonDetails('${season.id}')">
                                    פרטים
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSeasonalPlans() {
        if (this.seasonalPlans.length === 0) {
            return `
                <div class="seasonal-plans-section">
                    <h3>תכניות עונתיות</h3>
                    <div class="no-plans">
                        <div class="no-plans-icon">📋</div>
                        <p>טרם נוצרו תכניות עונתיות</p>
                        <p class="subtitle">צור תכניות עונתיות כדי להכין את התקציב לעונות השנה</p>
                        <button class="btn btn-primary" onclick="seasonalPlanning.createFirstPlan()">
                            צור תכנית ראשונה
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="seasonal-plans-section">
                <div class="section-header">
                    <h3>התכניות העונתיות שלי (${this.seasonalPlans.length})</h3>
                    <button class="btn btn-primary" onclick="seasonalPlanning.createNewPlan()">
                        צור תכנית חדשה
                    </button>
                </div>
                
                <div class="plans-list">
                    ${this.seasonalPlans.map(plan => `
                        <div class="plan-card" data-plan-id="${plan.id}">
                            <div class="plan-header">
                                <div class="plan-info">
                                    <h4 class="plan-name">${plan.name}</h4>
                                    <p class="plan-season">${this.israeliSeasons[plan.seasonId]?.hebrewName || plan.seasonId}</p>
                                    <p class="plan-period">${plan.period}</p>
                                </div>
                                <div class="plan-status ${plan.status}">
                                    ${this.getPlanStatusDisplay(plan.status)}
                                </div>
                            </div>
                            
                            <div class="plan-budget-summary">
                                <div class="budget-item">
                                    <span class="label">תקציב בסיס:</span>
                                    <span class="value">₪${plan.baseBudget?.toLocaleString('he-IL') || '0'}</span>
                                </div>
                                <div class="budget-item">
                                    <span class="label">תקציב מותאם:</span>
                                    <span class="value adjusted">₪${plan.adjustedBudget?.toLocaleString('he-IL') || '0'}</span>
                                </div>
                                <div class="budget-item difference">
                                    <span class="label">הפרש:</span>
                                    <span class="value ${(plan.adjustedBudget - plan.baseBudget) > 0 ? 'increase' : 'decrease'}">
                                        ${(plan.adjustedBudget - plan.baseBudget) > 0 ? '+' : ''}₪${Math.abs(plan.adjustedBudget - plan.baseBudget).toLocaleString('he-IL')}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="plan-actions">
                                <button class="btn btn-sm btn-primary" onclick="seasonalPlanning.activatePlan('${plan.id}')">
                                    ${plan.status === 'active' ? 'מופעל' : 'הפעל'}
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="seasonalPlanning.editPlan('${plan.id}')">
                                    ערוך
                                </button>
                                <button class="btn btn-sm btn-ghost" onclick="seasonalPlanning.viewPlanDetails('${plan.id}')">
                                    פרטים
                                </button>
                                <button class="btn btn-sm btn-error" onclick="seasonalPlanning.deletePlan('${plan.id}')">
                                    מחק
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPlanningTools() {
        return `
            <div class="planning-tools-section">
                <h3>כלי תכנון</h3>
                <div class="tools-grid">
                    <div class="tool-card">
                        <div class="tool-icon">📊</div>
                        <h4>השוואת עונות</h4>
                        <p>השווה הוצאות בין עונות שונות</p>
                        <button class="btn btn-secondary" onclick="seasonalPlanning.compareSeasons()">
                            השווה עונות
                        </button>
                    </div>
                    
                    <div class="tool-card">
                        <div class="tool-icon">🎯</div>
                        <h4>יעדי חיסכון עונתיים</h4>
                        <p>הגדר יעדי חיסכון לפני עונות יקרות</p>
                        <button class="btn btn-secondary" onclick="seasonalPlanning.setSavingsGoals()">
                            הגדר יעדים
                        </button>
                    </div>
                    
                    <div class="tool-card">
                        <div class="tool-icon">📈</div>
                        <h4>ניתוח מגמות</h4>
                        <p>בדוק מגמות הוצאות לפי עונות</p>
                        <button class="btn btn-secondary" onclick="seasonalPlanning.analyzeTrends()">
                            נתח מגמות
                        </button>
                    </div>
                    
                    <div class="tool-card">
                        <div class="tool-icon">💡</div>
                        <h4>המלצות חיסכון</h4>
                        <p>קבל המלצות לחיסכון בכל עונה</p>
                        <button class="btn btn-secondary" onclick="seasonalPlanning.getSavingsTips()">
                            קבל המלצות
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Action methods
    async applySeasonalAdjustments(seasonId) {
        if (!this.currentBudget) {
            window.HebrewToasts?.show('לא נמצא תקציב פעיל', 'error');
            return;
        }

        const season = this.israeliSeasons[seasonId];
        if (!season) return;

        try {
            // Create adjusted budget categories
            const adjustedCategories = this.currentBudget.categories.map(category => {
                const adjustment = season.defaultAdjustments[category.name];
                if (adjustment) {
                    return {
                        ...category,
                        originalAmount: category.amount,
                        amount: Math.round(category.amount * adjustment.multiplier),
                        seasonalAdjustment: {
                            multiplier: adjustment.multiplier,
                            reason: adjustment.reason,
                            appliedOn: new Date().toISOString()
                        }
                    };
                }
                return category;
            });

            // Create seasonal plan
            const seasonalPlan = {
                id: `plan_${seasonId}_${Date.now()}`,
                name: `תכנית ${season.hebrewName} ${new Date().getFullYear()}`,
                seasonId,
                period: season.period,
                baseBudget: this.currentBudget.categories.reduce((sum, cat) => sum + cat.amount, 0),
                adjustedBudget: adjustedCategories.reduce((sum, cat) => sum + cat.amount, 0),
                categories: adjustedCategories,
                status: 'draft',
                createdAt: new Date().toISOString(),
                appliedSeason: season
            };

            // Save the plan
            await DataAPI.storage.save('seasonal_plans', seasonalPlan.id, seasonalPlan);
            this.seasonalPlans.push(seasonalPlan);

            // Show success and preview
            this.showSeasonalPlanPreview(seasonalPlan);
            window.HebrewToasts?.show(`תכנית עונתית ל${season.hebrewName} נוצרה בהצלחה`, 'success');

        } catch (error) {
            console.error('Failed to apply seasonal adjustments:', error);
            window.HebrewToasts?.show('שגיאה ביצירת התכנית העונתית', 'error');
        }
    }

    showSeasonalPlanPreview(plan) {
        const totalIncrease = plan.adjustedBudget - plan.baseBudget;
        const percentIncrease = ((totalIncrease / plan.baseBudget) * 100).toFixed(1);

        const content = `
            <div class="seasonal-plan-preview" dir="rtl">
                <div class="preview-header">
                    <h3>${plan.name}</h3>
                    <p>תצוגה מקדימה של התכנית העונתית</p>
                </div>
                
                <div class="budget-comparison">
                    <div class="comparison-item">
                        <span class="label">תקציב בסיס:</span>
                        <span class="value">₪${plan.baseBudget.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="comparison-item">
                        <span class="label">תקציב מותאם:</span>
                        <span class="value adjusted">₪${plan.adjustedBudget.toLocaleString('he-IL')}</span>
                    </div>
                    <div class="comparison-item total">
                        <span class="label">עלייה כוללת:</span>
                        <span class="value increase">+₪${totalIncrease.toLocaleString('he-IL')} (${percentIncrease}%)</span>
                    </div>
                </div>
                
                <div class="categories-adjustments">
                    <h4>התאמות לפי קטגוריות:</h4>
                    <div class="adjustments-table">
                        ${plan.categories
                            .filter(cat => cat.seasonalAdjustment)
                            .map(cat => `
                                <div class="adjustment-row">
                                    <span class="category-name">${cat.name}</span>
                                    <span class="original-amount">₪${cat.originalAmount.toLocaleString('he-IL')}</span>
                                    <span class="arrow">→</span>
                                    <span class="adjusted-amount">₪${cat.amount.toLocaleString('he-IL')}</span>
                                    <span class="change ${cat.amount > cat.originalAmount ? 'increase' : 'decrease'}">
                                        ${cat.amount > cat.originalAmount ? '+' : ''}₪${Math.abs(cat.amount - cat.originalAmount).toLocaleString('he-IL')}
                                    </span>
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <div class="seasonal-tips">
                    <h4>טיפים לעונה זו:</h4>
                    <ul class="tips-list">
                        ${plan.appliedSeason.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        const modal = window.HebrewModal?.create({
            title: 'תצוגה מקדימה - תכנית עונתית',
            content: content,
            size: 'large',
            showCloseButton: true,
            actions: [
                {
                    text: 'הפעל תכנית',
                    type: 'primary',
                    action: () => this.activatePlan(plan.id)
                },
                {
                    text: 'שמור כטיוטה',
                    type: 'secondary',
                    action: () => modal.hide()
                },
                {
                    text: 'ערוך תכנית',
                    type: 'secondary',
                    action: () => this.editPlan(plan.id)
                }
            ]
        });

        modal.show();
    }

    async activatePlan(planId) {
        const plan = this.seasonalPlans.find(p => p.id === planId);
        if (!plan) return;

        try {
            // Deactivate other plans
            this.seasonalPlans.forEach(p => {
                if (p.status === 'active') {
                    p.status = 'inactive';
                }
            });

            // Activate this plan
            plan.status = 'active';
            plan.activatedAt = new Date().toISOString();

            // Apply to current budget
            if (this.currentBudget) {
                this.currentBudget.categories = plan.categories;
                this.currentBudget.seasonalPlan = {
                    planId: plan.id,
                    appliedAt: new Date().toISOString()
                };
                
                await DataAPI.storage.save('budgets', this.currentBudget.id, this.currentBudget);
            }

            // Save plan changes
            await DataAPI.storage.save('seasonal_plans', plan.id, plan);

            window.HebrewToasts?.show(`התכנית "${plan.name}" הופעלה בהצלחה`, 'success');
            this.updateDisplay();

        } catch (error) {
            console.error('Failed to activate plan:', error);
            window.HebrewToasts?.show('שגיאה בהפעלת התכנית', 'error');
        }
    }

    createSeasonalPlan(seasonId) {
        const season = this.israeliSeasons[seasonId];
        if (!season) return;

        this.applySeasonalAdjustments(seasonId);
    }

    viewSeasonDetails(seasonId) {
        const season = this.israeliSeasons[seasonId];
        if (!season) return;

        const content = `
            <div class="season-details" dir="rtl">
                <div class="season-header">
                    <div class="season-icon-large">${season.icon}</div>
                    <h3>${season.hebrewName}</h3>
                    <p class="season-period">${season.period}</p>
                </div>
                
                <div class="season-description">
                    <p>${season.description}</p>
                </div>
                
                <div class="adjustments-details">
                    <h4>התאמות מומלצות:</h4>
                    <div class="adjustments-list">
                        ${Object.entries(season.defaultAdjustments).map(([category, adj]) => `
                            <div class="adjustment-detail">
                                <div class="adjustment-header">
                                    <span class="category-name">${category}</span>
                                    <span class="multiplier ${adj.multiplier > 1 ? 'increase' : 'decrease'}">
                                        ${adj.multiplier > 1 ? '+' : ''}${Math.round((adj.multiplier - 1) * 100)}%
                                    </span>
                                </div>
                                <p class="adjustment-reason">${adj.reason}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="seasonal-tips">
                    <h4>טיפים והמלצות:</h4>
                    <ul class="tips-list">
                        ${season.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        const modal = window.HebrewModal?.create({
            title: `פרטי עונה - ${season.hebrewName}`,
            content: content,
            size: 'medium',
            showCloseButton: true,
            actions: [
                {
                    text: 'צור תכנית לעונה זו',
                    type: 'primary',
                    action: () => this.createSeasonalPlan(seasonId)
                },
                {
                    text: 'סגור',
                    type: 'secondary',
                    action: () => modal.hide()
                }
            ]
        });

        modal.show();
    }

    getPlanStatusDisplay(status) {
        const statuses = {
            'draft': 'טיוטה',
            'active': 'פעיל',
            'inactive': 'לא פעיל',
            'completed': 'הושלם'
        };
        return statuses[status] || status;
    }

    updateDisplay() {
        const container = document.querySelector('.seasonal-budget-planning');
        if (container) {
            container.innerHTML = this.render().match(/<div class="seasonal-budget-planning"[^>]*>(.*)<\/div>$/s)[1];
        }
    }

    // Additional utility methods
    compareSeasons() {
        // Implementation for season comparison
        window.HebrewToasts?.show('השוואת עונות תהיה זמינה בקרוב', 'info');
    }

    setSavingsGoals() {
        // Implementation for savings goals
        window.HebrewToasts?.show('הגדרת יעדי חיסכון תהיה זמינה בקרוב', 'info');
    }

    analyzeTrends() {
        // Implementation for trend analysis
        window.HebrewToasts?.show('ניתוח מגמות יהיה זמין בקרוב', 'info');
    }

    getSavingsTips() {
        // Implementation for savings tips
        window.HebrewToasts?.show('המלצות חיסכון יהיו זמינות בקרוב', 'info');
    }
}

// Initialize component
window.SeasonalBudgetPlanning = SeasonalBudgetPlanning;
window.seasonalPlanning = null;