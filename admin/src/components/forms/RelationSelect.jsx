import { useEffect, useState } from "react";
import { Select } from "../ui/Field";
import QuickCreateModal from "./QuickCreateModal";
import { useLang } from "../../contexts/LanguageContext";
import { t } from "../../lib/i18n";

/**
 * FK dropdown. When `quickCreateFields` is given, renders a "+" button next
 * to the select — Django-admin's "add another" popup: create the related
 * object inline, without leaving the current form. On save, the new object
 * is appended to the option list and auto-selected.
 */
export default function RelationSelect({
  endpoint,
  labelKey = "title",
  valueKey = "id",
  value,
  onChange,
  allowEmpty = true,
  quickCreateFields,
  quickCreateTitle,
}) {
  const { lang } = useLang();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleCreated = (newItem) => {
    setOptions((prev) => [...prev, newItem]);
    onChange(newItem[valueKey]);
    setModalOpen(false);
  };

  return (
    <div className="relation-row">
      <Select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={loading}
      >
        {allowEmpty && <option value="">—</option>}
        {options.map((opt) => (
          <option key={opt[valueKey]} value={opt[valueKey]}>
            {opt[labelKey] ?? opt.title ?? opt.name}
          </option>
        ))}
      </Select>
      {quickCreateFields && (
        <button
          type="button"
          className="relation-add-btn"
          onClick={() => setModalOpen(true)}
          title={lang === "az" ? "Yenisini yarat" : "Add another"}
        >
          +
        </button>
      )}
      {quickCreateFields && (
        <QuickCreateModal
          open={modalOpen}
          title={t(quickCreateTitle, lang) || (lang === "az" ? "Yeni yarat" : "Create new")}
          fields={quickCreateFields}
          endpoint={endpoint}
          onCreated={handleCreated}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
