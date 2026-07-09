import { taskQuestions } from "../services/adminApi";

const KIND_CHOICES = ["text", "flag", "choice", "numeric", "review"];

export default {
  key: "task-questions",
  title: { az: "Task Sualları", en: "Task Questions" },
  endpoint: taskQuestions,
  kindChoices: KIND_CHOICES,
  columns: [
    { key: "prompt", header: { az: "Sual", en: "Prompt" } },
    { key: "kind", header: { az: "Növ", en: "Kind" } },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right" },
  ],
  formFields: [
    { name: "prompt", type: "textarea", label: { az: "Sual", en: "Prompt" }, required: true },
    { name: "kind", type: "select", options: KIND_CHOICES, label: { az: "Növ", en: "Kind" } },
    { name: "answer", type: "text", label: { az: "Cavab", en: "Answer" } },
    { name: "hint", type: "textarea", label: { az: "İpucu", en: "Hint" } },
    { name: "hint_cost", type: "number", label: { az: "İpucu qiyməti", en: "Hint cost" } },
    { name: "explanation", type: "textarea", label: { az: "İzah", en: "Explanation" } },
    { name: "points", type: "number", label: { az: "Xal", en: "Points" } },
    { name: "order", type: "number", label: { az: "Sıra", en: "Order" } },
    { name: "case_sensitive", type: "boolean", label: { az: "Böyük/kiçik hərf həssas", en: "Case sensitive" } },
  ],
};
