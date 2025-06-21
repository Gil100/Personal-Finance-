/**
 * Israeli Budget Templates System
 * Pre-built budget templates for different Israeli household types
 * Based on research of typical Israeli household expenses and percentages
 */

class IsraeliBudgetTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
    }

    initializeTemplates() {
        return {
            'young-professional': {
                id: 'young-professional',
                name: 'מקצועי צעיר',
                description: 'עצמאי ללא ילדים - הכנסה ₪8,000-12,000',
                targetIncome: 10000,
                icon: '👤',
                categories: [
                    { name: 'דיור', percentage: 35, amount: 3500, description: 'שכר דירה, ארנונה, חשמל' },
                    { name: 'מזון', percentage: 18, amount: 1800, description: 'קניות, מסעדות' },
                    { name: 'תחבורה', percentage: 12, amount: 1200, description: 'דלק, חניה, תח"צ' },
                    { name: 'בריאות', percentage: 4, amount: 400, description: 'ביטוח נוסף, תרופות' },
                    { name: 'חסכונות', percentage: 15, amount: 1500, description: 'חסכון לטווח ארוך' },
                    { name: 'בילוי ופנוי', percentage: 8, amount: 800, description: 'יציאות, תרבות, ספורט' },
                    { name: 'לבוש', percentage: 4, amount: 400, description: 'ביגוד ונעליים' },
                    { name: 'שונות', percentage: 4, amount: 400, description: 'הוצאות שונות' }
                ],
                tips: [
                    'שמור לפחות 15% מההכנסה לחסכון',
                    'הכנס תקציב להוצאות לא צפויות',
                    'שקול ביטוח נוסף בגיל צעיר',
                    'תכנן לרכישת דירה בעתיד'
                ]
            },

            'young-couple': {
                id: 'young-couple',
                name: 'זוג צעיר',
                description: 'נשואים ללא ילדים - הכנסה ₪16,000-20,000',
                targetIncome: 18000,
                icon: '👫',
                categories: [
                    { name: 'דיור', percentage: 30, amount: 5400, description: 'שכר דירה, ארנונה, חשמל' },
                    { name: 'מזון', percentage: 20, amount: 3600, description: 'קניות, מסעדות' },
                    { name: 'תחבורה', percentage: 12, amount: 2160, description: 'דלק, חניה, תח"צ' },
                    { name: 'בריאות', percentage: 5, amount: 900, description: 'ביטוח נוסף, תרופות' },
                    { name: 'חסכונות', percentage: 12, amount: 2160, description: 'חסכון לטווח ארוך' },
                    { name: 'בילוי ופנוי', percentage: 7, amount: 1260, description: 'יציאות, תרבות, נופש' },
                    { name: 'לבוש', percentage: 5, amount: 900, description: 'ביגוד ונעליים' },
                    { name: 'ביטוח', percentage: 4, amount: 720, description: 'ביטוח רכב, דירה' },
                    { name: 'שונות', percentage: 5, amount: 900, description: 'הוצאות שונות' }
                ],
                tips: [
                    'תכננו יחד תקציב משותף',
                    'חסכו לחתונה או לרכישת דירה',
                    'שקלו פתיחת חשבון משותף',
                    'תכננו לעתיד - ילדים או השקעות'
                ]
            },

            'family-small': {
                id: 'family-small',
                name: 'משפחה קטנה',
                description: 'משפחה עם 1-3 ילדים - הכנסה ₪18,000-25,000',
                targetIncome: 22000,
                icon: '👨‍👩‍👧‍👦',
                categories: [
                    { name: 'דיור', percentage: 28, amount: 6160, description: 'שכר דירה, ארנונה, חשמל' },
                    { name: 'מזון', percentage: 22, amount: 4840, description: 'קניות, מסעדות, מזון לילדים' },
                    { name: 'חינוך', percentage: 8, amount: 1760, description: 'חינוך פרטי, פעילויות' },
                    { name: 'בריאות', percentage: 5, amount: 1100, description: 'ביטוח נוסף, תרופות' },
                    { name: 'תחבורה', percentage: 10, amount: 2200, description: 'דלק, חניה, תח"צ' },
                    { name: 'חסכונות', percentage: 10, amount: 2200, description: 'חסכון לילדים ולעתיד' },
                    { name: 'פעילויות ילדים', percentage: 6, amount: 1320, description: 'חוגים, קייטנות' },
                    { name: 'לבוש', percentage: 5, amount: 1100, description: 'ביגוד למשפחה' },
                    { name: 'ביטוח', percentage: 4, amount: 880, description: 'ביטוח רכב, דירה, חיים' },
                    { name: 'שונות', percentage: 2, amount: 440, description: 'הוצאות שונות' }
                ],
                tips: [
                    'תכננו תקציב נפרד לכל ילד',
                    'חסכו לחינוך העליון של הילדים',
                    'נצלו הטבות ממשלתיות למשפחות',
                    'שקלו פוליסת חיים'
                ]
            },

            'family-large': {
                id: 'family-large',
                name: 'משפחה גדולה',
                description: 'משפחה עם 4+ ילדים - הכנסה ₪20,000-30,000',
                targetIncome: 25000,
                icon: '👨‍👩‍👧‍👧‍👦‍👦',
                categories: [
                    { name: 'דיור', percentage: 25, amount: 6250, description: 'שכר דירה, ארנונה, חשמל' },
                    { name: 'מזון', percentage: 28, amount: 7000, description: 'קניות גדולות, מזון לילדים' },
                    { name: 'חינוך', percentage: 12, amount: 3000, description: 'חינוך פרטי, ספרים, פעילויות' },
                    { name: 'בריאות', percentage: 6, amount: 1500, description: 'ביטוח נוסף, תרופות' },
                    { name: 'תחבורה', percentage: 9, amount: 2250, description: 'דלק, חניה, תח"צ' },
                    { name: 'חסכונות', percentage: 8, amount: 2000, description: 'חסכון לילדים' },
                    { name: 'פעילויות ילדים', percentage: 7, amount: 1750, description: 'חוגים, קייטנות' },
                    { name: 'לבוש', percentage: 7, amount: 1750, description: 'ביגוד למשפחה גדולה' },
                    { name: 'ביטוח', percentage: 5, amount: 1250, description: 'ביטוח רכב, דירה, חיים' },
                    { name: 'שונות', percentage: 3, amount: 750, description: 'הוצאות שונות' }
                ],
                tips: [
                    'נצלו הנחות למשפחות רבות ילדים',
                    'תכננו קניות במכירות וכמויות',
                    'שקלו קצבת ילדים והטבות מס',
                    'חסכו בנפרד לכל ילד'
                ]
            },

            'retirees': {
                id: 'retirees',
                name: 'גמלאים',
                description: 'זוג בפנסיה - הכנסה ₪8,000-15,000',
                targetIncome: 12000,
                icon: '👴👵',
                categories: [
                    { name: 'דיור', percentage: 32, amount: 3840, description: 'שכר דירה, ארנונה, חשמל' },
                    { name: 'מזון', percentage: 22, amount: 2640, description: 'קניות, מסעדות' },
                    { name: 'בריאות', percentage: 12, amount: 1440, description: 'תרופות, רופאים פרטיים' },
                    { name: 'תחבורה', percentage: 8, amount: 960, description: 'תח"צ, מוניות' },
                    { name: 'בילוי ופנוי', percentage: 6, amount: 720, description: 'יציאות, תרבות' },
                    { name: 'שירותים', percentage: 8, amount: 960, description: 'חשמל, מים, טלפון' },
                    { name: 'ביטוח', percentage: 6, amount: 720, description: 'ביטוח דירה, בריאות' },
                    { name: 'שונות', percentage: 6, amount: 720, description: 'הוצאות שונות' }
                ],
                tips: [
                    'נצלו הנחות לגיל הזהב',
                    'תכננו תקציב לטיפול רפואי',
                    'שקלו ביטוח סיעודי',
                    'הכינו צוואה ותכנון ירושה'
                ]
            },

            'student': {
                id: 'student',
                name: 'סטודנט',
                description: 'סטודנט או צעיר בהכשרה - הכנסה ₪3,000-6,000',
                targetIncome: 4500,
                icon: '🎓',
                categories: [
                    { name: 'דיור', percentage: 40, amount: 1800, description: 'שכר דירה, שירותים' },
                    { name: 'מזון', percentage: 28, amount: 1260, description: 'קניות בסיסיות' },
                    { name: 'תחבורה', percentage: 10, amount: 450, description: 'תח"צ, הנחת סטודנט' },
                    { name: 'חינוך', percentage: 12, amount: 540, description: 'שכר לימוד, ספרים' },
                    { name: 'בילוי ופנוי', percentage: 6, amount: 270, description: 'יציאות עם חברים' },
                    { name: 'שונות', percentage: 4, amount: 180, description: 'הוצאות שונות' }
                ],
                tips: [
                    'חפש הנחות סטודנטים',
                    'שקול עבודות צד',
                    'התארגן עם שותפים לדירה',
                    'נצל מלגות זמינות'
                ]
            }
        };
    }

    getAllTemplates() {
        return Object.values(this.templates);
    }

    getTemplate(templateId) {
        return this.templates[templateId] || null;
    }

    getTemplatesByIncome(monthlyIncome) {
        return this.getAllTemplates().filter(template => {
            const incomeRange = this.getIncomeRange(template.id);
            return monthlyIncome >= incomeRange.min && monthlyIncome <= incomeRange.max;
        });
    }

    getIncomeRange(templateId) {
        const ranges = {
            'young-professional': { min: 8000, max: 12000 },
            'young-couple': { min: 16000, max: 20000 },
            'family-small': { min: 18000, max: 25000 },
            'family-large': { min: 20000, max: 30000 },
            'retirees': { min: 8000, max: 15000 },
            'student': { min: 3000, max: 6000 }
        };
        return ranges[templateId] || { min: 0, max: Infinity };
    }

    applyTemplate(templateId, userIncome = null) {
        const template = this.getTemplate(templateId);
        if (!template) return null;

        const income = userIncome || template.targetIncome;
        const scaledCategories = template.categories.map(category => ({
            ...category,
            amount: Math.round((category.percentage / 100) * income)
        }));

        return {
            ...template,
            appliedIncome: income,
            categories: scaledCategories,
            totalBudget: scaledCategories.reduce((sum, cat) => sum + cat.amount, 0)
        };
    }

    getSeasonalAdjustments() {
        return {
            'september': {
                name: 'חזרה ללימודים',
                description: 'עלייה בהוצאות חינוך ולבוש',
                adjustments: {
                    'חינוך': 1.5,
                    'לבוש': 1.3,
                    'פעילויות ילדים': 1.2
                }
            },
            'passover': {
                name: 'פסח',
                description: 'עלייה בהוצאות מזון וחגים',
                adjustments: {
                    'מזון': 1.4,
                    'בילוי ופנוי': 1.2,
                    'שונות': 1.3
                }
            },
            'summer': {
                name: 'חופשת קיץ',
                description: 'עלייה בהוצאות פעילויות ונופש',
                adjustments: {
                    'פעילויות ילדים': 1.8,
                    'בילוי ופנוי': 1.5,
                    'תחבורה': 1.2
                }
            },
            'high-holidays': {
                name: 'חגי תשרי',
                description: 'עלייה מתונה בהוצאות חגים',
                adjustments: {
                    'מזון': 1.2,
                    'לבוש': 1.2,
                    'בילוי ופנוי': 1.1
                }
            }
        };
    }

    getCityAdjustments() {
        return {
            'tel-aviv': {
                name: 'תל אביב',
                multiplier: 1.3,
                mainAdjustments: {
                    'דיור': 1.5,
                    'מזון': 1.2,
                    'תחבורה': 1.1
                }
            },
            'jerusalem': {
                name: 'ירושלים',
                multiplier: 1.1,
                mainAdjustments: {
                    'דיור': 1.2,
                    'מזון': 1.1
                }
            },
            'haifa': {
                name: 'חיפה',
                multiplier: 1.0,
                mainAdjustments: {
                    'דיור': 1.1
                }
            },
            'beer-sheva': {
                name: 'באר שבע',
                multiplier: 0.9,
                mainAdjustments: {
                    'דיור': 0.8,
                    'מזון': 0.95
                }
            },
            'peripheral': {
                name: 'ערים פריפריה',
                multiplier: 0.8,
                mainAdjustments: {
                    'דיור': 0.7,
                    'מזון': 0.9,
                    'תחבורה': 1.1
                }
            }
        };
    }

    generateRecommendations(templateId, userIncome, userExpenses = []) {
        const template = this.getTemplate(templateId);
        if (!template) return [];

        const recommendations = [];
        const appliedTemplate = this.applyTemplate(templateId, userIncome);

        // Compare actual expenses to template
        if (userExpenses.length > 0) {
            const expensesByCategory = {};
            userExpenses.forEach(expense => {
                expensesByCategory[expense.category] = 
                    (expensesByCategory[expense.category] || 0) + expense.amount;
            });

            appliedTemplate.categories.forEach(templateCategory => {
                const actualSpending = expensesByCategory[templateCategory.name] || 0;
                const budgetAmount = templateCategory.amount;
                const difference = actualSpending - budgetAmount;
                const percentDiff = (difference / budgetAmount) * 100;

                if (percentDiff > 20) {
                    recommendations.push({
                        type: 'warning',
                        category: templateCategory.name,
                        message: `הוצאה גבוהה מדי ב${templateCategory.name}: ₪${actualSpending.toLocaleString()} לעומת ₪${budgetAmount.toLocaleString()} בתקציב`,
                        suggestion: `נסה להפחית ב-₪${difference.toLocaleString()}`
                    });
                } else if (percentDiff < -20) {
                    recommendations.push({
                        type: 'success',
                        category: templateCategory.name,
                        message: `חיסכון מצוין ב${templateCategory.name}! חסכת ₪${Math.abs(difference).toLocaleString()}`,
                        suggestion: 'שקול להעביר את החיסכון לקטגוריית חסכונות'
                    });
                }
            });
        }

        return recommendations;
    }
}

// Export singleton instance
const israeliBudgetTemplates = new IsraeliBudgetTemplates();
export default israeliBudgetTemplates;

// Additional helper functions
export const formatTemplateForDisplay = (template) => {
    return {
        ...template,
        formattedCategories: template.categories.map(cat => ({
            ...cat,
            formattedAmount: `₪${cat.amount.toLocaleString()}`,
            formattedPercentage: `${cat.percentage}%`
        })),
        formattedTotalIncome: `₪${template.targetIncome.toLocaleString()}`
    };
};

export const createCustomTemplate = (name, description, categories, tips = []) => {
    const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 1) {
        throw new Error('האחוזים חייבים להסתכם ל-100%');
    }

    return {
        id: `custom-${Date.now()}`,
        name,
        description,
        targetIncome: 0,
        icon: '🔧',
        categories,
        tips,
        isCustom: true
    };
};