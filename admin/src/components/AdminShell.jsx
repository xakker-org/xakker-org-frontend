import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import Avatar from "./ui/Avatar";
import { Chip } from "./ui/Chip";
import Icon from "./ui/Icon";

// Same spring as app/src/components/AppShell.jsx's sb-active-pill.
const PILL_TRANSITION = { type: "spring", stiffness: 500, damping: 40 };

const NAV_SECTIONS = [
  { type: "link", to: "/dashboard", icon: "dashboard", label: { az: "İdarə paneli", en: "Dashboard" } },
  { type: "link", to: "/analytics", icon: "leaderboard", label: { az: "Analitika", en: "Analytics" } },
  {
    type: "group",
    icon: "layers",
    label: { az: "Məzmun", en: "Content" },
    children: [
      { to: "/content/courses", icon: "courses", label: { az: "Kurslar", en: "Courses" } },
      { to: "/content/rooms", icon: "labs", label: { az: "Otaqlar", en: "Rooms" } },
      { to: "/content/lessons", icon: "book", label: { az: "Dərslər", en: "Lessons" } },
      { to: "/content/plans", icon: "paths", label: { az: "Planlar", en: "Plans" } },
      { to: "/content/categories", icon: "beaker", label: { az: "Kateqoriyalar", en: "Categories" } },
      { to: "/content/room-tags", icon: "terminal", label: { az: "Teqlər", en: "Tags" } },
    ],
  },
  {
    type: "group",
    icon: "flag",
    label: { az: "CTF Missiyaları", en: "CTF Missions" },
    children: [
      { to: "/content/ctf-missions", icon: "flag", label: { az: "Missiyalar (CTF)", en: "Missions (CTF)" } },
      { to: "/content/ctf-mission-categories", icon: "beaker", label: { az: "Kateqoriyalar", en: "Categories" } },
      { to: "/content/ctf-mission-tags", icon: "tag", label: { az: "Teqlər", en: "Tags" } },
    ],
  },
  {
    type: "group",
    icon: "sparkles",
    label: { az: "Xakker AI", en: "Xakker AI" },
    children: [
      { to: "/content/assistant-prompt-notes", icon: "study", label: { az: "Prompt qeydləri", en: "Prompt notes" } },
      { to: "/settings/assistant-prompt", icon: "terminal", label: { az: "Sistem promptu", en: "System prompt" } },
    ],
  },
  { type: "link", to: "/users", icon: "profile", label: { az: "İstifadəçilər", en: "Users" } },
  { type: "link", to: "/admins", icon: "lock", label: { az: "Adminlər", en: "Admins" } },
  { type: "link", to: "/progress", icon: "check", label: { az: "İrəliləyiş", en: "Progress" } },
];

const COLLAPSED_KEY = "xk_admin_sb_collapsed";
const GROUP_OPEN_KEY = "xk_admin_sb_group_open"; // JSON map of { [groupLabel]: boolean }

const GROUP_LABELS = NAV_SECTIONS.filter((s) => s.type === "group").map((s) => s.label.az);

function loadGroupOpenState() {
  try {
    const raw = localStorage.getItem(GROUP_OPEN_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const state = {};
    for (const key of GROUP_LABELS) state[key] = parsed[key] !== false;
    return state;
  } catch {
    const state = {};
    for (const key of GROUP_LABELS) state[key] = true;
    return state;
  }
}

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
  });
  const [groupOpen, setGroupOpen] = useState(loadGroupOpenState);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const toggleGroup = (groupLabel) => {
    setGroupOpen((o) => {
      const next = { ...o, [groupLabel]: !o[groupLabel] };
      try { localStorage.setItem(GROUP_OPEN_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = user?.is_superuser ? "SUPERUSER" : "STAFF";

  return (
    <div className={`shell${collapsed ? " sb-collapsed" : ""}`}>
      {drawer && <div className="sb-overlay" onClick={() => setDrawer(false)} aria-hidden="true" />}

      <aside className={`sb${drawer ? " is-open" : ""}`}>
        <div className="sb-brand-row">
          <Link to="/dashboard" className="sb-brand" onClick={() => setDrawer(false)}>
            <img src="/static/logo/logoXakker.png" alt="Xakker" className="sb-brand-img" />
            {!collapsed && <span className="sb-brand-tag">ADMIN</span>}
          </Link>
          <button
            type="button"
            className="sb-toggle"
            onClick={toggleCollapsed}
            title={collapsed ? (lang === "az" ? "Genişləndir" : "Expand") : (lang === "az" ? "Daralt" : "Collapse")}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">
            {NAV_SECTIONS.map((item) => {
              if (item.type === "link") {
                return (
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
                            transition={PILL_TRANSITION}
                          />
                        )}
                        <span className="sb-link-ico"><Icon name={item.icon} size={20} /></span>
                        <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                      </>
                    )}
                  </NavLink>
                );
              }
              const isOpen = groupOpen[item.label.az] !== false;
              return (
                <div className="sb-group" key={item.label.az}>
                  <button type="button" className="sb-group-toggle" onClick={() => toggleGroup(item.label.az)}>
                    <span className="sb-link-ico"><Icon name={item.icon} size={20} /></span>
                    <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                    <span className={`sb-group-chevron${isOpen ? " is-open" : ""}`}>
                      <Icon name="chevronDown" size={14} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="sb-group-children">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) => `sb-sublink${isActive ? " is-active" : ""}`}
                          onClick={() => setDrawer(false)}
                          title={collapsed ? (child.label[lang] || child.label.az) : undefined}
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <motion.span
                                  layoutId="sb-active-pill"
                                  className="sb-link-indicator"
                                  transition={PILL_TRANSITION}
                                />
                              )}
                              <span className="sb-link-ico"><Icon name={child.icon} size={16} /></span>
                              <span className="sb-link-label">{child.label[lang] || child.label.az}</span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="sb-spacer" />

        <div className="sb-user" title={collapsed ? `${user?.username || "Admin"} — ${roleLabel}` : undefined}>
          <Avatar user={user || { username: "A" }} size={36} rounded="md" />
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.username || "Admin"}</div>
            <div className="sb-user-meta">{roleLabel}</div>
          </div>
          <button className="sb-user-logout" onClick={handleLogout} title={lang === "az" ? "Çıxış" : "Logout"} type="button">
            <Icon name="logout" size={14} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="tb">
          <button className="tb-burger" type="button" aria-label="Menyu" onClick={() => setDrawer((d) => !d)}>
            ☰
          </button>

          <div className="tb-admin-id">
            <Chip tone="accent">Admin Panel</Chip>
          </div>

          <div className="tb-right">
            <Chip tone={user?.is_superuser ? "accent" : "neutral"}>{roleLabel}</Chip>
            <div className="tb-lang">
              <button type="button" className={`tb-lang-btn${lang === "az" ? " active" : ""}`} onClick={() => setLang("az")}>AZ</button>
              <button type="button" className={`tb-lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
