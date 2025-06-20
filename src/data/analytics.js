/**
 * Data Analytics and Search System for Israeli Personal Finance Dashboard
 * Hebrew text search, filtering, and financial calculations
 */

import StorageAPI from './storage.js';
import { formatters } from './models.js';

// Hebrew text search utilities
export class HebrewSearch {
  
  // Normalize Hebrew text for search (remove nikud, handle variations)
  static normalizeHebrew(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      // Remove nikud (Hebrew diacritics)
      .replace(/[\u0591-\u05C7]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  
  // Search Hebrew text with fuzzy matching
  static searchHebrewText(text, query) {
    if (!text || !query) return false;
    
    const normalizedText = this.normalizeHebrew(text);
    const normalizedQuery = this.normalizeHebrew(query);
    
    // Exact match
    if (normalizedText.includes(normalizedQuery)) {
      return true;
    }
    
    // Word-by-word match
    const textWords = normalizedText.split(' ');
    const queryWords = normalizedQuery.split(' ');
    
    return queryWords.every(queryWord => 
      textWords.some(textWord => textWord.includes(queryWord))
    );
  }
  
  // Search with multiple criteria
  static multiFieldSearch(item, query, fields) {
    if (!query) return true;
    
    return fields.some(field => {
      const value = item[field];
      if (value === undefined || value === null) return false;
      
      return this.searchHebrewText(value.toString(), query);
    });
  }
}

// Data filtering utilities
export class DataFilter {
  
  // Filter transactions by multiple criteria
  static filterTransactions(criteria = {}) {
    let transactions = StorageAPI.transactions.getAll();
    
    // Text search
    if (criteria.search) {
      transactions = transactions.filter(txn => 
        HebrewSearch.multiFieldSearch(txn, criteria.search, ['תיאור', 'הערות'])
      );
    }
    
    // Date range
    if (criteria.dateFrom || criteria.dateTo) {
      transactions = transactions.filter(txn => {
        const txnDate = new Date(txn.תאריך);
        
        if (criteria.dateFrom && txnDate < new Date(criteria.dateFrom)) {
          return false;
        }
        
        if (criteria.dateTo && txnDate > new Date(criteria.dateTo)) {
          return false;
        }
        
        return true;
      });
    }
    
    // Amount range
    if (criteria.amountMin !== undefined || criteria.amountMax !== undefined) {
      transactions = transactions.filter(txn => {
        const amount = Math.abs(txn.סכום);
        
        if (criteria.amountMin !== undefined && amount < criteria.amountMin) {
          return false;
        }
        
        if (criteria.amountMax !== undefined && amount > criteria.amountMax) {
          return false;
        }
        
        return true;
      });
    }
    
    // Category filter
    if (criteria.categories && criteria.categories.length > 0) {
      transactions = transactions.filter(txn => 
        criteria.categories.includes(txn.קטגוריה)
      );
    }
    
    // Account filter
    if (criteria.accounts && criteria.accounts.length > 0) {
      transactions = transactions.filter(txn => 
        criteria.accounts.includes(txn.חשבון)
      );
    }
    
    // Transaction type filter
    if (criteria.types && criteria.types.length > 0) {
      transactions = transactions.filter(txn => 
        criteria.types.includes(txn.סוג)
      );
    }
    
    // Tags filter
    if (criteria.tags && criteria.tags.length > 0) {
      transactions = transactions.filter(txn => 
        txn.תגיות && txn.תגיות.some(tag => criteria.tags.includes(tag))
      );
    }
    
    return transactions;
  }
  
  // Filter categories
  static filterCategories(criteria = {}) {
    let categories = StorageAPI.categories.getAll();
    
    // Text search
    if (criteria.search) {
      categories = categories.filter(cat => 
        HebrewSearch.searchHebrewText(cat.שם, criteria.search)
      );
    }
    
    // Type filter
    if (criteria.type) {
      categories = categories.filter(cat => cat.סוג === criteria.type);
    }
    
    // Active filter
    if (criteria.active !== undefined) {
      categories = categories.filter(cat => cat.אקטיבי === criteria.active);
    }
    
    return categories;
  }
  
  // Filter accounts
  static filterAccounts(criteria = {}) {
    let accounts = StorageAPI.accounts.getAll();
    
    // Text search
    if (criteria.search) {
      accounts = accounts.filter(acc => 
        HebrewSearch.multiFieldSearch(acc, criteria.search, ['שם', 'בנק'])
      );
    }
    
    // Type filter
    if (criteria.type) {
      accounts = accounts.filter(acc => acc.סוג === criteria.type);
    }
    
    // Active filter
    if (criteria.active !== undefined) {
      accounts = accounts.filter(acc => acc.אקטיבי === criteria.active);
    }
    
    return accounts;
  }
}

// Financial calculations and aggregations
export class FinancialAnalytics {
  
  // Calculate total income, expenses, and balance
  static calculateTotals(transactions = null) {
    if (!transactions) {
      transactions = StorageAPI.transactions.getAll();
    }
    
    const totals = {
      הכנסות: 0,
      הוצאות: 0,
      יתרה: 0,
      מספר_עסקאות: transactions.length
    };
    
    transactions.forEach(txn => {
      if (txn.סוג === 'הכנסה' || txn.סכום > 0) {
        totals.הכנסות += Math.abs(txn.סכום);
      } else if (txn.סוג === 'הוצאה' || txn.סכום < 0) {
        totals.הוצאות += Math.abs(txn.סכום);
      }
    });
    
    totals.יתרה = totals.הכנסות - totals.הוצאות;
    
    return totals;
  }
  
  // Calculate spending by category
  static calculateByCategory(transactions = null) {
    if (!transactions) {
      transactions = StorageAPI.transactions.getAll();
    }
    
    const categories = StorageAPI.categories.getAll();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = {
        id: cat.id,
        שם: cat.שם,
        צבע: cat.צבע,
        אייקון: cat.אייקון,
        סכום: 0,
        מספר_עסקאות: 0
      };
    });
    
    transactions.forEach(txn => {
      if (categoryMap[txn.קטגוריה]) {
        categoryMap[txn.קטגוריה].סכום += Math.abs(txn.סכום);
        categoryMap[txn.קטגוריה].מספר_עסקאות++;
      }
    });
    
    return Object.values(categoryMap)
      .filter(cat => cat.סכום > 0)
      .sort((a, b) => b.סכום - a.סכום);
  }
  
  // Calculate spending by account
  static calculateByAccount(transactions = null) {
    if (!transactions) {
      transactions = StorageAPI.transactions.getAll();
    }
    
    const accounts = StorageAPI.accounts.getAll();
    const accountMap = {};
    accounts.forEach(acc => {
      accountMap[acc.id] = {
        id: acc.id,
        שם: acc.שם,
        סוג: acc.סוג,
        צבע: acc.צבע,
        סכום: 0,
        מספר_עסקאות: 0
      };
    });
    
    transactions.forEach(txn => {
      if (accountMap[txn.חשבון]) {
        accountMap[txn.חשבון].סכום += Math.abs(txn.סכום);
        accountMap[txn.חשבון].מספר_עסקאות++;
      }
    });
    
    return Object.values(accountMap)
      .filter(acc => acc.סכום > 0)
      .sort((a, b) => b.סכום - a.סכום);
  }
  
  // Calculate monthly trends
  static calculateMonthlyTrends(monthsBack = 12) {
    const transactions = StorageAPI.transactions.getAll();
    const now = new Date();
    const trends = [];
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.תאריך);
        return txnDate >= monthStart && txnDate <= monthEnd;
      });
      
      const monthTotals = this.calculateTotals(monthTransactions);
      
      trends.push({
        חודש: monthDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' }),
        שנה: monthDate.getFullYear(),
        מספר_חודש: monthDate.getMonth() + 1,
        ...monthTotals
      });
    }
    
    return trends;
  }
  
  // Calculate budget performance
  static calculateBudgetPerformance() {
    const budgets = StorageAPI.budgets.getActive();
    const results = [];
    
    budgets.forEach(budget => {
      const budgetTransactions = StorageAPI.transactions.getByDateRange(
        budget.תקופה.start,
        budget.תקופה.end
      );
      
      const spent = budgetTransactions
        .filter(txn => txn.סוג === 'הוצאה')
        .reduce((sum, txn) => sum + Math.abs(txn.סכום), 0);
      
      const progress = budget.getProgress();
      progress.spent = spent;
      
      results.push({
        budget,
        progress,
        transactions: budgetTransactions.length
      });
    });
    
    return results;
  }
  
  // Calculate savings rate
  static calculateSavingsRate(periodDays = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const transactions = StorageAPI.transactions.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    const totals = this.calculateTotals(transactions);
    const savingsRate = totals.הכנסות > 0 ? (totals.יתרה / totals.הכנסות) * 100 : 0;
    
    return {
      תקופה: periodDays,
      הכנסות: totals.הכנסות,
      הוצאות: totals.הוצאות,
      חיסכון: totals.יתרה,
      שיעור_חיסכון: Math.round(savingsRate * 100) / 100,
      הערכה: savingsRate > 20 ? 'מעולה' : savingsRate > 10 ? 'טוב' : savingsRate > 0 ? 'בסיסי' : 'דורש שיפור'
    };
  }
  
  // Calculate expense patterns
  static calculateExpensePatterns() {
    const transactions = StorageAPI.transactions.getAll()
      .filter(txn => txn.סוג === 'הוצאה');
    
    // Daily pattern
    const dailyPattern = Array(7).fill(0);
    const dailyNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    
    // Monthly pattern
    const monthlyPattern = Array(12).fill(0);
    const monthlyNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    
    transactions.forEach(txn => {
      const date = new Date(txn.תאריך);
      dailyPattern[date.getDay()] += Math.abs(txn.סכום);
      monthlyPattern[date.getMonth()] += Math.abs(txn.סכום);
    });
    
    return {
      יומי: dailyPattern.map((amount, index) => ({
        יום: dailyNames[index],
        סכום: amount
      })),
      חודשי: monthlyPattern.map((amount, index) => ({
        חודש: monthlyNames[index],
        סכום: amount
      }))
    };
  }
  
  // Top spending categories
  static getTopSpendingCategories(limit = 5) {
    const categorySpending = this.calculateByCategory();
    return categorySpending.slice(0, limit);
  }
  
  // Recent transactions summary
  static getRecentTransactionsSummary(days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const recentTransactions = StorageAPI.transactions.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    const totals = this.calculateTotals(recentTransactions);
    const categories = this.calculateByCategory(recentTransactions);
    
    return {
      תקופה: days,
      סיכום: totals,
      קטגוריות: categories.slice(0, 5),
      עסקאות_אחרונות: recentTransactions
        .sort((a, b) => new Date(b.תאריך) - new Date(a.תאריך))
        .slice(0, 10)
    };
  }
}

// Search and Analytics API
export const SearchAPI = {
  // Search functions
  search: {
    transactions: (query, additionalFilters = {}) => {
      return DataFilter.filterTransactions({ search: query, ...additionalFilters });
    },
    
    categories: (query) => {
      return DataFilter.filterCategories({ search: query });
    },
    
    accounts: (query) => {
      return DataFilter.filterAccounts({ search: query });
    },
    
    all: (query) => {
      return {
        transactions: DataFilter.filterTransactions({ search: query }),
        categories: DataFilter.filterCategories({ search: query }),
        accounts: DataFilter.filterAccounts({ search: query })
      };
    }
  },
  
  // Filter functions
  filter: {
    transactions: (criteria) => DataFilter.filterTransactions(criteria),
    categories: (criteria) => DataFilter.filterCategories(criteria),
    accounts: (criteria) => DataFilter.filterAccounts(criteria)
  },
  
  // Analytics functions
  analytics: {
    totals: (transactions) => FinancialAnalytics.calculateTotals(transactions),
    byCategory: (transactions) => FinancialAnalytics.calculateByCategory(transactions),
    byAccount: (transactions) => FinancialAnalytics.calculateByAccount(transactions),
    monthlyTrends: (months) => FinancialAnalytics.calculateMonthlyTrends(months),
    budgetPerformance: () => FinancialAnalytics.calculateBudgetPerformance(),
    savingsRate: (days) => FinancialAnalytics.calculateSavingsRate(days),
    expensePatterns: () => FinancialAnalytics.calculateExpensePatterns(),
    topCategories: (limit) => FinancialAnalytics.getTopSpendingCategories(limit),
    recentSummary: (days) => FinancialAnalytics.getRecentTransactionsSummary(days)
  },
  
  // Utility functions
  utils: {
    normalizeHebrew: (text) => HebrewSearch.normalizeHebrew(text),
    formatCurrency: (amount) => formatters.currency(amount),
    formatDate: (date) => formatters.date(date)
  }
};

export default SearchAPI;