/**
 * Hebrew Budget Creation Wizard Component
 * Guides users through budget setup with Israeli-specific features
 */
import israeliBudgetTemplates from '../utils/israeli-budget-templates.js';

class BudgetWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // Added template step
        this.budgetData = {
            name: '',
            period: 'monthly',
            totalIncome: 0,
            categories: [],
            goals: [],
            startDate: new Date().toISOString().split('T')[0],
            currency: 'ILS',
            selectedTemplate: null
        };
        this.suggestedAllocations = this.getIsraeliHouseholdAllocations();
        this.availableTemplates = israeliBudgetTemplates.getAllTemplates();
    }

    getIsraeliHouseholdAllocations() {
        return {
            'דיור': { percentage: 35, description: 'שכר דירה, משכנתא, ארנונה' },
            'מזון': { percentage: 15, description: 'קניות, מסעדות, אוכל' },
            'תחבורה': { percentage: 12, description: 'דלק, חניה, תחבורה ציבורית' },
            'ביטוח לאומי ומיסים': { percentage: 18, description: 'ביטוח לאומי, מס הכנסה' },
            'בריאות': { percentage: 8, description: 'ביטוח בריאות, תרופות, רופאים' },
            'חינוך': { percentage: 5, description: 'חינוך פרטי, משכורת' },
            'חסכונות': { percentage: 7, description: 'חסכונות לטווח ארוך' }
        };
    }

    render() {
        return `
            <div class="budget-wizard" data-current-step="${this.currentStep}">
                ${this.renderHeader()}
                ${this.renderProgressBar()}
                ${this.renderCurrentStep()}
                ${this.renderNavigation()}
            </div>
        `;
    }

    renderHeader() {
        const steps = [
            'פרטים כלליים',
            'בחירת תבנית',
            'הכנסות',
            'קטגוריות תקציב',
            'יעדים ומטרות'
        ];

        return `
            <div class="wizard-header">
                <h2 class="wizard-title">יצירת תקציב חדש</h2>
                <p class="wizard-subtitle">${steps[this.currentStep - 1]}</p>
            </div>
        `;
    }

    renderProgressBar() {
        const progressPercent = (this.currentStep / this.totalSteps) * 100;
        
        return `
            <div class="wizard-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">שלב ${this.currentStep} מתוך ${this.totalSteps}</span>
            </div>
        `;
    }

    renderCurrentStep() {
        switch(this.currentStep) {
            case 1: return this.renderGeneralInfoStep();
            case 2: return this.renderTemplateSelectionStep();
            case 3: return this.renderIncomeStep();
            case 4: return this.renderCategoriesStep();
            case 5: return this.renderGoalsStep();
            default: return '';
        }
    }

    renderGeneralInfoStep() {
        return `
            <div class="wizard-step step-general">
                <div class="step-content">
                    <div class="form-group">
                        <label for="budget-name">שם התקציב</label>
                        <input 
                            type="text" 
                            id="budget-name" 
                            value="${this.budgetData.name}"
                            placeholder="לדוגמה: תקציב משפחתי יוני 2025"
                            class="form-input"
                        >
                        <small class="form-help">בחר שם שיעזור לך לזהות את התקציב</small>
                    </div>

                    <div class="form-group">
                        <label for="budget-period">תקופת התקציב</label>
                        <select id="budget-period" class="form-select">
                            <option value="weekly" ${this.budgetData.period === 'weekly' ? 'selected' : ''}>שבועי</option>
                            <option value="monthly" ${this.budgetData.period === 'monthly' ? 'selected' : ''}>חודשי</option>
                            <option value="quarterly" ${this.budgetData.period === 'quarterly' ? 'selected' : ''}>רבעוני</option>
                            <option value="yearly" ${this.budgetData.period === 'yearly' ? 'selected' : ''}>שנתי</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="budget-start-date">תאריך התחלה</label>
                        <input 
                            type="date" 
                            id="budget-start-date" 
                            value="${this.budgetData.startDate}"
                            class="form-input"
                        >
                    </div>

                    <div class="budget-tips">
                        <h4>💡 טיפים ליצירת תקציב מוצלח</h4>
                        <ul>
                            <li>התחל עם תקציב פשוט ושדרג בהדרגה</li>
                            <li>השתמש בנתונים מהחודשים הקודמים</li>
                            <li>הכלל מקום להוצאות לא צפויות</li>
                            <li>עדכן את התקציב לפי השינויים בחיים</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplateSelectionStep() {
        return `
            <div class="wizard-step step-templates">
                <div class="step-content">
                    <div class="template-section">
                        <h3>בחר תבנית תקציב מתאימה</h3>
                        <p class="section-description">תבניות מותאמות לסוגי משקי בית שונים בישראל</p>
                        
                        <div class="template-options">
                            ${this.availableTemplates.map(template => `
                                <div class="template-card ${this.budgetData.selectedTemplate === template.id ? 'selected' : ''}" 
                                     data-template-id="${template.id}">
                                    <div class="template-header">
                                        <span class="template-icon">${template.icon}</span>
                                        <h4 class="template-name">${template.name}</h4>
                                    </div>
                                    <p class="template-description">${template.description}</p>
                                    <div class="template-preview">
                                        <div class="income-range">הכנסה משוערת: ₪${template.targetIncome.toLocaleString()}</div>
                                        <div class="top-categories">
                                            קטגוריות עיקריות:
                                            ${template.categories.slice(0, 3).map(cat => 
                                                `<span class="category-tag">${cat.name} (${cat.percentage}%)</span>`
                                            ).join('')}
                                        </div>
                                    </div>
                                    
                                    ${this.budgetData.selectedTemplate === template.id ? `
                                        <div class="template-details">
                                            <h5>פירוט התבנית:</h5>
                                            <div class="category-breakdown">
                                                ${template.categories.map(cat => `
                                                    <div class="category-item">
                                                        <span class="category-name">${cat.name}</span>
                                                        <span class="category-amount">${cat.percentage}% (₪${cat.amount.toLocaleString()})</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                            
                                            <div class="template-tips">
                                                <h5>💡 טיפים לתבנית זו:</h5>
                                                <ul>
                                                    ${template.tips.map(tip => `<li>${tip}</li>`).join('')}
                                                </ul>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="template-customization">
                            <div class="custom-option">
                                <input type="radio" id="custom-template" name="template" value="custom" 
                                       ${this.budgetData.selectedTemplate === 'custom' ? 'checked' : ''}>
                                <label for="custom-template">
                                    <strong>🔧 תבנית מותאמת אישית</strong>
                                    <span class="custom-description">צור תקציב מאפס בהתאם לצרכים שלך</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="template-info">
                            <div class="info-box">
                                <h4>ℹ️ על התבניות</h4>
                                <p>התבניות מבוססות על מחקר של הוצאות משקי בית ישראליים טיפוסיים. 
                                ניתן להתאים אותן לפי ההכנסה שלך בשלב הבא.</p>
                                <p><strong>שים לב:</strong> האחוזים והסכומים הם המלצות בלבד, ניתן לעדכן אותם בהמשך.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderIncomeStep() {
        return `
            <div class="wizard-step step-income">
                <div class="step-content">
                    <div class="income-section">
                        <h3>הכנסות חודשיות</h3>
                        <p class="section-description">הזן את כל מקורות ההכנסה שלך</p>

                        <div class="income-sources">
                            <div class="form-group">
                                <label for="primary-income">משכורת עיקרית (נטו)</label>
                                <div class="currency-input">
                                    <input 
                                        type="number" 
                                        id="primary-income" 
                                        placeholder="0"
                                        class="form-input currency-field"
                                        step="100"
                                    >
                                    <span class="currency-symbol">₪</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="spouse-income">משכורת בן/בת זוג (נטו)</label>
                                <div class="currency-input">
                                    <input 
                                        type="number" 
                                        id="spouse-income" 
                                        placeholder="0"
                                        class="form-input currency-field"
                                        step="100"
                                    >
                                    <span class="currency-symbol">₪</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="side-income">הכנסות נוספות</label>
                                <div class="currency-input">
                                    <input 
                                        type="number" 
                                        id="side-income" 
                                        placeholder="0"
                                        class="form-input currency-field"
                                        step="50"
                                    >
                                    <span class="currency-symbol">₪</span>
                                </div>
                                <small class="form-help">עבודות צד, השכרות, השקעות</small>
                            </div>

                            <div class="form-group">
                                <label for="benefits-income">קצבאות וגמלאות</label>
                                <div class="currency-input">
                                    <input 
                                        type="number" 
                                        id="benefits-income" 
                                        placeholder="0"
                                        class="form-input currency-field"
                                        step="50"
                                    >
                                    <span class="currency-symbol">₪</span>
                                </div>
                                <small class="form-help">דמי לידה, גמלת זקנה, קצבת ילדים</small>
                            </div>
                        </div>

                        <div class="income-summary">
                            <div class="summary-card">
                                <span class="summary-label">סך הכל הכנסות חודשיות:</span>
                                <span class="summary-amount" id="total-income">₪0</span>
                            </div>
                        </div>

                        <div class="israeli-income-tips">
                            <h4>📊 נתונים על הכנסות בישראל</h4>
                            <ul>
                                <li>ההכנסה החציונית במשק בית בישראל: ₪16,000</li>
                                <li>ממוצע הוצאות משק בית: ₪14,500</li>
                                <li>מומלץ לחסוך 10-20% מההכנסה</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoriesStep() {
        const categories = Object.keys(this.suggestedAllocations);
        
        return `
            <div class="wizard-step step-categories">
                <div class="step-content">
                    <div class="categories-section">
                        <h3>חלוקת תקציב לקטגוריות</h3>
                        <p class="section-description">חלק את ההכנסה שלך בין הקטגוריות השונות</p>

                        <div class="allocation-method">
                            <div class="method-buttons">
                                <button type="button" class="method-btn active" data-method="percentage">
                                    <span class="method-icon">%</span>
                                    <span class="method-text">לפי אחוזים</span>
                                </button>
                                <button type="button" class="method-btn" data-method="amount">
                                    <span class="method-icon">₪</span>
                                    <span class="method-text">לפי סכומים</span>
                                </button>
                                <button type="button" class="method-btn" data-method="suggested">
                                    <span class="method-icon">✨</span>
                                    <span class="method-text">חלוקה מוצעת</span>
                                </button>
                            </div>
                        </div>

                        <div class="categories-list">
                            ${categories.map(category => this.renderCategoryAllocation(category)).join('')}
                        </div>

                        <div class="allocation-summary">
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span class="summary-label">סך הכל מוקצה:</span>
                                    <span class="summary-value" id="total-allocated">₪0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">נותר להקצאה:</span>
                                    <span class="summary-value" id="remaining-budget">₪0</span>
                                </div>
                                <div class="summary-item full-width">
                                    <div class="allocation-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="allocation-progress" style="width: 0%"></div>
                                        </div>
                                        <span class="progress-text" id="allocation-text">0% מההכנסה הוקצה</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="quick-actions">
                            <button type="button" class="quick-action-btn" id="apply-suggested">
                                ✨ החל חלוקה מוצעת
                            </button>
                            <button type="button" class="quick-action-btn" id="reset-allocations">
                                🔄 אפס הקצאות
                            </button>
                            <button type="button" class="quick-action-btn" id="add-category">
                                ➕ הוסף קטגוריה
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoryAllocation(category) {
        const suggestion = this.suggestedAllocations[category];
        const categoryData = this.budgetData.categories.find(c => c.name === category) || 
                           { name: category, amount: 0, percentage: 0 };

        return `
            <div class="category-allocation" data-category="${category}">
                <div class="category-header">
                    <div class="category-info">
                        <h4 class="category-name">${category}</h4>
                        <p class="category-description">${suggestion.description}</p>
                    </div>
                    <div class="category-suggestion">
                        <span class="suggested-label">מוצע:</span>
                        <span class="suggested-value">${suggestion.percentage}%</span>
                    </div>
                </div>
                
                <div class="allocation-inputs">
                    <div class="input-group">
                        <label>אחוז מההכנסה</label>
                        <div class="percentage-input">
                            <input 
                                type="number" 
                                class="category-percentage" 
                                value="${categoryData.percentage}"
                                min="0" 
                                max="100" 
                                step="1"
                                data-category="${category}"
                            >
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label>סכום חודשי</label>
                        <div class="currency-input">
                            <input 
                                type="number" 
                                class="category-amount" 
                                value="${categoryData.amount}"
                                min="0" 
                                step="50"
                                data-category="${category}"
                            >
                            <span class="currency-symbol">₪</span>
                        </div>
                    </div>
                </div>
                
                <div class="category-visual">
                    <div class="allocation-bar">
                        <div class="bar-fill" style="width: ${categoryData.percentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoalsStep() {
        return `
            <div class="wizard-step step-goals">
                <div class="step-content">
                    <div class="goals-section">
                        <h3>יעדים פיננסיים</h3>
                        <p class="section-description">הגדר יעדים שיעזרו לך להגשים את החלומות שלך</p>

                        <div class="goal-types">
                            <div class="goal-type-grid">
                                ${this.renderGoalTypes()}
                            </div>
                        </div>

                        <div class="goals-list" id="goals-list">
                            ${this.budgetData.goals.map((goal, index) => this.renderGoal(goal, index)).join('')}
                        </div>

                        <div class="add-goal-section">
                            <button type="button" class="add-goal-btn" id="add-custom-goal">
                                ➕ הוסף יעד מותאם אישית
                            </button>
                        </div>

                        <div class="goals-summary">
                            <div class="summary-card">
                                <h4>סיכום יעדים</h4>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">מספר יעדים:</span>
                                        <span class="stat-value" id="goals-count">${this.budgetData.goals.length}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">סך חיסכון חודשי נדרש:</span>
                                        <span class="stat-value" id="monthly-savings">₪0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="financial-goals-tips">
                            <h4>💡 טיפים להצלחה פיננסית</h4>
                            <ul>
                                <li>קבע יעדים ספציפיים ומדידים</li>
                                <li>התחל עם יעדים קטנים ולטווח קצר</li>
                                <li>חסוך קודם, הוצא אחר כך</li>
                                <li>עקב אחרי ההתקדמות באופן קבוע</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoalTypes() {
        const goalTypes = [
            { 
                type: 'emergency', 
                title: 'קרן חירום', 
                description: '3-6 חודשי הוצאות', 
                icon: '🛡️',
                defaultAmount: 30000,
                priority: 'high'
            },
            { 
                type: 'vacation', 
                title: 'חופשה', 
                description: 'חופשת משפחה בחו"ל', 
                icon: '🏖️',
                defaultAmount: 15000,
                priority: 'medium'
            },
            { 
                type: 'home', 
                title: 'דירה/בית', 
                description: 'מקדמה לדירה', 
                icon: '🏠',
                defaultAmount: 200000,
                priority: 'high'
            },
            { 
                type: 'car', 
                title: 'רכב', 
                description: 'רכב חדש או החלפת רכב', 
                icon: '🚗',
                defaultAmount: 80000,
                priority: 'medium'
            },
            { 
                type: 'education', 
                title: 'השכלה', 
                description: 'תואר או קורס מקצועי', 
                icon: '🎓',
                defaultAmount: 25000,
                priority: 'medium'
            },
            { 
                type: 'retirement', 
                title: 'פנסיה', 
                description: 'חיסכון לפנסיה', 
                icon: '👴',
                defaultAmount: 500000,
                priority: 'high'
            }
        ];

        return goalTypes.map(goalType => `
            <div class="goal-type-card" data-goal-type="${goalType.type}">
                <div class="goal-type-icon">${goalType.icon}</div>
                <h4 class="goal-type-title">${goalType.title}</h4>
                <p class="goal-type-description">${goalType.description}</p>
                <div class="goal-type-amount">₪${goalType.defaultAmount.toLocaleString('he-IL')}</div>
                <button type="button" class="add-goal-type-btn" data-goal-type="${goalType.type}">
                    הוסף יעד
                </button>
            </div>
        `).join('');
    }

    renderGoal(goal, index) {
        const monthlyAmount = goal.targetAmount / goal.timeframe;
        const progress = goal.currentAmount / goal.targetAmount * 100;

        return `
            <div class="goal-item" data-goal-index="${index}">
                <div class="goal-header">
                    <div class="goal-info">
                        <h5 class="goal-name">${goal.name}</h5>
                        <p class="goal-details">יעד: ₪${goal.targetAmount.toLocaleString('he-IL')} תוך ${goal.timeframe} חודשים</p>
                    </div>
                    <button type="button" class="remove-goal-btn" data-goal-index="${index}">
                        ✕
                    </button>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        ₪${goal.currentAmount.toLocaleString('he-IL')} / ₪${goal.targetAmount.toLocaleString('he-IL')}
                    </div>
                </div>
                
                <div class="goal-monthly">
                    <span class="monthly-label">חיסכון חודשי נדרש:</span>
                    <span class="monthly-amount">₪${Math.ceil(monthlyAmount).toLocaleString('he-IL')}</span>
                </div>
            </div>
        `;
    }

    renderNavigation() {
        return `
            <div class="wizard-navigation">
                <button 
                    type="button" 
                    class="nav-btn prev-btn" 
                    ${this.currentStep === 1 ? 'disabled' : ''}
                    id="prev-step"
                >
                    ← הקודם
                </button>
                
                <div class="nav-center">
                    <span class="step-indicator">${this.currentStep}/${this.totalSteps}</span>
                </div>
                
                <button 
                    type="button" 
                    class="nav-btn next-btn" 
                    id="next-step"
                >
                    ${this.currentStep === this.totalSteps ? 'סיים יצירה' : 'הבא →'}
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Navigation
        document.getElementById('prev-step')?.addEventListener('click', () => this.previousStep());
        document.getElementById('next-step')?.addEventListener('click', () => this.nextStep());

        // Step 1 - General Info
        document.getElementById('budget-name')?.addEventListener('input', (e) => {
            this.budgetData.name = e.target.value;
        });

        document.getElementById('budget-period')?.addEventListener('change', (e) => {
            this.budgetData.period = e.target.value;
        });

        document.getElementById('budget-start-date')?.addEventListener('change', (e) => {
            this.budgetData.startDate = e.target.value;
        });

        // Step 2 - Template Selection
        this.attachTemplateListeners();

        // Step 3 - Income
        this.attachIncomeListeners();

        // Step 4 - Categories
        this.attachCategoryListeners();

        // Step 5 - Goals  
        this.attachGoalListeners();
    }

    attachTemplateListeners() {
        // Template card selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const templateId = card.getAttribute('data-template-id');
                this.selectTemplate(templateId);
            });
        });

        // Custom template radio
        document.getElementById('custom-template')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectTemplate('custom');
            }
        });
    }

    selectTemplate(templateId) {
        // Update selected template
        this.budgetData.selectedTemplate = templateId;
        
        // Update UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        if (templateId !== 'custom') {
            document.querySelector(`[data-template-id="${templateId}"]`)?.classList.add('selected');
            document.getElementById('custom-template').checked = false;
        } else {
            document.getElementById('custom-template').checked = true;
        }
        
        // Re-render to show/hide details
        this.updateStepContent();
        
        // Apply template to budget data if not custom
        if (templateId !== 'custom') {
            const template = israeliBudgetTemplates.getTemplate(templateId);
            if (template) {
                // Will be applied with actual income in next step
                this.budgetData.templateData = template;
            }
        } else {
            this.budgetData.templateData = null;
        }
    }

    updateStepContent() {
        const stepContainer = document.querySelector('.wizard-step');
        if (stepContainer) {
            stepContainer.innerHTML = this.renderCurrentStep().replace(/^.*?<div class="step-content">/, '<div class="step-content">').replace(/<\/div>\s*<\/div>\s*$/, '</div>');
            this.attachEventListeners();
        }
    }

    attachIncomeListeners() {
        const incomeInputs = ['primary-income', 'spouse-income', 'side-income', 'benefits-income'];
        
        incomeInputs.forEach(inputId => {
            document.getElementById(inputId)?.addEventListener('input', () => {
                this.calculateTotalIncome();
            });
        });
    }

    attachCategoryListeners() {
        // Method selection
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.method-btn').classList.add('active');
                this.updateAllocationMethod(e.target.closest('.method-btn').dataset.method);
            });
        });

        // Category inputs
        document.querySelectorAll('.category-percentage').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateCategoryFromPercentage(e.target.dataset.category, parseFloat(e.target.value) || 0);
            });
        });

        document.querySelectorAll('.category-amount').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateCategoryFromAmount(e.target.dataset.category, parseFloat(e.target.value) || 0);
            });
        });

        // Quick actions
        document.getElementById('apply-suggested')?.addEventListener('click', () => this.applySuggestedAllocations());
        document.getElementById('reset-allocations')?.addEventListener('click', () => this.resetAllocations());
        document.getElementById('add-category')?.addEventListener('click', () => this.showAddCategoryModal());
    }

    attachGoalListeners() {
        // Goal type selection
        document.querySelectorAll('.add-goal-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addGoalFromType(e.target.dataset.goalType);
            });
        });

        // Custom goal
        document.getElementById('add-custom-goal')?.addEventListener('click', () => {
            this.showAddCustomGoalModal();
        });

        // Remove goals
        document.querySelectorAll('.remove-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.removeGoal(parseInt(e.target.dataset.goalIndex));
            });
        });
    }

    calculateTotalIncome() {
        const primary = parseFloat(document.getElementById('primary-income')?.value) || 0;
        const spouse = parseFloat(document.getElementById('spouse-income')?.value) || 0;
        const side = parseFloat(document.getElementById('side-income')?.value) || 0;
        const benefits = parseFloat(document.getElementById('benefits-income')?.value) || 0;

        this.budgetData.totalIncome = primary + spouse + side + benefits;
        
        const totalElement = document.getElementById('total-income');
        if (totalElement) {
            totalElement.textContent = `₪${this.budgetData.totalIncome.toLocaleString('he-IL')}`;
        }

        // Apply template with actual income if template is selected
        if (this.budgetData.selectedTemplate && this.budgetData.selectedTemplate !== 'custom' && this.budgetData.totalIncome > 0) {
            this.applyTemplateToIncome();
        }
    }

    applyTemplateToIncome() {
        if (!this.budgetData.templateData) return;
        
        const appliedTemplate = israeliBudgetTemplates.applyTemplate(
            this.budgetData.selectedTemplate, 
            this.budgetData.totalIncome
        );
        
        if (appliedTemplate) {
            // Update categories based on template with user's actual income
            this.budgetData.categories = appliedTemplate.categories.map(cat => ({
                name: cat.name,
                amount: cat.amount,
                percentage: cat.percentage,
                description: cat.description
            }));
        }
    }

    updateCategoryFromPercentage(categoryName, percentage) {
        const amount = (this.budgetData.totalIncome * percentage) / 100;
        this.updateCategory(categoryName, amount, percentage);
    }

    updateCategoryFromAmount(categoryName, amount) {
        const percentage = this.budgetData.totalIncome > 0 ? (amount / this.budgetData.totalIncome) * 100 : 0;
        this.updateCategory(categoryName, amount, percentage);
    }

    updateCategory(categoryName, amount, percentage) {
        const existingIndex = this.budgetData.categories.findIndex(c => c.name === categoryName);
        
        if (existingIndex >= 0) {
            this.budgetData.categories[existingIndex] = { name: categoryName, amount, percentage };
        } else {
            this.budgetData.categories.push({ name: categoryName, amount, percentage });
        }

        this.updateAllocationSummary();
    }

    updateAllocationSummary() {
        const totalAllocated = this.budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const remaining = this.budgetData.totalIncome - totalAllocated;
        const progressPercent = this.budgetData.totalIncome > 0 ? (totalAllocated / this.budgetData.totalIncome) * 100 : 0;

        document.getElementById('total-allocated').textContent = `₪${totalAllocated.toLocaleString('he-IL')}`;
        document.getElementById('remaining-budget').textContent = `₪${remaining.toLocaleString('he-IL')}`;
        document.getElementById('allocation-progress').style.width = `${Math.min(progressPercent, 100)}%`;
        document.getElementById('allocation-text').textContent = `${Math.round(progressPercent)}% מההכנסה הוקצה`;
    }

    applySuggestedAllocations() {
        Object.keys(this.suggestedAllocations).forEach(category => {
            const suggestion = this.suggestedAllocations[category];
            const amount = (this.budgetData.totalIncome * suggestion.percentage) / 100;
            this.updateCategory(category, amount, suggestion.percentage);
            
            // Update inputs
            const percentageInput = document.querySelector(`[data-category="${category}"].category-percentage`);
            const amountInput = document.querySelector(`[data-category="${category}"].category-amount`);
            
            if (percentageInput) percentageInput.value = suggestion.percentage;
            if (amountInput) amountInput.value = Math.round(amount);
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateDisplay();
            } else {
                this.completeBudgetCreation();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateDisplay();
        }
    }

    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                if (!this.budgetData.name.trim()) {
                    this.showError('אנא הזן שם לתקציב');
                    return false;
                }
                break;
            case 2:
                if (this.budgetData.totalIncome <= 0) {
                    this.showError('אנא הזן לפחות מקור הכנסה אחד');
                    return false;
                }
                break;
            case 3:
                const totalAllocated = this.budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
                if (totalAllocated > this.budgetData.totalIncome * 1.1) {
                    this.showError('ההקצאות חורגות מההכנסה בצורה משמעותית');
                    return false;
                }
                break;
        }
        return true;
    }

    updateDisplay() {
        const container = document.querySelector('.budget-wizard');
        if (container) {
            container.outerHTML = this.render();
            this.attachEventListeners();
        }
    }

    completeBudgetCreation() {
        // Save budget to data system
        if (window.DataAPI) {
            const budgetId = `budget_${Date.now()}`;
            const budgetToSave = {
                ...this.budgetData,
                id: budgetId,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            DataAPI.storage.save('budgets', budgetId, budgetToSave);
            
            this.showSuccess('התקציב נוצר בהצלחה! 🎉');
            
            // Navigate to budget dashboard
            setTimeout(() => {
                window.location.hash = `#budget/${budgetId}`;
            }, 2000);
        }
    }

    showError(message) {
        if (window.HebrewToasts) {
            HebrewToasts.show(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.HebrewToasts) {
            HebrewToasts.show(message, 'success');
        } else {
            alert(message);
        }
    }
}

// Export for use in other components
window.BudgetWizard = BudgetWizard;