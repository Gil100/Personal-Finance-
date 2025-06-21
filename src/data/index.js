/**
 * Data Management Module for Israeli Personal Finance Dashboard
 * Unified API for all data operations with Hebrew support
 */

// Import all data management modules
import StorageAPI from './storage.js';
import { DataValidator, VALIDATION_MESSAGES } from './validation.js';
import DataBackup from './export.js';
import EncryptionAPI from './encryption.js';
import SearchAPI from './analytics.js';
import MigrationAPI from './migration.js';
import { ModelFactory, formatters } from './models.js';
import { DATA_SCHEMA, DEFAULT_CATEGORIES, ISRAELI_BANKS } from './schema.js';

// Initialize data system
class DataSystem {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initialized) {
      return { success: true, message: 'מערכת נתונים כבר מאותחלת' };
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialization();
    return this.initPromise;
  }

  async _doInitialization() {
    try {
      console.log('Initializing Israeli Finance Data System...');

      // Check if migrations are needed
      if (MigrationAPI.needsMigration()) {
        console.log('Running data migrations...');
        const migrationResult = await MigrationAPI.runMigrations();
        if (!migrationResult.success) {
          throw new Error(`Migration failed: ${migrationResult.error}`);
        }
      }

      // Check data integrity
      const integrityCheck = await MigrationAPI.checkIntegrity();
      if (!integrityCheck.overall) {
        console.warn('Data integrity issues found:', integrityCheck.errors);
        
        // Attempt auto-repair
        const repairResult = await MigrationAPI.autoRepair();
        console.log('Auto-repair results:', repairResult);
      }

      // Verify storage is available
      if (!StorageAPI.utils.isAvailable()) {
        throw new Error('localStorage not available');
      }

      // Get system stats
      const stats = StorageAPI.utils.getStats();
      console.log('Data system stats:', stats);

      this.initialized = true;
      
      return {
        success: true,
        message: 'מערכת נתונים אותחלה בהצלחה',
        stats,
        version: MigrationAPI.getCurrentVersion(),
        encryptionEnabled: EncryptionAPI.isEnabled()
      };

    } catch (error) {
      console.error('Data system initialization failed:', error);
      return {
        success: false,
        error: `שגיאה באתחול מערכת נתונים: ${error.message}`
      };
    }
  }

  // Get system status
  getStatus() {
    return {
      initialized: this.initialized,
      version: MigrationAPI.getCurrentVersion(),
      targetVersion: MigrationAPI.getTargetVersion(),
      needsMigration: MigrationAPI.needsMigration(),
      encryptionEnabled: EncryptionAPI.isEnabled(),
      storageAvailable: StorageAPI.utils.isAvailable(),
      stats: StorageAPI.utils.getStats()
    };
  }
}

// Create singleton instance
const dataSystem = new DataSystem();

// Main Data API - unified interface for all data operations
export const DataAPI = {
  // System management
  system: {
    initialize: () => dataSystem.initialize(),
    getStatus: () => dataSystem.getStatus(),
    clearAll: () => StorageAPI.utils.clearAll(),
    getStats: () => StorageAPI.utils.getStats()
  },

  // Core CRUD operations
  transactions: StorageAPI.transactions,
  categories: StorageAPI.categories,
  budgets: StorageAPI.budgets,
  accounts: StorageAPI.accounts,
  settings: StorageAPI.settings,
  templates: StorageAPI.templates,

  // Data validation
  validation: {
    validate: DataValidator,
    messages: VALIDATION_MESSAGES,
    validateTransaction: (txn) => DataValidator.validateTransaction(txn),
    validateCategory: (cat) => DataValidator.validateCategory(cat),
    validateBudget: (budget) => DataValidator.validateBudget(budget),
    validateAccount: (account) => DataValidator.validateAccount(account),
    hasErrors: (result) => DataValidator.hasErrors(result),
    getErrorMessages: (result) => DataValidator.getErrorMessages(result)
  },

  // Search and analytics
  search: SearchAPI.search,
  filter: SearchAPI.filter,
  analytics: SearchAPI.analytics,

  // Data export/import
  backup: {
    export: DataBackup.exportAll,
    exportTransactions: DataBackup.exportTransactions,
    exportCategories: DataBackup.exportCategories,
    exportForBank: DataBackup.exportForBank,
    import: DataBackup.importBackup,
    importTransactions: DataBackup.importTransactions,
    download: DataBackup.download,
    supportedFormats: DataBackup.supportedFormats
  },

  // Encryption management
  encryption: {
    isEnabled: EncryptionAPI.isEnabled,
    enable: EncryptionAPI.enable,
    disable: EncryptionAPI.disable,
    getStatus: EncryptionAPI.getStatus,
    updateSetting: EncryptionAPI.updateSetting
  },

  // Migration and integrity
  migration: {
    needsMigration: MigrationAPI.needsMigration,
    getCurrentVersion: MigrationAPI.getCurrentVersion,
    getTargetVersion: MigrationAPI.getTargetVersion,
    runMigrations: MigrationAPI.runMigrations,
    checkIntegrity: MigrationAPI.checkIntegrity,
    autoRepair: MigrationAPI.autoRepair
  },

  // Utility functions
  utils: {
    formatters,
    createTransaction: (data) => ModelFactory.createTransaction(data),
    createCategory: (data) => ModelFactory.createCategory(data),
    createBudget: (data) => ModelFactory.createBudget(data),
    createAccount: (data) => ModelFactory.createAccount(data),
    createSettings: (data) => ModelFactory.createSettings(data),
    createDefaultCategories: () => ModelFactory.createDefaultCategories(),
    createDefaultAccount: () => ModelFactory.createDefaultAccount(),
    normalizeHebrew: SearchAPI.utils.normalizeHebrew
  },

  // Constants and schemas
  schema: DATA_SCHEMA,
  defaultCategories: DEFAULT_CATEGORIES,
  israeliBanks: ISRAELI_BANKS
};

// Auto-initialize on module load
DataAPI.system.initialize().then(result => {
  if (result.success) {
    console.log('✅ Israeli Finance Data System initialized successfully');
    console.log(`📊 Version: ${result.version}`);
    console.log(`🔒 Encryption: ${result.encryptionEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`📈 Stats:`, result.stats);
  } else {
    console.error('❌ Data system initialization failed:', result.error);
  }
});

// Export individual modules for advanced usage
export {
  StorageAPI,
  DataValidator,
  DataBackup,
  EncryptionAPI,
  SearchAPI,
  MigrationAPI,
  ModelFactory,
  formatters,
  DATA_SCHEMA,
  DEFAULT_CATEGORIES,
  ISRAELI_BANKS
};

// Convenience wrapper for easier component usage
export const DataManager = {
  // Transactions
  getTransactions: () => DataAPI.transactions.getAll(),
  addTransaction: (data) => DataAPI.transactions.save(data),
  updateTransaction: (id, data) => DataAPI.transactions.update(id, data),
  deleteTransaction: (id) => DataAPI.transactions.delete(id),
  searchTransactions: (query) => DataAPI.search.transactions(query),

  // Categories
  getCategories: () => DataAPI.categories.getAll(),
  addCategory: (data) => DataAPI.categories.save(data),
  updateCategory: (id, data) => DataAPI.categories.update(id, data),
  deleteCategory: (id) => DataAPI.categories.delete(id),

  // Accounts
  getAccounts: () => DataAPI.accounts.getAll(),
  addAccount: (data) => DataAPI.accounts.save(data),
  updateAccount: (id, data) => DataAPI.accounts.update(id, data),
  deleteAccount: (id) => DataAPI.accounts.delete(id),

  // Templates
  getTransactionTemplates: () => DataAPI.templates.getAll(),
  saveTransactionTemplate: (data) => DataAPI.templates.save(data),
  updateTransactionTemplate: (id, data) => DataAPI.templates.update(id, data),
  deleteTransactionTemplate: (id) => DataAPI.templates.delete(id),
  getTemplatesByType: (type) => DataAPI.templates.getByType(type),

  // Export
  exportTransactions: (transactions, options) => DataAPI.backup.exportTransactions(transactions, options),

  // Validation
  validateTransaction: (data) => DataAPI.validation.validateTransaction(data),
  validateCategory: (data) => DataAPI.validation.validateCategory(data)
};

// Export as default
export default DataAPI;