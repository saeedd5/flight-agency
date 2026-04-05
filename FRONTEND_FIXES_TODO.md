# 🔧 لیست رفع مشکلات فرانت‌اند

## 🔴 اولویت بحرانی (Critical Priority)

### 1. ✅ امنیت: حذف توکن Sabre از فرانت‌اند
**مشکل:** توکن API در `.env` فرانت‌اند قرار دارد و در معرض دید عموم است.

**کارهای لازم:**
- [ ] حذف `VITE_SABRE_TOKEN` از `frontend/.env`
- [ ] انتقال تمام درخواست‌های Sabre به backend
- [ ] ایجاد endpoint جدید در backend برای proxy کردن درخواست‌های Sabre
- [ ] به‌روزرسانی `saberApi.js` برای استفاده از backend endpoint
- [ ] اضافه کردن rate limiting در backend

**فایل‌های تحت تأثیر:**
- `frontend/.env`
- `frontend/src/services/saberApi.js`
- `backend/Controllers/` (ایجاد SabreProxyController)

---

### 2. ✅ امنیت: بهبود مدیریت Authentication Token
**مشکل:** JWT token در localStorage ذخیره می‌شود (آسیب‌پذیر در برابر XSS)

**کارهای لازم:**
- [ ] تغییر از localStorage به httpOnly cookies
- [ ] اضافه کردن CSRF protection
- [ ] اضافه کردن token refresh mechanism
- [ ] بهبود token expiration handling

**فایل‌های تحت تأثیر:**
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/services/adminApi.js`
- `backend/Infrastructure/Identity/JwtTokenService.cs`

---

### 3. ✅ امنیت: اضافه کردن Input Validation
**مشکل:** validation ناکافی برای ورودی‌های کاربر

**کارهای لازم:**
- [ ] اضافه کردن regex validation برای airport codes
- [ ] اضافه کردن sanitization برای تمام input fields
- [ ] اضافه کردن validation schema با Zod یا Yup
- [ ] بهبود error messages

**فایل‌های تحت تأثیر:**
- `frontend/src/App.jsx`
- `frontend/src/components/FlightSearchForm/FlightSearchForm.jsx`
- `frontend/src/components/BookingModal/BookingModal.jsx`

---

## 🟡 اولویت بالا (High Priority)

### 4. ✅ حذف Console Logs از Production
**مشکل:** console.log/error در کد production

**کارهای لازم:**
- [ ] حذف تمام console.log از کد
- [ ] نگه داشتن فقط console.error برای خطاهای واقعی
- [ ] اضافه کردن logger utility (مثلاً با log levels)
- [ ] اضافه کردن Sentry برای error tracking

**فایل‌های تحت تأثیر:**
- `frontend/src/components/SaberTest/SaberTest.jsx`
- `frontend/src/components/BookingModal/BookingModal.jsx`
- `frontend/src/admin/pages/*.jsx`
- `frontend/src/contexts/AuthContext.jsx`

---

### 5. ✅ بهینه‌سازی Bundle Size
**مشکل:** vendor bundle بیش از 850KB است

**کارهای لازم:**
- [ ] Tree shaking بهتر برای Ant Design
- [ ] استفاده از dynamic imports برای admin pages
- [ ] بررسی و حذف dependencies غیرضروری
- [ ] اضافه کردن compression (gzip/brotli)
- [ ] استفاده از CDN برای کتابخانه‌های بزرگ

**فایل‌های تحت تأثیر:**
- `frontend/vite.config.js`
- `frontend/package.json`
- `frontend/src/App.jsx`

---

### 6. ✅ اضافه کردن Request Cancellation
**مشکل:** درخواست‌های قبلی cancel نمی‌شوند

**کارهای لازم:**
- [ ] اضافه کردن AbortController به API calls
- [ ] پیاده‌سازی cleanup در useEffect
- [ ] اضافه کردن debouncing برای search
- [ ] بهبود loading states

**فایل‌های تحت تأثیر:**
- `frontend/src/App.jsx`
- `frontend/src/services/saberApi.js`
- `frontend/src/services/adminApi.js`

---

## 🟢 اولویت متوسط (Medium Priority)

### 7. ✅ Refactoring: کاهش Code Duplication
**مشکل:** تکرار کد در FlightSearchForm

**کارهای لازم:**
- [ ] ایجاد کامپوننت `AirportSelector` قابل استفاده مجدد
- [ ] استخراج logic مشترک به custom hooks
- [ ] ایجاد shared utilities

**فایل‌های تحت تأثیر:**
- `frontend/src/components/FlightSearchForm/FlightSearchForm.jsx`
- ایجاد: `frontend/src/components/shared/AirportSelector.jsx`
- ایجاد: `frontend/src/hooks/useAirportSearch.js`

---

### 8. ✅ Refactoring: تقسیم فایل‌های بزرگ
**مشکل:** App.jsx و FlightCard.jsx خیلی بزرگ هستند

**کارهای لازم:**
- [ ] تقسیم App.jsx به کامپوننت‌های کوچکتر
- [ ] استخراج FlightSearchPage به فایل جداگانه
- [ ] تقسیم FlightCard به sub-components
- [ ] ایجاد custom hooks برای business logic

**فایل‌های تحت تأثیر:**
- `frontend/src/App.jsx` (427 خط)
- `frontend/src/components/FlightCard/FlightCard.jsx` (383 خط)
- ایجاد: `frontend/src/pages/FlightSearchPage.jsx`
- ایجاد: `frontend/src/hooks/useFlightSearch.js`

---

### 9. ✅ بهبود Error Handling
**مشکل:** error handling ناهماهنگ و پیام‌های hardcoded

**کارهای لازم:**
- [ ] اضافه کردن Error Boundary component
- [ ] یکپارچه‌سازی error messages با translation context
- [ ] بهبود user-facing error messages
- [ ] اضافه کردن retry mechanism

**فایل‌های تحت تأثیر:**
- `frontend/src/services/saberApi.js`
- ایجاد: `frontend/src/components/ErrorBoundary.jsx`
- `frontend/src/contexts/TranslationContext.jsx`

---

### 10. ✅ بهبود Performance با React Query
**مشکل:** مدیریت دستی state برای API calls

**کارهای لازم:**
- [ ] نصب و راه‌اندازی React Query
- [ ] تبدیل API calls به React Query hooks
- [ ] اضافه کردن caching strategy
- [ ] اضافه کردن optimistic updates

**فایل‌های تحت تأثیر:**
- `frontend/package.json`
- `frontend/src/App.jsx`
- `frontend/src/admin/pages/*.jsx`
- ایجاد: `frontend/src/hooks/queries/`

---

### 11. ✅ اضافه کردن Debouncing
**مشکل:** فیلترها بدون debouncing اعمال می‌شوند

**کارهای لازم:**
- [ ] اضافه کردن debounce به filter changes
- [ ] اضافه کردن debounce به search input
- [ ] بهبود UX با loading indicators

**فایل‌های تحت تأثیر:**
- `frontend/src/components/FiltersSidebar/FiltersSidebar.jsx`
- ایجاد: `frontend/src/hooks/useDebounce.js`

---

## 🔵 اولویت پایین (Low Priority)

### 12. ✅ بهبود Responsive Design
**مشکل:** فقط یک breakpoint وجود دارد

**کارهای لازم:**
- [ ] اضافه کردن breakpoints برای mobile (480px)
- [ ] اضافه کردن breakpoints برای tablet (768px)
- [ ] تست در دستگاه‌های مختلف
- [ ] بهبود mobile navigation

**فایل‌های تحت تأثیر:**
- `frontend/src/App.css`
- `frontend/src/components/**/*.css`

---

### 13. ✅ بهبود Accessibility (a11y)
**مشکل:** accessibility ناقص

**کارهای لازم:**
- [ ] اضافه کردن ARIA labels
- [ ] بهبود keyboard navigation
- [ ] اضافه کردن focus indicators
- [ ] تست با screen readers
- [ ] اضافه کردن skip links

**فایل‌های تحت تأثیر:**
- تمام کامپوننت‌ها

---

### 14. ✅ اضافه کردن Testing
**مشکل:** هیچ test وجود ندارد

**کارهای لازم:**
- [ ] راه‌اندازی Vitest
- [ ] نوشتن unit tests برای utilities
- [ ] نوشتن component tests با React Testing Library
- [ ] اضافه کردن E2E tests با Playwright
- [ ] اضافه کردن test coverage reporting

**فایل‌های جدید:**
- `frontend/vitest.config.js`
- `frontend/src/**/*.test.jsx`
- `frontend/e2e/*.spec.js`

---

### 15. ✅ اضافه کردن Linting و Formatting
**مشکل:** عدم وجود linting rules

**کارهای لازم:**
- [ ] نصب و راه‌اندازی ESLint
- [ ] نصب و راه‌اندازی Prettier
- [ ] اضافه کردن Husky برای pre-commit hooks
- [ ] اضافه کردن lint-staged
- [ ] رفع تمام linting errors

**فایل‌های جدید:**
- `frontend/.eslintrc.js`
- `frontend/.prettierrc`
- `frontend/.husky/`

---

### 16. ✅ جایگزینی Inline Styles با CSS Classes
**مشکل:** استفاده زیاد از inline styles

**کارهای لازم:**
- [ ] استخراج inline styles به CSS modules
- [ ] ایجاد theme system
- [ ] استفاده از CSS variables

**فایل‌های تحت تأثیر:**
- تمام کامپوننت‌ها

---

### 17. ✅ Migration به TypeScript
**مشکل:** عدم type safety

**کارهای لازم:**
- [ ] راه‌اندازی TypeScript
- [ ] تبدیل تدریجی فایل‌ها به .tsx
- [ ] اضافه کردن type definitions
- [ ] رفع type errors

**فایل‌های تحت تأثیر:**
- تمام فایل‌های .js و .jsx

---

### 18. ✅ اضافه کردن PWA Support
**مشکل:** عدم پشتیبانی از offline mode

**کارهای لازم:**
- [ ] اضافه کردن Service Worker
- [ ] اضافه کردن manifest.json
- [ ] پیاده‌سازی offline caching strategy
- [ ] اضافه کردن install prompt

**فایل‌های جدید:**
- `frontend/public/manifest.json`
- `frontend/src/service-worker.js`

---

### 19. ✅ اضافه کردن Monitoring و Analytics
**مشکل:** عدم tracking خطاها و رفتار کاربر

**کارهای لازم:**
- [ ] نصب و راه‌اندازی Sentry
- [ ] اضافه کردن Google Analytics یا Plausible
- [ ] اضافه کردن performance monitoring
- [ ] اضافه کردن user session recording (optional)

**فایل‌های تحت تأثیر:**
- `frontend/src/main.jsx`
- `frontend/vite.config.js`

---

### 20. ✅ بهبود Build و Deployment
**مشکل:** فرآیند build قابل بهبود است

**کارهای لازم:**
- [ ] اضافه کردن CI/CD pipeline
- [ ] اضافه کردن environment-specific builds
- [ ] بهبود caching strategy
- [ ] اضافه کردن health checks

**فایل‌های جدید:**
- `.github/workflows/frontend-ci.yml`
- `frontend/Dockerfile`
- `frontend/nginx.conf`

---

## 📊 خلاصه آماری

- **مجموع تسک‌ها:** 20 مورد اصلی
- **اولویت بحرانی:** 3 مورد (امنیتی)
- **اولویت بالا:** 3 مورد (performance و stability)
- **اولویت متوسط:** 5 مورد (code quality)
- **اولویت پایین:** 9 مورد (enhancement)

---

## 🎯 پیشنهاد ترتیب اجرا

### فاز 1: امنیت (هفته 1)
1. حذف توکن Sabre از فرانت‌اند
2. بهبود مدیریت Authentication
3. اضافه کردن Input Validation

### فاز 2: کیفیت کد (هفته 2-3)
4. حذف Console Logs
5. اضافه کردن Request Cancellation
6. کاهش Code Duplication
7. تقسیم فایل‌های بزرگ

### فاز 3: Performance (هفته 4)
8. بهینه‌سازی Bundle Size
9. بهبود Error Handling
10. اضافه کردن Debouncing

### فاز 4: Developer Experience (هفته 5-6)
11. اضافه کردن Linting و Formatting
12. اضافه کردن Testing
13. بهبود Performance با React Query

### فاز 5: Enhancement (هفته 7+)
14. بهبود Responsive Design
15. بهبود Accessibility
16. اضافه کردن Monitoring
17. سایر بهبودها

---

## 🚀 شروع کار

آیا می‌خواهید از **فاز 1 (امنیت)** شروع کنیم؟
من می‌توانم به ترتیب اولویت شروع به رفع مشکلات کنم.

کدام مورد را اول انجام دهم؟
