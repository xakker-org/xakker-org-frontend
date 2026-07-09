import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import Avatar from "./ui/Avatar";
import { Chip } from "./ui/Chip";
import Icon from "./ui/Icon";

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
      { to: "/content/missions", icon: "map", label: { az: "Missiyalar", en: "Missions" } },
      { to: "/content/questions", icon: "study", label: { az: "Suallar", en: "Questions" } },
      { to: "/content/lessons", icon: "book", label: { az: "Dərslər", en: "Lessons" } },
      { to: "/content/plans", icon: "paths", label: { az: "Planlar", en: "Plans" } },
      { to: "/content/categories", icon: "beaker", label: { az: "Kateqoriyalar", en: "Categories" } },
      { to: "/content/room-tags", icon: "terminal", label: { az: "Teqlər", en: "Tags" } },
    ],
  },
  { type: "link", to: "/users", icon: "profile", label: { az: "İstifadəçilər", en: "Users" } },
  { type: "link", to: "/progress", icon: "check", label: { az: "İrəliləyiş", en: "Progress" } },
];

const COLLAPSED_KEY = "xk_admin_sb_collapsed";
const GROUP_OPEN_KEY = "xk_admin_sb_group_open";

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
  });
  const [groupOpen, setGroupOpen] = useState(() => {
    try { return localStorage.getItem(GROUP_OPEN_KEY) !== "0"; } catch { return true; }
  });

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const toggleGroup = () => {
    setGroupOpen((o) => {
      const next = !o;
      try { localStorage.setItem(GROUP_OPEN_KEY, next ? "1" : "0"); } catch {}
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
                    <span className="sb-link-ico"><Icon name={item.icon} size={20} /></span>
                    <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                  </NavLink>
                );
              }
              return (
                <div className="sb-group" key={item.label.az}>
                  <button type="button" className="sb-group-toggle" onClick={toggleGroup}>
                    <span className="sb-link-ico"><Icon name={item.icon} size={20} /></span>
                    <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
                    <span className={`sb-group-chevron${groupOpen ? " is-open" : ""}`}>
                      <Icon name="chevronDown" size={14} />
                    </span>
                  </button>
                  {groupOpen && (
                    <div className="sb-group-children">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) => `sb-sublink${isActive ? " is-active" : ""}`}
                          onClick={() => setDrawer(false)}
                          title={collapsed ? (child.label[lang] || child.label.az) : undefined}
                        >
                          <span className="sb-link-ico"><Icon name={child.icon} size={16} /></span>
                          <span className="sb-link-label">{child.label[lang] || child.label.az}</span>
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
            <Chip tone="accent">{lang === "az" ? "Admin Panel" : "Admin Panel"}</Chip>
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
