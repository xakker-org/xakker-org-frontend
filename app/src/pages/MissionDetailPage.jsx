import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TileSkeleton } from "../components/ui/Skeleton";
import { Chip, DiffBadge } from "../components/ui/Chip";
import { Input } from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";
import { renderMarkdown } from "../utils/markdown";
import { getMockCtfMissionDetail } from "../data/mockData";

const T = {
  az: {
    back: "Geri", crumb: "Missiyalar",
    notFoundTitle: "Missiya tapılmadı", notFoundSub: "Bu missiya mövcud deyil.",
    points: "xal", min: "dəq", solvedBy: "həll etdi",
    levels: { easy: "Asan", medium: "Orta", hard: "Çətin", expert: "Ekspert" },
    scenario: "Ssenari", connection: "Qoşulma məlumatı",
    flagTitle: "Bayrağı təqdim et", flagPlaceholder: "XKR{...}", submit: "Göndər", submitting: "Göndərilir...",
    correct: "Düzgün! Bayraq qəbul edildi.", wrong: "Yanlış bayraq, yenidən cəhd et.",
    attempts: (n) => `${n} cəhd edilib`,
    solvedBanner: "Bu missiyanı həll etdin!", pointsAwarded: (n) => `+${n} xal qazanıldı`,
    alreadySolved: "Artıq həll edilib",
    writeupTitle: "Həll yolu",
    lockedCta: "Sıxışıb qaldınmı? Həll yolunu göstər",
    unlocking: "Açılır...",
    unlockedTag: "Açıldı",
    noWriteup: "Bu missiya üçün həll yolu mövcud deyil.",
    loadError: "Missiya yüklənə bilmədi.",
  },
  en: {
    back: "Back", crumb: "Missions",
    notFoundTitle: "Mission not found", notFoundSub: "This mission doesn't exist.",
    points: "pts", min: "min", solvedBy: "solved",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    scenario: "Scenario", connection: "Connection info",
    flagTitle: "Submit flag", flagPlaceholder: "XKR{...}", submit: "Submit", submitting: "Submitting...",
    correct: "Correct! Flag accepted.", wrong: "Wrong flag, try again.",
    attempts: (n) => `${n} attempt${n === 1 ? "" : "s"} made`,
    solvedBanner: "You solved this mission!", pointsAwarded: (n) => `+${n} points earned`,
    alreadySolved: "Already solved",
    writeupTitle: "Write-up",
    lockedCta: "Stuck? Reveal the write-up",
    unlocking: "Unlocking...",
    unlockedTag: "Unlocked",
    noWriteup: "No write-up available for this mission.",
    loadError: "The mission could not be loaded.",
  },
};

export default function MissionDetailPage() {
  const { slug } = useParams();
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [flag, setFlag]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]   = useState(null); // { correct, already_solved, points_awarded }

  const [writeupOpen, setWriteupOpen]     = useState(false);
  const [writeupContent, setWriteupContent] = useState(null);
  const [unlocking, setUnlocking]         = useState(false);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    endpoints.missionDetail(slug)
      .then(({ data }) => {
        if (!ok) return;
        setMission(data);
        if (data?.writeup?.unlocked) {
          setWriteupOpen(true);
          setWriteupContent(data.writeup.content);
        }
      })
      .catch(() => {
        if (!ok) return;
        const mock = getMockCtfMissionDetail(slug);
        setMission(mock);
        if (mock.writeup.unlocked) {
          setWriteupOpen(true);
          setWriteupContent(mock.writeup.content);
        }
      })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [slug]);

  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!flag.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const { data } = await endpoints.submitFlag(slug, flag.trim());
      setFeedback(data);
      setMission((prev) => prev && ({
        ...prev,
        user_status: data.user_status,
        flag_attempts: data.flag_attempts,
        solved_at: data.correct ? (prev.solved_at || new Date().toISOString()) : prev.solved_at,
        writeup: data.correct && prev.writeup ? { ...prev.writeup, unlocked: true } : prev.writeup,
      }));
      if (data.correct) {
        setFlag("");
        setWriteupOpen((o) => o); // don't force-open; unlock button below now unnecessary but keep consistent
      }
    } catch {
      setFeedback({ correct: false, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockWriteup = async () => {
    if (unlocking) return;
    setUnlocking(true);
    try {
      const { data } = await endpoints.unlockWriteup(slug);
      setWriteupContent(data.content);
      setWriteupOpen(true);
    } catch {
      // fallback: still open with mock content in dev if backend not live
      const mock = getMockCtfMissionDetail(slug);
      if (mock.writeup?.content) {
        setWriteupContent(mock.writeup.content);
        setWriteupOpen(true);
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TileSkeleton height={40} />
        <TileSkeleton height={220} />
        <TileSkeleton height={300} />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <>
        <div className="xk-back-row">
          <Link to="/missions" className="xk-back"><Icon name="arrowLeft" size={14} /> {t.back}</Link>
        </div>
        <div className="xk-empty-screen">
          <div className="xk-empty-ico"><Icon name="target" size={24} /></div>
          <h3>{t.notFoundTitle}</h3>
          <p>{t.notFoundSub}</p>
        </div>
      </>
    );
  }

  const isSolved   = mission.user_status === "solved";
  const writeup    = mission.writeup || { exists: false, unlocked: false, content: null };
  const showUnlockCta = writeup.exists && !writeupOpen;

  return (
    <>
      <div className="xk-back-row xk-reveal">
        <Link to="/missions" className="xk-back">
          <Icon name="arrowLeft" size={14} /> {t.back}
        </Link>
        <div className="xk-crumbs">
          <span>{t.crumb}</span>
          <span className="xk-crumb-sep">/</span>
          <span className="cur">{mission.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="xk-detail-hero xk-reveal" style={{ animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top">
            <span className="xk-feat-track">{mission.category?.name || "—"}</span>
            <DiffBadge level={mission.difficulty} labelOverride={t.levels[mission.difficulty] || mission.difficulty} />
            {isSolved && <span className="xk-badge tone-ok"><Icon name="check" size={11} /> {t.alreadySolved}</span>}
          </div>
          <h1 className="xk-hero-title">{mission.title}</h1>
          {mission.short_description && <p className="xk-hero-desc">{mission.short_description}</p>}

          {mission.tags?.length > 0 && (
            <div className="xk-mission-tags" style={{ marginTop: 12 }}>
              {mission.tags.map((tg) => <Chip key={tg.slug} tone="neutral" size="sm">#{tg.name}</Chip>)}
            </div>
          )}

          <div className="xk-hero-meta">
            <span><Icon name="xp" size={14} /> {mission.points} {t.points}</span>
            {mission.estimated_time > 0 && <span><Icon name="clock" size={14} /> ~{mission.estimated_time} {t.min}</span>}
            <span><Icon name="users" size={14} /> {mission.solved_count} {t.solvedBy}</span>
          </div>
        </div>
      </div>

      <div className="xk-detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* Scenario / description */}
          <div className="xk-card xk-reveal" style={{ animationDelay: "120ms" }}>
            <h3 className="xk-card-title" style={{ marginBottom: 14 }}>{t.scenario}</h3>
            <div className="xk-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(mission.description) }} />
          </div>

          {/* Connection info */}
          {mission.connection_info && (
            <div className="xk-card xk-reveal" style={{ animationDelay: "160ms" }}>
              <h3 className="xk-card-title" style={{ marginBottom: 14 }}>{t.connection}</h3>
              <div className="xk-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(mission.connection_info) }} />
            </div>
          )}

          {/* Flag submit / solved banner */}
          <div className="xk-card xk-flag-card xk-reveal" style={{ animationDelay: "200ms" }}>
            {isSolved ? (
              <div className="xk-solved-banner">
                <span className="ico"><Icon name="check" size={16} /></span>
                <div>
                  <div>{t.solvedBanner}</div>
                  {mission.flag_attempts != null && (
                    <div className="xk-flag-attempts" style={{ marginTop: 2 }}>{t.attempts(mission.flag_attempts)}</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h3 className="xk-card-title">{t.flagTitle}</h3>
                <form className="xk-flag-row" onSubmit={handleSubmitFlag}>
                  <Input
                    className="xk-flag-input"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder={t.flagPlaceholder}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button type="submit" className="xk-btn primary" disabled={submitting || !flag.trim()}>
                    {submitting ? t.submitting : t.submit}
                  </button>
                </form>
                {feedback && (
                  <div className={`xk-flag-feedback ${feedback.correct ? "ok" : "no"}`}>
                    <Icon name={feedback.correct ? "check" : "alert"} size={14} />
                    {feedback.correct ? t.correct : t.wrong}
                  </div>
                )}
                {mission.flag_attempts > 0 && (
                  <div className="xk-flag-attempts">{t.attempts(mission.flag_attempts)}</div>
                )}
              </>
            )}
          </div>

          {/* Write-up — locked by default, stays open once unlocked */}
          {writeup.exists && (
            <div className="xk-card xk-writeup-card xk-reveal" style={{ animationDelay: "240ms" }}>
              <div className="xk-card-head" style={{ marginBottom: writeupOpen ? 14 : 0 }}>
                <h3 className="xk-card-title">{t.writeupTitle}</h3>
                {writeupOpen && (
                  <span className="xk-writeup-unlocked-tag"><Icon name="check" size={12} /> {t.unlockedTag}</span>
                )}
              </div>

              {writeupOpen ? (
                <div className="xk-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(writeupContent || "") }} />
              ) : (
                <div className="xk-writeup-locked">
                  <div className="ico"><Icon name="lock" size={22} /></div>
                  <p>{lang === "az"
                    ? "Həll yolu standart olaraq gizlidir. İstəsən indi göstərə bilərik."
                    : "The write-up is hidden by default. You can reveal it whenever you want."}</p>
                  <button type="button" className="xk-btn outline" onClick={handleUnlockWriteup} disabled={unlocking}>
                    <Icon name="lock" size={14} />
                    {unlocking ? t.unlocking : t.lockedCta}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aside */}
        <div className="xk-detail-aside">
          <div className="xk-card xk-aside-card xk-reveal" style={{ animationDelay: "180ms" }}>
            <div className="xk-card-eyebrow">{lang === "az" ? "Mükafat" : "Reward"}</div>
            <div className="xk-reward-row">
              <Icon name="xp" size={16} style={{ color: "var(--accent)" }} />
              <b>{mission.points} {t.points}</b>
            </div>
            <div className="xk-reward-row">
              <Icon name="users" size={16} style={{ color: "var(--accent)" }} />
              {mission.solved_count} {t.solvedBy}
            </div>
            {mission.estimated_time > 0 && (
              <div className="xk-reward-row">
                <Icon name="clock" size={16} style={{ color: "var(--accent)" }} />
                ~{mission.estimated_time} {t.min}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
