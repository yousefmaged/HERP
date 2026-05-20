# HERP API Documentation

## REST API

### Base URL
`/api`

### Endpoints

#### `GET /api/health`
التحقق من صحة النظام.

#### `GET /api/identity`
الحصول على هوية الكيان المسجل.

#### `POST /api/identity`
إنشاء هوية جديدة (كيان).

#### `GET /api/modules`
قائمة الوحدات المثبتة.

#### `POST /api/modules/install`
تثبيت وحدة جديدة (تتطلب `moduleId` و `url`).

### المصادقة

استخدم التوكن في الهيدر:
`Authorization: Bearer <token>`

### أخطاء شائعة

- `401 Unauthorized`: لم يتم توفير توكن صالح.
- `403 Forbidden`: الصلاحية غير متوفرة لهذا المستخدم.
- `404 Not Found`: المورد غير موجود.

## WebSocket API

اتصل بـ `ws://localhost:8080/ws` للاشتراك في الأحداث اللحظية.

### الأحداث المدعومة

- `system:ready`
- `module:installed`
- `knowledge:page-updated`

## GraphQL (قيد التطوير)

نقطة النهاية: `/graphql`

سندعم استعلامات مثل:
```graphql
query {
  pages { id title }
  employees { name position }
}
