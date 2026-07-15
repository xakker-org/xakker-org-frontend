import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";
import { useCommand } from "../contexts/CommandContext";
import { useLang } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import Avatar from "./ui/Avatar";
import { Chip } from "./ui/Chip";
import Kbd from "./ui/Kbd";
import CommandPalette from "./ui/CommandPalette";
import Icon from "./ui/Icon";
import AnimatedBackground from "./AnimatedBackground";
import AiFab from "./AiFab";
import { localizeRank } from "../utils/rankLabels";

const NAV_MAIN = [
  { to: "/dashboard",   label: { az: "Dashboard",       en: "Dashboard"      }, icon: "dashboard" },
  { to: "/missions",    label: { az: "Missions",        en: "Missions"       }, icon: "missions",  badge: { az: "Yeni", en: "New" } },
  { to: "/rooms",       label: { az: "Labs",            en: "Labs"           }, icon: "labs" },
  { to: "/plans",       label: { az: "Öyrənmə Yolları", en: "Learning Paths" }, icon: "paths" },
  { to: "/courses",     label: { az: "Kurslar",         en: "Courses"        }, icon: "courses" },
  { to: "/xakker-ai",  label: { az: "Xakker AI",      en: "Xakker AI"   }, icon: "sparkles" },
];

const NAV_COMM = [
  { to: "/leaderboard", label: { az: "Liderlik",  en: "Leaderboard" }, icon: "leaderboard" },
  { to: "/profile",     label: { az: "Profil",    en: "Profile"     }, icon: "profile" },
];

const COLLAPSED_KEY = "xk_sb_collapsed";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpen } = useCommand();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [drawer, setDrawer]   = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    endpoints.myProfile()
      .then(({ data }) => mounted && setProfile(data))
      .catch(() => { clearTokens(); navigate("/auth/login"); });
    return () => { mounted = false; };
  }, [navigate]);

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const handleLogout = () => { clearTokens(); navigate("/auth/login"); };

  const xp       = profile?.xp ?? 0;
  const streak   = profile?.streak_days ?? 0;
  const rank     = profile?.rank || "recruit";
  const rankDisp = localizeRank(rank, lang);
  const isMac    = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <div className={`shell${collapsed ? " sb-collapsed" : ""}`}>
      <AnimatedBackground />
      {drawer && (
        <div className="sb-overlay" onClick={() => setDrawer(false)} aria-hidden="true" />
      )}

      <aside className={`sb${drawer ? " is-open" : ""}`}>
        {/* Brand + collapse toggle */}
        <div className="sb-brand-row">
          <Link to="/dashboard" className="sb-brand" onClick={() => setDrawer(false)}>
            <img
              src={theme === "dark" ? "/static/logo/xakkerLogoWhite.png" : "/static/logo/xakkerLogo3.png"}
              alt="Xakker"
              className={`sb-brand-img${theme === "dark" ? " sb-brand-img--dark" : " sb-brand-img--light"}`}
              onError={(e) => {
                e.currentTarget.src = "/static/logo/logoXakker.png";
                e.currentTarget.onerror = null;
              }}
            />
          </Link>
          <button
            type="button"
            className="sb-toggle"
            onClick={toggleCollapsed}
            title={collapsed ? (lang === "az" ? "Genişləndir" : "Expand") : (lang === "az" ? "Daralt" : "Collapse")}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav sections */}
        <nav className="sb-nav">
          <div className="sb-section">
            <div className="sb-label">Platform</div>
            {NAV_MAIN.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sb-link${isActive ? " is-active" : ""}`}
                onClick={() => setDrawer(false)}
                title={collapsed ? (item.label[lang] || item.label.az) : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sb-active-pill"
                        className="sb-link-indicator"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="sb-link-ico"><Icon name={item.icon} size={22} /></span>
                    <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                    {item.badge && <span className="sb-link-badge">{item.badge[lang] || item.badge.az}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="sb-section">
            <div className="sb-label">Community</div>
            {NAV_COMM.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sb-link${isActive ? " is-active" : ""}`}
                onClick={() => setDrawer(false)}
                title={collapsed ? (item.label[lang] || item.label.az) : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sb-active-pill"
                        className="sb-link-indicator"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="sb-link-ico"><Icon name={item.icon} size={22} /></span>
                    <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sb-spacer" />

        {/* User */}
        <div className="sb-user" title={collapsed ? `${profile?.full_name || profile?.username || "Hacker"} — ${rankDisp}` : undefined}>
          <Avatar user={profile || { username: "X" }} size={36} rounded="md" />
          <div className="sb-user-info">
            <div className="sb-user-name">{profile?.full_name || profile?.username || "Hacker"}</div>
            <div className="sb-user-meta">{rankDisp} · {xp.toLocaleString()} XP</div>
          </div>
          <button
            className="sb-user-logout"
            onClick={handleLogout}
            title={lang === "az" ? "Çıxış" : "Logout"}
            type="button"
          >
            <Icon name="logout" size={14} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="tb">
          <button
            className="tb-burger"
            type="button"
            aria-label={lang === "az" ? "Menyu" : "Menu"}
            onClick={() => setDrawer(d => !d)}
          >
            <Icon name="menu" size={18} />
          </button>

          <button
            className="tb-cmd"
            type="button"
            onClick={() => setOpen(true)}
            aria-label={lang === "az" ? "Axtar" : "Search"}
          >
            <Icon name="search" size={14} />
            <span className="tb-cmd-label">
              {lang === "az" ? "Mission, kurs, route axtar..." : "Search missions, courses..."}
            </span>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </button>

          <div className="tb-right">
            {streak > 0 && (
              <Chip tone="amber" icon={<Icon name="flame" size={11} />}>{streak}d</Chip>
            )}
            <Chip tone="accent" icon={<Icon name="star" size={11} />}>
              <strong className="tnum">{xp.toLocaleString()}</strong>
            </Chip>
            <button
              type="button"
              className="tb-theme-btn"
              onClick={toggleTheme}
              aria-label={lang === "az" ? "Tema" : "Theme"}
              title={theme === "dark" ? (lang === "az" ? "İşıqlı tema" : "Light mode") : (lang === "az" ? "Qaranlıq tema" : "Dark mode")}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
            </button>
            <div className="tb-lang">
              <button
                type="button"
                className={`tb-lang-btn${lang === "az" ? " active" : ""}`}
                onClick={() => setLang("az")}
              >
                AZ
              </button>
              <button
                type="button"
                className={`tb-lang-btn${lang === "en" ? " active" : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        <main className={`content${location.pathname.startsWith("/xakker-ai") ? " content-full" : ""}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
      <AiFab />
    </div>
  );
}
