# API Testing Tool

[![Tests](https://github.com/shaytveria/api-testing-tool/actions/workflows/tests.yml/badge.svg)](https://github.com/shaytveria/api-testing-tool/actions/workflows/tests.yml)



כלי פשוט לבדיקות API אוטומטיות. בניתי את זה כדי לבדוק REST APIs בצורה מהירה ויעילה, עם דוחות JSON שמכילים את כל מה שצריך.

## מה יש כאן?

- בדיקות API אוטומטיות - פשוט להריץ וזה עובד
- בדיקות ביצועים - בודק כמה זמן לוקח ל-API להגיב
- דוחות JSON - כל התוצאות נשמרות בקובץ JSON נוח לעיבוד
- בדיקות Edge Cases - גם מקרים קצה נבדקים
- מבוסס על Jest - Framework מוכר ונוח

## מה צריך כדי להריץ?

- Node.js (גרסה 14 או יותר)
- npm (מגיע עם Node.js)

## איך מתקינים?

```bash
# Clone את הפרויקט
git clone <your-repo-url>
cd api-testing-tool

# התקן את התלויות
npm install
```

## איך מריצים בדיקות?

```bash
# הרצת כל הבדיקות
npm test

# הרצה במצב watch (עוקב אחרי שינויים)
npm run test:watch

# הרצה עם coverage
npm run test:coverage

# הרצת קובץ בדיקות ספציפי
npm run test:countries
```

## דוגמאות שימוש

### יצירת בדיקה חדשה

אם אתה רוצה להוסיף בדיקה חדשה, פשוט פתח את `src/tests/countries.test.js` והוסף:

```javascript
test('should get country by capital', async () => {
  const result = await testAPI({
    name: 'Get Country by Capital',
    url: `${config.baseURL}/capital/jerusalem`,
    method: 'GET',
    expectedStatus: 200,
    maxResponseTime: 2000,
    validateResponse: (data) => {
      if (!Array.isArray(data)) return 'Response should be an array';
      const hasJerusalem = data.some(c => 
        c.capital && c.capital.includes('Jerusalem')
      );
      return hasJerusalem || 'Jerusalem not found in results';
    },
  });
  
  expect(result.status).toBe('PASS');
});
```

### קריאת דוחות JSON

אחרי הרצת הבדיקות, תוכל לקרוא את הדוחות:

```javascript
const fs = require('fs');
const report = JSON.parse(
  fs.readFileSync('reports/json-reports/countries-api-report-*.json', 'utf8')
);

console.log(`Total Tests: ${report.summary.totalTests}`);
console.log(`Pass Rate: ${report.summary.passRate}%`);
console.log(`Average Response Time: ${report.summary.averageResponseTime}ms`);

// עיבוד התוצאות
report.tests.forEach(test => {
  console.log(`${test.name}: ${test.status} (${test.responseTime}ms)`);
});
```

### שימוש ב-API Client ישירות

אפשר גם להשתמש בפונקציות ישירות בקוד שלך:

```javascript
const { testAPI, checkPerformance } = require('./src/utils/api-client');

// בדיקה פשוטה
const result = await testAPI({
  name: 'My Custom Test',
  url: 'https://api.example.com/data',
  method: 'GET',
  expectedStatus: 200,
  maxResponseTime: 1000,
});

console.log(result.status); // 'PASS' or 'FAIL'
console.log(result.responseTime); // זמן התגובה במילישניות
```

## איפה הדוחות?

אחרי שהבדיקות רצות, הדוחות נשמרים אוטומטית ב:
```
reports/json-reports/
```

כל קובץ נקרא `countries-api-report-*.json` ומכיל את כל התוצאות בפורמט JSON - נוח לעיבוד ולניתוח.

## מבנה הפרויקט

```
api-testing-tool/
├── src/
│   ├── tests/
│   │   └── countries.test.js      # הבדיקות עצמן
│   ├── utils/
│   │   ├── api-client.js         # כל הפונקציות לשליחת בקשות
│   │   └── reporter.js           # יוצר את הדוחות ב-JSON
│   └── config/
│       └── test-config.js        # כל ההגדרות במקום אחד
├── reports/
│   └── json-reports/             # כאן נשמרים הדוחות
├── package.json
└── README.md
```

## מה נבדק?

הפרויקט בודק את REST Countries API:

1. **GET /all** - מקבל את כל המדינות
2. **GET /name/{name}** - מחפש מדינה לפי שם
3. **GET /alpha/{code}** - מחפש מדינה לפי קוד (כמו IL, US וכו')
4. **GET /region/{region}** - מקבל מדינות לפי אזור
5. **Error Handling** - בודק מה קורה כשמשהו לא עובד (404 וכו')
6. **Performance** - בודק כמה זמן לוקח לכל בקשה

### מה נבדק בכל בקשה?

- Status Code - האם הקוד נכון (200, 404 וכו')
- מבנה התגובה - האם הנתונים מגיעים כמו שצריך
- זמן תגובה - כמה זמן לוקח ל-API להגיב
- Edge Cases - גם מקרים קצה נבדקים

## דוגמה לבדיקה

```javascript
test('should get all countries', async () => {
  const result = await testAPI({
    name: 'Get All Countries',
    url: 'https://restcountries.com/v3.1/all',
    method: 'GET',
    expectedStatus: 200,
    maxResponseTime: 2000,
    validateResponse: (data) => {
      // כאן אפשר להוסיף ולידציה מותאמת אישית
      return Array.isArray(data) && data.length > 0;
    },
  });
  
  expect(result.status).toBe('PASS');
});
```

## טכנולוגיות

- **Node.js** - סביבת הריצה
- **JavaScript (ES6+)** - השפה
- **Axios** - לשליחת בקשות HTTP
- **Jest** - Framework לבדיקות

## מה יש בדוחות?

כל דוח JSON כולל:
- סיכום כללי - כמה בדיקות עברו/נכשלו, אחוז הצלחה
- זמן תגובה ממוצע
- פירוט של כל בדיקה - מה נבדק, מה התוצאה
- Assertions - כל הבדיקות שבוצעו
- הודעות שגיאה - אם משהו לא עבד

## CI/CD

הפרויקט כולל GitHub Actions שרצות את הבדיקות אוטומטית בכל push או pull request. הבדיקות רצות על Node.js 18 ו-20 כדי לוודא תאימות.

## מה אפשר להוסיף בעתיד?

- בדיקות אבטחה
- בדיקות עומס (Load Testing)
- ייצוא ל-CSV
- Dashboard עם גרפים יפים
- תמיכה ב-APIs נוספים

## רישיון

MIT

## אודות

פרויקט זה נבנה כחלק מהתיק עבודות שלי, כדי להראות יכולות בבדיקות API אוטומטיות.

---

**הערה:** הפרויקט נבנה למטרות למידה והצגה בקורות חיים.
