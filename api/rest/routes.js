/**
 * HERP REST API Routes — تعريف مسارات API
 */

export const routes = [
    { method: 'GET', path: '/api/health', handler: 'healthCheck' },
    { method: 'GET', path: '/api/identity', handler: 'getIdentity' },
    { method: 'POST', path: '/api/identity', handler: 'createIdentity' },
    { method: 'GET', path: '/api/modules', handler: 'listModules' },
    { method: 'POST', path: '/api/modules/install', handler: 'installModule' }
];
