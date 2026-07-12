import React, { useState } from "react";
import { 
  Box, Typography, Button, Stack, Chip, CircularProgress, 
  Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import CategoryForm from "../../components/admin/forms/CategoryForm";
import type { Category } from "../../types/api";



const AdminCategories: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categoriesRes, isLoading: loading } = useAdminCategories();
  const categories = categoriesRes?.data || [];

  const { mutateAsync: createCategory } = useCreateCategory();
  const { mutateAsync: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [saving, setSaving] = useState(false);

  const handleOpen = (cat?: Category) => {
    if (cat) {
      setEditId(cat._id);
    } else {
      setEditId(null);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      if (editId) {
        await updateCategory({ id: editId, formData });
      } else {
        await createCategory(formData);
      }
      setDialogOpen(false);
    } catch (e: any) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Permanently delete this category?")) return;
    deleteCategory(id);
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif' }}>Categories</Typography>
        <Button 
          startIcon={<Add />} 
          variant="contained" 
          onClick={() => handleOpen()}
          sx={{ bgcolor: "primary.main", borderRadius: 0, fontFamily: "Montserrat" }}
        >
          Add Category
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
              <Box component="tr">
                {["Image", "Name", "Slug", "Status", "Actions"].map(h => (
                  <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600 }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {categories.map(c => (
                <Box component="tr" key={c._id} sx={{ borderBottom: "1px solid var(--color-outline)", "&:hover": { bgcolor: "rgba(0,0,0,0.02)" } }}>
                  <Box component="td" sx={{ p: 2 }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: "var(--color-bg-variant)", backgroundImage: `url(${c.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  </Box>
                  <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "14px", fontWeight: 500 }}>{c.name}</Box>
                  <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary" }}>{c.slug}</Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Chip label={c.isActive ? "Active" : "Disabled"} size="small" color={c.isActive ? "success" : "default"} variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />
                  </Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => handleOpen(c)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(c._id)}><Delete fontSize="small" /></IconButton>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "Montserrat" }}>{editId ? "Edit Category" : "New Category"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <CategoryForm 
              initialData={editId ? categories.find(c => c._id === editId) : undefined}
              isLoading={saving}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
