import { useState } from "react";
import { missionExamQuestions } from "../../services/adminApi";
import { useLang } from "../../contexts/LanguageContext";
import Field, { Textarea } from "../ui/Field";
import Segmented from "../ui/Segmented";
import Button from "../ui/Button";
import OptionLetteringFields from "./OptionLetteringFields";

const QUESTION_TYPES = ["closed", "open"];
const LETTERS = ["a", "b", "c", "d", "e"];

const T = {
  az: {
    text: "Sual mətni", type: "Sual növü", expected: "Gözlənilən cavab", explanation: "İzah",
    save: "Yadda saxla", saving: "Yadda saxlanılır...", cancel: "İmtina",
  },
  en: {
    text: "Question text", type: "Type", expected: "Expected answer", explanation: "Explanation",
    save: "Save", saving: "Saving...", cancel: "Cancel",
  },
};

function initialFromRecord(record) {
  const base = {
    question_text: record?.question_text ?? "",
    question_type: record?.question_type ?? "closed",
    expected_answer: record?.expected_answer ?? "",
    explanation: record?.explanation ?? "",
    order: record?.order ?? 1,
    option_a: "", option_b: "", option_c: "", option_d: "", option_e: "",
    correct_option: "",
  };
  (record?.choices || []).forEach((choice, idx) => {
    if (idx > 4) return;
    base[`option_${LETTERS[idx]}`] = choice.text;
    if (choice.is_correct) base.correct_option = LETTERS[idx].toUpperCase();
  });
  return base;
}

export default function MissionExamQuestionForm({ id, record, parentFilter, onSaved, onCancel }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [values, setValues] = useState(() => initialFromRecord(record));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const isClosed = values.question_type === "closed";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...values, ...parentFilter };
      if (id) await missionExamQuestions.update(id, payload);
      else await missionExamQuestions.create(payload);
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
        <Textarea rows={3} value={values.question_text} onChange={(e) => set("question_text", e.target.value)} required />
      </Field>
      <Field label={t.type}>
        <Segmented value={values.question_type} onChange={(v) => set("question_type", v)} options={QUESTION_TYPES.map((v) => ({ value: v, label: v }))} />
      </Field>

      {isClosed ? (
        <OptionLetteringFields values={values} onChange={set} />
      ) : (
        <Field label={t.expected}>
          <Textarea rows={3} value={values.expected_answer} onChange={(e) => set("expected_answer", e.target.value)} />
        </Field>
      )}

      <Field label={t.explanation}>
        <Textarea rows={2} value={values.explanation} onChange={(e) => set("explanation", e.target.value)} />
      </Field>

      {error && <div className="field-error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t.cancel}</Button>}
        <Button type="submit" variant="accent" disabled={submitting}>{submitting ? t.saving : t.save}</Button>
      </div>
    </form>
  );
}
