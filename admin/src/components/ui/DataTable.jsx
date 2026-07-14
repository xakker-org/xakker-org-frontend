import "./DataTable.css";
import { useLang } from "../../contexts/LanguageContext";
import { t } from "../../lib/i18n";

const EMPTY_LABEL = { az: "Məlumat yoxdur", en: "No data" };

export default function DataTable({ columns = [], data = [], rowKey, highlightRow, onRowClick, sortKey, onSort }) {
  const { lang } = useLang();
  return (
    <div className="dt-wrap">
      <table className="dt">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || "left" }}
                className={`${col.sortable ? "dt-sortable" : ""}${sortKey === col.key ? " is-sorted" : ""}`}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                tabIndex={col.sortable && onSort ? 0 : undefined}
                onKeyDown={
                  col.sortable && onSort
                    ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort(col.key); } }
                    : undefined
                }
              >
                <span className="dt-th">
                  {t(col.header, lang)}
                  {col.sortable && <span className="dt-sort-mark">↕</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr><td colSpan={columns.length} className="dt-empty">{EMPTY_LABEL[lang] || EMPTY_LABEL.az}</td></tr>
          )}
          {data.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : i}
              className={highlightRow && highlightRow(row, i) ? "is-me" : ""}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row, i); } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              style={onRowClick ? { cursor: "pointer" } : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || "left" }}>
                  {col.render ? col.render(row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
