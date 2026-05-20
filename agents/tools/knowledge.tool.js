import { getAllPages, getPage, searchPages } from '../../../modules/knowledge/services/core.js';

export async function knowledgeTool(agentId, action, params) {
  const can = await import('../runtime/permissions-bridge.js').then(m => m.canExecute);
  if (!can(agentId, 'knowledge:read')) throw new Error('غير مصرح');

  switch (action) {
    case 'list':
      return getAllPages();
    case 'get':
      return getPage(params.id);
    case 'search':
      return searchPages(params.query);
    default:
      throw new Error('Action non supportée');
  }
}
