import React, { useState } from "react";
import { Box, Typography, Button, Stack, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAdminAccounts, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";


const schema = yup.object({
  name: yup.string().min(2, "Name is too short").required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

const AdminAccounts: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const { data: adminsRes, isLoading: loading } = useAdminAccounts();
  const admins = adminsRes?.data || [];

  const { mutateAsync: createAdmin, isPending: saving } = useCreateAdmin();
  const { mutate: updateAdmin } = useUpdateAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const onSubmit = async (values: FormData) => {
    setError("");
    try {
      await createAdmin(values);
      setDialogOpen(false); 
      reset();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to create admin");
    }
  };

  const handleToggleBlock = (id: string, blocked: boolean) => {
    updateAdmin({ id, data: { isBlocked: !blocked } });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Remove this admin account?")) return;
    deleteAdmin(id);
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Admin Accounts</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary.main", fontFamily: "Montserrat", fontWeight: 500, borderRadius: 0 }}>
          Add Admin
        </Button>
      </Box>

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : (
        <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
              <Box component="tr">
                {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                  <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "text.secondary", borderBottom: "1px solid var(--color-outline)" }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {admins.map(a => (
                <Box component="tr" key={a._id} sx={{ "&:hover": { bgcolor: "var(--color-bg-variant)" }, borderBottom: "1px solid var(--color-outline)" }}>
                  <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", fontWeight: 500 }}>{a.name}</Box>
                  <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary" }}>{a.email}</Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Chip label={a.role} size="small" variant="outlined" color={a.role === "superadmin" ? "secondary" : "default"} sx={{ fontFamily: "Montserrat", fontSize: "11px", textTransform: "capitalize" }} />
                  </Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Chip label={a.isBlocked ? "Blocked" : "Active"} size="small" color={a.isBlocked ? "error" : "success"} variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />
                  </Box>
                  <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{new Date(a.createdAt).toLocaleDateString()}</Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        color={a.isBlocked ? "success" : "error"} 
                        variant="outlined" 
                        disabled={a._id === currentUser?.id}
                        onClick={() => handleToggleBlock(a._id, a.isBlocked)} 
                        sx={{ fontFamily: "Montserrat", fontSize: "12px", borderRadius: 0 }}
                      >
                        {a.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        variant="contained" 
                        disabled={a._id === currentUser?.id}
                        onClick={() => handleDelete(a._id)}
                        sx={{ fontFamily: "Montserrat", fontSize: "12px", borderRadius: 0 }}
                      >
                        Remove
                      </Button>
                      {a._id === currentUser?.id && <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: 'Montserrat', alignSelf: 'center' }}>(You)</Typography>}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontFamily: "Montserrat" }}>Create Admin Account</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField 
                label="Name" fullWidth size="small"
                {...register("name")}
                error={!!errors.name} helperText={errors.name?.message}
              />
              <TextField 
                label="Email" fullWidth size="small"
                {...register("email")}
                error={!!errors.email} helperText={errors.email?.message}
              />
              <TextField 
                label="Password" type="password" fullWidth size="small"
                {...register("password")}
                error={!!errors.password} helperText={errors.password?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: "Montserrat" }}>Cancel</Button>
            <Button variant="contained" type="submit" disabled={saving}
              sx={{ bgcolor: "primary.main", fontFamily: "Montserrat", borderRadius: 0 }}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAccounts;
