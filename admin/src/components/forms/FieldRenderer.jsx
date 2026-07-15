import Field, { Input, Textarea, Select } from "../ui/Field";
import MarkdownEditor from "../ui/MarkdownEditor";
import RelationSelect from "./RelationSelect";
import { useLang } from "../../contexts/LanguageContext";

function labelOf(field, lang) {
  if (!field.label) return field.name;
  return typeof field.label === "string" ? field.label : field.label[lang] || field.label.az;
}

export default function FieldRenderer({ field, value, onChange, error }) {
  const { lang } = useLang();
  const label = labelOf(field, lang);

  if (field.type === "boolean") {
    return (
      <div className={`toggle-row${value ? " is-on" : ""}`} onClick={() => onChange(!value)}>
        <span className="toggle-switch" />
        <span>{label}</span>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <Field label={label} error={error}>
        <Select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return <option key={optValue} value={optValue}>{optLabel}</option>;
          })}
        </Select>
      </Field>
    );
  }

  if (field.type === "relation") {
    return (
      <Field label={label} error={error}>
        <RelationSelect
          endpoint={field.endpoint}
          labelKey={field.labelKey || "title"}
          value={value}
          onChange={onChange}
          quickCreateFields={field.quickCreateFields}
          quickCreateTitle={field.quickCreateTitle}
        />
      </Field>
    );
  }

  if (field.type === "richtext") {
    return (
      <Field label={label} error={error}>
        <MarkdownEditor value={value ?? ""} onChange={onChange} rows={12} />
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field label={label} error={error}>
        <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  }

  if (field.type === "number") {
    return (
      <Field label={label} error={error}>
        <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
      </Field>
    );
  }

  // text | slug | color | icon
  return (
    <Field label={label} error={error}>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.type === "slug" ? "auto" : undefined} />
    </Field>
  );
}
