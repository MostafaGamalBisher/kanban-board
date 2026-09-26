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
    notFound: 'هذه الصفحة غير موجودة.',
    goHome: 'الانتقال إلى لوحاتك',
  },
  validation: {
    required: 'لا يمكن أن يكون فارغًا',
    tooLong: 'طويل جدًا',
    duplicateName: 'مستخدم بالفعل',
    duplicateId: 'عنصر مكرر',
    invalid: 'قيمة غير صالحة',
  },
  preferences: {
    darkTheme: 'الوضع الداكن',
    hideSidebar: 'إخفاء الشريط الجانبي',
    showSidebar: 'إظهار الشريط الجانبي',
    switchLanguageTitle: 'تغيير اللغة؟',
    switchLanguageBody:
      'تُحفظ التغييرات التي أجريتها في هذه الجلسة حتى إعادة تحميل الصفحة أو تغيير اللغة فقط. تغيير اللغة الآن يتجاهلها.',
    switchLanguageConfirm: 'التغيير وتجاهل التعديلات',
  },
  board: {
    noBoards: 'لا توجد لوحات بعد.',
    notFound: 'هذه اللوحة غير موجودة.',
    switcher: 'اختر لوحة',
    addTask: 'إضافة مهمة جديدة',
    menu: 'خيارات اللوحة',
    edit: 'تعديل اللوحة',
    delete: 'حذف اللوحة',
    deleteTitle: 'حذف هذه اللوحة؟',
    columnHeading: '{name} ({count})',
    empty: 'هذه اللوحة فارغة. أنشئ عمودًا جديدًا للبدء.',
    addColumn: 'إضافة عمود جديد',
    newColumn: 'عمود جديد',
    columnsNav: 'الأعمدة',
    createBoard: '+ إنشاء لوحة جديدة',
    addBoardTitle: 'إضافة لوحة جديدة',
    createBoardSubmit: 'إنشاء اللوحة',
    nameLabel: 'اسم اللوحة',
    namePlaceholder: 'مثال: تصميم المواقع',
    columnsLabel: 'أعمدة اللوحة',
    columnInput: 'العمود {number}',
    removeColumn: 'حذف العمود {number}',
    defaultColumns: ['للتنفيذ', 'قيد التنفيذ'],
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
  task: {
    subtasksHeading: 'المهام الفرعية ({done} من {total})',
    status: 'الحالة الحالية',
    menu: 'خيارات المهمة',
    edit: 'تعديل المهمة',
    delete: 'حذف المهمة',
    deleteTitle: 'حذف هذه المهمة؟',
    deleteConfirm:
      'هل أنت متأكد من حذف مهمة «{title}» ومهامها الفرعية؟ لا يمكن التراجع عن ذلك.',
    addTitle: 'إضافة مهمة جديدة',
    createSubmit: 'إنشاء المهمة',
    titleLabel: 'العنوان',
    titlePlaceholder: 'مثال: استراحة قهوة',
    descriptionLabel: 'الوصف',
    descriptionPlaceholder:
      'مثال: من الجيد دائمًا أخذ استراحة. ربع ساعة من الراحة تجدد النشاط قليلًا.',
    subtasksLabel: 'المهام الفرعية',
    subtaskPlaceholders: ['مثال: تحضير القهوة', 'مثال: شرب القهوة والابتسام'],
    subtaskInput: 'المهمة الفرعية {number}',
    removeSubtask: 'حذف المهمة الفرعية {number}',
    addSubtask: 'إضافة مهمة فرعية',
    statusLabel: 'الحالة',
  },
  dnd: {
    roleDescription: 'مهمة قابلة للسحب',
    instructions:
      'لنقل مهمة، اضغط مفتاح المسافة لالتقاطها، وحرّكها بمفاتيح الأسهم، ثم اضغط المسافة لإفلاتها أو Escape للإلغاء. اضغط Enter لفتح المهمة.',
    pickedUp: 'تم التقاط المهمة {title}.',
    over: 'المهمة {title} فوق العمود {column}، الموضع {position} من {total}.',
    dropped:
      'نُقلت المهمة {title} إلى العمود {column}، الموضع {position} من {total}.',
    cancelled: 'أُلغي النقل. عادت المهمة {title} إلى مكانها.',
  },
};
