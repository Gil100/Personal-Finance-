/**
 * Hebrew Budget Tax Export Component
 * Exports budget and transaction data for Israeli tax purposes
 */
class BudgetTaxExport {
    constructor() {
        this.currentBudget = null;
        this.transactions = [];
        this.taxYearData = null;
        this.exportFormats = this.initializeExportFormats();
        this.israeliTaxCategories = this.initializeIsraeliTaxCategories();
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadBudgetData();
            await this.loadTransactionData();
            this.calculateTaxYearData();
        }
    }

    async loadBudgetData() {
        try {
            const budgets = await DataAPI.storage.getAll('budgets');
            const activeBudgets = Object.values(budgets).filter(b => b.status === 'active');
            this.currentBudget = activeBudgets.length > 0 ? activeBudgets[0] : null;
        } catch (error) {
            console.error('Failed to load budget data:', error);
        }
    }

    async loadTransactionData() {
        try {
            const transactions = await DataAPI.storage.getAll('transactions');
            this.transactions = Object.values(transactions);
        } catch (error) {
            console.error('Failed to load transaction data:', error);
        }
    }

    initializeExportFormats() {
        return {
            'mas-hachnesot': {
                id: 'mas-hachnesot',
                name: 'דוח למס הכנסה',
                description: 'ייצוא נתונים לצורך דיווח למס הכנסה',
                icon: '🏛️',
                fileFormat: 'csv',
                requiredFields: ['date', 'description', 'amount', 'category', 'taxCategory'],
                headers: ['תאריך', 'תיאור', 'סכום', 'קטגוריה', 'סיווג מס', 'מספר קבלה'],
                template: 'israeli-tax-template'
            },
            'business-expenses': {
                id: 'business-expenses',
                name: 'הוצאות עסקיות',
                description: 'ייצוא הוצאות עסקיות לצורך דיווח',
                icon: '💼',
                fileFormat: 'csv',
                requiredFields: ['date', 'description', 'amount', 'supplier', 'vatAmount'],
                headers: ['תאריך', 'תיאור', 'ספק', 'סכום לפני מע"מ', 'מע"מ', 'סכום כולל', 'מספר חשבונית'],
                template: 'business-expenses-template'
            },
            'charitable-donations': {
                id: 'charitable-donations',
                name: 'תרומות לזיכוי במס',
                description: 'ייצוא תרומות המוכרות לזיכוי במס',
                icon: '🤝',
                fileFormat: 'csv',
                requiredFields: ['date', 'organization', 'amount', 'receiptNumber'],
                headers: ['תאריך', 'ארגון', 'סכום', 'מספר קבלה', 'סטטוס הכרה'],
                template: 'donations-template'
            },
            'medical-expenses': {
                id: 'medical-expenses',
                name: 'הוצאות רפואיות',
                description: 'ייצוא הוצאות רפואיות לזיכוי במס',
                icon: '🏥',
                fileFormat: 'csv',
                requiredFields: ['date', 'provider', 'amount', 'receiptNumber', 'treatmentType'],
                headers: ['תאריך', 'נותן שירות', 'סכום', 'מספר קבלה', 'סוג טיפול', 'זכאות לזיכוי'],
                template: 'medical-expenses-template'
            },
            'annual-summary': {
                id: 'annual-summary',
                name: 'סיכום שנתי',
                description: 'דוח כולל על שנת המס הישראלית',
                icon: '📊',
                fileFormat: 'pdf',
                requiredFields: ['all'],
                template: 'annual-summary-template'
            }
        };
    }

    initializeIsraeliTaxCategories() {
        return {
            'tax-deductible': {
                name: 'מוכר לזיכוי במס',
                subcategories: {
                    'charitable-donations': 'תרומות',
                    'medical-expenses': 'הוצאות רפואיות',
                    'education-expenses': 'הוצאות חינוך',
                    'professional-development': 'השתלמויות מקצועיות',
                    'work-related-travel': 'נסיעות עבודה'
                }
            },
            'business-expenses': {
                name: 'הוצאות עסקיות',
                subcategories: {
                    'office-supplies': 'ציוד משרדי',
                    'professional-services': 'שירותים מקצועיים',
                    'marketing': 'שיווק ופרסום',
                    'equipment': 'ציוד וכלי עבודה',
                    'travel-expenses': 'נסיעות עסקיות'
                }
            },
            'personal-expenses': {
                name: 'הוצאות אישיות',
                subcategories: {
                    'housing': 'דיור',
                    'food': 'מזון',
                    'transportation': 'תחבורה',
                    'entertainment': 'בילוי ופנוי'
                }
            }
        };
    }

    calculateTaxYearData() {
        const currentTaxYear = this.getCurrentTaxYear();
        const taxYearStart = new Date(currentTaxYear.start);
        const taxYearEnd = new Date(currentTaxYear.end);

        // Filter transactions for current tax year
        const taxYearTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= taxYearStart && transactionDate <= taxYearEnd;
        });

        // Calculate totals by category
        const categoryTotals = {};
        const taxDeductibleTotal = {
            donations: 0,
            medical: 0,
            education: 0,
            total: 0
        };

        taxYearTransactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const category = transaction.category || 'שונות';
                categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);

                // Check if tax deductible
                if (this.isTaxDeductible(transaction)) {
                    const deductibleType = this.getTaxDeductibleType(transaction);
                    if (deductibleType) {
                        taxDeductibleTotal[deductibleType] += Math.abs(transaction.amount);
                        taxDeductibleTotal.total += Math.abs(transaction.amount);
                    }
                }
            }
        });

        this.taxYearData = {
            taxYear: currentTaxYear,
            transactions: taxYearTransactions,
            totalIncome: taxYearTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: taxYearTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0),
            categoryTotals,
            taxDeductibleTotal,
            transactionCount: taxYearTransactions.length
        };
    }

    getCurrentTaxYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Israeli tax year: April 1 - March 31
        if (now.getMonth() >= 3) { // April onwards
            return {
                year: currentYear,
                start: `${currentYear}-04-01`,
                end: `${currentYear + 1}-03-31`,
                display: `${currentYear}/${currentYear + 1}`
            };
        } else { // January-March
            return {
                year: currentYear - 1,
                start: `${currentYear - 1}-04-01`,
                end: `${currentYear}-03-31`,
                display: `${currentYear - 1}/${currentYear}`
            };
        }
    }

    isTaxDeductible(transaction) {
        const deductibleCategories = [
            'תרומות', 'בריאות', 'חינוך', 'השתלמויות',
            'הוצאות רפואיות', 'תרומות צדקה'
        ];
        
        return deductibleCategories.some(category => 
            transaction.category?.includes(category) ||
            transaction.description?.includes(category)
        );
    }

    getTaxDeductibleType(transaction) {
        if (transaction.category?.includes('תרומות') || 
            transaction.description?.includes('תרומה')) {
            return 'donations';
        }
        if (transaction.category?.includes('בריאות') || 
            transaction.category?.includes('רפואי')) {
            return 'medical';
        }
        if (transaction.category?.includes('חינוך') || 
            transaction.category?.includes('השתלמות')) {
            return 'education';
        }
        return null;
    }

    render() {
        return `
            <div class="budget-tax-export" dir="rtl">
                <div class="export-header">
                    <h2>ייצוא נתונים למס</h2>
                    <p class="description">ייצא נתוני תקציב ועסקאות לצורך דיווח למס הכנסה הישראלי</p>
                </div>

                <div class="tax-year-summary">
                    ${this.renderTaxYearSummary()}
                </div>

                <div class="export-options">
                    ${this.renderExportOptions()}
                </div>

                <div class="tax-insights">
                    ${this.renderTaxInsights()}
                </div>
            </div>
        `;
    }

    renderTaxYearSummary() {
        if (!this.taxYearData) {
            return `
                <div class="tax-year-loading">
                    <p>טוען נתוני שנת המס...</p>
                </div>
            `;
        }

        const data = this.taxYearData;
        return `
            <div class="tax-year-summary-section">
                <div class="summary-header">
                    <h3>סיכום שנת המס ${data.taxYear.display}</h3>
                    <p class="tax-period">תקופה: ${this.formatDate(data.taxYear.start)} - ${this.formatDate(data.taxYear.end)}</p>
                </div>

                <div class="summary-cards">
                    <div class="summary-card income">
                        <div class="card-icon">💰</div>
                        <div class="card-content">
                            <h4>סך הכנסות</h4>
                            <p class="amount">₪${data.totalIncome.toLocaleString('he-IL')}</p>
                        </div>
                    </div>

                    <div class="summary-card expenses">
                        <div class="card-icon">📤</div>
                        <div class="card-content">
                            <h4>סך הוצאות</h4>
                            <p class="amount">₪${data.totalExpenses.toLocaleString('he-IL')}</p>
                        </div>
                    </div>

                    <div class="summary-card deductible">
                        <div class="card-icon">💸</div>
                        <div class="card-content">
                            <h4>זיכויים אפשריים</h4>
                            <p class="amount">₪${data.taxDeductibleTotal.total.toLocaleString('he-IL')}</p>
                        </div>
                    </div>

                    <div class="summary-card transactions">
                        <div class="card-icon">📊</div>
                        <div class="card-content">
                            <h4>מספר עסקאות</h4>
                            <p class="amount">${data.transactionCount.toLocaleString('he-IL')}</p>
                        </div>
                    </div>
                </div>

                <div class="deductible-breakdown">
                    <h4>פירוט זיכויים אפשריים</h4>
                    <div class="breakdown-items">
                        <div class="breakdown-item">
                            <span class="label">תרומות:</span>
                            <span class="value">₪${data.taxDeductibleTotal.donations.toLocaleString('he-IL')}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="label">הוצאות רפואיות:</span>
                            <span class="value">₪${data.taxDeductibleTotal.medical.toLocaleString('he-IL')}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="label">הוצאות חינוך:</span>
                            <span class="value">₪${data.taxDeductibleTotal.education.toLocaleString('he-IL')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderExportOptions() {
        return `
            <div class="export-options-section">
                <h3>אפשרויות ייצוא</h3>
                <div class="export-formats-grid">
                    ${Object.values(this.exportFormats).map(format => `
                        <div class="export-format-card" data-format="${format.id}">
                            <div class="format-header">
                                <div class="format-icon">${format.icon}</div>
                                <h4 class="format-name">${format.name}</h4>
                            </div>
                            
                            <div class="format-description">
                                <p>${format.description}</p>
                            </div>
                            
                            <div class="format-details">
                                <div class="detail-item">
                                    <span class="label">פורמט:</span>
                                    <span class="value">${format.fileFormat.toUpperCase()}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">שדות:</span>
                                    <span class="value">${format.requiredFields.length} שדות</span>
                                </div>
                            </div>
                            
                            <div class="format-actions">
                                <button class="btn btn-primary" 
                                        onclick="taxExport.generateExport('${format.id}')">
                                    ייצא ${format.fileFormat.toUpperCase()}
                                </button>
                                <button class="btn btn-secondary" 
                                        onclick="taxExport.previewExport('${format.id}')">
                                    תצוגה מקדימה
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTaxInsights() {
        const insights = this.generateTaxInsights();
        
        return `
            <div class="tax-insights-section">
                <h3>תובנות מס</h3>
                <div class="insights-list">
                    ${insights.map(insight => `
                        <div class="insight-card ${insight.type}">
                            <div class="insight-icon">${insight.icon}</div>
                            <div class="insight-content">
                                <h4 class="insight-title">${insight.title}</h4>
                                <p class="insight-description">${insight.description}</p>
                                ${insight.action ? `
                                    <button class="insight-action" onclick="${insight.action}">
                                        ${insight.actionText}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateTaxInsights() {
        const insights = [];
        
        if (!this.taxYearData) return insights;

        const data = this.taxYearData;

        // Check for potential tax savings
        if (data.taxDeductibleTotal.donations < 5000) {
            insights.push({
                type: 'opportunity',
                icon: '🤝',
                title: 'הזדמנות לחיסכון במס',
                description: `תרמת ${data.taxDeductibleTotal.donations.toLocaleString('he-IL')} ₪ השנה. תרומות נוספות יכולות להקטין את המס שלך.`,
                action: 'taxExport.suggestDonations()',
                actionText: 'קבל הצעות לתרומות'
            });
        }

        // Check missing receipts
        const transactionsWithoutReceipts = data.transactions.filter(t => 
            this.isTaxDeductible(t) && !t.receiptNumber
        ).length;
        
        if (transactionsWithoutReceipts > 0) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'חסרות קבלות',
                description: `${transactionsWithoutReceipts} עסקאות זכאיות לזיכוי ללא מספר קבלה. הוסף קבלות להבטחת הזיכוי.`,
                action: 'taxExport.findMissingReceipts()',
                actionText: 'מצא קבלות חסרות'
            });
        }

        // Tax deadline reminder
        const now = new Date();
        const taxDeadline = new Date(data.taxYear.year + 1, 3, 30); // April 30
        const daysUntilDeadline = Math.ceil((taxDeadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline > 0 && daysUntilDeadline <= 60) {
            insights.push({
                type: 'info',
                icon: '⏰',
                title: 'מועד הגשת דוח מתקרב',
                description: `נותרו ${daysUntilDeadline} ימים להגשת דוח שנתי לשנת המס ${data.taxYear.display}.`,
                action: 'taxExport.generateAnnualReport()',
                actionText: 'הכן דוח שנתי'
            });
        }

        return insights;
    }

    async generateExport(formatId) {
        const format = this.exportFormats[formatId];
        if (!format || !this.taxYearData) return;

        try {
            let exportData;
            let filename;

            switch (formatId) {
                case 'mas-hachnesot':
                    exportData = this.generateTaxReturnCSV();
                    filename = `דוח-מס-הכנסה-${this.taxYearData.taxYear.year}.csv`;
                    break;
                    
                case 'business-expenses':
                    exportData = this.generateBusinessExpensesCSV();
                    filename = `הוצאות-עסקיות-${this.taxYearData.taxYear.year}.csv`;
                    break;
                    
                case 'charitable-donations':
                    exportData = this.generateDonationsCSV();
                    filename = `תרומות-${this.taxYearData.taxYear.year}.csv`;
                    break;
                    
                case 'medical-expenses':
                    exportData = this.generateMedicalExpensesCSV();
                    filename = `הוצאות-רפואיות-${this.taxYearData.taxYear.year}.csv`;
                    break;
                    
                case 'annual-summary':
                    exportData = this.generateAnnualSummaryPDF();
                    filename = `סיכום-שנתי-${this.taxYearData.taxYear.year}.pdf`;
                    break;
                    
                default:
                    throw new Error('פורמט ייצוא לא נתמך');
            }

            // Download the file
            this.downloadFile(exportData, filename, format.fileFormat);
            
            window.HebrewToasts?.show(`הקובץ ${filename} יוצא בהצלחה`, 'success');

        } catch (error) {
            console.error('Export failed:', error);
            window.HebrewToasts?.show('שגיאה בייצוא הקובץ', 'error');
        }
    }

    generateTaxReturnCSV() {
        const headers = this.exportFormats['mas-hachnesot'].headers;
        const rows = [headers.join(',')];

        this.taxYearData.transactions.forEach(transaction => {
            if (this.isTaxDeductible(transaction)) {
                const row = [
                    `"${this.formatDateForExport(transaction.date)}"`,
                    `"${transaction.description || ''}"`,
                    transaction.amount,
                    `"${transaction.category || ''}"`,
                    `"${this.getTaxCategory(transaction)}"`,
                    `"${transaction.receiptNumber || 'חסר'}"`
                ];
                rows.push(row.join(','));
            }
        });

        return '\uFEFF' + rows.join('\n'); // Add BOM for Hebrew support
    }

    generateBusinessExpensesCSV() {
        const headers = this.exportFormats['business-expenses'].headers;
        const rows = [headers.join(',')];

        const businessTransactions = this.taxYearData.transactions.filter(t => 
            t.category?.includes('עסקי') || t.tags?.includes('עסקי')
        );

        businessTransactions.forEach(transaction => {
            const vatAmount = transaction.amount * 0.17; // 17% VAT
            const amountBeforeVat = transaction.amount - vatAmount;
            
            const row = [
                `"${this.formatDateForExport(transaction.date)}"`,
                `"${transaction.description || ''}"`,
                `"${transaction.supplier || ''}"`,
                amountBeforeVat.toFixed(2),
                vatAmount.toFixed(2),
                transaction.amount.toFixed(2),
                `"${transaction.receiptNumber || 'חסר'}"`
            ];
            rows.push(row.join(','));
        });

        return '\uFEFF' + rows.join('\n');
    }

    generateDonationsCSV() {
        const headers = this.exportFormats['charitable-donations'].headers;
        const rows = [headers.join(',')];

        const donations = this.taxYearData.transactions.filter(t => 
            t.category?.includes('תרומות') || t.description?.includes('תרומה')
        );

        donations.forEach(donation => {
            const row = [
                `"${this.formatDateForExport(donation.date)}"`,
                `"${donation.description || ''}"`,
                donation.amount,
                `"${donation.receiptNumber || 'חסר'}"`,
                `"${this.isRecognizedCharity(donation) ? 'מוכר' : 'לא מוכר'}"`
            ];
            rows.push(row.join(','));
        });

        return '\uFEFF' + rows.join('\n');
    }

    generateMedicalExpensesCSV() {
        const headers = this.exportFormats['medical-expenses'].headers;
        const rows = [headers.join(',')];

        const medicalExpenses = this.taxYearData.transactions.filter(t => 
            t.category?.includes('בריאות') || t.category?.includes('רפואי')
        );

        medicalExpenses.forEach(expense => {
            const row = [
                `"${this.formatDateForExport(expense.date)}"`,
                `"${expense.description || ''}"`,
                expense.amount,
                `"${expense.receiptNumber || 'חסר'}"`,
                `"${this.getMedicalTreatmentType(expense)}"`,
                `"${this.isMedicalDeductible(expense) ? 'זכאי' : 'לא זכאי'}"`
            ];
            rows.push(row.join(','));
        });

        return '\uFEFF' + rows.join('\n');
    }

    generateAnnualSummaryPDF() {
        // This would generate a PDF in a real implementation
        // For now, return structured data that could be converted to PDF
        const summary = {
            taxYear: this.taxYearData.taxYear.display,
            totalIncome: this.taxYearData.totalIncome,
            totalExpenses: this.taxYearData.totalExpenses,
            taxDeductible: this.taxYearData.taxDeductibleTotal,
            categoryBreakdown: this.taxYearData.categoryTotals,
            insights: this.generateTaxInsights(),
            generatedAt: new Date().toISOString()
        };
        
        return JSON.stringify(summary, null, 2);
    }

    downloadFile(content, filename, fileType) {
        const blob = new Blob([content], { 
            type: fileType === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Helper methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('he-IL');
    }

    formatDateForExport(dateString) {
        return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    }

    getTaxCategory(transaction) {
        if (transaction.category?.includes('תרומות')) return 'תרומות';
        if (transaction.category?.includes('בריאות')) return 'הוצאות רפואיות';
        if (transaction.category?.includes('חינוך')) return 'הוצאות חינוך';
        return 'אחר';
    }

    isRecognizedCharity(transaction) {
        // In a real implementation, this would check against a list of recognized charities
        return transaction.description?.includes('עמותה') || 
               transaction.description?.includes('צדקה') ||
               transaction.receiptNumber?.length > 0;
    }

    getMedicalTreatmentType(transaction) {
        if (transaction.description?.includes('רופא')) return 'ביקור רופא';
        if (transaction.description?.includes('תרופה')) return 'תרופות';
        if (transaction.description?.includes('בדיקה')) return 'בדיקות';
        return 'אחר';
    }

    isMedicalDeductible(transaction) {
        // Basic check - in reality would be more complex
        return transaction.amount > 50; // Minimum amount for deduction
    }

    updateDisplay() {
        const container = document.querySelector('.budget-tax-export');
        if (container) {
            container.innerHTML = this.render().match(/<div class="budget-tax-export"[^>]*>(.*)<\/div>$/s)[1];
        }
    }
}

// Initialize component
window.BudgetTaxExport = BudgetTaxExport;
window.taxExport = null;