import { useEffect, useState } from "react";
import { useLang } from "../contexts/LanguageContext";
import { assistantPrompt } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Tile from "../components/ui/Tile";
import Field, { Textarea } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { Chip } from "../components/ui/Chip";

const T = {
  az: {
    title: "Xakker AI — Sistem promptu",
    sub: "Assistentin əsas (bazal) sistem promptu, iki dildə. Bura yazılan mətn hər söhbətin əvvəlinə əlavə olunur.",
    baseAz: "Bazal prompt (AZ)",
    baseEn: "Bazal prompt (EN)",
    save: "Yadda saxla",
    saving: "Yadda saxlanılır...",
    saved: "Yadda saxlanıldı",
    failed: "Yadda saxlanılmadı",
    loadFailed: "Yüklənmədi",
    retry: "Yenidən cəhd et",
    updatedAt: "Son yenilənmə",
  },
  en: {
    title: "Xakker AI — System prompt",
    sub: "The assistant's base system prompt, bilingual. This text is prepended to every conversation.",
    baseAz: "Base prompt (AZ)",
    baseEn: "Base prompt (EN)",
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
    failed: "Save failed",
    loadFailed: "Failed to load",
    retry: "Retry",
    updatedAt: "Last updated",
  },
};

export default function AssistantPromptPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  // undefined = loading, null = failed, object = loaded
  const [data, setData] = useState(undefined);
  const [az, setAz] = useState("");
  const [en, setEn] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // "saved" | "failed" | null
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    setStatus(null);
    assistantPrompt
      .get()
      .then(({ data: d }) => {
        if (cancelled) return;
        setData(d);
        setAz(d.base_prompt_az || "");
        setEn(d.base_prompt_en || "");
      })
      .catch(() => !cancelled && setData(null));
    return () => { cancelled = true; };
  }, [reloadKey]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const { data: d } = await assistantPrompt.update({ base_prompt_az: az, base_prompt_en: en });
      setData(d);
      setStatus("saved");
    } catch {
      setStatus("failed");
    } finally {
      setSaving(false);
    }
  };

  if (data === undefined) return <TileSkeleton height={360} />;
  if (data === null) {
    return (
      <EmptyState
        icon="!"
        title={t.loadFailed}
        action={<Button variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>{t.retry}</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={t.title}
        sub={t.sub}
        actions={
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? t.saving : t.save}
          </Button>
        }
      />

      {status === "saved" && (
        <div style={{ marginBottom: 16 }}><Chip tone="mint">{t.saved}</Chip></div>
      )}
      {status === "failed" && (
        <div style={{ marginBottom: 16 }}><Chip tone="hard">{t.failed}</Chip></div>
      )}

      <div className="bento">
        <Tile span={6}>
          <Field label={t.baseAz} htmlFor="base_prompt_az">
            <Textarea
              id="base_prompt_az"
              rows={18}
              value={az}
              onChange={(e) => setAz(e.target.value)}
            />
          </Field>
        </Tile>
        <Tile span={6}>
          <Field label={t.baseEn} htmlFor="base_prompt_en">
            <Textarea
              id="base_prompt_en"
              rows={18}
              value={en}
              onChange={(e) => setEn(e.target.value)}
            />
          </Field>
        </Tile>
      </div>

      {data.updated_at && (
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--ink-3)" }}>
          {t.updatedAt}: {new Date(data.updated_at).toLocaleString(lang === "az" ? "az-AZ" : "en-US")}
        </div>
      )}
    </div>
  );
}
