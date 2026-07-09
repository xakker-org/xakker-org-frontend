import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../contexts/LanguageContext";
import missionPassesConfig from "../../resources/missionPasses";
import { missionExams } from "../../services/adminApi";
import InlineResourceList from "../InlineResourceList";
import Tile from "../ui/Tile";
import Button from "../ui/Button";

const T = {
  az: { passes: "Pass-lar", exam: "İmtahan", createExam: "+ İmtahan yarat", editExam: "İmtahana keç →", noExam: "Bu missiya üçün imtahan yoxdur." },
  en: { passes: "Passes", exam: "Exam", createExam: "+ Create exam", editExam: "Go to exam →", noExam: "This mission has no exam yet." },
};

function ExamSection({ record }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const navigate = useNavigate();
  const [exam, setExam] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    missionExams
      .list({ mission: record.id })
      .then(({ data }) => {
        if (cancelled) return;
        const results = data.results ?? data;
        setExam(results[0] || null);
      })
      .catch(() => !cancelled && setExam(null));
    return () => { cancelled = true; };
  }, [record.id]);

  const createExam = async () => {
    const { data } = await missionExams.create({ mission: record.id, title: `${record.title} — Exam` });
    navigate(`/content/mission-exams/${data.id}`);
  };

  return (
    <Tile pad="lg" style={{ marginTop: 20 }}>
      <div className="tile-title" style={{ marginBottom: 12 }}>{t.exam}</div>
      {exam === undefined ? null : exam ? (
        <Button variant="ghost" onClick={() => navigate(`/content/mission-exams/${exam.id}`)}>{t.editExam}</Button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)",
            display: "grid", placeItems: "center", fontSize: 20, opacity: 0.75,
          }}>
            📝
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, marginBottom: 10 }}>{t.noExam}</p>
            <Button variant="accent" size="sm" onClick={createExam}>{t.createExam}</Button>
          </div>
        </div>
      )}
    </Tile>
  );
}

export default function MissionChildren({ record }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  return (
    <>
      <InlineResourceList
        config={missionPassesConfig}
        parentFilter={{ mission: record.id }}
        title={t.passes}
        emptyIcon="📖"
        emptyDescription={
          lang === "az"
            ? "Bu missiya üçün hələ pass yoxdur. Tələbənin addım-addım keçəcəyi ilk bölməni yaradın."
            : "This mission has no passes yet. Create the first step-by-step section for students."
        }
      />
      <ExamSection record={record} />
    </>
  );
}
