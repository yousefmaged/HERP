import { search } from '../../app/search/fulltext.js';

export async function searchTool(agentId, query) {
  // التحقق من الصلاحية
  const can = await import('../runtime/permissions-bridge.js').then(m => m.canExecute);
  if (!can(agentId, 'search:execute')) throw new Error('غير مصرح');
  const results = search(query);
  return { query, count: results.length, results };
}
