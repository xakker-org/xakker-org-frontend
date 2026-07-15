import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommand } from "../../contexts/CommandContext";
import { useLang } from "../../contexts/LanguageContext";
import { endpoints } from "../../services/endpoints";
import Kbd from "./Kbd";
import "./CommandPalette.css";

const T = {
  az: {
    nav: "Naviqasiya", missions: "Missions", courses: "Courses", labs: "Labs",
    dashboard: "Ana səhifə", missionsHint: "Praktiki tapşırıq", roomsHint: "Lab otaqları",
    plansHint: "Planlar", coursesHint: "Kurslar",
    leaderboardHint: "Liderlik", profileHint: "Profilim",
    searchPlaceholder: "Mission, kurs, route axtar...", searchLabel: "Axtar",
    empty: "Heç nə tapılmadı", move: "hərəkət", openLbl: "aç", close: "bağla",
    dialogLabel: "Əmr paleti",
  },
  en: {
    nav: "Navigation", missions: "Missions", courses: "Courses", labs: "Labs",
    dashboard: "Home page", missionsHint: "Practical tasks", roomsHint: "Lab rooms",
    plansHint: "Plans", coursesHint: "Courses",
    leaderboardHint: "Leaderboard", profileHint: "My profile",
    searchPlaceholder: "Search missions, courses, routes...", searchLabel: "Search",
    empty: "Nothing found", move: "move", openLbl: "open", close: "close",
    dialogLabel: "Command palette",
  },
};

function buildRoutes(t) {
  return [
    { id: "r-dashboard",   group: t.nav, title: "Dashboard",     hint: t.dashboard,     path: "/dashboard",   icon: "⌂" },
    { id: "r-missions",    group: t.nav, title: t.missions,      hint: t.missionsHint,  path: "/missions",    icon: "◎" },
    { id: "r-rooms",       group: t.nav, title: "Labs / Rooms",  hint: t.roomsHint,     path: "/rooms",       icon: "▣" },
    { id: "r-plans",       group: t.nav, title: "Learning Paths",hint: t.plansHint,     path: "/plans",       icon: "↗" },
    { id: "r-courses",     group: t.nav, title: t.courses,       hint: t.coursesHint,   path: "/courses",     icon: "▤" },
    { id: "r-leaderboard", group: t.nav, title: "Leaderboard",   hint: t.leaderboardHint, path: "/leaderboard", icon: "★" },
    { id: "r-profile",     group: t.nav, title: "Profile",       hint: t.profileHint,   path: "/profile",     icon: "◉" },
  ];
}

function fuzzy(needle, hay) {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  const h = (hay || "").toLowerCase();
  if (!h) return -1;
  if (h.includes(n)) return 100 - h.indexOf(n);
  // simple subsequence
  let ni = 0;
  for (let i = 0; i < h.length && ni < n.length; i++) if (h[i] === n[ni]) ni++;
  return ni === n.length ? 1 : -1;
}

export default function CommandPalette() {
  const { open, setOpen } = useCommand();
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const ROUTES = useMemo(() => buildRoutes(t), [t]);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // Lazy fetch dynamic items first time palette opens
  useEffect(() => {
    if (!open) return;
    setActive(0);
    setQ("");
    requestAnimationFrame(() => inputRef.current?.focus());

    if (items.length > ROUTES.length) return; // already fetched
    let mounted = true;
    Promise.allSettled([
      endpoints.missionsList({}).catch(() => ({ data: [] })),
      endpoints.courses().catch(() => ({ data: [] })),
      endpoints.rooms({}).catch(() => ({ data: [] })),
    ]).then((res) => {
      if (!mounted) return;
      const missionData = res[0]?.value?.data;
      const missionItems = Array.isArray(missionData) ? missionData : (missionData?.results || []);
      const ms = missionItems.map(m => ({
        id: `m-${m.id}`, group: t.missions, title: m.title, hint: m.short_description?.slice(0, 60), path: `/missions/${m.slug}`, icon: "◎",
      }));
      const cs = (res[1]?.value?.data || []).map(c => ({
        id: `c-${c.id}`, group: t.courses, title: c.title, hint: c.description?.slice(0, 60), path: `/courses/${c.slug}`, icon: c.icon || "▤",
      }));
      const rs = (res[2]?.value?.data || []).map(r => ({
        id: `room-${r.id}`, group: t.labs, title: r.title, hint: r.summary?.slice(0, 60), path: `/rooms/${r.slug}`, icon: r.icon || "▣",
      }));
      setItems([...ROUTES, ...ms, ...cs, ...rs]);
    });
    return () => { mounted = false; };
  }, [open, items.length]);

  // Initialize with routes immediately
  useEffect(() => {
    if (items.length === 0) setItems(ROUTES);
  }, [items.length]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    return items
      .map(it => ({ it, score: Math.max(fuzzy(q, it.title), fuzzy(q, it.hint), fuzzy(q, it.group)) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(x => x.it);
  }, [q, items]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(it => {
      (groups[it.group] = groups[it.group] || []).push(it);
    });
    return Object.entries(groups);
  }, [filtered]);

  // Flat list with original indices for active highlight
  const flat = filtered;

  useEffect(() => {
    if (active >= flat.length) setActive(0);
  }, [flat.length, active]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[active];
      if (it) { setOpen(false); navigate(it.path); }
    }
  };

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={t.dialogLabel}>
      <div className="cmd" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="cmd-input-ico" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder={t.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={t.searchLabel}
          />
          <span className="cmd-input-hint"><Kbd>Esc</Kbd></span>
        </div>
        <div className="cmd-list" role="listbox">
          {flat.length === 0 ? (
            <div className="cmd-empty">{t.empty}</div>
          ) : (
            grouped.map(([group, list]) => (
              <div className="cmd-group" key={group}>
                <div className="cmd-group-label">{group}</div>
                {list.map((it) => {
                  const idx = flat.indexOf(it);
                  const isActive = idx === active;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={`cmd-item${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => { setOpen(false); navigate(it.path); }}
                      role="option"
                      aria-selected={isActive}
                    >
                      <span className="cmd-item-ico">{it.icon}</span>
                      <span className="cmd-item-main">
                        <span className="cmd-item-title">{it.title}</span>
                        {it.hint && <span className="cmd-item-hint">{it.hint}</span>}
                      </span>
                      {isActive && <Kbd>↵</Kbd>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="cmd-foot">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> {t.move}</span>
          <span><Kbd>↵</Kbd> {t.openLbl}</span>
          <span><Kbd>Esc</Kbd> {t.close}</span>
        </div>
      </div>
    </div>
  );
}
