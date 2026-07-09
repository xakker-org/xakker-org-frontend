import { categories, courses } from "../services/adminApi";
import { publishedColumn, publishedFilter } from "./helpers.jsx";
import categoriesConfig from "./categories";

export default {
  key: "courses",
  title: { az: "Kurslar", en: "Courses" },
  endpoint: courses,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  filters: [publishedFilter],
  emptyIcon: "📘",
  emptyDescription: {
    az: "Kurslar dərsləri və otaqları qruplaşdırır. İlk kursu yaradaraq başlayın.",
    en: "Courses group lessons and rooms together. Start by creating your first course.",
  },
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "category_name", header: { az: "Kateqoriya", en: "Category" } },
    { key: "lesson_count", header: { az: "Dərslər", en: "Lessons" }, align: "center" },
    { key: "room_count", header: { az: "Otaqlar", en: "Rooms" }, align: "center" },
    publishedColumn(),
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "slug", type: "slug", from: "title", label: "Slug" },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" }, required: true },
    {
      name: "category", type: "relation", endpoint: categories, labelKey: "name",
      label: { az: "Kateqoriya", en: "Category" },
      quickCreateFields: categoriesConfig.formFields,
      quickCreateTitle: categoriesConfig.title,
    },
    { name: "icon", type: "text", label: { az: "İkon (emoji)", en: "Icon (emoji)" } },
    { name: "cover_color", type: "text", label: { az: "Rəng", en: "Cover color" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
