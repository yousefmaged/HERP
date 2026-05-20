import { Kernel } from '../../app/core/kernel.js';
import { loadModuleStructure } from '../../app/sdk/module-sdk.js';

async function testModuleLoading() {
    const kernel = new Kernel();
    await kernel.init();
    const structure = await loadModuleStructure('knowledge');
    if (!structure.manifest) throw new Error('Module structure invalid');
    console.log('✅ Module loading test passed');
}

testModuleLoading();
