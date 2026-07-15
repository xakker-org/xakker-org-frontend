import { useCallback, useEffect, useState } from "react";
import { useLang } from "../contexts/LanguageContext";
import { progress } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Tabs from "../components/ui/Tabs";
import Pagination from "../components/Pagination";
import DataTable from "../components/ui/DataTable";
import { Chip } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

const T = {
  az: { title: "İrəliləyiş", sub: "İstifadəçi irəliləyişi və cəhdlər (read-only)", empty: "Nəticə yoxdur" },
  en: { title: "Progress", sub: "User progress and attempts (read-only)", empty: "No results" },
};

function boolChip(value) {
  return <Chip tone={value ? "mint" : "coral"}>{value ? "✓" : "✗"}</Chip>;
}

const TABS = [
  {
    key: "tasks",
    label: { az: "Task irəliləyişi", en: "Task progress" },
    endpoint: () => progress.tasks,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "task_title", header: { az: "Tapşırıq", en: "Task" } },
      { key: "room_title", header: { az: "Otaq", en: "Room" } },
      { key: "completed", header: { az: "Bitib", en: "Done" }, align: "center", render: (r) => boolChip(r.completed) },
      { key: "earned_points", header: { az: "Xal", en: "Points" }, align: "right" },
    ],
  },
  {
    key: "task-qa",
    label: { az: "Task cəhdləri", en: "Task attempts" },
    endpoint: () => progress.taskQuestionAttempts,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "question_prompt", header: { az: "Sual", en: "Question" } },
      { key: "is_correct", header: { az: "Düzgün", en: "Correct" }, align: "center", render: (r) => boolChip(r.is_correct) },
      { key: "attempted_at", header: { az: "Vaxt", en: "When" } },
    ],
  },
  {
    key: "lessons",
    label: { az: "Dərs irəliləyişi", en: "Lesson progress" },
    endpoint: () => progress.lessons,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "lesson_title", header: { az: "Dərs", en: "Lesson" } },
      { key: "is_completed", header: { az: "Bitib", en: "Done" }, align: "center", render: (r) => boolChip(r.is_completed) },
    ],
  },
  {
    key: "missions",
    label: { az: "Missiya irəliləyişi (köhnə)", en: "Mission progress (legacy)" },
    endpoint: () => progress.missions,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "mission_title", header: { az: "Missiya", en: "Mission" } },
      { key: "is_completed", header: { az: "Bitib", en: "Done" }, align: "center", render: (r) => boolChip(r.is_completed) },
      { key: "exam_passed", header: { az: "İmtahan", en: "Exam" }, align: "center", render: (r) => boolChip(r.exam_passed) },
    ],
  },
  {
    key: "exam-attempts",
    label: { az: "İmtahan cəhdləri (köhnə)", en: "Exam attempts (legacy)" },
    endpoint: () => progress.missionExamAttempts,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "exam_title", header: { az: "İmtahan", en: "Exam" } },
      { key: "score", header: { az: "Bal", en: "Score" }, align: "right" },
      { key: "passed", header: { az: "Keçdi", en: "Passed" }, align: "center", render: (r) => boolChip(r.passed) },
    ],
  },
  {
    key: "ctf-missions",
    label: { az: "CTF irəliləyişi", en: "CTF progress" },
    endpoint: () => progress.ctfMissions,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "mission_title", header: { az: "Missiya", en: "Mission" } },
      { key: "status", header: { az: "Vəziyyət", en: "Status" } },
      { key: "flag_attempts", header: { az: "Cəhdlər", en: "Attempts" }, align: "right" },
      { key: "solved_at", header: { az: "Həll tarixi", en: "Solved at" } },
      { key: "writeup_unlocked_at", header: { az: "Write-up açıldı", en: "Write-up unlocked" } },
    ],
  },
  {
    key: "enrollments",
    label: { az: "Qeydiyyatlar", en: "Enrollments" },
    endpoint: () => progress.enrollments,
    columns: [
      { key: "username", header: { az: "İstifadəçi", en: "User" } },
      { key: "course_title", header: { az: "Kurs", en: "Course" } },
      { key: "created_at", header: { az: "Qeydiyyat tarixi", en: "Enrolled" } },
    ],
  },
];

export default function ProgressPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [tab, setTab] = useState(TABS[0].key);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);

  const active = TABS.find((tb) => tb.key === tab);

  const load = useCallback(() => {
    setLoading(true);
    active.endpoint().list({ page }).then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, [active, page]);

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title={t.title} sub={t.sub} />

      <Tabs value={tab} onChange={setTab} options={TABS.map((tb) => ({ value: tb.key, label: tb.label[lang] || tb.label.az }))} />

      <div style={{ height: "var(--s5)" }} />

      {loading ? (
        <TileSkeleton height={280} />
      ) : data.results.length === 0 ? (
        <EmptyState icon="◌" title={t.empty} />
      ) : (
        <DataTable columns={active.columns} data={data.results} rowKey={(r) => r.id} />
      )}

      <Pagination page={page} pageSize={25} count={data.count} onChange={setPage} />
    </div>
  );
}
