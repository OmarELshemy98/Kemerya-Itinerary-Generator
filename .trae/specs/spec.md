# Kemerya Itinerary Generator — Specification Document

## 1. Problem Statement

يحتوي مشروع Kemerya Itinerary Generator حالياً على:
- **بيانات ثابتة (Static)**: مصفوفات TOURS و MAIN_CATEGORIES و SUB_CATEGORIES مكتوبة hardcoded في ملف tours.ts، مع توليد أسعار وعناوين افتراضية عشوائية لا تعكس المحتوى الحقيقي للـ website.
- **العملة الافتراضية يورو (EUR)**: رغم أن الـ website الأصلي يعمل بالدولار الأمريكي (USD).
- **عدم وجود نظام مصادقة (Auth)**: أي شخص يفتح الـ dashboard يعمل كل العمليات بدون تسجيل دخول، بدون مستخدمين أو صلاحيات.
- **تخزين ملفاتي للـ cache**: ملف tours-cache.json غير مناسب لـ Vercel Serverless حيث الكتابة على filesystem دائماً غير persistent.
- **عدم تحديث البيانات تلقائياً**: لا يوجد آلية refresh دورية للأسعار و itineraries من الـ website.

## 2. Users & Goals

| المستخدم | الأهداف |
|-----------|---------|
| Super Admin (Omar Elshemy) | إدارة حسابات المستخدمين: إضافة / تعديل صلاحيات / حذف. الوصول الكامل لكل الميزات. تحديث البيانات من الـ website. |
| Sub Users (الموظفين) | إنشاء Itineraries PDF للعملاء، مشاركة على WhatsApp، تصفح الكتالوج — حسب الصلاحيات الممنوحة لهم. |
| الموقع (kemeryatours.com) | مصدر البيانات الحقيقي للأسعار والـ tours والـ itineraries (dynamic source of truth). |

## 3. Goals

- **G1**: مسح جميع الـ static data في `tours.ts` وجعل تحميل الـ tours والـ categories ديناميكياً من kemeryatours.com فقط (مع cache ذكي قابل للـ expire).
- **G2**: جعل العملة الافتراضية **USD ($)** في كل مكان (form defaults, display, PDF). إبقاء خيار EUR موجود ولكن كـ option ثانوي فقط.
- **G3**: بناء نظام **Login / Authentication + Authorization (RBAC)** بمستخدمي super admin و sub users مع صلاحيات قابلة للتخصيص.
- **G4**: الـ Super Admin account الجاهز: `omarelshemy010@gmail.com` / `Omar@1998` — موجود من أول تشغيل (seeded).
- **G5**: إدارة المستخدمين من داخل الـ dashboard: Super Admin يضيف / يعدل صلاحيات / يحذف أي مستخدم.
- **G6**: تحديث تلقائي للأسعار و itineraries من الـ website مع آلية cache + TTL + زر manual sync.
- **G7**: إصلاح جميع الـ warnings و errors الحالية (alt text للصور و أي issues أخرى).
- **G8**: إعداد المشروع بالكامل للـ deployment على Vercel (Supabase للـ auth + DB، environment variables، production build ناجح).

## 4. Non-Goals

- **NG1**: لن نعيد تصميم الـ UI للـ dashboard أو الـ PDF (بس نصلح الـ alt text ونغير default currency).
- **NG2**: لن نعمل public-facing pages للعملاء — الـ app يبقى internal operations dashboard فقط.
- **NG3**: لن ندعم social login (Google/Facebook). فقط Email + Password.
- **NG4**: لن نخزن الـ bookings بشكل دائم في الـ DB في هذي المرحلة (يبقى في memory للجلسة الحالية).

## 5. Functional Requirements

### 5.1 Authentication (FR-AUTH)
- **FR-AUTH-1**: صفحة `/login` تحتوي على نموذج Email + Password.
- **FR-AUTH-2**: Middleware أو Route Guard: أي زائر غير مسجل دخول يحاول فتح `/dashboard` أو أي route محمي → يُعاد توجيهه لـ `/login`.
- **FR-AUTH-3**: بعد تسجيل دخول ناجح → حفظ session في secure HTTP cookie + redirect لـ `/dashboard`.
- **FR-AUTH-4**: زر Logout في dashboard header يمسح الـ session ويرجع لـ `/login`.
- **FR-AUTH-5**: بعد تسجيل خروج → لا يمكن الوصول للمحمسين بدون login.
- **FR-AUTH-6**: Seed تلقائي لحساب Super Admin عند أول إعداد لـ DB:
  - Email: `omarelshemy010@gmail.com`
  - Password: `Omar@1998`
  - Role: `super_admin`

### 5.2 User Management (FR-USERS)
- **FR-USERS-1**: Super Admin يشوف صفحة إدارة المستخدمين `/admin/users`.
- **FR-USERS-2**: نموذج إضافة مستخدم جديد: الاسم الكامل، الـ Email، الـ Password، الـ Role (صلاحيات).
- **FR-USERS-3**: Roles المتاحة:
  - `super_admin`: كل الصلاحيات (إدارة مستخدمين + تحديث بيانات + إنشاء itineraries).
  - `admin`: كل الصلاحيات عدا إدارة مستخدمين وإنشاء super admin جديد.
  - `operator`: إنشاء itineraries فقط + تصفح الكتالوج.
  - `viewer`: تصفح فقط بدون تعديل أو إنشاء PDF.
- **FR-USERS-4**: تعديل صلاحيات أي مستخدم (تغيير Role أو تعطيل الحساب).
- **FR-USERS-5**: حذف مستخدم مع تأكيد (modal confirm).
- **FR-USERS-6**: عرض قائمة المستخدمين: الاسم، الـ Email، الـ Role، الحالة (نشط/معطل)، تاريخ الإنشاء.
- **FR-USERS-7**: لا يسمح لحساب أقل صلاحية من super_admin بإدارة حسابات المستخدمين.

### 5.3 Dynamic Data (FR-DATA)
- **FR-DATA-1**: حذف كامل الـ static-generated `TOURS` array و `generateTours()` function و static inclusions/exclusions/itinerary placeholders.
- **FR-DATA-2**: إزالة `FALLBACK_TOURS` و `FALLBACK_MAIN` و `FALLBACK_SUB` من `tours-data-provider.tsx` — لو الـ cache فاضية، نبعت loading و نحاول السحب من الـ website.
- **FR-DATA-3**: حفظ الـ scraped data في **Supabase table** (tours, categories) بدلاً من ملف JSON.
- **FR-DATA-4**: الـ API route `/api/tours` يجيب من Supabase cache أولاً — لو فيه بيانات قديمة أو فاضية → triggers background scrape.
- **FR-DATA-5**: Cache TTL: يتم اعتبار الـ tours stale بعد 24 ساعة (86400 ثانية) و يتم refresh تلقائي في الـ background.
- **FR-DATA-6**: زر "Sync from kemeryatours.com" المتوفر حالياً في الـ header يستمر بالعمل ويدعم manual force refresh.
- **FR-DATA-7**: الـ sub categories هي أيضاً dynamic (محفوظة من الـ scraper).
- **FR-DATA-8**: إذا فشل الـ scrape و الـ DB فاضية → نعرض حالة "No data available — please sync" مع زر sync.

### 5.4 Currency Default USD (FR-CURRENCY)
- **FR-CURRENCY-1**: العملة الافتراضية في Booking Form ت变为 USD بدلاً من EUR (`currency: "USD"` في default values).
- **FR-CURRENCY-2**: في `SelectedTourBanner` و PDF summary — إظهار basePriceUSD بشكل أساسي و basePriceEUR كـ option فقط لو اختار المستخدم EUR.
- **FR-CURRENCY-3**: الـ scraper بالفعل يستخرج basePriceUSD من الموقع، نضمن أن الـ priority للـ USD في كل العمليات الحسابية.
- **FR-CURRENCY-4**: الـ Currency selector في الـ form بيظل فيه الخيارين بس الـ default USD.

### 5.5 Always-Updated Itineraries & Prices (FR-UPDATED)
- **FR-UPDATED-1**: كل request لـ `/api/tours` يتحقق من عمر آخر scrape — لو أكبر من 24 ساعة → kicks off background refresh.
- **FR-UPDATED-2**: صفحة الـ dashboard تعرض آخر وقت للتحديث في الـ header (scrapedAt).
- **FR-UPDATED-3**: زر "Reload Catalog" يعيد تحميل البيانات فوراً من الـ DB/API.
- **FR-UPDATED-4**: زر "Sync from kemeryatours.com" → Force full scrape و تحديث كامل للـ DB (مع تأكيد المستخدم).

### 5.6 Bug Fixes (FR-BUGFIX)
- **FR-BUGFIX-1**: إضافة `alt=""` لكل `<Image>` elements داخل ملف `itinerary-pdf.tsx` لحل ESLint warnings.
- **FR-BUGFIX-2**: تشغيل `npm run lint` و إصلاح أي issues أخرى.
- **FR-BUGFIX-3**: التأكد أن `next build` ينجح مع 0 errors و 0 warnings قدر الإمكان.

### 5.7 Vercel Deployment Readiness (FR-VERCEL)
- **FR-VERCEL-1**: إعداد Supabase Project: (1) Database tables للمستخدمين + الـ tours cache، (2) Auth باستخدام Email/Password.
- **FR-VERCEL-2**: ملف `.env.example` يحتوي على جميع المتغيرات المطلوبة (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY...).
- **FR-VERCEL-3**: إعداد `next.config.mjs` للـ production (images remote patterns, etc).
- **FR-VERCEL-4**: تشغيل production build ناجح محلياً قبل التعليمات للرفع على Vercel.
- **FR-VERCEL-5**: التعليمات النهائية لرفع المشروع على Vercel + ربط الـ env vars.

## 6. Non-Functional Requirements

### 6.1 Security (NFR-SEC)
- **NFR-SEC-1**: Passwords محفوظة hashed باستخدام bcrypt أو ما يعادلها عبر Supabase Auth — أبداً plain text.
- **NFR-SEC-2**: Session cookies secure + httpOnly + SameSite=lax.
- **NFR-SEC-3**: Routes محمية من قبل Middleware حسب الـ Role (authorization check server-side).
- **NFR-SEC-4**: API endpoints للحذف والتعديل للمستخدمين — تتطلب super_admin role فقط.

### 6.2 Performance (NFR-PERF)
- **NFR-PERF-1**: First load لـ `/login` و `/dashboard` أقل من 3 ثواني على CPU متوسطة.
- **NFR-PERF-2**: تحميل الكتالوج من الـ DB أقل من 500ms. الـ scrape يشتغل في الـ background بدون block للـ UI.
- **NFR-PERF-3**: PDF يولد خلال 1-3 ثواني (كالحالة الحالية).

### 6.3 Maintainability (NFR-MAIN)
- **NFR-MAIN-1**: جميع الملفات TypeScript strict, no `any` بدون مبرر.
- **NFR-MAIN-2**: مبدأ DRY — مسح كل duplicate code.
- **NFR-MAIN-3**: منظم مجلدات واضح:
  - `app/login` — login page
  - `app/admin/users` — user management
  - `app/api/auth/...` — auth APIs
  - `app/api/admin/users/...` — user management APIs
  - `lib/auth/` — auth helpers & RBAC
  - `lib/supabase/` — Supabase clients (server-side, client-side)
  - `supabase/migrations/` — SQL migrations للمستخدمين و tables

### 6.4 Deployment (NFR-DEPLOY)
- **NFR-DEPLOY-1**: Build ينجح محلياً مع 0 errors.
- **NFR-DEPLOY-2**: جميع المتغيرات المطلوبة موثقة في `.env.example`.
- **NFR-DEPLOY-3**: ملف `.gitignore` يسترجع `.env.local` و sensitive files.

## 7. Constraints & Dependencies

### Technology Constraints
- **Stack ثابت**: Next.js 14 App Router + TypeScript + Tailwind + @react-pdf/renderer (مطلوب الإبقاء عليها).
- **Auth/DB**: **Supabase** (المدمج في TRAE). **لن نستخدم JSON file-based users** لانه غير مناسب لـ Vercel persistent.
- **Scraper**: نحافظ على `cheerio` + الـ kemerya-scraper.ts الموجود، بس نكتب نتيجة الـ scraping إلى Supabase بدلاً من ملف JSON.
- **Workaround لـ حفظ كلمة المرور**: المستخدم سوف يوفر كلمة السر الخاصة بحساب Supabase الخاص به عن طريق الـ IDE integration.

### Vercel Platform Constraints
- Serverless functions → لا يمكن الاعتماد على filesystem للكتابة persistent.
- Cold starts → الـ auth middleware لازم يكون سريع (Supabase Auth with cookie session).

### Dependencies نضيفها
- `@supabase/supabase-js` — Supabase Client
- `@supabase/ssr` — Supabase SSR helpers للـ Next.js App Router (cookies/session)
- `bcryptjs` (فقط لو احتجنا local hash خارج Supabase Auth — غالباً مش هنحتاجه لأن Supabase Auth بيعمل الـ hash).

## 8. Open Questions

- **Q1**: (تم حلّه افتراضياً) — هل نستخدم Supabase Auth للـ login أم JWT عادي؟ → **Supabase Auth (Email/Password)** لانه الأكثر جاهزية و أمان مع Vercel.
- **Q2**: (تم حلّه افتراضياً) — هل المستخدمين الجدد بيقدروا يسجلوا وحدهم؟ → **لا** — التسجيل (signup) مغلق عامة. فقط Super Admin يضيف حسابات جديدة من لوحة الإدارة.
- **Q3**: (تم حلّه افتراضياً) — هل نخزن الـ bookings؟ → **لا** في هذي المرحلة (NG4). يبقى في memory للجلسة الحالية بس.

## 9. Acceptance Criteria

| # | Type | Text |
|---|------|------|
| AC-1 | **rule** | عند فتح `/dashboard` بدون session → يتم التوجيه تلقائياً لصفحة `/login`. |
| AC-2 | **rule** | الدخول بـ `omarelshemy010@gmail.com` و كلمة المرور `Omar@1998` ينجح و يفتح الـ dashboard بحساب super_admin. |
| AC-3 | **rule** | صفحة إدارة المستخدمين (`/admin/users`) متاحة فقط لـ super_admin. المحاولة بدخولها بـ role أقل → 403 أو redirect. |
| AC-4 | **rule** | من صفحة `/admin/users` يمكن إضافة مستخدم جديد بكل الـ roles المتاحة. |
| AC-5 | **rule** | من صفحة `/admin/users` يمكن تغيير صلاحيات مستخدم موجود أو حذفه. |
| AC-6 | **rule** | ملف `tours.ts` لا يحتوي على أي `generateTours()` أو arrays عشوائية للأسعار أو itineraries. أي بيانات tours تأتي من الـ scraper + DB فقط. |
| AC-7 | **rule** | `FALLBACK_TOURS` / `FALLBACK_MAIN` / `FALLBACK_SUB` محذوفة من `tours-data-provider.tsx`. لا يوجد static fallback. |
| AC-8 | **rule** | الـ default currency في Booking Configuration Form = **USD**. عند فتح نموذج جديد بدون اختيار → يُظهر `$`. |
| AC-9 | **rule** | كل أسعار الـ tours اللي بتيجي من الـ website بتبقى basePriceUSD (الأولوية على اليورو). أسعار اليورو محسوبة فقط عند اختيار المستخدم EUR. |
| AC-10 | **rule** | يوجد آلية تحديث تلقائي: آخر scrape عمره > 24 ساعة → triggers refresh في الخلفية فور أول request للـ `/api/tours`. |
| AC-11 | **rule** | زر "Sync from kemeryatours.com" في الـ header يعمل و يحدث الـ DB من الـ website. |
| AC-12 | **rule** | `npm run build` ينجح مع **0 errors** (warnings مقبولة بس نحاول نقصهم لاقل حد). |
| AC-13 | **rule** | `alt=""` موجودة لكل `<Image>` في `itinerary-pdf.tsx` لحل ESLint warnings. |
| AC-14 | **rule** | يوجد ملف `.env.example` مع جميع الـ Supabase variables مطلوبة. |
| AC-15 | **rule** | ملفات Supabase migrations موجودة و تعمل لإنشاء tables الـ cached tours و users admin profiles. |
| AC-16 | **rubric** | جودة الـ Auth/RBAC: 0–2. (2 = Secure Session Cookies, Middleware guard, Role check في كل API; 1 = يعمل بس فيه ثغرة بسيطة; 0 = مش مكتمل). Pass threshold ≥ 2. |
| AC-17 | **rubric** | ملفات منظمة / نظافة الكود: 0–2. (2 = مجلدات واضحة + TypeScript strict صارم + DRY; 1 = يعمل بس فيه ترتيب عشوائي; 0 = فوضى). Pass threshold ≥ 2. |
| AC-18 | **rubric** | استعداد المشروع للـ Vercel: 0–2. (2 = env example كامل + build ناجح + Supabase جاهز; 1 = فيه خطوات ناقصة بس قليلة; 0 = مش قابل للرفع). Pass threshold ≥ 2. |
