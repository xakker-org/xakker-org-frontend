import { ctfMissionCategories } from "../services/adminApi";

export default {
  key: "ctf-mission-categories",
  title: { az: "CTF Kateqoriyaları", en: "CTF Categories" },
  endpoint: ctfMissionCategories,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  filters: [],
  emptyIcon: "🗂️",
  emptyDescription: {
    az: "Kateqoriyalar CTF missiyalarını mövzuya görə qruplaşdırır (məs. Web, Kripto, Pwn).",
    en: "Categories group CTF missions by topic (e.g. Web, Crypto, Pwn).",
  },
  columns: [
    { key: "name", header: { az: "Ad", en: "Name" }, sortable: true },
    { key: "slug", header: "Slug" },
  ],
  formFields: [
    { name: "name", type: "text", label: { az: "Ad", en: "Name" }, required: true },
    { name: "slug", type: "slug", from: "name", label: "Slug" },
  ],
};
