import React, { useState } from "react";
import { Box, Typography, Chip, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminOrders } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import { Pagination } from "@mui/material";

const STATUS_COLORS: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  pending: "warning", paid: "info", shipped: "info", delivered: "success", cancelled: "error",
};
const AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data: ordersRes, isLoading: loading } = useAdminOrders({ 
    page, 
    limit: 20, 
    status: status || undefined,
    userId: userId || undefined
  });

  const orders = ordersRes?.data || [];
  const meta = ordersRes?.meta || { total: 0, totalPages: 1 };

  const o = (order: unknown) => order as { _id: string; userId: { _id: string; name: string; email: string } | null; items: unknown[]; total: number; status: string; createdAt: string; paymentMethod: string };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Orders</Typography>
          {userId && (
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "primary.main", fontWeight: 500 }}>
              Viewing orders for: {orders.length > 0 ? (o(orders[0]).userId?.email || userId) : userId}
              <Button size="small" onClick={() => { searchParams.delete("userId"); setSearchParams(searchParams); }} sx={{ textTransform: "none", p: 0, ml: 1, minWidth: 0, textDecoration: "underline" }}>Clear</Button>
            </Typography>
          )}
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {["pending", "paid", "shipped", "delivered", "cancelled"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : (
        <>
          <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
                <Box component="tr">
                  {["Order ID", "Customer", "Items", "Total", "Status", "Payment", "Date", "Actions"].map(h => (
                    <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "text.secondary", borderBottom: "1px solid var(--color-outline)", whiteSpace: "nowrap" }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {orders.length === 0 && (
                  <Box component="tr"><Box component="td" colSpan={8} sx={{ p: 4, textAlign: "center", fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>No orders.</Box></Box>
                )}
                {orders.map(order => {
                  const ord = o(order);
                  return (
                    <Box component="tr" key={ord._id} sx={{ "&:hover": { bgcolor: "var(--color-bg-variant)" }, borderBottom: "1px solid var(--color-outline)" }}>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{ord._id.slice(-8).toUpperCase()}</Box>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>
                        <Box sx={{ fontWeight: 500 }}>{ord.userId?.name || "Guest"}</Box>
                        <Box sx={{ fontSize: "11px", color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                          {ord.userId?.email}
                          {ord.userId && !userId && (
                            <Button 
                              size="small" 
                              onClick={() => { searchParams.set("userId", ord.userId!._id); setSearchParams(searchParams); }}
                              sx={{ p: 0, minWidth: 0, color: "primary.main", fontSize: "10px", textTransform: "none", "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
                            >
                              (Filter)
                            </Button>
                          )}
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>{(ord.items as unknown[]).length}</Box>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", fontWeight: 600 }}>€{ord.total.toFixed(2)}</Box>
                      <Box component="td" sx={{ p: 2 }}>
                        <Chip label={ord.status} size="small" color={STATUS_COLORS[ord.status] || "default"} variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px", textTransform: "capitalize" }} />
                      </Box>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>{ord.paymentMethod}</Box>
                      <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{new Date(ord.createdAt).toLocaleDateString()}</Box>
                      <Box component="td" sx={{ p: 2 }}>
                        <Button size="small" component={Link} to={`/admin/orders/${ord._id}`} variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "12px", borderRadius: 0 }}>View</Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>
              Total: {meta.total} orders
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

export default AdminOrders;
