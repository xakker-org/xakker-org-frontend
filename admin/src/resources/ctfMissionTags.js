import { ctfMissionTags } from "../services/adminApi";

export default {
  key: "ctf-mission-tags",
  title: { az: "CTF Teqləri", en: "CTF Tags" },
  endpoint: ctfMissionTags,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  filters: [],
  emptyIcon: "🏷️",
  emptyDescription: {
    az: "Teqlər CTF missiyalarını texnika/texnologiyaya görə etiketləyir (məs. SQLi, XSS, Buffer Overflow).",
    en: "Tags label CTF missions by technique or technology (e.g. SQLi, XSS, Buffer Overflow).",
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
