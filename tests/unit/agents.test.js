import { executeAgent, stopAgent, getAgentStatus } from '../../agents/runtime/execution-engine.js';
import { grantPermission, canExecute } from '../../agents/runtime/permissions-bridge.js';
import { autoReorder } from '../../agents/tools/automation.tool.js';
import { addProduct } from '../../modules/inventory/services/core.js';

async function testAgentExecution() {
  const agentCode = `
    (async () => {
      const result = await herpAgent.tools.autoReorder('agent-1', 5);
      herpAgent.postMessage({ result });
    })();
  `;
  await executeAgent('agent-1', agentCode, ['automation:inventory']);
  const status = getAgentStatus('agent-1');
  if (status !== 'running') throw new Error('Agent not running');
  stopAgent('agent-1');
  console.log('✅ Agent execution test passed');
}

async function testAutoReorder() {
  // إضافة منتج بمخزون منخفض
  await addProduct('سماعات', 'SPK-001', 2, 50);
  grantPermission('agent-2', 'automation:inventory');
  const result = await autoReorder('agent-2', 3);
  if (result.reorderCount === 0) throw new Error('Auto reorder failed');
  console.log('✅ Auto-reorder test passed');
}

testAgentExecution().catch(console.error);
testAutoReorder().catch(console.error);
