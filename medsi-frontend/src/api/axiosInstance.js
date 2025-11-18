import axios from "axios";

const isBrowser = typeof window !== "undefined";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (isBrowser ? window.location.origin : "http://localhost:8080"),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach bearer token from localStorage (if present) for browser requests
API.interceptors.request.use((config) => {
  if (isBrowser) {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
