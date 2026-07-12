import React from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider,
  Button, Stack, List, ListItem,
  CircularProgress
} from '@mui/material';
import { Close, Add, Remove, ShoppingBagOutlined } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cart, loading, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      slotProps={{
        backdrop: {
          sx: {
            top: '80px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }
        }
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 501 },
          height: 'calc(100vh - 80px)',
          top: '80px !important',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      ModalProps={{ keepMounted: true, disableScrollLock: true }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '22px' }}>
          My Bag {cart?.items.length ? `(${cart.items.length})` : ''}
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading && !cart ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
            <CircularProgress />
          </Box>
        ) : !cart || cart.items.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
            <ShoppingBagOutlined sx={{ fontSize: 64, color: 'var(--color-outline)', mb: 2 }} />
            <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Your bag is empty</Typography>
            <Button onClick={onClose} sx={{ mt: 2, fontFamily: 'Montserrat', color: 'primary.main' }}>Continue Shopping</Button>
          </Box>
        ) : (
          <List disablePadding>
            {cart.items.map((item) => (
              <ListItem key={item._id} sx={{ px: 0, py: 3, alignItems: 'flex-start', opacity: loading ? 0.6 : 1 }}>
                <Box sx={{
                  width: 71, height: 71,
                  backgroundImage: `url(${item.productImage ? (item.productImage.startsWith('http') ? item.productImage : `${import.meta.env.VITE_API_URL}/${item.productImage}`) : 'https://placehold.co/100x100?text=No+Image'})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  mr: 3, flexShrink: 0, bgcolor: 'var(--color-bg-variant)'
                }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', lineHeight: 1.3, maxWidth: 220 }}>
                      {item.productTitle} — {item.variantLabel}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-outline)', px: 0.5 }}>
                      <IconButton size="small" onClick={() => updateCartItem(item._id, item.quantity - 1)} disabled={item.quantity <= 1}><Remove sx={{ fontSize: 14 }} /></IconButton>
                      <Typography sx={{ mx: 1, fontSize: '14px', fontFamily: 'Montserrat', fontWeight: 600 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateCartItem(item._id, item.quantity + 1)}><Add sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography onClick={() => removeCartItem(item._id)} sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'error.main' }, textDecoration: 'underline' }}>
                      REMOVE
                    </Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '15px' }}>€{(item.lineTotal).toFixed(2)}</Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {cart && cart.items.length > 0 && (
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Divider sx={{ mb: 3, borderColor: 'var(--color-outline)' }} />
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px' }}>Subtotal</Typography>
              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px' }}>Delivery</Typography>
              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart.delivery.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '16px' }}>Total</Typography>
              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '20px' }}>€{cart.total.toFixed(2)}</Typography>
            </Box>
          </Stack>
          <Button fullWidth variant="contained" color="primary" onClick={handleCheckout} disabled={loading}
            sx={{ height: 56, borderRadius: 0, fontFamily: 'Montserrat', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
            CHECKOUT
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
