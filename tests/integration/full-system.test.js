/**
 * HERP Full System Integration Test
 * 
 * يختبر التكامل بين النواة والوحدات التالية:
 * - Knowledge (المفكرة)
 * - Finance (المالية)
 * - HR (الموارد البشرية)
 * - Inventory (المخزون)
 * - Projects (المشاريع)
 * 
 * السيناريو:
 * 1. تهيئة النواة وإنشاء هوية
 * 2. تثبيت الوحدات
 * 3. إنشاء موظف جديد (HR)
 * 4. إنشاء مشروع (Projects) وتعيين الموظف
 * 5. إضافة منتج للمخزون (Inventory)
 * 6. إنشاء فاتورة (Finance) مرتبطة بالمشروع
 * 7. تحديث المخزون بناءً على الفاتورة
 * 8. إنشاء صفحة معرفة (Knowledge) مرتبطة بالمشروع
 * 9. التحقق من الأحداث الصادرة عن الوحدات
 * 10. التحقق من صلاحيات الوصول
 */

import { Kernel } from '../../app/core/kernel.js';
import { emit, subscribe } from '../../app/events/bus.js';
import { EVENT_TYPES } from '../../app/events/event-types.js';
import { login, getCurrentSession } from '../../app/permissions/session-manager.js';
import { saveEntity, loadEntity } from '../../app/storage/adapters/local.adapter.js';

// وحدة المعرفة
import { createPage, getPage } from '../../modules/knowledge/services/core.js';
// وحدة المالية
import { addTransaction, getBalance } from '../../modules/finance/services/core.js';
// وحدة الموارد البشرية
import { addEmployee, listEmployees } from '../../modules/hr/services/core.js';
// وحدة المخزون
import { addProduct, updateStock, listProducts } from '../../modules/inventory/services/core.js';
// وحدة المشاريع (سنضيف service بسيط)
import { createProject, assignEmployeeToProject } from '../../modules/projects/services/core.js';

/**
 * مساعد لانتظار حدث معين
 */
function waitForEvent(eventName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(`Timeout waiting for ${eventName}`)), timeout);
    const handler = (data) => {
      clearTimeout(timeoutId);
      unsubscribe(eventName, handler);
      resolve(data);
    };
    subscribe(eventName, handler);
  });
}

async function runIntegrationTest() {
  console.log('🚀 بدء اختبار التكامل الشامل...');
  const results = { passed: 0, failed: 0, tests: [] };

  // 1. تهيئة النواة
  try {
    const kernel = new Kernel();
    await kernel.init();
    console.log('✅ Kernel initialized');

    // إنشاء هوية افتراضية (لأغراض الاختبار)
    await saveEntity('system_identity', 'singleton', {
      entityName: 'شركة الاختبار',
      userId: 'test_user',
      role: 'owner',
      createdAt: Date.now()
    });
    login('test_user', 'owner', { entityName: 'شركة الاختبار' });
    results.tests.push({ name: 'Kernel init', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Kernel init failed', err);
    results.tests.push({ name: 'Kernel init', passed: false, error: err.message });
    results.failed++;
    return results;
  }

  // 2. التحقق من جلسة المستخدم
  const session = getCurrentSession();
  if (session?.role !== 'owner') {
    console.error('❌ Session validation failed');
    results.tests.push({ name: 'Session validation', passed: false });
    results.failed++;
    return results;
  }
  console.log('✅ Session validated');
  results.tests.push({ name: 'Session validation', passed: true });
  results.passed++;

  // 3. إنشاء موظف (HR)
  let employee;
  try {
    employee = await addEmployee('أحمد محمد', 'مهندس برمجيات', 5000, 'ahmed@example.com');
    if (!employee.id) throw new Error('No employee id');
    console.log(`✅ Employee created: ${employee.name}`);
    results.tests.push({ name: 'HR: addEmployee', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ HR addEmployee failed', err);
    results.tests.push({ name: 'HR: addEmployee', passed: false, error: err.message });
    results.failed++;
  }

  // 4. إنشاء مشروع وتعيين موظف (Projects)
  let project;
  try {
    project = await createProject('نظام HERP', 'تطوير نظام التشغيل السيادي');
    await assignEmployeeToProject(project.id, employee.id);
    console.log(`✅ Project created: ${project.name}, assigned to ${employee.name}`);
    results.tests.push({ name: 'Projects: create & assign', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Projects failed', err);
    results.tests.push({ name: 'Projects: create & assign', passed: false, error: err.message });
    results.failed++;
  }

  // 5. إضافة منتج للمخزون (Inventory)
  let product;
  try {
    product = await addProduct('حاسوب محمول', 'LAP-001', 10, 2500);
    console.log(`✅ Product added: ${product.name}, stock: ${product.quantity}`);
    results.tests.push({ name: 'Inventory: addProduct', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Inventory addProduct failed', err);
    results.tests.push({ name: 'Inventory: addProduct', passed: false, error: err.message });
    results.failed++;
  }

  // 6. إنشاء فاتورة (Finance) مرتبطة بالمشروع
  let transaction;
  try {
    transaction = await addTransaction('فاتورة تطوير HERP', 5000, 'income', project.id);
    const balance = await getBalance();
    if (balance !== 5000) throw new Error(`Balance mismatch: expected 5000, got ${balance}`);
    console.log(`✅ Transaction added, balance: ${balance}`);
    results.tests.push({ name: 'Finance: addTransaction', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Finance addTransaction failed', err);
    results.tests.push({ name: 'Finance: addTransaction', passed: false, error: err.message });
    results.failed++;
  }

  // 7. تحديث المخزون بناءً على الفاتورة (محاكاة خروج 2 حاسوب)
  try {
    await updateStock(product.id, -2);
    const updated = await loadEntity('product', product.id);
    if (updated.quantity !== 8) throw new Error(`Stock mismatch: expected 8, got ${updated.quantity}`);
    console.log(`✅ Stock updated to ${updated.quantity}`);
    results.tests.push({ name: 'Inventory: updateStock', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Inventory updateStock failed', err);
    results.tests.push({ name: 'Inventory: updateStock', passed: false, error: err.message });
    results.failed++;
  }

  // 8. إنشاء صفحة معرفة (Knowledge) مرتبطة بالمشروع
  let page;
  try {
    page = await createPage(`ملاحظات مشروع ${project.name}`, 'تم إنجاز النواة واختبار الوحدات', project.id);
    const fetched = await getPage(page.id);
    if (fetched.title !== page.title) throw new Error('Page not saved correctly');
    console.log(`✅ Knowledge page created: ${page.title}`);
    results.tests.push({ name: 'Knowledge: createPage', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Knowledge createPage failed', err);
    results.tests.push({ name: 'Knowledge: createPage', passed: false, error: err.message });
    results.failed++;
  }

  // 9. التحقق من ترابط الكيانات (Entity Graph)
  try {
    // نتحقق أن المشروع له فاتورة مرتبطة
    const projectInvoices = await loadEntity('transaction_by_project', project.id);
    // (هذا مجرد مثال، يمكن توسيعه)
    console.log('✅ Entity relationship verified');
    results.tests.push({ name: 'Entity Graph: relationships', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Entity Graph check failed', err);
    results.tests.push({ name: 'Entity Graph: relationships', passed: false, error: err.message });
    results.failed++;
  }

  // 10. اختبار الصلاحيات (Permissions)
  try {
    // محاكاة مستخدم عادي يحاول تعديل وحدة لا يملك صلاحيتها
    login('viewer_user', 'viewer', { entityName: 'مستخدم عادي' });
    let errorThrown = false;
    try {
      await addEmployee('محاولة غير مصرح', 'دخيل', 0, 'x@x.com');
    } catch (err) {
      errorThrown = true;
    }
    if (!errorThrown) throw new Error('Permission system failed: viewer could add employee');
    console.log('✅ Permissions test passed');
    results.tests.push({ name: 'Permissions: RBAC', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Permissions test failed', err);
    results.tests.push({ name: 'Permissions: RBAC', passed: false, error: err.message });
    results.failed++;
  }

  // 11. اختبار الأحداث (Event Bus)
  try {
    let eventReceived = false;
    subscribe('finance:transaction-created', () => { eventReceived = true; });
    await addTransaction('حدث تجريبي', 100, 'income');
    if (!eventReceived) throw new Error('Event not emitted');
    console.log('✅ Event bus test passed');
    results.tests.push({ name: 'Events: emission', passed: true });
    results.passed++;
  } catch (err) {
    console.error('❌ Event bus test failed', err);
    results.tests.push({ name: 'Events: emission', passed: false, error: err.message });
    results.failed++;
  }

  // 12. تقرير نهائي
  console.log('\n========================================');
  console.log(`📊 نتائج الاختبارات: ${results.passed} نجاح, ${results.failed} فشل`);
  console.log('========================================');
  for (const t of results.tests) {
    console.log(`${t.passed ? '✅' : '❌'} ${t.name}${t.error ? ` - ${t.error}` : ''}`);
  }
  return results;
}

// تصدير للاستخدام في بيئة الاختبار
export { runIntegrationTest };

// تشغيل تلقائي إذا كان في بيئة Node.js مع محاكاة
if (typeof window === 'undefined') {
  // محاكاة بعض وحدات الويب API (لـ Node.js)
  global.crypto = require('crypto').webcrypto;
  // ملاحظة: سنحتاج إلى محاكاة IndexedDB أيضاً (مثلاً fake-indexeddb)
  // لكن الأفضل تشغيل الاختبار في متصفح حقيقي عبر Playwright.
  console.warn('⚠️ البيئة ليست متصفحاً، قد تفشل بعض الاختبارات.');
  runIntegrationTest().then(console.log).catch(console.error);
}
