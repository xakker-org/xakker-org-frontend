import { useMemo, useState } from "react";
import { useLang } from "../../contexts/LanguageContext";
import { slugify } from "../../utils/slugify";
import Button from "../ui/Button";
import FieldRenderer from "./FieldRenderer";

const T = {
  az: { save: "Yadda saxla", saving: "Yadda saxlanılır...", cancel: "İmtina" },
  en: { save: "Save", saving: "Saving...", cancel: "Cancel" },
};

export default function ResourceForm({ fields, initialValues, onSubmit, onCancel, submitting, errors = {} }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] = initialValues?.[f.name] ?? (f.type === "boolean" ? false : "");
    });
    return base;
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));

  const slugField = useMemo(() => fields.find((f) => f.type === "slug"), [fields]);

  const setField = (name, value) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (slugField && name === slugField.from && !slugTouched) {
        next[slugField.name] = slugify(value);
      }
      return next;
    });
    if (slugField && name === slugField.name) setSlugTouched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // QuickCreateModal renders this form through a portal into document.body,
    // but React's synthetic events still bubble along the *component* tree —
    // so without this, saving a quick-create popup also re-submits whatever
    // outer <form> it was logically opened from (e.g. the Course drawer).
    e.stopPropagation();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(v) => setField(field.name, v)}
          error={errors[field.name]?.[0] || errors[field.name]}
        />
      ))}
      <div className="drawer-footer" style={{ padding: 0, border: "none", marginTop: 8 }}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t.cancel}
          </Button>
        )}
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
