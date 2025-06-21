// Device Synchronization Manager for Personal Finance Dashboard
// Hebrew-native sync utility for cross-device data synchronization

export class DeviceSyncManager {
    constructor() {
        this.deviceId = this.getOrCreateDeviceId();
        this.syncEndpoint = null; // For future server-based sync
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
        this.syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        this.conflictResolver = new ConflictResolver();
        
        // Initialize automatic sync checking
        this.initializeAutoSync();
    }
    
    // Generate or retrieve unique device ID
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
    
    // Initialize automatic sync checking
    initializeAutoSync() {
        // Check for sync every 5 minutes when online
        this.syncInterval = setInterval(() => {
            if (navigator.onLine) {
                this.checkForPendingSync();
            }
        }, 5 * 60 * 1000);
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            this.handleOnline();
        });
        
        // Queue changes when going offline
        window.addEventListener('offline', () => {
            this.handleOffline();
        });
        
        // Sync before page unload
        window.addEventListener('beforeunload', () => {
            this.queueCurrentData();
        });
    }
    
    // Handle coming back online
    async handleOnline() {
        console.log('📶 חזרה לחיבור לאינטרנט - בדיקת סנכרון');
        await this.processOfflineQueue();
        await this.checkForRemoteUpdates();
    }
    
    // Handle going offline
    handleOffline() {
        console.log('📴 חיבור לאינטרנט אבד - מעבר למצב אופליין');
        this.queueCurrentData();
    }
    
    // Generate sync data for export
    async generateSyncData() {
        try {
            const { DataManager } = await import('../data/index.js');
            
            const syncData = {
                deviceId: this.deviceId,
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: {
                    transactions: await DataManager.getAllTransactions(),
                    categories: await DataManager.getCategories(),
                    accounts: await DataManager.getAccounts(),
                    settings: await DataManager.getSettings()
                },
                metadata: {
                    totalTransactions: (await DataManager.getAllTransactions()).length,
                    totalCategories: (await DataManager.getCategories()).length,
                    totalAccounts: (await DataManager.getAccounts()).length,
                    lastModified: localStorage.getItem('lastDataModification') || new Date().toISOString()
                }
            };
            
            return syncData;
        } catch (error) {
            console.error('Failed to generate sync data:', error);
            throw new Error('שגיאה ביצירת נתוני סנכרון');
        }
    }
    
    // Export data for manual sync
    async exportForSync() {
        try {
            const syncData = await this.generateSyncData();
            
            const blob = new Blob([JSON.stringify(syncData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance-sync-${this.deviceId}-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            // Update last sync time
            this.updateLastSyncTime();
            
            return {
                success: true,
                message: 'קובץ סנכרון יוצא בהצלחה',
                filename: a.download
            };
            
        } catch (error) {
            console.error('Export for sync failed:', error);
            return {
                success: false,
                message: 'שגיאה בייצוא נתונים לסנכרון',
                error: error.message
            };
        }
    }
    
    // Import and merge sync data
    async importSyncData(file) {
        try {
            const text = await this.readFileAsText(file);
            const syncData = JSON.parse(text);
            
            // Validate sync data format
            const validation = this.validateSyncData(syncData);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            
            // Detect and resolve conflicts
            const conflicts = await this.detectConflicts(syncData);
            if (conflicts.length > 0) {
                const resolution = await this.showConflictResolutionDialog(conflicts);
                if (!resolution.proceed) {
                    return { success: false, message: 'סנכרון בוטל על ידי המשתמש' };
                }
                syncData.data = await this.applyConflictResolution(syncData.data, resolution.choices);
            }
            
            // Merge data
            const mergeResult = await this.mergeData(syncData.data);
            
            // Update last sync time
            this.updateLastSyncTime();
            
            return {
                success: true,
                message: 'סנכרון הושלם בהצלחה',
                stats: mergeResult.stats,
                conflicts: conflicts.length
            };
            
        } catch (error) {
            console.error('Import sync data failed:', error);
            return {
                success: false,
                message: 'שגיאה בייבוא נתוני סנכרון',
                error: error.message
            };
        }
    }
    
    // Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
            reader.readAsText(file);
        });
    }
    
    // Validate sync data format
    validateSyncData(syncData) {
        const required = ['deviceId', 'timestamp', 'version', 'data'];
        const missing = required.filter(field => !syncData[field]);
        
        if (missing.length > 0) {
            return {
                isValid: false,
                error: `שדות חסרים בקובץ הסנכרון: ${missing.join(', ')}`
            };
        }
        
        if (!syncData.data.transactions || !Array.isArray(syncData.data.transactions)) {
            return {
                isValid: false,
                error: 'נתוני עסקאות לא תקינים בקובץ הסנכרון'
            };
        }
        
        return { isValid: true };
    }
    
    // Detect conflicts between local and imported data
    async detectConflicts(syncData) {
        try {
            const { DataManager } = await import('../data/index.js');
            const localTransactions = await DataManager.getAllTransactions();
            const importedTransactions = syncData.data.transactions;
            
            const conflicts = [];
            
            // Check for transaction conflicts (same ID, different data)
            importedTransactions.forEach(importedTx => {
                const localTx = localTransactions.find(tx => tx.id === importedTx.id);
                if (localTx && !this.areTransactionsEqual(localTx, importedTx)) {
                    conflicts.push({
                        type: 'transaction',
                        id: importedTx.id,
                        local: localTx,
                        imported: importedTx,
                        description: `עסקה "${localTx.description}" שונה בין המכשירים`
                    });
                }
            });
            
            // Check for category conflicts
            const localCategories = await DataManager.getCategories();
            const importedCategories = syncData.data.categories;
            
            importedCategories.forEach(importedCat => {
                const localCat = localCategories.find(cat => cat.id === importedCat.id);
                if (localCat && !this.areCategoriesEqual(localCat, importedCat)) {
                    conflicts.push({
                        type: 'category',
                        id: importedCat.id,
                        local: localCat,
                        imported: importedCat,
                        description: `קטגוריה "${localCat.name}" שונה בין המכשירים`
                    });
                }
            });
            
            return conflicts;
            
        } catch (error) {
            console.error('Error detecting conflicts:', error);
            return [];
        }
    }
    
    // Compare transactions for equality
    areTransactionsEqual(tx1, tx2) {
        const compareFields = ['amount', 'description', 'category', 'date', 'type'];
        return compareFields.every(field => tx1[field] === tx2[field]);
    }
    
    // Compare categories for equality
    areCategoriesEqual(cat1, cat2) {
        const compareFields = ['name', 'type', 'color', 'icon'];
        return compareFields.every(field => cat1[field] === cat2[field]);
    }
    
    // Show conflict resolution dialog
    async showConflictResolutionDialog(conflicts) {
        return new Promise((resolve) => {
            // Create modal for conflict resolution
            import('./Modal.js').then(({ Modal }) => {
                const modalContainer = document.createElement('div');
                const modal = new Modal(modalContainer, {
                    title: 'פתרון קונפליקטים בסנכרון',
                    size: 'large',
                    onClose: () => {
                        modalContainer.remove();
                        resolve({ proceed: false });
                    }
                });

                const content = `
                    <div class="conflict-resolution-dialog">
                        <div class="conflict-explanation">
                            <p>נמצאו ${conflicts.length} קונפליקטים בנתונים בין המכשירים.</p>
                            <p>בחר איך לפתור כל קונפליקט:</p>
                        </div>
                        
                        <div class="conflicts-list">
                            ${conflicts.map((conflict, index) => `
                                <div class="conflict-item" data-conflict-index="${index}">
                                    <div class="conflict-header">
                                        <strong>${conflict.description}</strong>
                                    </div>
                                    
                                    <div class="conflict-options">
                                        <div class="conflict-option">
                                            <input type="radio" 
                                                   id="local-${index}" 
                                                   name="conflict-${index}" 
                                                   value="local" 
                                                   checked>
                                            <label for="local-${index}">
                                                <strong>שמור מקומי</strong>
                                                <div class="option-details">
                                                    ${this.formatConflictData(conflict.local, conflict.type)}
                                                </div>
                                            </label>
                                        </div>
                                        
                                        <div class="conflict-option">
                                            <input type="radio" 
                                                   id="imported-${index}" 
                                                   name="conflict-${index}" 
                                                   value="imported">
                                            <label for="imported-${index}">
                                                <strong>שמור מיובא</strong>
                                                <div class="option-details">
                                                    ${this.formatConflictData(conflict.imported, conflict.type)}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="dialog-actions">
                            <button type="button" class="btn-primary resolve-conflicts">פתור קונפליקטים</button>
                            <button type="button" class="btn-secondary cancel-sync">ביטול סנכרון</button>
                        </div>
                    </div>
                `;

                modal.setContent(content);
                modal.open();
                document.body.appendChild(modalContainer);
                
                // Bind events
                modalContainer.querySelector('.resolve-conflicts').addEventListener('click', () => {
                    const choices = conflicts.map((_, index) => {
                        const selected = modalContainer.querySelector(`input[name="conflict-${index}"]:checked`);
                        return selected ? selected.value : 'local';
                    });
                    
                    modal.close();
                    resolve({ proceed: true, choices });
                });
                
                modalContainer.querySelector('.cancel-sync').addEventListener('click', () => {
                    modal.close();
                    resolve({ proceed: false });
                });
                
            }).catch(() => {
                resolve({ proceed: false });
            });
        });
    }
    
    // Format conflict data for display
    formatConflictData(data, type) {
        if (type === 'transaction') {
            return `
                <div class="conflict-data">
                    <div>סכום: ${this.formatCurrency(data.amount)}</div>
                    <div>תיאור: ${data.description}</div>
                    <div>תאריך: ${data.date}</div>
                </div>
            `;
        } else if (type === 'category') {
            return `
                <div class="conflict-data">
                    <div>שם: ${data.name}</div>
                    <div>סוג: ${data.type === 'expense' ? 'הוצאה' : 'הכנסה'}</div>
                    <div>צבע: <span style="color: ${data.color}">${data.color}</span></div>
                </div>
            `;
        }
        return JSON.stringify(data);
    }
    
    // Format currency for display
    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    }
    
    // Apply conflict resolution choices
    async applyConflictResolution(importedData, choices) {
        try {
            const { DataManager } = await import('../data/index.js');
            const resolvedData = { ...importedData };
            
            // Get current conflicts
            const conflicts = await this.detectConflicts({ data: importedData });
            
            choices.forEach((choice, index) => {
                const conflict = conflicts[index];
                if (!conflict) return;
                
                if (choice === 'local') {
                    // Keep local version - remove from imported data
                    if (conflict.type === 'transaction') {
                        resolvedData.transactions = resolvedData.transactions.filter(tx => tx.id !== conflict.id);
                    } else if (conflict.type === 'category') {
                        resolvedData.categories = resolvedData.categories.filter(cat => cat.id !== conflict.id);
                    }
                } else {
                    // Keep imported version - it's already in the data
                    // No action needed
                }
            });
            
            return resolvedData;
            
        } catch (error) {
            console.error('Error applying conflict resolution:', error);
            throw error;
        }
    }
    
    // Merge imported data with local data
    async mergeData(importedData) {
        try {
            const { DataManager } = await import('../data/index.js');
            
            const stats = {
                transactionsAdded: 0,
                transactionsUpdated: 0,
                categoriesAdded: 0,
                categoriesUpdated: 0,
                accountsAdded: 0,
                accountsUpdated: 0
            };
            
            // Merge transactions
            for (const transaction of importedData.transactions) {
                try {
                    const existing = await DataManager.getTransaction(transaction.id);
                    if (existing) {
                        await DataManager.updateTransaction(transaction.id, transaction);
                        stats.transactionsUpdated++;
                    } else {
                        await DataManager.addTransaction(transaction);
                        stats.transactionsAdded++;
                    }
                } catch (error) {
                    // Transaction doesn't exist, add it
                    await DataManager.addTransaction(transaction);
                    stats.transactionsAdded++;
                }
            }
            
            // Merge categories
            for (const category of importedData.categories) {
                try {
                    const existing = await DataManager.getCategory(category.id);
                    if (existing) {
                        await DataManager.updateCategory(category.id, category);
                        stats.categoriesUpdated++;
                    } else {
                        await DataManager.addCategory(category);
                        stats.categoriesAdded++;
                    }
                } catch (error) {
                    // Category doesn't exist, add it
                    await DataManager.addCategory(category);
                    stats.categoriesAdded++;
                }
            }
            
            // Merge accounts
            for (const account of importedData.accounts) {
                try {
                    const existing = await DataManager.getAccount(account.id);
                    if (existing) {
                        await DataManager.updateAccount(account.id, account);
                        stats.accountsUpdated++;
                    } else {
                        await DataManager.addAccount(account);
                        stats.accountsAdded++;
                    }
                } catch (error) {
                    // Account doesn't exist, add it
                    await DataManager.addAccount(account);
                    stats.accountsAdded++;
                }
            }
            
            // Update settings (merge rather than replace)
            if (importedData.settings) {
                const currentSettings = await DataManager.getSettings();
                const mergedSettings = { ...currentSettings, ...importedData.settings };
                await DataManager.updateSettings(mergedSettings);
            }
            
            return { success: true, stats };
            
        } catch (error) {
            console.error('Error merging data:', error);
            throw error;
        }
    }
    
    // Queue current data for sync
    queueCurrentData() {
        const queueItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: 'full_backup',
            deviceId: this.deviceId
        };
        
        this.syncQueue.push(queueItem);
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }
    
    // Process offline queue when coming back online
    async processOfflineQueue() {
        if (this.syncQueue.length === 0) return;
        
        console.log(`📤 מעבד ${this.syncQueue.length} פריטים בתור הסנכרון`);
        
        // For now, just clear the queue since we don't have a server
        // In a real implementation, this would send queued changes to server
        this.syncQueue = [];
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }
    
    // Check for remote updates
    async checkForRemoteUpdates() {
        // Placeholder for future server-based sync
        console.log('🔍 בודק עדכונים מרוחקים...');
        
        // For now, we only support manual file-based sync
        return { hasUpdates: false };
    }
    
    // Check for pending sync operations
    checkForPendingSync() {
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime) : null;
        const now = new Date();
        const hoursSinceLastSync = lastSync ? (now - lastSync) / (1000 * 60 * 60) : Infinity;
        
        // Suggest sync if more than 24 hours since last sync
        if (hoursSinceLastSync > 24) {
            this.showSyncReminder();
        }
    }
    
    // Show sync reminder
    showSyncReminder() {
        if (window.showToast) {
            window.showToast('💡 מומלץ לבצע סנכרון נתונים - לא בוצע סנכרון ב-24 השעות האחרונות', 'info');
        }
    }
    
    // Update last sync time
    updateLastSyncTime() {
        this.lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', this.lastSyncTime);
    }
    
    // Get sync status
    getSyncStatus() {
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime) : null;
        const queueCount = this.syncQueue.length;
        const isOnline = navigator.onLine;
        
        return {
            deviceId: this.deviceId,
            lastSyncTime: this.lastSyncTime,
            lastSyncFormatted: lastSync ? lastSync.toLocaleString('he-IL') : 'מעולם',
            queueCount,
            isOnline,
            needsSync: !lastSync || queueCount > 0
        };
    }
    
    // Clean up resources
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
    }
}

// Conflict resolution utility
class ConflictResolver {
    constructor() {
        this.strategies = {
            'newest_wins': this.newestWins.bind(this),
            'manual': this.manualResolution.bind(this),
            'merge': this.mergeStrategy.bind(this)
        };
    }
    
    newestWins(local, imported) {
        const localDate = new Date(local.updatedAt || local.createdAt);
        const importedDate = new Date(imported.updatedAt || imported.createdAt);
        return importedDate > localDate ? imported : local;
    }
    
    manualResolution(local, imported) {
        // Return both for manual selection
        return { requiresManualSelection: true, local, imported };
    }
    
    mergeStrategy(local, imported) {
        // Simple merge strategy - prefer imported for most fields
        return { ...local, ...imported, updatedAt: new Date().toISOString() };
    }
}

// Create and export singleton instance
export const deviceSync = new DeviceSyncManager();
export default deviceSync;