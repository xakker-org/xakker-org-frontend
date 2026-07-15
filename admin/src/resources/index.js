import categories from "./categories";
import roomTags from "./roomTags";
import courses from "./courses";
import rooms from "./rooms";
import tasks from "./tasks";
import taskQuestions from "./taskQuestions";
import lessons from "./lessons";
import lessonQuestions from "./lessonQuestions";
import plans from "./plans";
import assistantPromptNotes from "./assistantPromptNotes";
import ctfMissions from "./ctfMissions";
import ctfMissionCategories from "./ctfMissionCategories";
import ctfMissionTags from "./ctfMissionTags";

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
  "assistant-prompt-notes": assistantPromptNotes,
  "ctf-missions": ctfMissions,
  "ctf-mission-categories": ctfMissionCategories,
  "ctf-mission-tags": ctfMissionTags,
};

export function getResource(type) {
  return REGISTRY[type];
}

export default REGISTRY;
