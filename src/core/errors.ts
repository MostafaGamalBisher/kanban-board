import { toValidationKey } from './validation.ts';

export interface DataIssue {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

/**
 * Stored data (the seed file today, a database in Part B) failed schema
 * validation. This is a developer-facing error: the message names the
 * source and lists every problem as `path: code`, one per line.
 */
export class InvalidDataError extends Error {
  readonly source: string;
  readonly issues: readonly DataIssue[];

  constructor(source: string, issues: readonly DataIssue[]) {
    const lines = issues.map(
      (issue) =>
        `  ${formatPath(issue.path)}: ${toValidationKey(issue.message)}`
    );
    super(`Invalid data in ${source}:\n${lines.join('\n')}`);
    this.name = 'InvalidDataError';
    this.source = source;
    this.issues = issues;
  }
}

/** `[0, 'columns', 1, 'name']` → `[0].columns[1].name` */
function formatPath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return '(root)';
  }
  return path
    .map((segment, index) =>
      typeof segment === 'number'
        ? `[${segment}]`
        : `${index === 0 ? '' : '.'}${String(segment)}`
    )
    .join('');
}
