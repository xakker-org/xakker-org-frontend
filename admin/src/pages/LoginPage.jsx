import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import Tile from "../components/ui/Tile";
import Field, { Input } from "../components/ui/Field";
import Button from "../components/ui/Button";

const T = {
  az: {
    title: "Admin Panel",
    sub: "Xəkər idarəetmə panelinə giriş",
    username: "İstifadəçi adı",
    password: "Şifrə",
    submit: "Daxil ol",
    submitting: "Yoxlanılır...",
    errorInvalid: "İstifadəçi adı və ya şifrə yanlışdır.",
    errorNetwork: "Serverə qoşula bilmədi. İnternet bağlantısını və ya server ünvanını (VITE_API_BASE_URL) yoxlayın.",
    errorThrottled: "Çox sayda cəhd edildi. Bir az sonra yenidən cəhd edin.",
    errorGeneric: "Xəta baş verdi. Yenidən cəhd edin.",
  },
  en: {
    title: "Admin Panel",
    sub: "Sign in to the Xakker admin panel",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitting: "Checking...",
    errorInvalid: "Wrong username or password.",
    errorNetwork: "Could not reach the server. Check your connection or the server address (VITE_API_BASE_URL).",
    errorThrottled: "Too many attempts. Please wait a moment and try again.",
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

export default function LoginPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(describeLoginError(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <img src="/static/logo/logoXakker.png" alt="Xakker" />
      </div>
      <Tile pad="lg">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {t.title}
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 24 }}>{t.sub}</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <Field label={t.username}>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label={t.password} error={error || undefined}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <Button type="submit" variant="accent" block disabled={submitting}>
            {submitting ? t.submitting : t.submit}
          </Button>
        </form>
      </Tile>
    </div>
  );
}
