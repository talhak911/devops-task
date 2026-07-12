import React, { useState } from "react";
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, useMediaQuery } from "@mui/material";
import { Dashboard, Inventory, ShoppingCart, People, AdminPanelSettings, Assessment, History, Menu as MenuIcon, Logout, Category, Storefront } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Products", icon: <Storefront />, path: "/admin/products" },
  { label: "Categories", icon: <Category />, path: "/admin/categories" },
  { label: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
  { label: "Inventory", icon: <Inventory />, path: "/admin/inventory" },
];

const superAdminItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/admin" },
  { label: "Customers", icon: <People />, path: "/admin/users" },
  { label: "Analytics", icon: <Assessment />, path: "/admin/analytics" },
  { label: "Audit Log", icon: <History />, path: "/admin/audit" },
  { label: "Admin Accounts", icon: <AdminPanelSettings />, path: "/admin/accounts" },
];

const AdminSidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "var(--color-bg-variant)" }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L28 16L40 20L28 24L24 36L20 24L8 20L20 16L24 4Z" fill="var(--color-primary)" />
        </svg>
        <Typography sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400, fontSize: "18px", color: "text.primary" }}>
          Admin Panel
        </Typography>
      </Box>
      <Divider />

      {/* User info */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "14px" }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, fontFamily: "Montserrat" }}>{user?.name}</Typography>
          <Typography sx={{ fontSize: "11px", color: "text.secondary", fontFamily: "Montserrat", textTransform: "capitalize" }}>{user?.role}</Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />

      {/* Nav items */}
      <List dense sx={{ flex: 1, px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            onClick={onClose}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 1, mb: 0.5,
              "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "primary.contrastText" } },
              "&.Mui-selected:hover": { bgcolor: "primary.dark" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? "inherit" : "text.secondary" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "14px", fontFamily: "Montserrat", fontWeight: 500 }} />
          </ListItemButton>
        ))}

        {isSuperAdmin() && (
          <>
            <Divider sx={{ my: 1 }} />
            {superAdminItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={onClose}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 1, mb: 0.5,
                  "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "primary.contrastText" } },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "14px", fontFamily: "Montserrat", fontWeight: 500 }} />
              </ListItemButton>
            ))}
          </>
        )}
      </List>

      {/* Logout */}
      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}><Logout /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "14px", fontFamily: "Montserrat", fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent */}
      <Box sx={{ display: { xs: "none", md: "block" }, width: DRAWER_WIDTH, flexShrink: 0 }}>
        <Drawer variant="permanent" sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "1px solid var(--color-outline)" } }}>
          <SidebarContent />
        </Drawer>
      </Box>
      {/* Mobile temporary */}
      <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        <SidebarContent />
      </Drawer>
    </>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isMobile && (
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: "var(--color-bg)", borderBottom: "1px solid var(--color-outline)" }}>
            <Toolbar>
              <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: "text.primary" }}>
                <MenuIcon />
              </IconButton>
              <Typography sx={{ fontFamily: '"Prosto One", sans-serif', fontSize: "18px", ml: 2 }}>Admin</Typography>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
