import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const endpoints = {
  auth: {
    google: "/auth/google",
    me: "/auth/me",
    updateProfile: "/auth/profile",
  },
  quiz: {
    create: "/quizzes",
    myQuizzes: (type) => `/quizzes/my-quizzes?type=${type}`,
    getByCode: (code) => `/quizzes/code/${code}`,
    getById: (id) => `/quizzes/${id}`,
    update: (id) => `/quizzes/${id}`,
    delete: (id) => `/quizzes/${id}`,
    join: "/quizzes/join",
    start: (id) => `/quizzes/${id}/start`,
    submit: (id) => `/quizzes/${id}/submit`,
    leaderboard: (id) => `/quizzes/${id}/leaderboard`,
    startLive: (id) => `/quizzes/${id}/start-live`,
    endLive: (id) => `/quizzes/${id}/end-live`,
    attempt: (id) => `/quizzes/${id}/attempt`,
    allAttempts: (quizId) => `/quizzes/${quizId}/all-attempts`,
    attemptDetails: (attemptId) => `/quizzes/attempt-details/${attemptId}`,
  },
  questions: {
    add: (quizId) => `/questions/add/${quizId}`,
    update: (id) => `/questions/${id}`,
    delete: (id) => `/questions/${id}`,
    getById: (id) => `/questions/${id}`,
  },
  ai: {
    generate: "/ai/generate-questions",
    generateFromText: "/ai/generate-from-text",
    save: (id) => `/ai/save-questions/${id}`,
  },
};

export default api;
