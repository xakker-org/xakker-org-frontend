import { plans } from "../services/adminApi";
import PlanCoursesEditor from "../components/children/PlanCoursesEditor";

const LEVEL_CHOICES = ["beginner", "intermediate", "advanced"];

export default {
  key: "plans",
  title: { az: "Öyrənmə Planları", en: "Learning Plans" },
  endpoint: plans,
  editMode: "route",
  Children: PlanCoursesEditor,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🧭",
  emptyDescription: {
    az: "Öyrənmə planları kursları sıralı bir yol halında birləşdirir.",
    en: "Learning plans string courses together into an ordered path.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "level", header: { az: "Səviyyə", en: "Level" } },
    { key: "course_count", header: { az: "Kurslar", en: "Courses" }, align: "center" },
    { key: "is_published", header: { az: "Vəziyyət", en: "Status" }, align: "center" },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "slug", type: "slug", from: "title", label: "Slug" },
    { name: "summary", type: "text", label: { az: "Qısa təsvir", en: "Summary" }, required: true },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" } },
    { name: "icon", type: "text", label: { az: "İkon (emoji)", en: "Icon (emoji)" } },
    { name: "level", type: "select", options: LEVEL_CHOICES, label: { az: "Səviyyə", en: "Level" } },
    { name: "estimated_hours", type: "number", label: { az: "Təxmini saat", en: "Est. hours" } },
    { name: "is_featured", type: "boolean", label: { az: "Seçilmiş", en: "Featured" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
