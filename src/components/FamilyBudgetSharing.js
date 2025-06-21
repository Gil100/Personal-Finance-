/**
 * Hebrew Family Budget Sharing Component
 * Allows sharing budgets between family members with Hebrew interface
 */
class FamilyBudgetSharing {
    constructor() {
        this.currentBudget = null;
        this.familyMembers = [];
        this.sharingSettings = {};
        this.invitations = [];
        this.initializeData();
    }

    async initializeData() {
        if (window.DataAPI) {
            await this.loadFamilyData();
            await this.loadSharingSettings();
        }
    }

    async loadFamilyData() {
        try {
            const families = await DataAPI.storage.get('families', 'main') || {};
            this.familyMembers = families.members || [];
            this.invitations = families.invitations || [];
        } catch (error) {
            console.error('Failed to load family data:', error);
        }
    }

    async loadSharingSettings() {
        try {
            const settings = await DataAPI.storage.get('budget_sharing', 'settings') || {};
            this.sharingSettings = settings;
        } catch (error) {
            console.error('Failed to load sharing settings:', error);
        }
    }

    render() {
        return `
            <div class="family-budget-sharing" dir="rtl">
                <div class="sharing-header">
                    <h2>שיתוף תקציב משפחתי</h2>
                    <p class="description">שתף את התקציב שלך עם בני משפחה לניהול כספים משותף</p>
                </div>

                <div class="sharing-content">
                    ${this.renderFamilyMembers()}
                    ${this.renderInvitations()}
                    ${this.renderSharingPermissions()}
                    ${this.renderInviteForm()}
                </div>
            </div>
        `;
    }

    renderFamilyMembers() {
        if (this.familyMembers.length === 0) {
            return `
                <div class="family-members-section">
                    <h3>בני המשפחה</h3>
                    <div class="no-members">
                        <div class="no-members-icon">👥</div>
                        <p>טרם הוזמנו בני משפחה לתקציב זה</p>
                        <p class="subtitle">הזמן בני משפחה כדי לנהל יחד את התקציב המשפחתי</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="family-members-section">
                <h3>בני המשפחה (${this.familyMembers.length})</h3>
                <div class="members-list">
                    ${this.familyMembers.map(member => `
                        <div class="member-card" data-member-id="${member.id}">
                            <div class="member-avatar">
                                ${member.avatar || this.getDefaultAvatar(member.name)}
                            </div>
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-role ${member.role}">${this.getRoleDisplay(member.role)}</div>
                                <div class="member-permissions">
                                    ${this.renderMemberPermissions(member)}
                                </div>
                            </div>
                            <div class="member-actions">
                                ${this.renderMemberActions(member)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderInvitations() {
        if (this.invitations.length === 0) {
            return '';
        }

        return `
            <div class="invitations-section">
                <h3>הזמנות ממתינות (${this.invitations.length})</h3>
                <div class="invitations-list">
                    ${this.invitations.map(invitation => `
                        <div class="invitation-card" data-invitation-id="${invitation.id}">
                            <div class="invitation-info">
                                <div class="invitation-email">${invitation.email}</div>
                                <div class="invitation-role">${this.getRoleDisplay(invitation.role)}</div>
                                <div class="invitation-date">נשלח: ${this.formatDate(invitation.sentDate)}</div>
                            </div>
                            <div class="invitation-status ${invitation.status}">
                                ${this.getStatusDisplay(invitation.status)}
                            </div>
                            <div class="invitation-actions">
                                <button class="btn btn-sm btn-secondary" onclick="familySharing.resendInvitation('${invitation.id}')">
                                    שלח שוב
                                </button>
                                <button class="btn btn-sm btn-error" onclick="familySharing.cancelInvitation('${invitation.id}')">
                                    ביטול
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSharingPermissions() {
        return `
            <div class="sharing-permissions-section">
                <h3>הרשאות שיתוף</h3>
                <div class="permissions-grid">
                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>צפייה בתקציב</h4>
                            <input type="checkbox" 
                                   id="perm-view-budget" 
                                   ${this.sharingSettings.allowViewBudget ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowViewBudget', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה לצפות בפרטי התקציב והוצאות</p>
                    </div>

                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>הוספת עסקאות</h4>
                            <input type="checkbox" 
                                   id="perm-add-transactions" 
                                   ${this.sharingSettings.allowAddTransactions ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowAddTransactions', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה להוסיף עסקאות חדשות</p>
                    </div>

                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>עריכת תקציב</h4>
                            <input type="checkbox" 
                                   id="perm-edit-budget" 
                                   ${this.sharingSettings.allowEditBudget ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowEditBudget', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה לערוך הקצאות תקציב</p>
                    </div>

                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>מחיקת עסקאות</h4>
                            <input type="checkbox" 
                                   id="perm-delete-transactions" 
                                   ${this.sharingSettings.allowDeleteTransactions ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowDeleteTransactions', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה למחוק עסקאות</p>
                    </div>

                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>הזמנת חברים נוספים</h4>
                            <input type="checkbox" 
                                   id="perm-invite-members" 
                                   ${this.sharingSettings.allowInviteMembers ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowInviteMembers', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה להזמין חברים נוספים</p>
                    </div>

                    <div class="permission-card">
                        <div class="permission-header">
                            <h4>ייצוא נתונים</h4>
                            <input type="checkbox" 
                                   id="perm-export-data" 
                                   ${this.sharingSettings.allowExportData ? 'checked' : ''}
                                   onchange="familySharing.updatePermission('allowExportData', this.checked)">
                        </div>
                        <p>אפשר לבני משפחה לייצא נתוני תקציב</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderInviteForm() {
        return `
            <div class="invite-form-section">
                <h3>הזמן בן משפחה</h3>
                <form class="invite-form" onsubmit="familySharing.sendInvitation(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="invite-email">כתובת אימייל</label>
                            <input type="email" 
                                   id="invite-email" 
                                   name="email" 
                                   placeholder="דוגמה: member@example.com"
                                   required>
                        </div>
                        <div class="form-group">
                            <label for="invite-name">שם מלא</label>
                            <input type="text" 
                                   id="invite-name" 
                                   name="name" 
                                   placeholder="דוגמה: שרה כהן"
                                   required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="invite-role">תפקיד במשפחה</label>
                            <select id="invite-role" name="role" required>
                                <option value="">בחר תפקיד</option>
                                <option value="spouse">בן/בת זוג</option>
                                <option value="parent">הורה</option>
                                <option value="child">ילד/ה</option>
                                <option value="member">בן משפחה</option>
                                <option value="viewer">צופה בלבד</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="invite-permissions">רמת הרשאה</label>
                            <select id="invite-permissions" name="permissions" required>
                                <option value="">בחר רמת הרשאה</option>
                                <option value="full">הרשאה מלאה</option>
                                <option value="editor">עריכה והוספה</option>
                                <option value="contributor">הוספה בלבד</option>
                                <option value="viewer">צפייה בלבד</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="invite-message">הודעה אישית (אופציונלי)</label>
                        <textarea id="invite-message" 
                                  name="message" 
                                  rows="3"
                                  placeholder="הודעה אישית לבן המשפחה שאתה מזמין..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            שלח הזמנה
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="familySharing.previewInvitation()">
                            תצוגה מקדימה
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    renderMemberPermissions(member) {
        const permissions = member.permissions || {};
        const permissionLabels = {
            viewBudget: 'צפייה',
            addTransactions: 'הוספה',
            editBudget: 'עריכה',
            deleteTransactions: 'מחיקה',
            inviteMembers: 'הזמנות',
            exportData: 'ייצוא'
        };

        return Object.keys(permissionLabels)
            .filter(key => permissions[key])
            .map(key => `<span class="permission-tag">${permissionLabels[key]}</span>`)
            .join('');
    }

    renderMemberActions(member) {
        if (member.role === 'owner') {
            return '<span class="member-badge">בעלים</span>';
        }

        return `
            <div class="member-actions-dropdown">
                <button class="btn btn-sm btn-ghost" onclick="familySharing.toggleMemberActions('${member.id}')">
                    ⋮
                </button>
                <div class="actions-menu" id="member-actions-${member.id}">
                    <button onclick="familySharing.editMemberPermissions('${member.id}')">ערוך הרשאות</button>
                    <button onclick="familySharing.changeMemberRole('${member.id}')">שנה תפקיד</button>
                    <button onclick="familySharing.sendMemberMessage('${member.id}')">שלח הודעה</button>
                    <button onclick="familySharing.removeMember('${member.id}')" class="danger">הסר ממשפחה</button>
                </div>
            </div>
        `;
    }

    // Helper methods
    getDefaultAvatar(name) {
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
        return `<div class="avatar-initials">${initials}</div>`;
    }

    getRoleDisplay(role) {
        const roleLabels = {
            owner: 'בעלים',
            spouse: 'בן/בת זוג',
            parent: 'הורה',
            child: 'ילד/ה',
            member: 'בן משפחה',
            viewer: 'צופה'
        };
        return roleLabels[role] || role;
    }

    getStatusDisplay(status) {
        const statusLabels = {
            pending: 'ממתין',
            sent: 'נשלח',
            viewed: 'נצפה',
            expired: 'פג תוקף'
        };
        return statusLabels[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    }

    // Action methods
    async sendInvitation(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const invitationData = {
            id: this.generateId(),
            email: formData.get('email'),
            name: formData.get('name'),
            role: formData.get('role'),
            permissions: this.getPermissionsForLevel(formData.get('permissions')),
            message: formData.get('message'),
            sentDate: new Date().toISOString(),
            status: 'pending',
            invitedBy: 'current_user' // Replace with actual user ID
        };

        try {
            // Add to invitations list
            this.invitations.push(invitationData);
            
            // Save to storage
            await this.saveFamilyData();
            
            // Simulate sending email (in real app, would call API)
            await this.simulateEmailInvitation(invitationData);
            
            // Show success message
            window.HebrewToasts?.show('ההזמנה נשלחה בהצלחה', 'success');
            
            // Clear form
            event.target.reset();
            
            // Re-render component
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to send invitation:', error);
            window.HebrewToasts?.show('שגיאה בשליחת ההזמנה', 'error');
        }
    }

    async updatePermission(permissionKey, value) {
        this.sharingSettings[permissionKey] = value;
        
        try {
            await DataAPI.storage.save('budget_sharing', 'settings', this.sharingSettings);
            window.HebrewToasts?.show('ההרשאות עודכנו בהצלחה', 'success');
        } catch (error) {
            console.error('Failed to update permission:', error);
            window.HebrewToasts?.show('שגיאה בעדכון ההרשאות', 'error');
        }
    }

    async resendInvitation(invitationId) {
        const invitation = this.invitations.find(inv => inv.id === invitationId);
        if (!invitation) return;

        try {
            invitation.sentDate = new Date().toISOString();
            invitation.status = 'pending';
            
            await this.saveFamilyData();
            await this.simulateEmailInvitation(invitation);
            
            window.HebrewToasts?.show('ההזמנה נשלחה שוב בהצלחה', 'success');
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to resend invitation:', error);
            window.HebrewToasts?.show('שגיאה בשליחה חוזרת של ההזמנה', 'error');
        }
    }

    async cancelInvitation(invitationId) {
        if (!confirm('האם אתה בטוח שברצונך לבטל את ההזמנה?')) return;

        try {
            this.invitations = this.invitations.filter(inv => inv.id !== invitationId);
            await this.saveFamilyData();
            
            window.HebrewToasts?.show('ההזמנה בוטלה בהצלחה', 'success');
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to cancel invitation:', error);
            window.HebrewToasts?.show('שגיאה בביטול ההזמנה', 'error');
        }
    }

    async removeMember(memberId) {
        const member = this.familyMembers.find(m => m.id === memberId);
        if (!member) return;

        if (!confirm(`האם אתה בטוח שברצונך להסיר את ${member.name} מהמשפחה?`)) return;

        try {
            this.familyMembers = this.familyMembers.filter(m => m.id !== memberId);
            await this.saveFamilyData();
            
            window.HebrewToasts?.show(`${member.name} הוסר/ה מהמשפחה בהצלחה`, 'success');
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to remove member:', error);
            window.HebrewToasts?.show('שגיאה בהסרת בן המשפחה', 'error');
        }
    }

    // Utility methods
    getPermissionsForLevel(level) {
        const permissionLevels = {
            full: {
                viewBudget: true,
                addTransactions: true,
                editBudget: true,
                deleteTransactions: true,
                inviteMembers: true,
                exportData: true
            },
            editor: {
                viewBudget: true,
                addTransactions: true,
                editBudget: true,
                deleteTransactions: false,
                inviteMembers: false,
                exportData: true
            },
            contributor: {
                viewBudget: true,
                addTransactions: true,
                editBudget: false,
                deleteTransactions: false,
                inviteMembers: false,
                exportData: false
            },
            viewer: {
                viewBudget: true,
                addTransactions: false,
                editBudget: false,
                deleteTransactions: false,
                inviteMembers: false,
                exportData: false
            }
        };
        
        return permissionLevels[level] || permissionLevels.viewer;
    }

    async saveFamilyData() {
        const familyData = {
            members: this.familyMembers,
            invitations: this.invitations,
            updatedAt: new Date().toISOString()
        };
        
        await DataAPI.storage.save('families', 'main', familyData);
    }

    async simulateEmailInvitation(invitation) {
        // In a real application, this would call an API to send email
        console.log('Sending email invitation:', invitation);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In demo mode, we'll add some fake responses
        if (window.location.hostname === 'localhost') {
            setTimeout(() => {
                this.simulateInvitationResponse(invitation.id);
            }, 5000); // Simulate response after 5 seconds
        }
    }

    simulateInvitationResponse(invitationId) {
        const invitation = this.invitations.find(inv => inv.id === invitationId);
        if (invitation) {
            invitation.status = 'viewed';
            this.updateDisplay();
        }
    }

    generateId() {
        return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateDisplay() {
        const container = document.querySelector('.family-budget-sharing');
        if (container) {
            container.innerHTML = this.render().match(/<div class="family-budget-sharing"[^>]*>(.*)<\/div>$/s)[1];
        }
    }

    // Advanced features
    previewInvitation() {
        const form = document.querySelector('.invite-form');
        const formData = new FormData(form);
        
        const modal = window.Modal?.create({
            title: 'תצוגה מקדימה - הזמנה למשפחה',
            content: this.renderInvitationPreview(formData),
            size: 'medium',
            actions: [
                { text: 'סגור', type: 'secondary' },
                { text: 'שלח הזמנה', type: 'primary', onclick: () => this.sendInvitation(new Event('submit')) }
            ]
        });
        
        modal.show();
    }

    renderInvitationPreview(formData) {
        return `
            <div class="invitation-preview" dir="rtl">
                <div class="preview-header">
                    <h3>הזמנה לניהול תקציב משפחתי</h3>
                </div>
                
                <div class="preview-content">
                    <p><strong>שלום ${formData.get('name')},</strong></p>
                    
                    <p>הוזמנת להצטרף לניהול התקציב המשפחתי.</p>
                    
                    <div class="invitation-details">
                        <div class="detail-row">
                            <span class="label">תפקיד:</span>
                            <span class="value">${this.getRoleDisplay(formData.get('role'))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">רמת הרשאה:</span>
                            <span class="value">${formData.get('permissions')}</span>
                        </div>
                    </div>
                    
                    ${formData.get('message') ? `
                        <div class="personal-message">
                            <h4>הודעה אישית:</h4>
                            <p>"${formData.get('message')}"</p>
                        </div>
                    ` : ''}
                    
                    <div class="invitation-actions">
                        <button class="btn btn-primary">קבל הזמנה</button>
                        <button class="btn btn-secondary">דחה</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Export family budget data
    async exportFamilyBudgetData() {
        try {
            const familyData = {
                members: this.familyMembers,
                invitations: this.invitations,
                sharingSettings: this.sharingSettings,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(familyData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `family-budget-sharing-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            window.HebrewToasts?.show('נתוני המשפחה יוצאו בהצלחה', 'success');
            
        } catch (error) {
            console.error('Failed to export family data:', error);
            window.HebrewToasts?.show('שגיאה בייצוא נתוני המשפחה', 'error');
        }
    }
}

// Initialize component
window.FamilyBudgetSharing = FamilyBudgetSharing;

// Make global instance available
window.familySharing = null;