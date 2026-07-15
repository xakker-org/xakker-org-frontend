import categories from "./categories";
import roomTags from "./roomTags";
import courses from "./courses";
import rooms from "./rooms";
import tasks from "./tasks";
import taskQuestions from "./taskQuestions";
import lessons from "./lessons";
import lessonQuestions from "./lessonQuestions";
import plans from "./plans";
import missions from "./missions";
import missionPasses from "./missionPasses";
import missionExams from "./missionExams";
import missionExamQuestions from "./missionExamQuestions";
import assistantPromptNotes from "./assistantPromptNotes";

const REGISTRY = {
  categories,
  "room-tags": roomTags,
  courses,
  rooms,
  tasks,
  "task-questions": taskQuestions,
  lessons,
  "lesson-questions": lessonQuestions,
  plans,
  missions,
  "mission-passes": missionPasses,
  "mission-exams": missionExams,
  "mission-exam-questions": missionExamQuestions,
  "assistant-prompt-notes": assistantPromptNotes,
};

export function getResource(type) {
  return REGISTRY[type];
}

export default REGISTRY;
