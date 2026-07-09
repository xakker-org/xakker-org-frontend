import { useLang } from "../../contexts/LanguageContext";
import lessonQuestionsConfig from "../../resources/lessonQuestions";
import LessonQuestionForm from "../forms/LessonQuestionForm";
import InlineResourceList from "../InlineResourceList";

export default function LessonQuestionsChildren({ record }) {
  const { lang } = useLang();
  return (
    <InlineResourceList
      config={lessonQuestionsConfig}
      parentFilter={{ lesson: record.id }}
      title={lang === "az" ? "Suallar" : "Questions"}
      FormComponent={LessonQuestionForm}
      emptyIcon="❓"
      emptyDescription={
        lang === "az"
          ? "Bu dərs üçün hələ sual yoxdur. Videoya aid çoxseçimli sual əlavə edin."
          : "This lesson has no questions yet. Add a multiple-choice question tied to the video."
      }
    />
  );
}
