/**
 * Demo content for the node 1.3 design-system showcase.
 *
 * TEMPORARY: deleted in node 4.1, when the real board replaces the
 * showcase. Real UI text lives in the i18n dictionaries (node 3.2).
 * It is kept here, outside the JSX, so the no-literals lint rule holds
 * even for throwaway pages.
 */
export const showcase = {
  subheading: 'Kanban tokens on shadcn/ui (Radix). Dark by default.',

  sections: {
    palette: 'Semantic colors',
    columnDots: 'Column dots (repeat after six)',
    pluralsServer: 'Plurals, rendered on the server',
    pluralsClient: 'Plurals, rendered in the browser',
    type: 'Type scale',
    buttons: 'Buttons',
    forms: 'Form controls',
    overlays: 'Overlays',
  },

  swatches: [
    { name: 'background', className: 'bg-background' },
    { name: 'card', className: 'bg-card' },
    { name: 'popover', className: 'bg-popover' },
    { name: 'primary', className: 'bg-primary' },
    { name: 'primary-hover', className: 'bg-primary-hover' },
    { name: 'secondary', className: 'bg-secondary' },
    { name: 'muted-foreground', className: 'bg-muted-foreground' },
    { name: 'border', className: 'bg-border' },
    { name: 'destructive', className: 'bg-destructive' },
    { name: 'destructive-hover', className: 'bg-destructive-hover' },
  ],

  typeScale: [
    { name: 'Heading XL · 24/30 bold', className: 'text-heading-xl' },
    { name: 'Heading L · 18/23 bold', className: 'text-heading-l' },
    { name: 'Heading M · 15/19 bold', className: 'text-heading-m' },
    { name: 'HEADING S · 12/15 BOLD · 2.4PX', className: 'text-heading-s' },
    { name: 'Body L · 13/23 medium', className: 'text-body-l' },
    { name: 'Body M · 12/15 bold', className: 'text-body-m' },
  ],

  buttons: {
    primaryLarge: '+ Add New Task',
    primarySmall: 'Save Changes',
    secondary: '+ Add New Subtask',
    destructive: 'Delete',
    disabled: 'Disabled',
  },

  forms: {
    titleLabel: 'Title',
    titlePlaceholder: 'e.g. Take coffee break',
    invalidLabel: 'Column name',
    invalidError: 'Can’t be empty',
    descriptionLabel: 'Description',
    descriptionPlaceholder:
      'e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.',
    subtask: 'Research competitor pricing and business models',
    statusLabel: 'Status',
    statuses: [
      { value: 'todo', label: 'Todo' },
      { value: 'doing', label: 'Doing' },
      { value: 'done', label: 'Done' },
    ],
  },

  pluralCounts: [0, 1, 2, 3, 11, 100, 103],

  overlays: {
    dialogTrigger: 'Open dialog',
    dialogTitle: 'Add New Board',
    dialogDescription:
      'Dialogs sit on the card surface, 480px wide, with a localized close label.',
    alertTrigger: 'Delete board',
    alertTitle: 'Delete this board?',
    alertDescription:
      'Are you sure you want to delete the ‘Platform Launch’ board? This action will remove all columns and tasks and cannot be reversed.',
    alertConfirm: 'Delete',
    alertCancel: 'Cancel',
    menuTrigger: 'Board menu',
    menuEdit: 'Edit Board',
    menuDelete: 'Delete Board',
  },
} as const;
