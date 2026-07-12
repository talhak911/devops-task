import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Public Pages
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminCategories from "./pages/admin/AdminCategories";

const THEME_KEY = "portal_theme";

const AppContent: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, newMode);
      return newMode;
    });
  };

  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/admin/login"].includes(location.pathname);
  const isAdminView = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return (
    <ThemeProvider theme={theme(mode)}>
      <CssBaseline />
      <Toaster position="top-center" />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        {!isAuthPage && !isAdminView && <Navbar mode={mode} toggleMode={toggleMode} />}
        <Box sx={{ flex: 1 }}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Panel (Protected) - Note: Pages already wrap themselves in AdminLayout */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/products/:id/edit" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminOrderDetail /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminAuditLog /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </CartProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
