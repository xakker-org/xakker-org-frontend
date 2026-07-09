import { roomTags } from "../services/adminApi";

export default {
  key: "room-tags",
  title: { az: "Teqlər", en: "Tags" },
  endpoint: roomTags,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  filters: [],
  emptyIcon: "🏷️",
  emptyDescription: {
    az: "Teqlər otaqları texnologiyaya görə etiketləyir (məs. nmap, SQLi, XSS).",
    en: "Tags label rooms by technology or technique (e.g. nmap, SQLi, XSS).",
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
