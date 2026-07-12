import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: FormData) => {
    setError(""); setLoading(true);
    try {
      const user = await login(values.email, values.password);
      if (user.role === "superadmin") {
        navigate("/admin");
      } else if (user.role === "admin") {
        navigate("/admin/products");
      } else {
        setError("Access denied. Admin accounts only.");
        localStorage.removeItem("access_token");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string }; status?: number } };
      if (err.response?.status === 403) setError("Your account is blocked.");
      else setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "var(--color-bg-variant)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 400, bgcolor: "background.default", p: 5, border: "1px solid var(--color-outline)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L28 16L40 20L28 24L24 36L20 24L8 20L20 16L24 4Z" fill="var(--color-primary)" />
          </svg>
          <Typography sx={{ fontFamily: '"Prosto One", sans-serif', fontSize: "18px", color: "text.primary" }}>Admin Panel</Typography>
        </Box>

        <Typography sx={{ fontFamily: "Montserrat", fontWeight: 400, fontSize: "22px", mb: 3 }}>Sign In</Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontFamily: "Montserrat" }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField 
            label="Email" type="email" fullWidth size="small" sx={{ mb: 2 }}
            {...register("email")}
            error={!!errors.email} helperText={errors.email?.message}
          />
          <TextField 
            label="Password" type="password" fullWidth size="small" sx={{ mb: 3 }}
            {...register("password")}
            error={!!errors.password} helperText={errors.password?.message}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading}
            sx={{ height: 48, bgcolor: "primary.main", fontFamily: "Montserrat", fontWeight: 500, borderRadius: 0, '&:hover': { bgcolor: 'secondary.main' } }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "SIGN IN"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLogin;
