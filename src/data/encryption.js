/**
 * Data Encryption System for Israeli Personal Finance Dashboard
 * Client-side encryption for sensitive financial information
 */

// Simple encryption for client-side data protection
// Note: This is basic encryption suitable for localStorage protection
// For production use, consider more robust encryption libraries

class SimpleEncryption {
  constructor(key = null) {
    this.key = key || this.generateKey();
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  // Generate a simple key based on user session
  generateKey() {
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36);
    return btoa(userAgent + timestamp + random).slice(0, 32);
  }

  // Simple XOR encryption (suitable for localStorage)
  encrypt(text) {
    if (!text) return text;
    
    try {
      const textBytes = this.encoder.encode(text);
      const keyBytes = this.encoder.encode(this.key);
      const encrypted = new Uint8Array(textBytes.length);
      
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Return original text if encryption fails
    }
  }

  // Simple XOR decryption
  decrypt(encryptedText) {
    if (!encryptedText) return encryptedText;
    
    try {
      // Convert from base64
      const encrypted = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );
      
      const keyBytes = this.encoder.encode(this.key);
      const decrypted = new Uint8Array(encrypted.length);
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return this.decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Return encrypted text if decryption fails
    }
  }
}

// Encryption manager for financial data
export class DataEncryption {
  constructor() {
    this.encryption = new SimpleEncryption();
    this.isEnabled = this.getEncryptionSetting();
    
    // Fields that should be encrypted
    this.sensitiveFields = {
      accounts: ['מספר_חשבון', 'יתרה'],
      transactions: ['הערות'], // Only notes for privacy
      settings: [] // Settings don't contain sensitive data
    };
  }

  // Get encryption setting from localStorage
  getEncryptionSetting() {
    try {
      const settings = JSON.parse(localStorage.getItem('pf_settings') || '{}');
      return settings.הצפנה !== false; // Default to true
    } catch {
      return true; // Default to encrypted
    }
  }

  // Enable/disable encryption
  setEncryptionEnabled(enabled) {
    this.isEnabled = enabled;
    
    // Update settings
    try {
      const settings = JSON.parse(localStorage.getItem('pf_settings') || '{}');
      settings.הצפנה = enabled;
      settings.עודכן = new Date().toISOString();
      localStorage.setItem('pf_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to update encryption setting:', error);
    }
  }

  // Encrypt sensitive data before storage
  encryptData(data, dataType) {
    if (!this.isEnabled || !data) {
      return data;
    }

    try {
      const sensitiveFieldsForType = this.sensitiveFields[dataType] || [];
      
      if (Array.isArray(data)) {
        // Handle arrays (multiple items)
        return data.map(item => this.encryptObject(item, sensitiveFieldsForType));
      } else {
        // Handle single object
        return this.encryptObject(data, sensitiveFieldsForType);
      }
    } catch (error) {
      console.error('Data encryption error:', error);
      return data; // Return original data if encryption fails
    }
  }

  // Decrypt sensitive data after retrieval
  decryptData(data, dataType) {
    if (!this.isEnabled || !data) {
      return data;
    }

    try {
      const sensitiveFieldsForType = this.sensitiveFields[dataType] || [];
      
      if (Array.isArray(data)) {
        // Handle arrays (multiple items)
        return data.map(item => this.decryptObject(item, sensitiveFieldsForType));
      } else {
        // Handle single object
        return this.decryptObject(data, sensitiveFieldsForType);
      }
    } catch (error) {
      console.error('Data decryption error:', error);
      return data; // Return encrypted data if decryption fails
    }
  }

  // Encrypt specific fields in an object
  encryptObject(obj, sensitiveFields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const encrypted = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field] !== undefined && encrypted[field] !== null) {
        encrypted[field] = this.encryption.encrypt(encrypted[field].toString());
      }
    });

    return encrypted;
  }

  // Decrypt specific fields in an object
  decryptObject(obj, sensitiveFields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const decrypted = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] !== undefined && decrypted[field] !== null) {
        const decryptedValue = this.encryption.decrypt(decrypted[field]);
        
        // Try to convert back to number if it was originally a number
        if (field === 'יתרה' || field === 'מספר_חשבון') {
          const numValue = parseFloat(decryptedValue);
          if (!isNaN(numValue) && field === 'יתרה') {
            decrypted[field] = numValue;
          } else {
            decrypted[field] = decryptedValue;
          }
        } else {
          decrypted[field] = decryptedValue;
        }
      }
    });

    return decrypted;
  }

  // Secure deletion of sensitive data
  secureDelete(key) {
    try {
      // Overwrite with random data before deletion
      const randomData = Array(1024).fill(0).map(() => Math.random().toString(36)).join('');
      localStorage.setItem(key, randomData);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Secure deletion error:', error);
      return false;
    }
  }

  // Encrypt export data
  encryptExportData(data) {
    if (!this.isEnabled) {
      return data;
    }

    try {
      return this.encryption.encrypt(JSON.stringify(data));
    } catch (error) {
      console.error('Export encryption error:', error);
      return data;
    }
  }

  // Decrypt import data
  decryptImportData(encryptedData) {
    if (!this.isEnabled) {
      return encryptedData;
    }

    try {
      const decrypted = this.encryption.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Import decryption error:', error);
      // Try to parse as regular JSON if decryption fails
      try {
        return JSON.parse(encryptedData);
      } catch {
        throw new Error('לא ניתן לפענח את הנתונים - ייתכן שהם לא מוצפנים או פגומים');
      }
    }
  }

  // Generate encryption report
  getEncryptionStatus() {
    return {
      enabled: this.isEnabled,
      keyGenerated: !!this.encryption.key,
      sensitiveFields: this.sensitiveFields,
      lastUpdate: new Date().toISOString(),
      message: this.isEnabled ? 
        'הצפנה פעילה - נתונים רגישים מוצפנים בזיכרון המקומי' : 
        'הצפנה לא פעילה - נתונים נשמרים בטקסט גלוי'
    };
  }

  // Migration helper for enabling/disabling encryption
  async migrateEncryption(enable) {
    try {
      const storageKeys = ['pf_transactions', 'pf_categories', 'pf_budgets', 'pf_accounts'];
      const results = {
        migrated: 0,
        errors: []
      };

      for (const key of storageKeys) {
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;

          const parsed = JSON.parse(data);
          const dataType = key.replace('pf_', '');
          
          let processedData;
          if (enable) {
            // Encrypt data
            processedData = this.encryptData(parsed, dataType);
          } else {
            // Decrypt data
            processedData = this.decryptData(parsed, dataType);
          }

          localStorage.setItem(key, JSON.stringify(processedData));
          results.migrated++;
        } catch (error) {
          results.errors.push(`${key}: ${error.message}`);
        }
      }

      // Update encryption setting
      this.setEncryptionEnabled(enable);

      return {
        success: true,
        results,
        message: enable ? 
          `הוצפנו בהצלחה ${results.migrated} קבצי נתונים` : 
          `בוטלה הצפנה עבור ${results.migrated} קבצי נתונים`
      };
    } catch (error) {
      return {
        success: false,
        error: `שגיאה במעבר הצפנה: ${error.message}`
      };
    }
  }
}

// Singleton instance
const dataEncryption = new DataEncryption();

// Public API
export const EncryptionAPI = {
  // Encryption management
  isEnabled: () => dataEncryption.isEnabled,
  enable: () => dataEncryption.migrateEncryption(true),
  disable: () => dataEncryption.migrateEncryption(false),
  
  // Data processing
  encrypt: (data, type) => dataEncryption.encryptData(data, type),
  decrypt: (data, type) => dataEncryption.decryptData(data, type),
  
  // Export/Import security
  encryptForExport: (data) => dataEncryption.encryptExportData(data),
  decryptFromImport: (data) => dataEncryption.decryptImportData(data),
  
  // Utility
  secureDelete: (key) => dataEncryption.secureDelete(key),
  getStatus: () => dataEncryption.getEncryptionStatus(),
  
  // Settings
  updateSetting: (enabled) => dataEncryption.setEncryptionEnabled(enabled)
};

export default EncryptionAPI;