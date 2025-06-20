/**
 * Data Export/Import System for Israeli Personal Finance Dashboard
 * Backup/restore functionality with Hebrew headers and Israeli bank formats
 */

import StorageAPI from './storage.js';
import { formatters } from './models.js';

// Hebrew export headers
export const EXPORT_HEADERS = {
  TRANSACTIONS: {
    id: 'מזהה',
    תאריך: 'תאריך',
    תיאור: 'תיאור',
    סכום: 'סכום',
    קטגוריה: 'קטגוריה', 
    חשבון: 'חשבון',
    סוג: 'סוג עסקה',
    תת_קטגוריה: 'תת קטגוריה',
    הערות: 'הערות',
    תגיות: 'תגיות',
    מיקום: 'מיקום',
    נוצר: 'נוצר',
    עודכן: 'עודכן'
  },
  
  CATEGORIES: {
    id: 'מזהה',
    שם: 'שם קטגוריה',
    צבע: 'צבע',
    אייקון: 'אייקון',
    סוג: 'סוג',
    תקציב_חודשי: 'תקציב חודשי',
    אקטיבי: 'פעיל',
    נוצר: 'נוצר'
  },
  
  BUDGETS: {
    id: 'מזהה',
    שם: 'שם תקציב',
    'תקופה.start': 'תאריך התחלה',
    'תקופה.end': 'תאריך סיום',
    סכום_כולל: 'סכום כולל',
    הוצאו: 'הוצאו',
    יעד: 'יעד',
    אקטיבי: 'פעיל',
    נוצר: 'נוצר'
  },
  
  ACCOUNTS: {
    id: 'מזהה',
    שם: 'שם חשבון',
    סוג: 'סוג חשבון',
    בנק: 'בנק',
    יתרה: 'יתרה',
    מטבע: 'מטבע',
    אקטיבי: 'פעיל',
    נוצר: 'נוצר'
  }
};

// Export/Import class
export class DataExporter {
  
  // Export all data as JSON backup
  static exportFullBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          transactions: StorageAPI.transactions.getAll(),
          categories: StorageAPI.categories.getAll(),
          budgets: StorageAPI.budgets.getAll(),
          accounts: StorageAPI.accounts.getAll(),
          settings: StorageAPI.settings.get()
        },
        stats: StorageAPI.utils.getStats()
      };
      
      return {
        success: true,
        data: JSON.stringify(backup, null, 2),
        filename: `finance-backup-${this.formatDateForFilename(new Date())}.json`,
        mimeType: 'application/json'
      };
    } catch (error) {
      return {
        success: false,
        error: `שגיאה ביצוא גיבוי: ${error.message}`
      };
    }
  }
  
  // Export transactions as CSV
  static exportTransactionsCSV(dateRange = null) {
    try {
      let transactions = StorageAPI.transactions.getAll();
      
      // Filter by date range if provided
      if (dateRange && dateRange.start && dateRange.end) {
        transactions = StorageAPI.transactions.getByDateRange(dateRange.start, dateRange.end);
      }
      
      // Get categories and accounts for mapping
      const categories = StorageAPI.categories.getAll();
      const accounts = StorageAPI.accounts.getAll();
      
      const categoryMap = {};
      categories.forEach(cat => categoryMap[cat.id] = cat.שם);
      
      const accountMap = {};
      accounts.forEach(acc => accountMap[acc.id] = acc.שם);
      
      // Convert to CSV format
      const csvData = transactions.map(txn => ({
        'תאריך': formatters.date(txn.תאריך),
        'תיאור': txn.תיאור,
        'סכום': txn.סכום,
        'קטגוריה': categoryMap[txn.קטגוריה] || txn.קטגוריה,
        'חשבון': accountMap[txn.חשבון] || txn.חשבון,
        'סוג עסקה': txn.סוג,
        'הערות': txn.הערות || '',
        'תגיות': Array.isArray(txn.תגיות) ? txn.תגיות.join(';') : '',
        'מיקום': txn.מיקום || ''
      }));
      
      const csv = this.convertToCSV(csvData);
      
      return {
        success: true,
        data: csv,
        filename: `transactions-${this.formatDateForFilename(new Date())}.csv`,
        mimeType: 'text/csv;charset=utf-8'
      };
    } catch (error) {
      return {
        success: false,
        error: `שגיאה ביצוא עסקאות: ${error.message}`
      };
    }
  }
  
  // Export categories as CSV
  static exportCategoriesCSV() {
    try {
      const categories = StorageAPI.categories.getAll();
      
      const csvData = categories.map(cat => ({
        'שם קטגוריה': cat.שם,
        'סוג': cat.סוג,
        'תקציב חודשי': cat.תקציב_חודשי || 0,
        'צבע': cat.צבע,
        'אייקון': cat.אייקון,
        'פעיל': cat.אקטיבי ? 'כן' : 'לא'
      }));
      
      const csv = this.convertToCSV(csvData);
      
      return {
        success: true,
        data: csv,
        filename: `categories-${this.formatDateForFilename(new Date())}.csv`,
        mimeType: 'text/csv;charset=utf-8'
      };
    } catch (error) {
      return {
        success: false,
        error: `שגיאה ביצוא קטגוריות: ${error.message}`
      };
    }
  }
  
  // Export for Israeli banks format (Bank Hapoalim, Leumi, etc.)
  static exportForBanks(bankFormat = 'generic') {
    try {
      const transactions = StorageAPI.transactions.getAll();
      const categories = StorageAPI.categories.getAll();
      const accounts = StorageAPI.accounts.getAll();
      
      const categoryMap = {};
      categories.forEach(cat => categoryMap[cat.id] = cat.שם);
      
      const accountMap = {};
      accounts.forEach(acc => accountMap[acc.id] = acc.מספר_חשבון || acc.שם);
      
      let csvData;
      
      switch (bankFormat) {
        case 'hapoalim':
          // Bank Hapoalim format
          csvData = transactions.map(txn => ({
            'תאריך פעולה': this.formatDateISR(txn.תאריך),
            'תאריך ערך': this.formatDateISR(txn.תאריך),
            'פרטי הפעולה': txn.תיאור,
            'אסמכתא': '',
            'זכות': txn.סכום > 0 ? Math.abs(txn.סכום) : '',
            'חובה': txn.סכום < 0 ? Math.abs(txn.סכום) : '',
            'יתרה': ''
          }));
          break;
          
        case 'leumi':
          // Bank Leumi format
          csvData = transactions.map(txn => ({
            'תאריך': this.formatDateISR(txn.תאריך),
            'תיאור': txn.תיאור,
            'קטגוריה': categoryMap[txn.קטגוריה] || '',
            'סכום': txn.סכום,
            'חשבון': accountMap[txn.חשבון] || ''
          }));
          break;
          
        default:
          // Generic Israeli bank format
          csvData = transactions.map(txn => ({
            'תאריך': this.formatDateISR(txn.תאריך),
            'תיאור הפעולה': txn.תיאור,
            'סכום': txn.סכום,
            'סוג פעולה': txn.סכום > 0 ? 'זכות' : 'חובה',
            'קטגוריה': categoryMap[txn.קטגוריה] || '',
            'הערות': txn.הערות || ''
          }));
      }
      
      const csv = this.convertToCSV(csvData);
      
      return {
        success: true,
        data: csv,
        filename: `bank-export-${bankFormat}-${this.formatDateForFilename(new Date())}.csv`,
        mimeType: 'text/csv;charset=utf-8'
      };
    } catch (error) {
      return {
        success: false,
        error: `שגיאה ביצוא לבנק: ${error.message}`
      };
    }
  }
  
  // Download file helper
  static downloadFile(exportResult) {
    if (!exportResult.success) {
      throw new Error(exportResult.error);
    }
    
    try {
      const blob = new Blob([exportResult.data], { type: exportResult.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = exportResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw new Error(`שגיאה בהורדת קובץ: ${error.message}`);
    }
  }
  
  // Helper methods
  static convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.map(header => `"${header}"`).join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return `"${value !== null && value !== undefined ? value : ''}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
  
  static formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
  }
  
  static formatDateISR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  }
}

// Import class
export class DataImporter {
  
  // Import full backup
  static async importFullBackup(jsonContent) {
    try {
      const backup = JSON.parse(jsonContent);
      
      // Validate backup structure
      if (!backup.data || !backup.version) {
        throw new Error('פורמט גיבוי לא תקין');
      }
      
      // Create backup of current data before import
      const currentBackup = DataExporter.exportFullBackup();
      if (!currentBackup.success) {
        throw new Error('נכשל ביצירת גיבוי נוכחי');
      }
      
      const results = {
        imported: 0,
        errors: [],
        backed_up: true
      };
      
      // Import data
      if (backup.data.transactions) {
        try {
          StorageAPI.utils.clear('transactions');
          backup.data.transactions.forEach(txn => {
            StorageAPI.transactions.save(txn);
            results.imported++;
          });
        } catch (error) {
          results.errors.push(`עסקאות: ${error.message}`);
        }
      }
      
      if (backup.data.categories) {
        try {
          StorageAPI.utils.clear('categories');
          backup.data.categories.forEach(cat => {
            StorageAPI.categories.save(cat);
            results.imported++;
          });
        } catch (error) {
          results.errors.push(`קטגוריות: ${error.message}`);
        }
      }
      
      if (backup.data.budgets) {
        try {
          StorageAPI.utils.clear('budgets');
          backup.data.budgets.forEach(budget => {
            StorageAPI.budgets.save(budget);
            results.imported++;
          });
        } catch (error) {
          results.errors.push(`תקציבים: ${error.message}`);
        }
      }
      
      if (backup.data.accounts) {
        try {
          StorageAPI.utils.clear('accounts');
          backup.data.accounts.forEach(account => {
            StorageAPI.accounts.save(account);
            results.imported++;
          });
        } catch (error) {
          results.errors.push(`חשבונות: ${error.message}`);
        }
      }
      
      if (backup.data.settings) {
        try {
          StorageAPI.settings.update(backup.data.settings);
          results.imported++;
        } catch (error) {
          results.errors.push(`הגדרות: ${error.message}`);
        }
      }
      
      return {
        success: true,
        results,
        message: `יובאו בהצלחה ${results.imported} פריטים`
      };
      
    } catch (error) {
      return {
        success: false,
        error: `שגיאה בייבוא גיבוי: ${error.message}`
      };
    }
  }
  
  // Import transactions from CSV
  static async importTransactionsCSV(csvContent, options = {}) {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('קובץ CSV ריק או לא תקין');
      }
      
      const headers = this.parseCSVLine(lines[0]);
      const results = {
        imported: 0,
        skipped: 0,
        errors: []
      };
      
      // Get existing data for mapping
      const categories = StorageAPI.categories.getAll();
      const accounts = StorageAPI.accounts.getAll();
      
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.שם] = cat.id;
        categoryMap[cat.id] = cat.id;
      });
      
      const accountMap = {};
      accounts.forEach(acc => {
        accountMap[acc.שם] = acc.id;
        accountMap[acc.id] = acc.id;
      });
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          if (values.length !== headers.length) {
            results.errors.push(`שורה ${i + 1}: מספר עמודות לא תואם`);
            results.skipped++;
            continue;
          }
          
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });
          
          // Map CSV data to transaction model
          const transaction = this.mapCSVToTransaction(rowData, categoryMap, accountMap);
          
          if (transaction) {
            StorageAPI.transactions.save(transaction);
            results.imported++;
          } else {
            results.skipped++;
          }
          
        } catch (error) {
          results.errors.push(`שורה ${i + 1}: ${error.message}`);
          results.skipped++;
        }
      }
      
      return {
        success: true,
        results,
        message: `יובאו ${results.imported} עסקאות, דולגו ${results.skipped}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: `שגיאה בייבוא CSV: ${error.message}`
      };
    }
  }
  
  // Map CSV row to transaction object
  static mapCSVToTransaction(rowData, categoryMap, accountMap) {
    try {
      // Try different possible field mappings
      const dateFields = ['תאריך', 'date', 'תאריך פעולה', 'תאריך ערך'];
      const descFields = ['תיאור', 'description', 'פרטי הפעולה', 'תיאור הפעולה'];
      const amountFields = ['סכום', 'amount', 'זכות', 'חובה'];
      const categoryFields = ['קטגוריה', 'category'];
      const accountFields = ['חשבון', 'account'];
      
      const transaction = {
        תאריך: this.findFieldValue(rowData, dateFields),
        תיאור: this.findFieldValue(rowData, descFields),
        סכום: this.parseAmount(rowData, amountFields),
        קטגוריה: this.mapCategory(rowData, categoryFields, categoryMap),
        חשבון: this.mapAccount(rowData, accountFields, accountMap),
        סוג: 'הוצאה', // Default, will be determined by amount
        הערות: rowData['הערות'] || rowData['notes'] || '',
        מקור: 'import'
      };
      
      // Determine transaction type based on amount
      if (transaction.סכום > 0) {
        transaction.סוג = 'הכנסה';
      } else if (transaction.סכום < 0) {
        transaction.סוג = 'הוצאה';
      }
      
      // Validate required fields
      if (!transaction.תאריך || !transaction.תיאור || transaction.סכום === 0) {
        throw new Error('שדות חובה חסרים');
      }
      
      return transaction;
      
    } catch (error) {
      console.error('Error mapping CSV row:', error);
      return null;
    }
  }
  
  // Helper methods for CSV import
  static parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }
  
  static findFieldValue(rowData, possibleFields) {
    for (const field of possibleFields) {
      if (rowData[field] !== undefined && rowData[field] !== '') {
        return rowData[field];
      }
    }
    return '';
  }
  
  static parseAmount(rowData, amountFields) {
    // Try to find amount in different fields
    for (const field of amountFields) {
      if (rowData[field] !== undefined && rowData[field] !== '') {
        let amount = parseFloat(rowData[field].toString().replace(/[^\d.-]/g, ''));
        
        // Handle debit/credit columns
        if (field === 'חובה' && !isNaN(amount)) {
          amount = -Math.abs(amount);
        }
        
        if (!isNaN(amount)) {
          return amount;
        }
      }
    }
    return 0;
  }
  
  static mapCategory(rowData, categoryFields, categoryMap) {
    const categoryName = this.findFieldValue(rowData, categoryFields);
    return categoryMap[categoryName] || null;
  }
  
  static mapAccount(rowData, accountFields, accountMap) {
    const accountName = this.findFieldValue(rowData, accountFields);
    return accountMap[accountName] || null;
  }
}

// Public API
export const DataBackup = {
  // Export functions
  exportAll: () => DataExporter.exportFullBackup(),
  exportTransactions: (dateRange) => DataExporter.exportTransactionsCSV(dateRange),
  exportCategories: () => DataExporter.exportCategoriesCSV(),
  exportForBank: (format) => DataExporter.exportForBanks(format),
  
  // Import functions
  importBackup: (jsonContent) => DataImporter.importFullBackup(jsonContent),
  importTransactions: (csvContent, options) => DataImporter.importTransactionsCSV(csvContent, options),
  
  // Utility functions
  download: (exportResult) => DataExporter.downloadFile(exportResult),
  
  // Supported formats
  supportedFormats: {
    export: ['json', 'csv'],
    bankFormats: ['generic', 'hapoalim', 'leumi', 'mizrahi'],
    import: ['json', 'csv']
  }
};

export default DataBackup;