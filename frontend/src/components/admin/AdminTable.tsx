interface Column {
  key: string;
  label: string;
  render?: (row: any, index: number) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  rows: any[];
  rowKey?: string;
  emptyMessage?: string;
}

const AdminTable = ({ columns, rows, rowKey = '_id', emptyMessage = 'No records found.' }: AdminTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/40">
            {!rows.length && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row[rowKey] || index} className="transition hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-top text-sm text-slate-200">
                    {column.render ? column.render(row, index) : row[column.key]}
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

export default AdminTable;
