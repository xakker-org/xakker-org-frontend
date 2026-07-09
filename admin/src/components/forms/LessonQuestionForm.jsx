import { useState } from "react";
import { lessonQuestions } from "../../services/adminApi";
import { useLang } from "../../contexts/LanguageContext";
import Field, { Input, Textarea } from "../ui/Field";
import Button from "../ui/Button";
import PlainChoiceListEditor from "./PlainChoiceListEditor";

const T = {
  az: {
    text: "Sual", explanation: "İzah", atSeconds: "Video vaxtı (saniyə, könüllü)",
    points: "Xal", order: "Sıra", choices: "Variantlar",
    save: "Yadda saxla", saving: "Yadda saxlanılır...", cancel: "İmtina",
  },
  en: {
    text: "Question", explanation: "Explanation", atSeconds: "Video timestamp (sec, optional)",
    points: "Points", order: "Order", choices: "Choices",
    save: "Save", saving: "Saving...", cancel: "Cancel",
  },
};

function initialFromRecord(record) {
  return {
    text: record?.text ?? "",
    explanation: record?.explanation ?? "",
    at_seconds: record?.at_seconds ?? "",
    points: record?.points ?? 10,
    order: record?.order ?? 1,
    choices: (record?.choices || []).map((c) => ({ id: c.id, text: c.text, is_correct: c.is_correct, order: c.order })),
  };
}

export default function LessonQuestionForm({ id, record, parentFilter, onSaved, onCancel }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [values, setValues] = useState(() => initialFromRecord(record));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...values, ...parentFilter, at_seconds: values.at_seconds === "" ? null : values.at_seconds };
      if (id) await lessonQuestions.update(id, payload);
      else await lessonQuestions.create(payload);
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "object" ? Object.values(data).flat().join(" ") : String(data || "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <Field label={t.text}>
        <Textarea rows={2} value={values.text} onChange={(e) => set("text", e.target.value)} required />
      </Field>
      <Field label={t.choices}>
        <PlainChoiceListEditor choices={values.choices} onChange={(c) => set("choices", c)} />
      </Field>
      <Field label={t.explanation}>
        <Textarea rows={2} value={values.explanation} onChange={(e) => set("explanation", e.target.value)} />
      </Field>
      <div className="form-row">
        <Field label={t.atSeconds}>
          <Input type="number" value={values.at_seconds} onChange={(e) => set("at_seconds", e.target.value === "" ? "" : Number(e.target.value))} />
        </Field>
        <Field label={t.points}>
          <Input type="number" value={values.points} onChange={(e) => set("points", Number(e.target.value))} />
        </Field>
      </div>
      <Field label={t.order}>
        <Input type="number" value={values.order} onChange={(e) => set("order", Number(e.target.value))} />
      </Field>

      {error && <div className="field-error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t.cancel}</Button>}
        <Button type="submit" variant="accent" disabled={submitting}>{submitting ? t.saving : t.save}</Button>
      </div>
    </form>
  );
}
