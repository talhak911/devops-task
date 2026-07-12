import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
                <CircularProgress sx={{ color: "var(--color-primary)" }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const fallbackPath = location.pathname.startsWith("/admin") ? "/admin" : "/dashboard";
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
