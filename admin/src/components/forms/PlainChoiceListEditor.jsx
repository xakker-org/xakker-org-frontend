import { Input } from "../ui/Field";
import { useLang } from "../../contexts/LanguageContext";

const T = {
  az: { add: "+ Variant əlavə et", correct: "Düzgün", remove: "Sil" },
  en: { add: "+ Add option", correct: "Correct", remove: "Remove" },
};

/** Repeatable {text, is_correct, order} row editor for non-lettered choice
 * lists (TaskQuestion.choices, LessonQuestion.choices) — as opposed to the
 * lettered option_a..e convenience used by Question/MissionExamQuestion. */
export default function PlainChoiceListEditor({ choices, onChange }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const update = (idx, patch) => {
    const next = choices.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange(next);
  };
  const remove = (idx) => onChange(choices.filter((_, i) => i !== idx));
  const add = () => onChange([...choices, { text: "", is_correct: false, order: choices.length + 1 }]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {choices.map((c, idx) => (
        <div key={c.id ?? `new-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Input
            style={{ flex: 1 }}
            value={c.text}
            onChange={(e) => update(idx, { text: e.target.value })}
            placeholder={`#${idx + 1}`}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={c.is_correct} onChange={(e) => update(idx, { is_correct: e.target.checked })} />
            {t.correct}
          </label>
          <button type="button" className="res-row-btn is-danger" onClick={() => remove(idx)} title={t.remove}>×</button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add} style={{ justifySelf: "start" }}>
        {t.add}
      </button>
    </div>
  );
}
