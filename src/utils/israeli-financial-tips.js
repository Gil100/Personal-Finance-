/**
 * Israeli-Specific Financial Tips and Insights
 * Contextual financial advice tailored for Israeli users
 */

// Israeli financial tips by category
export const ISRAELI_FINANCIAL_TIPS = {
    // Tax-related tips
    taxes: [
        {
            title: 'ניצול זיכויי מס',
            tip: 'וודאו שאתם מנצלים את כל זיכויי המס המגיעים לכם - זיכוי על ילדים, נישואין, ולימודים',
            category: 'מסים',
            priority: 'high',
            savings: 'עד ₪2,320 לחודש'
        },
        {
            title: 'דיווח שנתי מדויק',
            tip: 'שמרו קבלות והוכחות הוצאה לדיווח השנתי - יכול לחסוך אלפי שקלים במס',
            category: 'מסים',
            priority: 'medium',
            savings: 'עד ₪5,000 לשנה'
        },
        {
            title: 'שנת המס הישראלית',
            tip: 'זכרו שהשנה המס בישראל היא מ-1 באפריל עד 31 במרץ, תכננו בהתאם',
            category: 'מסים',
            priority: 'medium',
            savings: 'תכנון טוב'
        }
    ],

    // Banking tips
    banking: [
        {
            title: 'השוואת עמלות בנקאיות',
            tip: 'השוו עמלות בין הבנקים השונים - הפרש של מאות שקלים לשנה אפשרי',
            category: 'בנקאות',
            priority: 'high',
            savings: 'עד ₪1,200 לשנה'
        },
        {
            title: 'חשבון דיגיטלי',
            tip: 'עברו לבנקאות דיגיטלית לחיסכון בעמלות ונוחות בניהול',
            category: 'בנקאות',
            priority: 'medium',
            savings: 'עד ₪500 לשנה'
        },
        {
            title: 'מינוס מאושר',
            tip: 'סדרו מינוס מאושר מראש במקום להיכנס למינוס לא מאושר עם עמלות גבוהות',
            category: 'בנקאות',
            priority: 'high',
            savings: 'עד ₪2,000 לשנה'
        }
    ],

    // Housing tips specific to Israel
    housing: [
        {
            title: 'ארנונה - זכויות הנחה',
            tip: 'בדקו זכאות להנחות ארנונה - משפחות עם ילדים, קשישים, ואנשים עם מוגבלות זכאים להנחות',
            category: 'דיור',
            priority: 'high',
            savings: 'עד ₪3,000 לשנה'
        },
        {
            title: 'משכנתא - מחזור',
            tip: 'בדקו אפשרות למחזור משכנתא אם הריבית ירדה משמעותית מאז נטילת ההלוואה',
            category: 'דיור',
            priority: 'high',
            savings: 'עד ₪50,000 לשנה'
        },
        {
            title: 'חיסכון בחשמל',
            tip: 'השתמשו במכשירי חשמל חסכוניים וזמני חשמל זול - הפרש משמעותי בחשבון החשמל',
            category: 'דיור',
            priority: 'medium',
            savings: 'עד ₪1,500 לשנה'
        }
    ],

    // Investment tips for Israeli market
    investment: [
        {
            title: 'פנסיה וקופות גמל',
            tip: 'השתתפו בקופת גמל ופנסיה - זיכוי מס מיידי ובניית עתיד פיננסי',
            category: 'השקעות',
            priority: 'high',
            savings: 'זיכוי מס + עתיד'
        },
        {
            title: 'קרן חירום',
            tip: 'צברו קרן חירום של 6-12 משכורות חודשיות לביטחון פיננסי',
            category: 'השקעות',
            priority: 'high',
            savings: 'ביטחון פיננסי'
        },
        {
            title: 'השקעה הדרגתית',
            tip: 'השקיעו סכומים קבועים מדי חודש במקום סכום גדול בבת אחת',
            category: 'השקעות',
            priority: 'medium',
            savings: 'מיצוע עלויות'
        }
    ],

    // Shopping and daily expenses
    shopping: [
        {
            title: 'השוואת מחירים',
            tip: 'השתמשו באפליקציות השוואת מחירים לפני קניות גדולות - חיסכון משמעותי אפשרי',
            category: 'קניות',
            priority: 'medium',
            savings: 'עד ₪2,000 לשנה'
        },
        {
            title: 'קניות בכמויות',
            tip: 'קנו מוצרי יסוד בכמויות גדולות ממועדוני קניות - חיסכון למשפחות',
            category: 'קניות',
            priority: 'medium',
            savings: 'עד ₪3,000 לשנה'
        },
        {
            title: 'תכנון רשימת קניות',
            tip: 'תכננו רשימת קניות מראש ודבקו בה למניעת קניות מיותרות',
            category: 'קניות',
            priority: 'medium',
            savings: 'עד ₪1,500 לשנה'
        }
    ],

    // Transportation tips
    transportation: [
        {
            title: 'תחבורה ציבורית',
            tip: 'השתמשו בתחבורה ציבורית במקום רכב פרטי - חיסכון משמעותי בדלק וחניה',
            category: 'תחבורה',
            priority: 'medium',
            savings: 'עד ₪10,000 לשנה'
        },
        {
            title: 'ביטוח רכב מקיף',
            tip: 'השוו מחירי ביטוח רכב בין חברות שונות - הפרש של מאות שקלים אפשרי',
            category: 'תחבורה',
            priority: 'high',
            savings: 'עד ₪2,000 לשנה'
        }
    ]
};

// Monthly Israeli financial insights
export const MONTHLY_INSIGHTS = {
    january: {
        title: 'ינואר - תכנון השנה החדשה',
        insights: [
            'זמן מצוין להגדיר יעדים פיננסיים לשנה החדשה',
            'בדקו אם יש עדכונים בשיעורי המס וזיכויים',
            'תכננו את תקציב החופשות לקיץ'
        ]
    },
    february: {
        title: 'פברואר - הכנה לשנת המס',
        insights: [
            'התחילו לאסוף מסמכים לדיווח השנתי',
            'בדקו זכאות לזיכויי מס נוספים',
            'תכננו השקעות שעלולות להשפיע על המס'
        ]
    },
    march: {
        title: 'מרץ - סיום שנת המס',
        insights: [
            'סיום שנת המס הישראלית - זמן אחרון לזיכויים',
            'הגישו דיווח שנתי אם נדרש',
            'תכננו לשנת המס החדשה שמתחילה באפריל'
        ]
    },
    april: {
        title: 'אפריל - תחילת שנת מס חדשה',
        insights: [
            'תחילת שנת המס החדשה - תכננו בהתאם',
            'בדקו עדכוני שיעורי מס וזיכויים',
            'זמן מצוין לסקירת תיק ההשקעות'
        ]
    }
};

// Seasonal financial tips
export const SEASONAL_TIPS = {
    holidays: [
        {
            title: 'חגי תשרי',
            tip: 'תכננו מראש הוצאות החגים - מזון, בגדים, מתנות. חיסכון הדרגתי לאורך השנה',
            savings: 'עד ₪5,000 לחגים'
        },
        {
            title: 'פסח',
            tip: 'התחילו לחסוך לפסח כבר מחודש ינואר - הוצאות גבוהות על מזון ונקיון',
            savings: 'עד ₪3,000 לפסח'
        }
    ],
    summer: [
        {
            title: 'חופש הגדול',
            tip: 'תכננו מראש פעילויות לילדים בחופש - מחנות קיץ יכולים להיות יקרים',
            savings: 'עד ₪8,000 לקיץ'
        }
    ]
};

// Financial tips manager class
export class IsraeliFinancialTipsManager {
    constructor() {
        this.tips = ISRAELI_FINANCIAL_TIPS;
        this.monthlyInsights = MONTHLY_INSIGHTS;
        this.seasonalTips = SEASONAL_TIPS;
    }

    // Get tips by category
    getTipsByCategory(category) {
        return this.tips[category] || [];
    }

    // Get high priority tips
    getHighPriorityTips() {
        const highPriorityTips = [];
        Object.values(this.tips).forEach(categoryTips => {
            categoryTips.forEach(tip => {
                if (tip.priority === 'high') {
                    highPriorityTips.push(tip);
                }
            });
        });
        return highPriorityTips;
    }

    // Get monthly insights
    getMonthlyInsights(month = null) {
        if (!month) {
            month = new Date().toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
        }
        
        const monthMapping = {
            'january': 'january',
            'february': 'february', 
            'march': 'march',
            'april': 'april'
        };
        
        return this.monthlyInsights[monthMapping[month]] || null;
    }

    // Get seasonal tips
    getSeasonalTips(season) {
        return this.seasonalTips[season] || [];
    }

    // Get personalized tips based on user data
    getPersonalizedTips(userData = {}) {
        const personalizedTips = [];
        const { hasChildren, hasProperty, monthlyIncome, age } = userData;

        // Tax tips for families
        if (hasChildren) {
            personalizedTips.push({
                title: 'זיכוי על ילדים',
                tip: 'וודאו שאתם מקבלים זיכוי מס על כל הילדים - זה יכול להיות אלפי שקלים לשנה',
                category: 'מסים',
                savings: `עד ₪${hasChildren * 2320 * 12} לשנה`
            });
        }

        // Property tips
        if (hasProperty) {
            personalizedTips.push(...this.getTipsByCategory('housing'));
        }

        // Age-based tips
        if (age && age > 45) {
            personalizedTips.push({
                title: 'תכנון פרישה',
                tip: 'התחילו לתכנן פרישה - פנסיה תקציבית וקופות גמל חשובות יותר',
                category: 'השקעות',
                priority: 'high'
            });
        }

        // Income-based tips
        if (monthlyIncome && monthlyIncome > 20000) {
            personalizedTips.push({
                title: 'מס על הכנסה גבוהה',
                tip: 'בדקו אופציות להפחתת מס - פנסיה, קופת גמל, השקעות מועדפות',
                category: 'מסים',
                priority: 'high'
            });
        }

        return personalizedTips;
    }

    // Get tip of the day
    getTipOfTheDay() {
        const allTips = [];
        Object.values(this.tips).forEach(categoryTips => {
            allTips.push(...categoryTips);
        });
        
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const tipIndex = dayOfYear % allTips.length;
        
        return allTips[tipIndex];
    }

    // Search tips by keyword
    searchTips(keyword) {
        const results = [];
        const searchTerm = keyword.toLowerCase();
        
        Object.values(this.tips).forEach(categoryTips => {
            categoryTips.forEach(tip => {
                if (tip.title.includes(keyword) || 
                    tip.tip.includes(keyword) || 
                    tip.category.includes(keyword)) {
                    results.push(tip);
                }
            });
        });
        
        return results;
    }

    // Get financial health score tips
    getFinancialHealthTips(score) {
        if (score >= 80) {
            return [
                {
                    title: 'מצב פיננסי מצוין',
                    tip: 'המשיכו כך! התמקדו בהשקעות ארוכות טווח ותכנון פרישה',
                    category: 'כללי'
                }
            ];
        } else if (score >= 60) {
            return [
                {
                    title: 'מצב פיננסי טוב',
                    tip: 'שפרו את קרן החירום והפחיתו חובות להגעה למצוינות',
                    category: 'כללי'
                }
            ];
        } else {
            return [
                {
                    title: 'זקוק לשיפור',
                    tip: 'התמקדו בהפחתת חובות ובניית קרן חירום בסיסית',
                    category: 'כללי',
                    priority: 'high'
                }
            ];
        }
    }
}

// Create global instance
window.IsraeliFinancialTipsManager = IsraeliFinancialTipsManager;
window.financialTips = new IsraeliFinancialTipsManager();

// Global helper functions
window.getTipsByCategory = (category) => window.financialTips.getTipsByCategory(category);
window.getHighPriorityTips = () => window.financialTips.getHighPriorityTips();
window.getTipOfTheDay = () => window.financialTips.getTipOfTheDay();
window.getPersonalizedTips = (userData) => window.financialTips.getPersonalizedTips(userData);

console.log('💡 Israeli Financial Tips loaded successfully');

export default IsraeliFinancialTipsManager;