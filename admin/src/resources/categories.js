import { categories } from "../services/adminApi";

export default {
  key: "categories",
  title: { az: "Kateqoriyalar", en: "Categories" },
  endpoint: categories,
  editMode: "drawer",
  rowKey: (r) => r.id,
  search: true,
  filters: [],
  emptyIcon: "🛡️",
  emptyDescription: {
    az: "Kateqoriyalar kursları qruplaşdırmağa kömək edir (məs. Veb Təhlükəsizlik, Şəbəkə).",
    en: "Categories group courses together (e.g. Web Security, Networking).",
  },
  columns: [
    { key: "icon", header: { az: "İkon", en: "Icon" }, width: 60 },
    { key: "name", header: { az: "Ad", en: "Name" }, sortable: true },
    { key: "slug", header: "Slug" },
    { key: "description", header: { az: "Təsvir", en: "Description" } },
  ],
  formFields: [
    { name: "name", type: "text", label: { az: "Ad", en: "Name" }, required: true },
    { name: "slug", type: "slug", from: "name", label: "Slug" },
    { name: "icon", type: "text", label: { az: "İkon (emoji)", en: "Icon (emoji)" } },
    { name: "color", type: "text", label: { az: "Rəng", en: "Color" } },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" } },
  ],
};
