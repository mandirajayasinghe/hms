export default function Table({ columns, rows, keyField = "id", onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-soft/50 text-left text-ink/60 text-xs uppercase tracking-wide">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-ink/40">No records found</td></tr>
          )}
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              onClick={() => onRowClick?.(row)}
              className={`bg-surface hover:bg-primary-soft/30 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-ink/80">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}