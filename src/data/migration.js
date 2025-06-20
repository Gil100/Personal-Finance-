/**
 * Data Migration and Integrity System for Israeli Personal Finance Dashboard
 * Schema updates and data validation with Hebrew error messages
 */

import { DATA_SCHEMA } from './schema.js';
import StorageAPI from './storage.js';
import { DataValidator } from './validation.js';

// Migration definitions
const MIGRATIONS = {
  '1.0.0': {
    description: 'Initial schema setup',
    up: () => {
      // Initial setup already handled in storage.js
      return { success: true, message: 'סכמה ראשונית הוגדרה בהצלחה' };
    }
  },
  
  '1.1.0': {
    description: 'Add tags support to transactions',
    up: () => {
      try {
        const transactions = StorageAPI.transactions.getAll();
        let updated = 0;
        
        transactions.forEach(txn => {
          if (!txn.תגיות) {
            txn.תגיות = [];
            StorageAPI.transactions.save(txn);
            updated++;
          }
        });
        
        return { 
          success: true, 
          message: `הוספו תגיות ל-${updated} עסקאות` 
        };
      } catch (error) {
        return { 
          success: false, 
          error: `שגיאה בהוספת תגיות: ${error.message}` 
        };
      }
    }
  },
  
  '1.2.0': {
    description: 'Add location field to transactions',
    up: () => {
      try {
        const transactions = StorageAPI.transactions.getAll();
        let updated = 0;
        
        transactions.forEach(txn => {
          if (!txn.מיקום) {
            txn.מיקום = '';
            StorageAPI.transactions.save(txn);
            updated++;
          }
        });
        
        return { 
          success: true, 
          message: `הוסף שדה מיקום ל-${updated} עסקאות` 
        };
      } catch (error) {
        return { 
          success: false, 
          error: `שגיאה בהוספת מיקום: ${error.message}` 
        };
      }
    }
  }
};

// Data migration manager
export class DataMigration {
  
  static getCurrentVersion() {
    return localStorage.getItem(DATA_SCHEMA.STORAGE_KEYS.SCHEMA_VERSION) || '1.0.0';
  }
  
  static getTargetVersion() {
    return DATA_SCHEMA.VERSION;
  }
  
  static needsMigration() {
    const current = this.getCurrentVersion();
    const target = this.getTargetVersion();
    return this.compareVersions(current, target) < 0;
  }
  
  static compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }
    
    return 0;
  }
  
  static async runMigrations() {
    if (!this.needsMigration()) {
      return {
        success: true,
        message: 'אין צורך בעדכון סכמה',
        currentVersion: this.getCurrentVersion()
      };
    }
    
    const currentVersion = this.getCurrentVersion();
    const targetVersion = this.getTargetVersion();
    const results = {
      success: true,
      migrations: [],
      errors: [],
      fromVersion: currentVersion,
      toVersion: targetVersion
    };
    
    try {
      // Create backup before migration
      const backupKey = `migration_backup_${Date.now()}`;
      const allData = {
        transactions: StorageAPI.transactions.getAll(),
        categories: StorageAPI.categories.getAll(),
        budgets: StorageAPI.budgets.getAll(),
        accounts: StorageAPI.accounts.getAll(),
        settings: StorageAPI.settings.get()
      };
      
      localStorage.setItem(backupKey, JSON.stringify(allData));
      
      // Run migrations in order
      const versions = Object.keys(MIGRATIONS).sort(this.compareVersions);
      
      for (const version of versions) {
        if (this.compareVersions(currentVersion, version) < 0 && 
            this.compareVersions(version, targetVersion) <= 0) {
          
          const migration = MIGRATIONS[version];
          console.log(`Running migration to ${version}: ${migration.description}`);
          
          try {
            const result = await migration.up();
            results.migrations.push({
              version,
              description: migration.description,
              result
            });
            
            if (!result.success) {
              results.errors.push(`Migration ${version}: ${result.error}`);
            }
          } catch (error) {
            const errorMessage = `Migration ${version} failed: ${error.message}`;
            results.errors.push(errorMessage);
            console.error(errorMessage, error);
          }
        }
      }
      
      // Update schema version
      localStorage.setItem(DATA_SCHEMA.STORAGE_KEYS.SCHEMA_VERSION, targetVersion);
      
      // Clean up old backup if successful
      if (results.errors.length === 0) {
        localStorage.removeItem(backupKey);
      }
      
      results.success = results.errors.length === 0;
      results.message = results.success ? 
        `עודכן בהצלחה מגרסה ${currentVersion} לגרסה ${targetVersion}` :
        `שגיאות בעדכון: ${results.errors.length}`;
      
    } catch (error) {
      results.success = false;
      results.error = `שגיאה במעבר נתונים: ${error.message}`;
    }
    
    return results;
  }
}

// Data integrity checker
export class DataIntegrityChecker {
  
  static async checkAllData() {
    const results = {
      overall: true,
      errors: [],
      warnings: [],
      stats: {
        transactions: 0,
        categories: 0,
        budgets: 0,
        accounts: 0,
        settings: 0
      },
      details: {}
    };
    
    try {
      // Check transactions
      const transactionCheck = await this.checkTransactions();
      results.details.transactions = transactionCheck;
      results.stats.transactions = transactionCheck.count;
      if (!transactionCheck.valid) {
        results.overall = false;
        results.errors.push(...transactionCheck.errors);
      }
      results.warnings.push(...transactionCheck.warnings);
      
      // Check categories
      const categoryCheck = await this.checkCategories();
      results.details.categories = categoryCheck;
      results.stats.categories = categoryCheck.count;
      if (!categoryCheck.valid) {
        results.overall = false;
        results.errors.push(...categoryCheck.errors);
      }
      results.warnings.push(...categoryCheck.warnings);
      
      // Check budgets
      const budgetCheck = await this.checkBudgets();
      results.details.budgets = budgetCheck;
      results.stats.budgets = budgetCheck.count;
      if (!budgetCheck.valid) {
        results.overall = false;
        results.errors.push(...budgetCheck.errors);
      }
      results.warnings.push(...budgetCheck.warnings);
      
      // Check accounts
      const accountCheck = await this.checkAccounts();
      results.details.accounts = accountCheck;
      results.stats.accounts = accountCheck.count;
      if (!accountCheck.valid) {
        results.overall = false;
        results.errors.push(...accountCheck.errors);
      }
      results.warnings.push(...accountCheck.warnings);
      
      // Check references integrity
      const refCheck = await this.checkReferences();
      results.details.references = refCheck;
      if (!refCheck.valid) {
        results.overall = false;
        results.errors.push(...refCheck.errors);
      }
      results.warnings.push(...refCheck.warnings);
      
    } catch (error) {
      results.overall = false;
      results.errors.push(`שגיאה בבדיקת שלמות נתונים: ${error.message}`);
    }
    
    return results;
  }
  
  static async checkTransactions() {
    const transactions = StorageAPI.transactions.getAll();
    const errors = [];
    const warnings = [];
    let validCount = 0;
    
    transactions.forEach((txn, index) => {
      try {
        // Validate structure
        const validationErrors = DataValidator.validateTransaction(txn);
        if (DataValidator.hasErrors(validationErrors)) {
          errors.push(`עסקה ${index + 1}: ${DataValidator.getErrorMessages(validationErrors).join(', ')}`);
        } else {
          validCount++;
        }
        
        // Check for data anomalies
        if (Math.abs(txn.סכום) > 1000000) {
          warnings.push(`עסקה ${index + 1}: סכום חריג - ${txn.סכום}`);
        }
        
        if (new Date(txn.תאריך) > new Date()) {
          warnings.push(`עסקה ${index + 1}: תאריך בעתיד - ${txn.תאריך}`);
        }
        
      } catch (error) {
        errors.push(`עסקה ${index + 1}: שגיאה בבדיקה - ${error.message}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      count: transactions.length,
      validCount,
      errors,
      warnings
    };
  }
  
  static async checkCategories() {
    const categories = StorageAPI.categories.getAll();
    const errors = [];
    const warnings = [];
    let validCount = 0;
    
    // Check for duplicate names
    const names = {};
    
    categories.forEach((cat, index) => {
      try {
        // Validate structure
        const validationErrors = DataValidator.validateCategory(cat);
        if (DataValidator.hasErrors(validationErrors)) {
          errors.push(`קטגוריה ${index + 1}: ${DataValidator.getErrorMessages(validationErrors).join(', ')}`);
        } else {
          validCount++;
        }
        
        // Check for duplicates
        if (names[cat.שם]) {
          warnings.push(`קטגוריה כפולה: ${cat.שם}`);
        } else {
          names[cat.שם] = true;
        }
        
      } catch (error) {
        errors.push(`קטגוריה ${index + 1}: שגיאה בבדיקה - ${error.message}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      count: categories.length,
      validCount,
      errors,
      warnings
    };
  }
  
  static async checkBudgets() {
    const budgets = StorageAPI.budgets.getAll();
    const errors = [];
    const warnings = [];
    let validCount = 0;
    
    budgets.forEach((budget, index) => {
      try {
        // Validate structure
        const validationErrors = DataValidator.validateBudget(budget);
        if (DataValidator.hasErrors(validationErrors)) {
          errors.push(`תקציב ${index + 1}: ${DataValidator.getErrorMessages(validationErrors).join(', ')}`);
        } else {
          validCount++;
        }
        
        // Check for expired budgets
        const endDate = new Date(budget.תקופה.end);
        const now = new Date();
        if (endDate < now && budget.אקטיבי) {
          warnings.push(`תקציב ${budget.שם}: פג תוקף אך עדיין פעיל`);
        }
        
      } catch (error) {
        errors.push(`תקציב ${index + 1}: שגיאה בבדיקה - ${error.message}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      count: budgets.length,
      validCount,
      errors,
      warnings
    };
  }
  
  static async checkAccounts() {
    const accounts = StorageAPI.accounts.getAll();
    const errors = [];
    const warnings = [];
    let validCount = 0;
    
    // Check for duplicate account numbers
    const accountNumbers = {};
    
    accounts.forEach((account, index) => {
      try {
        // Validate structure
        const validationErrors = DataValidator.validateAccount(account);
        if (DataValidator.hasErrors(validationErrors)) {
          errors.push(`חשבון ${index + 1}: ${DataValidator.getErrorMessages(validationErrors).join(', ')}`);
        } else {
          validCount++;
        }
        
        // Check for duplicate account numbers
        if (account.מספר_חשבון && accountNumbers[account.מספר_חשבון]) {
          warnings.push(`מספר חשבון כפול: ${account.מספר_חשבון}`);
        } else if (account.מספר_חשבון) {
          accountNumbers[account.מספר_חשבון] = true;
        }
        
        // Check for very low balances on non-credit accounts
        if (account.יתרה < -1000 && account.סוג !== 'אשראי') {
          warnings.push(`חשבון ${account.שם}: יתרה שלילית גבוהה`);
        }
        
      } catch (error) {
        errors.push(`חשבון ${index + 1}: שגיאה בבדיקה - ${error.message}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      count: accounts.length,
      validCount,
      errors,
      warnings
    };
  }
  
  static async checkReferences() {
    const transactions = StorageAPI.transactions.getAll();
    const categories = StorageAPI.categories.getAll();
    const accounts = StorageAPI.accounts.getAll();
    
    const categoryIds = new Set(categories.map(cat => cat.id));
    const accountIds = new Set(accounts.map(acc => acc.id));
    
    const errors = [];
    const warnings = [];
    
    // Check transaction references
    transactions.forEach((txn, index) => {
      if (txn.קטגוריה && !categoryIds.has(txn.קטגוריה)) {
        errors.push(`עסקה ${index + 1}: קטגוריה לא קיימת - ${txn.קטגוריה}`);
      }
      
      if (txn.חשבון && !accountIds.has(txn.חשבון)) {
        errors.push(`עסקה ${index + 1}: חשבון לא קיים - ${txn.חשבון}`);
      }
    });
    
    // Check for unused categories
    const usedCategories = new Set(transactions.map(txn => txn.קטגוריה));
    categories.forEach(cat => {
      if (!usedCategories.has(cat.id)) {
        warnings.push(`קטגוריה לא בשימוש: ${cat.שם}`);
      }
    });
    
    // Check for unused accounts
    const usedAccounts = new Set(transactions.map(txn => txn.חשבון));
    accounts.forEach(acc => {
      if (!usedAccounts.has(acc.id)) {
        warnings.push(`חשבון לא בשימוש: ${acc.שם}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Auto-repair common issues
  static async autoRepair() {
    const results = {
      repaired: [],
      couldNotRepair: []
    };
    
    try {
      // Remove orphaned transactions
      const transactions = StorageAPI.transactions.getAll();
      const categories = StorageAPI.categories.getAll();
      const accounts = StorageAPI.accounts.getAll();
      
      const categoryIds = new Set(categories.map(cat => cat.id));
      const accountIds = new Set(accounts.map(acc => acc.id));
      
      let orphanedTransactions = 0;
      transactions.forEach(txn => {
        if ((txn.קטגוריה && !categoryIds.has(txn.קטגוריה)) ||
            (txn.חשבון && !accountIds.has(txn.חשבון))) {
          try {
            StorageAPI.transactions.delete(txn.id);
            orphanedTransactions++;
          } catch (error) {
            results.couldNotRepair.push(`לא ניתן למחוק עסקה יתומה: ${txn.id}`);
          }
        }
      });
      
      if (orphanedTransactions > 0) {
        results.repaired.push(`נמחקו ${orphanedTransactions} עסקאות יתומות`);
      }
      
      // Deactivate expired budgets
      const budgets = StorageAPI.budgets.getAll();
      let expiredBudgets = 0;
      
      budgets.forEach(budget => {
        const endDate = new Date(budget.תקופה.end);
        const now = new Date();
        
        if (endDate < now && budget.אקטיבי) {
          try {
            StorageAPI.budgets.update(budget.id, { אקטיבי: false });
            expiredBudgets++;
          } catch (error) {
            results.couldNotRepair.push(`לא ניתן לכבות תקציב פג תוקף: ${budget.שם}`);
          }
        }
      });
      
      if (expiredBudgets > 0) {
        results.repaired.push(`כובו ${expiredBudgets} תקציבים שפג תוקפם`);
      }
      
    } catch (error) {
      results.couldNotRepair.push(`שגיאה כללית בתיקון: ${error.message}`);
    }
    
    return results;
  }
}

// Public API
export const MigrationAPI = {
  // Migration functions
  needsMigration: () => DataMigration.needsMigration(),
  getCurrentVersion: () => DataMigration.getCurrentVersion(),
  getTargetVersion: () => DataMigration.getTargetVersion(),
  runMigrations: () => DataMigration.runMigrations(),
  
  // Integrity functions
  checkIntegrity: () => DataIntegrityChecker.checkAllData(),
  checkTransactions: () => DataIntegrityChecker.checkTransactions(),
  checkCategories: () => DataIntegrityChecker.checkCategories(),
  checkBudgets: () => DataIntegrityChecker.checkBudgets(),
  checkAccounts: () => DataIntegrityChecker.checkAccounts(),
  checkReferences: () => DataIntegrityChecker.checkReferences(),
  autoRepair: () => DataIntegrityChecker.autoRepair()
};

export default MigrationAPI;