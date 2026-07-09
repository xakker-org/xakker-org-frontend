import { questions } from "../services/adminApi";
import QuestionForm from "../components/forms/QuestionForm";

export default {
  key: "questions",
  title: { az: "Sərbəst Tədris Sualları", en: "Self-Study Questions" },
  endpoint: questions,
  editMode: "route",
  FormComponent: QuestionForm,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "❓",
  emptyDescription: {
    az: "Sərbəst tədris sualları tələbələrin öz sürətiylə məşq etdiyi bank sualdır.",
    en: "Self-study questions are the practice bank students work through at their own pace.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    { key: "course_title", header: { az: "Kurs", en: "Course" } },
    { key: "question_type", header: { az: "Növ", en: "Type" } },
    { key: "level", header: { az: "Səviyyə", en: "Level" } },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right", sortable: true },
  ],
};
