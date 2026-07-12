import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { LocationOn, Mail, Call } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';

const Footer: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoriesApi.getAll();
        setCategories(data.data);
      } catch (err) {
        console.error('Failed to fetch footer categories', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Box sx={{ bgcolor: 'var(--color-bg-variant)', pt: { xs: 4, md: 8 }, pb: { xs: 4, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid size={{ xs: 6, md: 3 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              mb: { xs: 1.5, md: 3 }, 
              textTransform: 'uppercase',
              fontFamily: 'Montserrat',
              fontSize: '16px',
              color: 'text.primary'
            }}>Collections</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1 } }}>
              {categories.slice(0, 9).map(cat => (
                <Typography 
                  key={cat._id} 
                  component={Link} 
                  to={`/collections?category=${cat.slug}`}
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary', 
                    textDecoration: 'none',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    cursor: 'pointer', 
                    '&:hover': { color: 'primary.main' } 
                  }}
                >
                  {cat.name}
                </Typography>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              mb: { xs: 1.5, md: 3 }, 
              textTransform: 'uppercase',
              fontFamily: 'Montserrat',
              fontSize: '16px',
              color: 'text.primary'
            }}>Learn</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1 } }}>
              {['About us', 'About our teas', 'Tea academy'].map(item => (
                <Typography key={item} variant="body2" sx={{ 
                  color: 'text.primary', 
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  cursor: 'pointer', 
                  '&:hover': { color: 'primary.main' } 
                }}>{item}</Typography>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              mb: { xs: 1.5, md: 3 }, 
              textTransform: 'uppercase',
              fontFamily: 'Montserrat',
              fontSize: '16px',
              color: 'text.primary'
            }}>Customer Service</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1 } }}>
              {['Ordering and payment', 'Delivery', 'Privacy and policy', 'Terms & Conditions'].map(item => (
                <Typography key={item} variant="body2" sx={{ 
                  color: 'text.primary', 
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  cursor: 'pointer', 
                  '&:hover': { color: 'primary.main' } 
                }}>{item}</Typography>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 500, 
              mb: { xs: 1.5, md: 3 }, 
              textTransform: 'uppercase',
              fontFamily: 'Montserrat',
              fontSize: '16px',
              color: 'text.primary'
            }}>Contact Us</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 2 } }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, color: 'text.primary' }} />
                <Typography variant="body2" sx={{ 
                  color: 'text.primary', 
                  fontFamily: 'Montserrat',
                  fontSize: '14px'
                }}>3 Falahi, Falahi St, Pasdaran Ave, Shiraz, Fars Provieence Iran</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Mail sx={{ fontSize: 18, color: 'text.primary' }} />
                <Typography variant="body2" sx={{ 
                  color: 'text.primary', 
                  fontFamily: 'Montserrat',
                  fontSize: '14px'
                }}>Email: amoopur@gmail.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Call sx={{ fontSize: 18, color: 'text.primary' }} />
                <Typography variant="body2" sx={{ 
                  color: 'text.primary', 
                  fontFamily: 'Montserrat',
                  fontSize: '14px'
                }}>Tel: +98 9173038406</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
