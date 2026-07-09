import { missions, missionExams } from "../services/adminApi";
import MissionExamChildren from "../components/children/MissionExamChildren";
import missionsConfig from "./missions";

export default {
  key: "mission-exams",
  title: { az: "Mission İmtahanları", en: "Mission Exams" },
  endpoint: missionExams,
  editMode: "route",
  Children: MissionExamChildren,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "📝",
  emptyDescription: {
    az: "İmtahanlar konkret missiyalara bağlıdır. Yeni imtahan üçün Missiyalar bölməsindən keçin.",
    en: "Exams belong to a specific mission. Manage them from the Missions section.",
  },
  filters: [],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" } },
    { key: "mission_title", header: { az: "Missiya", en: "Mission" } },
    { key: "question_count", header: { az: "Suallar", en: "Questions" }, align: "center" },
    { key: "passing_score", header: { az: "Keçid faizi", en: "Passing %" }, align: "right" },
  ],
  formFields: [
    {
      name: "mission", type: "relation", endpoint: missions, labelKey: "title",
      label: { az: "Missiya", en: "Mission" },
      quickCreateFields: missionsConfig.formFields,
      quickCreateTitle: missionsConfig.title,
    },
    { name: "title", type: "text", label: { az: "Başlıq", en: "Title" }, required: true },
    { name: "description", type: "textarea", label: { az: "Təsvir", en: "Description" } },
    { name: "passing_score", type: "number", label: { az: "Keçid faizi (0-100)", en: "Passing score (0-100)" } },
    { name: "time_limit_minutes", type: "number", label: { az: "Vaxt limiti (dəq, 0=limitsiz)", en: "Time limit (min, 0=none)" } },
    { name: "max_attempts", type: "number", label: { az: "Maks cəhd (0=limitsiz)", en: "Max attempts (0=unlimited)" } },
    { name: "xp_reward", type: "number", label: { az: "XP mükafatı", en: "XP reward" } },
    { name: "is_published", type: "boolean", label: { az: "Yayımlanıb", en: "Published" } },
  ],
};
