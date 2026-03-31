export function Table<T extends Record<string, unknown>>({
  columns,
  rows
}: {
  columns: Array<{ key: keyof T; title: string }>;
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-slate-100">
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                No rows to display yet.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-slate-700">
                    {String(row[col.key] ?? '-')}
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
