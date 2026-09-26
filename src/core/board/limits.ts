/** Maximum lengths, in characters, after trimming. Domain rules, not UI settings. */
export const LIMITS = {
  boardName: 50,
  columnName: 50,
  taskTitle: 100,
  taskDescription: 1000,
  subtaskTitle: 100,
} as const;
