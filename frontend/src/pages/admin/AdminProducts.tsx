import React, { useState } from "react";
import { Box, Typography, TextField, InputAdornment, Button, Chip, IconButton, CircularProgress, Stack, Tooltip } from "@mui/material";
import { Search, Add, Edit, Delete, Visibility } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAdminProducts, useDeactivateProduct } from "../../hooks/useAdmin";
import { useCategories } from "../../hooks/useCategories";
import AdminLayout from "../../components/admin/AdminLayout";
import { FormControl, InputLabel, Select, MenuItem, Pagination } from "@mui/material";

import type { Product } from "../../types/api";

const AdminProducts: React.FC = () => {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: productsRes, isLoading: loading } = useAdminProducts({ 
    page, 
    limit: 15, 
    q: q || undefined,
    category: category || undefined
  });
  
  const products = productsRes?.data || [];
  const meta = productsRes?.meta || { total: 0, totalPages: 1 };

  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data || [];

  const { mutate: deactivateProduct } = useDeactivateProduct();

  const handleDelete = (id: string) => {
    if (!window.confirm("Deactivate this product?")) return;
    deactivateProduct(id);
  };

  const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stockQuantity, 0);
  const priceRange = (p: Product) => {
    if (!p.variants.length) return `€${p.basePrice.toFixed(2)}`;
    const deltas = p.variants.filter(v => v.isActive).map(v => v.priceDelta || 0);
    if (!deltas.length) return `€${p.basePrice.toFixed(2)}`;
    const min = p.basePrice + Math.min(...deltas);
    const max = p.basePrice + Math.max(...deltas);
    return min === max ? `€${min.toFixed(2)}` : `€${min.toFixed(2)} – €${max.toFixed(2)}`;
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Products</Typography>
         <Button component={Link} to="/admin/products/new" variant="contained" startIcon={<Add />}
          sx={{ 
            bgcolor: "primary.main", 
            fontFamily: "Montserrat", 
            fontWeight: 500, 
            borderRadius: 0,
            "&:hover": { bgcolor: "primary.dark", color: "white" }
          }}>
          Add Product
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField 
          placeholder="Search products..." 
          value={q} 
          onChange={e => { setQ(e.target.value); setPage(1); }}
          size="small" 
          sx={{ width: { xs: "100%", sm: 350 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} 
        />
        
        <FormControl size="small" sx={{ width: { xs: "100%", sm: 200 } }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={category}
            label="Category"
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            sx={{ borderRadius: 0 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Table */}
          <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
                <Box component="tr">
                  {["Product", "Category", "Price", "Variants", "Stock", "Status", "Actions"].map(h => (
                    <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "text.secondary", borderBottom: "1px solid var(--color-outline)", whiteSpace: "nowrap" }}>
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {products.length === 0 && (
                  <Box component="tr">
                    <Box component="td" colSpan={7} sx={{ p: 4, textAlign: "center", fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>
                      No products found.
                    </Box>
                  </Box>
                )}
                {products.map(p => (
                  <Box component="tr" key={p._id} sx={{ "&:hover": { bgcolor: "var(--color-bg-variant)" }, borderBottom: "1px solid var(--color-outline)" }}>
                    <Box component="td" sx={{ p: 2, maxWidth: 250 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                          width: 40, height: 40, bgcolor: "var(--color-bg-variant)", 
                          backgroundImage: `url(${p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000/${p.images[0]}`) : 'https://placehold.co/100x100?text=Tea'})`, 
                          backgroundSize: "cover", borderRadius: 1, flexShrink: 0 
                        }} />
                        <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", fontWeight: 500 }}>{p.title}</Typography>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary" }}>
                      {p.categoryId?.name || "—"}
                    </Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", fontWeight: 500 }}>
                      {priceRange(p)}
                    </Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>
                      {p.variants.length}
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", color: totalStock(p) <= 5 ? "error.main" : "text.primary", fontWeight: totalStock(p) <= 5 ? 700 : 400 }}>
                        {totalStock(p)}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Chip label={p.isActive ? "Active" : "Inactive"} size="small" color={p.isActive ? "success" : "default"} variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View"><IconButton size="small" component="a" href={`/product/${p._id}`} target="_blank"><Visibility fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" component={Link} to={`/admin/products/${p._id}/edit`}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Deactivate"><IconButton size="small" onClick={() => handleDelete(p._id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>
              Total: {meta.total} products
            </Typography>
            <Pagination 
              count={meta.totalPages} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              shape="rounded"
              color="primary"
            />
          </Box>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
