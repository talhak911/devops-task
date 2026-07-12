import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Breadcrumbs, Link as MuiLink, 
  Button, IconButton, Stack, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  Add, Remove, Public, Grass, 
  Thermostat, Timer
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import ReviewSection from '../components/ReviewSection';
import { useProductBySlug } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

const VariantIcon: React.FC<{ label: string }> = ({ label }) => {
  const weightMatch = label.match(/\d+/);
  const weight = weightMatch ? weightMatch[0] : (label.toLowerCase().includes('1kg') ? '1kg' : label);
  const isSampler = label.toLowerCase().includes('sampler');
  const isTin = label.toLowerCase().includes('170') || label.toLowerCase().includes('tin');
  const color = "currentColor";

  if (isSampler) {
    return (
      <svg width="42" height="54" viewBox="0 0 42 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.5 5.5C21 5.5 20.3 5.8 19.8 7.5C19.3 9.2 19.8 13.5 21.5 13.5C23.2 13.5 24 11 25.5 8.5C26.5 6.5 29 5 32 5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none"/>
        <path d="M12 17.5V49.5H31V17.5L27.5 13.5H15.5L12 17.5Z" stroke={color} strokeWidth="1"/>
      </svg>
    );
  }

  if (isTin) {
      return (
        <svg width="42" height="54" viewBox="0 0 42 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="11.5" y="22" width="19" height="23" stroke={color} strokeWidth="1.2"/>
            <ellipse cx="21" cy="22" rx="9.5" ry="4" stroke={color} strokeWidth="1.2"/>
            <ellipse cx="21" cy="18" rx="9.5" ry="4" stroke={color} strokeWidth="1.2"/>
            <ellipse cx="21" cy="45" rx="9.5" ry="4" stroke={color} strokeWidth="1.2"/>
            <text x="21" y="36" textAnchor="middle" fontFamily="Montserrat" fontSize="6px" fontWeight="600" fill={color}>{weight}</text>
        </svg>
      );
  }

  // Bag SVG (provided by user, text path replaced with <text>)
  return (
    <svg width="42" height="54" viewBox="0 0 42 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="21" y="32.5" textAnchor="middle" fontFamily="Montserrat" fontSize="7px" fontWeight="500" fill={color}>{weight === '1kg' ? '1 kg' : weight}</text>
      <path d="M9 6.3714H33" stroke={color} strokeLinecap="round"/>
      <path d="M10.8545 0.5H32.1455C32.9299 0.50008 33.5814 1.10457 33.6406 1.88672L37.3389 50.8877C37.4043 51.7579 36.7164 52.4998 35.8438 52.5H7.15625C6.28365 52.4998 5.59568 51.7578 5.66113 50.8877L9.35938 1.88672C9.41862 1.1046 10.0701 0.500136 10.8545 0.5Z" stroke={color}/>
      <path d="M7.50003 16.8713L2.3609 31.2608C0.832663 35.5399 0.807052 40.2118 2.28828 44.5074L5.00002 52.3714" stroke={color} strokeLinecap="round"/>
      <path d="M34.5 16.8713L39.678 31.3697C41.1824 35.5822 41.2313 40.1774 39.8168 44.421L37 52.8714" stroke={color} strokeLinecap="round"/>
    </svg>
  );
};

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: productData, isLoading: loading, isError } = useProductBySlug(slug!);
  const product = productData?.data;

  useEffect(() => {
    if (product && product.variants?.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0]._id);
    }
  }, [product, selectedVariantId]);

  const handleAdd = async () => {
    if (!selectedVariantId || !product) return;
    setAdding(true);
    try {
      await addToCart(product._id, selectedVariantId, quantity);
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Box sx={{ py: 20, textAlign: 'center' }}><CircularProgress /></Box>;
  if (isError || !product) return <Box sx={{ py: 20, textAlign: 'center' }}><Alert severity="error">Product not found</Alert></Box>;

  const selectedVariant = product.variants.find((v: any) => v._id === selectedVariantId);

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 6, pb: 10 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 5 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ fontSize: '14px', fontWeight: 500 }}>HOME</MuiLink>
          <MuiLink component={Link} to="/collections" underline="hover" color="inherit" sx={{ fontSize: '14px', fontWeight: 500 }}>COLLECTIONS</MuiLink>
          {product.categoryId && (
            <MuiLink component={Link} to={`/collections?category=${product.categoryId.slug}`} underline="hover" color="inherit" sx={{ fontSize: '14px', fontWeight: 500 }}>
              {product.categoryId.name.toUpperCase()}
            </MuiLink>
          )}
          <Typography color="text.primary" sx={{ fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>{product.title}</Typography>
        </Breadcrumbs>

        <Grid container spacing={{ xs: 6, md: 12 }}>
          {/* Product Image */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ 
              width: '100%', 
              aspectRatio: '1/1', 
              backgroundImage: `url(${product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/${product.images[0]}`) : 'https://placehold.co/600x600?text=No+Image'})`,
              backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 0, bgcolor: 'var(--color-bg-variant)'
            }} />
          </Grid>

          {/* Product Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h3" sx={{ fontFamily: '"Prosto One", sans-serif', fontSize: { xs: '28px', md: '36px' }, mb: 2 }}>
              {product.title}
            </Typography>
            
            <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px', color: 'text.secondary', mb: 3 }}>
              {product.description}
            </Typography>

            <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public sx={{ fontSize: 20 }} />
                <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 500 }}>{product.origin || 'Unknown'}</Typography>
              </Box>
              {product.tags?.map((tag: string) => (
                <Box key={tag} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Grass sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 500 }}>{tag}</Typography>
                </Box>
              ))}
            </Stack>

            <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', mb: 4 }}>
              €{((product.basePrice || 0) + (selectedVariant?.priceDelta || 0)).toFixed(2)}
            </Typography>

            <Typography sx={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 600, mb: 3 }}>Variants</Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
              {product.variants.map((v: any) => (
                <Grid key={v._id}>
                  <Box 
                    onClick={() => setSelectedVariantId(v._id)}
                    sx={{ 
                      width: 96, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid',
                      borderColor: selectedVariantId === v._id ? 'primary.main' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      '&:hover': { bgcolor: selectedVariantId === v._id ? 'transparent' : 'rgba(0,0,0,0.02)' }
                    }}
                  >
                    <Box sx={{ color: 'text.primary', mb: 1.5 }}>
                      <VariantIcon label={v.label} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 400, color: 'text.primary', whiteSpace: 'nowrap' }}>
                        {v.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {(selectedVariant?.stockQuantity ?? 0) <= 0 ? (
               <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>Out of Stock </Alert>
            ) : (
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-outline)', height: 56, px: 1.5 }}>
                  <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Remove /></IconButton>
                  <Typography sx={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton onClick={() => setQuantity(quantity + 1)} disabled={quantity >= (selectedVariant?.stockQuantity || 0)}><Add /></IconButton>
                </Box>
                
                <Button 
                  variant="contained" color="primary" fullWidth disabled={adding} onClick={handleAdd}
                  sx={{ height: 56, maxWidth: 300, borderRadius: 0, fontFamily: 'Montserrat', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                  {adding ? <CircularProgress size={24} color="inherit" /> : 'ADD TO BAG'}
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>

        {/* Details Sections */}
        <Box sx={{ mt: 10, pt: 10, borderTop: '1px solid var(--color-outline)' }}>
            <Grid container spacing={10}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Montserrat', mb: 4 }}>Steeping instructions</Typography>
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><Thermostat color="primary" /><Typography sx={{ fontFamily: 'Montserrat' }}>TEMPERATURE: {product.brewing?.temperature || '100°C'}</Typography></Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><Timer color="primary" /><Typography sx={{ fontFamily: 'Montserrat' }}>TIME: {product.brewing?.time || '3-5 min'}</Typography></Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#BC575F' }} /><Typography sx={{ fontFamily: 'Montserrat' }}>COLOR AFTER STEEPING</Typography></Box>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Montserrat', mb: 3 }}>Ingredients</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary', lineHeight: 1.8 }}>
                        {product.ingredients?.join(', ') || 'Selection of fine tea leaves and natural ingredients.'}
                    </Typography>
                </Grid>
            </Grid>
        </Box>

        {/* Review Section */}
        {product && (
          <Box id="reviews" sx={{ mt: 10, pt: 10, borderTop: '1px solid var(--color-outline)' }}>
             <ReviewSection productId={product._id} />
          </Box>
        )}
      </Container>
      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)} message="Added to bag!" />
      <Footer />
    </Box>
  );
};

export default ProductDetail;
