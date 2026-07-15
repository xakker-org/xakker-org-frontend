import { useEffect, useState } from "react";
import { useLang } from "../../contexts/LanguageContext";

/**
 * M2M tag picker — toggleable pill chips loaded from an endpoint, matching
 * RelationSelect's fetch-on-mount pattern but for multi-value fields
 * (Mission.tags). `value` is an array of ids; `onChange(nextIds)`.
 */
export default function TagMultiSelect({ endpoint, value = [], onChange, labelKey = "name" }) {
  const { lang } = useLang();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    endpoint
      .list({ page_size: 200 })
      .then(({ data }) => {
        if (mounted) setOptions(data.results ?? data);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [endpoint]);

  const ids = new Set((value || []).map(Number));

  const toggle = (id) => {
    if (ids.has(id)) onChange((value || []).filter((v) => Number(v) !== id));
    else onChange([...(value || []), id]);
  };

  if (loading) {
    return <div className="tag-picker tag-picker-loading">{lang === "az" ? "Yüklənir..." : "Loading..."}</div>;
  }

  if (options.length === 0) {
    return (
      <div className="tag-picker-empty">
        {lang === "az" ? "Hələ teq yoxdur." : "No tags yet."}
      </div>
    );
  }

  return (
    <div className="tag-picker">
      {options.map((opt) => {
        const active = ids.has(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            className={`tag-pill${active ? " is-active" : ""}`}
            onClick={() => toggle(opt.id)}
            aria-pressed={active}
          >
            {opt[labelKey] ?? opt.name}
          </button>
        );
      })}
    </div>
  );
}
