export const commands = [
  { id: 'hr:add-employee', label: 'إضافة موظف جديد', handler: 'openAddEmployeeDialog' },
  { id: 'hr:list-employees', label: 'عرض جميع الموظفين', handler: 'showEmployeesList' },
  { id: 'hr:process-payroll', label: 'معالجة الرواتب', handler: 'processPayroll', permissions: ['hr:payroll:view'] }
];
