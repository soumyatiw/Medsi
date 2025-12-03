import axios from "axios";

const isBrowser = typeof window !== "undefined";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (isBrowser ? "http://localhost:8080" : "http://localhost:8080"),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* -----------------------------------------------------
   1️⃣ Attach Access Token to Every Request
------------------------------------------------------*/
API.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -----------------------------------------------------
   2️⃣ Auto Refresh Token When Access Token Expired
------------------------------------------------------*/
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;

    // If request failed with 403 (expired token) & hasn't been retried yet
    if (
      error.response?.status === 403 &&
      !originalReq._retry &&
      isBrowser
    ) {
      originalReq._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call backend to refresh access token
        const res = await axios.post("http://localhost:8080/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        // Save new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request with fresh access token
        originalReq.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return API(originalReq);
      } catch (refreshErr) {
        console.error("Refresh token failed:", refreshErr);

        // CLEAR EVERYTHING → force login again
        localStorage.clear();
        if (isBrowser) window.location.href = "/login";

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
