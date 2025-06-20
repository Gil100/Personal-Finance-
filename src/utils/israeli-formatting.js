// Israeli-Specific Formatting Utilities
// Enhanced currency, number, and date formatting for Israeli users

class IsraeliFormatter {
    constructor() {
        this.locale = 'he-IL';
        this.currency = 'ILS';
        this.timeZone = 'Asia/Jerusalem';
    }

    // Enhanced shekel currency formatting with proper positioning
    formatCurrency(amount, options = {}) {
        const {
            showSymbol = true,
            precision = 2,
            compact = false,
            spacing = true
        } = options;

        if (amount === null || amount === undefined || isNaN(amount)) {
            return showSymbol ? '₪ 0.00' : '0.00';
        }

        const numAmount = Number(amount);

        if (compact && Math.abs(numAmount) >= 1000) {
            return this.formatCompactCurrency(numAmount, showSymbol);
        }

        // Format number with Israeli locale
        const formatted = new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(numAmount);

        if (!showSymbol) {
            return formatted;
        }

        // Hebrew RTL: Symbol comes after number with proper spacing
        const space = spacing ? ' ' : '';
        return `${formatted}${space}₪`;
    }

    // Compact currency for large amounts (1K, 1M, etc.)
    formatCompactCurrency(amount, showSymbol = true) {
        const absAmount = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';
        
        let value, suffix;
        
        if (absAmount >= 1000000) {
            value = absAmount / 1000000;
            suffix = 'מ\''; // מיליון
        } else if (absAmount >= 1000) {
            value = absAmount / 1000;
            suffix = 'אלף'; // אלף
        } else {
            return this.formatCurrency(amount, { showSymbol, compact: false });
        }

        const formatted = new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: value % 1 === 0 ? 0 : 1,
            maximumFractionDigits: 1
        }).format(value);

        const result = `${sign}${formatted} ${suffix}`;
        return showSymbol ? `${result} ₪` : result;
    }

    // Hebrew number formatting with thousands separators
    formatNumber(number, options = {}) {
        const { precision = null, compact = false } = options;

        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }

        const numValue = Number(number);

        if (compact && Math.abs(numValue) >= 1000) {
            return this.formatCompactNumber(numValue);
        }

        const formatOptions = {};
        if (precision !== null) {
            formatOptions.minimumFractionDigits = precision;
            formatOptions.maximumFractionDigits = precision;
        }

        return new Intl.NumberFormat(this.locale, formatOptions).format(numValue);
    }

    // Compact number formatting
    formatCompactNumber(number) {
        const absNumber = Math.abs(number);
        const sign = number < 0 ? '-' : '';
        
        let value, suffix;
        
        if (absNumber >= 1000000000) {
            value = absNumber / 1000000000;
            suffix = 'מליארד';
        } else if (absNumber >= 1000000) {
            value = absNumber / 1000000;
            suffix = 'מיליון';
        } else if (absNumber >= 1000) {
            value = absNumber / 1000;
            suffix = 'אלף';
        } else {
            return this.formatNumber(number);
        }

        const formatted = new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: value % 1 === 0 ? 0 : 1,
            maximumFractionDigits: 1
        }).format(value);

        return `${sign}${formatted} ${suffix}`;
    }

    // Israeli date formatting with Hebrew months
    formatDate(date, options = {}) {
        const {
            style = 'medium', // short, medium, long, full
            includeTime = false,
            includeWeekday = false
        } = options;

        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'תאריך לא תקין';
        }

        const formatOptions = {
            timeZone: this.timeZone
        };

        switch (style) {
            case 'short':
                formatOptions.year = '2-digit';
                formatOptions.month = 'numeric';
                formatOptions.day = 'numeric';
                break;
            case 'medium':
                formatOptions.year = 'numeric';
                formatOptions.month = 'short';
                formatOptions.day = 'numeric';
                break;
            case 'long':
                formatOptions.year = 'numeric';
                formatOptions.month = 'long';
                formatOptions.day = 'numeric';
                break;
            case 'full':
                formatOptions.year = 'numeric';
                formatOptions.month = 'long';
                formatOptions.day = 'numeric';
                formatOptions.weekday = 'long';
                includeWeekday = false; // already included
                break;
        }

        if (includeWeekday && style !== 'full') {
            formatOptions.weekday = 'long';
        }

        if (includeTime) {
            formatOptions.hour = '2-digit';
            formatOptions.minute = '2-digit';
        }

        return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
    }

    // Israeli tax year date formatting (April 1 - March 31)
    formatTaxYear(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed
        
        // Israeli tax year starts April 1st (month 3)
        const taxYear = month >= 3 ? year : year - 1;
        const nextYear = taxYear + 1;
        
        return `שנת מס ${taxYear}/${nextYear.toString().slice(-2)}`;
    }

    // Get current Israeli tax year period
    getTaxYearPeriod(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const taxYear = month >= 3 ? year : year - 1;
        const startDate = new Date(taxYear, 3, 1); // April 1st
        const endDate = new Date(taxYear + 1, 2, 31); // March 31st
        
        return {
            year: taxYear,
            start: startDate,
            end: endDate,
            label: this.formatTaxYear(date)
        };
    }

    // Format percentage with Hebrew
    formatPercentage(value, precision = 1) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }
        
        const formatted = new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(Number(value));
        
        return `${formatted}%`;
    }

    // Format Israeli phone numbers
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        
        // Israeli phone number patterns
        if (digits.length === 10 && (digits.startsWith('05') || digits.startsWith('03') || digits.startsWith('04') || digits.startsWith('08') || digits.startsWith('09'))) {
            // Mobile: 05X-XXX-XXXX or Landline: 0X-XXX-XXXX
            return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 9 && digits.startsWith('5')) {
            // Mobile without leading 0: 5X-XXX-XXXX
            return `05${digits.slice(1, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
        } else if (digits.length === 7) {
            // Short local number: XXX-XXXX
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        
        return phone; // Return as-is if doesn't match patterns
    }

    // Format Israeli ID number (with validation)
    formatIsraeliId(id) {
        if (!id) return '';
        
        const digits = id.replace(/\D/g, '');
        
        if (digits.length === 9) {
            // Standard 9-digit format: XXX-XX-XXXX
            return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
        } else if (digits.length === 8) {
            // 8-digit with leading zero: 0XX-XX-XXXX
            return `0${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
        }
        
        return id; // Return as-is if doesn't match patterns
    }

    // Format bank account numbers (Israeli format)
    formatBankAccount(account, bankCode = null) {
        if (!account) return '';
        
        const digits = account.replace(/\D/g, '');
        
        if (bankCode && digits.length >= 6) {
            // With bank code: BANK-BRANCH-ACCOUNT
            if (digits.length <= 10) {
                return `${bankCode}-${digits.slice(0, 3)}-${digits.slice(3)}`;
            }
        }
        
        if (digits.length >= 6) {
            // Without bank code: BRANCH-ACCOUNT
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        
        return account; // Return as-is if too short
    }

    // Convert amounts to Hebrew words (for checks, etc.)
    numberToHebrewWords(number) {
        // Simplified implementation for common amounts
        const ones = ['', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה'];
        const tens = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
        const teens = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר', 'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
        
        if (number === 0) return 'אפס';
        if (number < 0) return 'מינוס ' + this.numberToHebrewWords(Math.abs(number));
        
        // Handle thousands, hundreds, etc. (simplified for now)
        if (number < 10) {
            return ones[number];
        } else if (number < 20) {
            return teens[number - 10];
        } else if (number < 100) {
            const ten = Math.floor(number / 10);
            const one = number % 10;
            return tens[ten] + (one > 0 ? ' ו' + ones[one] : '');
        } else if (number < 1000) {
            const hundred = Math.floor(number / 100);
            const remainder = number % 100;
            let result = ones[hundred] + ' מאות';
            if (remainder > 0) {
                result += ' ' + this.numberToHebrewWords(remainder);
            }
            return result;
        }
        
        // For larger numbers, use simplified numeric representation
        return this.formatNumber(number);
    }
}

// Create global instance
window.IsraeliFormatter = IsraeliFormatter;
window.israeliFormatter = new IsraeliFormatter();

// Enhanced global formatting functions
window.formatCurrency = (amount, options) => window.israeliFormatter.formatCurrency(amount, options);
window.formatNumber = (number, options) => window.israeliFormatter.formatNumber(number, options);
window.formatDate = (date, options) => window.israeliFormatter.formatDate(date, options);
window.formatPercentage = (value, precision) => window.israeliFormatter.formatPercentage(value, precision);
window.formatPhoneNumber = (phone) => window.israeliFormatter.formatPhoneNumber(phone);
window.formatIsraeliId = (id) => window.israeliFormatter.formatIsraeliId(id);
window.formatBankAccount = (account, bankCode) => window.israeliFormatter.formatBankAccount(account, bankCode);
window.getTaxYearPeriod = (date) => window.israeliFormatter.getTaxYearPeriod(date);
window.formatTaxYear = (date) => window.israeliFormatter.formatTaxYear(date);

console.log('🇮🇱 Israeli formatting utilities loaded successfully');