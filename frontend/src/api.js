import axios from 'axios';

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://timetable-real.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
