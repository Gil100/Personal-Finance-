// Hebrew Category Manager Component
export class CategoryManager {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            mode: 'manage', // 'manage', 'select', 'add'
            allowAdd: true,
            allowEdit: true,
            allowDelete: true,
            multiSelect: false,
            selectedCategories: [],
            onSelect: null,
            onAdd: null,
            onEdit: null,
            onDelete: null,
            ...options
        };
        this.categories = [];
        this.filteredCategories = [];
        this.searchTerm = '';
        this.activeFilter = 'all'; // 'all', 'expense', 'income'
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.render();
        this.bindEvents();
    }

    async loadCategories() {
        try {
            const { DataManager } = await import('../data/index.js');
            this.categories = await DataManager.getCategories();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = [];
        }
    }

    render() {
        const isSelectMode = this.options.mode === 'select';
        const isAddMode = this.options.mode === 'add';

        this.container.innerHTML = `
            <div class="category-manager">
                ${!isAddMode ? this.renderHeader() : ''}
                ${!isAddMode ? this.renderSearch() : ''}
                ${!isAddMode ? this.renderFilters() : ''}
                ${isAddMode ? this.renderAddForm() : this.renderCategoryList()}
                ${this.options.allowAdd && !isAddMode ? this.renderAddButton() : ''}
            </div>
        `;
    }

    renderHeader() {
        const isSelectMode = this.options.mode === 'select';
        const title = isSelectMode ? 'בחר קטגוריה' : 'ניהול קטגוריות';
        
        return `
            <div class="category-header">
                <h3 class="category-title">${title}</h3>
                <div class="category-stats">
                    <span class="stat-item">
                        <span class="stat-number">${this.categories.filter(cat => cat.type === 'expense').length}</span>
                        <span class="stat-label">הוצאות</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-number">${this.categories.filter(cat => cat.type === 'income').length}</span>
                        <span class="stat-label">הכנסות</span>
                    </span>
                </div>
            </div>
        `;
    }

    renderSearch() {
        return `
            <div class="category-search">
                <div class="search-input-container">
                    <input type="text" id="categorySearch" class="search-input" 
                           placeholder="חפש קטגוריה..." value="${this.searchTerm}">
                    <span class="search-icon">🔍</span>
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="category-filters">
                <button class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" 
                        data-filter="all">הכל</button>
                <button class="filter-btn ${this.activeFilter === 'expense' ? 'active' : ''}" 
                        data-filter="expense">הוצאות</button>
                <button class="filter-btn ${this.activeFilter === 'income' ? 'active' : ''}" 
                        data-filter="income">הכנסות</button>
            </div>
        `;
    }

    renderCategoryList() {
        const isSelectMode = this.options.mode === 'select';
        
        if (this.filteredCategories.length === 0) {
            return `
                <div class="category-empty">
                    <div class="empty-icon">📂</div>
                    <h4>אין קטגוריות להצגה</h4>
                    <p>לא נמצאו קטגוריות התואמות את החיפוש</p>
                </div>
            `;
        }

        return `
            <div class="category-list">
                ${this.filteredCategories.map(category => this.renderCategoryItem(category, isSelectMode)).join('')}
            </div>
        `;
    }

    renderCategoryItem(category, isSelectMode) {
        const isSelected = this.options.selectedCategories.includes(category.id);
        const typeIcon = category.type === 'expense' ? '💸' : '💰';
        const typeText = category.type === 'expense' ? 'הוצאה' : 'הכנסה';
        
        return `
            <div class="category-item ${isSelected ? 'selected' : ''}" data-category-id="${category.id}">
                <div class="category-content">
                    <div class="category-icon">
                        ${category.icon || typeIcon}
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-meta">
                            <span class="category-type">${typeText}</span>
                            ${category.transactionCount ? `<span class="transaction-count">${category.transactionCount} עסקאות</span>` : ''}
                        </div>
                        ${category.description ? `<div class="category-description">${category.description}</div>` : ''}
                    </div>
                </div>
                <div class="category-actions">
                    ${isSelectMode ? `
                        <button class="btn-select ${isSelected ? 'selected' : ''}" data-action="select">
                            ${isSelected ? '✓ נבחר' : 'בחר'}
                        </button>
                    ` : `
                        ${this.options.allowEdit ? `
                            <button class="btn-icon btn-edit" data-action="edit" title="ערוך">✏️</button>
                        ` : ''}
                        ${this.options.allowDelete ? `
                            <button class="btn-icon btn-delete" data-action="delete" title="מחק">🗑️</button>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
    }

    renderAddButton() {
        return `
            <div class="category-add-section">
                <button class="btn-primary add-category-btn" data-action="add">
                    + הוסף קטגוריה חדשה
                </button>
            </div>
        `;
    }

    renderAddForm() {
        return `
            <div class="category-form">
                <div class="form-header">
                    <h3>הוסף קטגוריה חדשה</h3>
                </div>
                
                <form id="categoryForm" class="category-form-content">
                    <div class="form-group">
                        <label for="categoryName" class="form-label required">שם הקטגוריה</label>
                        <input type="text" id="categoryName" name="name" class="form-input" 
                               placeholder="למשל: מזון, תחבורה, משכורת..." required>
                    </div>

                    <div class="form-group">
                        <label for="categoryType" class="form-label required">סוג</label>
                        <div class="type-selection">
                            <label class="type-option">
                                <input type="radio" name="type" value="expense" checked>
                                <span class="type-label">
                                    <span class="type-icon">💸</span>
                                    <span class="type-text">הוצאה</span>
                                </span>
                            </label>
                            <label class="type-option">
                                <input type="radio" name="type" value="income">
                                <span class="type-label">
                                    <span class="type-icon">💰</span>
                                    <span class="type-text">הכנסה</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="categoryIcon" class="form-label">אייקון</label>
                        <div class="icon-selection">
                            <input type="text" id="categoryIcon" name="icon" class="form-input icon-input" 
                                   placeholder="בחר אייקון..." readonly>
                            <div class="icon-picker">
                                ${this.renderIconPicker()}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="categoryDescription" class="form-label">תיאור</label>
                        <textarea id="categoryDescription" name="description" class="form-input form-textarea" 
                                  placeholder="תיאור אופציונלי לקטגוריה..." rows="3"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">שמור קטגוריה</button>
                        <button type="button" class="btn-secondary" data-action="cancel">ביטול</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderIconPicker() {
        const expenseIcons = ['💸', '🛒', '🏠', '🚗', '🍔', '👕', '⚡', '📱', '🏥', '🎓', '🎬', '🎮'];
        const incomeIcons = ['💰', '💵', '🏦', '📈', '💼', '🎯', '🏆', '💎', '🎁', '📊', '💳', '🤝'];
        
        return `
            <div class="icon-category" data-type="expense">
                <h5>אייקוני הוצאות</h5>
                <div class="icon-grid">
                    ${expenseIcons.map(icon => `
                        <button type="button" class="icon-option" data-icon="${icon}">
                            ${icon}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="icon-category" data-type="income">
                <h5>אייקוני הכנסות</h5>
                <div class="icon-grid">
                    ${incomeIcons.map(icon => `
                        <button type="button" class="icon-option" data-icon="${icon}">
                            ${icon}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Search functionality
        const searchInput = this.container.querySelector('#categorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.applyFilters();
                this.updateCategoryList();
            });
        }

        // Filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeFilter = e.target.dataset.filter;
                this.applyFilters();
                this.updateFilters();
                this.updateCategoryList();
            });
        });

        // Category actions
        this.container.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const categoryId = e.target.closest('.category-item')?.dataset.categoryId;
            const category = this.categories.find(cat => cat.id === categoryId);

            switch (action) {
                case 'select':
                    this.handleSelect(category);
                    break;
                case 'edit':
                    this.handleEdit(category);
                    break;
                case 'delete':
                    this.handleDelete(category);
                    break;
                case 'add':
                    this.showAddForm();
                    break;
                case 'cancel':
                    this.handleCancel();
                    break;
            }
        });

        // Form submission
        const form = this.container.querySelector('#categoryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Icon picker
        this.container.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const icon = e.target.dataset.icon;
                const iconInput = this.container.querySelector('#categoryIcon');
                if (iconInput) {
                    iconInput.value = icon;
                }
                
                // Update visual selection
                this.container.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Type change in form
        this.container.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateIconPicker(e.target.value);
            });
        });
    }

    updateIconPicker(type) {
        this.container.querySelectorAll('.icon-category').forEach(category => {
            const categoryType = category.dataset.type;
            category.style.display = (type === 'expense' && categoryType === 'expense') || 
                                    (type === 'income' && categoryType === 'income') ? 'block' : 'none';
        });
    }

    applyFilters() {
        let filtered = this.categories;

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(category => 
                category.name.toLowerCase().includes(term) ||
                (category.description && category.description.toLowerCase().includes(term))
            );
        }

        // Apply type filter
        if (this.activeFilter !== 'all') {
            filtered = filtered.filter(category => category.type === this.activeFilter);
        }

        this.filteredCategories = filtered;
    }

    updateCategoryList() {
        const categoryList = this.container.querySelector('.category-list');
        if (categoryList) {
            const isSelectMode = this.options.mode === 'select';
            if (this.filteredCategories.length === 0) {
                categoryList.innerHTML = `
                    <div class="category-empty">
                        <div class="empty-icon">📂</div>
                        <h4>אין קטגוריות להצגה</h4>
                        <p>לא נמצאו קטגוריות התואמות את החיפוש</p>
                    </div>
                `;
            } else {
                categoryList.innerHTML = this.filteredCategories.map(category => 
                    this.renderCategoryItem(category, isSelectMode)
                ).join('');
            }
        }
    }

    updateFilters() {
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.activeFilter);
        });
    }

    handleSelect(category) {
        if (this.options.multiSelect) {
            const index = this.options.selectedCategories.indexOf(category.id);
            if (index > -1) {
                this.options.selectedCategories.splice(index, 1);
            } else {
                this.options.selectedCategories.push(category.id);
            }
        } else {
            this.options.selectedCategories = [category.id];
        }

        this.updateCategoryList();

        if (this.options.onSelect) {
            this.options.onSelect(category, this.options.selectedCategories);
        }
    }

    handleEdit(category) {
        if (this.options.onEdit) {
            this.options.onEdit(category);
        } else {
            // Default edit implementation
            this.showEditForm(category);
        }
    }

    async handleDelete(category) {
        if (!confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${category.name}"?`)) {
            return;
        }

        try {
            const { DataManager } = await import('../data/index.js');
            await DataManager.deleteCategory(category.id);
            
            await this.loadCategories();
            this.updateCategoryList();
            
            if (this.options.onDelete) {
                this.options.onDelete(category);
            }
            
            this.showSuccessMessage('הקטגוריה נמחקה בהצלחה');
        } catch (error) {
            console.error('Failed to delete category:', error);
            this.showErrorMessage('שגיאה במחיקת הקטגוריה');
        }
    }

    showAddForm() {
        this.options.mode = 'add';
        this.render();
        this.bindEvents();
    }

    showEditForm(category) {
        this.options.mode = 'edit';
        this.editingCategory = category;
        this.render();
        this.populateEditForm(category);
        this.bindEvents();
    }

    populateEditForm(category) {
        const form = this.container.querySelector('#categoryForm');
        if (form) {
            form.querySelector('[name="name"]').value = category.name;
            form.querySelector(`[name="type"][value="${category.type}"]`).checked = true;
            form.querySelector('[name="icon"]').value = category.icon || '';
            form.querySelector('[name="description"]').value = category.description || '';
            
            this.updateIconPicker(category.type);
            
            // Update header
            const header = this.container.querySelector('.form-header h3');
            if (header) {
                header.textContent = 'ערוך קטגוריה';
            }
        }
    }

    async handleFormSubmit() {
        const form = this.container.querySelector('#categoryForm');
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name'),
            type: formData.get('type'),
            icon: formData.get('icon'),
            description: formData.get('description'),
            createdAt: this.editingCategory?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const { DataManager } = await import('../data/index.js');
            
            if (this.editingCategory) {
                categoryData.id = this.editingCategory.id;
                await DataManager.updateCategory(categoryData.id, categoryData);
                this.showSuccessMessage('הקטגוריה עודכנה בהצלחה');
            } else {
                categoryData.id = this.generateId();
                await DataManager.addCategory(categoryData);
                this.showSuccessMessage('הקטגוריה נוספה בהצלחה');
            }

            if (this.options.onAdd) {
                this.options.onAdd(categoryData);
            }

            await this.loadCategories();
            this.handleCancel();
        } catch (error) {
            console.error('Failed to save category:', error);
            this.showErrorMessage('שגיאה בשמירת הקטגוריה');
        }
    }

    handleCancel() {
        this.options.mode = 'manage';
        this.editingCategory = null;
        this.render();
        this.bindEvents();
    }

    generateId() {
        return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showSuccessMessage(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        }
    }

    showErrorMessage(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }

    // Public methods
    getSelectedCategories() {
        return this.options.selectedCategories.map(id => 
            this.categories.find(cat => cat.id === id)
        ).filter(Boolean);
    }

    setSelectedCategories(categoryIds) {
        this.options.selectedCategories = categoryIds;
        this.updateCategoryList();
    }

    refreshCategories() {
        return this.loadCategories().then(() => {
            this.updateCategoryList();
        });
    }
}

// Static methods for common use cases
CategoryManager.createSelector = function(container, options = {}) {
    return new CategoryManager(container, {
        ...options,
        mode: 'select',
        allowEdit: false,
        allowDelete: false
    });
};

CategoryManager.createManager = function(container, options = {}) {
    return new CategoryManager(container, {
        ...options,
        mode: 'manage'
    });
};