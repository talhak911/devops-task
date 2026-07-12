import React from 'react';
import { Box, Typography, Button, Grid, Container, CircularProgress } from '@mui/material';
import { LocalCafe, Redeem, LocalShipping, Sell } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

const Home: React.FC = () => {
  const { data: catRes, isLoading: catLoading } = useCategories();
  const { data: prodRes, isLoading: prodLoading } = useProducts({ limit: 3, sort: '-sales' } as any);

  const categories = catRes?.data || [];
  const bestSellers = prodRes?.data || [];
  const loading = catLoading || prodLoading;

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Hero Section */}
      <Box component="section" sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: { xs: 4, lg: 10 },
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        <Box sx={{
          flex: 1,
          width: '100%',
          aspectRatio: '1/1',
          backgroundImage: 'url("https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 0
        }} />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 500 }}>
          <Typography variant="h2" sx={{
            fontFamily: '"Prosto One", sans-serif',
            fontSize: { xs: '36px', md: '56px' },
            lineHeight: 1.1,
            fontWeight: 400
          }}>
            Every day is unique, just like our tea
          </Typography>
          <Typography sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'text.secondary'
          }}>
            Discover our curated collection of organic, handcrafted teas from the world's finest tea gardens. Each tea is selected for its unique flavor profile and health benefits.
          </Typography>
          <Button component={Link} to="/collections" variant="contained" color="primary" sx={{
            py: 2, px: 6, width: 'fit-content',
            fontSize: '14px', fontFamily: 'Montserrat', fontWeight: 600, borderRadius: 0,
            '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' }
          }}>
            BROWSE COLLECTIONS
          </Button>
        </Box>
      </Box>

      {/* Features Bar */}
      <Box sx={{ bgcolor: 'var(--color-bg-variant)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            {[
              { icon: <LocalCafe />, label: '450+ KINDS OF LOOSE TEA' },
              { icon: <Redeem />, label: 'CERTIFIED ORGANIC TEAS' },
              { icon: <LocalShipping />, label: 'FREE DELIVERY OVER €50' },
              { icon: <Sell />, label: 'SAMPLES FOR ALL TEAS' },
            ].map((feature, idx) => (
              <Grid key={idx} size={{ xs: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex' }}>{feature.icon}</Box>
                  <Typography sx={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {feature.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Best Sellers */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontFamily: '"Prosto One", sans-serif', textAlign: 'center', mb: 8 }}>
            Best Sellers
          </Typography>
          {loading ? <Box textAlign="center"><CircularProgress /></Box> : (
            <Grid container spacing={4}>
              {bestSellers.map((product) => (
                <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box component={Link} to={`/product/${product.slug}`} sx={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                    <Box sx={{
                      width: '100%', aspectRatio: '1/1',
                      backgroundImage: `url(${product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/${product.images[0]}`) : 'https://placehold.co/600x600?text=No+Image'})`,
                      backgroundSize: 'cover', backgroundPosition: 'center', mb: 2,
                      transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 }
                    }} />
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: 600, mb: 0.5 }}>{product.title}</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: 'text.secondary', mb: 1 }}>{product.categoryId?.name}</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>from €{((product.basePrice || 0) + (product.variants?.[0]?.priceDelta || 0)).toFixed(2)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Collections Grid */}
      <Box sx={{ bgcolor: 'var(--color-bg-variant)', py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontFamily: '"Prosto One", sans-serif', textAlign: 'center', mb: 8 }}>
            Explore Collections
          </Typography>
          {loading ? <Box textAlign="center" width="100%"><CircularProgress /></Box> : (
            <Grid container spacing={3}>
              {categories.map((cat) => (
                <Grid key={cat._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box component={Link} to={`/collections?category=${cat.slug}`} sx={{
                    textDecoration: 'none', color: 'inherit', textAlign: 'center',
                    display: 'block', '&:hover img': { transform: 'scale(1.05)' }
                  }}>
                    <Box sx={{ overflow: 'hidden', mb: 2 }}>
                      <Box component="img" src={cat.imageUrl ? (cat.imageUrl.startsWith('http') ? cat.imageUrl : `http://localhost:5000/${cat.imageUrl}`) : 'https://placehold.co/600x600?text=No+Image'}
                        sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'uppercase' }}>
                      {cat.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
