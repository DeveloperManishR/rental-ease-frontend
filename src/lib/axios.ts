import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, // send cookies automatically
  headers: { "Content-Type": "application/json" },
});

// ─── Response interceptor: auto-refresh on 401 ───
let isRefreshing = false;
let failedQueue: {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(undefined);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for "Access token expired" 401s
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token expired" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${api.defaults.baseURL}/public/refresh-token`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Redirect to login on refresh failure
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
