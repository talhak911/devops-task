import React, { useState } from "react";
import { Box, Typography, Button, Chip, CircularProgress, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Search, Add, Remove } from "@mui/icons-material";
import { useAdminInventory, useAdjustStock } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import { Pagination } from "@mui/material";

interface StockItem { productId: string; productTitle: string; variantId: string; sku: string; label: string; stockQuantity: number; isLowStock: boolean }

const AdminInventory: React.FC = () => {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [adjItem, setAdjItem] = useState<StockItem | null>(null);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");

  const { data: inventoryRes, isLoading: loading } = useAdminInventory({ page, limit: 20, q: q || undefined });
  const items = inventoryRes?.data || [];
  const meta = inventoryRes?.meta || { total: 0, totalPages: 1 };

  const { mutate: adjustStock, isPending: saving } = useAdjustStock();

  const doAdjust = () => {
    if (!adjItem) return;
    adjustStock({ productId: adjItem.productId, variantId: adjItem.variantId, delta, reason }, {
      onSuccess: () => {
        setAdjItem(null); setDelta(0); setReason("");
      }
    });
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Inventory</Typography>
      </Box>
      <TextField placeholder="Search products..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} size="small"
        sx={{ mb: 3, width: { xs: "100%", sm: 350 } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : (
        <>
          <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
                <Box component="tr">
                  {["SKU", "Product", "Variant", "Stock", "Status", "Action"].map(h => (
                    <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "text.secondary", borderBottom: "1px solid var(--color-outline)" }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {items.map(item => (
                  <Box component="tr" key={item.sku} sx={{ "&:hover": { bgcolor: "var(--color-bg-variant)" }, borderBottom: "1px solid var(--color-outline)" }}>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{item.sku}</Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>{item.productTitle}</Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>{item.label}</Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", fontWeight: item.isLowStock ? 700 : 400, color: item.isLowStock ? "error.main" : "text.primary" }}>{item.stockQuantity}</Box>
                    <Box component="td" sx={{ p: 2 }}>
                      {item.isLowStock ? <Chip label="Low Stock" size="small" color="error" variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />
                        : <Chip label="OK" size="small" color="success" variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />}
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Button size="small" variant="outlined" onClick={() => { setAdjItem(item); setDelta(0); setReason(""); }} sx={{ fontFamily: "Montserrat", fontSize: "12px", borderRadius: 0 }}>
                        Adjust
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
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

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjItem} onClose={() => setAdjItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "Montserrat" }}>Adjust Stock — {adjItem?.sku}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", mb: 1 }}>Current stock: <strong>{adjItem?.stockQuantity}</strong></Typography>
          <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", mb: 2 }}>New stock: <strong>{(adjItem?.stockQuantity || 0) + delta}</strong></Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={() => setDelta(d => d - 1)} sx={{ minWidth: 40, borderRadius: 0 }}><Remove /></Button>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "18px", fontWeight: 700, minWidth: 40, textAlign: "center" }}>{delta >= 0 ? `+${delta}` : delta}</Typography>
            <Button variant="outlined" onClick={() => setDelta(d => d + 1)} sx={{ minWidth: 40, borderRadius: 0 }}><Add /></Button>
          </Box>
          <TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} fullWidth size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjItem(null)} sx={{ fontFamily: "Montserrat" }}>Cancel</Button>
          <Button variant="contained" onClick={doAdjust} disabled={saving || delta === 0}
            sx={{ bgcolor: "primary.main", fontFamily: "Montserrat", borderRadius: 0 }}>
            {saving ? "Saving..." : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminInventory;
