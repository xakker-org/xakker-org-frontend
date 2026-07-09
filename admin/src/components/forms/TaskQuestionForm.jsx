import { useState } from "react";
import { taskQuestions } from "../../services/adminApi";
import { useLang } from "../../contexts/LanguageContext";
import Field, { Input, Textarea } from "../ui/Field";
import Segmented from "../ui/Segmented";
import Button from "../ui/Button";
import PlainChoiceListEditor from "./PlainChoiceListEditor";

const KIND_CHOICES = ["text", "flag", "choice", "numeric", "review"];

const T = {
  az: {
    prompt: "Sual", kind: "Növ", answer: "Cavab", hint: "İpucu", hintCost: "İpucu qiyməti",
    explanation: "İzah", points: "Xal", order: "Sıra", caseSensitive: "Böyük/kiçik hərf həssas",
    choices: "Variantlar", save: "Yadda saxla", saving: "Yadda saxlanılır...", cancel: "İmtina",
  },
  en: {
    prompt: "Prompt", kind: "Kind", answer: "Answer", hint: "Hint", hintCost: "Hint cost",
    explanation: "Explanation", points: "Points", order: "Order", caseSensitive: "Case sensitive",
    choices: "Choices", save: "Save", saving: "Saving...", cancel: "Cancel",
  },
};

function initialFromRecord(record) {
  return {
    prompt: record?.prompt ?? "",
    kind: record?.kind ?? "text",
    answer: record?.answer ?? "",
    hint: record?.hint ?? "",
    hint_cost: record?.hint_cost ?? 5,
    explanation: record?.explanation ?? "",
    points: record?.points ?? 10,
    order: record?.order ?? 1,
    case_sensitive: record?.case_sensitive ?? false,
    choices: (record?.choices || []).map((c) => ({ id: c.id, text: c.text, is_correct: c.is_correct, order: c.order })),
  };
}

export default function TaskQuestionForm({ id, record, parentFilter, onSaved, onCancel }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [values, setValues] = useState(() => initialFromRecord(record));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const isChoice = values.kind === "choice";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...values, ...parentFilter, choices: isChoice ? values.choices : [] };
      if (id) await taskQuestions.update(id, payload);
      else await taskQuestions.create(payload);
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
      <Field label={t.prompt}>
        <Textarea rows={2} value={values.prompt} onChange={(e) => set("prompt", e.target.value)} required />
      </Field>
      <Field label={t.kind}>
        <Segmented value={values.kind} onChange={(v) => set("kind", v)} options={KIND_CHOICES.map((v) => ({ value: v, label: v }))} />
      </Field>

      {isChoice ? (
        <Field label={t.choices}>
          <PlainChoiceListEditor choices={values.choices} onChange={(c) => set("choices", c)} />
        </Field>
      ) : (
        <Field label={t.answer}>
          <Input value={values.answer} onChange={(e) => set("answer", e.target.value)} />
        </Field>
      )}

      <div className="form-row">
        <Field label={t.hint}>
          <Textarea rows={2} value={values.hint} onChange={(e) => set("hint", e.target.value)} />
        </Field>
        <Field label={t.hintCost}>
          <Input type="number" value={values.hint_cost} onChange={(e) => set("hint_cost", Number(e.target.value))} />
        </Field>
      </div>

      <Field label={t.explanation}>
        <Textarea rows={2} value={values.explanation} onChange={(e) => set("explanation", e.target.value)} />
      </Field>

      <div className="form-row">
        <Field label={t.points}>
          <Input type="number" value={values.points} onChange={(e) => set("points", Number(e.target.value))} />
        </Field>
        <Field label={t.order}>
          <Input type="number" value={values.order} onChange={(e) => set("order", Number(e.target.value))} />
        </Field>
      </div>

      <div className={`toggle-row${values.case_sensitive ? " is-on" : ""}`} onClick={() => set("case_sensitive", !values.case_sensitive)}>
        <span className="toggle-switch" />
        <span>{t.caseSensitive}</span>
      </div>

      {error && <div className="field-error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t.cancel}</Button>}
        <Button type="submit" variant="accent" disabled={submitting}>{submitting ? t.saving : t.save}</Button>
      </div>
    </form>
  );
}
