/**
 * HERP Module: Knowledge Commands
 * أوامر يمكن استدعاؤها من Command Palette (Ctrl+K)
 */

export const commands = [
  {
    id: 'knowledge:new-page',
    label: 'إنشاء صفحة جديدة',
    shortcut: 'Ctrl+N',
    handler: 'createNewPage'
  },
  {
    id: 'knowledge:search',
    label: 'بحث في المعرفة',
    shortcut: 'Ctrl+Shift+F',
    handler: 'openSearch'
  },
  {
    id: 'knowledge:export-all',
    label: 'تصدير كل الصفحات',
    handler: 'exportAllPages'
  }
];
