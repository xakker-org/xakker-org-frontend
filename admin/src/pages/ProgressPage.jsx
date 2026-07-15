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
      { key: "username", header: "User" },
      { key: "task_title", header: "Task" },
      { key: "room_title", header: "Room" },
      { key: "completed", header: "Done", align: "center", render: (r) => boolChip(r.completed) },
      { key: "earned_points", header: "Points", align: "right" },
    ],
  },
  {
    key: "task-qa",
    label: { az: "Task cəhdləri", en: "Task attempts" },
    endpoint: () => progress.taskQuestionAttempts,
    columns: [
      { key: "username", header: "User" },
      { key: "question_prompt", header: "Question" },
      { key: "is_correct", header: "Correct", align: "center", render: (r) => boolChip(r.is_correct) },
      { key: "attempted_at", header: "When" },
    ],
  },
  {
    key: "lessons",
    label: { az: "Dərs irəliləyişi", en: "Lesson progress" },
    endpoint: () => progress.lessons,
    columns: [
      { key: "username", header: "User" },
      { key: "lesson_title", header: "Lesson" },
      { key: "is_completed", header: "Done", align: "center", render: (r) => boolChip(r.is_completed) },
    ],
  },
  {
    key: "missions",
    label: { az: "Missiya irəliləyişi", en: "Mission progress" },
    endpoint: () => progress.missions,
    columns: [
      { key: "username", header: "User" },
      { key: "mission_title", header: "Mission" },
      { key: "is_completed", header: "Done", align: "center", render: (r) => boolChip(r.is_completed) },
      { key: "exam_passed", header: "Exam", align: "center", render: (r) => boolChip(r.exam_passed) },
    ],
  },
  {
    key: "exam-attempts",
    label: { az: "İmtahan cəhdləri", en: "Exam attempts" },
    endpoint: () => progress.missionExamAttempts,
    columns: [
      { key: "username", header: "User" },
      { key: "exam_title", header: "Exam" },
      { key: "score", header: "Score", align: "right" },
      { key: "passed", header: "Passed", align: "center", render: (r) => boolChip(r.passed) },
    ],
  },
  {
    key: "enrollments",
    label: { az: "Qeydiyyatlar", en: "Enrollments" },
    endpoint: () => progress.enrollments,
    columns: [
      { key: "username", header: "User" },
      { key: "course_title", header: "Course" },
      { key: "created_at", header: "Enrolled" },
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

      <div style={{ height: 20 }} />

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
