/**
 * HERP Agent Execution Engine — محرك تنفيذ مهام الوكلاء
 * 
 * يدير دورة حياة تنفيذ الأوامر داخل بيئة معزولة.
 */

import { AgentSandbox } from './sandbox.js';
import { scheduleTask, unscheduleTask } from './scheduler.js';

const activeAgents = new Map(); // agentId → { sandbox, status }

/**
 * تنفيذ وكيل (تحميل كوده وتشغيله)
 * @param {string} agentId
 * @param {string} code
 * @param {Array} permissions
 */
export async function executeAgent(agentId, code, permissions) {
    if (activeAgents.has(agentId)) {
        throw new Error(`الوكيل ${agentId} قيد التشغيل بالفعل`);
    }
    const sandbox = new AgentSandbox(agentId, permissions);
    sandbox.run(code);
    activeAgents.set(agentId, { sandbox, status: 'running' });
    console.log(`[Agent] تم تشغيل الوكيل ${agentId}`);
}

/**
 * إيقاف وكيل
 */
export function stopAgent(agentId) {
    const agent = activeAgents.get(agentId);
    if (agent) {
        agent.sandbox.destroy();
        activeAgents.delete(agentId);
        console.log(`[Agent] تم إيقاف الوكيل ${agentId}`);
    }
}

/**
 * حالة الوكيل
 */
export function getAgentStatus(agentId) {
    return activeAgents.get(agentId)?.status || 'stopped';
}
