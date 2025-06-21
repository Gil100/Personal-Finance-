// Hebrew Transaction Form Component
export class TransactionForm {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            mode: 'add', // 'add' or 'edit'
            transaction: null,
            onSave: null,
            onCancel: null,
            ...options
        };
        this.formElement = null;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const isEdit = this.options.mode === 'edit';
        const transaction = this.options.transaction || {};
        
        this.container.innerHTML = `
            <div class="transaction-form-container">
                <div class="transaction-form-header">
                    <h2 class="form-title">${isEdit ? 'עריכת עסקה' : 'הוספת עסקה חדשה'}</h2>
                    <button type="button" class="btn-close" data-action="cancel">×</button>
                </div>

                <form class="transaction-form" id="transactionForm">
                    <!-- Transaction Type -->
                    <div class="form-group">
                        <label class="form-label">סוג עסקה</label>
                        <div class="transaction-type-tabs">
                            <input type="radio" id="type-expense" name="type" value="expense" 
                                   ${transaction.type !== 'income' ? 'checked' : ''}>
                            <label for="type-expense" class="type-tab expense-tab">
                                <span class="tab-icon">💸</span>
                                <span class="tab-text">הוצאה</span>
                            </label>
                            
                            <input type="radio" id="type-income" name="type" value="income"
                                   ${transaction.type === 'income' ? 'checked' : ''}>
                            <label for="type-income" class="type-tab income-tab">
                                <span class="tab-icon">💰</span>
                                <span class="tab-text">הכנסה</span>
                            </label>
                        </div>
                    </div>

                    <!-- Amount -->
                    <div class="form-group">
                        <label for="amount" class="form-label required">סכום</label>
                        <div class="amount-input-container">
                            <input type="number" id="amount" name="amount" 
                                   class="form-input amount-input" 
                                   placeholder="0.00" 
                                   step="0.01" 
                                   min="0"
                                   value="${transaction.amount || ''}"
                                   required>
                            <span class="currency-symbol">₪</span>
                        </div>
                        <div class="amount-preview"></div>
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label for="description" class="form-label required">תיאור</label>
                        <input type="text" id="description" name="description" 
                               class="form-input" 
                               placeholder="תיאור העסקה..."
                               value="${transaction.description || ''}"
                               required>
                    </div>

                    <!-- Category -->
                    <div class="form-group">
                        <label for="category" class="form-label required">קטגוריה</label>
                        <select id="category" name="category" class="form-input" required>
                            <option value="">בחר קטגוריה...</option>
                        </select>
                        <button type="button" class="btn-secondary btn-sm add-category-btn">
                            + קטגוריה חדשה
                        </button>
                    </div>

                    <!-- Account -->
                    <div class="form-group">
                        <label for="account" class="form-label required">חשבון</label>
                        <select id="account" name="account" class="form-input" required>
                            <option value="">בחר חשבון...</option>
                        </select>
                    </div>

                    <!-- Date -->
                    <div class="form-group">
                        <label for="date" class="form-label required">תאריך</label>
                        <input type="date" id="date" name="date" 
                               class="form-input"
                               value="${transaction.date || new Date().toISOString().split('T')[0]}"
                               required>
                    </div>

                    <!-- Tags -->
                    <div class="form-group">
                        <label for="tags" class="form-label">תגיות</label>
                        <div class="tags-input-container">
                            <input type="text" id="tags" name="tags" 
                                   class="form-input tags-input" 
                                   placeholder="הוסף תגיות (הפרד בפסיקים)..."
                                   value="${(transaction.tags || []).join(', ')}">
                            <div class="tags-suggestions"></div>
                        </div>
                        <div class="selected-tags"></div>
                    </div>

                    <!-- Notes -->
                    <div class="form-group">
                        <label for="notes" class="form-label">הערות</label>
                        <textarea id="notes" name="notes" 
                                  class="form-input form-textarea" 
                                  placeholder="הערות נוספות..."
                                  rows="3">${transaction.notes || ''}</textarea>
                    </div>

                    <!-- Recurring Transaction -->
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="isRecurring" name="isRecurring" 
                                   class="form-checkbox"
                                   ${transaction.isRecurring ? 'checked' : ''}>
                            עסקה חוזרת
                        </label>
                        <div class="recurring-options" style="display: ${transaction.isRecurring ? 'block' : 'none'}">
                            <select id="recurringFrequency" name="recurringFrequency" class="form-input">
                                <option value="monthly" ${transaction.recurringFrequency === 'monthly' ? 'selected' : ''}>חודשי</option>
                                <option value="weekly" ${transaction.recurringFrequency === 'weekly' ? 'selected' : ''}>שבועי</option>
                                <option value="yearly" ${transaction.recurringFrequency === 'yearly' ? 'selected' : ''}>שנתי</option>
                            </select>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            ${isEdit ? 'עדכן עסקה' : 'שמור עסקה'}
                        </button>
                        <button type="button" class="btn-secondary" data-action="cancel">
                            ביטול
                        </button>
                        ${isEdit ? `
                            <button type="button" class="btn-error delete-btn" data-action="delete">
                                מחק עסקה
                            </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        `;

        this.formElement = this.container.querySelector('#transactionForm');
        this.loadCategories();
        this.loadAccounts();
        this.initializeAmount();
        this.initializeTags();
    }

    async loadCategories() {
        try {
            const { DataManager } = await import('../data/index.js');
            const categories = await DataManager.getCategories();
            const categorySelect = this.container.querySelector('#category');
            
            // Clear existing options except first
            categorySelect.innerHTML = '<option value="">בחר קטגוריה...</option>';
            
            // Group by type
            const expenseCategories = categories.filter(cat => cat.type === 'expense');
            const incomeCategories = categories.filter(cat => cat.type === 'income');
            
            if (expenseCategories.length > 0) {
                const expenseGroup = document.createElement('optgroup');
                expenseGroup.label = 'הוצאות';
                expenseCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    if (this.options.transaction?.category === category.id) {
                        option.selected = true;
                    }
                    expenseGroup.appendChild(option);
                });
                categorySelect.appendChild(expenseGroup);
            }
            
            if (incomeCategories.length > 0) {
                const incomeGroup = document.createElement('optgroup');
                incomeGroup.label = 'הכנסות';
                incomeCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    if (this.options.transaction?.category === category.id) {
                        option.selected = true;
                    }
                    incomeGroup.appendChild(option);
                });
                categorySelect.appendChild(incomeGroup);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    async loadAccounts() {
        try {
            const { DataManager } = await import('../data/index.js');
            const accounts = await DataManager.getAccounts();
            const accountSelect = this.container.querySelector('#account');
            
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.type})`;
                if (this.options.transaction?.account === account.id) {
                    option.selected = true;
                }
                accountSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load accounts:', error);
        }
    }

    initializeAmount() {
        const amountInput = this.container.querySelector('#amount');
        const amountPreview = this.container.querySelector('.amount-preview');
        
        const updatePreview = () => {
            const value = parseFloat(amountInput.value);
            if (!isNaN(value) && value > 0) {
                amountPreview.textContent = this.formatCurrency(value);
                amountPreview.style.display = 'block';
            } else {
                amountPreview.style.display = 'none';
            }
        };
        
        amountInput.addEventListener('input', updatePreview);
        updatePreview();
    }

    initializeTags() {
        const tagsInput = this.container.querySelector('#tags');
        const selectedTagsContainer = this.container.querySelector('.selected-tags');
        
        const updateSelectedTags = () => {
            const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            selectedTagsContainer.innerHTML = tags.map(tag => 
                `<span class="tag-item">${tag}</span>`
            ).join('');
        };
        
        tagsInput.addEventListener('input', updateSelectedTags);
        updateSelectedTags();
    }

    bindEvents() {
        // Form submission
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel buttons
        this.container.querySelectorAll('[data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', () => this.handleCancel());
        });

        // Delete button (edit mode)
        const deleteBtn = this.container.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        // Transaction type change
        this.container.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleTypeChange());
        });

        // Recurring checkbox
        const recurringCheckbox = this.container.querySelector('#isRecurring');
        const recurringOptions = this.container.querySelector('.recurring-options');
        recurringCheckbox.addEventListener('change', () => {
            recurringOptions.style.display = recurringCheckbox.checked ? 'block' : 'none';
        });

        // Add category button
        const addCategoryBtn = this.container.querySelector('.add-category-btn');
        addCategoryBtn.addEventListener('click', () => this.showAddCategoryDialog());
    }

    handleTypeChange() {
        // Reload categories based on transaction type
        this.loadCategories();
    }

    async handleSubmit() {
        const formData = new FormData(this.formElement);
        const transactionData = {
            id: this.options.transaction?.id || this.generateId(),
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            account: formData.get('account'),
            date: formData.get('date'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            notes: formData.get('notes'),
            isRecurring: formData.has('isRecurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            createdAt: this.options.transaction?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const { DataManager } = await import('../data/index.js');
            
            if (this.options.mode === 'edit') {
                await DataManager.updateTransaction(transactionData.id, transactionData);
            } else {
                await DataManager.addTransaction(transactionData);
            }

            if (this.options.onSave) {
                this.options.onSave(transactionData);
            }

            this.showSuccessMessage();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            this.showErrorMessage('שגיאה בשמירת העסקה');
        }
    }

    handleCancel() {
        if (this.options.onCancel) {
            this.options.onCancel();
        }
    }

    async handleDelete() {
        if (!confirm('האם אתה בטוח שברצונך למחוק את העסקה?')) {
            return;
        }

        try {
            const { DataManager } = await import('../data/index.js');
            await DataManager.deleteTransaction(this.options.transaction.id);
            
            if (this.options.onSave) {
                this.options.onSave(null, 'deleted');
            }
            
            this.showSuccessMessage();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            this.showErrorMessage('שגיאה במחיקת העסקה');
        }
    }

    async showAddCategoryDialog() {
        try {
            // Check if CategoryManager is available
            if (typeof CategoryManager === 'undefined') {
                await import('./CategoryManager.js');
            }

            // Create modal for category management
            const { Modal } = await import('./Modal.js');
            
            const modalContainer = document.createElement('div');
            const modal = new Modal(modalContainer, {
                title: 'ניהול קטגוריות',
                size: 'large',
                onClose: () => {
                    modalContainer.remove();
                    // Reload categories in the form
                    this.loadCategories();
                }
            });

            // Create category manager inside modal
            const categoryManagerContainer = document.createElement('div');
            const categoryManager = new CategoryManager(categoryManagerContainer, {
                mode: 'manage',
                allowAdd: true,
                allowEdit: true,
                allowDelete: true,
                onAdd: (category) => {
                    this.showSuccessMessage(`קטגוריה "${category.name}" נוספה בהצלחה`);
                },
                onEdit: (category) => {
                    this.showSuccessMessage(`קטגוריה "${category.name}" עודכנה בהצלחה`);
                },
                onDelete: (category) => {
                    this.showSuccessMessage(`קטגוריה "${category.name}" נמחקה בהצלחה`);
                }
            });

            modal.setContent(categoryManagerContainer);
            modal.open();
            
            // Append modal to body
            document.body.appendChild(modalContainer);
            
        } catch (error) {
            console.error('Failed to load category manager:', error);
            this.showErrorMessage('שגיאה בטעינת מנהל הקטגוריות');
        }
    }

    generateId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 2
        }).format(amount);
    }

    showSuccessMessage() {
        // Use existing Toast component
        if (window.showToast) {
            window.showToast('העסקה נשמרה בהצלחה', 'success');
        }
    }

    showErrorMessage(message) {
        // Use existing Toast component
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }

    // Public method to get form data without saving
    getFormData() {
        const formData = new FormData(this.formElement);
        return {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            account: formData.get('account'),
            date: formData.get('date'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            notes: formData.get('notes'),
            isRecurring: formData.has('isRecurring'),
            recurringFrequency: formData.get('recurringFrequency')
        };
    }

    // Public method to validate form
    validateForm() {
        const formData = this.getFormData();
        const errors = [];

        if (!formData.amount || formData.amount <= 0) {
            errors.push('נדרש סכום חיובי');
        }
        if (!formData.description?.trim()) {
            errors.push('נדרש תיאור');
        }
        if (!formData.category) {
            errors.push('נדרשת קטגוריה');
        }
        if (!formData.account) {
            errors.push('נדרש חשבון');
        }
        if (!formData.date) {
            errors.push('נדרש תאריך');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Static method to create quick transaction form
TransactionForm.createQuickForm = function(container, options = {}) {
    const quickOptions = {
        ...options,
        mode: 'add',
        showQuickActions: true
    };
    return new TransactionForm(container, quickOptions);
};