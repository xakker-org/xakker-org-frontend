import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { analytics } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import { TileSkeleton } from "../components/ui/Skeleton";
import Icon from "../components/ui/Icon";

const QUICK_LINKS = [
  { to: "/content/courses", icon: "courses", label: { az: "Kurslar", en: "Courses" } },
  { to: "/content/rooms", icon: "labs", label: { az: "Otaqlar", en: "Rooms" } },
  { to: "/content/missions", icon: "map", label: { az: "Missiyalar", en: "Missions" } },
  { to: "/content/questions", icon: "study", label: { az: "Suallar", en: "Questions" } },
  { to: "/users", icon: "profile", label: { az: "İstifadəçilər", en: "Users" } },
  { to: "/analytics", icon: "leaderboard", label: { az: "Analitika", en: "Analytics" } },
];

const T = {
  az: { greeting: (name) => `Xoş gəldin, ${name}`, sub: "Xəkər platformasının idarəetmə paneli", quick: "Tez keçidlər" },
  en: { greeting: (name) => `Welcome, ${name}`, sub: "Xakker platform admin panel", quick: "Quick links" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [overview, setOverview] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    analytics.overview().then(({ data }) => !cancelled && setOverview(data)).catch(() => !cancelled && setOverview(null));
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <PageHeader title={t.greeting(user?.username || "")} sub={t.sub} />

      {overview === undefined ? (
        <TileSkeleton height={140} />
      ) : overview === null ? null : (
        <div className="bento">
          <Tile span={3}><Stat label={lang === "az" ? "İstifadəçilər" : "Users"} value={overview.users.total} /></Tile>
          <Tile span={3}><Stat label={lang === "az" ? "Yeni (7g)" : "New (7d)"} value={overview.users.new_7d} /></Tile>
          <Tile span={3}><Stat label="XP" value={overview.xp.total_awarded.toLocaleString()} /></Tile>
          <Tile span={3}><Stat label={lang === "az" ? "Kurslar" : "Courses"} value={overview.content.courses} /></Tile>
        </div>
      )}

      <div style={{ height: 24 }} />

      <Tile pad="lg">
        <TileHead title={t.quick} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
                borderRadius: "var(--r-inner)", border: "1px solid var(--line-2)",
                background: "var(--bg-card-2)", color: "var(--ink-2)", textDecoration: "none",
                fontSize: 13.5, fontWeight: 600,
              }}
            >
              <Icon name={link.icon} size={18} />
              {link.label[lang] || link.label.az}
            </Link>
          ))}
        </div>
      </Tile>
    </div>
  );
}
