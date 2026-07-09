import { missionExamQuestions } from "../services/adminApi";
import MissionExamQuestionForm from "../components/forms/MissionExamQuestionForm";

export default {
  key: "mission-exam-questions",
  title: { az: "İmtahan Sualları", en: "Exam Questions" },
  endpoint: missionExamQuestions,
  FormComponent: MissionExamQuestionForm,
  columns: [
    { key: "question_text", header: { az: "Sual", en: "Question" } },
    { key: "question_type", header: { az: "Növ", en: "Type" } },
    { key: "order", header: { az: "Sıra", en: "Order" }, align: "right" },
  ],
};
