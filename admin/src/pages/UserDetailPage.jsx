import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { users } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Field, { Input, Textarea } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import Avatar from "../components/ui/Avatar";
import { TileSkeleton } from "../components/ui/Skeleton";

const T = {
  az: {
    back: "← İstifadəçilər", profile: "Profil", save: "Yadda saxla", saving: "Yadda saxlanılır...",
    fullName: "Ad Soyad", bio: "Bio", country: "Ölkə", city: "Şəhər",
    actions: "Əməliyyatlar", awardXp: "XP ver", amount: "Miqdar", give: "Ver",
    ban: "Blokla", unban: "Blokdan çıxar", makeStaff: "Staff et", removeStaff: "Staff-dan sil",
    resetStreak: "Seriyanı sıfırla", stats: "Statistika", xp: "XP", rank: "Rütbə", streak: "Seriya",
    tasksCompleted: "Tamamlanan tasklar", roomsCompleted: "Tamamlanan otaqlar",
  },
  en: {
    back: "← Users", profile: "Profile", save: "Save", saving: "Saving...",
    fullName: "Full name", bio: "Bio", country: "Country", city: "City",
    actions: "Actions", awardXp: "Award XP", amount: "Amount", give: "Give",
    ban: "Ban", unban: "Unban", makeStaff: "Make staff", removeStaff: "Remove staff",
    resetStreak: "Reset streak", stats: "Stats", xp: "XP", rank: "Rank", streak: "Streak",
    tasksCompleted: "Tasks completed", roomsCompleted: "Rooms completed",
  },
};

export default function UserDetailPage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [xpAmount, setXpAmount] = useState(50);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    users.get(id).then(({ data }) => setRecord(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading || !record) return <TileSkeleton height={320} />;

  const setField = (name, value) => setRecord((prev) => ({ ...prev, [name]: value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await users.update(id, {
        full_name: record.full_name,
        bio: record.bio,
        country: record.country,
        city: record.city,
      });
      load();
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (fn) => {
    setBusy(true);
    try { await fn(); load(); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        title={record.full_name || record.username}
        actions={<Button variant="ghost" onClick={() => navigate("/users")}>{t.back}</Button>}
      />

      <div className="bento">
        <Tile span={4} pad="lg">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Avatar user={record} size={56} rounded="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{record.username}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{record.email}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <Chip tone={record.is_active ? "mint" : "coral"}>{record.is_active ? "Active" : "Banned"}</Chip>
                {record.is_staff && <Chip tone="accent">{record.is_superuser ? "SUPERUSER" : "STAFF"}</Chip>}
              </div>
            </div>
          </div>

          <TileHead title={t.stats} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Stat label={t.xp} value={record.xp} size="sm" />
            <Stat label={t.rank} value={record.rank} size="sm" />
            <Stat label={t.streak} value={record.streak_days} size="sm" />
            <Stat label={t.tasksCompleted} value={record.tasks_completed} size="sm" />
          </div>
        </Tile>

        <Tile span={5} pad="lg">
          <TileHead title={t.profile} />
          <div className="form-grid">
            <Field label={t.fullName}>
              <Input value={record.full_name || ""} onChange={(e) => setField("full_name", e.target.value)} />
            </Field>
            <Field label={t.bio}>
              <Textarea rows={3} value={record.bio || ""} onChange={(e) => setField("bio", e.target.value)} />
            </Field>
            <div className="form-row">
              <Field label={t.country}>
                <Input value={record.country || ""} onChange={(e) => setField("country", e.target.value)} />
              </Field>
              <Field label={t.city}>
                <Input value={record.city || ""} onChange={(e) => setField("city", e.target.value)} />
              </Field>
            </div>
            <Button variant="accent" onClick={saveProfile} disabled={saving}>{saving ? t.saving : t.save}</Button>
          </div>
        </Tile>

        <Tile span={3} pad="lg">
          <TileHead title={t.actions} />
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Input type="number" value={xpAmount} onChange={(e) => setXpAmount(Number(e.target.value))} style={{ width: 90 }} />
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => runAction(() => users.awardXp(id, xpAmount))}
              >
                {t.awardXp}
              </Button>
            </div>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => runAction(() => users.setActive(id, !record.is_active))}
            >
              {record.is_active ? t.ban : t.unban}
            </Button>
            {me?.is_superuser && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => runAction(() => users.setStaff(id, !record.is_staff))}
              >
                {record.is_staff ? t.removeStaff : t.makeStaff}
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => runAction(() => users.resetStreak(id))}
            >
              {t.resetStreak}
            </Button>
          </div>
        </Tile>
      </div>
    </div>
  );
}
