import { useLang } from "../contexts/LanguageContext";

export default function Pagination({ page, pageSize, count, onChange }) {
  const { lang } = useLang();
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="pg">
      <button className="pg-btn" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`pg-btn${p === page ? " is-active" : ""}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button className="pg-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        ›
      </button>
      <span className="pg-info">
        {lang === "az" ? `${count} nəticə` : `${count} results`}
      </span>
    </div>
  );
}
