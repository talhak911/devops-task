import React, { useState } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminProduct, useCreateProduct, useUpdateProduct, useAdminCategories } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import ProductForm from "../../components/admin/forms/ProductForm";


const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: catRes, isLoading: loadingCats } = useAdminCategories();
  const { data: productRes, isLoading: loadingProduct } = useAdminProduct(id!);

  const categories = catRes?.data || [];
  const productData = productRes?.data;
  
  const loading = loadingCats || (isEdit && loadingProduct);

  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct({ id: id!, formData });
      } else {
        await createProduct(formData);
        navigate("/admin/products");
      }
    } catch (e: any) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/admin/products")}><ArrowBack /></IconButton>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif' }}>
          {isEdit ? "Edit Product" : "New Product"}
        </Typography>
      </Box>

      <ProductForm 
        initialData={productData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/products")}
        isLoading={saving}
      />
    </AdminLayout>
  );
};

export default AdminProductForm;
