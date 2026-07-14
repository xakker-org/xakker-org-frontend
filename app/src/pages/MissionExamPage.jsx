import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Tile, { TileHead } from "../components/ui/Tile";
import Button from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import Bar from "../components/ui/Bar";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";
import Icon from "../components/ui/Icon";

/* ── Timer ──────────────────────────────────────────────────────── */
function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [onExpire]);

  const m       = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s       = String(remaining % 60).padStart(2, "0");
  const warning = remaining < 60;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 14px", borderRadius: "var(--r-pill)",
      background: warning ? "rgba(255,36,66,0.12)" : "var(--bg-card-2)",
      border: `1px solid ${warning ? "var(--accent-ring)" : "var(--line-2)"}`,
      fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
      color: warning ? "var(--accent)" : "var(--ink-2)",
      flexShrink: 0,
    }}>
      ⏱ {m}:{s}
    </div>
  );
}

/* ── Question card — uses xk-q-* vocabulary ───────────────────── */
function QuestionCard({ question, index, selectedChoices, answerText, onToggle, onTextChange, locked, lang }) {
  const isOpen   = question.question_type === "open";
  const answered = isOpen ? answerText.trim().length > 0 : selectedChoices.length > 0;

  return (
    <div className="xk-card" style={{
      border: answered ? "1px solid var(--accent-ring)" : undefined,
      overflow: "hidden", position: "relative",
    }}>
      {answered && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
      )}

      <div className="xk-card-head">
        <span className="xk-card-eyebrow">{lang === "az" ? "Sual" : "Question"} {index + 1}</span>
        {answered && <span className="xk-badge xk-badge-accent">✓ {lang === "az" ? "Cavablandı" : "Answered"}</span>}
      </div>

      <p className="xk-q-prompt">{question.question_text}</p>

      <div className="xk-card-eyebrow" style={{ marginBottom: 10 }}>
        {isOpen ? (lang === "az" ? "Açıq sual" : "Open question") : (lang === "az" ? "Çoxseçimli test" : "Multiple choice")}
      </div>

      {isOpen ? (
        <textarea
          rows={5}
          value={answerText}
          onChange={e => !locked && onTextChange(question.id, e.target.value)}
          placeholder={lang === "az" ? "Cavabınızı yazın..." : "Write your answer..."}
          disabled={locked}
          className="input"
          style={{ minHeight: 100, resize: "vertical", height: "auto", padding: "12px 14px" }}
        />
      ) : (
        <div className="xk-q-opts">
          {(question.choices || []).map((c, ci) => {
            const sel = selectedChoices.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`xk-q-opt${sel ? " right" : ""}`}
                disabled={locked}
                onClick={() => !locked && onToggle(question.id, c.id, question.is_multiple)}
              >
                <span className="xk-q-key">{String.fromCharCode(65 + ci)}</span>
                <span>{c.choice_text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Result view ────────────────────────────────────────────────── */
function ResultView({ result, exam, missionSlug, onRetry, canRetry, lang }) {
  const passed = result.passed;
  const score  = result.score ?? 0;

  return (
    <>
      <div className="sc-exam-result">
        <div className="sc-exam-result-icon">{passed ? "🎉" : "😞"}</div>
        <div className="sc-exam-result-title" style={{ color: passed ? "var(--ok)" : "var(--accent)" }}>
          {passed ? (lang === "az" ? "Mission Tamamlandı!" : "Mission Completed!") : (lang === "az" ? "Keçilmədi" : "Not passed")}
        </div>
        <div className="sc-exam-result-score" style={{ color: passed ? "var(--ok)" : "var(--accent)" }}>
          {score.toFixed(1)}%
        </div>
        <p className="sc-exam-result-sub">
          {passed
            ? (lang === "az"
                ? `${score.toFixed(1)}% — keçmə həddi ${exam?.passing_score}%-dən yüksəkdir. Mission XP verildi!`
                : `${score.toFixed(1)}% — above the passing threshold of ${exam?.passing_score}%. Mission XP awarded!`)
            : (lang === "az"
                ? `${score.toFixed(1)}% qazandın. Keçmək üçün ən azı ${exam?.passing_score}% lazımdır.`
                : `You scored ${score.toFixed(1)}%. You need at least ${exam?.passing_score}% to pass.`)}
        </p>
        <Bar value={score} max={100} tone={passed ? "mint" : "accent"} />
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to={`/missions/${missionSlug}`} className="xk-btn ghost">{lang === "az" ? "← Missiona qayıt" : "← Back to mission"}</Link>
          {!passed && canRetry && (
            <button className="xk-btn primary" onClick={onRetry}>🔄 {lang === "az" ? "Yenidən cəhd et" : "Try again"}</button>
          )}
          {passed && (
            <Link to="/missions" className="xk-btn primary">{lang === "az" ? "Növbəti Mission →" : "Next Mission →"}</Link>
          )}
        </div>
      </div>

      {result.answers_detail?.length > 0 && (
        <Tile>
          <TileHead eyebrow="Review" title={lang === "az" ? "Cavabların nəzərdən keçirilməsi" : "Answer review"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.answers_detail.map((a, i) => {
              const correct = a.is_correct;
              const isOpen  = a.question_type === "open";
              return (
                <div key={a.question_id} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: correct ? "rgba(110,255,214,0.06)" : "rgba(255,122,138,0.06)",
                  border: `1px solid ${correct ? "rgba(110,255,214,0.22)" : "rgba(255,122,138,0.22)"}`,
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                      background: correct ? "rgba(110,255,214,0.12)" : "rgba(255,122,138,0.12)",
                      border: `1px solid ${correct ? "rgba(110,255,214,0.28)" : "rgba(255,122,138,0.28)"}`,
                      color: correct ? "var(--ok)" : "var(--bad)",
                    }}>
                      <Icon name={correct ? "check" : "close"} size={13} />
                    </span>
                    <div style={{ fontSize: 13, color: "var(--ink-1)", fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                      {i + 1}. {a.question_text}
                    </div>
                  </div>

                  {isOpen ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      <div>
                        <span style={{ color: "var(--ink-4)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.1em" }}>
                          {lang === "az" ? "Cavabınız:" : "Your answer:"}{" "}
                        </span>
                        <span style={{ color: "var(--ink-3)" }}>{a.submitted_answer || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--ink-4)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.1em" }}>
                          {lang === "az" ? "Düzgün:" : "Correct:"}{" "}
                        </span>
                        <span style={{ color: "var(--ok)" }}>{a.expected_answers?.join(" / ") || "—"}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(a.choices || []).map(c => {
                        const wasSelected = a.selected_choice_ids?.includes(c.id);
                        const isCorrect   = a.correct_choice_ids?.includes(c.id);
                        let color = "var(--ink-4)";
                        if (isCorrect) color = "var(--ok)";
                        if (wasSelected && !isCorrect) color = "var(--bad)";
                        return (
                          <div key={c.id} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "4px 0", color, fontSize: 13,
                          }}>
                            <span style={{ display: "inline-flex" }}>
                              {isCorrect ? <Icon name="check" size={12} /> : wasSelected ? <Icon name="close" size={12} /> : "○"}
                            </span>
                            <span>{c.choice_text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {a.explanation && (
                    <div style={{
                      fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6,
                      paddingTop: 8, borderTop: "1px solid var(--line)",
                    }}>
                      💡 {a.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Tile>
      )}
    </>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function MissionExamPage() {
  const { slug } = useParams();
  const { lang } = useLang();

  const [exam, setExam]             = useState(null);
  const [mission, setMission]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [attemptId, setAttemptId]   = useState(null);
  const [started, setStarted]       = useState(false);
  const [starting, setStarting]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const [answers, setAnswers]         = useState({});
  const [openAnswers, setOpenAnswers] = useState({});

  useEffect(() => {
    Promise.all([
      endpoints.missionExamDetail(slug),
      endpoints.missionDetail(slug),
    ])
      .then(([examRes, missionRes]) => {
        setExam(examRes.data);
        setMission(missionRes.data);
      })
      .catch(() => setError(lang === "az" ? "Exam tapılmadı və ya mövcud deyil." : "Exam not found or unavailable."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStartExam = async () => {
    setStarting(true); setError(null);
    try {
      const { data } = await endpoints.missionExamStart(slug);
      setAttemptId(data.attempt_id);
      setStarted(true);
      setAnswers({}); setOpenAnswers({});
    } catch (e) {
      setError(e?.response?.data?.detail || (lang === "az" ? "Exam başladıla bilmədi." : "The exam could not be started."));
    } finally {
      setStarting(false);
    }
  };

  const handleToggleChoice = (questionId, choiceId, isMultiple) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(choiceId)
            ? current.filter(c => c !== choiceId)
            : [...current, choiceId],
        };
      }
      return { ...prev, [questionId]: current.includes(choiceId) ? [] : [choiceId] };
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      const payload = {
        answers: (exam?.questions || []).map(q => ({
          question_id: q.id,
          ...(q.question_type === "open"
            ? { answer_text: openAnswers[q.id] || "" }
            : { choice_ids: answers[q.id] || [] }),
        })),
      };
      const { data } = await endpoints.missionExamSubmit(slug, attemptId, payload);
      setResult(data); setStarted(false);
    } catch (e) {
      setError(e?.response?.data?.detail || (lang === "az" ? "Göndərilə bilmədi." : "Could not be submitted."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null); setStarted(false); setAttemptId(null);
    setAnswers({}); setOpenAnswers({});
    endpoints.missionExamDetail(slug).then(({ data }) => setExam(data));
  };

  const handleTimerExpire = () => { if (started && !submitting) handleSubmit(); };

  if (loading) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TileSkeleton height={110} />
          <TileSkeleton height={200} />
        </div>
      </>
    );
  }

  const questions     = exam?.questions || [];
  const answeredCount = questions.filter(q => {
    if (q.question_type === "open") return (openAnswers[q.id] || "").trim().length > 0;
    return (answers[q.id] || []).length > 0;
  }).length;
  const allAnswered  = answeredCount === questions.length;
  const canAttempt   = exam?.can_attempt;
  const attemptsUsed = exam?.attempts_used ?? 0;
  const maxAttempts  = exam?.max_attempts ?? 0;
  const attemptsLeft = maxAttempts === 0 ? null : maxAttempts - attemptsUsed;
  const canRetry     = maxAttempts === 0 || attemptsUsed < maxAttempts;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Link to="/missions"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}>
          Missions
        </Link>
        <span style={{ color: "var(--line-3)" }}>/</span>
        <Link to={`/missions/${slug}`}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}>
          {mission?.title}
        </Link>
        <span style={{ color: "var(--line-3)" }}>/</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-1)", fontWeight: 600 }}>
          Final Exam
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {result ? (
          <ResultView result={result} exam={exam} missionSlug={slug} onRetry={handleRetry} canRetry={canRetry} lang={lang} />
        ) : (
          <>
            {/* Exam header */}
            <Tile style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.04) 100%)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: "var(--accent-soft)", border: "1px solid var(--accent-ring)",
                  display: "grid", placeItems: "center", fontSize: 26,
                }}>
                  📋
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="page-eyebrow" style={{ marginBottom: 4 }}>{lang === "az" ? "Final İmtahan" : "Final Exam"}</div>
                  <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "var(--ink-1)" }}>
                    {exam?.title}
                  </h1>
                  {exam?.description && (
                    <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px" }}>
                      {exam.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Chip size="sm" tone="accent">{questions.length} {lang === "az" ? "sual" : "questions"}</Chip>
                    <Chip size="sm">{lang === "az" ? "Keç" : "Pass"}: {exam?.passing_score}%</Chip>
                    {exam?.time_limit_minutes > 0 && (
                      <Chip size="sm">⏱ {exam.time_limit_minutes} {lang === "az" ? "dəq" : "min"}</Chip>
                    )}
                    {maxAttempts > 0 && (
                      <Chip size="sm">{lang === "az" ? "Cəhd" : "Attempt"}: {attemptsUsed + 1}/{maxAttempts}</Chip>
                    )}
                    {exam?.xp_reward > 0 && (
                      <Chip size="sm" tone="mint">+{exam.xp_reward} XP</Chip>
                    )}
                  </div>
                </div>
                {started && exam?.time_limit_minutes > 0 && (
                  <Timer totalSeconds={exam.time_limit_minutes * 60} onExpire={handleTimerExpire} />
                )}
              </div>
            </Tile>

            {/* Locked notice */}
            {!exam?.passes_completed && (
              <div style={{
                padding: "14px 18px", borderRadius: 12,
                background: "rgba(255,184,107,0.08)", border: "1px solid rgba(255,184,107,0.28)",
                display: "flex", alignItems: "center", gap: 12,
                color: "var(--warn)", fontSize: 13, fontWeight: 600,
              }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                {lang === "az"
                  ? "Bütün pass-ları tamamlayandan sonra final exam-a qatıla bilərsiniz."
                  : "You can take the final exam once you've completed all passes."}
              </div>
            )}

            {/* Attempts exhausted */}
            {exam?.passes_completed && !canAttempt && !started && (
              <div style={{
                padding: "14px 18px", borderRadius: 12,
                background: "rgba(255,36,66,0.08)", border: "1px solid rgba(255,36,66,0.25)",
                color: "var(--accent)", fontSize: 13, fontWeight: 600,
              }}>
                ❌ {lang === "az"
                  ? `Bu exam üçün ${maxAttempts} cəhdinizi tükətdiniz.`
                  : `You've used all ${maxAttempts} attempts for this exam.`}
              </div>
            )}

            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,122,138,0.08)", border: "1px solid rgba(255,122,138,0.28)",
                color: "var(--bad)", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Start screen */}
            {!started && canAttempt && exam?.passes_completed && (
              <Tile style={{ textAlign: "center", padding: "48px 32px" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>
                  {lang === "az" ? "Final Exam-a hazırsınız?" : "Ready for the Final Exam?"}
                </h2>
                <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.7 }}>
                  {lang === "az" ? (
                    <>
                      {questions.length} sual · Keçmə həddi {exam?.passing_score}%
                      {exam?.time_limit_minutes > 0 && ` · ${exam.time_limit_minutes} dəq limit`}
                      {attemptsLeft !== null && ` · ${attemptsLeft} cəhd qalıb`}
                    </>
                  ) : (
                    <>
                      {questions.length} questions · Passing score {exam?.passing_score}%
                      {exam?.time_limit_minutes > 0 && ` · ${exam.time_limit_minutes} min limit`}
                      {attemptsLeft !== null && ` · ${attemptsLeft} attempts left`}
                    </>
                  )}
                </p>
                <Button
                  variant="accent"
                  onClick={handleStartExam}
                  disabled={starting}
                  style={{ padding: "12px 32px", fontSize: 15 }}
                >
                  {starting ? (lang === "az" ? "Başlanır..." : "Starting...") : (lang === "az" ? "🚀 Exam-ı Başlat" : "🚀 Start Exam")}
                </Button>
              </Tile>
            )}

            {/* Questions */}
            {started && (
              <>
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={i}
                    selectedChoices={answers[q.id] || []}
                    answerText={openAnswers[q.id] || ""}
                    onToggle={handleToggleChoice}
                    onTextChange={(qId, val) =>
                      setOpenAnswers(prev => ({ ...prev, [qId]: val }))
                    }
                    locked={submitting}
                    lang={lang}
                  />
                ))}

                {/* Sticky submit bar */}
                <Tile style={{
                  padding: "14px 20px",
                  position: "sticky", bottom: 16,
                  background: "rgba(17,20,26,0.96)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--line-2)",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                  }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
                        {answeredCount}/{questions.length} {lang === "az" ? "cavablandı" : "answered"}
                      </span>
                      {!allAnswered && (
                        <span style={{ color: "var(--warn)", marginLeft: 8, fontSize: 12 }}>
                          {lang === "az" ? "— göndərməzdən əvvəl bütün suallara cavab verin" : "— answer all questions before submitting"}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="accent"
                      onClick={handleSubmit}
                      disabled={!allAnswered || submitting}
                    >
                      {submitting ? (lang === "az" ? "Göndərilir..." : "Submitting...") : (lang === "az" ? "Exam-ı göndər →" : "Submit exam →")}
                    </Button>
                  </div>
                </Tile>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
