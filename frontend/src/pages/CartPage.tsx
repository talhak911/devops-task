import React from 'react';
import { 
  Box, Container, Grid, Typography, Divider, 
  Button, IconButton, Stack, List, ListItem, CircularProgress
} from '@mui/material';
import { 
  Add, Remove, ChevronRight, ShoppingBagOutlined
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { cart, loading, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // For now redirect to a placeholder or handled COD final step
    // In a real app we'd have a /checkout page for address
    navigate('/checkout');
  };

  if (!cart && loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 6, pb: 10 }}>
        {/* Stepper Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 8, gap: 4 }}>
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
            1. MY BAG
          </Typography>
          <Divider sx={{ flex: 1, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 400, color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
            2. DELIVERY
          </Typography>
          <Divider sx={{ flex: 1, borderColor: 'var(--color-outline)' }} />
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 400, color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
            3. REVIEW & PAYMENT
          </Typography>
        </Box>

        {(!cart || cart.items.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            {loading && !cart ? (
               <CircularProgress />
            ) : (
              <>
                <ShoppingBagOutlined sx={{ fontSize: 80, color: 'var(--color-outline)', mb: 3 }} />
                <Typography variant="h4" sx={{ fontFamily: 'Montserrat', mb: 2 }}>Your bag is empty</Typography>
                <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary', mb: 4 }}>Looks like you haven't added any tea to your bag yet.</Typography>
                <Button variant="contained" color="primary" component={Link} to="/collections" 
                  sx={{ height: 56, px: 6, borderRadius: 0, fontFamily: 'Montserrat', '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                  START SHOPPING
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Grid container spacing={12} sx={{ opacity: loading ? 0.7 : 1 }}>
            {/* Cart Contents */}
            <Grid size={{ xs: 12, md: 7 }}>
              <List disablePadding>
                {cart.items.map((item) => (
                  <ListItem key={item._id} sx={{ px: 0, py: 4, alignItems: 'flex-start', borderBottom: '1px solid var(--color-outline)' }}>
                    <Box sx={{ 
                      width: 100, height: 100, 
                      backgroundImage: `url(${item.productImage ? (item.productImage.startsWith('http') ? item.productImage : `${import.meta.env.VITE_API_URL}/${item.productImage}`) : 'https://placehold.co/100x100?text=No+Image'})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      mr: 3, flexShrink: 0, bgcolor: 'var(--color-bg-variant)'
                    }} />
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: 500, lineHeight: 1.3, mb: 1 }}>
                            {item.productTitle}
                          </Typography>
                          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: 'text.secondary', mb: 2 }}>
                            {item.variantLabel}
                          </Typography>
                          <Typography onClick={() => removeCartItem(item._id)} 
                            sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: 'error.main' } }}>
                            REMOVE
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-outline)', px: 1, height: 40 }}>
                          <IconButton size="small" onClick={() => updateCartItem(item._id, item.quantity - 1)} disabled={item.quantity <= 1}><Remove sx={{ fontSize: 18 }} /></IconButton>
                          <Typography sx={{ mx: 2, fontSize: '16px', fontFamily: 'Montserrat', fontWeight: 600 }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateCartItem(item._id, item.quantity + 1)}><Add sx={{ fontSize: 18 }} /></IconButton>
                        </Box>

                        <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '18px', ml: 4, minWidth: 80, textAlign: 'right' }}>
                          €{item.lineTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px' }}>Subtotal</Typography>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '18px' }}>€{cart.subtotal.toFixed(2)}</Typography>
              </Box>

              <Button variant="outlined" component={Link} to="/collections"
                sx={{ mt: 6, height: 56, px: 4, borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', fontWeight: 600, borderRadius: 0 }}>
                BACK TO SHOPPING
              </Button>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ bgcolor: 'var(--color-bg-variant)', p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '22px', mb: 4 }}>
                  Order summary
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px' }}>Subtotal</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px' }}>Delivery</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart.delivery.toFixed(2)}</Typography>
                  </Box>
                </Stack>
                
                <Divider sx={{ mb: 3, borderColor: 'var(--color-outline)' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px' }}>Total</Typography>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px' }}>€{cart.total.toFixed(2)}</Typography>
                </Box>

                <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: 'text.secondary', mb: 4 }}>
                  Estimated shipping time: 2-3 business days
                </Typography>

                <Button fullWidth variant="contained" color="primary" onClick={handleCheckout}
                  sx={{ height: 64, fontFamily: 'Montserrat', fontWeight: 700, fontSize: '18px', borderRadius: 0, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                  CHECK OUT
                </Button>
              </Box>

              {/* Payment Type */}
              <Box sx={{ bgcolor: 'var(--color-bg-variant)', p: 4, mb: 4 }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '20px', mb: 3 }}>
                  Payment type
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Chip label="CASH ON DELIVERY" variant="outlined" sx={{ borderRadius: 0, fontFamily: 'Montserrat', fontWeight: 600 }} />
                </Stack>
                <Typography sx={{ mt: 2, fontSize: '12px', color: 'text.secondary', fontFamily: 'Montserrat' }}>
                  Pay with cash when your tea arrives at your doorstep.
                </Typography>
              </Box>

              {/* Delivery info */}
              <Box sx={{ bgcolor: 'var(--color-bg-variant)', p: 4 }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '20px', mb: 3 }}>
                  Delivery Info
                </Typography>
                <Stack spacing={2}>
                  {[
                    "Orders before 12:00 ship same day.",
                    "Free delivery on orders over €50.",
                    "Sealed for freshness & quality."
                  ].map(txt => (
                    <Box key={txt} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <ChevronRight fontSize="small" color="primary" />
                      <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px' }}>{txt}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default CartPage;
