import { useState } from "react";
import { useLang } from "../../contexts/LanguageContext";
import { ctfMissionCategories, ctfMissionTags, ctfMissions } from "../../services/adminApi";
import FieldRenderer from "../forms/FieldRenderer";
import TagMultiSelect from "../forms/TagMultiSelect";
import MarkdownEditor from "../ui/MarkdownEditor";
import Field from "../ui/Field";
import Tabs from "../ui/Tabs";
import Tile from "../ui/Tile";
import Button from "../ui/Button";
import { Chip } from "../ui/Chip";
import { slugify } from "../../utils/slugify";

const DIFFICULTY_CHOICES = ["easy", "medium", "hard", "expert"];
const STATUS_CHOICES = [
  { value: "draft", label: { az: "Qaralama", en: "Draft" } },
  { value: "published", label: { az: "Yayımda", en: "Published" } },
];

const T = {
  az: {
    tabMission: "Missiya",
    tabWriteup: "Write-up",
    title: "Başlıq",
    difficulty: "Çətinlik",
    category: "Kateqoriya",
    tags: "Teqlər",
    shortDesc: "Qısa təsvir",
    description: "Təsvir (markdown)",
    connectionInfo: "Qoşulma məlumatı (markdown)",
    points: "Xal",
    estimatedTime: "Təxmini müddət (dəq)",
    status: "Vəziyyət",
    flag: "Flag",
    flagPlaceholder: "Yeni flag daxil et (dəyişməmək üçün boş burax)",
    flagSet: "Flag təyin olunub",
    flagUnset: "Flag təyin olunmayıb",
    writeupContent: "Write-up mətni (markdown)",
    writeupLocked: "Standart olaraq kilidli",
    writeupHint: "Kilidli olsa, istifadəçi missiyanı həll edənə və ya \"unlock\" çağırana qədər write-up-ı görə bilməz.",
    save: "Yadda saxla",
    saving: "Yadda saxlanılır...",
    cancel: "İmtina",
  },
  en: {
    tabMission: "Mission",
    tabWriteup: "Write-up",
    title: "Title",
    difficulty: "Difficulty",
    category: "Category",
    tags: "Tags",
    shortDesc: "Short description",
    description: "Description (markdown)",
    connectionInfo: "Connection info (markdown)",
    points: "Points",
    estimatedTime: "Est. time (minutes)",
    status: "Status",
    flag: "Flag",
    flagPlaceholder: "Enter a new flag (leave blank to keep unchanged)",
    flagSet: "Flag is set",
    flagUnset: "No flag set",
    writeupContent: "Write-up content (markdown)",
    writeupLocked: "Locked by default",
    writeupHint: "While locked, users can't see the write-up until they solve the mission or call unlock.",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
  },
};

function buildInitial(record) {
  return {
    title: record?.title ?? "",
    slug: record?.slug ?? "",
    difficulty: record?.difficulty ?? "medium",
    category: record?.category?.id ?? record?.category ?? null,
    tags: (record?.tags ?? []).map((t) => (typeof t === "object" ? t.id : t)),
    short_description: record?.short_description ?? "",
    description: record?.description ?? "",
    connection_info: record?.connection_info ?? "",
    points: record?.points ?? 100,
    estimated_time: record?.estimated_time ?? 30,
    status: record?.status ?? "draft",
    flag: "",
    writeup: {
      content: record?.writeup?.content ?? "",
      is_locked_by_default: record?.writeup?.is_locked_by_default ?? true,
    },
  };
}

export default function CtfMissionForm({ id, record, onSaved, onCancel }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const isNew = !id;

  const [tab, setTab] = useState("mission");
  const [values, setValues] = useState(() => buildInitial(record));
  const [slugTouched, setSlugTouched] = useState(Boolean(record?.slug));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (name, v) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (name === "title" && !slugTouched) next.slug = slugify(v);
      return next;
    });
    if (name === "slug") setSlugTouched(true);
  };

  const setWriteup = (patch) => setValues((prev) => ({ ...prev, writeup: { ...prev.writeup, ...patch } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const payload = {
      title: values.title,
      slug: values.slug,
      difficulty: values.difficulty,
      category: values.category || null,
      tags: values.tags,
      short_description: values.short_description,
      description: values.description,
      connection_info: values.connection_info,
      points: values.points,
      estimated_time: values.estimated_time,
      status: values.status,
      writeup: { content: values.writeup.content, is_locked_by_default: values.writeup.is_locked_by_default },
    };
    if (values.flag) payload.flag = values.flag;

    try {
      if (isNew) await ctfMissions.create(payload);
      else await ctfMissions.update(id, payload);
      onSaved();
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  const tabOptions = [
    { value: "mission", label: t.tabMission },
    { value: "writeup", label: t.tabWriteup },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={tab} onChange={setTab} options={tabOptions} ariaLabel="ctf-mission-tabs" />
      <div style={{ height: "var(--s5)" }} />

      {tab === "mission" && (
        <Tile pad="lg">
          <div className="form-grid">
            <FieldRenderer field={{ name: "title", type: "text", label: t.title, required: true }} value={values.title} onChange={(v) => set("title", v)} error={errors.title?.[0]} />
            <FieldRenderer field={{ name: "slug", type: "slug", label: "Slug" }} value={values.slug} onChange={(v) => set("slug", v)} error={errors.slug?.[0]} />
            <FieldRenderer field={{ name: "difficulty", type: "select", options: DIFFICULTY_CHOICES, label: t.difficulty }} value={values.difficulty} onChange={(v) => set("difficulty", v)} error={errors.difficulty?.[0]} />
            <FieldRenderer
              field={{ name: "category", type: "relation", endpoint: ctfMissionCategories, labelKey: "name", label: t.category }}
              value={values.category}
              onChange={(v) => set("category", v)}
              error={errors.category?.[0]}
            />
            <Field label={t.tags}>
              <TagMultiSelect endpoint={ctfMissionTags} value={values.tags} onChange={(v) => set("tags", v)} />
            </Field>
            <FieldRenderer field={{ name: "short_description", type: "text", label: t.shortDesc }} value={values.short_description} onChange={(v) => set("short_description", v)} error={errors.short_description?.[0]} />
            <FieldRenderer field={{ name: "description", type: "richtext", label: t.description }} value={values.description} onChange={(v) => set("description", v)} error={errors.description?.[0]} />
            <FieldRenderer field={{ name: "connection_info", type: "richtext", label: t.connectionInfo }} value={values.connection_info} onChange={(v) => set("connection_info", v)} error={errors.connection_info?.[0]} />
            <FieldRenderer field={{ name: "points", type: "number", label: t.points }} value={values.points} onChange={(v) => set("points", v)} error={errors.points?.[0]} />
            <FieldRenderer field={{ name: "estimated_time", type: "number", label: t.estimatedTime }} value={values.estimated_time} onChange={(v) => set("estimated_time", v)} error={errors.estimated_time?.[0]} />
            <FieldRenderer field={{ name: "status", type: "select", options: STATUS_CHOICES.map((s) => ({ value: s.value, label: s.label[lang] || s.label.az })), label: t.status }} value={values.status} onChange={(v) => set("status", v)} error={errors.status?.[0]} />

            <Field label={t.flag} error={errors.flag?.[0]}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  type="text"
                  value={values.flag}
                  onChange={(e) => set("flag", e.target.value)}
                  placeholder={t.flagPlaceholder}
                  autoComplete="off"
                />
                <Chip tone={record?.has_flag ? "mint" : "coral"} size="sm">
                  {record?.has_flag ? t.flagSet : t.flagUnset}
                </Chip>
              </div>
            </Field>
          </div>
        </Tile>
      )}

      {tab === "writeup" && (
        <Tile pad="lg">
          <div className="form-grid">
            <Field label={t.writeupContent}>
              <MarkdownEditor value={values.writeup.content} onChange={(v) => setWriteup({ content: v })} rows={16} />
            </Field>
            <div
              className={`toggle-row${values.writeup.is_locked_by_default ? " is-on" : ""}`}
              onClick={() => setWriteup({ is_locked_by_default: !values.writeup.is_locked_by_default })}
            >
              <span className="toggle-switch" />
              <span>{t.writeupLocked}</span>
            </div>
            <p className="field-hint" style={{ marginTop: -6 }}>{t.writeupHint}</p>
          </div>
        </Tile>
      )}

      <div className="drawer-footer" style={{ padding: 0, border: "none", marginTop: 20 }}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>{t.cancel}</Button>
        )}
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
