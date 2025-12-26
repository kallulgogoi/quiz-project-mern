import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Matches server.js PORT
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verify: "/auth/verify-otp",
    me: "/auth/me",
  },
  quiz: {
    create: "/quizzes",
    myQuizzes: (type) => `/quizzes/my-quizzes?type=${type}`,
    getByCode: (code) => `/quizzes/code/${code}`,
    getById: (id) => `/quizzes/${id}`,
    join: "/quizzes/join",
    start: (id) => `/quizzes/${id}/start`,
    submit: (id) => `/quizzes/${id}/submit`,
    leaderboard: (id) => `/quizzes/${id}/leaderboard`,
    startLive: (id) => `/quizzes/${id}/start-live`,
    endLive: (id) => `/quizzes/${id}/end-live`,
  },
  ai: {
    generate: "/ai/generate-questions",
    save: (id) => `/ai/save-questions/${id}`,
  },
};

export default api;
