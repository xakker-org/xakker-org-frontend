import { missions } from "../services/adminApi";
import MissionChildren from "../components/children/MissionChildren";

const DIFFICULTY_CHOICES = ["easy", "medium", "hard", "expert"];

export default {
  key: "missions",
  title: { az: "Missiyalar", en: "Missions" },
  endpoint: missions,
  editMode: "route",
  Children: MissionChildren,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🎯",
  emptyDescription: {
    az: "Missiyalar addım-addım pass-lardan və yekun imtahandan ibarət kampaniyalardır.",
    en: "Missions are step-by-step campaigns made of passes and a final exam.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "difficulty", header: { az: "Çətinlik", en: "Difficulty" } },
    { key: "pass_count", header: { az: "Pass-lar", en: "Passes" }, align: "center" },
    { key: "xp_reward", header: "XP", align: "right", sortable: true },
    { key: "is_published", header: { az: "Vəziyyət", en: "Status" }, align: "center" },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "slug", type: "slug", from: "title", label: "Slug" },
    { name: "short_description", type: "text", label: { az: "Qısa təsvir", en: "Short description" } },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" }, required: true },
    { name: "difficulty", type: "select", options: DIFFICULTY_CHOICES, label: { az: "Çətinlik", en: "Difficulty" } },
    { name: "icon", type: "text", label: { az: "İkon (emoji)", en: "Icon (emoji)" } },
    { name: "cover_color", type: "text", label: { az: "Rəng", en: "Cover color" } },
    { name: "estimated_hours", type: "number", label: { az: "Təxmini saat", en: "Est. hours" } },
    { name: "xp_reward", type: "number", label: { az: "XP mükafatı", en: "XP reward" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
