/**
 * HERP Agent Permissions Bridge — جسر صلاحيات الوكلاء
 * 
 * يتحقق من أذونات الوكيل قبل تنفيذ أي أمر.
 */

const agentPermissions = new Map(); // agentId → Set of permissions

export function grantPermission(agentId, permission) {
    if (!agentPermissions.has(agentId)) agentPermissions.set(agentId, new Set());
    agentPermissions.get(agentId).add(permission);
}

export function revokePermission(agentId, permission) {
    agentPermissions.get(agentId)?.delete(permission);
}

export function canExecute(agentId, requiredPermission) {
    const perms = agentPermissions.get(agentId);
    return perms?.has('*') || perms?.has(requiredPermission);
}
