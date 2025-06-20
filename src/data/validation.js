/**
 * Data Validation System for Israeli Personal Finance Dashboard
 * Hebrew error messages and Israeli-specific validation rules
 */

// Hebrew validation error messages
export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: 'שדה זה הוא חובה',
  REQUIRED_FIELD: (field) => `${field} הוא שדה חובה`,
  
  // Text validation
  MIN_LENGTH: (min) => `נדרש לפחות ${min} תווים`,
  MAX_LENGTH: (max) => `מקסימום ${max} תווים`,
  INVALID_TEXT: 'טקסט לא תקין',
  
  // Number validation
  INVALID_NUMBER: 'מספר לא תקין',
  MIN_VALUE: (min) => `הערך המינימלי הוא ${min}`,
  MAX_VALUE: (max) => `הערך המקסימלי הוא ${max}`,
  POSITIVE_NUMBER: 'המספר חייב להיות חיובי',
  NEGATIVE_NUMBER: 'המספר חייב להיות שלילי',
  NON_ZERO: 'הערך לא יכול להיות אפס',
  
  // Date validation
  INVALID_DATE: 'תאריך לא תקין',
  FUTURE_DATE: 'התאריך לא יכול להיות בעתיד',
  PAST_DATE: 'התאריך לא יכול להיות בעבר',
  DATE_RANGE: 'תאריך ההתחלה חייב להיות לפני תאריך הסיום',
  
  // Email validation
  INVALID_EMAIL: 'כתובת דוא"ל לא תקינה',
  
  // Phone validation
  INVALID_PHONE: 'מספר טלפון לא תקין',
  ISRAELI_PHONE_FORMAT: 'פורמט: 05X-XXXXXXX או 0X-XXXXXXX',
  
  // Israeli ID validation
  INVALID_ID: 'תעודת זהות לא תקינה',
  ISRAELI_ID_FORMAT: 'תעודת זהות חייבת להכיל 9 ספרות',
  
  // Bank account validation
  INVALID_BANK_ACCOUNT: 'מספר חשבון בנק לא תקין',
  BANK_ACCOUNT_LENGTH: 'מספר חשבון בנק חייב להכיל 6-12 ספרות',
  
  // Currency validation
  INVALID_AMOUNT: 'סכום לא תקין',
  CURRENCY_FORMAT: 'פורמט: 1234.56 (ללא סימן מטבע)',
  
  // Category validation
  INVALID_CATEGORY: 'קטגוריה לא תקינה',
  CATEGORY_TYPE: 'סוג קטגוריה חייב להיות הכנסה או הוצאה',
  
  // Budget validation
  BUDGET_PERIOD: 'תקופת התקציב לא תקינה',
  BUDGET_AMOUNT: 'סכום התקציב חייב להיות חיובי',
  
  // Account validation
  ACCOUNT_TYPE: 'סוג חשבון לא תקין',
  DUPLICATE_ACCOUNT: 'חשבון עם פרטים דומים כבר קיים'
};

// Validation rules
export class Validators {
  
  // Basic text validation
  static text(value, options = {}) {
    const errors = [];
    
    if (options.required && (!value || value.trim() === '')) {
      errors.push(options.fieldName ? 
        VALIDATION_MESSAGES.REQUIRED_FIELD(options.fieldName) : 
        VALIDATION_MESSAGES.REQUIRED
      );
      return errors;
    }
    
    if (value && typeof value === 'string') {
      if (options.minLength && value.length < options.minLength) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(options.minLength));
      }
      
      if (options.maxLength && value.length > options.maxLength) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(options.maxLength));
      }
    }
    
    return errors;
  }
  
  // Number validation
  static number(value, options = {}) {
    const errors = [];
    
    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push(options.fieldName ? 
        VALIDATION_MESSAGES.REQUIRED_FIELD(options.fieldName) : 
        VALIDATION_MESSAGES.REQUIRED
      );
      return errors;
    }
    
    if (value !== null && value !== undefined && value !== '') {
      const num = parseFloat(value);
      
      if (isNaN(num)) {
        errors.push(VALIDATION_MESSAGES.INVALID_NUMBER);
        return errors;
      }
      
      if (options.min !== undefined && num < options.min) {
        errors.push(VALIDATION_MESSAGES.MIN_VALUE(options.min));
      }
      
      if (options.max !== undefined && num > options.max) {
        errors.push(VALIDATION_MESSAGES.MAX_VALUE(options.max));
      }
      
      if (options.positive && num <= 0) {
        errors.push(VALIDATION_MESSAGES.POSITIVE_NUMBER);
      }
      
      if (options.negative && num >= 0) {
        errors.push(VALIDATION_MESSAGES.NEGATIVE_NUMBER);
      }
      
      if (options.nonZero && num === 0) {
        errors.push(VALIDATION_MESSAGES.NON_ZERO);
      }
    }
    
    return errors;
  }
  
  // Date validation
  static date(value, options = {}) {
    const errors = [];
    
    if (options.required && !value) {
      errors.push(options.fieldName ? 
        VALIDATION_MESSAGES.REQUIRED_FIELD(options.fieldName) : 
        VALIDATION_MESSAGES.REQUIRED
      );
      return errors;
    }
    
    if (value) {
      const date = new Date(value);
      
      if (isNaN(date.getTime())) {
        errors.push(VALIDATION_MESSAGES.INVALID_DATE);
        return errors;
      }
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (options.notFuture && date > now) {
        errors.push(VALIDATION_MESSAGES.FUTURE_DATE);
      }
      
      if (options.notPast && date < now) {
        errors.push(VALIDATION_MESSAGES.PAST_DATE);
      }
    }
    
    return errors;
  }
  
  // Date range validation
  static dateRange(startDate, endDate, options = {}) {
    const errors = [];
    
    const startErrors = this.date(startDate, { required: true, fieldName: 'תאריך התחלה' });
    const endErrors = this.date(endDate, { required: true, fieldName: 'תאריך סיום' });
    
    errors.push(...startErrors, ...endErrors);
    
    if (startDate && endDate && startErrors.length === 0 && endErrors.length === 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        errors.push(VALIDATION_MESSAGES.DATE_RANGE);
      }
    }
    
    return errors;
  }
  
  // Email validation
  static email(value, options = {}) {
    const errors = [];
    
    if (options.required && !value) {
      errors.push(VALIDATION_MESSAGES.REQUIRED);
      return errors;
    }
    
    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(VALIDATION_MESSAGES.INVALID_EMAIL);
      }
    }
    
    return errors;
  }
  
  // Israeli phone number validation
  static israeliPhone(value, options = {}) {
    const errors = [];
    
    if (options.required && !value) {
      errors.push(VALIDATION_MESSAGES.REQUIRED);
      return errors;
    }
    
    if (value) {
      // Remove all non-digits
      const cleanPhone = value.replace(/\D/g, '');
      
      // Israeli phone patterns
      const mobileRegex = /^05[0-9]{8}$/; // Mobile: 05X-XXXXXXXX
      const landlineRegex = /^0[2-4,6-9][0-9]{7}$/; // Landline: 0X-XXXXXXX
      
      if (!mobileRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
        errors.push(VALIDATION_MESSAGES.INVALID_PHONE);
        errors.push(VALIDATION_MESSAGES.ISRAELI_PHONE_FORMAT);
      }
    }
    
    return errors;
  }
  
  // Israeli ID number validation (with checksum)
  static israeliId(value, options = {}) {
    const errors = [];
    
    if (options.required && !value) {
      errors.push(VALIDATION_MESSAGES.REQUIRED);
      return errors;
    }
    
    if (value) {
      const cleanId = value.replace(/\D/g, '');
      
      if (cleanId.length !== 9) {
        errors.push(VALIDATION_MESSAGES.ISRAELI_ID_FORMAT);
        return errors;
      }
      
      // Israeli ID checksum validation
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let digit = parseInt(cleanId[i]);
        if (i % 2 === 1) {
          digit *= 2;
          if (digit > 9) {
            digit = Math.floor(digit / 10) + (digit % 10);
          }
        }
        sum += digit;
      }
      
      if (sum % 10 !== 0) {
        errors.push(VALIDATION_MESSAGES.INVALID_ID);
      }
    }
    
    return errors;
  }
  
  // Bank account number validation
  static bankAccount(value, options = {}) {
    const errors = [];
    
    if (options.required && !value) {
      errors.push(VALIDATION_MESSAGES.REQUIRED);
      return errors;
    }
    
    if (value) {
      const cleanAccount = value.replace(/\D/g, '');
      
      if (cleanAccount.length < 6 || cleanAccount.length > 12) {
        errors.push(VALIDATION_MESSAGES.BANK_ACCOUNT_LENGTH);
      }
    }
    
    return errors;
  }
  
  // Currency amount validation (Israeli shekel)
  static currency(value, options = {}) {
    const errors = [];
    
    const numberErrors = this.number(value, options);
    errors.push(...numberErrors);
    
    if (value && numberErrors.length === 0) {
      const amount = parseFloat(value);
      // Check for reasonable currency precision (max 2 decimal places)
      if ((amount * 100) % 1 !== 0) {
        errors.push('מקסימום 2 מקומות עשרוניים');
      }
    }
    
    return errors;
  }
}

// Transaction validation
export class TransactionValidator {
  static validate(transaction) {
    const errors = {};
    
    // Description validation
    const descErrors = Validators.text(transaction.תיאור, {
      required: true,
      fieldName: 'תיאור',
      minLength: 2,
      maxLength: 200
    });
    if (descErrors.length > 0) errors.תיאור = descErrors;
    
    // Amount validation
    const amountErrors = Validators.currency(transaction.סכום, {
      required: true,
      nonZero: true,
      fieldName: 'סכום'
    });
    if (amountErrors.length > 0) errors.סכום = amountErrors;
    
    // Date validation
    const dateErrors = Validators.date(transaction.תאריך, {
      required: true,
      fieldName: 'תאריך'
    });
    if (dateErrors.length > 0) errors.תאריך = dateErrors;
    
    // Category validation
    if (!transaction.קטגוריה) {
      errors.קטגוריה = ['יש לבחור קטגוריה'];
    }
    
    // Account validation
    if (!transaction.חשבון) {
      errors.חשבון = ['יש לבחור חשבון'];
    }
    
    // Type validation
    if (!['הכנסה', 'הוצאה', 'העברה'].includes(transaction.סוג)) {
      errors.סוג = ['סוג עסקה לא תקין'];
    }
    
    return errors;
  }
}

// Category validation
export class CategoryValidator {
  static validate(category) {
    const errors = {};
    
    // Name validation
    const nameErrors = Validators.text(category.שם, {
      required: true,
      fieldName: 'שם קטגוריה',
      minLength: 2,
      maxLength: 50
    });
    if (nameErrors.length > 0) errors.שם = nameErrors;
    
    // Type validation
    if (!['הכנסה', 'הוצאה'].includes(category.סוג)) {
      errors.סוג = [VALIDATION_MESSAGES.CATEGORY_TYPE];
    }
    
    // Budget validation (optional)
    if (category.תקציב_חודשי !== undefined && category.תקציב_חודשי !== null) {
      const budgetErrors = Validators.currency(category.תקציב_חודשי, {
        positive: true,
        fieldName: 'תקציב חודשי'
      });
      if (budgetErrors.length > 0) errors.תקציב_חודשי = budgetErrors;
    }
    
    return errors;
  }
}

// Budget validation
export class BudgetValidator {
  static validate(budget) {
    const errors = {};
    
    // Name validation
    const nameErrors = Validators.text(budget.שם, {
      required: true,
      fieldName: 'שם תקציב',
      minLength: 2,
      maxLength: 100
    });
    if (nameErrors.length > 0) errors.שם = nameErrors;
    
    // Amount validation
    const amountErrors = Validators.currency(budget.סכום_כולל, {
      required: true,
      positive: true,
      fieldName: 'סכום תקציב'
    });
    if (amountErrors.length > 0) errors.סכום_כולל = amountErrors;
    
    // Date range validation
    const periodErrors = Validators.dateRange(
      budget.תקופה?.start,
      budget.תקופה?.end
    );
    if (periodErrors.length > 0) errors.תקופה = periodErrors;
    
    return errors;
  }
}

// Account validation
export class AccountValidator {
  static validate(account) {
    const errors = {};
    
    // Name validation
    const nameErrors = Validators.text(account.שם, {
      required: true,
      fieldName: 'שם חשבון',
      minLength: 2,
      maxLength: 100
    });
    if (nameErrors.length > 0) errors.שם = nameErrors;
    
    // Type validation
    if (!['בנק', 'מזומן', 'אשראי', 'חיסכון'].includes(account.סוג)) {
      errors.סוג = [VALIDATION_MESSAGES.ACCOUNT_TYPE];
    }
    
    // Bank validation (required for bank accounts)
    if (account.סוג === 'בנק' && !account.בנק) {
      errors.בנק = ['יש לבחור בנק'];
    }
    
    // Account number validation (for bank accounts)
    if (account.מספר_חשבון) {
      const accountErrors = Validators.bankAccount(account.מספר_חשבון, {
        required: account.סוג === 'בנק'
      });
      if (accountErrors.length > 0) errors.מספר_חשבון = accountErrors;
    }
    
    // Balance validation
    const balanceErrors = Validators.currency(account.יתרה, {
      fieldName: 'יתרה'
    });
    if (balanceErrors.length > 0) errors.יתרה = balanceErrors;
    
    return errors;
  }
}

// Master validator
export class DataValidator {
  static validateTransaction(transaction) {
    return TransactionValidator.validate(transaction);
  }
  
  static validateCategory(category) {
    return CategoryValidator.validate(category);
  }
  
  static validateBudget(budget) {
    return BudgetValidator.validate(budget);
  }
  
  static validateAccount(account) {
    return AccountValidator.validate(account);
  }
  
  // Check if validation result has errors
  static hasErrors(validationResult) {
    return Object.keys(validationResult).length > 0;
  }
  
  // Get all error messages as flat array
  static getErrorMessages(validationResult) {
    const messages = [];
    Object.values(validationResult).forEach(fieldErrors => {
      if (Array.isArray(fieldErrors)) {
        messages.push(...fieldErrors);
      }
    });
    return messages;
  }
  
  // Format errors for display
  static formatErrors(validationResult) {
    const formatted = {};
    Object.entries(validationResult).forEach(([field, fieldErrors]) => {
      formatted[field] = Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors;
    });
    return formatted;
  }
}

export default {
  Validators,
  DataValidator,
  TransactionValidator,
  CategoryValidator,
  BudgetValidator,
  AccountValidator,
  VALIDATION_MESSAGES
};