import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Divider,
  Button, TextField, Stack, Card, CircularProgress, Alert, List
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useCreateOrder } from '../hooks/useOrders';

const schema = yup.object({
  name: yup.string().min(2, "Name is too short").required("Full name is required"),
  street: yup.string().min(5, "Please provide a valid street address").required("Street is required"),
  city: yup.string().min(2, "City name is too short").required("City is required"),
  postalCode: yup.string().min(4, "Invalid postal code").required("Postal code is required"),
  country: yup.string().required("Country is required"),
});

type FormData = yup.InferType<typeof schema>;

const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: createOrder, isPending: loading } = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", street: "", city: "", postalCode: "", country: "Netherlands" }
  });

  const onSubmit = async (values: FormData) => {
    if (!cart || cart.items.length === 0) return;

    setError("");
    try {
      const res = await createOrder({ shippingAddress: values });
      setOrderId(res.data.data._id);
      setSuccess(true);
      refreshCart();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to place order. Please check your details.");
    }
  };

  if (success) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="sm" sx={{ py: 12, flex: 1 }}>
          <Box sx={{ textAlign: 'center', p: 6, border: '1px solid var(--color-outline)' }}>
            <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" sx={{ fontFamily: 'Montserrat', mb: 2, fontWeight: 600 }}>Thank you!</Typography>
            <Typography sx={{ fontFamily: 'Montserrat', mb: 4, color: 'text.secondary' }}>
              Your order <strong>#{orderId.slice(-8).toUpperCase()}</strong> has been placed successfully.
              We'll send you a confirmation email shortly.
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Stack spacing={2}>
              <Button variant="contained" color="primary" component={Link} to="/" fullWidth
                sx={{ height: 56, bgcolor: 'primary.main', borderRadius: 0, fontFamily: 'Montserrat', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                CONTINUE SHOPPING
              </Button>
            </Stack>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!cart && !loading) return <Navigate to="/cart" />;

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 6, pb: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 8, gap: 4 }}>
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 400, color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
            1. MY BAG
          </Typography>
          <Divider sx={{ flex: 1, borderColor: 'primary.main' }} />
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
            2. DELIVERY
          </Typography>
          <Divider sx={{ flex: 1, borderColor: 'var(--color-outline)' }} />
          <Typography sx={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 400, color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
            3. REVIEW & PAYMENT
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={12}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat', fontWeight: 600, mb: 4 }}>Shipping Address</Typography>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Stack spacing={3}>
                <TextField
                  label="Full Name" fullWidth size="small"
                  {...register("name")}
                  error={!!errors.name} helperText={errors.name?.message}
                />
                <TextField
                  label="Street & Number" fullWidth size="small"
                  {...register("street")}
                  error={!!errors.street} helperText={errors.street?.message}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 7 }}>
                    <TextField
                      label="City" fullWidth size="small"
                      {...register("city")}
                      error={!!errors.city} helperText={errors.city?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 5 }}>
                    <TextField
                      label="Postal Code" fullWidth size="small"
                      {...register("postalCode")}
                      error={!!errors.postalCode} helperText={errors.postalCode?.message}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Country" fullWidth size="small"
                  {...register("country")}
                  error={!!errors.country} helperText={errors.country?.message}
                />
              </Stack>

              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Montserrat', fontWeight: 600, mb: 2 }}>Payment Method</Typography>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 0, border: '1px solid primary.main', bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Cash on Delivery (COD)</Typography>
                  <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 1 }}>Pay directly with cash when your package is delivered.</Typography>
                </Card>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ bgcolor: 'var(--color-bg-variant)', p: 4, position: 'sticky', top: 100 }}>
                <Typography variant="h5" sx={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '22px', mb: 4 }}>
                  Order summary
                </Typography>

                <List disablePadding sx={{ mb: 3 }}>
                  {cart?.items.map(item => (
                    <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Montserrat' }}>{item.productTitle} × {item.quantity}</Typography>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Montserrat', fontWeight: 600 }}>€{item.lineTotal.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </List>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px' }}>Subtotal</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart?.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px' }}>Delivery</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>€{cart?.delivery.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '18px' }}>Total</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px' }}>€{cart?.total.toFixed(2)}</Typography>
                  </Box>
                </Stack>

                <Button fullWidth variant="contained" type="submit" disabled={loading || !cart?.items.length}
                  sx={{ height: 64, bgcolor: 'primary.main', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '18px', borderRadius: 0 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : `PLACE ORDER — €${cart?.total.toFixed(2)}`}
                </Button>

                <Button fullWidth component={Link} to="/cart" sx={{ mt: 2, fontFamily: 'Montserrat', color: 'text.secondary' }}>
                  BACK TO BAG
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
      <Footer />
    </Box>
  );
};

export default CheckoutPage;
