import { assistantPromptNotes } from "../services/adminApi";

const LANG_CHOICES = ["az", "en", "both"];

export default {
  key: "assistant-prompt-notes",
  title: { az: "Prompt qeydləri", en: "Prompt notes" },
  endpoint: assistantPromptNotes,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🧠",
  emptyDescription: {
    az: "Prompt qeydləri Xakker AI-nin əsas sistem promptuna əlavə olunan qısa təlimatlardır.",
    en: "Prompt notes are short instructions appended to Xakker AI's base system prompt.",
  },
  filters: [
    {
      key: "is_active",
      label: { az: "Vəziyyət", en: "Status" },
      options: [
        { value: "", label: { az: "Hamısı", en: "All" } },
        { value: "true", label: { az: "Aktiv", en: "Active" } },
        { value: "false", label: { az: "Deaktiv", en: "Inactive" } },
      ],
    },
    {
      key: "lang",
      label: { az: "Dil", en: "Language" },
      options: [{ value: "", label: { az: "Hamısı", en: "All" } }, ...LANG_CHOICES.map((v) => ({ value: v, label: v }))],
    },
  ],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "lang", header: { az: "Dil", en: "Language" } },
    { key: "is_active", header: { az: "Aktiv", en: "Active" }, align: "center" },
    { key: "order", header: { az: "Sıra", en: "Order" }, align: "right", sortable: true },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "content", type: "textarea", label: { az: "Məzmun", en: "Content" }, required: true },
    { name: "lang", type: "select", options: LANG_CHOICES, label: { az: "Dil", en: "Language" } },
    { name: "is_active", type: "boolean", label: { az: "Aktiv", en: "Active" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
  ],
};
