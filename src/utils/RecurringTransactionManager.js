/**
 * Recurring Transaction Manager
 * Handles scheduling and generating recurring transactions
 */

export class RecurringTransactionManager {
    static FREQUENCIES = {
        weekly: { days: 7, hebrew: 'שבועי' },
        biweekly: { days: 14, hebrew: 'דו-שבועי' },
        monthly: { months: 1, hebrew: 'חודשי' },
        quarterly: { months: 3, hebrew: 'רבעוני' },
        yearly: { years: 1, hebrew: 'שנתי' }
    };

    /**
     * Generate all recurring transactions that should be created
     * @param {Array} recurringTransactions - Array of recurring transaction templates
     * @returns {Array} New transactions to be created
     */
    static generatePendingTransactions(recurringTransactions) {
        const pendingTransactions = [];
        const today = new Date();

        for (const template of recurringTransactions) {
            if (!template.isRecurring) continue;

            const newTransactions = this.generateTransactionsForTemplate(template, today);
            pendingTransactions.push(...newTransactions);
        }

        return pendingTransactions;
    }

    /**
     * Generate transactions for a specific recurring template
     * @param {Object} template - Recurring transaction template
     * @param {Date} currentDate - Current date
     * @returns {Array} New transactions to create
     */
    static generateTransactionsForTemplate(template, currentDate) {
        const transactions = [];
        let nextDate = this.getNextOccurrence(template.date, template.recurringFrequency);

        // Check if it's time to generate the next occurrence
        while (nextDate <= currentDate) {
            // Check if we should still generate based on end conditions
            if (this.shouldGenerateTransaction(template, nextDate)) {
                const newTransaction = this.createTransactionFromTemplate(template, nextDate);
                transactions.push(newTransaction);
            }

            // Move to next occurrence
            nextDate = this.getNextOccurrence(
                nextDate.toISOString().split('T')[0], 
                template.recurringFrequency
            );
        }

        return transactions;
    }

    /**
     * Check if a recurring transaction should still generate new instances
     * @param {Object} template - Recurring transaction template
     * @param {Date} targetDate - Date to check
     * @returns {boolean} Whether to generate the transaction
     */
    static shouldGenerateTransaction(template, targetDate) {
        // Check end date
        if (template.recurringEndDate) {
            const endDate = new Date(template.recurringEndDate);
            if (targetDate > endDate) {
                return false;
            }
        }

        // Check count limit
        if (template.recurringCount) {
            const generatedCount = this.getGeneratedCount(template.id);
            if (generatedCount >= template.recurringCount) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create a new transaction instance from a recurring template
     * @param {Object} template - Recurring transaction template
     * @param {Date} date - Date for the new transaction
     * @returns {Object} New transaction object
     */
    static createTransactionFromTemplate(template, date) {
        return {
            id: this.generateTransactionId(),
            type: template.type,
            amount: template.amount,
            description: `${template.description} (חוזר)`,
            category: template.category,
            account: template.account,
            date: date.toISOString().split('T')[0],
            tags: [...(template.tags || []), 'חוזר'],
            notes: template.notes ? `${template.notes}\n\nנוצר אוטומטית מעסקה חוזרת` : 'נוצר אוטומטית מעסקה חוזרת',
            isRecurring: false, // Generated instances are not recurring themselves
            recurringParentId: template.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'recurring'
        };
    }

    /**
     * Calculate the next occurrence date
     * @param {string} dateStr - Starting date (YYYY-MM-DD)
     * @param {string} frequency - Frequency type
     * @returns {Date} Next occurrence date
     */
    static getNextOccurrence(dateStr, frequency) {
        const date = new Date(dateStr);
        const config = this.FREQUENCIES[frequency];

        if (!config) {
            throw new Error(`Invalid frequency: ${frequency}`);
        }

        if (config.days) {
            date.setDate(date.getDate() + config.days);
        } else if (config.months) {
            date.setMonth(date.getMonth() + config.months);
        } else if (config.years) {
            date.setFullYear(date.getFullYear() + config.years);
        }

        return date;
    }

    /**
     * Get all future occurrences for a recurring transaction
     * @param {Object} template - Recurring transaction template
     * @param {number} limit - Maximum number of occurrences to return
     * @returns {Array} Array of future dates
     */
    static getFutureOccurrences(template, limit = 12) {
        const occurrences = [];
        let currentDate = new Date(template.date);
        let count = 0;

        while (count < limit) {
            currentDate = this.getNextOccurrence(
                currentDate.toISOString().split('T')[0],
                template.recurringFrequency
            );

            // Check if we should stop based on end conditions
            if (!this.shouldGenerateTransaction(template, currentDate)) {
                break;
            }

            occurrences.push(new Date(currentDate));
            count++;
        }

        return occurrences;
    }

    /**
     * Get Hebrew description of recurring schedule
     * @param {Object} template - Recurring transaction template
     * @returns {string} Hebrew description
     */
    static getRecurringDescription(template) {
        const frequency = this.FREQUENCIES[template.recurringFrequency];
        if (!frequency) return '';

        let description = `כל ${frequency.hebrew}`;

        if (template.recurringEndDate) {
            const endDate = new Date(template.recurringEndDate);
            description += ` עד ${endDate.toLocaleDateString('he-IL')}`;
        } else if (template.recurringCount) {
            description += ` למשך ${template.recurringCount} פעמים`;
        } else {
            description += ' ללא הגבלת זמן';
        }

        return description;
    }

    /**
     * Validate recurring transaction configuration
     * @param {Object} template - Recurring transaction template
     * @returns {Object} Validation result
     */
    static validateRecurringConfig(template) {
        const errors = [];

        if (!template.recurringFrequency || !this.FREQUENCIES[template.recurringFrequency]) {
            errors.push('תדירות לא תקינה');
        }

        if (template.recurringEndDate && template.recurringCount) {
            errors.push('לא ניתן להגדיר גם תאריך סיום וגם מספר פעמים');
        }

        if (template.recurringEndDate) {
            const endDate = new Date(template.recurringEndDate);
            const startDate = new Date(template.date);
            if (endDate <= startDate) {
                errors.push('תאריך הסיום חייב להיות אחרי תאריך ההתחלה');
            }
        }

        if (template.recurringCount && template.recurringCount < 1) {
            errors.push('מספר החזרות חייב להיות לפחות 1');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate unique transaction ID
     * @returns {string} Unique ID
     */
    static generateTransactionId() {
        return 'tx_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get count of already generated transactions for a recurring template
     * @param {string} templateId - Template ID
     * @returns {number} Count of generated transactions
     */
    static async getGeneratedCount(templateId) {
        try {
            const { DataManager } = await import('../data/index.js');
            const transactions = await DataManager.getTransactions();
            return transactions.filter(t => t.recurringParentId === templateId).length;
        } catch (error) {
            console.error('Failed to get generated count:', error);
            return 0;
        }
    }

    /**
     * Process all recurring transactions and generate pending ones
     * This should be called periodically (e.g., on app startup)
     */
    static async processRecurringTransactions() {
        try {
            const { DataManager } = await import('../data/index.js');
            const allTransactions = await DataManager.getTransactions();
            
            // Get all recurring transaction templates
            const recurringTemplates = allTransactions.filter(t => t.isRecurring);
            
            // Generate pending transactions
            const pendingTransactions = this.generatePendingTransactions(recurringTemplates);
            
            // Save new transactions
            for (const transaction of pendingTransactions) {
                await DataManager.addTransaction(transaction);
            }

            return {
                processed: recurringTemplates.length,
                generated: pendingTransactions.length,
                success: true
            };
        } catch (error) {
            console.error('Failed to process recurring transactions:', error);
            return {
                processed: 0,
                generated: 0,
                success: false,
                error: error.message
            };
        }
    }
}

// Export static methods for easier importing
export const {
    generatePendingTransactions,
    getFutureOccurrences,
    getRecurringDescription,
    validateRecurringConfig,
    processRecurringTransactions
} = RecurringTransactionManager;