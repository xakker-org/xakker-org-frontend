import api from "./api";

export const endpoints = {
  me: () => api.get("/auth/me/"),
  requestPasswordReset: (email) => api.post("/auth/password-reset/", { email }),
  verifyPasswordResetCode: (email, code) => api.post("/auth/password-reset/verify/", { email, code }),
  confirmPasswordReset: (email, code, newPassword) =>
    api.post("/auth/password-reset/confirm/", { email, code, new_password: newPassword }),
  myProfile: () => api.get("/auth/profile/"),
  updateProfile: (payload) => api.patch("/auth/profile/", payload),
  publicProfile: (username) => api.get(`/auth/profile/${encodeURIComponent(username)}/`),
  myActivity: (limit = 50) => api.get(`/auth/activity/?limit=${limit}`),
  leaderboard: (limit = 50) => api.get(`/auth/leaderboard/?limit=${limit}`),

  cabinet: () => api.get("/courses/cabinet/"),
  categories: () => api.get("/courses/categories/"),

  rooms: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/courses/rooms/${suffix}`);
  },
  roomTags: () => api.get("/courses/rooms/tags/"),
  room: (slug) => api.get(`/courses/rooms/${slug}/`),
  enrollRoom: (slug) => api.post(`/courses/rooms/${slug}/enroll/`),
  task: (roomSlug, taskSlug) => api.get(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/`),
  submitAnswer: (roomSlug, taskSlug, payload) =>
    api.post(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/answer/`, payload),
  revealHint: (roomSlug, taskSlug, questionId) =>
    api.post(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/hint/${questionId}/`),

  plans: () => api.get("/courses/plans/"),
  plan: (slug) => api.get(`/courses/plans/${slug}/`),

  // Profile extended endpoints
  profileStats: () => api.get("/auth/profile/stats/"),
  activityGraph: (year = null) => api.get(`/auth/profile/activity-graph/${year ? `?year=${year}` : ""}`),
  recentStudyActivity: (limit = 20) => api.get(`/auth/profile/recent-activity/?limit=${limit}`),

  // Courses and lessons
  courses: () => api.get("/courses/"),
  courseDetail: (slug) => api.get(`/courses/${slug}/`),
  lessonDetail: (courseSlug, lessonId) => api.get(`/courses/${courseSlug}/lessons/${lessonId}/`),
  completeLesson: (courseSlug, lessonId) => api.post(`/courses/${courseSlug}/lessons/${lessonId}/complete/`),
  submitLessonQuestion: (courseSlug, lessonId, questionId, payload) =>
    api.post(`/courses/${courseSlug}/lessons/${lessonId}/questions/${questionId}/submit/`, payload),

  // ── CTF Missions (Round 19) — /api/missions/, replaces the old
  // passes+exam "courses.Mission" user flow entirely. NOTE: this is a
  // different backend app (`ctf`) than /api/courses/... — no naming
  // collision, the old courses.Mission endpoints below no longer have
  // any caller in the user app (grepped clean) and were removed.
  missionsList: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/missions/${suffix}`);
  },
  missionDetail: (slug) => api.get(`/missions/${slug}/`),
  submitFlag: (slug, flag) => api.post(`/missions/${slug}/submit-flag/`, { flag }),
  unlockWriteup: (slug) => api.post(`/missions/${slug}/unlock-writeup/`),

  // ── Xakker AI (chatbot) ──────────────────────────────────
  aiChatSend: ({ conversation_id, message, lang }) =>
    api.post("/ai-chat/message", { conversation_id: conversation_id ?? null, message, lang: lang || "az" }),
  aiChatConversations: () => api.get("/ai-chat/conversations"),
  aiChatConversation: (id) => api.get(`/ai-chat/conversations/${id}`),
  aiChatDeleteConversation: (id) => api.delete(`/ai-chat/conversations/${id}`),
};
