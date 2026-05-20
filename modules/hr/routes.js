export const routes = [
  { method: 'GET', path: '/api/hr/employees', handler: 'listEmployees', permissions: ['hr:read'] },
  { method: 'POST', path: '/api/hr/employees', handler: 'addEmployee', permissions: ['hr:write'] },
  { method: 'GET', path: '/api/hr/employees/:id', handler: 'getEmployee', permissions: ['hr:read'] },
  { method: 'PUT', path: '/api/hr/employees/:id', handler: 'updateEmployee', permissions: ['hr:write'] },
  { method: 'DELETE', path: '/api/hr/employees/:id', handler: 'deleteEmployee', permissions: ['hr:delete'] },
  { method: 'POST', path: '/api/hr/leave-request', handler: 'requestLeave', permissions: ['hr:write'] }
];
