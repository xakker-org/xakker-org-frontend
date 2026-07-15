import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import { Chip, DiffBadge } from "../components/ui/Chip";
import { Input } from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import { getMockCtfMissions } from "../data/mockData";

const T = {
  az: {
    eyebrow: "Platforma", title: "Missiyalar",
    sub: "Real ssenarilər üzərində flag tap, bacarıqlarını sına.",
    searchPlaceholder: "Missiya axtar...",
    all: "Hamısı", solvedOnly: "Yalnız həll olunanlar", notSolvedOnly: "Yalnız həll olunmayanlar",
    difficulty: "Çətinlik", category: "Kateqoriya", tag: "Teq",
    notFound: "Missiya tapılmadı", changeFilter: "Filtrləri dəyiş və ya axtarışı təmizlə.",
    solved: "Həll olundu", attempted: "Cəhd edilib", notStarted: "Başlanmayıb",
    points: "xal", min: "dəq", solvedBy: "həll etdi",
    writeupYes: "Həll yolu var",
    levels: { easy: "Asan", medium: "Orta", hard: "Çətin", expert: "Ekspert" },
    open: "Aç",
  },
  en: {
    eyebrow: "Platform", title: "Missions",
    sub: "Find the flag in real-world scenarios and prove your skills.",
    searchPlaceholder: "Search missions...",
    all: "All", solvedOnly: "Solved only", notSolvedOnly: "Unsolved only",
    difficulty: "Difficulty", category: "Category", tag: "Tag",
    notFound: "No missions found", changeFilter: "Change your filters or clear the search.",
    solved: "Solved", attempted: "Attempted", notStarted: "Not started",
    points: "pts", min: "min", solvedBy: "solved",
    writeupYes: "Write-up available",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    open: "Open",
  },
};

const DIFF_KEYS = ["", "easy", "medium", "hard", "expert"];

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function MissionsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [missions, setMissions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory]   = useState("");
  const [tag, setTag]             = useState("");
  const [solved, setSolved]       = useState(""); // "" | "true" | "false"

  const debouncedSearch = useDebounced(search);
  const firstLoad = useRef(true);

  useEffect(() => {
    let ok = true;
    if (firstLoad.current) setLoading(true);
    endpoints.missionsList({
      difficulty: difficulty || undefined,
      category: category || undefined,
      tag: tag || undefined,
      solved: solved || undefined,
      search: debouncedSearch || undefined,
    })
      .then(({ data }) => {
        if (!ok) return;
        const items = Array.isArray(data) ? data : (data?.results || []);
        setMissions(items.length > 0 || firstLoad.current === false ? items : getMockCtfMissions().results);
      })
      .catch(() => { if (ok) setMissions(getMockCtfMissions().results); })
      .finally(() => { if (ok) { setLoading(false); firstLoad.current = false; } });
    return () => { ok = false; };
  }, [difficulty, category, tag, solved, debouncedSearch]);

  // Category/tag facets derived from whatever missions are currently loaded
  const categories = useMemo(() => {
    const map = new Map();
    missions.forEach(m => { if (m.category?.slug) map.set(m.category.slug, m.category.name); });
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [missions]);

  const tags = useMemo(() => {
    const map = new Map();
    missions.forEach(m => (m.tags || []).forEach(tg => map.set(tg.slug, tg.name)));
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [missions]);

  return (
    <div className="xk-screen">
      <div className="xk-screen-head xk-reveal">
        <div>
          <div className="xk-greet-eyebrow">{t.eyebrow}</div>
          <h1 className="xk-screen-title">{t.title}</h1>
          <p className="xk-greet-sub">{t.sub}</p>
        </div>
      </div>

      {/* Toolbar: search + solved toggle */}
      <div className="xk-mission-toolbar xk-reveal" style={{ animationDelay: "40ms" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <span style={{ position: "relative", display: "block" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
              <Icon name="search" size={15} />
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              style={{ paddingLeft: 34 }}
            />
          </span>
        </div>
        <div className="xk-filters" style={{ marginBottom: 0 }}>
          <button type="button" className={`xk-filter${solved === "" ? " on" : ""}`} onClick={() => setSolved("")}>{t.all}</button>
          <button type="button" className={`xk-filter${solved === "true" ? " on" : ""}`} onClick={() => setSolved(solved === "true" ? "" : "true")}>{t.solvedOnly}</button>
          <button type="button" className={`xk-filter${solved === "false" ? " on" : ""}`} onClick={() => setSolved(solved === "false" ? "" : "false")}>{t.notSolvedOnly}</button>
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="xk-filters xk-reveal" style={{ animationDelay: "70ms" }}>
        {DIFF_KEYS.map((d) => (
          <button
            key={d || "all"}
            type="button"
            className={`xk-filter${difficulty === d ? " on" : ""}`}
            onClick={() => setDifficulty(d)}
          >
            {d ? t.levels[d] : t.all}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="xk-tag-cloud xk-reveal" style={{ marginBottom: 12 }}>
          <Chip tone={category === "" ? "accent" : "neutral"} size="sm" onClick={() => setCategory("")} className="xk-clickable" style={{ cursor: "pointer" }}>
            {t.category}: {t.all}
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.slug}
              tone={category === c.slug ? "accent" : "neutral"}
              size="sm"
              onClick={() => setCategory(category === c.slug ? "" : c.slug)}
              style={{ cursor: "pointer" }}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="xk-tag-cloud xk-reveal" style={{ marginBottom: "var(--gap)" }}>
          {tags.map((tg) => (
            <Chip
              key={tg.slug}
              tone={tag === tg.slug ? "accent" : "neutral"}
              size="sm"
              onClick={() => setTag(tag === tg.slug ? "" : tg.slug)}
              style={{ cursor: "pointer" }}
            >
              #{tg.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="xk-mission-grid">
          {Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} height={230} />)}
        </div>
      ) : missions.length === 0 ? (
        <div className="xk-empty-screen">
          <div className="xk-empty-ico"><Icon name="target" size={24} /></div>
          <h3>{t.notFound}</h3>
          <p>{t.changeFilter}</p>
        </div>
      ) : (
        <div className="xk-mission-grid">
          {missions.map((m, i) => {
            const isSolved = m.user_status === "solved";
            const isAttempted = m.user_status === "attempted";
            const statusLabel = isSolved ? t.solved : isAttempted ? t.attempted : t.notStarted;

            return (
              <Link
                key={m.id}
                to={`/missions/${m.slug}`}
                className="xk-card xk-int xk-mission xk-reveal"
                style={{ animationDelay: `${100 + i * 60}ms`, textDecoration: "none", color: "inherit" }}
              >
                <div className="xk-mission-bar" />

                <div className="xk-mission-card-cats">
                  <span className="xk-feat-track">{m.category?.name || "—"}</span>
                  <DiffBadge level={m.difficulty} labelOverride={t.levels[m.difficulty] || m.difficulty} />
                </div>

                <h3 className="xk-mission-title">{m.title}</h3>
                {m.short_description && (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                    {m.short_description}
                  </p>
                )}

                {m.tags?.length > 0 && (
                  <div className="xk-mission-tags">
                    {m.tags.map((tg) => (
                      <Chip key={tg.slug} tone="neutral" size="sm">#{tg.name}</Chip>
                    ))}
                  </div>
                )}

                <div className="xk-mission-meta">
                  <span><Icon name="xp" size={13} /> {m.points} {t.points}</span>
                  {m.estimated_time > 0 && <span><Icon name="clock" size={13} /> ~{m.estimated_time} {t.min}</span>}
                  <span><Icon name="users" size={13} /> {m.solved_count} {t.solvedBy}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 4 }}>
                  {isSolved ? (
                    <span className="xk-mission-solved-tick"><Icon name="check" size={13} /> {statusLabel}</span>
                  ) : (
                    <span className={`xk-badge ${isAttempted ? "tone-accent" : "tone-muted"}`}>{statusLabel}</span>
                  )}
                  <span className="xk-link">{t.open} <Icon name="arrowRight" size={13} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
