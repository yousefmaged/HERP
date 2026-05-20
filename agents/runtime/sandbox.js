/**
 * HERP Agent Sandbox — بيئة معزولة لتنفيذ الوكلاء بأمان
 */

export class AgentSandbox {
    constructor(agentId, permissions) {
        this.agentId = agentId;
        this.permissions = permissions; // قائمة الأذونات المسموحة
        this.iframe = null;
    }

    /**
     * تشغيل الوكيل في iframe معزول
     * @param {string} code - كود JavaScript الخاص بالوكيل
     */
    run(code) {
        this.iframe = document.createElement('iframe');
        this.iframe.sandbox = 'allow-scripts allow-same-origin';
        this.iframe.style.display = 'none';
        document.body.appendChild(this.iframe);
        const doc = this.iframe.contentDocument;
        doc.open();
        doc.write(`
            <script>
                window.herpAgent = {
                    permissions: ${JSON.stringify(this.permissions)},
                    postMessage: (msg) => window.parent.postMessage({ agentId: '${this.agentId}', msg }, '*')
                };
                try {
                    ${code}
                } catch(e) {
                    window.parent.postMessage({ agentId: '${this.agentId}', error: e.message }, '*');
                }
            <\/script>
        `);
        doc.close();
    }

    destroy() {
        if (this.iframe) this.iframe.remove();
    }
}
