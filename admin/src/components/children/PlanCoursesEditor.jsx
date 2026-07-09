import { useState } from "react";
import { courses as coursesEndpoint, plans } from "../../services/adminApi";
import { useLang } from "../../contexts/LanguageContext";
import RelationSelect from "../forms/RelationSelect";
import Tile from "../ui/Tile";
import Button from "../ui/Button";
import coursesConfig from "../../resources/courses";

const T = {
  az: { title: "Kurslar (sıra ilə)", add: "+ Kurs əlavə et", save: "Sıranı yadda saxla", saving: "Yadda saxlanılır...", remove: "Sil" },
  en: { title: "Courses (ordered)", add: "+ Add course", save: "Save order", saving: "Saving...", remove: "Remove" },
};

export default function PlanCoursesEditor({ record }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [items, setItems] = useState(() =>
    (record.plan_courses || []).map((pc) => ({ id: pc.id, course: pc.course, course_title: pc.course_title, order: pc.order }))
  );
  const [picked, setPicked] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const addCourse = () => {
    if (!picked) return;
    setItems((prev) => [...prev, { course: picked, course_title: "", order: prev.length + 1 }]);
    setPicked(null);
  };
  const removeAt = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSubmitting(true);
    try {
      const payload = items.map((it, idx) => ({ id: it.id, course: it.course, order: idx + 1 }));
      await plans.update(record.id, { plan_courses: payload });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tile pad="lg" style={{ marginTop: 20 }}>
      <div className="tile-title" style={{ marginBottom: 12 }}>{t.title}</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {items.map((it, idx) => (
          <div key={it.id ?? `new-${idx}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", width: 20 }}>{idx + 1}</span>
            <span style={{ flex: 1 }}>{it.course_title || `#${it.course}`}</span>
            <button className="res-row-btn is-danger" onClick={() => removeAt(idx)} title={t.remove}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <RelationSelect
          endpoint={coursesEndpoint}
          labelKey="title"
          value={picked}
          onChange={setPicked}
          quickCreateFields={coursesConfig.formFields}
          quickCreateTitle={coursesConfig.title}
        />
        <Button type="button" variant="ghost" onClick={addCourse}>{t.add}</Button>
      </div>
      <div style={{ marginTop: 16 }}>
        <Button variant="accent" onClick={save} disabled={submitting}>{submitting ? t.saving : t.save}</Button>
      </div>
    </Tile>
  );
}
