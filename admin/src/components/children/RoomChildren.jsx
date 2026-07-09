import { useLang } from "../../contexts/LanguageContext";
import tasksConfig from "../../resources/tasks";
import InlineResourceList from "../InlineResourceList";

export default function RoomChildren({ record }) {
  const { lang } = useLang();

  return (
    <InlineResourceList
      config={{ ...tasksConfig, formFields: tasksConfig.formFields.filter((f) => f.name !== "room") }}
      parentFilter={{ room: record.id }}
      title={lang === "az" ? "Tasklar" : "Tasks"}
      linkTo={(row) => `/content/tasks/${row.id}`}
      emptyIcon="🧩"
      emptyDescription={
        lang === "az"
          ? "Bu otaqda hələ task yoxdur. Tələbələr üçün ilk tapşırığı yaradın."
          : "This room has no tasks yet. Create the first challenge for students."
      }
    />
  );
}
