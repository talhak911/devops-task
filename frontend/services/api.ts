import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://task-manager-talha.vercel.app";

// Create an Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Backend URL
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Request Interceptor: Attach access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s and token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints (login/register) should NEVER trigger a refresh.
    // Also skip if we've already retried once or there's no token (user is not logged in).
    const isAuthEndpoint =
      originalRequest.url?.includes("/users/login") ||
      originalRequest.url?.includes("/users/register") ||
      originalRequest.url?.includes("/users/refresh");

    const hasToken = !!localStorage.getItem("token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      hasToken
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axios.post(
          `${API_BASE_URL}/api/users/refresh`,
          {},
          { withCredentials: true },
        );

        if (res.data.success) {
          const newToken = res.data.data.token;
          // Store new token
          localStorage.setItem("token", newToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed (expired/invalid) — clean up and redirect
        localStorage.removeItem("token");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
