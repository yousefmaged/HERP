/**
 * HERP Module: Knowledge Hooks
 * نقاط تمدد تتفاعل مع دورة حياة الوحدة
 */

export const hooks = {
  /**
   * يُستدعى عند تحميل الوحدة
   */
  onLoad: async (sdk) => {
    console.log('[Knowledge] وحدة المعرفة جاهزة');
    await sdk.emit('knowledge:ready', { version: '0.1.0' });
  },
  
  /**
   * يُستدعى عند إلغاء تثبيت الوحدة
   */
  onUnload: async (sdk) => {
    console.log('[Knowledge] إلغاء تثبيت وحدة المعرفة');
  },
  
  /**
   * يُستدعى عند تفعيل الوحدة (عرض واجهتها)
   */
  onActivate: async (sdk) => {
    console.log('[Knowledge] تفعيل وحدة المعرفة');
  },
  
  /**
   * يُستدعى عند إلغاء تفعيل الوحدة
   */
  onDeactivate: async (sdk) => {
    console.log('[Knowledge] إلغاء تفعيل وحدة المعرفة');
  }
};
