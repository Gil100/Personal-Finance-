/**
 * Data Models for Israeli Personal Finance Dashboard
 * Hebrew-native models with validation and Israeli-specific features
 */

import { DATA_SCHEMA, DEFAULT_CATEGORIES, ISRAELI_BANKS } from './schema.js';

// Utility functions for Israeli-specific formatting
export const formatters = {
  // Israeli shekel formatting
  currency: (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Israeli date formatting (DD/MM/YYYY)
  date: (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  },

  // Hebrew number formatting
  number: (num) => {
    return new Intl.NumberFormat('he-IL').format(num);
  }
};

// Transaction Model
export class Transaction {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.תאריך = data.תאריך || new Date().toISOString().split('T')[0];
    this.סכום = parseFloat(data.סכום) || 0;
    this.תיאור = data.תיאור || '';
    this.קטגוריה = data.קטגוריה || '';
    this.חשבון = data.חשבון || '';
    this.סוג = data.סוג || 'הוצאה'; // 'הכנסה' | 'הוצאה' | 'העברה'
    this.תת_קטגוריה = data.תת_קטגוריה || '';
    this.הערות = data.הערות || '';
    this.תגיות = data.תגיות || [];
    this.מיקום = data.מיקום || '';
    this.קבלה = data.קבלה || '';
    this.חוזר = data.חוזר || null;
    this.נוצר = data.נוצר || new Date().toISOString();
    this.עודכן = data.עודכן || new Date().toISOString();
    this.מקור = data.מקור || 'manual';
  }

  generateId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Validation
  validate() {
    const errors = [];
    
    if (!this.תיאור.trim()) {
      errors.push('תיאור העסקה נדרש');
    }
    
    if (this.סכום === 0) {
      errors.push('סכום העסקה חייב להיות שונה מאפס');
    }
    
    if (!this.קטגוריה) {
      errors.push('יש לבחור קטגוריה');
    }
    
    if (!this.חשבון) {
      errors.push('יש לבחור חשבון');
    }
    
    if (!['הכנסה', 'הוצאה', 'העברה'].includes(this.סוג)) {
      errors.push('סוג עסקה לא תקין');
    }

    return errors;
  }

  // Convert to display format
  toDisplay() {
    return {
      ...this,
      סכום_מעוצב: formatters.currency(Math.abs(this.סכום)),
      תאריך_מעוצב: formatters.date(this.תאריך),
      סכום_צבע: this.סכום >= 0 ? 'text-green-600' : 'text-red-600',
      סכום_עם_סימן: (this.סכום >= 0 ? '+' : '') + formatters.currency(this.סכום)
    };
  }

  // Update timestamp
  touch() {
    this.עודכן = new Date().toISOString();
  }
}

// Category Model
export class Category {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.שם = data.שם || '';
    this.צבע = data.צבע || '#6B7280';
    this.אייקון = data.אייקון || '📋';
    this.סוג = data.סוג || 'הוצאה'; // 'הכנסה' | 'הוצאה'
    this.הורה = data.הורה || null; // for subcategories
    this.תקציב_חודשי = parseFloat(data.תקציב_חודשי) || 0;
    this.אקטיבי = data.אקטיבי !== undefined ? data.אקטיבי : true;
    this.נוצר = data.נוצר || new Date().toISOString();
  }

  generateId() {
    return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  validate() {
    const errors = [];
    
    if (!this.שם.trim()) {
      errors.push('שם הקטגוריה נדרש');
    }
    
    if (!['הכנסה', 'הוצאה'].includes(this.סוג)) {
      errors.push('סוג קטגוריה לא תקין');
    }
    
    if (this.תקציב_חודשי < 0) {
      errors.push('תקציב חודשי לא יכול להיות שלילי');
    }

    return errors;
  }

  toDisplay() {
    return {
      ...this,
      תקציב_מעוצב: this.תקציב_חודשי > 0 ? formatters.currency(this.תקציב_חודשי) : 'ללא תקציב'
    };
  }
}

// Budget Model
export class Budget {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.שם = data.שם || '';
    this.תקופה = data.תקופה || {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.קטגוריות = data.קטגוריות || [];
    this.סכום_כולל = parseFloat(data.סכום_כולל) || 0;
    this.הוצאו = parseFloat(data.הוצאו) || 0;
    this.יעד = data.יעד || '';
    this.התראות = data.התראות || {
      threshold_50: true,  // 50% alert
      threshold_80: true,  // 80% alert
      threshold_100: true  // over budget alert
    };
    this.אקטיבי = data.אקטיבי !== undefined ? data.אקטיבי : true;
    this.נוצר = data.נוצר || new Date().toISOString();
  }

  generateId() {
    return 'bdg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  validate() {
    const errors = [];
    
    if (!this.שם.trim()) {
      errors.push('שם התקציב נדרש');
    }
    
    if (this.סכום_כולל <= 0) {
      errors.push('סכום התקציב חייב להיות חיובי');
    }
    
    if (new Date(this.תקופה.start) >= new Date(this.תקופה.end)) {
      errors.push('תאריך התחלה חייב להיות לפני תאריך הסיום');
    }

    return errors;
  }

  // Calculate budget progress
  getProgress() {
    const percentage = this.סכום_כולל > 0 ? (this.הוצאו / this.סכום_כולל) * 100 : 0;
    const remaining = this.סכום_כולל - this.הוצאו;
    
    return {
      percentage: Math.round(percentage),
      remaining: remaining,
      status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'ok',
      color: percentage > 100 ? 'red' : percentage > 80 ? 'yellow' : 'green'
    };
  }

  toDisplay() {
    const progress = this.getProgress();
    return {
      ...this,
      סכום_כולל_מעוצב: formatters.currency(this.סכום_כולל),
      הוצאו_מעוצב: formatters.currency(this.הוצאו),
      נותר_מעוצב: formatters.currency(progress.remaining),
      אחוז_ניצול: progress.percentage,
      סטטוס: progress.status,
      תקופה_מעוצבת: `${formatters.date(this.תקופה.start)} - ${formatters.date(this.תקופה.end)}`
    };
  }
}

// Account Model  
export class Account {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.שם = data.שם || '';
    this.סוג = data.סוג || 'בנק'; // 'בנק' | 'מזומן' | 'אשראי' | 'חיסכון'
    this.בנק = data.בנק || '';
    this.מספר_חשבון = data.מספר_חשבון || '';
    this.יתרה = parseFloat(data.יתרה) || 0;
    this.מטבע = data.מטבע || 'ILS';
    this.צבע = data.צבע || '#3B82F6';
    this.אקטיבי = data.אקטיבי !== undefined ? data.אקטיבי : true;
    this.נוצר = data.נוצר || new Date().toISOString();
  }

  generateId() {
    return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  validate() {
    const errors = [];
    
    if (!this.שם.trim()) {
      errors.push('שם החשבון נדרש');
    }
    
    if (!['בנק', 'מזומן', 'אשראי', 'חיסכון'].includes(this.סוג)) {
      errors.push('סוג חשבון לא תקין');
    }
    
    if (this.סוג === 'בנק' && !this.בנק) {
      errors.push('יש לבחור בנק');
    }
    
    if (this.מספר_חשבון && this.מספר_חשבון.length < 4) {
      errors.push('מספר חשבון קצר מדי');
    }

    return errors;
  }

  // Mask account number for display
  getMaskedAccountNumber() {
    if (!this.מספר_חשבון) return '';
    const num = this.מספר_חשבון.toString();
    return num.length > 4 ? '*'.repeat(num.length - 4) + num.slice(-4) : num;
  }

  toDisplay() {
    return {
      ...this,
      יתרה_מעוצבת: formatters.currency(this.יתרה),
      מספר_חשבון_מוסתר: this.getMaskedAccountNumber(),
      יתרה_צבע: this.יתרה >= 0 ? 'text-green-600' : 'text-red-600'
    };
  }
}

// Settings Model
export class Settings {
  constructor(data = {}) {
    this.שפה = data.שפה || 'he';
    this.ערכת_נושא = data.ערכת_נושא || 'light';
    this.מטבע_ראשי = data.מטבע_ראשי || 'ILS';
    this.פורמט_תאריך = data.פורמט_תאריך || 'DD/MM/YYYY';
    this.התראות = data.התראות || {
      budget_alerts: true,
      low_balance: true,
      recurring_transactions: true
    };
    this.גיבוי_אוטומטי = data.גיבוי_אוטומטי !== undefined ? data.גיבוי_אוטומטי : false;
    this.הצפנה = data.הצפנה !== undefined ? data.הצפנה : true;
    this.נוצר = data.נוצר || new Date().toISOString();
    this.עודכן = data.עודכן || new Date().toISOString();
  }

  validate() {
    const errors = [];
    
    if (!['he', 'en'].includes(this.שפה)) {
      errors.push('שפה לא נתמכת');
    }
    
    if (!['light', 'dark', 'auto'].includes(this.ערכת_נושא)) {
      errors.push('ערכת נושא לא תקינה');
    }

    return errors;
  }

  touch() {
    this.עודכן = new Date().toISOString();
  }
}

// Model factory for creating instances from localStorage data
export class ModelFactory {
  static createTransaction(data) {
    return new Transaction(data);
  }

  static createCategory(data) {
    return new Category(data);
  }

  static createBudget(data) {
    return new Budget(data);
  }

  static createAccount(data) {
    return new Account(data);
  }

  static createSettings(data) {
    return new Settings(data);
  }

  // Create default categories for new users
  static createDefaultCategories() {
    const categories = [];
    
    // Add income categories
    DEFAULT_CATEGORIES.INCOME.forEach(cat => {
      categories.push(new Category(cat));
    });
    
    // Add expense categories
    DEFAULT_CATEGORIES.EXPENSES.forEach(cat => {
      categories.push(new Category(cat));
    });
    
    return categories;
  }

  // Create default cash account
  static createDefaultAccount() {
    return new Account({
      שם: 'מזומן',
      סוג: 'מזומן',
      בנק: 'מזומן',
      יתרה: 0,
      צבע: '#10B981'
    });
  }
}

export default {
  Transaction,
  Category, 
  Budget,
  Account,
  Settings,
  ModelFactory,
  formatters
};