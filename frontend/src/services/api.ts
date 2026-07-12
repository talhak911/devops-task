import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: inject access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor: handle 401 → refresh flow ─────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register");
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.token;
        localStorage.setItem("access_token", newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        // Only redirect to login if we explicitly failed a refresh attempt on a non-background task
        // This prevents accidental logouts if Render is just temporarily down
        if (!originalRequest.url.includes("/unread-count")) {
           window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => api.post("/api/auth/register", { name, email, password }),
  getMe: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  refresh: () => api.post("/api/auth/refresh"),
};

// ─── Products ──────────────────────────────────────────────────────────────────
export interface ProductParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  flavor?: string;
  inStock?: boolean;
  tags?: string[];
}

export const productsApi = {
  getAll: (params?: ProductParams) => api.get("/api/v1/products", { params }),
  getOne: (id: string) => api.get(`/api/v1/products/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get("/api/v1/categories"),
  getOne: (idOrSlug: string) => api.get(`/api/v1/categories/${idOrSlug}`),
};

// ─── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  getCart: () => api.get("/api/v1/cart"),
  addItem: (productId: string, variantId: string, quantity: number = 1) =>
    api.post("/api/v1/cart/items", { productId, variantId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.patch(`/api/v1/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/api/v1/cart/items/${itemId}`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  createOrder: (data: { shippingAddress: Record<string, string>; idempotencyKey?: string }) =>
    api.post("/api/v1/orders", data),
  getOrders: (page = 1) => api.get("/api/v1/orders", { params: { page } }),
  getOrder: (id: string) => api.get(`/api/v1/orders/${id}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  // Analytics
  getAnalytics: (range = "30d") => api.get("/api/admin/analytics", { params: { range } }),
  // Products
  getProducts: (params?: Record<string, unknown>) => api.get("/api/admin/products", { params }),
  createProduct: (data: FormData | Record<string, unknown>) => api.post("/api/v1/products", data, {
     headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
  }),
  updateProduct: (id: string, data: FormData | Record<string, unknown>) => api.put(`/api/v1/products/${id}`, data, {
     headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
  }),
  deleteProduct: (id: string) => api.delete(`/api/v1/products/${id}`),
  addVariant: (productId: string, data: Record<string, unknown>) => api.post(`/api/admin/products/${productId}/variants`, data),
  updateVariant: (productId: string, variantId: string, data: Record<string, unknown>) =>
    api.put(`/api/admin/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId: string, variantId: string) =>
    api.delete(`/api/admin/products/${productId}/variants/${variantId}`),
  // Categories
  getCategories: (params?: Record<string, unknown>) => api.get("/api/v1/categories", { params: { ...params, admin: true } }),
  createCategory: (data: FormData | Record<string, unknown>) => api.post("/api/v1/categories", data, {
     headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
  }),
  updateCategory: (id: string, data: FormData | Record<string, unknown>) => api.put(`/api/v1/categories/${id}`, data, {
     headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
  }),
  deleteCategory: (id: string) => api.delete(`/api/v1/categories/${id}`),
  // Inventory
  getInventory: (params?: Record<string, unknown>) => api.get("/api/admin/inventory", { params }),
  adjustStock: (productId: string, variantId: string, delta: number, reason: string) =>
    api.post("/api/admin/inventory/adjust", { productId, variantId, delta, reason }),
  // Orders
  getOrders: (params?: Record<string, unknown>) => api.get("/api/admin/orders", { params }),
  getOrderDetail: (id: string) => api.get(`/api/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    api.patch(`/api/admin/orders/${id}/status`, { status, note }),
  cancelOrder: (id: string, reason: string) => api.post(`/api/admin/orders/${id}/cancel`, { reason }),
  // Users
  getUsers: (params?: Record<string, unknown>) => api.get("/api/admin/users", { params }),
  getUserDetail: (id: string) => api.get(`/api/admin/users/${id}`),
  blockUser: (id: string, blocked: boolean) => api.patch(`/api/admin/users/${id}/block`, { blocked }),
  // Admin accounts
  getAdmins: (params?: Record<string, unknown>) => api.get("/api/admin/accounts", { params }),
  createAdmin: (data: Record<string, unknown>) => api.post("/api/admin/accounts", data),
  updateAdmin: (id: string, data: Record<string, unknown>) => api.patch(`/api/admin/accounts/${id}`, data),
  deleteAdmin: (id: string) => api.delete(`/api/admin/accounts/${id}`),
  // Audit log
  getAuditLog: (params?: Record<string, unknown>) => api.get("/api/admin/audit", { params }),
};

export default api;
