/**
 * Data Schema for Israeli Personal Finance Dashboard
 * Hebrew-native field names with English aliases for development
 */

export const DATA_SCHEMA = {
  // Schema version for migration management
  VERSION: '1.0.0',
  
  // LocalStorage keys
  STORAGE_KEYS: {
    TRANSACTIONS: 'pf_transactions',
    CATEGORIES: 'pf_categories', 
    BUDGETS: 'pf_budgets',
    ACCOUNTS: 'pf_accounts',
    SETTINGS: 'pf_settings',
    TEMPLATES: 'pf_templates',
    SCHEMA_VERSION: 'pf_schema_version'
  },

  // Transaction data structure
  TRANSACTION: {
    id: 'string',           // מזהה עסקה
    תאריך: 'date',          // date - Israeli format (DD/MM/YYYY)
    סכום: 'number',         // amount in shekels (positive/negative)
    תיאור: 'string',        // description
    קטגוריה: 'string',      // category ID
    חשבון: 'string',        // account ID
    סוג: 'string',          // type: 'הכנסה' (income) | 'הוצאה' (expense) | 'העברה' (transfer)
    תת_קטגוריה: 'string',   // subcategory (optional)
    הערות: 'string',        // notes (optional)
    תגיות: 'array',         // tags array
    מיקום: 'string',        // location (optional)
    קבלה: 'string',         // receipt photo/file (optional)
    חוזר: 'object',         // recurring transaction config (optional)
    נוצר: 'datetime',       // created timestamp
    עודכן: 'datetime',      // updated timestamp
    מקור: 'string'          // source: 'manual' | 'import' | 'recurring'
  },

  // Category data structure
  CATEGORY: {
    id: 'string',           // מזהה קטגוריה
    שם: 'string',           // name in Hebrew
    צבע: 'string',          // color hex code
    אייקון: 'string',       // icon name/unicode
    סוג: 'string',          // type: 'הכנסה' | 'הוצאה'
    הורה: 'string',         // parent category ID (for subcategories)
    תקציב_חודשי: 'number',  // monthly budget (optional)
    אקטיבי: 'boolean',      // active status
    נוצר: 'datetime'        // created timestamp
  },

  // Budget data structure  
  BUDGET: {
    id: 'string',           // מזהה תקציב
    שם: 'string',           // name
    תקופה: 'object',        // period: { start: date, end: date }
    קטגוריות: 'array',      // array of category budgets
    סכום_כולל: 'number',   // total budget amount
    הוצאו: 'number',        // spent amount
    יעד: 'string',          // goal description
    התראות: 'object',       // alerts config
    אקטיבי: 'boolean',      // active status
    נוצר: 'datetime'        // created timestamp
  },

  // Account data structure
  ACCOUNT: {
    id: 'string',           // מזהה חשבון
    שם: 'string',           // account name
    סוג: 'string',          // type: 'בנק' | 'מזומן' | 'אשראי' | 'חיסכון'
    בנק: 'string',          // bank name (Bank Hapoalim, Bank Leumi, etc.)
    מספר_חשבון: 'string',   // account number (encrypted)
    יתרה: 'number',         // current balance
    מטבע: 'string',         // currency (default: 'ILS')
    צבע: 'string',          // color for display
    אקטיבי: 'boolean',      // active status
    נוצר: 'datetime'        // created timestamp
  },

  // Application settings
  SETTINGS: {
    שפה: 'string',          // language: 'he' | 'en'
    ערכת_נושא: 'string',    // theme: 'light' | 'dark' | 'auto'
    מטבע_ראשי: 'string',    // primary currency: 'ILS'
    פורמט_תאריך: 'string',  // date format: 'DD/MM/YYYY'
    התראות: 'object',       // notification preferences
    גיבוי_אוטומטי: 'boolean', // auto backup enabled
    הצפנה: 'boolean',       // encryption enabled
    נוצר: 'datetime',       // created timestamp
    עודכן: 'datetime'       // updated timestamp
  },

  // Transaction template data structure
  TEMPLATE: {
    id: 'string',           // מזהה תבנית
    name: 'string',         // שם התבנית
    description: 'string',  // תיאור התבנית
    type: 'string',         // type: 'הכנסה' | 'הוצאה'
    amount: 'number',       // סכום ברירת מחדל
    category: 'string',     // category ID
    frequency: 'string',    // תדירות: 'weekly' | 'monthly' | etc.
    tags: 'array',          // תגיות
    icon: 'string',         // אייקון
    color: 'string',        // צבע
    isDefault: 'boolean',   // תבנית ברירת מחדל
    createdAt: 'datetime',  // created timestamp
    updatedAt: 'datetime'   // updated timestamp
  }
};

// Default categories for Israeli users
export const DEFAULT_CATEGORIES = {
  // Income categories (הכנסות)
  INCOME: [
    { id: 'salary', שם: 'משכורת', צבע: '#10B981', אייקון: '💼', סוג: 'הכנסה' },
    { id: 'freelance', שם: 'עבודה עצמאית', צבע: '#8B5CF6', אייקון: '💻', סוג: 'הכנסה' },
    { id: 'investment', שם: 'השקעות', צבע: '#F59E0B', אייקון: '📈', סוג: 'הכנסה' },
    { id: 'gift', שם: 'מתנות', צבע: '#EF4444', אייקון: '🎁', סוג: 'הכנסה' },
    { id: 'other_income', שם: 'הכנסות אחרות', צבע: '#6B7280', אייקון: '💰', סוג: 'הכנסה' }
  ],
  
  // Expense categories (הוצאות)
  EXPENSES: [
    // Essential Israeli expenses
    { id: 'arnona', שם: 'ארנונה', צבע: '#DC2626', אייקון: '🏠', סוג: 'הוצאה' },
    { id: 'bituach_leumi', שם: 'ביטוח לאומי', צבע: '#7C2D12', אייקון: '🛡️', סוג: 'הוצאה' },
    { id: 'health_insurance', שם: 'ביטוח בריאות', צבע: '#DC2626', אייקון: '⚕️', סוג: 'הוצאה' },
    { id: 'rent', שם: 'שכר דירה', צבע: '#991B1B', אייקון: '🏠', סוג: 'הוצאה' },
    
    // Utilities
    { id: 'electricity', שם: 'חשמל', צבע: '#F59E0B', אייקון: '⚡', סוג: 'הוצאה' },
    { id: 'water', שם: 'מים', צבע: '#3B82F6', אייקון: '💧', סוג: 'הוצאה' },
    { id: 'gas', שם: 'גז', צבע: '#EF4444', אייקון: '🔥', סוג: 'הוצאה' },
    { id: 'internet', שם: 'אינטרנט', צבע: '#8B5CF6', אייקון: '📡', סוג: 'הוצאה' },
    { id: 'phone', שם: 'טלפון', צבע: '#06B6D4', אייקון: '📱', סוג: 'הוצאה' },
    
    // Daily expenses
    { id: 'groceries', שם: 'קניות מזון', צבע: '#10B981', אייקון: '🛒', סוג: 'הוצאה' },
    { id: 'restaurants', שם: 'מסעדות', צבע: '#F97316', אייקון: '🍽️', סוג: 'הוצאה' },
    { id: 'transportation', שם: 'תחבורה', צבע: '#3B82F6', אייקון: '🚗', סוג: 'הוצאה' },
    { id: 'fuel', שם: 'דלק', צבע: '#DC2626', אייקון: '⛽', סוג: 'הוצאה' },
    
    // Personal & family
    { id: 'clothing', שם: 'ביגוד', צבע: '#EC4899', אייקון: '👔', סוג: 'הוצאה' },
    { id: 'education', שם: 'חינוך', צבע: '#8B5CF6', אייקון: '📚', סוג: 'הוצאה' },
    { id: 'healthcare', שם: 'בריאות', צבע: '#EF4444', אייקון: '🏥', סוג: 'הוצאה' },
    { id: 'childcare', שם: 'גן ילדים', צבע: '#F59E0B', אייקון: '🧸', סוג: 'הוצאה' },
    
    // Entertainment & lifestyle
    { id: 'entertainment', שם: 'בילויים', צבע: '#8B5CF6', אייקון: '🎭', סוג: 'הוצאה' },
    { id: 'sports', שם: 'ספורט', צבע: '#10B981', אייקון: '⚽', סוג: 'הוצאה' },
    { id: 'hobbies', שם: 'תחביבים', צבע: '#F97316', אייקון: '🎨', סוג: 'הוצאה' },
    
    // Other
    { id: 'other_expense', שם: 'הוצאות אחרות', צבע: '#6B7280', אייקון: '📋', סוג: 'הוצאה' }
  ]
};

// Default Israeli banks
export const ISRAELI_BANKS = [
  'בנק הפועלים',
  'בנק לאומי',
  'בנק מזרחי טפחות',
  'בנק דיסקונט',
  'בנק יהב',
  'הבנק הבינלאומי',
  'בנק אוצר החייל',
  'בנק ירושלים',
  'בנק פועלי אגודת ישראל',
  'מזומן'
];