/**
 * Data Storage Manager for Israeli Personal Finance Dashboard
 * CRUD operations with localStorage and Hebrew error messages
 */

import { DATA_SCHEMA } from './schema.js';
import { ModelFactory } from './models.js';

// Hebrew error messages
const HEBREW_ERRORS = {
  STORAGE_NOT_AVAILABLE: 'אחסון מקומי אינו זמין',
  INVALID_DATA: 'נתונים לא תקינים',
  ITEM_NOT_FOUND: 'פריט לא נמצא',
  DUPLICATE_ID: 'מזהה כבר קיים',
  VALIDATION_FAILED: 'אימות נתונים נכשל',
  SAVE_FAILED: 'שמירה נכשלה',
  DELETE_FAILED: 'מחיקה נכשלה',
  LOAD_FAILED: 'טעינה נכשלה',
  SCHEMA_MISMATCH: 'גרסת נתונים לא תואמת'
};

class StorageManager {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
    this.initializeSchema();
  }

  // Check if localStorage is available
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('localStorage not available:', e);
      return false;
    }
  }

  // Initialize schema version and default data
  initializeSchema() {
    if (!this.isAvailable) return;

    const currentVersion = localStorage.getItem(DATA_SCHEMA.STORAGE_KEYS.SCHEMA_VERSION);
    
    if (!currentVersion) {
      // First time setup
      localStorage.setItem(DATA_SCHEMA.STORAGE_KEYS.SCHEMA_VERSION, DATA_SCHEMA.VERSION);
      this.initializeDefaultData();
    } else if (currentVersion !== DATA_SCHEMA.VERSION) {
      // Schema migration needed
      this.migrateSchema(currentVersion, DATA_SCHEMA.VERSION);
    }
  }

  // Initialize default categories and settings
  initializeDefaultData() {
    try {
      // Create default categories
      const defaultCategories = ModelFactory.createDefaultCategories();
      this.saveMultiple('categories', defaultCategories);

      // Create default account
      const defaultAccount = ModelFactory.createDefaultAccount();
      this.save('accounts', defaultAccount);

      // Create default settings
      const defaultSettings = ModelFactory.createSettings();
      this.save('settings', defaultSettings);

      console.log('Default data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize default data:', error);
    }
  }

  // Generic save method
  save(type, item) {
    if (!this.isAvailable) {
      throw new Error(HEBREW_ERRORS.STORAGE_NOT_AVAILABLE);
    }

    const storageKey = this.getStorageKey(type);
    const existing = this.getAll(type);

    // Validate item
    if (item.validate && typeof item.validate === 'function') {
      const errors = item.validate();
      if (errors.length > 0) {
        throw new Error(`${HEBREW_ERRORS.VALIDATION_FAILED}: ${errors.join(', ')}`);
      }
    }

    try {
      // Check for duplicates (except for settings)
      if (type !== 'settings') {
        const duplicate = existing.find(existingItem => existingItem.id === item.id);
        if (duplicate) {
          // Update existing item
          const index = existing.findIndex(existingItem => existingItem.id === item.id);
          existing[index] = item;
        } else {
          // Add new item
          existing.push(item);
        }
      } else {
        // Settings is singular
        localStorage.setItem(storageKey, JSON.stringify(item));
        return item;
      }

      localStorage.setItem(storageKey, JSON.stringify(existing));
      return item;
    } catch (error) {
      throw new Error(`${HEBREW_ERRORS.SAVE_FAILED}: ${error.message}`);
    }
  }

  // Save multiple items
  saveMultiple(type, items) {
    if (!Array.isArray(items)) {
      throw new Error(HEBREW_ERRORS.INVALID_DATA);
    }

    const results = [];
    for (const item of items) {
      results.push(this.save(type, item));
    }
    return results;
  }

  // Get single item by ID
  getById(type, id) {
    if (type === 'settings') {
      return this.getSettings();
    }

    const items = this.getAll(type);
    const item = items.find(item => item.id === id);
    
    if (!item) {
      throw new Error(HEBREW_ERRORS.ITEM_NOT_FOUND);
    }

    return this.createModelInstance(type, item);
  }

  // Get all items of a type
  getAll(type) {
    if (!this.isAvailable) {
      return [];
    }

    const storageKey = this.getStorageKey(type);
    
    try {
      const data = localStorage.getItem(storageKey);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      
      // Handle settings (singular)
      if (type === 'settings') {
        return this.createModelInstance(type, parsed);
      }

      // Handle arrays
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(item => this.createModelInstance(type, item));
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
      return [];
    }
  }

  // Get filtered items
  getFiltered(type, filterFn) {
    const items = this.getAll(type);
    return items.filter(filterFn);
  }

  // Update item
  update(type, id, updates) {
    const item = this.getById(type, id);
    Object.assign(item, updates);
    
    // Update timestamp if method exists
    if (item.touch && typeof item.touch === 'function') {
      item.touch();
    }
    
    return this.save(type, item);
  }

  // Delete item
  delete(type, id) {
    if (!this.isAvailable) {
      throw new Error(HEBREW_ERRORS.STORAGE_NOT_AVAILABLE);
    }

    if (type === 'settings') {
      throw new Error('לא ניתן למחוק הגדרות');
    }

    const storageKey = this.getStorageKey(type);
    const existing = this.getAll(type);
    const index = existing.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(HEBREW_ERRORS.ITEM_NOT_FOUND);
    }

    try {
      existing.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(existing));
      return true;
    } catch (error) {
      throw new Error(`${HEBREW_ERRORS.DELETE_FAILED}: ${error.message}`);
    }
  }

  // Delete multiple items
  deleteMultiple(type, ids) {
    const results = [];
    for (const id of ids) {
      try {
        results.push({ id, success: this.delete(type, id) });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }

  // Clear all data of a type
  clear(type) {
    if (!this.isAvailable) {
      throw new Error(HEBREW_ERRORS.STORAGE_NOT_AVAILABLE);
    }

    const storageKey = this.getStorageKey(type);
    
    try {
      if (type === 'settings') {
        // Reset to default settings
        const defaultSettings = ModelFactory.createSettings();
        localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
      } else {
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
      return true;
    } catch (error) {
      throw new Error(`${HEBREW_ERRORS.DELETE_FAILED}: ${error.message}`);
    }
  }

  // Clear all application data
  clearAll() {
    Object.values(DATA_SCHEMA.STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to clear ${key}:`, error);
      }
    });
    
    // Reinitialize
    this.initializeSchema();
  }

  // Get storage statistics
  getStats() {
    const stats = {
      transactions: this.getAll('transactions').length,
      categories: this.getAll('categories').length,
      budgets: this.getAll('budgets').length,
      accounts: this.getAll('accounts').length,
      storageUsed: this.getStorageUsage(),
      lastUpdate: new Date().toISOString()
    };

    return stats;
  }

  // Calculate storage usage
  getStorageUsage() {
    let totalSize = 0;
    
    Object.values(DATA_SCHEMA.STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }

  // Helper methods
  getStorageKey(type) {
    const keyMap = {
      'transactions': DATA_SCHEMA.STORAGE_KEYS.TRANSACTIONS,
      'categories': DATA_SCHEMA.STORAGE_KEYS.CATEGORIES,
      'budgets': DATA_SCHEMA.STORAGE_KEYS.BUDGETS,
      'accounts': DATA_SCHEMA.STORAGE_KEYS.ACCOUNTS,
      'settings': DATA_SCHEMA.STORAGE_KEYS.SETTINGS
    };

    return keyMap[type] || type;
  }

  createModelInstance(type, data) {
    const factoryMap = {
      'transactions': ModelFactory.createTransaction,
      'categories': ModelFactory.createCategory,
      'budgets': ModelFactory.createBudget,
      'accounts': ModelFactory.createAccount,
      'settings': ModelFactory.createSettings
    };

    const factory = factoryMap[type];
    return factory ? factory(data) : data;
  }

  // Settings-specific methods
  getSettings() {
    const storageKey = DATA_SCHEMA.STORAGE_KEYS.SETTINGS;
    const data = localStorage.getItem(storageKey);
    
    if (!data) {
      const defaultSettings = ModelFactory.createSettings();
      this.save('settings', defaultSettings);
      return defaultSettings;
    }

    try {
      return ModelFactory.createSettings(JSON.parse(data));
    } catch (error) {
      console.error('Failed to parse settings:', error);
      return ModelFactory.createSettings();
    }
  }

  updateSettings(updates) {
    const settings = this.getSettings();
    Object.assign(settings, updates);
    settings.touch();
    return this.save('settings', settings);
  }

  // Schema migration placeholder
  migrateSchema(from, to) {
    console.log(`Schema migration needed: ${from} -> ${to}`);
    // TODO: Implement specific migration logic when schema changes
    localStorage.setItem(DATA_SCHEMA.STORAGE_KEYS.SCHEMA_VERSION, to);
  }
}

// Singleton instance
const storage = new StorageManager();

// Public API
export const StorageAPI = {
  // Transactions
  transactions: {
    getAll: () => storage.getAll('transactions'),
    getById: (id) => storage.getById('transactions', id),
    save: (transaction) => storage.save('transactions', transaction),
    update: (id, updates) => storage.update('transactions', id, updates),
    delete: (id) => storage.delete('transactions', id),
    deleteMultiple: (ids) => storage.deleteMultiple('transactions', ids),
    getByDateRange: (startDate, endDate) => {
      return storage.getFiltered('transactions', (txn) => {
        const txnDate = new Date(txn.תאריך);
        return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
      });
    },
    getByCategory: (categoryId) => {
      return storage.getFiltered('transactions', (txn) => txn.קטגוריה === categoryId);
    },
    getByAccount: (accountId) => {
      return storage.getFiltered('transactions', (txn) => txn.חשבון === accountId);
    }
  },

  // Categories
  categories: {
    getAll: () => storage.getAll('categories'),
    getById: (id) => storage.getById('categories', id),
    save: (category) => storage.save('categories', category),
    update: (id, updates) => storage.update('categories', id, updates),
    delete: (id) => storage.delete('categories', id),
    getByType: (type) => {
      return storage.getFiltered('categories', (cat) => cat.סוג === type);
    },
    getActive: () => {
      return storage.getFiltered('categories', (cat) => cat.אקטיבי);
    }
  },

  // Budgets
  budgets: {
    getAll: () => storage.getAll('budgets'),
    getById: (id) => storage.getById('budgets', id),
    save: (budget) => storage.save('budgets', budget),
    update: (id, updates) => storage.update('budgets', id, updates),
    delete: (id) => storage.delete('budgets', id),
    getActive: () => {
      return storage.getFiltered('budgets', (budget) => budget.אקטיבי);
    },
    getCurrent: () => {
      const now = new Date();
      return storage.getFiltered('budgets', (budget) => {
        const start = new Date(budget.תקופה.start);
        const end = new Date(budget.תקופה.end);
        return budget.אקטיבי && now >= start && now <= end;
      });
    }
  },

  // Accounts
  accounts: {
    getAll: () => storage.getAll('accounts'),
    getById: (id) => storage.getById('accounts', id),
    save: (account) => storage.save('accounts', account),
    update: (id, updates) => storage.update('accounts', id, updates),
    delete: (id) => storage.delete('accounts', id),
    getActive: () => {
      return storage.getFiltered('accounts', (account) => account.אקטיבי);
    },
    updateBalance: (id, amount) => {
      const account = storage.getById('accounts', id);
      account.יתרה += amount;
      return storage.save('accounts', account);
    }
  },

  // Settings
  settings: {
    get: () => storage.getSettings(),
    update: (updates) => storage.updateSettings(updates)
  },

  // Utility
  utils: {
    getStats: () => storage.getStats(),
    clearAll: () => storage.clearAll(),
    clear: (type) => storage.clear(type),
    isAvailable: () => storage.isAvailable
  }
};

export default StorageAPI;