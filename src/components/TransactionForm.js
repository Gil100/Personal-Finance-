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
                                   placeholder="הקלד תגית והקש Enter או פסיק..."
                                   autocomplete="off">
                            <input type="hidden" id="hiddenTags" name="hiddenTags" value="">
                            <div class="tags-suggestions" style="display: none;"></div>
                        </div>
                        <div class="selected-tags"></div>
                        <div class="tags-help">
                            <small class="help-text">השתמש במקש Enter או פסיק להוספת תגית • מקש Backspace למחיקת התגית האחרונה</small>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-group">
                        <label for="notes" class="form-label">הערות</label>
                        <div class="notes-container">
                            <textarea id="notes" name="notes" 
                                      class="form-input form-textarea notes-textarea" 
                                      placeholder="הערות נוספות על העסקה..."
                                      rows="4"
                                      maxlength="500"
                                      dir="auto">${transaction.notes || ''}</textarea>
                            <div class="notes-footer">
                                <div class="character-count">
                                    <span class="current-count">0</span>/<span class="max-count">500</span> תווים
                                </div>
                                <div class="notes-formatting-buttons">
                                    <button type="button" class="formatting-btn" data-format="bullet" title="רשימה">• רשימה</button>
                                    <button type="button" class="formatting-btn" data-format="date" title="הוסף תאריך">📅 תאריך</button>
                                    <button type="button" class="formatting-btn" data-format="clear" title="נקה טקסט">🗑️ נקה</button>
                                </div>
                            </div>
                        </div>
                        <div class="notes-suggestions">
                            <div class="suggestion-templates">
                                <button type="button" class="note-template" data-template="payment">💳 תשלום בוצע</button>
                                <button type="button" class="note-template" data-template="receipt">🧾 התקבלה קבלה</button>
                                <button type="button" class="note-template" data-template="business">💼 הוצאה עסקית</button>
                                <button type="button" class="note-template" data-template="personal">👤 הוצאה אישית</button>
                            </div>
                        </div>
                    </div>

                    <!-- Transaction Status & Approval -->
                    <div class="form-group">
                        <label class="form-label">סטטוס העסקה</label>
                        <div class="transaction-status-container">
                            <div class="status-selector">
                                <select id="transactionStatus" name="transactionStatus" class="form-input status-select">
                                    <option value="ממתין" ${(transaction.status || 'ממתין') === 'ממתין' ? 'selected' : ''}>ממתין לאישור</option>
                                    <option value="מאושר" ${transaction.status === 'מאושר' ? 'selected' : ''}>מאושר</option>
                                    <option value="נדחה" ${transaction.status === 'נדחה' ? 'selected' : ''}>נדחה</option>
                                    <option value="בביקורת" ${transaction.status === 'בביקורת' ? 'selected' : ''}>בביקורת</option>
                                </select>
                                <div class="status-indicator">
                                    <span class="status-badge status-${(transaction.status || 'ממתין').replace('ממתין', 'pending').replace('מאושר', 'approved').replace('נדחה', 'rejected').replace('בביקורת', 'review')}">
                                        ${this.getStatusIcon(transaction.status || 'ממתין')}
                                        <span class="status-text">${transaction.status || 'ממתין'}</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="approval-details" style="display: ${transaction.status && transaction.status !== 'ממתין' ? 'block' : 'none'}">
                                <div class="approval-info">
                                    <div class="form-group">
                                        <label for="approver" class="form-label">מאשר/דוחה</label>
                                        <input type="text" id="approver" name="approver" 
                                               class="form-input" 
                                               placeholder="שם המאשר..."
                                               value="${transaction.approver || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="approvalDate" class="form-label">תאריך אישור/דחייה</label>
                                        <input type="datetime-local" id="approvalDate" name="approvalDate" 
                                               class="form-input"
                                               value="${transaction.approvalDate || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="approvalNotes" class="form-label">הערות אישור</label>
                                        <textarea id="approvalNotes" name="approvalNotes" 
                                                  class="form-input form-textarea" 
                                                  placeholder="הערות על האישור או הדחייה..."
                                                  rows="2">${transaction.approvalNotes || ''}</textarea>
                                    </div>
                                </div>
                                
                                <div class="quick-approval-actions">
                                    <button type="button" class="quick-action-btn approve-btn" data-action="approve">
                                        ✅ אשר עסקה
                                    </button>
                                    <button type="button" class="quick-action-btn reject-btn" data-action="reject">
                                        ❌ דחה עסקה
                                    </button>
                                    <button type="button" class="quick-action-btn review-btn" data-action="review">
                                        🔍 שלח לביקורת
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Receipt Photos -->
                    <div class="form-group">
                        <label class="form-label">תמונות קבלה</label>
                        <div class="receipt-upload-area">
                            <input type="file" id="receiptFiles" name="receiptFiles" 
                                   class="file-input" 
                                   multiple 
                                   accept="image/*,application/pdf">
                            <label for="receiptFiles" class="file-upload-label">
                                <span class="upload-icon">📷</span>
                                <span class="upload-text">לחץ להוספת תמונות קבלה או גרור קבצים לכאן</span>
                                <span class="upload-hint">PNG, JPG, PDF עד 5MB לקובץ</span>
                            </label>
                        </div>
                        <div class="receipt-preview-container"></div>
                    </div>

                    <!-- Location Tracking -->
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="trackLocation" name="trackLocation" 
                                   class="form-checkbox"
                                   ${transaction.location ? 'checked' : ''}>
                            הוסף מיקום לעסקה
                        </label>
                        <div class="location-container" style="display: ${transaction.location ? 'block' : 'none'}">
                            <div class="location-input-group">
                                <input type="text" id="locationName" name="locationName" 
                                       class="form-input location-input" 
                                       placeholder="שם המיקום (לדוגמה: סופר ויקטורי רמת גן)"
                                       value="${transaction.location?.name || ''}"
                                       readonly>
                                <button type="button" class="btn-secondary detect-location-btn" title="זהה מיקום נוכחי">
                                    📍 זהה מיקום
                                </button>
                                <button type="button" class="btn-ghost search-location-btn" title="חפש מיקום">
                                    🔍 חפש
                                </button>
                            </div>
                            
                            <div class="location-details" style="display: ${transaction.location?.address ? 'block' : 'none'}">
                                <div class="location-info">
                                    <div class="location-address">
                                        <span class="location-icon">📍</span>
                                        <span class="address-text">${transaction.location?.address || ''}</span>
                                    </div>
                                    ${transaction.location?.coords ? `
                                    <div class="location-coords">
                                        <span class="coords-label">קואורדינטות:</span>
                                        <span class="coords-text">${transaction.location.coords.lat.toFixed(6)}, ${transaction.location.coords.lng.toFixed(6)}</span>
                                    </div>
                                    ` : ''}
                                    <div class="location-actions">
                                        <button type="button" class="btn-ghost btn-sm view-map-btn" title="צפה במפה">
                                            🗺️ צפה במפה
                                        </button>
                                        <button type="button" class="btn-ghost btn-sm clear-location-btn" title="מחק מיקום">
                                            🗑️ מחק מיקום
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="location-search-results" style="display: none;"></div>
                            
                            <div class="location-help">
                                <small class="help-text">
                                    💡 הוספת מיקום עוזרת לסיווג הוצאות ומעקב אחר דפוסי צריכה לפי מקום
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Transaction Splitting -->
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="splitTransaction" name="splitTransaction" 
                                   class="form-checkbox"
                                   ${transaction.split?.enabled ? 'checked' : ''}>
                            פיצול עסקה בין קטגוריות
                        </label>
                        <div class="split-container" style="display: ${transaction.split?.enabled ? 'block' : 'none'}">
                            <div class="split-explanation">
                                <div class="split-info">
                                    💡 פיצול עסקה מאפשר לחלק עסקה אחת בין מספר קטגוריות
                                    <br>
                                    <small>לדוגמה: רכישה בסופר (מזון + מוצרי ניקיון + יופי)</small>
                                </div>
                                <div class="split-total">
                                    <span class="total-label">סה"כ:</span>
                                    <span class="split-total-amount">₪ 0.00</span>
                                    <span class="remaining-amount" style="display: none;">
                                        נותר: <span class="remaining-value">₪ 0.00</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="split-items-container">
                                <div class="split-items-list"></div>
                                <button type="button" class="btn-secondary btn-sm add-split-item">
                                    + הוסף פיצול
                                </button>
                            </div>
                            
                            <div class="split-actions">
                                <button type="button" class="btn-ghost btn-sm auto-split-btn" title="פיצול אוטומטי שווה">
                                    ⚖️ פיצול שווה
                                </button>
                                <button type="button" class="btn-ghost btn-sm percentage-split-btn" title="פיצול לפי אחוזים">
                                    % פיצול אחוזי
                                </button>
                                <button type="button" class="btn-ghost btn-sm clear-splits-btn" title="נקה פיצולים">
                                    🗑️ נקה הכל
                                </button>
                            </div>
                            
                            <div class="split-validation">
                                <div class="validation-message" style="display: none;"></div>
                            </div>
                        </div>
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
                            <div class="recurring-grid">
                                <div class="form-group">
                                    <label for="recurringFrequency" class="form-label">תדירות</label>
                                    <select id="recurringFrequency" name="recurringFrequency" class="form-input">
                                        <option value="weekly" ${transaction.recurringFrequency === 'weekly' ? 'selected' : ''}>שבועי</option>
                                        <option value="biweekly" ${transaction.recurringFrequency === 'biweekly' ? 'selected' : ''}>דו-שבועי</option>
                                        <option value="monthly" ${transaction.recurringFrequency === 'monthly' ? 'selected' : ''}>חודשי</option>
                                        <option value="quarterly" ${transaction.recurringFrequency === 'quarterly' ? 'selected' : ''}>רבעוני</option>
                                        <option value="yearly" ${transaction.recurringFrequency === 'yearly' ? 'selected' : ''}>שנתי</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="recurringEndDate" class="form-label">תאריך סיום (אופציונלי)</label>
                                    <input type="date" id="recurringEndDate" name="recurringEndDate" 
                                           class="form-input"
                                           value="${transaction.recurringEndDate || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="recurringCount" class="form-label">מספר פעמים (אופציונלי)</label>
                                    <input type="number" id="recurringCount" name="recurringCount" 
                                           class="form-input" 
                                           placeholder="ללא הגבלה"
                                           min="1"
                                           value="${transaction.recurringCount || ''}">
                                </div>
                            </div>
                            <div class="recurring-preview">
                                <small class="recurring-preview-text"></small>
                            </div>
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
        this.initializeNotes();
        this.initializeApprovalSystem();
        this.initializeReceiptUpload();
        this.initializeLocationTracking();
        this.initializeTransactionSplitting();
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
        const suggestionsContainer = this.container.querySelector('.tags-suggestions');
        
        this.selectedTags = this.options.transaction?.tags ? [...this.options.transaction.tags] : [];
        this.commonHebrewTags = [
            'מזומן', 'כרטיס אשראי', 'העברה בנקאית', 'חשבונית', 'קבלה',
            'עסקי', 'אישי', 'דחוף', 'חודשי', 'שנתי',
            'מכולת', 'דלק', 'תחבורה', 'בילוי', 'בריאות',
            'חינוך', 'ביגוד', 'טכנולוגיה', 'מתנה', 'חסכון',
            'חירום', 'נסיעה', 'מסעדה', 'ספורט', 'תרבות'
        ];
        
        this.updateTagsDisplay();
        
        // Clear input value on initialization 
        tagsInput.value = '';
        
        // Add tag suggestions functionality
        tagsInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            this.showTagSuggestions(value);
        });
        
        // Handle tag selection on Enter or comma
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTagFromInput();
            } else if (e.key === 'Backspace' && e.target.value === '' && this.selectedTags.length > 0) {
                // Remove last tag when backspace is pressed on empty input
                this.removeTag(this.selectedTags.length - 1);
            }
        });
        
        // Handle clicking away from suggestions
        document.addEventListener('click', (e) => {
            if (!suggestionsContainer.contains(e.target) && e.target !== tagsInput) {
                this.hideSuggestions();
            }
        });
        
        // Handle suggestion clicks
        suggestionsContainer.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.tag-suggestion');
            if (suggestion) {
                const tagText = suggestion.dataset.tag;
                this.addTag(tagText);
                tagsInput.value = '';
                this.hideSuggestions();
            }
        });
    }

    addTagFromInput() {
        const tagsInput = this.container.querySelector('#tags');
        const value = tagsInput.value.trim();
        
        if (value && !this.selectedTags.includes(value)) {
            this.addTag(value);
            tagsInput.value = '';
            this.hideSuggestions();
        }
    }

    addTag(tagText) {
        if (tagText && !this.selectedTags.includes(tagText) && this.selectedTags.length < 10) {
            this.selectedTags.push(tagText);
            this.updateTagsDisplay();
        }
    }

    removeTag(index) {
        this.selectedTags.splice(index, 1);
        this.updateTagsDisplay();
    }

    updateTagsDisplay() {
        const selectedTagsContainer = this.container.querySelector('.selected-tags');
        
        selectedTagsContainer.innerHTML = this.selectedTags.map((tag, index) => `
            <span class="tag-item" data-index="${index}">
                <span class="tag-text">${tag}</span>
                <button type="button" class="tag-remove" data-index="${index}" title="הסר תגית">×</button>
            </span>
        `).join('');
        
        // Bind remove events
        selectedTagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(e.target.dataset.index);
                this.removeTag(index);
            });
        });
        
        // Update hidden input for form submission
        const hiddenTagsInput = this.container.querySelector('#hiddenTags');
        if (hiddenTagsInput) {
            hiddenTagsInput.value = this.selectedTags.join(',');
        }
    }

    showTagSuggestions(query) {
        const suggestionsContainer = this.container.querySelector('.tags-suggestions');
        
        if (!query) {
            this.hideSuggestions();
            return;
        }
        
        // Filter suggestions based on query
        const filtered = this.commonHebrewTags.filter(tag => 
            tag.includes(query) && 
            !this.selectedTags.includes(tag)
        ).slice(0, 5);
        
        if (filtered.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsContainer.innerHTML = filtered.map(tag => `
            <div class="tag-suggestion" data-tag="${tag}">
                <span class="suggestion-text">${tag}</span>
                <span class="suggestion-hint">לחץ להוספה</span>
            </div>
        `).join('');
        
        suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsContainer = this.container.querySelector('.tags-suggestions');
        suggestionsContainer.style.display = 'none';
    }

    initializeNotes() {
        const notesTextarea = this.container.querySelector('#notes');
        const currentCountSpan = this.container.querySelector('.current-count');
        const formattingButtons = this.container.querySelectorAll('.formatting-btn');
        const noteTemplates = this.container.querySelectorAll('.note-template');
        
        // Update character count
        const updateCharacterCount = () => {
            const length = notesTextarea.value.length;
            currentCountSpan.textContent = length;
            
            // Change color based on usage
            if (length > 450) {
                currentCountSpan.style.color = 'var(--error-color)';
            } else if (length > 350) {
                currentCountSpan.style.color = 'var(--warning-color)';
            } else {
                currentCountSpan.style.color = 'var(--text-secondary)';
            }
        };
        
        // Initialize character count
        updateCharacterCount();
        
        // Bind events
        notesTextarea.addEventListener('input', updateCharacterCount);
        
        // Handle formatting buttons
        formattingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const format = e.target.dataset.format;
                this.handleNotesFormatting(format, notesTextarea);
            });
        });
        
        // Handle note templates
        noteTemplates.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const template = e.target.dataset.template;
                this.insertNoteTemplate(template, notesTextarea);
            });
        });
        
        // Auto-resize textarea
        const autoResize = () => {
            notesTextarea.style.height = 'auto';
            notesTextarea.style.height = Math.min(notesTextarea.scrollHeight, 200) + 'px';
        };
        
        notesTextarea.addEventListener('input', autoResize);
        autoResize(); // Initial resize
    }

    handleNotesFormatting(format, textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        switch (format) {
            case 'bullet':
                const lines = text.substring(start, end).split('\n');
                const bulletText = lines.map(line => line.trim() ? `• ${line.trim()}` : line).join('\n');
                this.insertTextAtCursor(textarea, bulletText, start, end);
                break;
                
            case 'date':
                const now = new Date();
                const hebrewDate = now.toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                this.insertTextAtCursor(textarea, `📅 ${hebrewDate}`, start, end);
                break;
                
            case 'clear':
                if (confirm('האם אתה בטוח שברצונך למחוק את כל ההערות?')) {
                    textarea.value = '';
                    textarea.focus();
                    textarea.dispatchEvent(new Event('input'));
                }
                break;
        }
    }

    insertNoteTemplate(template, textarea) {
        const templates = {
            payment: '💳 תשלום בוצע בהצלחה',
            receipt: '🧾 התקבלה קבלה למס הכנסה',
            business: '💼 הוצאה עסקית - ניתן לצירוף לדוח',
            personal: '👤 הוצאה אישית'
        };
        
        const templateText = templates[template];
        if (templateText) {
            const currentText = textarea.value;
            const newText = currentText ? `${currentText}\n${templateText}` : templateText;
            textarea.value = newText;
            textarea.focus();
            textarea.setSelectionRange(newText.length, newText.length);
            textarea.dispatchEvent(new Event('input'));
        }
    }

    insertTextAtCursor(textarea, text, start, end) {
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        textarea.value = before + text + after;
        
        const newCursorPos = start + text.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.dispatchEvent(new Event('input'));
    }

    getStatusIcon(status) {
        const icons = {
            'ממתין': '⏳',
            'מאושר': '✅',
            'נדחה': '❌',
            'בביקורת': '🔍'
        };
        return icons[status] || '⏳';
    }

    initializeApprovalSystem() {
        const statusSelect = this.container.querySelector('#transactionStatus');
        const approvalDetails = this.container.querySelector('.approval-details');
        const statusBadge = this.container.querySelector('.status-badge');
        const quickActionBtns = this.container.querySelectorAll('.quick-action-btn');
        
        // Handle status changes
        statusSelect.addEventListener('change', (e) => {
            const newStatus = e.target.value;
            this.updateStatusDisplay(newStatus);
            
            // Show/hide approval details
            if (newStatus === 'ממתין') {
                approvalDetails.style.display = 'none';
            } else {
                approvalDetails.style.display = 'block';
                // Set current date for approval if not set
                const approvalDateInput = this.container.querySelector('#approvalDate');
                if (!approvalDateInput.value) {
                    const now = new Date();
                    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16);
                    approvalDateInput.value = localDateTime;
                }
            }
        });
        
        // Handle quick action buttons
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                this.handleQuickApprovalAction(action);
            });
        });
        
        // Initialize status display
        this.updateStatusDisplay(statusSelect.value);
    }

    updateStatusDisplay(status) {
        const statusBadge = this.container.querySelector('.status-badge');
        const statusText = this.container.querySelector('.status-text');
        
        // Update badge class
        statusBadge.className = `status-badge status-${status.replace('ממתין', 'pending').replace('מאושר', 'approved').replace('נדחה', 'rejected').replace('בביקורת', 'review')}`;
        
        // Update icon and text
        statusBadge.innerHTML = `
            ${this.getStatusIcon(status)}
            <span class="status-text">${status}</span>
        `;
    }

    handleQuickApprovalAction(action) {
        const statusSelect = this.container.querySelector('#transactionStatus');
        const approverInput = this.container.querySelector('#approver');
        const approvalDateInput = this.container.querySelector('#approvalDate');
        const approvalNotesInput = this.container.querySelector('#approvalNotes');
        
        // Get current user (could be from settings or login system)
        const currentUser = 'משתמש נוכחי'; // In real app, get from auth system
        
        // Set current date/time
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        
        switch (action) {
            case 'approve':
                statusSelect.value = 'מאושר';
                approverInput.value = currentUser;
                approvalDateInput.value = localDateTime;
                approvalNotesInput.value = approvalNotesInput.value || '✅ עסקה אושרה';
                break;
                
            case 'reject':
                statusSelect.value = 'נדחה';
                approverInput.value = currentUser;
                approvalDateInput.value = localDateTime;
                approvalNotesInput.value = approvalNotesInput.value || '❌ עסקה נדחתה - נדרש מידע נוסף';
                break;
                
            case 'review':
                statusSelect.value = 'בביקורת';
                approverInput.value = currentUser;
                approvalDateInput.value = localDateTime;
                approvalNotesInput.value = approvalNotesInput.value || '🔍 העסקה נשלחה לביקורת נוספת';
                break;
        }
        
        // Trigger status change event
        statusSelect.dispatchEvent(new Event('change'));
        
        // Show success message
        this.showStatusMessage(action);
    }

    showStatusMessage(action) {
        const messages = {
            approve: 'העסקה אושרה בהצלחה! ✅',
            reject: 'העסקה נדחתה ❌',
            review: 'העסקה נשלחה לביקורת 🔍'
        };
        
        if (window.showToast) {
            const type = action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'info';
            window.showToast(messages[action], type);
        }
    }

    initializeReceiptUpload() {
        const fileInput = this.container.querySelector('#receiptFiles');
        const uploadArea = this.container.querySelector('.receipt-upload-area');
        const previewContainer = this.container.querySelector('.receipt-preview-container');
        
        this.receiptFiles = [];
        
        // Load existing receipts if editing
        if (this.options.transaction?.receipts) {
            this.receiptFiles = [...this.options.transaction.receipts];
            this.updateReceiptPreview();
        }
        
        // File input change handler
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }

    async handleFileSelect(files) {
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        const maxFiles = 10;
        
        if (this.receiptFiles.length + files.length > maxFiles) {
            this.showErrorMessage(`ניתן להעלות עד ${maxFiles} קבצים`);
            return;
        }
        
        for (let file of files) {
            if (file.size > maxFileSize) {
                this.showErrorMessage(`קובץ "${file.name}" גדול מדי (מקסימום 5MB)`);
                continue;
            }
            
            if (!this.isValidFileType(file)) {
                this.showErrorMessage(`סוג קובץ לא נתמך: ${file.name}`);
                continue;
            }
            
            try {
                const receiptData = await this.processReceiptFile(file);
                this.receiptFiles.push(receiptData);
            } catch (error) {
                console.error('Error processing file:', error);
                this.showErrorMessage(`שגיאה בעיבוד קובץ: ${file.name}`);
            }
        }
        
        this.updateReceiptPreview();
    }

    isValidFileType(file) {
        const validTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf'
        ];
        return validTypes.includes(file.type);
    }

    async processReceiptFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const receiptData = {
                    id: this.generateId(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result, // Base64 data URL
                    uploadedAt: new Date().toISOString()
                };
                
                resolve(receiptData);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    updateReceiptPreview() {
        const previewContainer = this.container.querySelector('.receipt-preview-container');
        
        if (this.receiptFiles.length === 0) {
            previewContainer.innerHTML = '';
            return;
        }
        
        previewContainer.innerHTML = `
            <div class="receipt-preview-header">
                <span class="preview-title">תמונות שנבחרו (${this.receiptFiles.length})</span>
                <button type="button" class="btn-ghost btn-sm clear-all-receipts">מחק הכל</button>
            </div>
            <div class="receipt-preview-grid">
                ${this.receiptFiles.map(receipt => this.createReceiptPreview(receipt)).join('')}
            </div>
        `;
        
        // Bind remove events
        previewContainer.querySelectorAll('.remove-receipt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const receiptId = e.target.dataset.receiptId;
                this.removeReceipt(receiptId);
            });
        });
        
        // Bind clear all event
        const clearAllBtn = previewContainer.querySelector('.clear-all-receipts');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.receiptFiles = [];
                this.updateReceiptPreview();
            });
        }
        
        // Bind view events
        previewContainer.querySelectorAll('.view-receipt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const receiptId = e.target.dataset.receiptId;
                this.viewReceipt(receiptId);
            });
        });
    }

    createReceiptPreview(receipt) {
        const isImage = receipt.type.startsWith('image/');
        const sizeMB = (receipt.size / 1024 / 1024).toFixed(1);
        
        return `
            <div class="receipt-preview-item" data-receipt-id="${receipt.id}">
                <div class="receipt-thumbnail">
                    ${isImage ? 
                        `<img src="${receipt.data}" alt="${receipt.name}" class="receipt-image">` :
                        `<div class="receipt-pdf">
                            <span class="pdf-icon">📄</span>
                            <span class="pdf-label">PDF</span>
                        </div>`
                    }
                </div>
                <div class="receipt-info">
                    <div class="receipt-name" title="${receipt.name}">${this.truncateText(receipt.name, 15)}</div>
                    <div class="receipt-size">${sizeMB} MB</div>
                </div>
                <div class="receipt-actions">
                    <button type="button" class="btn-ghost btn-xs view-receipt" data-receipt-id="${receipt.id}" title="צפה">👁️</button>
                    <button type="button" class="btn-error btn-xs remove-receipt" data-receipt-id="${receipt.id}" title="מחק">🗑️</button>
                </div>
            </div>
        `;
    }

    removeReceipt(receiptId) {
        this.receiptFiles = this.receiptFiles.filter(r => r.id !== receiptId);
        this.updateReceiptPreview();
    }

    initializeLocationTracking() {
        const trackLocationCheckbox = this.container.querySelector('#trackLocation');
        const locationContainer = this.container.querySelector('.location-container');
        const detectLocationBtn = this.container.querySelector('.detect-location-btn');
        const searchLocationBtn = this.container.querySelector('.search-location-btn');
        const clearLocationBtn = this.container.querySelector('.clear-location-btn');
        const viewMapBtn = this.container.querySelector('.view-map-btn');
        const locationInput = this.container.querySelector('#locationName');
        
        this.currentLocation = this.options.transaction?.location || null;
        
        // Toggle location container
        trackLocationCheckbox.addEventListener('change', () => {
            locationContainer.style.display = trackLocationCheckbox.checked ? 'block' : 'none';
            if (!trackLocationCheckbox.checked) {
                this.clearLocation();
            }
        });
        
        // Detect current location
        detectLocationBtn.addEventListener('click', () => {
            this.detectCurrentLocation();
        });
        
        // Search for location
        searchLocationBtn.addEventListener('click', () => {
            this.showLocationSearch();
        });
        
        // Clear location
        clearLocationBtn.addEventListener('click', () => {
            this.clearLocation();
        });
        
        // View location on map
        viewMapBtn.addEventListener('click', () => {
            this.viewLocationOnMap();
        });
        
        // Handle Enter key in search
        locationInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.showLocationSearch();
            }
        });
    }

    async detectCurrentLocation() {
        const detectBtn = this.container.querySelector('.detect-location-btn');
        const originalText = detectBtn.innerHTML;
        
        try {
            detectBtn.innerHTML = '📍 מזהה...';
            detectBtn.disabled = true;
            
            if (!navigator.geolocation) {
                throw new Error('הדפדפן לא תומך בזיהוי מיקום');
            }
            
            const position = await this.getCurrentPosition();
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Reverse geocode to get address
            const address = await this.reverseGeocode(coords);
            
            this.setLocation({
                name: address.name || 'מיקום נוכחי',
                address: address.formatted,
                coords: coords,
                detectedAt: new Date().toISOString()
            });
            
            this.showSuccessMessage('מיקום זוהה בהצלחה');
            
        } catch (error) {
            console.error('Location detection failed:', error);
            this.showErrorMessage(error.message || 'שגיאה בזיהוי המיקום');
        } finally {
            detectBtn.innerHTML = originalText;
            detectBtn.disabled = false;
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            };
            
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }
    
    async reverseGeocode(coords) {
        try {
            // Use OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1&accept-language=he`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            
            const data = await response.json();
            
            return {
                name: this.extractLocationName(data),
                formatted: data.display_name || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                details: data.address || {}
            };
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return {
                name: 'מיקום נוכחי',
                formatted: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                details: {}
            };
        }
    }
    
    extractLocationName(geocodeData) {
        const address = geocodeData.address || {};
        
        // Prioritize business/shop names
        if (address.shop) return address.shop;
        if (address.amenity) return address.amenity;
        if (address.building) return address.building;
        
        // Fallback to area names
        if (address.suburb) return address.suburb;
        if (address.neighbourhood) return address.neighbourhood;
        if (address.city_district) return address.city_district;
        if (address.city || address.town) return address.city || address.town;
        
        return 'מיקום נוכחי';
    }
    
    async showLocationSearch() {
        const searchQuery = this.container.querySelector('#locationName').value.trim();
        const searchResults = this.container.querySelector('.location-search-results');
        
        if (!searchQuery) {
            searchResults.style.display = 'none';
            return;
        }
        
        try {
            searchResults.innerHTML = '<div class="search-loading">מחפש מיקומים...</div>';
            searchResults.style.display = 'block';
            
            const results = await this.searchLocations(searchQuery);
            
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="no-results">לא נמצאו תוצאות</div>';
                return;
            }
            
            searchResults.innerHTML = `
                <div class="search-results-header">תוצאות חיפוש:</div>
                <div class="search-results-list">
                    ${results.map((result, index) => `
                        <div class="search-result-item" data-index="${index}">
                            <div class="result-name">${result.name}</div>
                            <div class="result-address">${result.address}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Bind click events to results
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.selectSearchResult(results[index]);
                    searchResults.style.display = 'none';
                });
            });
            
        } catch (error) {
            console.error('Location search failed:', error);
            searchResults.innerHTML = '<div class="search-error">שגיאה בחיפוש מיקומים</div>';
        }
    }
    
    async searchLocations(query) {
        try {
            // Use OpenStreetMap Nominatim API for location search
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=il&accept-language=he`
            );
            
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            
            const data = await response.json();
            
            return data.map(item => ({
                name: this.extractLocationName(item),
                address: item.display_name,
                coords: {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                },
                details: item.address || {}
            }));
            
        } catch (error) {
            console.error('Location search error:', error);
            throw error;
        }
    }
    
    selectSearchResult(location) {
        this.setLocation({
            name: location.name,
            address: location.address,
            coords: location.coords,
            selectedAt: new Date().toISOString()
        });
        
        this.showSuccessMessage(`נבחר מיקום: ${location.name}`);
    }
    
    setLocation(locationData) {
        this.currentLocation = locationData;
        
        const locationInput = this.container.querySelector('#locationName');
        const locationDetails = this.container.querySelector('.location-details');
        const addressText = this.container.querySelector('.address-text');
        const coordsText = this.container.querySelector('.coords-text');
        
        // Update input
        locationInput.value = locationData.name;
        
        // Update address display
        addressText.textContent = locationData.address;
        
        // Update coordinates if available
        if (locationData.coords && coordsText) {
            coordsText.textContent = `${locationData.coords.lat.toFixed(6)}, ${locationData.coords.lng.toFixed(6)}`;
        }
        
        // Show location details
        locationDetails.style.display = 'block';
    }
    
    clearLocation() {
        this.currentLocation = null;
        
        const locationInput = this.container.querySelector('#locationName');
        const locationDetails = this.container.querySelector('.location-details');
        const searchResults = this.container.querySelector('.location-search-results');
        
        locationInput.value = '';
        locationDetails.style.display = 'none';
        searchResults.style.display = 'none';
    }
    
    async viewLocationOnMap() {
        if (!this.currentLocation?.coords) {
            this.showErrorMessage('אין קואורדינטות זמינות למיקום');
            return;
        }
        
        try {
            const { Modal } = await import('./Modal.js');
            
            const modalContainer = document.createElement('div');
            const modal = new Modal(modalContainer, {
                title: `מפה: ${this.currentLocation.name}`,
                size: 'large',
                onClose: () => {
                    modalContainer.remove();
                }
            });

            const coords = this.currentLocation.coords;
            const mapContent = `
                <div class="location-map-container">
                    <div class="map-info">
                        <strong>${this.currentLocation.name}</strong><br>
                        <small>${this.currentLocation.address}</small>
                    </div>
                    <div class="map-iframe-container">
                        <iframe 
                            src="https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.01},${coords.lat-0.01},${coords.lng+0.01},${coords.lat+0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}"
                            class="location-map-iframe"
                            frameborder="0"
                            scrolling="no">
                        </iframe>
                    </div>
                    <div class="map-actions">
                        <a href="https://www.google.com/maps?q=${coords.lat},${coords.lng}" 
                           target="_blank" 
                           class="btn-secondary">
                            🗺️ פתח ב-Google Maps
                        </a>
                        <a href="https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=16" 
                           target="_blank" 
                           class="btn-ghost">
                            🌐 פתח ב-OpenStreetMap
                        </a>
                    </div>
                </div>
            `;

            modal.setContent(mapContent);
            modal.open();
            
            document.body.appendChild(modalContainer);
            
        } catch (error) {
            console.error('Failed to show map:', error);
            this.showErrorMessage('שגיאה בהצגת המפה');
        }
    }

    initializeTransactionSplitting() {
        const splitCheckbox = this.container.querySelector('#splitTransaction');
        const splitContainer = this.container.querySelector('.split-container');
        const addSplitBtn = this.container.querySelector('.add-split-item');
        const autoSplitBtn = this.container.querySelector('.auto-split-btn');
        const percentageSplitBtn = this.container.querySelector('.percentage-split-btn');
        const clearSplitsBtn = this.container.querySelector('.clear-splits-btn');
        
        this.splitItems = this.options.transaction?.split?.items || [];
        
        // Toggle split container
        splitCheckbox.addEventListener('change', () => {
            splitContainer.style.display = splitCheckbox.checked ? 'block' : 'none';
            if (splitCheckbox.checked && this.splitItems.length === 0) {
                this.addSplitItem();
            } else if (!splitCheckbox.checked) {
                this.clearSplitItems();
            }
            this.updateSplitDisplay();
        });
        
        // Add split item
        addSplitBtn.addEventListener('click', () => {
            this.addSplitItem();
        });
        
        // Auto split evenly
        autoSplitBtn.addEventListener('click', () => {
            this.autoSplitEvenly();
        });
        
        // Percentage split
        percentageSplitBtn.addEventListener('click', () => {
            this.showPercentageSplitDialog();
        });
        
        // Clear splits
        clearSplitsBtn.addEventListener('click', () => {
            this.clearSplitItems();
        });
        
        // Initialize display
        this.updateSplitDisplay();
        
        // Listen to amount changes
        const amountInput = this.container.querySelector('#amount');
        amountInput.addEventListener('input', () => {
            this.updateSplitTotals();
        });
    }
    
    addSplitItem(splitData = null) {
        const splitId = this.generateId();
        const splitItem = splitData || {
            id: splitId,
            category: '',
            amount: 0,
            description: '',
            percentage: 0
        };
        
        this.splitItems.push(splitItem);
        this.updateSplitDisplay();
        
        // Focus on the new item's category select
        setTimeout(() => {
            const newCategorySelect = this.container.querySelector(`[data-split-id="${splitId}"] .split-category`);
            if (newCategorySelect) {
                newCategorySelect.focus();
            }
        }, 100);
    }
    
    removeSplitItem(splitId) {
        this.splitItems = this.splitItems.filter(item => item.id !== splitId);
        this.updateSplitDisplay();
    }
    
    updateSplitDisplay() {
        const splitItemsList = this.container.querySelector('.split-items-list');
        const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
        
        if (this.splitItems.length === 0) {
            splitItemsList.innerHTML = '<div class="no-splits">אין פיצולים - הוסף פיצול ראשון</div>';
            this.updateSplitTotals();
            return;
        }
        
        splitItemsList.innerHTML = this.splitItems.map((item, index) => 
            this.createSplitItemHTML(item, index)
        ).join('');
        
        // Bind events for each split item
        this.splitItems.forEach((item, index) => {
            this.bindSplitItemEvents(item.id, index);
        });
        
        this.loadCategoriesForSplits();
        this.updateSplitTotals();
    }
    
    createSplitItemHTML(item, index) {
        return `
            <div class="split-item" data-split-id="${item.id}">
                <div class="split-item-header">
                    <span class="split-item-number">#${index + 1}</span>
                    <button type="button" class="btn-error btn-xs remove-split" data-split-id="${item.id}" title="הסר פיצול">
                        🗑️
                    </button>
                </div>
                
                <div class="split-item-content">
                    <div class="split-row">
                        <div class="split-field">
                            <label class="split-label">קטגוריה</label>
                            <select class="form-input split-category" data-split-id="${item.id}">
                                <option value="">בחר קטגוריה...</option>
                            </select>
                        </div>
                        
                        <div class="split-field split-amount-field">
                            <label class="split-label">סכום</label>
                            <div class="split-amount-container">
                                <input type="number" 
                                       class="form-input split-amount" 
                                       data-split-id="${item.id}"
                                       placeholder="0.00" 
                                       step="0.01" 
                                       min="0"
                                       value="${item.amount || ''}">
                                <span class="currency-symbol">₪</span>
                            </div>
                        </div>
                        
                        <div class="split-field split-percentage-field">
                            <label class="split-label">אחוז</label>
                            <div class="split-percentage-container">
                                <input type="number" 
                                       class="form-input split-percentage" 
                                       data-split-id="${item.id}"
                                       placeholder="0" 
                                       step="0.1" 
                                       min="0" 
                                       max="100"
                                       value="${item.percentage || ''}">
                                <span class="percentage-symbol">%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="split-row">
                        <div class="split-field split-description-field">
                            <label class="split-label">תיאור (אופציונלי)</label>
                            <input type="text" 
                                   class="form-input split-description" 
                                   data-split-id="${item.id}"
                                   placeholder="תיאור הפיצול..."
                                   value="${item.description || ''}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindSplitItemEvents(splitId, index) {
        const splitItem = this.container.querySelector(`[data-split-id="${splitId}"]`);
        
        // Remove button
        const removeBtn = splitItem.querySelector('.remove-split');
        removeBtn.addEventListener('click', () => {
            this.removeSplitItem(splitId);
        });
        
        // Amount input
        const amountInput = splitItem.querySelector('.split-amount');
        amountInput.addEventListener('input', (e) => {
            this.updateSplitItemAmount(splitId, parseFloat(e.target.value) || 0);
        });
        
        // Percentage input
        const percentageInput = splitItem.querySelector('.split-percentage');
        percentageInput.addEventListener('input', (e) => {
            this.updateSplitItemPercentage(splitId, parseFloat(e.target.value) || 0);
        });
        
        // Category select
        const categorySelect = splitItem.querySelector('.split-category');
        categorySelect.addEventListener('change', (e) => {
            this.updateSplitItemCategory(splitId, e.target.value);
        });
        
        // Description input
        const descriptionInput = splitItem.querySelector('.split-description');
        descriptionInput.addEventListener('input', (e) => {
            this.updateSplitItemDescription(splitId, e.target.value);
        });
    }
    
    updateSplitItemAmount(splitId, amount) {
        const item = this.splitItems.find(i => i.id === splitId);
        if (item) {
            item.amount = amount;
            
            // Calculate percentage based on total amount
            const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
            if (totalAmount > 0) {
                item.percentage = (amount / totalAmount) * 100;
                
                // Update percentage display
                const percentageInput = this.container.querySelector(`[data-split-id="${splitId}"] .split-percentage`);
                percentageInput.value = item.percentage.toFixed(1);
            }
            
            this.updateSplitTotals();
        }
    }
    
    updateSplitItemPercentage(splitId, percentage) {
        const item = this.splitItems.find(i => i.id === splitId);
        if (item) {
            item.percentage = percentage;
            
            // Calculate amount based on percentage
            const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
            item.amount = (totalAmount * percentage) / 100;
            
            // Update amount display
            const amountInput = this.container.querySelector(`[data-split-id="${splitId}"] .split-amount`);
            amountInput.value = item.amount.toFixed(2);
            
            this.updateSplitTotals();
        }
    }
    
    updateSplitItemCategory(splitId, categoryId) {
        const item = this.splitItems.find(i => i.id === splitId);
        if (item) {
            item.category = categoryId;
        }
    }
    
    updateSplitItemDescription(splitId, description) {
        const item = this.splitItems.find(i => i.id === splitId);
        if (item) {
            item.description = description;
        }
    }
    
    updateSplitTotals() {
        const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
        const splitTotal = this.splitItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const remaining = totalAmount - splitTotal;
        
        // Update displays
        const splitTotalAmount = this.container.querySelector('.split-total-amount');
        const remainingAmount = this.container.querySelector('.remaining-amount');
        const remainingValue = this.container.querySelector('.remaining-value');
        const validationMessage = this.container.querySelector('.validation-message');
        
        if (splitTotalAmount) {
            splitTotalAmount.textContent = this.formatCurrency(totalAmount);
        }
        
        if (remainingAmount && remainingValue) {
            remainingValue.textContent = this.formatCurrency(remaining);
            
            if (Math.abs(remaining) > 0.01) {
                remainingAmount.style.display = 'inline';
                remainingAmount.className = `remaining-amount ${remaining > 0 ? 'positive' : 'negative'}`;
            } else {
                remainingAmount.style.display = 'none';
            }
        }
        
        // Show validation message
        if (validationMessage) {
            if (Math.abs(remaining) > 0.01 && this.splitItems.length > 0) {
                const message = remaining > 0 ? 
                    `⚠️ יתרת ${this.formatCurrency(remaining)} לא חולקה` :
                    `⚠️ חריגה של ${this.formatCurrency(Math.abs(remaining))} מהסכום הכולל`;
                    
                validationMessage.textContent = message;
                validationMessage.style.display = 'block';
                validationMessage.className = 'validation-message warning';
            } else if (this.splitItems.length > 0) {
                validationMessage.textContent = '✅ הפיצול מאוזן בהצלחה';
                validationMessage.style.display = 'block';
                validationMessage.className = 'validation-message success';
            } else {
                validationMessage.style.display = 'none';
            }
        }
    }
    
    async loadCategoriesForSplits() {
        try {
            const { DataManager } = await import('../data/index.js');
            const categories = await DataManager.getCategories();
            
            // Get current transaction type
            const transactionType = this.container.querySelector('input[name="type"]:checked')?.value || 'expense';
            const filteredCategories = categories.filter(cat => cat.type === transactionType);
            
            // Update all split category selects
            this.splitItems.forEach(item => {
                const categorySelect = this.container.querySelector(`[data-split-id="${item.id}"] .split-category`);
                if (categorySelect) {
                    // Save current value
                    const currentValue = item.category;
                    
                    // Clear and repopulate
                    categorySelect.innerHTML = '<option value="">בחר קטגוריה...</option>';
                    
                    filteredCategories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        if (category.id === currentValue) {
                            option.selected = true;
                        }
                        categorySelect.appendChild(option);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to load categories for splits:', error);
        }
    }
    
    autoSplitEvenly() {
        const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
        
        if (totalAmount <= 0 || this.splitItems.length === 0) {
            this.showErrorMessage('נדרש סכום חיובי ולפחות פיצול אחד');
            return;
        }
        
        const amountPerSplit = totalAmount / this.splitItems.length;
        const percentagePerSplit = 100 / this.splitItems.length;
        
        this.splitItems.forEach((item, index) => {
            item.amount = amountPerSplit;
            item.percentage = percentagePerSplit;
            
            // Update inputs
            const amountInput = this.container.querySelector(`[data-split-id="${item.id}"] .split-amount`);
            const percentageInput = this.container.querySelector(`[data-split-id="${item.id}"] .split-percentage`);
            
            if (amountInput) amountInput.value = amountPerSplit.toFixed(2);
            if (percentageInput) percentageInput.value = percentagePerSplit.toFixed(1);
        });
        
        this.updateSplitTotals();
        this.showSuccessMessage('פיצול שווה בוצע בהצלחה');
    }
    
    async showPercentageSplitDialog() {
        try {
            const { Modal } = await import('./Modal.js');
            
            const modalContainer = document.createElement('div');
            const modal = new Modal(modalContainer, {
                title: 'פיצול לפי אחוזים',
                size: 'medium',
                onClose: () => {
                    modalContainer.remove();
                }
            });

            const content = `
                <div class="percentage-split-dialog">
                    <div class="dialog-explanation">
                        <p>הזן אחוזים עבור כל פיצול. הסכום יחושב אוטומטית.</p>
                        <small>סה"כ אחוזים צריכים להגיע ל-100%</small>
                    </div>
                    
                    <div class="percentage-inputs">
                        ${this.splitItems.map((item, index) => `
                            <div class="percentage-input-row">
                                <label>פיצול #${index + 1}:</label>
                                <div class="percentage-input-container">
                                    <input type="number" 
                                           class="form-input percentage-dialog-input" 
                                           data-split-id="${item.id}"
                                           placeholder="0" 
                                           step="0.1" 
                                           min="0" 
                                           max="100"
                                           value="${item.percentage || ''}">
                                    <span class="percentage-symbol">%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="percentage-total">
                        <strong>סה"כ: <span class="total-percentage">0</span>%</strong>
                    </div>
                    
                    <div class="dialog-actions">
                        <button type="button" class="btn-primary apply-percentages">החל אחוזים</button>
                        <button type="button" class="btn-secondary cancel-percentages">ביטול</button>
                    </div>
                </div>
            `;

            modal.setContent(content);
            modal.open();
            document.body.appendChild(modalContainer);
            
            // Bind events
            const updateTotal = () => {
                const inputs = modalContainer.querySelectorAll('.percentage-dialog-input');
                const total = Array.from(inputs).reduce((sum, input) => 
                    sum + (parseFloat(input.value) || 0), 0
                );
                modalContainer.querySelector('.total-percentage').textContent = total.toFixed(1);
            };
            
            modalContainer.querySelectorAll('.percentage-dialog-input').forEach(input => {
                input.addEventListener('input', updateTotal);
            });
            
            modalContainer.querySelector('.apply-percentages').addEventListener('click', () => {
                this.applyPercentageSplit(modalContainer);
                modal.close();
            });
            
            modalContainer.querySelector('.cancel-percentages').addEventListener('click', () => {
                modal.close();
            });
            
            updateTotal();
            
        } catch (error) {
            console.error('Failed to show percentage split dialog:', error);
            this.showErrorMessage('שגיאה בהצגת דיאלוג הפיצול');
        }
    }
    
    applyPercentageSplit(modalContainer) {
        const inputs = modalContainer.querySelectorAll('.percentage-dialog-input');
        const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
        
        inputs.forEach(input => {
            const splitId = input.dataset.splitId;
            const percentage = parseFloat(input.value) || 0;
            
            this.updateSplitItemPercentage(splitId, percentage);
        });
        
        this.updateSplitDisplay();
        this.showSuccessMessage('פיצול אחוזי הוחל בהצלחה');
    }
    
    clearSplitItems() {
        this.splitItems = [];
        this.updateSplitDisplay();
    }
    
    validateSplits() {
        if (!this.container.querySelector('#splitTransaction').checked) {
            return { isValid: true, errors: [] };
        }
        
        const errors = [];
        const totalAmount = parseFloat(this.container.querySelector('#amount').value) || 0;
        const splitTotal = this.splitItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        if (this.splitItems.length === 0) {
            errors.push('נדרש לפחות פיצול אחד כאשר הפיצול מופעל');
        }
        
        // Check if all splits have categories
        const missingCategories = this.splitItems.filter(item => !item.category);
        if (missingCategories.length > 0) {
            errors.push(`${missingCategories.length} פיצולים חסרי קטגוריה`);
        }
        
        // Check if total matches
        if (Math.abs(totalAmount - splitTotal) > 0.01) {
            errors.push('סכום הפיצולים לא תואם לסכום הכולל');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async viewReceipt(receiptId) {
        const receipt = this.receiptFiles.find(r => r.id === receiptId);
        if (!receipt) return;
        
        try {
            const { Modal } = await import('./Modal.js');
            
            const modalContainer = document.createElement('div');
            const modal = new Modal(modalContainer, {
                title: receipt.name,
                size: 'large',
                onClose: () => {
                    modalContainer.remove();
                }
            });

            const content = receipt.type.startsWith('image/') ? 
                `<div class="receipt-full-view">
                    <img src="${receipt.data}" alt="${receipt.name}" class="receipt-full-image">
                </div>` :
                `<div class="receipt-pdf-view">
                    <iframe src="${receipt.data}" class="receipt-pdf-iframe"></iframe>
                </div>`;

            modal.setContent(content);
            modal.open();
            
            document.body.appendChild(modalContainer);
            
        } catch (error) {
            console.error('Failed to view receipt:', error);
            this.showErrorMessage('שגיאה בהצגת התמונה');
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

        // Recurring checkbox and options
        const recurringCheckbox = this.container.querySelector('#isRecurring');
        const recurringOptions = this.container.querySelector('.recurring-options');
        const recurringFrequency = this.container.querySelector('#recurringFrequency');
        const recurringEndDate = this.container.querySelector('#recurringEndDate');
        const recurringCount = this.container.querySelector('#recurringCount');
        
        recurringCheckbox.addEventListener('change', () => {
            recurringOptions.style.display = recurringCheckbox.checked ? 'block' : 'none';
            this.updateRecurringPreview();
        });
        
        // Update preview when recurring options change
        [recurringFrequency, recurringEndDate, recurringCount].forEach(element => {
            element.addEventListener('change', () => this.updateRecurringPreview());
            element.addEventListener('input', () => this.updateRecurringPreview());
        });
        
        // Initialize recurring preview
        this.updateRecurringPreview();

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
            tags: this.selectedTags || [],
            notes: formData.get('notes'),
            receipts: this.receiptFiles || [], // Add receipt files to transaction data
            location: this.currentLocation || null, // Add location data to transaction
            split: this.container.querySelector('#splitTransaction').checked ? {
                enabled: true,
                items: this.splitItems || []
            } : { enabled: false, items: [] }, // Add split data to transaction
            status: formData.get('transactionStatus') || 'ממתין',
            approver: formData.get('approver'),
            approvalDate: formData.get('approvalDate'),
            approvalNotes: formData.get('approvalNotes'),
            isRecurring: formData.has('isRecurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            recurringEndDate: formData.get('recurringEndDate'),
            recurringCount: formData.get('recurringCount') ? parseInt(formData.get('recurringCount')) : null,
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
            tags: this.selectedTags || [],
            notes: formData.get('notes'),
            isRecurring: formData.has('isRecurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            recurringEndDate: formData.get('recurringEndDate'),
            recurringCount: formData.get('recurringCount') ? parseInt(formData.get('recurringCount')) : null
        };
    }

    // Update recurring transaction preview
    updateRecurringPreview() {
        const isRecurring = this.container.querySelector('#isRecurring').checked;
        const previewElement = this.container.querySelector('.recurring-preview-text');
        
        if (!isRecurring || !previewElement) {
            if (previewElement) previewElement.textContent = '';
            return;
        }

        const frequency = this.container.querySelector('#recurringFrequency').value;
        const endDate = this.container.querySelector('#recurringEndDate').value;
        const count = this.container.querySelector('#recurringCount').value;
        const startDate = this.container.querySelector('#date').value;

        const frequencyLabels = {
            weekly: 'שבוע',
            biweekly: 'שבועיים', 
            monthly: 'חודש',
            quarterly: '3 חודשים',
            yearly: 'שנה'
        };

        let preview = `העסקה תחזור כל ${frequencyLabels[frequency]}`;
        
        if (startDate) {
            const nextDate = this.calculateNextOccurrence(startDate, frequency);
            preview += `. מועד הבא: ${this.formatHebrewDate(nextDate)}`;
        }

        if (count) {
            preview += `. סה"כ ${count} פעמים`;
        } else if (endDate) {
            preview += `. עד ${this.formatHebrewDate(endDate)}`;
        } else {
            preview += '. ללא הגבלת זמן';
        }

        previewElement.textContent = preview;
    }

    // Calculate next occurrence of recurring transaction
    calculateNextOccurrence(dateStr, frequency) {
        const date = new Date(dateStr);
        
        switch (frequency) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 14);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        
        return date.toISOString().split('T')[0];
    }

    // Format date in Hebrew
    formatHebrewDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

        // Validate splits if enabled
        const splitValidation = this.validateSplits();
        if (!splitValidation.isValid) {
            errors.push(...splitValidation.errors);
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