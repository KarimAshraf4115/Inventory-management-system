import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = 'لا توجد بيانات',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl2 border border-line bg-white shadow-card">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas/70">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap px-4 py-3 font-kufi text-xs font-semibold uppercase text-gray-500 ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/70 transition last:border-0 hover:bg-navy-50/40"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ''}`}>
                    {c.render(row)}
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

interface ToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

import { Search } from 'lucide-react';

export function SearchToolbar({ search, onSearch, searchPlaceholder, children }: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder ?? 'بحث...'}
          className="input-base pr-9"
        />
      </div>
      {children}
    </div>
  );
}
