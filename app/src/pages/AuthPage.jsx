import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";
import { setTokens } from "../utils/tokens";
import Icon from "../components/ui/Icon";
import "../styles/auth.css";

const MODES = ["login", "register", "forgot"];
const OTP_LENGTH = 6;

function OtpCodeInput({ value, onChange, label }) {
  const boxRefs = useRef([]);

  const setBox = (index, char) => {
    const chars = value.padEnd(OTP_LENGTH, " ").split("");
    chars[index] = char;
    onChange(chars.join("").replace(/ /g, ""));
  };

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    setBox(index, digit || " ");
    if (digit && index < OTP_LENGTH - 1) boxRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    boxRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="otp-field">
      <span className="otp-label">{label}</span>
      <div className="otp-input-group">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (boxRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="otp-box"
            autoComplete="one-time-code"
            aria-label={`${label} ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const { mode = "login" } = useParams();
  const normalizeMode = (value) => (MODES.includes(value) ? value : "login");
  const [activeTab, setActiveTab] = useState(normalizeMode(mode));
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [resetStage, setResetStage] = useState("request"); // "request" | "verify" | "reset"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLogin = activeTab === "login";
  const isForgot = activeTab === "forgot";
  const t = (az, en) => (lang === "az" ? az : en);

  useEffect(() => {
    document.body.classList.add("self-study-body");
    return () => document.body.classList.remove("self-study-body");
  }, []);

  useEffect(() => {
    const normalized = normalizeMode(mode);
    if (normalized !== activeTab) setActiveTab(normalized);
  }, [mode, activeTab]);

  const handleLogoError = () => setLogoSrc("/static/logo/logoXakker.png");

  const switchMode = (nextMode) => {
    const normalized = normalizeMode(nextMode);
    setActiveTab(normalized);
    setError("");
    setSuccess("");
    setResetStage("request");
    setForm((prev) => ({ ...prev, password: "", confirmPassword: "", code: "" }));
    navigate(`/auth/${normalized}`, { replace: true });
  };

  const getRequestErrorMessage = (requestError, fallback) => {
    const payload = requestError?.response?.data;
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;
    if (payload.detail) return payload.detail;
    if (Array.isArray(payload.non_field_errors) && payload.non_field_errors[0])
      return payload.non_field_errors[0];
    const firstFieldError = Object.values(payload).find(
      (v) => Array.isArray(v) && v[0]
    );
    if (firstFieldError) return firstFieldError[0];
    return fallback;
  };

  const title = useMemo(() => {
    if (isForgot) {
      if (resetStage === "verify") return t("Kodu Təsdiqlə", "Verify Code");
      if (resetStage === "reset") return t("Yeni Şifrə Təyin Et", "Set a New Password");
      return t("Girişi Bərpa Et", "Reset Your Access");
    }
    return isLogin ? t("Yenidən Xoş Gəldin, Hacker", "Welcome Back, Hacker") : t("Səyahətinə Başla", "Start Your Journey");
  }, [isLogin, isForgot, resetStage, lang]);

  const subtitle = useMemo(() => {
    if (isForgot) {
      if (resetStage === "verify")
        return t(
          `${form.email} ünvanına göndərilən 6 rəqəmli kodu daxil et`,
          `Enter the 6-digit code sent to ${form.email}`
        );
      if (resetStage === "reset")
        return t("Hesabın üçün etibarlı bir şifrə seç", "Choose a strong password for your account");
      return t(
        "E-poçtunu daxil et, sənə bərpa kodu göndərək",
        "Enter your email and we'll send you a reset code"
      );
    }
    return isLogin
      ? t("Kibertəhlükəsizlik təlininə davam etmək üçün daxil ol", "Sign in to continue your cybersecurity training")
      : t("Xakker-də təlim keçən mütəxəssislərə qoşul", "Join elite professionals training on Xakker");
  }, [isLogin, isForgot, resetStage, form.email, lang]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isForgot && resetStage === "request") {
        await endpoints.requestPasswordReset(form.email);
        setSuccess(
          t(
            "Kod e-poçtuna göndərildi. Aşağıda daxil et.",
            "A code has been sent to your email. Enter it below."
          )
        );
        setResetStage("verify");
      } else if (isForgot && resetStage === "verify") {
        if (form.code.length < OTP_LENGTH) {
          setError(t("6 rəqəmi tam daxil et", "Enter all 6 digits"));
          setLoading(false);
          return;
        }
        await endpoints.verifyPasswordResetCode(form.email, form.code);
        setSuccess("");
        setResetStage("reset");
      } else if (isForgot && resetStage === "reset") {
        if (form.password !== form.confirmPassword) {
          setError(t("Şifrələr uyğun gəlmir", "Passwords do not match"));
          setLoading(false);
          return;
        }
        await endpoints.confirmPasswordReset(form.email, form.code, form.password);
        setSuccess(t("Şifrə yeniləndi! Girişə yönləndirilir...", "Password reset! Redirecting to login..."));
        setTimeout(() => switchMode("login"), 1200);
      } else if (isLogin) {
        const { data } = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        setTokens(data.access, data.refresh);
        setSuccess(t("Giriş uğurludur! Yönləndirilir...", "Login successful! Redirecting..."));
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        if (form.password !== form.confirmPassword) {
          setError(t("Şifrələr uyğun gəlmir", "Passwords do not match"));
          setLoading(false);
          return;
        }
        await api.post("/auth/register/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        const { data } = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        setTokens(data.access, data.refresh);
        setSuccess(t("Hesab yaradıldı! Yönləndirilir...", "Account created! Redirecting..."));
        setTimeout(() => navigate("/dashboard"), 900);
      }
    } catch (requestError) {
      if (isForgot && resetStage === "request" && requestError?.response?.status === 404) {
        setError(t("Bu email ilə qeydiyyatdan keçilməyib.", "No account is registered with this email."));
      } else {
        setError(
          getRequestErrorMessage(
            requestError,
            isForgot
              ? resetStage === "request"
                ? t("Kod göndərilmədi. Yenidən cəhd et.", "Couldn't send the code. Please try again.")
                : resetStage === "verify"
                ? t("Kod yanlışdır və ya vaxtı bitib.", "The code is invalid or has expired.")
                : t("Şifrə yenilənmədi. Kodun vaxtı bitmiş ola bilər.", "Couldn't reset the password. The code may have expired.")
              : isLogin
              ? t("Yanlış istifadəçi adı və ya şifrə", "Invalid username or password")
              : t("Qeydiyyat alınmadı. İstifadəçi adı artıq mövcud ola bilər.", "Registration failed. Username may already exist.")
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await endpoints.requestPasswordReset(form.email);
      setSuccess(t("Kod yenidən göndərildi.", "Code resent."));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, t("Kod göndərilmədi.", "Couldn't resend the code.")));
    } finally {
      setLoading(false);
    }
  };

  const stageKey = `${activeTab}-${resetStage}`;

  const eyeIcon = (open) =>
    open ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
        <div className="auth-glow auth-glow-3" />
      </div>

      <div className="auth-lang">
        <button
          type="button"
          className={`auth-lang-btn${lang === "az" ? " active" : ""}`}
          onClick={() => setLang("az")}
        >
          AZ
        </button>
        <button
          type="button"
          className={`auth-lang-btn${lang === "en" ? " active" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>

      <div className="auth-container">
        {/* ── RAIL ───────────────────────────── */}
        <div className="auth-rail">
          <span className="rail-wordmark-bg" aria-hidden="true">XAKKER</span>

          <div className="rail-brand">
            <img
              src={logoSrc}
              alt="Xakker"
              className="auth-logo-img"
              onError={handleLogoError}
            />
          </div>

          <div className="rail-ticker">
            <div className="rail-tick">
              <span className="rt-dot" />
              <span className="rt-text">{t("xakker.org-a qoşulur...", "connecting to xakker.org...")}</span>
              <span className="rt-ok">OK</span>
            </div>
            <div className="rail-tick">
              <span className="rt-dot" />
              <span className="rt-text">{t("təhlükəsiz seans yüklənir...", "loading secure session...")}</span>
              <span className="rt-ok">OK</span>
            </div>
            <div className="rail-tick">
              <span className="rt-dot" />
              <span className="rt-text">encryption: AES-256</span>
              <span className="rt-ok">READY</span>
            </div>
            <div className="rail-tick rail-tick-live">
              <span className="rt-dot" />
              <span className="rt-text">{t("kimlik məlumatı gözlənilir_", "awaiting credentials_")}</span>
            </div>
          </div>

          <p className="rail-status">// {t("təhlükə monitorinqi aktivdir", "threat monitoring active")}</p>
        </div>

        {/* ── FORM PANEL ─────────────────────── */}
        <div className="auth-form-panel">
          <div className="auth-card">
            {/* Terminal bar */}
            <div className="auth-terminal-bar">
              <span className="t-dot t-red" />
              <span className="t-dot t-yellow" />
              <span className="t-dot t-green" />
              <span className="t-title">xakker_auth.exe</span>
            </div>

            {/* Tabs — hidden in forgot-password mode */}
            {isForgot ? (
              <button
                type="button"
                className="back-to-login"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  if (resetStage === "reset") {
                    setResetStage("verify");
                    setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                  } else if (resetStage === "verify") {
                    setResetStage("request");
                    setForm((prev) => ({ ...prev, code: "" }));
                  } else {
                    switchMode("login");
                  }
                }}
              >
                <span className="back-arrow">←</span>{" "}
                {resetStage === "reset"
                  ? t("Kodu yenidən daxil et", "Re-enter code")
                  : resetStage === "verify"
                  ? t("E-poçtu dəyiş", "Change email")
                  : t("Girişə qayıt", "Back to login")}
              </button>
            ) : (
              <div className={`auth-tabs auth-tabs-${activeTab}`} role="tablist">
                <button
                  className={`tab ${activeTab === "login" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "login"}
                  onClick={() => switchMode("login")}
                >
                  {t("Giriş", "Login")}
                </button>
                <button
                  className={`tab ${activeTab === "register" ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "register"}
                  onClick={() => switchMode("register")}
                >
                  {t("Qeydiyyat", "Register")}
                </button>
                <div className="tab-slider" />
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="auth-form">
              <div className="form-header">
                <h2>{title}</h2>
                <p className="form-subtitle">{subtitle}</p>
              </div>

              <div className="auth-stage" key={stageKey}>
              {isForgot ? (
                resetStage === "request" ? (
                  /* Forgot-password step 1: email only */
                  <div className="field-wrap">
                    <span className="field-icon">@</span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder=" "
                      autoComplete="email"
                      required
                    />
                    <label htmlFor="email" className="field-label">{t("E-poçt", "Email")}</label>
                  </div>
                ) : resetStage === "verify" ? (
                  /* Forgot-password step 2: verification code only */
                  <>
                    <OtpCodeInput
                      value={form.code}
                      onChange={(code) => setForm((prev) => ({ ...prev, code }))}
                      label={t("Təsdiq Kodu", "Verification Code")}
                    />

                    <div className="forgot-hint">
                      <button type="button" className="forgot-link" onClick={resendCode}>
                        {t("Kod gəlmədi? Yenidən göndər", "Didn't get it? Resend code")}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Forgot-password step 3: new password, code already verified */
                  <>
                    <div className="field-wrap">
                      <span className="field-icon">••</span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder=" "
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <label htmlFor="password" className="field-label">{t("Yeni Şifrə", "New Password")}</label>
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? t("Şifrəni gizlət", "Hide password") : t("Şifrəni göstər", "Show password")}
                      >
                        {eyeIcon(showPassword)}
                      </button>
                    </div>

                    <div className="field-wrap">
                      <span className="field-icon">••</span>
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={onChange}
                        placeholder=" "
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <label htmlFor="confirmPassword" className="field-label">{t("Şifrəni Təsdiqlə", "Confirm Password")}</label>
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                        aria-label={showConfirm ? t("Şifrəni gizlət", "Hide password") : t("Şifrəni göstər", "Show password")}
                      >
                        {eyeIcon(showConfirm)}
                      </button>
                    </div>
                  </>
                )
              ) : (
                <>
                  {/* Username */}
                  <div className="field-wrap">
                    <span className="field-icon">$_</span>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={onChange}
                      placeholder=" "
                      autoComplete="username"
                      required
                    />
                    <label htmlFor="username" className="field-label">{t("İstifadəçi adı", "Username")}</label>
                  </div>

                  {/* Email — register only */}
                  {!isLogin && (
                    <div className="field-wrap">
                      <span className="field-icon">@</span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder=" "
                        autoComplete="email"
                        required
                      />
                      <label htmlFor="email" className="field-label">{t("E-poçt", "Email")}</label>
                    </div>
                  )}

                  {/* Password */}
                  <div className="field-wrap">
                    <span className="field-icon">••</span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      placeholder=" "
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      minLength={8}
                      required
                    />
                    <label htmlFor="password" className="field-label">{t("Şifrə", "Password")}</label>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? t("Şifrəni gizlət", "Hide password") : t("Şifrəni göstər", "Show password")}
                    >
                      {eyeIcon(showPassword)}
                    </button>
                  </div>

                  {/* Confirm password — register only */}
                  {!isLogin && (
                    <div className="field-wrap">
                      <span className="field-icon">••</span>
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={onChange}
                        placeholder=" "
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <label htmlFor="confirmPassword" className="field-label">{t("Şifrəni təsdiqlə", "Confirm Password")}</label>
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                        aria-label={showConfirm ? t("Şifrəni gizlət", "Hide password") : t("Şifrəni göstər", "Show password")}
                      >
                        {eyeIcon(showConfirm)}
                      </button>
                    </div>
                  )}

                  {isLogin && (
                    <div className="forgot-hint">
                      <button type="button" className="forgot-link" onClick={() => switchMode("forgot")}>
                        {t("Şifrəni unutmusan?", "Forgot password?")}
                      </button>
                    </div>
                  )}
                </>
              )}
              </div>

              {error && (
                <div className="auth-message auth-error" role="alert">
                  <span className="msg-icon"><Icon name="close" size={13} /></span> {error}
                </div>
              )}
              {success && (
                <div className="auth-message auth-success" role="status">
                  <span className="msg-icon"><Icon name="check" size={13} /></span> {success}
                </div>
              )}

              <button
                type="submit"
                className={`auth-submit-btn${loading ? " is-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="submit-spinner" />
                    <span>{t("İşlənir...", "Processing...")}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isForgot
                        ? resetStage === "reset"
                          ? t("Şifrəni Yenilə", "Reset Password")
                          : resetStage === "verify"
                          ? t("Kodu Təsdiqlə", "Verify Code")
                          : t("Kod Göndər", "Send Code")
                        : isLogin
                        ? t("Daxil Ol", "Sign In")
                        : t("Hesab Yarat", "Create Account")}
                    </span>
                    <span className="submit-arrow">→</span>
                  </>
                )}
              </button>

              {!isLogin && !isForgot && (
                <p className="terms-text">
                  {t(
                    "Qeydiyyatdan keçməklə bu hesabın yalnız fərdi təlim, irəliləyiş izləmə və imtahan proseslərində istifadə olunacağını təsdiqləyirsən.",
                    "By registering you confirm this account will be used only for self-study, progress tracking, and exam workflows."
                  )}
                </p>
              )}

              {!isForgot && (
                <p className="auth-switch">
                  {isLogin ? t("Hesabın yoxdur? ", "No account? ") : t("Artıq qeydiyyatdan keçmisən? ", "Already registered? ")}
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => switchMode(isLogin ? "register" : "login")}
                  >
                    {isLogin ? t("İndi qoşul", "Join now") : t("Daxil ol", "Sign in")}
                  </button>
                </p>
              )}
            </form>
          </div>

          <div className="auth-trust-row">
            <span>🔒 {t("Şifrələnmiş", "Encrypted")}</span>
            <span>⚡ {t("Ani giriş", "Instant access")}</span>
            <span>✓ {t("ISO-səviyyəli təhlükəsizlik", "ISO-grade security")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
