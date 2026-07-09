import { useLang } from "../../contexts/LanguageContext";
import taskQuestionsConfig from "../../resources/taskQuestions";
import TaskQuestionForm from "../forms/TaskQuestionForm";
import InlineResourceList from "../InlineResourceList";

export default function TaskQuestionsChildren({ record }) {
  const { lang } = useLang();
  return (
    <InlineResourceList
      config={taskQuestionsConfig}
      parentFilter={{ task: record.id }}
      title={lang === "az" ? "Suallar" : "Questions"}
      FormComponent={TaskQuestionForm}
      emptyIcon="❓"
      emptyDescription={
        lang === "az"
          ? "Bu task üçün hələ sual yoxdur. Flag, mətn, ədəd və ya çoxseçimli sual əlavə edin."
          : "This task has no questions yet. Add a flag, text, numeric, or multiple-choice question."
      }
    />
  );
}
