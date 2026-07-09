import { missionPasses } from "../services/adminApi";

export default {
  key: "mission-passes",
  title: { az: "Mission Pass-ları", en: "Mission Passes" },
  endpoint: missionPasses,
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" } },
    { key: "order", header: { az: "Sıra", en: "Order" }, align: "right" },
    { key: "estimated_minutes", header: { az: "Müddət", en: "Minutes" }, align: "right" },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "content", type: "richtext", label: { az: "Məzmun (HTML)", en: "Content (HTML)" }, required: true },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
    { name: "estimated_minutes", type: "number", label: { az: "Müddət (dəq)", en: "Est. minutes" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
