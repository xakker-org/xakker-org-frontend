import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";
import { localizeCategory } from "../utils/categoryLabels";

const CAT_HUE = {
  web:215, network:175, linux:265, sistem:265, system:265,
  crypto:140, kripto:140, osint:35, recon:35, pentest:0,
};
function catHue(c) {
  const key = (c.category || c.category_name || "").toLowerCase();
  for (const [k, v] of Object.entries(CAT_HUE)) { if (key.includes(k)) return v; }
  return 215;
}

function ChevronIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2zM4 19a2 2 0 012-2h13" />
    </svg>
  );
}

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [selIdx, setSelIdx]   = useState(0);
  const [done, setDone]       = useState(new Set());

  useEffect(() => {
    setLoading(true);
    endpoints.courseDetail(slug)
      .then(({ data }) => {
        setCourse(data);
        const pct   = data.progress_percent || 0;
        const cnt   = data.lessons?.length || 0;
        const start = Math.min(Math.floor((pct / 100) * cnt), cnt - 1);
        setSelIdx(start);
        const doneSet = new Set();
        (data.lessons || []).forEach((l, i) => { if (l.user_completed || i < start) doneSet.add(i); });
        setDone(doneSet);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <TileSkeleton height={40} />
        <div className="xk-course-detail" style={{ marginTop: 16 }}>
          <TileSkeleton height={480} />
          <TileSkeleton height={480} />
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <div className="xk-back-row"><Link to="/courses" className="xk-back"><ChevronIcon /> {lang === "az" ? "Geri" : "Back"}</Link></div>
        <div className="xk-empty-screen"><h3>{lang === "az" ? "Kurs tapılmadı" : "Course not found"}</h3></div>
      </>
    );
  }

  const lessons  = course.lessons || [];
  const lesson   = lessons[selIdx] || {};
  const hue      = catHue(course);
  const pct      = done.size > 0 ? Math.round((done.size / Math.max(lessons.length, 1)) * 100) : course.progress_percent || 0;

  /* Build curriculum sections */
  const half     = Math.ceil(lessons.length / 2);
  const sections = [
    { label: lang === "az" ? "Bölmə 1 · Əsaslar" : "Section 1 · Basics", items: lessons.slice(0, half) },
    { label: lang === "az" ? "Bölmə 2 · Praktika" : "Section 2 · Practice", items: lessons.slice(half) },
  ].filter(s => s.items.length > 0);

  const complete = () => {
    setDone(s => new Set(s).add(selIdx));
    if (selIdx < lessons.length - 1) setSelIdx(selIdx + 1);
  };

  return (
    <>
      {/* Back */}
      <div className="xk-back-row xk-reveal">
        <Link to="/courses" className="xk-back"><ChevronIcon /> {lang === "az" ? "Geri" : "Back"}</Link>
        <div className="xk-crumbs">
          <span>{lang === "az" ? "Kurslar" : "Courses"}</span>
          <span className="xk-crumb-sep">/</span>
          <span className="cur">{localizeCategory(course.category || course.category_name, lang) || (lang === "az" ? "Kurs" : "Course")}</span>
        </div>
      </div>

      <div className="xk-course-detail" style={{ "--ch": hue }}>

        {/* Left: player + info */}
        <div className="xk-course-main xk-reveal" style={{ animationDelay: "60ms" }}>
          {/* Video player */}
          <div className="xk-player">
            <div className="xk-course-thumb-grid" />
            <button className="xk-player-play" onClick={() => navigate(`/courses/${slug}/lessons/${lesson.id}`)}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <div className="xk-player-cap">
              {lesson.has_video ? (lang === "az" ? "VİDEO" : "VIDEO") : (lang === "az" ? "MƏTN" : "TEXT")} · {lesson.estimated_minutes || 5} {lang === "az" ? "dəq" : "min"}
            </div>
          </div>

          {/* Course info */}
          <div className="xk-course-info">
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
              letterSpacing: ".1em", textTransform: "uppercase",
              color: `hsl(${hue} 80% 70%)`, marginBottom: 8,
            }}>
              {localizeCategory(course.category, lang) || (lang === "az" ? "Kurs" : "Course")}
              {(course.author_name || course.instructor) && ` · ${course.author_name || course.instructor}`}
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10, lineHeight: 1.15 }}>
              {lesson.title || course.title}
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {lang === "az"
                ? `Bu dərsdə ${course.title.toLowerCase()} mövzusunun "${(lesson.title || "").toLowerCase()}" hissəsini addım-addım keçirik.`
                : `In this lesson we walk through the "${(lesson.title || "").toLowerCase()}" part of ${course.title.toLowerCase()} step by step.`}
            </p>
            <div className="xk-lesson-foot" style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 0 }}>
              <button className="xk-btn ghost" onClick={() => selIdx > 0 ? setSelIdx(selIdx - 1) : navigate("/courses")}>
                {lang === "az" ? "Əvvəlki" : "Previous"}
              </button>
              <button className="xk-btn primary" onClick={lesson.id ? () => navigate(`/courses/${slug}/lessons/${lesson.id}`) : complete}>
                {done.has(selIdx) ? (lang === "az" ? "Növbəti" : "Next") : (lang === "az" ? "Tamamla və davam et" : "Complete and continue")}
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: curriculum */}
        <div className="xk-card xk-curriculum xk-reveal" style={{ animationDelay: "120ms" }}>
          <div className="xk-curr-head">
            <h3 className="xk-card-title">{lang === "az" ? "Kurs proqramı" : "Course curriculum"}</h3>
            <span className="xk-mission-pct">{pct}%</span>
          </div>
          <div className="xk-track" style={{ height: 4 }}>
            <div className="xk-fill" style={{ width: `${pct}%`, background: `hsl(${hue} 70% 55%)` }} />
          </div>
          <div className="xk-curr-sections">
            {sections.map((sec, si) => (
              <div key={si} className="xk-curr-section">
                <div className="xk-curr-label">{sec.label}</div>
                {sec.items.map((l) => {
                  const idx    = lessons.indexOf(l);
                  const isDone = done.has(idx) || l.user_completed;
                  const isCur  = idx === selIdx;
                  return (
                    <button key={l.id} className={`xk-curr-row${isCur ? " cur" : ""}${isDone ? " done" : ""}`}
                      onClick={() => setSelIdx(idx)}>
                      <span className="xk-curr-ico">
                        {isDone ? <CheckIcon /> : l.has_video ? <ArrowIcon /> : <BookIcon />}
                      </span>
                      <span className="xk-curr-title">{l.title}</span>
                      <span className="xk-curr-min">{l.estimated_minutes || 5}{lang === "az" ? "d" : "m"}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
