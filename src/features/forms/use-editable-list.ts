'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ListRow<Item> {
  /** React key: stable while rows are added and removed. */
  readonly key: number;
  readonly item: Item;
}

/**
 * A list of rows the user can add to, edit and remove from (board columns,
 * task subtasks), with focus management:
 * - adding a row focuses its field;
 * - removing a row focuses the field that took its place, or the previous
 *   one, or the "add" button when the list becomes empty.
 *
 * `fieldName(index)` is the `name` of a row's field; `addButtonName` the
 * `name` of the "add" button (form elements are found by name).
 */
export function useEditableList<Item>(
  formRef: RefObject<HTMLFormElement | null>,
  initial: readonly Item[],
  fieldName: (index: number) => string,
  addButtonName: string
) {
  // Initial rows are keyed by position; added rows continue the sequence.
  const nextKey = useRef(initial.length);
  const [rows, setRows] = useState<ListRow<Item>[]>(() =>
    initial.map((item, index) => ({ key: index, item }))
  );

  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (pendingFocus.current === null) return;
    const field = formRef.current?.elements.namedItem(pendingFocus.current);
    if (field instanceof HTMLElement) field.focus();
    pendingFocus.current = null;
  }, [rows, formRef]);

  return {
    rows,
    add(item: Item) {
      pendingFocus.current = fieldName(rows.length);
      setRows([...rows, { key: nextKey.current++, item }]);
    },
    update(index: number, item: Item) {
      setRows(rows.with(index, { ...rows[index]!, item }));
    },
    remove(index: number) {
      const remaining = rows.length - 1;
      pendingFocus.current =
        remaining > 0
          ? fieldName(Math.min(index, remaining - 1))
          : addButtonName;
      setRows(rows.toSpliced(index, 1));
    },
  };
}
