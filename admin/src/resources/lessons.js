import { courses, lessons } from "../services/adminApi";
import LessonQuestionsChildren from "../components/children/LessonQuestionsChildren";
import coursesConfig from "./courses";

export default {
  key: "lessons",
  title: { az: "Dərslər", en: "Lessons" },
  endpoint: lessons,
  editMode: "route",
  Children: LessonQuestionsChildren,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "📖",
  emptyDescription: {
    az: "Dərslər video-əsaslı kurs məzmunudur. İlk dərsi yaradaraq başlayın.",
    en: "Lessons are video-based course content. Start by creating your first lesson.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "course_title", header: { az: "Kurs", en: "Course" } },
    { key: "question_count", header: { az: "Suallar", en: "Questions" }, align: "center" },
    { key: "order", header: { az: "Sıra", en: "Order" }, align: "right", sortable: true },
  ],
  formFields: [
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    {
      name: "course", type: "relation", endpoint: courses, labelKey: "title",
      label: { az: "Kurs", en: "Course" },
      quickCreateFields: coursesConfig.formFields,
      quickCreateTitle: coursesConfig.title,
    },
    { name: "video_url", type: "text", label: { az: "Video URL", en: "Video URL" } },
    { name: "content", type: "richtext", label: { az: "Məzmun", en: "Content" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
  ],
};
