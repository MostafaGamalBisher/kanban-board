import { arabicPlural } from '../plural.ts';
import type { Dictionary } from './en.ts';

/** Arabic interface text. Typed from en.ts: every key must exist here. */
export const ar: Dictionary = {
  meta: {
    description: 'نظّم عملك في لوحات وأعمدة ومهام.',
  },
  common: {
    close: 'إغلاق',
    cancel: 'إلغاء',
    delete: 'حذف',
    save: 'حفظ التغييرات',
  },
  validation: {
    required: 'لا يمكن أن يكون فارغًا',
    tooLong: 'طويل جدًا',
    duplicateName: 'مستخدم بالفعل',
    duplicateId: 'عنصر مكرر',
    invalid: 'قيمة غير صالحة',
  },
  board: {
    allBoards: 'كل اللوحات ({count})',
    taskCount: arabicPlural({
      zero: 'لا توجد مهام',
      one: 'مهمة واحدة',
      two: 'مهمتان',
      few: '{count} مهام',
      many: '{count} مهمة',
      other: '{count} مهمة',
    }),
    // Phrased to avoid plural agreement with a changing total.
    subtaskProgress: 'المهام الفرعية: {done} من {total}',
    deleteConfirm:
      'هل أنت متأكد من حذف لوحة «{name}»؟ سيؤدي ذلك إلى حذف جميع الأعمدة والمهام، ولا يمكن التراجع عنه.',
  },
};
