import React, { useState } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, 
  IconButton, Collapse, CircularProgress, Button, Pagination
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, LocalMall } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import Footer from '../components/Footer';

interface OrderRowProps {
  order: any;
}

const OrderRow: React.FC<OrderRowProps> = ({ order }) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>
          #{order._id.slice(-8).toUpperCase()}
        </TableCell>
        <TableCell sx={{ fontFamily: 'Montserrat' }}>
          {new Date(order.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell sx={{ fontFamily: 'Montserrat' }}>
          <Chip 
            label={order.status.toUpperCase()} 
            size="small" 
            color={getStatusColor(order.status) as any}
            sx={{ fontWeight: 600, fontSize: '11px' }}
          />
        </TableCell>
        <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>
          €{order.total.toFixed(2)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 2 }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>
                Order Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell sx={{ fontFamily: 'Montserrat' }}>
                        {item.productTitle} {item.variantLabel && `(${item.variantLabel})`}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Montserrat' }}>{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Montserrat' }}>€{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>
                        €{item.lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Subtotal</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat' }}>€{order.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Delivery</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat' }}>€{order.delivery.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '1.1rem' }}>
                      €{order.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--color-bg-variant)', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: 'Montserrat', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  SHIPPING ADDRESS
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat' }}>
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                  {order.shippingAddress.country}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const UserDashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: ordersRes, isLoading: loading } = useOrders(page);
  const orders = ordersRes?.data || [];
  const meta = ordersRes?.meta || { total: 0, totalPages: 1 };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontFamily: '"Prosto One", sans-serif', mb: 2 }}>
            My Dashboard
          </Typography>
          <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>
            View your order history and track recent purchases
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed var(--color-border)', borderRadius: 0 }}>
            <LocalMall sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat', mb: 1 }}>
              No orders found
            </Typography>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary', mb: 3 }}>
              You haven't placed any orders yet.
            </Typography>
            <Button component={Link} to="/collections" variant="contained" color="primary" sx={{ borderRadius: 0, px: 4, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
              START SHOPPING
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: '1px solid var(--color-outline)', borderRadius: 0 }}>
            <Table aria-label="collapsible table">
              <TableHead sx={{ bgcolor: 'var(--color-bg-variant)' }}>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>ORDER ID</TableCell>
                  <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>DATE</TableCell>
                  <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {meta.totalPages > 0 && (
          <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: 'text.secondary' }}>
              Showing {orders.length} of {meta.total} orders
            </Typography>
            <Pagination 
              count={meta.totalPages} 
              page={page} 
              onChange={handlePageChange}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontFamily: 'Montserrat',
                  fontWeight: 600,
                  borderRadius: 0,
                  border: '1px solid var(--color-outline)',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    border: 'none',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default UserDashboard;
