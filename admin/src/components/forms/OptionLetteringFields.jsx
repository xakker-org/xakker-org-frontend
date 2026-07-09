import Field, { Input } from "../ui/Field";
import Segmented from "../ui/Segmented";
import { useLang } from "../../contexts/LanguageContext";

const LETTERS = ["A", "B", "C", "D", "E"];

const T = {
  az: { option: "Variant", correct: "Düzgün variant" },
  en: { option: "Option", correct: "Correct option" },
};

/**
 * Mirrors the option_a..option_e + correct_option convenience fields from
 * the Django admin's QuestionAdminForm / MissionExamQuestionAdminForm, so
 * authoring behaves identically to /admin/.
 */
export default function OptionLetteringFields({ values, onChange }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const filledLetters = LETTERS.filter((l) => (values[`option_${l.toLowerCase()}`] || "").trim());

  return (
    <div className="form-grid">
      {LETTERS.map((letter) => (
        <Field key={letter} label={`${t.option} ${letter}`}>
          <Input
            value={values[`option_${letter.toLowerCase()}`] || ""}
            onChange={(e) => onChange(`option_${letter.toLowerCase()}`, e.target.value)}
          />
        </Field>
      ))}
      <Field label={t.correct}>
        <Segmented
          value={values.correct_option || ""}
          onChange={(v) => onChange("correct_option", v)}
          options={filledLetters.map((l) => ({ value: l, label: l }))}
        />
      </Field>
    </div>
  );
}
