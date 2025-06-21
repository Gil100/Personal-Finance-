/**
 * Transaction Templates Component
 * Provides pre-defined templates for common Israeli payments
 */

export class TransactionTemplates {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            mode: 'select', // 'select' | 'manage'
            onTemplateSelect: null,
            onTemplateCreate: null,
            onTemplateEdit: null,
            onTemplateDelete: null,
            ...options
        };
        
        this.templates = [];
        this.categories = [];
        this.accounts = [];
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    }

    async loadData() {
        try {
            const { DataManager } = await import('../data/index.js');
            
            // Load existing templates
            this.templates = await DataManager.getTransactionTemplates() || [];
            
            // If no templates exist, create default Israeli templates
            if (this.templates.length === 0) {
                this.templates = this.getDefaultIsraeliTemplates();
                // Save default templates
                for (const template of this.templates) {
                    await DataManager.saveTransactionTemplate(template);
                }
            }
            
            // Load categories and accounts for template creation
            this.categories = await DataManager.getCategories();
            this.accounts = await DataManager.getAccounts();
            
        } catch (error) {
            console.error('Failed to load transaction templates:', error);
            this.templates = this.getDefaultIsraeliTemplates();
        }
    }

    getDefaultIsraeliTemplates() {
        return [
            // Housing & Utilities
            {
                id: 'template_rent',
                name: 'שכר דירה',
                description: 'תשלום שכר דירה חודשי',
                type: 'expense',
                amount: 4500,
                category: 'rent',
                frequency: 'monthly',
                tags: ['דיור', 'חודשי'],
                icon: '🏠',
                color: '#DC2626',
                isDefault: true
            },
            {
                id: 'template_arnona',
                name: 'ארנונה',
                description: 'תשלום ארנונה דו-חודשי',
                type: 'expense',
                amount: 600,
                category: 'arnona',
                frequency: 'bimonthly',
                tags: ['ארנונה', 'עירייה'],
                icon: '🏛️',
                color: '#DC2626',
                isDefault: true
            },
            {
                id: 'template_electricity',
                name: 'חשמל',
                description: 'חשבון חשמל דו-חודשי',
                type: 'expense',
                amount: 320,
                category: 'electricity',
                frequency: 'bimonthly',
                tags: ['חשמל', 'שירותים'],
                icon: '⚡',
                color: '#F59E0B',
                isDefault: true
            },
            {
                id: 'template_water',
                name: 'מים',
                description: 'חשבון מים דו-חודשי',
                type: 'expense',
                amount: 150,
                category: 'water',
                frequency: 'bimonthly',
                tags: ['מים', 'שירותים'],
                icon: '💧',
                color: '#3B82F6',
                isDefault: true
            },
            {
                id: 'template_gas',
                name: 'גז',
                description: 'חשבון גז דו-חודשי',
                type: 'expense',
                amount: 80,
                category: 'gas',
                frequency: 'bimonthly',
                tags: ['גז', 'שירותים'],
                icon: '🔥',
                color: '#EF4444',
                isDefault: true
            },
            {
                id: 'template_internet',
                name: 'אינטרנט וטלוויזיה',
                description: 'מנוי אינטרנט וטלוויזיה חודשי',
                type: 'expense',
                amount: 150,
                category: 'internet',
                frequency: 'monthly',
                tags: ['אינטרנט', 'תקשורת'],
                icon: '📡',
                color: '#8B5CF6',
                isDefault: true
            },
            {
                id: 'template_phone',
                name: 'טלפון נייד',
                description: 'מנוי טלפון נייד חודשי',
                type: 'expense',
                amount: 80,
                category: 'phone',
                frequency: 'monthly',
                tags: ['טלפון', 'תקשורת'],
                icon: '📱',
                color: '#06B6D4',
                isDefault: true
            },

            // Insurance & Social
            {
                id: 'template_health_insurance',
                name: 'ביטוח בריאות משלים',
                description: 'ביטוח בריאות משלים חודשי',
                type: 'expense',
                amount: 180,
                category: 'health_insurance',
                frequency: 'monthly',
                tags: ['ביטוח', 'בריאות'],
                icon: '⚕️',
                color: '#DC2626',
                isDefault: true
            },
            {
                id: 'template_bituach_leumi',
                name: 'ביטוח לאומי',
                description: 'תשלום ביטוח לאומי חודשי',
                type: 'expense',
                amount: 800,
                category: 'bituach_leumi',
                frequency: 'monthly',
                tags: ['ביטוח לאומי', 'מדינה'],
                icon: '🛡️',
                color: '#7C2D12',
                isDefault: true
            },

            // Transportation
            {
                id: 'template_fuel',
                name: 'דלק לרכב',
                description: 'תדלוק שבועי',
                type: 'expense',
                amount: 180,
                category: 'fuel',
                frequency: 'weekly',
                tags: ['דלק', 'רכב'],
                icon: '⛽',
                color: '#DC2626',
                isDefault: true
            },

            // Food & Groceries
            {
                id: 'template_groceries',
                name: 'קניות מזון',
                description: 'קניות מזון שבועיות',
                type: 'expense',
                amount: 400,
                category: 'groceries',
                frequency: 'weekly',
                tags: ['מזון', 'קניות'],
                icon: '🛒',
                color: '#10B981',
                isDefault: true
            },

            // Income
            {
                id: 'template_salary',
                name: 'משכורת',
                description: 'משכורת חודשית',
                type: 'income',
                amount: 12000,
                category: 'salary',
                frequency: 'monthly',
                tags: ['משכורת', 'הכנסה'],
                icon: '💼',
                color: '#10B981',
                isDefault: true
            }
        ];
    }

    render() {
        this.container.innerHTML = `
            <div class="transaction-templates">
                <div class="templates-header">
                    <h3>תבניות עסקאות</h3>
                    <p class="templates-description">
                        בחר מתבנית קיימת או צור תבנית חדשה לתשלומים חוזרים
                    </p>
                    ${this.options.mode === 'manage' ? `
                        <button class="btn-primary create-template-btn">
                            <span class="icon">➕</span>
                            תבנית חדשה
                        </button>
                    ` : ''}
                </div>

                <div class="templates-categories">
                    <div class="category-tabs">
                        <button class="category-tab active" data-category="all">הכל</button>
                        <button class="category-tab" data-category="housing">דיור ושירותים</button>
                        <button class="category-tab" data-category="insurance">ביטוח ומדינה</button>
                        <button class="category-tab" data-category="transport">תחבורה</button>
                        <button class="category-tab" data-category="food">מזון</button>
                        <button class="category-tab" data-category="income">הכנסות</button>
                        <button class="category-tab" data-category="custom">מותאמות אישית</button>
                    </div>
                </div>

                <div class="templates-grid">
                    ${this.renderTemplates()}
                </div>

                <div class="template-form-modal" style="display: none;">
                    ${this.renderTemplateForm()}
                </div>
            </div>
        `;
    }

    renderTemplates(filterCategory = 'all') {
        const filteredTemplates = this.filterTemplatesByCategory(filterCategory);
        
        if (filteredTemplates.length === 0) {
            return `
                <div class="no-templates">
                    <div class="no-templates-icon">📝</div>
                    <h4>אין תבניות בקטגוריה זו</h4>
                    <p>צור תבנית חדשה או בחר קטגוריה אחרת</p>
                </div>
            `;
        }

        return filteredTemplates.map(template => this.renderTemplateCard(template)).join('');
    }

    renderTemplateCard(template) {
        const frequencyLabels = {
            weekly: 'שבועי',
            biweekly: 'דו-שבועי', 
            monthly: 'חודשי',
            bimonthly: 'דו-חודשי',
            quarterly: 'רבעוני',
            yearly: 'שנתי'
        };

        const amountClass = template.type === 'income' ? 'positive' : 'negative';
        
        return `
            <div class="template-card ${template.type}" data-template-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon" style="background-color: ${template.color}20; color: ${template.color}">
                        ${template.icon}
                    </div>
                    <div class="template-info">
                        <h4 class="template-name">${template.name}</h4>
                        <p class="template-description">${template.description}</p>
                    </div>
                    ${this.options.mode === 'manage' && !template.isDefault ? `
                        <div class="template-actions">
                            <button class="action-btn edit-template" data-template-id="${template.id}" title="ערוך">
                                ✏️
                            </button>
                            <button class="action-btn delete-template" data-template-id="${template.id}" title="מחק">
                                🗑️
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="template-details">
                    <div class="template-amount ${amountClass}">
                        ${this.formatCurrency(template.amount)}
                    </div>
                    <div class="template-frequency">
                        ${frequencyLabels[template.frequency] || template.frequency}
                    </div>
                </div>

                <div class="template-tags">
                    ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <div class="template-card-actions">
                    <button class="btn-primary use-template" data-template-id="${template.id}">
                        <span class="icon">📝</span>
                        השתמש בתבנית
                    </button>
                </div>
            </div>
        `;
    }

    renderTemplateForm() {
        return `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">צור תבנית חדשה</h3>
                        <button class="modal-close">×</button>
                    </div>
                    
                    <form class="template-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>שם התבנית</label>
                                <input type="text" name="name" class="form-input" placeholder="שם התבנית..." required>
                            </div>
                            <div class="form-group">
                                <label>תיאור</label>
                                <input type="text" name="description" class="form-input" placeholder="תיאור התבנית...">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>סוג עסקה</label>
                                <select name="type" class="form-input" required>
                                    <option value="expense">הוצאה</option>
                                    <option value="income">הכנסה</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>סכום</label>
                                <input type="number" name="amount" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>קטגוריה</label>
                                <select name="category" class="form-input" required>
                                    <option value="">בחר קטגוריה...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>תדירות</label>
                                <select name="frequency" class="form-input" required>
                                    <option value="weekly">שבועי</option>
                                    <option value="biweekly">דו-שבועי</option>
                                    <option value="monthly">חודשי</option>
                                    <option value="bimonthly">דו-חודשי</option>
                                    <option value="quarterly">רבעוני</option>
                                    <option value="yearly">שנתי</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>תגיות (הפרד בפסיקים)</label>
                            <input type="text" name="tags" class="form-input" placeholder="תגית1, תגית2, תגית3...">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>אייקון</label>
                                <input type="text" name="icon" class="form-input" placeholder="📝" maxlength="2">
                            </div>
                            <div class="form-group">
                                <label>צבע</label>
                                <input type="color" name="color" class="form-input color-input" value="#6B7280">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">שמור תבנית</button>
                            <button type="button" class="btn-secondary cancel-form">ביטול</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    filterTemplatesByCategory(category) {
        if (category === 'all') return this.templates;
        
        const categoryMap = {
            housing: ['rent', 'arnona', 'electricity', 'water', 'gas', 'internet', 'phone'],
            insurance: ['health_insurance', 'bituach_leumi'],
            transport: ['fuel', 'transportation'],
            food: ['groceries', 'restaurants'],
            income: ['salary', 'freelance', 'investment'],
            custom: this.templates.filter(t => !t.isDefault).map(t => t.category)
        };

        if (category === 'custom') {
            return this.templates.filter(t => !t.isDefault);
        }

        const categories = categoryMap[category] || [];
        return this.templates.filter(t => categories.includes(t.category));
    }

    bindEvents() {
        // Category tabs
        this.container.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target.dataset.category);
            });
        });

        // Template actions
        this.container.addEventListener('click', (e) => {
            const action = e.target.closest('[data-template-id]')?.classList;
            const templateId = e.target.closest('[data-template-id]')?.dataset.templateId;

            if (e.target.classList.contains('use-template')) {
                this.useTemplate(templateId);
            } else if (e.target.classList.contains('edit-template')) {
                this.editTemplate(templateId);
            } else if (e.target.classList.contains('delete-template')) {
                this.deleteTemplate(templateId);
            } else if (e.target.classList.contains('create-template-btn')) {
                this.showTemplateForm();
            }
        });

        // Modal events
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('cancel-form')) {
                this.hideTemplateForm();
            } else if (e.target.classList.contains('modal-overlay')) {
                this.hideTemplateForm();
            }
        });

        // Form submission
        const form = this.container.querySelector('.template-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTemplate();
            });
        }
    }

    handleCategoryChange(category) {
        // Update active tab
        this.container.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.container.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update templates display
        const templatesGrid = this.container.querySelector('.templates-grid');
        templatesGrid.innerHTML = this.renderTemplates(category);
    }

    async useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        if (this.options.onTemplateSelect) {
            this.options.onTemplateSelect(template);
        } else {
            // Create transaction from template
            await this.createTransactionFromTemplate(template);
        }
    }

    async createTransactionFromTemplate(template) {
        try {
            const { TransactionForm } = await import('./TransactionForm.js');
            const { Modal } = await import('./Modal.js');

            // Create modal for transaction form
            const modalContainer = document.createElement('div');
            const modal = new Modal(modalContainer, {
                title: `עסקה חדשה מתבנית: ${template.name}`,
                size: 'large'
            });

            // Create form container
            const formContainer = document.createElement('div');
            
            // Pre-fill transaction data from template
            const transactionData = {
                type: template.type,
                amount: template.amount,
                description: template.name,
                category: template.category,
                tags: template.tags,
                isRecurring: true,
                recurringFrequency: template.frequency,
                date: new Date().toISOString().split('T')[0]
            };

            const transactionForm = new TransactionForm(formContainer, {
                mode: 'add',
                transaction: transactionData,
                onSave: (transaction) => {
                    modal.close();
                    modalContainer.remove();
                    if (window.showToast) {
                        window.showToast('עסקה נוצרה מתבנית בהצלחה', 'success');
                    }
                },
                onCancel: () => {
                    modal.close();
                    modalContainer.remove();
                }
            });

            modal.setContent(formContainer);
            modal.open();
            document.body.appendChild(modalContainer);

        } catch (error) {
            console.error('Failed to create transaction from template:', error);
            if (window.showToast) {
                window.showToast('שגיאה ביצירת עסקה מתבנית', 'error');
            }
        }
    }

    showTemplateForm() {
        const modal = this.container.querySelector('.template-form-modal');
        modal.style.display = 'block';
        
        // Populate categories
        const categorySelect = modal.querySelector('select[name="category"]');
        categorySelect.innerHTML = '<option value="">בחר קטגוריה...</option>' +
            this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }

    hideTemplateForm() {
        const modal = this.container.querySelector('.template-form-modal');
        modal.style.display = 'none';
        
        // Reset form
        const form = modal.querySelector('.template-form');
        form.reset();
    }

    async saveTemplate() {
        try {
            const form = this.container.querySelector('.template-form');
            const formData = new FormData(form);
            
            const template = {
                id: 'template_' + Date.now(),
                name: formData.get('name'),
                description: formData.get('description') || '',
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                frequency: formData.get('frequency'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                icon: formData.get('icon') || '📝',
                color: formData.get('color') || '#6B7280',
                isDefault: false,
                createdAt: new Date().toISOString()
            };

            // Save to data manager
            const { DataManager } = await import('../data/index.js');
            await DataManager.saveTransactionTemplate(template);
            
            // Add to local templates
            this.templates.push(template);
            
            // Refresh display
            this.render();
            this.bindEvents();
            
            if (window.showToast) {
                window.showToast('תבנית נשמרה בהצלחה', 'success');
            }

        } catch (error) {
            console.error('Failed to save template:', error);
            if (window.showToast) {
                window.showToast('שגיאה בשמירת התבנית', 'error');
            }
        }
    }

    async deleteTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template || template.isDefault) return;

        if (!confirm(`האם אתה בטוח שברצונך למחוק את התבנית "${template.name}"?`)) {
            return;
        }

        try {
            const { DataManager } = await import('../data/index.js');
            await DataManager.deleteTransactionTemplate(templateId);
            
            // Remove from local templates
            this.templates = this.templates.filter(t => t.id !== templateId);
            
            // Refresh display
            this.render();
            this.bindEvents();
            
            if (window.showToast) {
                window.showToast('תבנית נמחקה בהצלחה', 'success');
            }

        } catch (error) {
            console.error('Failed to delete template:', error);
            if (window.showToast) {
                window.showToast('שגיאה במחיקת התבנית', 'error');
            }
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Export for global access
window.TransactionTemplates = TransactionTemplates;

console.log('📝 TransactionTemplates component loaded');