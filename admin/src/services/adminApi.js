import api from "./api";
import { createResource } from "./createResource";

export const auth = {
  login: (username, password) => api.post("/admin/auth/login/", { username, password }),
  me: () => api.get("/admin/auth/me/"),
};

export const analytics = {
  overview: () => api.get("/admin/analytics/overview/"),
  content: () => api.get("/admin/analytics/content/"),
  activity: (days = 30) => api.get(`/admin/analytics/activity/?days=${days}`),
};

export const categories = createResource("/admin/categories/");
export const roomTags = createResource("/admin/room-tags/");
export const courses = createResource("/admin/courses/");
export const rooms = createResource("/admin/rooms/");
export const tasks = createResource("/admin/tasks/");
export const taskQuestions = createResource("/admin/task-questions/");
export const lessons = createResource("/admin/lessons/");
export const lessonQuestions = createResource("/admin/lesson-questions/");
export const plans = createResource("/admin/plans/");
export const ctfMissions = createResource("/admin/ctf-missions/");
export const ctfMissionCategories = createResource("/admin/ctf-mission-categories/");
export const ctfMissionTags = createResource("/admin/ctf-mission-tags/");

const usersResource = createResource("/admin/users/");
export const users = {
  ...usersResource,
  awardXp: (id, amount) => api.post(`/admin/users/${id}/award_xp/`, { amount }),
  setActive: (id, value) => api.post(`/admin/users/${id}/set_active/`, { value }),
  setStaff: (id, value) => api.post(`/admin/users/${id}/set_staff/`, { value }),
  resetStreak: (id) => api.post(`/admin/users/${id}/reset_streak/`),
};

export const progress = {
  tasks: createResource("/admin/progress/tasks/"),
  taskQuestionAttempts: createResource("/admin/progress/task-question-attempts/"),
  lessons: createResource("/admin/progress/lessons/"),
  missions: createResource("/admin/progress/missions/"),
  missionExamAttempts: createResource("/admin/progress/mission-exam-attempts/"),
  enrollments: createResource("/admin/progress/enrollments/"),
  ctfMissions: createResource("/admin/progress/ctf-missions/"),
};

export const auditLogs = createResource("/admin/audit-logs/");

export const assistantPromptNotes = createResource("/admin/assistant-prompt-notes/");
export const assistantPrompt = {
  get: () => api.get("/admin/assistant-prompt/"),
  update: (data) => api.put("/admin/assistant-prompt/", data),
};
