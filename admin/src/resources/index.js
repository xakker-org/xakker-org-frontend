import categories from "./categories";
import roomTags from "./roomTags";
import courses from "./courses";
import rooms from "./rooms";
import tasks from "./tasks";
import taskQuestions from "./taskQuestions";
import lessons from "./lessons";
import lessonQuestions from "./lessonQuestions";
import questions from "./questions";
import plans from "./plans";
import missions from "./missions";
import missionPasses from "./missionPasses";
import missionExams from "./missionExams";
import missionExamQuestions from "./missionExamQuestions";

const REGISTRY = {
  categories,
  "room-tags": roomTags,
  courses,
  rooms,
  tasks,
  "task-questions": taskQuestions,
  lessons,
  "lesson-questions": lessonQuestions,
  questions,
  plans,
  missions,
  "mission-passes": missionPasses,
  "mission-exams": missionExams,
  "mission-exam-questions": missionExamQuestions,
};

export function getResource(type) {
  return REGISTRY[type];
}

export default REGISTRY;
