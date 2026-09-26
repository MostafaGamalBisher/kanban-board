import type { ValidationKey } from '../../core/validation.ts';
import { englishPlural } from '../plural.ts';

/**
 * English interface text: the source of truth. ar.ts is typed from this
 * object, so a key missing (or extra) in Arabic is a compile error.
 *
 * Placeholders are written {name} and filled by i18n.format / i18n.plural;
 * numbers are formatted with the locale's digits. Every language must use
 * the same placeholders (checked by dictionaries.test.ts).
 */
export const en = {
  meta: {
    description: 'Plan work on boards, columns and tasks.',
  },
  common: {
    close: 'Close',
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save Changes',
    notFound: 'This page doesn’t exist.',
    goHome: 'Go to your boards',
  },
  validation: {
    required: 'Can’t be empty',
    tooLong: 'Too long',
    duplicateName: 'Already used',
    duplicateId: 'Duplicate entry',
    invalid: 'Invalid value',
  } satisfies Record<ValidationKey, string>,
  preferences: {
    darkTheme: 'Dark theme',
    hideSidebar: 'Hide Sidebar',
    showSidebar: 'Show Sidebar',
    switchLanguageTitle: 'Switch language?',
    switchLanguageBody:
      'Changes you made in this session are kept only until you reload or switch language. Switching now discards them.',
    switchLanguageConfirm: 'Switch and discard',
  },
  board: {
    noBoards: 'There are no boards yet.',
    notFound: 'This board doesn’t exist.',
    switcher: 'Choose a board',
    addTask: 'Add New Task',
    menu: 'Board options',
    edit: 'Edit Board',
    delete: 'Delete Board',
    columnHeading: '{name} ({count})',
    empty: 'This board is empty. Create a new column to get started.',
    addColumn: 'Add New Column',
    newColumn: 'New Column',
    createBoard: '+ Create New Board',
    addBoardTitle: 'Add New Board',
    createBoardSubmit: 'Create New Board',
    nameLabel: 'Board Name',
    namePlaceholder: 'e.g. Web Design',
    columnsLabel: 'Board Columns',
    columnInput: 'Column {number}',
    removeColumn: 'Remove column {number}',
    defaultColumns: ['Todo', 'Doing'],
    allBoards: 'All boards ({count})',
    taskCount: englishPlural({ one: '{count} task', other: '{count} tasks' }),
    subtaskProgress: '{done} of {total} subtasks',
    deleteConfirm:
      'Are you sure you want to delete the ‘{name}’ board? This action will remove all columns and tasks and cannot be reversed.',
  },
};

export type Dictionary = typeof en;
