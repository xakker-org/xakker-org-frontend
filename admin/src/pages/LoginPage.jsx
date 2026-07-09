import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import Tile from "../components/ui/Tile";
import Field, { Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

const REMEMBER_KEY = "xk_admin_remember";

const T = {
  az: {
    eyebrow: "XAKKER · İDARƏETMƏ PANELİ",
    title: "Admin Panel",
    sub: "Xəkər idarəetmə panelinə giriş",
    username: "İstifadəçi adı",
    password: "Şifrə",
    submit: "Daxil ol",
    submitting: "Yoxlanılır...",
    showPassword: "Şifrəni göstər",
    hidePassword: "Şifrəni gizlət",
    footer: "Yalnız səlahiyyətli işçilər üçün",
    capsLock: "Caps Lock aktivdir",
    remember: "Bu cihazda məni yadda saxla",
    rememberHint: "Söndürsəniz, brauzeri bağlayanda avtomatik çıxış olunacaq.",
    sessionNotice: "Davam etmək üçün hesabınıza yenidən daxil olun.",
    errorInvalid: "İstifadəçi adı və ya şifrə yanlışdır.",
    errorNetwork: "Serverə qoşula bilmədi. İnternet bağlantısını və ya server ünvanını (VITE_API_BASE_URL) yoxlayın.",
    errorThrottled: "Çox sayda cəhd edildi. Bir az sonra yenidən cəhd edin.",
    errorThrottledCountdown: (s) => `Yenidən cəhd: ${s} san.`,
    errorGeneric: "Xəta baş verdi. Yenidən cəhd edin.",
  },
  en: {
    eyebrow: "XAKKER · ADMIN CONSOLE",
    title: "Admin Panel",
    sub: "Sign in to the Xakker admin panel",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitting: "Checking...",
    showPassword: "Show password",
    hidePassword: "Hide password",
    footer: "Authorized staff only",
    capsLock: "Caps Lock is on",
    remember: "Remember me on this device",
    rememberHint: "Turn off to be signed out automatically when you close the browser.",
    sessionNotice: "Please sign in again to continue.",
    errorInvalid: "Wrong username or password.",
    errorNetwork: "Could not reach the server. Check your connection or the server address (VITE_API_BASE_URL).",
    errorThrottled: "Too many attempts. Please wait a moment and try again.",
    errorThrottledCountdown: (s) => `Retry in ${s}s`,
    errorGeneric: "Something went wrong. Please try again.",
  },
};

function describeLoginError(err, t) {
  if (!err.response) {
    return t.errorNetwork;
  }
  const { status, data } = err.response;
  if (status === 401) {
    return t.errorInvalid;
  }
  if (status === 429) {
    return t.errorThrottled;
  }
  if (status === 400) {
    const backendMessage = data?.non_field_errors?.[0] || data?.detail;
    if (backendMessage) return backendMessage;
  }
  return data?.detail || t.errorGeneric;
}

function readRetryAfter(err) {
  const header = err.response?.headers?.["retry-after"];
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
}

export default function LoginPage() {
  const { lang, setLang } = useLang();
  const t = T[lang] || T.az;
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => {
    try { return localStorage.getItem(REMEMBER_KEY) !== "0"; } catch { return true; }
  });
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const sessionNotice = Boolean(location.state?.from) && !error;

  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => setRetryAfter((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [retryAfter > 0]);

  const toggleRemember = () => {
    setRemember((prev) => {
      const next = !prev;
      try { localStorage.setItem(REMEMBER_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (retryAfter > 0) return;
    setError("");
    setSubmitting(true);
    try {
      await login(username, password, remember);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      const wait = err.response?.status === 429 ? readRetryAfter(err) : null;
      if (wait) setRetryAfter(wait);
      else setError(describeLoginError(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />

      <div className="auth-lang">
        <button type="button" className={`tb-lang-btn${lang === "az" ? " active" : ""}`} onClick={() => setLang("az")}>AZ</button>
        <button type="button" className={`tb-lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <img src="/static/logo/logoXakker.png" alt="Xakker" />
        </div>

        <Tile pad="lg" className={`auth-tile${error || retryAfter > 0 ? " auth-shake" : ""}`}>
          <div className="auth-eyebrow">{t.eyebrow}</div>
          <h1 className="auth-title">{t.title}</h1>
          <p className="auth-sub">{t.sub}</p>

          {sessionNotice && <div className="auth-notice">{t.sessionNotice}</div>}

          <form onSubmit={handleSubmit} className="form-grid auth-form">
            <Field label={t.username}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </Field>
            <Field label={t.password} error={error || undefined}>
              <div className="auth-password-wrap">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockOn(Boolean(e.getModifierState?.("CapsLock")))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? t.hidePassword : t.showPassword}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>
              {capsLockOn && <span className="auth-capslock">⇪ {t.capsLock}</span>}
            </Field>

            <div className={`toggle-row auth-remember${remember ? " is-on" : ""}`} onClick={toggleRemember}>
              <span className="toggle-switch" />
              <div>
                <span>{t.remember}</span>
                <div className="auth-remember-hint">{t.rememberHint}</div>
              </div>
            </div>

            <Button type="submit" variant="accent" block disabled={submitting || retryAfter > 0}>
              {submitting && <span className="auth-spinner" aria-hidden="true" />}
              {retryAfter > 0 ? t.errorThrottledCountdown(retryAfter) : submitting ? t.submitting : t.submit}
            </Button>
          </form>
        </Tile>

        <p className="auth-footer">{t.footer}</p>
      </div>
    </div>
  );
}
