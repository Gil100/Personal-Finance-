# לוח מעקב פיננסי אישי - מהדורה ישראלית

מערכת מעקב פיננסי אישי מתקדמת המותאמת במיוחד לשוק הישראלי, עם תמיכה מלאה בעברית, שקלים ובנקים ישראליים.

## ✨ תכונות עיקריות

- 🇮🇱 **מותאם לישראל**: ממשק בעברית עם תמיכה מלאה ב-RTL
- 💰 **תמיכה בשקלים**: עיצוב מטבע מותאם לשוק הישראלי
- 🏦 **אינטגרציה עם בנקים ישראליים**: תמיכה בבנק הפועלים, לאומי, מזרחי טפחות ועוד
- 📊 **דוחות מתקדמים**: ניתוח פיננסי מעמיק עם גרפים וסטטיסטיקות
- 📱 **PWA**: אפליקציית אינטרנט מתקדמת עם פונקציונליות אופליין
- 🔒 **אבטחה מקסימלית**: הצפנה מתקדמת ואחסון מקומי בטוח

## 🚀 התחלה מהירה

### דרישות מערכת
- Node.js 18+ 
- npm או yarn

### התקנה
```bash
# שכפול הפרויקט
git clone [repository-url]
cd israeli-finance-dashboard

# התקנת dependencies
npm install

# הרצה במצב פיתוח
npm run dev

# בניית production
npm run build

# preview של הבנייה
npm run preview
```

### פריסה ל-GitHub Pages
```bash
# פריסה אוטומטית
npm run deploy
```

## 📁 מבנה הפרויקט

```
israeli-finance-dashboard/
├── src/
│   ├── components/          # רכיבי Vue/React (בהמשך)
│   ├── styles/             # קבצי CSS
│   │   └── main.css       # עיצוב ראשי עם תמיכה ב-RTL
│   ├── utils/             # פונקציות עזר
│   └── main.js           # נקודת כניסה ראשית
├── public/
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service Worker
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions לפריסה אוטומטית
├── index.html           # HTML ראשי עם תמיכה בעברית
├── vite.config.js      # הגדרות Vite
└── package.json        # הגדרות הפרויקט
```

## 🛠️ סטק טכנולוגי

- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **Build Tool**: Vite
- **Styling**: CSS Grid + Flexbox עם תמיכה מלאה ב-RTL
- **Fonts**: Assistant + Rubik (גופנים עבריים)
- **PWA**: Service Worker + Manifest
- **Deployment**: GitHub Pages + GitHub Actions

## 📋 מצב הפיתוח

### ✅ Checkpoint 1: Project Foundation & Setup - הושלם
- [x] מבנה פרויקט בסיסי
- [x] הגדרות Vite ו-package.json
- [x] HTML עם תמיכה בעברית
- [x] CSS framework עם תמיכה ב-RTL
- [x] גופנים עבריים
- [x] PWA manifest ו-service worker
- [x] GitHub Actions לפריסה
- [x] Environment configuration

### 🔄 הבא בתור
- Checkpoint 2: Core UI Framework & Hebrew Interface
- Checkpoint 3: Data Management & Storage
- וכן הלאה לפי הרודמפ...

## 🎯 מטרות הפרויקט

1. **Phase 1 (MVP)**: פונקציונליות בסיסית לניהול עסקאות
2. **Phase 2**: אינטגרציה עם בנקים ישראליים
3. **Phase 3**: תכונות מתקדמות ו-AI insights

## 📞 תמיכה

לשאלות או בעיות, אנא פתחו issue ב-GitHub.

## 📄 רישיון

MIT License - ראו קובץ LICENSE לפרטים נוספים.

---

*פותח עם ❤️ לקהילה הישראלית*