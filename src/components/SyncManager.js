// Sync Manager Component for Device Synchronization
// Hebrew-native interface for managing data sync between devices

export class SyncManager {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showStatus: true,
            showControls: true,
            autoInit: true,
            ...options
        };
        
        this.syncManager = null;
        this.statusInterval = null;
        
        if (this.options.autoInit) {
            this.init();
        }
    }
    
    async init() {
        try {
            const { deviceSync } = await import('../utils/DeviceSyncManager.js');
            this.syncManager = deviceSync;
            this.render();
            this.bindEvents();
            this.startStatusUpdates();
        } catch (error) {
            console.error('Failed to initialize sync manager:', error);
            this.showError('שגיאה באתחול מנהל הסנכרון');
        }
    }
    
    render() {
        const status = this.syncManager.getSyncStatus();
        
        this.container.innerHTML = `
            <div class="sync-manager">
                ${this.options.showStatus ? this.renderStatus(status) : ''}
                ${this.options.showControls ? this.renderControls() : ''}
                <div class="sync-log" style="display: none;"></div>
            </div>
        `;
    }
    
    renderStatus(status) {
        const statusClass = status.needsSync ? 'needs-sync' : 'synced';
        const statusIcon = status.needsSync ? '🔄' : '✅';
        const statusText = status.needsSync ? 'נדרש סנכרון' : 'מסונכרן';
        
        return `
            <div class="sync-status ${statusClass}">
                <div class="status-header">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                    <div class="connection-status ${status.isOnline ? 'online' : 'offline'}">
                        ${status.isOnline ? '🌐 מחובר' : '📴 אופליין'}
                    </div>
                </div>
                
                <div class="status-details">
                    <div class="status-item">
                        <span class="label">מכשיר:</span>
                        <span class="value">${status.deviceId}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">סנכרון אחרון:</span>
                        <span class="value">${status.lastSyncFormatted}</span>
                    </div>
                    ${status.queueCount > 0 ? `
                    <div class="status-item queue-count">
                        <span class="label">בתור:</span>
                        <span class="value">${status.queueCount} פריטים</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderControls() {
        return `
            <div class="sync-controls">
                <div class="control-section">
                    <h4 class="section-title">ייצוא נתונים</h4>
                    <div class="control-buttons">
                        <button type="button" class="btn-primary export-sync-btn">
                            📤 ייצא לסנכרון
                        </button>
                        <button type="button" class="btn-ghost backup-btn">
                            💾 גיבוי מלא
                        </button>
                    </div>
                    <div class="section-description">
                        <small>ייצא נתוני המכשיר הזה לקובץ לסנכרון עם מכשירים אחרים</small>
                    </div>
                </div>
                
                <div class="control-section">
                    <h4 class="section-title">ייבוא נתונים</h4>
                    <div class="control-buttons">
                        <input type="file" id="sync-file-input" class="file-input" accept=".json" style="display: none;">
                        <button type="button" class="btn-secondary import-sync-btn">
                            📥 ייבא מסנכרון
                        </button>
                        <button type="button" class="btn-ghost restore-btn">
                            🔄 שחזר מגיבוי
                        </button>
                    </div>
                    <div class="section-description">
                        <small>ייבא נתונים מקובץ סנכרון ממכשיר אחר</small>
                    </div>
                </div>
                
                <div class="control-section advanced-section" style="display: none;">
                    <h4 class="section-title">הגדרות מתקדמות</h4>
                    <div class="control-buttons">
                        <button type="button" class="btn-ghost clear-queue-btn">
                            🗑️ נקה תור
                        </button>
                        <button type="button" class="btn-ghost reset-device-btn">
                            🔄 אפס מכשיר
                        </button>
                        <button type="button" class="btn-ghost show-log-btn">
                            📋 הצג יומן
                        </button>
                    </div>
                </div>
                
                <div class="advanced-toggle">
                    <button type="button" class="btn-ghost btn-sm toggle-advanced">
                        ⚙️ הגדרות מתקדמות
                    </button>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Export buttons
        const exportBtn = this.container.querySelector('.export-sync-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
        
        const backupBtn = this.container.querySelector('.backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.handleFullBackup());
        }
        
        // Import buttons
        const importBtn = this.container.querySelector('.import-sync-btn');
        const fileInput = this.container.querySelector('#sync-file-input');
        
        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleImport(e.target.files[0]));
        }
        
        const restoreBtn = this.container.querySelector('.restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.handleRestore());
        }
        
        // Advanced controls
        const clearQueueBtn = this.container.querySelector('.clear-queue-btn');
        if (clearQueueBtn) {
            clearQueueBtn.addEventListener('click', () => this.handleClearQueue());
        }
        
        const resetDeviceBtn = this.container.querySelector('.reset-device-btn');
        if (resetDeviceBtn) {
            resetDeviceBtn.addEventListener('click', () => this.handleResetDevice());
        }
        
        const showLogBtn = this.container.querySelector('.show-log-btn');
        if (showLogBtn) {
            showLogBtn.addEventListener('click', () => this.toggleLog());
        }
        
        // Advanced toggle
        const toggleAdvanced = this.container.querySelector('.toggle-advanced');
        const advancedSection = this.container.querySelector('.advanced-section');
        
        if (toggleAdvanced && advancedSection) {
            toggleAdvanced.addEventListener('click', () => {
                const isVisible = advancedSection.style.display !== 'none';
                advancedSection.style.display = isVisible ? 'none' : 'block';
                toggleAdvanced.textContent = isVisible ? '⚙️ הגדרות מתקדמות' : '📤 הסתר הגדרות';
            });
        }
    }
    
    async handleExport() {
        try {
            this.showLoading('מייצא נתונים לסנכרון...');
            
            const result = await this.syncManager.exportForSync();
            
            if (result.success) {
                this.showSuccess(`✅ ${result.message}`);
                this.logAction(`ייצוא בוצע: ${result.filename}`);
            } else {
                this.showError(`❌ ${result.message}`);
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('שגיאה בייצוא נתונים');
        } finally {
            this.hideLoading();
            this.updateStatus();
        }
    }
    
    async handleFullBackup() {
        try {
            this.showLoading('יוצר גיבוי מלא...');
            
            const { DataManager } = await import('../data/index.js');
            const { exportData } = await import('../data/export.js');
            
            const backupData = {
                type: 'full_backup',
                timestamp: new Date().toISOString(),
                deviceId: this.syncManager.deviceId,
                data: {
                    transactions: await DataManager.getAllTransactions(),
                    categories: await DataManager.getCategories(),
                    accounts: await DataManager.getAccounts(),
                    settings: await DataManager.getSettings()
                }
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showSuccess('✅ גיבוי מלא נוצר בהצלחה');
            this.logAction(`גיבוי מלא: ${a.download}`);
            
        } catch (error) {
            console.error('Backup failed:', error);
            this.showError('שגיאה ביצירת גיבוי');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleImport(file) {
        if (!file) return;
        
        try {
            this.showLoading('מייבא נתוני סנכרון...');
            
            const result = await this.syncManager.importSyncData(file);
            
            if (result.success) {
                this.showSuccess(`✅ ${result.message}`);
                
                if (result.stats) {
                    const stats = result.stats;
                    const statsMessage = `
                        עסקאות: ${stats.transactionsAdded} נוספו, ${stats.transactionsUpdated} עודכנו<br>
                        קטגוריות: ${stats.categoriesAdded} נוספו, ${stats.categoriesUpdated} עודכנו<br>
                        חשבונות: ${stats.accountsAdded} נוספו, ${stats.accountsUpdated} עודכנו
                    `;
                    this.logAction(`סנכרון הושלם:<br>${statsMessage}`);
                }
                
                if (result.conflicts > 0) {
                    this.showInfo(`🔄 פתרון ${result.conflicts} קונפליקטים הושלם`);
                }
                
                // Refresh the page to show updated data
                setTimeout(() => {
                    if (confirm('סנכרון הושלם! האם לרענן את הדף להצגת הנתונים העדכניים?')) {
                        window.location.reload();
                    }
                }, 2000);
                
            } else {
                this.showError(`❌ ${result.message}`);
            }
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showError('שגיאה בייבוא נתונים');
        } finally {
            this.hideLoading();
            this.updateStatus();
        }
    }
    
    async handleRestore() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                this.showLoading('משחזר מגיבוי...');
                
                const text = await this.readFileAsText(file);
                const backupData = JSON.parse(text);
                
                if (backupData.type !== 'full_backup') {
                    throw new Error('קובץ זה אינו גיבוי מלא תקין');
                }
                
                if (!confirm('האם אתה בטוח שברצונך לשחזר מגיבוי? פעולה זו תדרוס את כל הנתונים הקיימים!')) {
                    return;
                }
                
                // Import backup data
                const result = await this.syncManager.importSyncData({
                    deviceId: backupData.deviceId,
                    timestamp: backupData.timestamp,
                    version: '1.0.0',
                    data: backupData.data,
                    metadata: {}
                });
                
                if (result.success) {
                    this.showSuccess('✅ שחזור מגיבוי הושלם בהצלחה');
                    this.logAction('שחזור מגיבוי הושלם');
                    
                    setTimeout(() => {
                        if (confirm('שחזור הושלם! האם לרענן את הדף?')) {
                            window.location.reload();
                        }
                    }, 2000);
                } else {
                    this.showError(`❌ ${result.message}`);
                }
                
            } catch (error) {
                console.error('Restore failed:', error);
                this.showError('שגיאה בשחזור מגיבוי');
            } finally {
                this.hideLoading();
            }
        });
        
        input.click();
    }
    
    handleClearQueue() {
        if (confirm('האם אתה בטוח שברצונך לנקות את תור הסנכרון?')) {
            this.syncManager.syncQueue = [];
            localStorage.setItem('syncQueue', '[]');
            this.showSuccess('✅ תור הסנכרון נוקה');
            this.logAction('תור הסנכרון נוקה');
            this.updateStatus();
        }
    }
    
    handleResetDevice() {
        if (confirm('האם אתה בטוח שברצונך לאפס את מזהה המכשיר? פעולה זו תיצור מזהה חדש.')) {
            localStorage.removeItem('deviceId');
            this.syncManager.deviceId = this.syncManager.getOrCreateDeviceId();
            this.showSuccess('✅ מזהה המכשיר אופס');
            this.logAction(`מזהה מכשיר חדש: ${this.syncManager.deviceId}`);
            this.updateStatus();
        }
    }
    
    toggleLog() {
        const logContainer = this.container.querySelector('.sync-log');
        const isVisible = logContainer.style.display !== 'none';
        
        logContainer.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.updateLog();
        }
    }
    
    updateLog() {
        const logContainer = this.container.querySelector('.sync-log');
        const logs = JSON.parse(localStorage.getItem('syncLogs') || '[]');
        
        if (logs.length === 0) {
            logContainer.innerHTML = '<div class="no-logs">אין פעילות לוג</div>';
            return;
        }
        
        logContainer.innerHTML = `
            <div class="log-header">
                <h4>יומן פעילות סנכרון</h4>
                <button type="button" class="btn-ghost btn-xs clear-logs-btn">נקה יומן</button>
            </div>
            <div class="log-entries">
                ${logs.slice(-20).reverse().map(log => `
                    <div class="log-entry">
                        <div class="log-time">${new Date(log.timestamp).toLocaleString('he-IL')}</div>
                        <div class="log-message">${log.message}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Bind clear logs
        const clearLogsBtn = logContainer.querySelector('.clear-logs-btn');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                localStorage.removeItem('syncLogs');
                this.updateLog();
            });
        }
    }
    
    logAction(message) {
        const logs = JSON.parse(localStorage.getItem('syncLogs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            message: message
        });
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('syncLogs', JSON.stringify(logs));
    }
    
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
            reader.readAsText(file);
        });
    }
    
    startStatusUpdates() {
        this.statusInterval = setInterval(() => {
            this.updateStatus();
        }, 30000); // Update every 30 seconds
    }
    
    updateStatus() {
        if (!this.syncManager) return;
        
        const statusContainer = this.container.querySelector('.sync-status');
        if (statusContainer) {
            const status = this.syncManager.getSyncStatus();
            statusContainer.outerHTML = this.renderStatus(status);
        }
    }
    
    showLoading(message) {
        if (window.showToast) {
            window.showToast(message, 'info');
        }
    }
    
    hideLoading() {
        // Loading is handled by toast system
    }
    
    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        }
    }
    
    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }
    
    showInfo(message) {
        if (window.showToast) {
            window.showToast(message, 'info');
        }
    }
    
    destroy() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        
        if (this.syncManager) {
            this.syncManager.destroy();
        }
    }
}

// Export for use in other components
export default SyncManager;