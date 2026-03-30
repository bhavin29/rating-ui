export function Table<T extends Record<string, unknown>>({
  columns,
  rows
}: {
  columns: Array<{ key: keyof T; title: string }>;
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 font-medium text-slate-600">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-slate-100">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-slate-700">
                  {String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
