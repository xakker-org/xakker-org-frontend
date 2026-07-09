import { courses, rooms, tasks } from "../services/adminApi";
import TaskQuestionsChildren from "../components/children/TaskQuestionsChildren";

// Kept minimal and standalone (not imported from ./rooms) to avoid a
// circular import: rooms.js -> RoomChildren.jsx -> this file.
const ROOM_QUICK_CREATE_FIELDS = [
  { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
  { name: "course", type: "relation", endpoint: courses, labelKey: "title", label: { az: "Kurs", en: "Course" } },
  { name: "summary", type: "text", label: { az: "Qısa təsvir", en: "Summary" }, required: true },
];

export default {
  key: "tasks",
  title: { az: "Tasklar", en: "Tasks" },
  endpoint: tasks,
  editMode: "route",
  Children: TaskQuestionsChildren,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🧩",
  emptyDescription: {
    az: "Tasklar konkret otaqlara bağlıdır. Yeni task üçün Otaqlar bölməsindən keçin.",
    en: "Tasks belong to a specific room. Manage them from the Rooms section.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "room_title", header: { az: "Otaq", en: "Room" } },
    { key: "question_count", header: { az: "Suallar", en: "Questions" }, align: "center" },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right", sortable: true },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "slug", type: "slug", from: "title", label: "Slug" },
    {
      name: "room", type: "relation", endpoint: rooms, labelKey: "title",
      label: { az: "Otaq", en: "Room" },
      quickCreateFields: ROOM_QUICK_CREATE_FIELDS,
      quickCreateTitle: { az: "Yeni Otaq", en: "New Room" },
    },
    { name: "content", type: "richtext", label: { az: "Məzmun (Markdown)", en: "Content (Markdown)" }, required: true },
    { name: "points", type: "number", label: { az: "Xal", en: "Points" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
  ],
};
