import React, { useState } from "react";
import {
    AppBar, Toolbar, Box, IconButton, Typography, Drawer, List, ListItemButton,
    ListItemText, useMediaQuery, Badge, Tooltip, Menu, MenuItem, Avatar, Divider
} from "@mui/material";
import {
    Search, PersonOutline, LocalMall, Menu as MenuIcon, Close,
    LightMode, DarkMode, AdminPanelSettings, Logout
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartDrawer from "./CartDrawer";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface NavbarProps {
    mode: "light" | "dark";
    toggleMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode, toggleMode }) => {
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery("(max-width: 900px)");
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Reset search state on navigation
    React.useEffect(() => {
        setIsSearchExpanded(false);
        setSearchQuery("");
    }, [location.pathname]);

    const navLinks = [
        { label: "TEA COLLECTIONS", path: "/collections" },
        { label: "CART", path: "/cart" },
        { label: "BLOG", path: "/blog" },
        { label: "CONTACT US", path: "/contact" },
    ];

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const admin = isAdmin();
        handleProfileMenuClose();
        await logout();
        navigate(admin ? "/admin/login" : "/");
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/collections?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchExpanded(false);
            setSearchQuery("");
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{
                bgcolor: "var(--color-bg)",
                borderBottom: "1px solid var(--color-outline)",
                height: "80px",
                justifyContent: "center",
                zIndex: 1201
            }}>
                <Toolbar sx={{
                    maxWidth: "1400px",
                    width: "100%",
                    margin: "0 auto",
                    px: { xs: 2, md: 4 },
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    {/* Logo */}
                    <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 36V20.05C13.8667 20.05 11.8167 19.6413 9.85 18.824C7.88333 18.008 6.15 16.85 4.65 15.35C3.15 13.85 2 12.1167 1.2 10.15C0.4 8.18333 0 6.13333 0 4V0H4C6.1 0 8.13333 0.408 10.1 1.224C12.0667 2.04133 13.8 3.2 15.3 4.7C16.3333 5.73333 17.192 6.86667 17.876 8.1C18.5587 9.33333 19.0833 10.65 19.45 12.05C19.6167 11.8167 19.8 11.592 20 11.376C20.2 11.1587 20.4167 10.9333 20.65 10.7C22.15 9.2 23.8833 8.04133 25.85 7.224C27.8167 6.408 29.8667 6 32 6H36V10C36 12.1333 35.592 14.1833 34.776 16.15C33.9587 18.1167 32.8 19.85 31.3 21.35C29.8 22.85 28.0747 24 26.124 24.8C24.1747 25.6 22.1333 26 20 26V36H16Z" fill="var(--color-text-primary)" />
                        </svg>

                        <Typography sx={{
                            fontFamily: '"Prosto One", sans-serif',
                            fontWeight: 400,
                            fontSize: "20px",
                            color: "text.primary",
                            display: { xs: "none", sm: "block" }
                        }}>
                            Brand Name
                        </Typography>
                    </Box>

                    {/* Desktop Nav */}
                    {!isMobile && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {navLinks.map((link) => (
                                <Box
                                    key={link.label}
                                    component={Link}
                                    to={link.path}
                                    sx={{
                                        px: 2, py: 1, textDecoration: "none",
                                        fontSize: "14px", fontWeight: 500,
                                        fontFamily: '"Montserrat", sans-serif',
                                        color: isActive(link.path) ? "primary.main" : "text.primary",
                                        letterSpacing: "0.1px",
                                        transition: "color 0.2s ease",
                                        "&:hover": { color: "secondary.main" },
                                    }}
                                >
                                    {link.label}
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Icons */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
                        {!isMobile && (
                            <Box
                                component="form"
                                onSubmit={handleSearchSubmit}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    position: "relative",
                                    bgcolor: isSearchExpanded ? "var(--color-bg-secondary)" : "transparent",
                                    borderRadius: "4px",
                                    transition: "all 0.3s ease",
                                    border: isSearchExpanded ? "1px solid var(--color-outline)" : "1px solid transparent",
                                    px: isSearchExpanded ? 1 : 0
                                }}
                            >
                                {isSearchExpanded && (
                                    <Box
                                        component="input"
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e: any) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        sx={{
                                            border: "none",
                                            outline: "none",
                                            bgcolor: "transparent",
                                            color: "var(--color-text-primary)",
                                            fontFamily: "Montserrat",
                                            fontSize: "14px",
                                            width: "200px",
                                            py: 0.5,
                                            mr: 1
                                        }}
                                    />
                                )}
                                <IconButton
                                    size="small"
                                    onClick={() => isSearchExpanded ? handleSearchSubmit({ preventDefault: () => { } } as any) : setIsSearchExpanded(true)}
                                    sx={{ color: "text.primary" }}
                                >
                                    <Search />
                                </IconButton>
                                {isSearchExpanded && (
                                    <IconButton
                                        size="small"
                                        onClick={() => { setIsSearchExpanded(false); setSearchQuery(""); }}
                                        sx={{ color: "text.primary" }}
                                    >
                                        <Close sx={{ fontSize: 16 }} />
                                    </IconButton>
                                )}
                            </Box>
                        )}

                        <NotificationBell />
                        {isAuthenticated ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: "14px", bgcolor: "primary.main" }}>
                                        {user?.name?.[0]?.toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleProfileMenuClose}
                                    PaperProps={{ elevation: 2, sx: { minWidth: 180, mt: 1, borderRadius: 0, border: "1px solid var(--color-outline)" } }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, fontFamily: "Montserrat" }}>{user?.name}</Typography>
                                        <Typography sx={{ fontSize: "12px", color: "text.secondary", fontFamily: "Montserrat" }}>{user?.email}</Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem component={Link} to="/dashboard" onClick={handleProfileMenuClose} sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>
                                        <PersonOutline sx={{ mr: 1.5, fontSize: 18 }} /> My Orders
                                    </MenuItem>
                                    {isAdmin() && (
                                        <MenuItem component={Link} to="/admin" onClick={handleProfileMenuClose} sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>
                                            <AdminPanelSettings sx={{ mr: 1.5, fontSize: 18 }} /> Admin Panel
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout} sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "error.main" }}>
                                        <Logout sx={{ mr: 1.5, fontSize: 18 }} /> Logout
                                    </MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <IconButton size="small" component={Link} to="/login" sx={{ color: "text.primary" }}>
                                <PersonOutline />
                            </IconButton>
                        )}

                        <IconButton size="small" onClick={() => setCartOpen(true)} sx={{ color: "text.primary" }}>
                            <Badge badgeContent={cartCount} color="primary" sx={{ "& .MuiBadge-badge": { bgcolor: "primary.main", color: "primary.contrastText", fontFamily: "Montserrat", fontWeight: 700 } }}>
                                <LocalMall />
                            </Badge>
                        </IconButton>

                        <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
                            <IconButton size="small" onClick={toggleMode} sx={{ color: "text.primary" }}>
                                {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                            </IconButton>
                        </Tooltip>

                        {isMobile && (
                            <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ color: "text.primary" }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: "100%", maxWidth: 300, bgcolor: "var(--color-bg)" } }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                        <Typography sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400, fontSize: "20px", color: "text.primary" }}>TEA SHOP</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "text.primary" }}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4, position: "relative" }}>
                        <Box
                            component="input"
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            sx={{
                                width: "100%",
                                py: 1.5,
                                px: 2,
                                bgcolor: "var(--color-bg-secondary)",
                                border: "1px solid var(--color-outline)",
                                borderRadius: "4px",
                                color: "var(--color-text-primary)",
                                fontFamily: "Montserrat",
                                fontSize: "14px",
                                outline: "none",
                                "&:focus": { borderColor: "primary.main" }
                            }}
                        />
                        <IconButton
                            type="submit"
                            size="small"
                            sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "text.primary" }}
                        >
                            <Search />
                        </IconButton>
                    </Box>
                    <List>
                        {navLinks.map((link) => (
                            <ListItemButton
                                key={link.label}
                                component={Link}
                                to={link.path}
                                onClick={() => setDrawerOpen(false)}
                                sx={{ py: 2 }}
                            >
                                <ListItemText
                                    primary={link.label}
                                    primaryTypographyProps={{
                                        fontFamily: '"Montserrat", sans-serif',
                                        fontSize: "14px",
                                        fontWeight: isActive(link.path) ? 600 : 500,
                                        color: isActive(link.path) ? "primary.main" : "text.primary"
                                    }}
                                />
                            </ListItemButton>
                        ))}
                        {isAuthenticated && isAdmin() && (
                            <ListItemButton component={Link} to="/admin" onClick={() => setDrawerOpen(false)} sx={{ py: 2 }}>
                                <ListItemText primary="ADMIN PANEL" primaryTypographyProps={{ fontFamily: '"Montserrat", sans-serif', fontSize: "14px", fontWeight: 500 }} />
                            </ListItemButton>
                        )}
                    </List>
                </Box>
            </Drawer>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
};

export default Navbar;
