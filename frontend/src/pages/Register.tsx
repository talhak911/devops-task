import React, { useRef, useEffect, useState } from "react";
import {
    Box, Card, TextField, Button, Typography, InputAdornment,
    IconButton, CircularProgress, Divider,
} from "@mui/material";
import { Person, Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { staggerFadeUp, slideDown } from "../utils/gsapUtils";

const schema = yup.object({
    name: yup.string().min(2).max(50).required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .min(6, "At least 6 characters")
        .matches(/[A-Z]/, "Must include an uppercase letter")
        .matches(/[0-9]/, "Must include a number")
        .required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fieldsRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logoRef.current) slideDown(logoRef.current, 0);
        if (fieldsRef.current) {
            const fields = fieldsRef.current.querySelectorAll(".form-field");
            staggerFadeUp(fields, 0.1, 0.2);
        }
    }, []);

    const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        try {
            await registerUser(values.name, values.email, values.password);
            toast.success("Account created! Welcome aboard.");
            navigate("/", { replace: true });
        } catch (err: unknown) {
            const error = err as any;
            if (error.response?.status === 422 && error.response.data.errors) {
                error.response.data.errors.forEach((e: any) => {
                    setError(e.field as any, { message: e.message });
                });
            }
            const msg = error.response?.data?.message || "Registration failed";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "var(--color-bg)",
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: { xs: 3, md: 4 },
                    bgcolor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                <Box ref={logoRef} sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                        sx={{
                            width: 52, height: 52, borderRadius: "14px", mx: "auto", mb: 2,
                            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "22px" }}>P</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                        Create account
                    </Typography>
                    <Typography sx={{ color: "var(--color-text-muted)", fontSize: "0.875rem", mt: 0.5 }}>
                        Join our Tea Community
                    </Typography>
                </Box>

                <Box ref={fieldsRef} component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box className="form-field">
                        <TextField
                            fullWidth label="Full name" type="text" autoComplete="name"
                            {...register("name")}
                            error={!!errors.name} helperText={errors.name?.message}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: "var(--color-text-muted)", fontSize: 18 }} /></InputAdornment> }}
                            size="small"
                        />
                    </Box>
                    <Box className="form-field">
                        <TextField
                            fullWidth label="Email address" type="email" autoComplete="email"
                            {...register("email")}
                            error={!!errors.email} helperText={errors.email?.message}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: "var(--color-text-muted)", fontSize: 18 }} /></InputAdornment> }}
                            size="small"
                        />
                    </Box>
                    <Box className="form-field">
                        <TextField
                            fullWidth label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            {...register("password")}
                            error={!!errors.password} helperText={errors.password?.message}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: "var(--color-text-muted)", fontSize: 18 }} /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Box>

                    <Button
                        className="form-field"
                        type="submit" fullWidth variant="contained" disabled={isLoading}
                        sx={{
                            py: 1.25, mt: 0.5,
                            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
                            color: "var(--color-text-on-primary)", fontWeight: 600,
                            "&:hover": { background: "var(--color-primary-hover)" },
                        }}
                    >
                        {isLoading ? <CircularProgress size={20} color="inherit" /> : "Create account"}
                    </Button>

                    <Box className="form-field" sx={{ textAlign: "center" }}>
                        <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                        <Typography sx={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign in</Link>
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default Register;
