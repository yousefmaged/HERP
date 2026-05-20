/**
 * HERP Module: Knowledge Core Services
 * منطق الأعمال الأساسي للوحدة
 */

import { saveEntity, loadEntity, loadEntitiesByType } from '../../../app/storage/adapters/local.adapter.js';
import { generateId } from '../../../app/utils/helpers.js';

/**
 * إنشاء صفحة جديدة
 */
export async function createPage(title, content, parentId = null) {
  const page = {
    id: generateId('page'),
    title,
    content,
    parentId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await saveEntity('knowledge_page', page.id, page);
  return page;
}

/**
 * استرجاع صفحة بالمعرف
 */
export async function getPage(id) {
  return loadEntity('knowledge_page', id);
}

/**
 * تحديث صفحة
 */
export async function updatePage(id, updates) {
  const page = await getPage(id);
  if (!page) throw new Error('الصفحة غير موجودة');
  Object.assign(page, updates, { updatedAt: Date.now() });
  await saveEntity('knowledge_page', id, page);
  return page;
}

/**
 * استرجاع كل الصفحات
 */
export async function getAllPages() {
  return loadEntitiesByType('knowledge_page');
}

/**
 * بحث نصي بسيط (يمكن توسيعه لاحقاً)
 */
export async function searchPages(query) {
  const all = await getAllPages();
  const lowerQuery = query.toLowerCase();
  return all.filter(page =>
    page.title.toLowerCase().includes(lowerQuery) ||
    page.content.toLowerCase().includes(lowerQuery)
  );
}
