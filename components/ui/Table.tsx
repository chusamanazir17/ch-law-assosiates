import React from 'react';
import { EmptyState } from './EmptyState';
import { SkeletonRows } from './Spinner';

export interface TableColumn<T> {
  /** Stable key for the column. */
  key: string;
  /** Column header text. */
  header: string;
  /** Render a cell for a row. Defaults to String(row[key]). */
  render?: (row: T, index: number) => React.ReactNode;
  /** Extra classes for header + cells of this column. */
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Stable row key (string key of T, or a function). */
  keyOf: keyof T | ((row: T, index: number) => string | number);
  /** Accessible name for the table. */
  caption?: string;
  /** Show skeleton rows instead of data. */
  loading?: boolean;
  /** Shown when data is empty and not loading. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

const ALIGN_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Shared data table. Styled by the .table design-system class
 * (app/globals.css); wraps in .table-wrap for the standard mobile
 * horizontal-scroll pattern (FE-11). Headers carry scope="col" (FE-29).
 */
export function Table<T>({
  columns,
  data,
  keyOf,
  caption,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  className = '',
}: TableProps<T>) {
  const resolveKey = (row: T, index: number) =>
    typeof keyOf === 'function' ? keyOf(row, index) : String((row as Record<string, unknown>)[keyOf as string] ?? index);

  const resolveCell = (row: T, col: TableColumn<T>, index: number) =>
    col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '');

  return (
    <div className={`table-wrap ${className}`.trim()}>
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${ALIGN_CLASSES[col.align ?? 'left']} ${col.className ?? ''}`.trim()}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="!border-b-0 !p-4">
                <SkeletonRows rows={4} />
                <span className="sr-only" role="status">Loading…</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="!border-b-0 !p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={resolveKey(row, i)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${ALIGN_CLASSES[col.align ?? 'left']} ${col.className ?? ''}`.trim()}
                  >
                    {resolveCell(row, col, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
