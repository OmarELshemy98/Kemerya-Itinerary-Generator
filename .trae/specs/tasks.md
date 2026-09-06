# Kemerya Itinerary Generator — Implementation Tasks

> تم اشتق من [spec.md](./spec.md). كل task مرتبط بـ Acceptance Criterion (AC).

## Legend:
- **Status**: `pending` → `in_progress` → `completed` / `blocked` / `cancelled`
- **Priority**: high / medium / low**
- **TR**: Test Requirements من النوع `rule` أو `rubric` مع دليل المرور + مصدر الدليل

---

## Task 1: إعداد Supabase Project و Environment Variables

**Priority**: `high` · **Status**: `pending`

**وصف**:
إنشاء Supabase project جديد عبر الـ integration الخاص بالـ IDE، إعداد migrations SQL للـ tables (profiles, tours_cache, roles)، إعداد Supabase Auth بـ Email/Password، وتوليد ملف `.env.example` مع جميع المتغيرات المطلوبة.

**AC Coverage**: AC-14, AC-15, AC-18

**Implementation Notes**:
1. استدعاء `supabase_get_project()` للحصول على URL + anon_key + service_role_key.
2. إنشاء migrations تحت `supabase/migrations/` وإنشاء:
   - `00000000000000_init.sql` — tables
   - `00000000000001_seed_super_admin.sql` — seeding super admin: `omarelshemy010@gmail.com` / `Omar@1998`
3. ملفات الـ migration لازم يكون لـ:
   - `profiles` table: id (uuid references auth.users), full_name, role (enum: super_admin/admin/operator/viewer), is_active (bool), created_at
   - `cached_main_categories` (id, name, slug, description, image, scraped_at)
   - `cached_sub_categories` (id, main_cat_id FK, name, slug, description, image, scraped_at)
   - `cached_tours` (id pk, main_cat_id FK, sub_cat_id FK, title, slug, duration_days, duration_nights, short_desc, long_desc, image, base_price_usd, base_price_eur, highlights jsonb, inclusions jsonb, exclusions jsonb, itinerary jsonb, tags jsonb, is_popular, scraped_at)
   - `cache_meta` (single row: last_full_scrape_at, source)
4. إنشاء ملف `.env.example` يحتوي على:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - (اختياري) SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD — seed فقط للتأكيد)
5. تحديث `.gitignore` ليحذف ملفات `.env*` عدا `.env.example`

**Test Requirements**:
- TR-1.1 (`rule`): عند تشغيل migration SQL → يتم إنشاء كل الـ tables + row واحد `information_schema` يظهرها — Evidence: تشغيل Supabase SQL Editor query.
- TR-1.2 (`rule`): الحساب omarelshemy010@gmail.com موجود في auth.users مع password=Omar@1998 يعمل بعد seed. Evidence: محاولة login ناجحة من صفحة login لاحقاً (Task 3).
- TR-1.3 (`rule`): ملف `.env.example` موجود بكل الـ 3 متغيرات أساسية على الأقل. Evidence: `Glob .env.example` موجود وبيحتوي الملف.

---

## Task 2: إعداد ملفات Supabase Helpers (lib/supabase) + Auth Helpers (lib/auth)

**Priority**: `high` · **Status**: `pending`

**وصف**:
إنشاء `lib/supabase/client.ts (client side)، `lib/supabase/server.ts` (server side)، `lib/auth/rbac.ts` (check role helpers)، و `middleware.ts` لحماية routes.

**AC Coverage**: AC-1, AC-16

**Implementation**:
1. تثبيت dependencies الجديدة: `@supabase/supabase-js` + `@supabase/ssr`
2. `src/lib/supabase/client.ts` — createBrowserClient for "use client"
3. `src/lib/supabase/server.ts` — createServerClient in Route Handlers / Server Components (with cookies)
4. `src/lib/auth/rbac.ts` — functions:
   - `getCurrentUser()` (من session)
   - `requireRole(...roles)` throws 403/redirect`
   - `isSuperAdmin(user)`, `isAdmin(user)`
5. `src/middleware.ts` — Next.js Middleware يحمي:
   - `/dashboard*`, `/admin*`, `/api/admin*`
   - لو مستخدم غير مسجل: redirect لـ `/login`
   - لو `/admin*` بدون super_admin → redirect 403 / redirect `/dashboard`
6. Auth Session Guard (Server Component wrapper: `<AuthGuard>`)

**Test Requirements**:
- TR-2.1 (`rule`): زيارة `/dashboard` بدون session → توجيه لـ `/login`. Evidence: تشغيل dev + curl localhost + snapshot.
- TR-2.2 (`rule`): زيارة `/admin/users` بحساب operator → مرفوض أو تحويل. Evidence: test snapshot.
- TR-2.3 (`rubric`): أمان الـ middleware: 0–2 (2 = cookies httpOnly + SameSite + roles checks صارمة). Pass ≥ 2.

---

## Task 3: إنشاء صفحة `/login` + Logout API

**Priority**: `high` · **Status**: `pending`

**وصف**:
تصميم صفحة تسجيل الدخول الفاخرة (Luxury style matches الـ brand gold/navy). Supabase Email + Password auth. زر Logout في الـ header.

**AC Coverage**: AC-1, AC-2

**Implementation**:
1. `app/login/page.tsx` — Luxury login form:
   - Logo Kemerya + "Welcome Back"
   - Email input + Password input
   - Login button ذهبي
   - Error messages لخطأ الـ credentials
   - Redirect URL `?next=/dashboard` بعد نجاح
2. `app/api/auth/login/route.ts` — POST: تتصل بـ Supabase signInWithPassword → تحط cookies عبر server side
3. `app/api/auth/logout/route.ts` — POST: signOut وتمسح session
4. تعديل `DashboardHeader` إضافة زر **Logout** يميناً (user menu)
5. `app/login/layout.tsx` لو محتاج — غيّر layout من الـ root لو ضروري.

**Test Requirements**:
- TR-3.1 (`rule`): الدخول بـ omarelshemy010@gmail.com / Omar@1998 → ناجح و يفتح dashboard. Evidence: browser snapshot.
- TR-3.2 (`rule`): كلمة مرور خاطئة → رسالة خطأ ظاهرة. Evidence: snapshot.
- TR-3.3 (`rule`): زر Logout يمسح الـ session ويرجع لـ `/login`. Evidence: بعد logout محاولة زيارة dashboard → redirect لـ login.

---

## Task 4: صفحة إدارة المستخدمين `/admin/users` + Admin APIs

**Priority**: `high` · **Status**: `pending`

**وصف**:
CRUD للمستخدمين (أيضاً ادمن فقط Super Admin: إضافة / تعديل صلاحيات / حذف / تعطيل.

**AC Coverage**: AC-3, AC-4, AC-5, AC-6

**Implementation**:
1. `app/api/admin/users/route.ts` — GET (جلب كل المستخدمين مع profiles)
2. `app/api/admin/users/route.ts` — POST (إنشاء مستخدم جديد: email + password + full_name + role)
   - تستخدم Supabase Admin API (service_role) لإنشاء مستخدم جديد في auth.users + row في profiles
3. `app/api/admin/users/[id]/route.ts` — PATCH (تعديل role أو is_active) و DELETE (حذف المستخدم نهائياً أو تعطيل)
4. `app/admin/users/page.tsx` — "use client":
   - جدول المستخدمين (اسم / ايميل / role / active / created
   - زر Add User (modal)
   - لكل user: Edit role (dropdown) و Delete (modal تأكيد) و Toggle Active
   - تحميل + errors + success toasts
5. تعديل `DashboardHeader` إضافة **User Management** في الـ sidebar أو nav menu (أو Button) — للـ super admin فقط يظهر
6. إنشاء User roles enum consistent everywhere: super_admin, admin, operator, viewer (في RBAC + DB + UI).

**Test Requirements**:
- TR-4.1 (`rule`): super admin dashboard يشوف زر User Management ويدخل /admin/users. Evidence: snapshot.
- TR-4.2 (`rule`): إضافة user جديد ببيانات email+password+role → يظهر في الجدول. Evidence: DB query.
- TR-4.3 (`rule`): تغيير role user من operator إلى admin → يعمل بعد تسجيل دخول جديد. Evidence: login بنجاح.
- TR-4.4 (`rule`): حذف user → لم يعد موجود في list ولا يمكن تسجيل دخوله. Evidence: login attempt فشل.

---

## Task 5: مسح كل Static Data + Dynamic Data Layer

**Priority**: `high` · **Status**: `pending`

**وصف**:
مسح TOURS static و SUB_CATEGORIES static و Fallback المزيل من الـ data layer كلها. تعديل الـ scraper و الـ cache عشان يكتب على Supabase بدلاً من ملف JSON. تعديل `tours-data-provider.tsx` و `api/tours` و `api/scrape`.

**AC Coverage**: AC-6, AC-7

**Implementation**:
1. **تعديل `src/data/tours.ts`**: حذف `TOUR_DATASET`, `sampleInclusions`, `sampleExclusions`, `buildItinerary`, `generateTours`, `TOURS` constant. الإبقاء على: `MAIN_CATEGORIES` (لـ scrapers matching) و `SUB_CATEGORIES` (لـ matching — بس نحولهم لـ helper فقط). إزالة functions اللي بتستخدم TOURS (searchTours, getTourById...) — ننقلهم للـ data provider أو الـ API.
2. **مسح `tours-data-provider.tsx`**:
   - حذف imports لـ `FALLBACK_TOURS`, `FALLBACK_MAIN`, `FALLBACK_SUB`
   - الـ initial state → tours = [], source = "loading"
   - لو الـ API رجعت [] + DB فاضية → عرض "No synced yet — click Sync" مش static fallback
3. **`src/lib/tour-cache.ts`**: إعادة الكتابة كله:
   - `readCache()` → تسحب من Supabase `cached_tours` + `cached_main_categories` + `cached_sub_categories` + `cache_meta.last_full_scrape_at`
   - `writeCache(data)` → تمسح الـ rows القديمة و تعيد insert في cached_tours, cached_sub_categories, update cache_meta row
   - `clearCache()` → تمسح كل الـ rows
   - `mergeWithBaseData` → نحذفها أو نخليها merge فقط matching purposes (SUB_CATEGORIES) لو محتاجينها لـ scrape matching بس.
4. **`src/app/api/scrape/route.ts`**: بعد الـ scrape → calls writeCache (Supabase insertion) بدلاً من JSON file.
5. **`src/app/api/tours/route.ts`**: يقرأ من Supabase → لو فيه بيانات + عمرها أقل من 24 ساعة → يرجعها. لو عمرها > 24 ساعة أو فاضية → returns البيانات الموجودة + kicks off background `scrapeAllTours()` بدون بلاك للـ request (return first then refresh).
6. الـ `src/data/cache/tours-cache.json` → حذف نهائي من المشروع (من الـ git و الـ folders).

**Test Requirements**:
- TR-5.1 (`rule`): ملف tours.ts لا يحتوي على أي `export const TOURS` أو `generateTours`. Evidence: Grep "generateTours\|TOURS.*=" يعرض 0 matches.
- TR-5.2 (`rule`): `grep "FALLBACK_"` في المشروع كله → 0 matches (ما عدا في ملفات deleted.
- TR-5.3 (`rule`): تشغيل sync مرة + بعدين فجولة الـ API و الكتالوج يظهر من الـ DB وليس static. Evidence: page dashboard tours.length = ناتج الـ scrape.

---

## Task 6: تحديث تلقائي للأسعار والـ Itineraries (TTTL و Default Currency USD

**Priority**: `high` · **Status**: `pending`

**وصف**:
جعل العملة الافتراضية USD في كل مكان، وتفعيل آلية الـ TTL للـ cache 24 ساعة، وضمان أن الـ Itineraries و prices في الـ PDF و الـ form دائماً تحدث.

**AC Coverage**: AC-8, AC-9, AC-10, AC-11

**Implementation**:
1. `src/types/index.ts`: `type Currency` = EUR|USD (يبقى زي مهو، بس default USD).
2. `src/components/booking-configuration-form.tsx`:
   - default currency `USD`
   - default `totalPrice` من `selectedTour.basePriceUSD`
   - Currency selector يظل الخيارين بس بياخد USD الأول
3. `src/lib/utils.ts` — `formatCurrency` default param يروح USD → `default USD بدلاً من EUR.
4. `src/app/dashboard/page.tsx` — SelectedTourBanner يظهر USD كأولوية في من الـ banner: From `basePriceUSD` pax ويمكن EUR كمحذف الـ EUR من أولي أو نجعلها كـ option فقط لو اختارو الـ user.
5. `src/app/api/tours/route.ts`:
   - قراءة `cache_meta.last_full_scrape_at
   - لو null أو `NOW - last_full_scrape_at > 24h` → استدعاء `scrapeAllTours({maxToursPerSub:20})` في background (non blocking)
   - return للـ response بالبيانات الحالية (stale-while-revalidate
6. Dashboard header "Reload Catalog" + "Sync" buttons يضلوا شغالين مثل مهو + trigger الـ routes.
7. التأكد أن الـ scraper `tourFromDetails` يعطي أولوية `basePriceUSD` و basePriceEUR بتحويل فقط عند الحاجة.

**Test Requirements**:
- TR-6.1 (`rule`): فتح نموذج Booking جديد بدون أي اختيار → Currency = USD. Evidence: snapshot للـ form.
- TR-6.2 (`rule`): اختيار Tour → Total Price = `tour.basePriceUSD` وليس EUR. Evidence: snapshot لقيمة input الـ totalPrice.
- TR-6.3 (`rule`): عند إعطاء last_scrape_at قديم (يدوي في DB لأكثر من 24 ساعة → request جديد → trigger refresh في الخلفية + ترجع البيانات القديمة أولاً. Evidence: server logs + DB rows محدثة بعد دقائق.
- TR-6.4 (`rule`): زر "Sync from kemeryatours.com" → شغال و يحدث الـ DB من الـ website. Evidence: DB rows تختلف قبل/بعد.

---

## Task 7: إصلاح الـ Warnings (alt للصور + lint fixes

**Priority**: `medium` · **Status**: `pending`

**وصف**:
إصلاح جميع أخطاء و تحذيرات build و ESLint.

**AC Coverage**: AC-12, AC-13

**Implementation**:
1. `src/components/pdf/itinerary-pdf.tsx` — 4 `<Image>` → نضيف `alt=""` لكل واحدة منها.
2. تشغيل `npm run lint` كامل للمشروع.
3. إصلاح أي issues أخرى تظهر من linting.
4. تشغيل `npm run build` + التأكد 0 errors و 0 warnings قدر الإمكان.

**Test Requirements**:
- TR-7.1 (`rule`): `next lint` يخرج بدون errors أو أصغر حد من قبل Build → Pass.
- TR-7.2 (`rule`): `npm run build` Exit code 0 و لا تظهر أي warnings من نوع jsx-a11y/alt-text في pdf. Evidence: build log.

---

## Task 8: Vercel Deployment Readiness — Final

**Priority**: `high` · **Status**: `pending`

**وصف**:
جعل المشروع كله Vercel-ready: images remote patterns للـ logo و tour images، تأكد Supabase variables، build ناجح، ملف env example كامل، تعليمات الرفع النهائية للمستخدم في النهائي `app/layout.tsx` metadata محدثة.

**AC Coverage**: AC-12, AC-14, AC-17, AC-18

**Implementation**:
1. `next.config.mjs` → إضافة `images.remotePatterns` للسماح بـ:
   - kemeryatours.com (للصور من الـ website)
   - storage كـ أي subdomains لو احتجنا (supabase storage)
2. `.env.example` review + تأكيد فيه:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
3. التأكد `public/logo-kemerya.png` موجود.
4. تشغيل آخر build وإصلاح أي build ناجح قبل نهاية project.
5. `README.md` غير مطلوب (بس نقدر نضيف سطراً واحد Vercel Deploy Button اختياري.
6. إضافة ملف `vercel.json` لو احنا محتاجين override build command أو install command.

**Test Requirements**:
- TR-8.1 (`rule`): `npm run build` يعمل بنجاح = 0. Exit code 0.
- TR-8.2 (`rule`): `.env.example` فيه كل الـ variables المطلوبة.
- TR-8.3 (`rubric`): استعداد للرفع 0–2 (2 = env example كامل + build ناجح + remotePatterns صحيحة + images config). Pass ≥ 2.
- TR-8.4 (`rubric`): نظافة وترتيب الملفات 0–2 (2 = مجلدات واضحة + no any). Pass ≥ 2.

---

## Task 9: مراجعة مستقلة (Independent Review)

**Priority**: `high` · **Status**: `pending` — **مرجّح للمرحلة الأخيرة**

**وصف**:
بعد اكتمال Tasks 1–8، يتم مراجعة المستقل لكل ACs والتأكد شهادة pass. لو فشل أي حاجة → إضافة remediation issues جديدة في tasks queue.

**AC Coverage**: الكل

**Implementation**:
- تشغيل lint + build
- جولة check لل AC checklist:
  - login يعمل بالحساب الرسمي
  - super admin user management
  - data dynamic (بلا static fallback)
  - USD default
  - TTL يعمل
  - Vercel ready
