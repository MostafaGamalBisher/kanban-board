'use client';

import { useI18n } from '@/i18n/provider';

import { showcase } from './content';

/** TEMPORARY (node 3.2 showcase): proves useI18n() works in the browser. */
export function PluralsClient() {
  const { dict, plural, format } = useI18n();
  return (
    <ul className="text-body-l flex flex-col gap-1">
      {showcase.pluralCounts.map((count) => (
        <li key={count}>{plural(dict.board.taskCount, count)}</li>
      ))}
      <li>{format(dict.board.subtaskProgress, { done: 2, total: 3 })}</li>
    </ul>
  );
}
