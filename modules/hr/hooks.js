export const hooks = {
  onLoad: async (sdk) => {
    console.log('[HR] وحدة الموارد البشرية جاهزة');
    await sdk.emit('hr:ready', { version: '0.1.0' });
  },
  onUnload: async (sdk) => console.log('[HR] إلغاء تثبيت'),
  onActivate: async (sdk) => console.log('[HR] تفعيل'),
  onDeactivate: async (sdk) => console.log('[HR] إلغاء التفعيل')
};
