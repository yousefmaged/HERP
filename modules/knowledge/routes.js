/**
 * HERP Module: Knowledge Routes
 * تعريف مسارات API الداخلية لهذه الوحدة
 */

export const routes = [
  {
    path: '/api/knowledge/pages',
    method: 'GET',
    handler: 'getAllPages',
    permissions: ['knowledge:read']
  },
  {
    path: '/api/knowledge/pages/:id',
    method: 'GET',
    handler: 'getPageById',
    permissions: ['knowledge:read']
  },
  {
    path: '/api/knowledge/pages',
    method: 'POST',
    handler: 'createPage',
    permissions: ['knowledge:write']
  },
  {
    path: '/api/knowledge/pages/:id',
    method: 'PUT',
    handler: 'updatePage',
    permissions: ['knowledge:write']
  },
  {
    path: '/api/knowledge/search',
    method: 'GET',
    handler: 'searchPages',
    permissions: ['knowledge:search']
  }
];
