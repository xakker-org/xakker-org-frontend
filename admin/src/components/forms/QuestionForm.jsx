import { useState } from "react";
import { courses, questions } from "../../services/adminApi";
import { useLang } from "../../contexts/LanguageContext";
import Field, { Input, Textarea } from "../ui/Field";
import Segmented from "../ui/Segmented";
import Button from "../ui/Button";
import RelationSelect from "./RelationSelect";
import OptionLetteringFields from "./OptionLetteringFields";
import coursesConfig from "../../resources/courses";

const QUESTION_TYPES = ["closed", "open", "terminal"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const LETTERS = ["a", "b", "c", "d", "e"];

const T = {
  az: {
    course: "Kurs", title: "Başlıq", prompt: "Sual mətni", type: "Sual növü", level: "Səviyyə",
    points: "Xal", order: "Sıra", expected: "Gözlənilən cavab", starter: "Başlanğıc kod (könüllü)",
    explanation: "İzah", save: "Yadda saxla", saving: "Yadda saxlanılır...", cancel: "İmtina",
  },
  en: {
    course: "Course", title: "Title", prompt: "Prompt", type: "Type", level: "Level",
    points: "Points", order: "Order", expected: "Expected answer", starter: "Starter code (optional)",
    explanation: "Explanation", save: "Save", saving: "Saving...", cancel: "Cancel",
  },
};

function initialFromRecord(record) {
  const base = {
    course: record?.course ?? null,
    title: record?.title ?? "",
    prompt: record?.prompt ?? "",
    question_type: record?.question_type ?? "closed",
    level: record?.level ?? "beginner",
    points: record?.points ?? 10,
    order: record?.order ?? 1,
    expected_answer: record?.expected_answer ?? "",
    starter_code: record?.starter_code ?? "",
    explanation: record?.explanation ?? "",
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

export default function QuestionForm({ id, record, onSaved, onCancel }) {
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
      if (id) await questions.update(id, values);
      else await questions.create(values);
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "object" ? Object.values(data).flat().join(" ") : String(data || "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 720 }}>
      <Field label={t.course}>
        <RelationSelect
          endpoint={courses}
          labelKey="title"
          value={values.course}
          onChange={(v) => set("course", v)}
          quickCreateFields={coursesConfig.formFields}
          quickCreateTitle={coursesConfig.title}
        />
      </Field>
      <Field label={t.title}>
        <Input value={values.title} onChange={(e) => set("title", e.target.value)} required />
      </Field>
      <Field label={t.prompt}>
        <Textarea rows={3} value={values.prompt} onChange={(e) => set("prompt", e.target.value)} required />
      </Field>

      <Field label={t.type}>
        <Segmented
          value={values.question_type}
          onChange={(v) => set("question_type", v)}
          options={QUESTION_TYPES.map((v) => ({ value: v, label: v }))}
        />
      </Field>
      <Field label={t.level}>
        <Segmented value={values.level} onChange={(v) => set("level", v)} options={LEVELS.map((v) => ({ value: v, label: v }))} />
      </Field>

      <div className="form-row">
        <Field label={t.points}>
          <Input type="number" value={values.points} onChange={(e) => set("points", Number(e.target.value))} />
        </Field>
        <Field label={t.order}>
          <Input type="number" value={values.order} onChange={(e) => set("order", Number(e.target.value))} />
        </Field>
      </div>

      {isClosed ? (
        <OptionLetteringFields values={values} onChange={set} />
      ) : (
        <>
          <Field label={t.expected}>
            <Textarea rows={3} value={values.expected_answer} onChange={(e) => set("expected_answer", e.target.value)} />
          </Field>
          {values.question_type === "terminal" && (
            <Field label={t.starter}>
              <Textarea rows={3} value={values.starter_code} onChange={(e) => set("starter_code", e.target.value)} />
            </Field>
          )}
        </>
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
