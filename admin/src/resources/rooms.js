import { courses, rooms } from "../services/adminApi";
import { publishedColumn, publishedFilter } from "./helpers.jsx";
import RoomChildren from "../components/children/RoomChildren";
import coursesConfig from "./courses";

const ENV_CHOICES = ["docker", "vm", "linux", "windows", "web", "cloud"];
const LEVEL_CHOICES = ["beginner", "intermediate", "advanced"];

export default {
  key: "rooms",
  title: { az: "Otaqlar", en: "Rooms" },
  endpoint: rooms,
  editMode: "route",
  Children: RoomChildren,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🧪",
  emptyDescription: {
    az: "Otaqlar (CTF labları) tələbələrin real mühitdə hücum bacarıqlarını sınadığı yerdir.",
    en: "Rooms (CTF labs) are where students practice offensive skills in a real environment.",
  },
  filters: [
    publishedFilter,
    {
      key: "level",
      label: { az: "Çətinlik", en: "Level" },
      options: [{ value: "", label: { az: "Hamısı", en: "All" } }, ...LEVEL_CHOICES.map((v) => ({ value: v, label: v }))],
    },
  ],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "course_title", header: { az: "Kurs", en: "Course" } },
    { key: "level", header: { az: "Çətinlik", en: "Level" } },
    { key: "env", header: { az: "Mühit", en: "Env" } },
    { key: "task_count", header: { az: "Tasklar", en: "Tasks" }, align: "center" },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right", sortable: true },
    publishedColumn(),
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "slug", type: "slug", from: "title", label: "Slug" },
    {
      name: "course", type: "relation", endpoint: courses, labelKey: "title",
      label: { az: "Kurs", en: "Course" },
      quickCreateFields: coursesConfig.formFields,
      quickCreateTitle: coursesConfig.title,
    },
    { name: "summary", type: "text", label: { az: "Qısa təsvir", en: "Summary" }, required: true },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" } },
    { name: "level", type: "select", options: LEVEL_CHOICES, label: { az: "Çətinlik", en: "Level" } },
    { name: "env", type: "select", options: ENV_CHOICES, label: { az: "Mühit", en: "Environment" } },
    { name: "target_ip", type: "text", label: { az: "Hədəf IP", en: "Target IP" } },
    { name: "estimated_minutes", type: "number", label: { az: "Müddət (dəq)", en: "Est. minutes" } },
    { name: "points", type: "number", label: { az: "Xal", en: "Points" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
    { name: "is_premium", type: "boolean", label: { az: "Premium", en: "Premium" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
