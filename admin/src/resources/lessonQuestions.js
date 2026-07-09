import { lessonQuestions } from "../services/adminApi";

export default {
  key: "lesson-questions",
  title: { az: "Dərs Sualları", en: "Lesson Questions" },
  endpoint: lessonQuestions,
  columns: [
    { key: "text", header: { az: "Sual", en: "Question" } },
    { key: "at_seconds", header: { az: "Vaxt (san)", en: "At (sec)" }, align: "right" },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right" },
  ],
  formFields: [
    { name: "text", type: "textarea", label: { az: "Sual", en: "Question" }, required: true },
    { name: "explanation", type: "textarea", label: { az: "İzah", en: "Explanation" } },
    { name: "at_seconds", type: "number", label: { az: "Video vaxtı (san)", en: "Video timestamp (sec)" } },
    { name: "points", type: "number", label: { az: "Xal", en: "Points" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
  ],
};
