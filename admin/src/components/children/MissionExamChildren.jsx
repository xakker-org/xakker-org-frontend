import { useLang } from "../../contexts/LanguageContext";
import missionExamQuestionsConfig from "../../resources/missionExamQuestions";
import MissionExamQuestionForm from "../forms/MissionExamQuestionForm";
import InlineResourceList from "../InlineResourceList";

export default function MissionExamChildren({ record }) {
  const { lang } = useLang();
  return (
    <InlineResourceList
      config={missionExamQuestionsConfig}
      parentFilter={{ exam: record.id }}
      title={lang === "az" ? "Suallar" : "Questions"}
      FormComponent={MissionExamQuestionForm}
      emptyIcon="📝"
      emptyDescription={
        lang === "az"
          ? "Bu imtahan üçün hələ sual yoxdur. Çoxseçimli və ya açıq sual əlavə edin."
          : "This exam has no questions yet. Add a closed or open-ended question."
      }
    />
  );
}
