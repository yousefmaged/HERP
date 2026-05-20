import { saveEntity, loadEntity, loadEntitiesByType } from '../../../app/storage/adapters/local.adapter.js';
import { generateId } from '../../../app/utils/helpers.js';

export async function addEmployee(name, position, salary, email) {
  const employee = {
    id: generateId('emp'),
    name,
    position,
    salary,
    email,
    status: 'active',
    leaveBalance: 21,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await saveEntity('employee', employee.id, employee);
  return employee;
}

export async function getEmployee(id) {
  return loadEntity('employee', id);
}

export async function listEmployees() {
  return loadEntitiesByType('employee');
}

export async function updateEmployee(id, updates) {
  const emp = await getEmployee(id);
  if (!emp) throw new Error('Employee not found');
  Object.assign(emp, updates, { updatedAt: Date.now() });
  await saveEntity('employee', id, emp);
  return emp;
}

export async function deleteEmployee(id) {
  // soft delete? سنحذف فعلياً
  const db = await openDatabase();
  const tx = db.transaction(['employees'], 'readwrite');
  await new Promise((resolve, reject) => {
    const req = tx.objectStore('employees').delete(id);
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

export async function requestLeave(employeeId, startDate, endDate) {
  const emp = await getEmployee(employeeId);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (emp.leaveBalance < days) throw new Error('رصيد الإجازات غير كاف');
  emp.leaveBalance -= days;
  await updateEmployee(employeeId, { leaveBalance: emp.leaveBalance });
  // تسجيل طلب الإجازة (يمكن حفظه في كيان منفصل)
  return { success: true, remaining: emp.leaveBalance };
}
