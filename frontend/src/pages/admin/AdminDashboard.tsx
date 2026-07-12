import React, { useState } from "react";
import { Box, Grid, Typography, Card, CardContent, Chip, Stack, CircularProgress, Button } from "@mui/material";
import { ShoppingCart, People, Inventory, TrendingUp, Storefront, ListAlt, Warning } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAnalytics } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";



const StatCard = ({ title, value, icon, color = "primary.main", subtitle }: { title: string; value: string | number; icon: React.ReactNode; color?: string; subtitle?: string }) => (
  <Card elevation={0} sx={{ border: "1px solid var(--color-outline)", height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary", mb: 1 }}>{title}</Typography>
          <Typography sx={{ fontFamily: "Montserrat", fontSize: "28px", fontWeight: 700, color: "text.primary" }}>{value}</Typography>
          {subtitle && <Typography sx={{ fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary", mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        <Box sx={{ bgcolor: color, color: "white", borderRadius: 2, p: 1.5, display: "flex" }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const [range, setRange] = useState("30d");
  const { data: analyticsRes, isLoading: loading } = useAnalytics(range);
  const data = analyticsRes?.data;

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          {["7d", "30d", "90d"].map(r => (
            <Button key={r} size="small" variant={range === r ? "contained" : "outlined"} onClick={() => setRange(r)}
              sx={{ borderRadius: 0, fontFamily: "Montserrat", fontWeight: 500 }}>
              {r}
            </Button>
          ))}
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : data ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Orders" value={data.totalOrders} icon={<ShoppingCart />} subtitle={`${data.pendingOrders} pending`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Revenue" value={`€${data.revenue.toFixed(2)}`} icon={<TrendingUp />} color="secondary.main" subtitle="COD orders" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Customers" value={data.totalUsers} icon={<People />} color="#2e7d32" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Low Stock SKUs" value={data.lowStockCount} icon={<Warning />} color={data.lowStockCount > 0 ? "#d32f2f" : "#2e7d32"} subtitle="≤ 5 units" />
            </Grid>
          </Grid>

          {/* Order Status Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: "1px solid var(--color-outline)" }}>
                <CardContent>
                  <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 3 }}>Order Status</Typography>
                  <Stack spacing={2}>
                    {[
                      { label: "Pending", value: data.pendingOrders, color: "#f57c00" },
                      { label: "Shipped", value: data.shippedOrders, color: "#0288d1" },
                      { label: "Delivered", value: data.deliveredOrders, color: "#2e7d32" },
                    ].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                          <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>{label}</Typography>
                        </Box>
                        <Chip label={value} size="small" sx={{ fontFamily: "Montserrat", fontWeight: 700 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: "1px solid var(--color-outline)" }}>
                <CardContent>
                  <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 3 }}>Top Products</Typography>
                  <Stack spacing={2}>
                    {data.topProducts.length === 0 && <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>No data yet</Typography>}
                    {data.topProducts.map((p, i) => (
                      <Box key={p._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary", minWidth: 18 }}>{i + 1}.</Typography>
                          <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px" }}>{p.title}</Typography>
                        </Box>
                        <Typography sx={{ fontFamily: "Montserrat", fontSize: "13px", fontWeight: 600, color: "secondary.main" }}>{p.totalSold} sold</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Links */}
          <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            {[
              { label: "Manage Products", icon: <Storefront />, path: "/admin/products" },
              { label: "View Orders", icon: <ListAlt />, path: "/admin/orders" },
              { label: "Inventory Alerts", icon: <Inventory />, path: "/admin/inventory" },
            ].map(({ label, icon, path }) => (
              <Grid key={path} size={{ xs: 12, sm: 4 }}>
                <Button component={Link} to={path} fullWidth variant="outlined" startIcon={icon}
                  sx={{ height: 56, fontFamily: "Montserrat", fontWeight: 500, borderRadius: 0, borderColor: "var(--color-outline)", color: "text.primary" }}>
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;
