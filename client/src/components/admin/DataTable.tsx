import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export const DataTable = <T,>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden saas-shadow">
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center saas-shadow">
        <p className="text-slate-400 text-sm font-sans">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden saas-shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((item, index) => (
              <tr
                key={keyExtractor ? keyExtractor(item) : index}
                onClick={() => onRowClick && onRowClick(item)}
                className={`hover:bg-slate-100/70 hover:shadow-xs transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-3.5 text-sm ${col.className}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
