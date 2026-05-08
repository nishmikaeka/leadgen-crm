import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// ── Request interceptor: attach Bearer token ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── 401 silent refresh logic ───────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue while a refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // httpOnly cookie carries the refresh token – no body needed
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken, user } = res.data?.data ?? {};
        if (!accessToken) throw new Error("No access token in refresh response");

        // Persist new token, keeping existing user if refresh didn't return one
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(user || currentUser, accessToken);

        // Update default header and retry queued requests
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh itself failed – force logout
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage =
      error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(errorMessage));
  },
);

export default api;
