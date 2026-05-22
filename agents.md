# AGENTS.md – دليل الذكاء الاصطناعي والمطورين لـ HERP

## القواعد الهندسية غير القابلة للتفاوض

1. **النواة خالصة:** `app/core/` لا تعرف `modules/`. ممنوع `import` من `modules` إلى `core`.
2. **الوحدة كإضافة:** الميزات الإدارية تُبنى كوحدات في `modules/`.
3. **لا استيراد عكسي:** `modules/` و `agents/` لا تستورد من `app/core/`. نقطة الاتصال الوحيدة هي `app/sdk/`.
4. **التواصل عبر الأحداث:** أي تفاعل بين المكونات يكون عبر `Event Bus`.
5. **الإعدادات لا تُكتب في الكود:** لا قيم صلبة. كل شيء يُقرأ من `workspace/config/*.json`.

## هيكل الملفات

- `app/core/` – النواة. لا تُعدل إلا لتحديث kernel أو bootstrap.
- `app/events/` – Event Bus. لا تُضف أحداثاً خاصة بالمالية هنا، بل في `event-types.js` فقط.
- `app/storage/` – التخزين. استخدم `vfs.js` و `sqlite.js` فقط.
- `modules/` – كل الميزات الجديدة هنا.
- `agents/` – كل ما يتعلق بالوكلاء.

## إضافة وحدة جديدة

1. أنشئ مجلداً تحت `modules/` باسم الوحدة.
2. اكتب `manifest.json` (الاسم، الإصدار، الأذونات، نقطة الدخول).
3. اكتب `index.js` الذي يستدعي `kernel.registerModule`.
4. استخدم الـ SDK للوصول إلى التخزين والأحداث (`kernel.query`, `eventBus.emit`).

## المكتبات المسموحة

- Alpine.js (~8KB)
- Tailwind CSS
- sql.js / wa-sqlite
- LanceDB (مدمج)

## المكتبات المحظورة

- React, Vue, Angular
- Firebase, Supabase
- أي مكتبة تتطلب `node_modules` ضخمة