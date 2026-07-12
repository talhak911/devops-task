import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Button, Stack, CircularProgress, Divider, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminOrderDetail, useUpdateOrderStatus } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";

const STATUS_COLORS: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  pending: "warning", paid: "info", shipped: "info", delivered: "success", cancelled: "error",
};
const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

interface OrderItem { productTitle: string; variantLabel: string; quantity: number; unitPrice: number; lineTotal: number; productImage: string }
interface StatusEntry { status: string; note: string; changedAt: string }


const AdminOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: orderRes, isLoading: loading } = useAdminOrderDetail(id!);
  const order = orderRes?.data;
  const { mutate: updateStatus, isPending: saving } = useUpdateOrderStatus();

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  const handleStatusUpdate = () => {
    if (!id || !newStatus) return;
    updateStatus({ id, status: newStatus, note }, {
      onSuccess: () => {
        setDialogOpen(false);
        setNote("");
      }
    });
  };

  if (loading) return <AdminLayout><Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box></AdminLayout>;
  if (!order) return <AdminLayout><Typography>Order not found.</Typography></AdminLayout>;

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/admin/orders")}><ArrowBack /></IconButton>
        <Typography variant="h5" sx={{ fontFamily: '"Prosto One", sans-serif' }}>Order #{order._id.slice(-8).toUpperCase()}</Typography>
        <Chip label={order.status} color={STATUS_COLORS[order.status] || "default"} sx={{ textTransform: "capitalize" }} />
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* Left: Items + Address */}
        <Box sx={{ flex: 2 }}>
          <Box sx={{ border: "1px solid var(--color-outline)", p: 3, mb: 3 }}>
            <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Items</Typography>
            <Stack spacing={2}>
              {(order.items as OrderItem[]).map((item, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, pb: 2, borderBottom: i < order.items.length - 1 ? "1px solid var(--color-outline)" : "none" }}>
                  <Box sx={{ width: 50, height: 50, backgroundImage: `url(${item.productImage})`, backgroundSize: "cover", borderRadius: 1, bgcolor: "var(--color-bg-variant)", flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", fontWeight: 500 }}>{item.productTitle}</Typography>
                    <Typography sx={{ fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{item.variantLabel} × {item.quantity}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600 }}>€{item.lineTotal.toFixed(2)}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>Subtotal</Typography>
                <Typography sx={{ fontFamily: "Montserrat" }}>€{order.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>Delivery</Typography>
                <Typography sx={{ fontFamily: "Montserrat" }}>€{order.delivery.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "Montserrat", fontSize: "16px", fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "16px" }}>€{order.total.toFixed(2)}</Typography>
              </Box>
            </Stack>
          </Box>

          {order.shippingAddress && (
            <Box sx={{ border: "1px solid var(--color-outline)", p: 3 }}>
              <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 1 }}>Shipping Address</Typography>
              <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{order.shippingAddress.name}</Typography>
              <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{order.shippingAddress.street}</Typography>
              <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}</Typography>
            </Box>
          )}
        </Box>

        {/* Right: Customer + Status + Timeline */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ border: "1px solid var(--color-outline)", p: 3, mb: 3 }}>
            <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 1 }}>Customer</Typography>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{order.userId?.name || "Guest"}</Typography>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary", mb: 1 }}>{order.userId?.email}</Typography>
            {order.userId && (
              <Button size="small" component={Link} to={`/admin/orders?userId=${order.userId._id}`} variant="text" sx={{ p: 0, textTransform: "none", fontSize: "12px", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
                View Order History
              </Button>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 1 }}>Payment</Typography>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{order.paymentMethod}</Typography>
          </Box>

          {/* Update Status */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Box sx={{ border: "1px solid var(--color-outline)", p: 3, mb: 3 }}>
              <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Update Status</Typography>
              <Select value={newStatus} fullWidth size="small" onChange={e => setNewStatus(e.target.value)} sx={{ mb: 2 }}>
                {STATUSES.map(s => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
              </Select>
              <Button fullWidth variant="contained" onClick={() => setDialogOpen(true)}
                sx={{ bgcolor: "primary.main", fontFamily: "Montserrat", fontWeight: 500, height: 44, borderRadius: 0 }}>
                Update Status
              </Button>
            </Box>
          )}

          {/* Timeline */}
          <Box sx={{ border: "1px solid var(--color-outline)", p: 3 }}>
            <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Timeline</Typography>
            <Stack spacing={2}>
              {(order.statusHistory as StatusEntry[]).map((h, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", mt: 0.6, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", fontWeight: 600, textTransform: "capitalize" }}>{h.status}</Typography>
                    {h.note && <Typography sx={{ fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary" }}>{h.note}</Typography>}
                    <Typography sx={{ fontFamily: "Montserrat", fontSize: "11px", color: "text.secondary" }}>{new Date(h.changedAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>

      {/* Confirm Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "Montserrat" }}>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", mb: 2 }}>
            Change status to <strong>{newStatus}</strong>?
          </Typography>
          <TextField label="Optional note" value={note} onChange={e => setNote(e.target.value)} fullWidth size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: "Montserrat" }}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={saving} sx={{ fontFamily: "Montserrat", bgcolor: "primary.main", borderRadius: 0 }}>
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
