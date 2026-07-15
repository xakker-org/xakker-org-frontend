import { useEffect, useState } from "react";
import { useLang } from "../contexts/LanguageContext";
import { analytics } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Tabs from "../components/ui/Tabs";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import ProgressRing from "../components/ui/ProgressRing";
import Heatmap from "../components/ui/Heatmap";
import ActivityBars from "../components/ui/ActivityBars";
import DataTable from "../components/ui/DataTable";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

const T = {
  az: {
    title: "Analitika", sub: "Platformanın ümumi göstəriciləri",
    tabs: { overview: "Ümumi", content: "Məzmun", activity: "Fəaliyyət" },
    totalUsers: "Ümumi istifadəçi", new7: "Yeni (7 gün)", new30: "Yeni (30 gün)", active7: "Aktiv (7 gün)",
    totalXp: "Verilmiş XP", courses: "Kurslar", rooms: "Otaqlar", missions: "Missiyalar", lessons: "Dərslər",
    topQuestions: "Ən çox cəhd olunan suallar", roomsCompleted: "Ən çox tamamlanan otaqlar", examStats: "İmtahan statistikası",
    passRate: "Keçid faizi", avgScore: "Orta bal", passed: "Keçdi", failed: "Keçmədi",
    signups: "Qeydiyyatlar", activityFeed: "Fəaliyyət",
  },
  en: {
    title: "Analytics", sub: "Platform-wide metrics",
    tabs: { overview: "Overview", content: "Content", activity: "Activity" },
    totalUsers: "Total users", new7: "New (7d)", new30: "New (30d)", active7: "Active (7d)",
    totalXp: "XP awarded", courses: "Courses", rooms: "Rooms", missions: "Missions", lessons: "Lessons",
    topQuestions: "Most attempted questions", roomsCompleted: "Most completed rooms", examStats: "Exam stats",
    passRate: "Pass rate", avgScore: "Avg score", passed: "Passed", failed: "Failed",
    signups: "Signups", activityFeed: "Activity",
  },
};

export default function AnalyticsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [tab, setTab] = useState("overview");
  // undefined = loading, null = failed, object = loaded
  const [overview, setOverview] = useState(undefined);
  const [content, setContent] = useState(undefined);
  const [activity, setActivity] = useState(undefined);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    setOverview(undefined);
    setContent(undefined);
    setActivity(undefined);
    analytics.overview().then(({ data }) => !cancelled && setOverview(data)).catch(() => !cancelled && setOverview(null));
    analytics.content().then(({ data }) => !cancelled && setContent(data)).catch(() => !cancelled && setContent(null));
    analytics.activity(30).then(({ data }) => !cancelled && setActivity(data)).catch(() => !cancelled && setActivity(null));
    return () => { cancelled = true; };
  }, [reloadKey]);

  const errorLabel = lang === "az" ? "Yüklənmədi" : "Failed to load";
  const retryLabel = lang === "az" ? "Yenidən cəhd et" : "Retry";

  const heatmapDays = (activity?.activity || []).map((d) => ({ date: d.d, value: d.count }));
  const activityBarDays = (activity?.activity || []).map((d) => ({ date: d.d, value: d.count }));

  const examPassed = content?.exam_stats?.passed_count ?? 0;
  const examFailed = content?.exam_stats?.failed_count ?? 0;
  const examTotal = examPassed + examFailed;
  const passPct = examTotal ? Math.round((examPassed / examTotal) * 100) : 0;

  return (
    <div>
      <PageHeader title={t.title} sub={t.sub} />

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "overview", label: t.tabs.overview },
          { value: "content", label: t.tabs.content },
          { value: "activity", label: t.tabs.activity },
        ]}
      />

      <div style={{ height: 20 }} />

      {tab === "overview" && (
        overview === undefined ? <TileSkeleton height={240} /> :
        overview === null ? <EmptyState icon="!" title={errorLabel} action={<Button variant="ghost" onClick={retry}>{retryLabel}</Button>} /> : (
          <div className="bento">
            <Tile span={3}><Stat label={t.totalUsers} value={overview.users.total} /></Tile>
            <Tile span={3}><Stat label={t.new7} value={overview.users.new_7d} /></Tile>
            <Tile span={3}><Stat label={t.new30} value={overview.users.new_30d} /></Tile>
            <Tile span={3}><Stat label={t.active7} value={overview.users.active_7d} /></Tile>

            <Tile span={4}><Stat label={t.totalXp} value={overview.xp.total_awarded.toLocaleString()} unit=" XP" /></Tile>
            <Tile span={2}><Stat label={t.courses} value={overview.content.courses} /></Tile>
            <Tile span={2}><Stat label={t.rooms} value={overview.content.rooms} /></Tile>
            <Tile span={2}><Stat label={t.missions} value={overview.content.missions} /></Tile>
          </div>
        )
      )}

      {tab === "content" && (
        content === undefined ? <TileSkeleton height={240} /> :
        content === null ? <EmptyState icon="!" title={errorLabel} action={<Button variant="ghost" onClick={retry}>{retryLabel}</Button>} /> : (
          <div className="bento">
            <Tile span={7}>
              <TileHead title={t.topQuestions} />
              {content.top_questions.length === 0 ? (
                <EmptyState icon="◌" title="—" />
              ) : (
                <DataTable
                  columns={[
                    { key: "question__title", header: lang === "az" ? "Sual" : "Question" },
                    { key: "attempts", header: lang === "az" ? "Cəhd" : "Attempts", align: "right" },
                  ]}
                  data={content.top_questions}
                  rowKey={(r, i) => i}
                />
              )}
            </Tile>
            <Tile span={5}>
              <TileHead title={t.examStats} />
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ProgressRing value={passPct} label={`${passPct}%`} sub={t.passRate} tone="mint" />
                <div style={{ display: "grid", gap: 8 }}>
                  <div>{t.passed}: <strong>{examPassed}</strong></div>
                  <div>{t.failed}: <strong>{examFailed}</strong></div>
                  {content.exam_stats.avg_score != null && (
                    <div>{t.avgScore}: <strong>{Math.round(content.exam_stats.avg_score)}</strong></div>
                  )}
                </div>
              </div>
            </Tile>
            <Tile span={12}>
              <TileHead title={t.roomsCompleted} />
              {content.rooms_by_completed_tasks.length === 0 ? (
                <EmptyState icon="◌" title="—" />
              ) : (
                <DataTable
                  columns={[
                    { key: "task__room__title", header: lang === "az" ? "Otaq" : "Room" },
                    { key: "completed", header: lang === "az" ? "Tamamlandı" : "Completed", align: "right" },
                  ]}
                  data={content.rooms_by_completed_tasks}
                  rowKey={(r, i) => i}
                />
              )}
            </Tile>
          </div>
        )
      )}

      {tab === "activity" && (
        activity === undefined ? <TileSkeleton height={240} /> :
        activity === null ? <EmptyState icon="!" title={errorLabel} action={<Button variant="ghost" onClick={retry}>{retryLabel}</Button>} /> : (
          <div className="bento">
            <Tile span={12}>
              <TileHead title={t.signups} />
              <Heatmap days={heatmapDays} year={new Date().getFullYear()} />
            </Tile>
            <Tile span={12}>
              <TileHead title={t.activityFeed} />
              <ActivityBars days={activityBarDays} weeks={Math.ceil((activity.days || 30) / 7)} />
            </Tile>
          </div>
        )
      )}
    </div>
  );
}
