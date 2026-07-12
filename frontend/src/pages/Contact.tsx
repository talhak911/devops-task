import React from 'react';
import {
  Box, Container, Typography, Grid, TextField, Button,
  Stack, Paper
} from '@mui/material';
import {
  EmailOutlined, PhoneOutlined, LocationOnOutlined,
  WhatsApp, Instagram, Facebook
} from '@mui/icons-material';
import Footer from '../components/Footer';

const ContactItem: React.FC<{ icon: React.ReactNode; title: string, content: string }> = ({ icon, title, content }) => (
  <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 5 }}>
    <Box sx={{
      p: 1.5, bgcolor: 'var(--color-bg-variant)',
      color: 'primary.main', display: 'flex', borderRadius: '50%'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Montserrat', mb: 0.5, letterSpacing: 1 }}>{title.toUpperCase()}</Typography>
      <Typography sx={{ color: 'text.secondary', fontFamily: 'Montserrat', fontSize: '15px' }}>{content}</Typography>
    </Box>
  </Stack>
);

const Contact: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        width: '100%', height: '350px',
        backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', position: 'relative',
        '&::after': {
          content: '""', position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.5)'
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{
            fontFamily: '"Prosto One", sans-serif', color: 'white',
            fontSize: { xs: '40px', md: '64px' }, mb: 2
          }}>Get in Touch</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: 500 }}>
            Have a question about our teas? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2, pb: 12 }}>
        <Paper elevation={0} sx={{
          p: { xs: 4, md: 8 },
          bgcolor: 'background.paper',
          border: '1px solid var(--color-outline)',
          borderRadius: 0
        }}>
          <Grid container spacing={10}>
            {/* Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 700, mb: 4 }}>Send Message</Typography>
              <Box component="form" noValidate>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Full Name" variant="outlined" placeholder="John Doe" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Email Address" variant="outlined" placeholder="john@example.com" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Subject" variant="outlined" placeholder="Product Inquiry" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline rows={6} label="Your Message" variant="outlined" placeholder="How can we help you?" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button variant="contained" color="primary" size="large" sx={{
                      height: 56, px: 6, borderRadius: 0,
                      fontWeight: 700, fontSize: '16px', letterSpacing: 1
                    }}>
                      SEND MESSAGE
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Information */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 700, mb: 6 }}>Contact Info</Typography>

              <ContactItem icon={<EmailOutlined />} title="Email" content="hello@brandname.com" />
              <ContactItem icon={<PhoneOutlined />} title="Phone" content="+1 (234) 567-890" />
              <ContactItem icon={<LocationOnOutlined />} title="Boutique Shop" content="123 Tea Garden St, London, UK" />

              <Box sx={{ mt: 10 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Montserrat', mb: 3, letterSpacing: 1 }}>FOLLOW US</Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton sx={{ bgcolor: 'var(--color-bg-variant)', '&:hover': { color: 'primary.main' } }}><Instagram /></IconButton>
                  <IconButton sx={{ bgcolor: 'var(--color-bg-variant)', '&:hover': { color: 'primary.main' } }}><Facebook /></IconButton>
                  <IconButton sx={{ bgcolor: 'var(--color-bg-variant)', '&:hover': { color: 'primary.main' } }}><WhatsApp /></IconButton>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

// Re-using IconButton from MUI for simplicity
const IconButton: React.FC<{ children: React.ReactNode, sx?: any }> = ({ children, sx }) => (
  <Button sx={{
    minWidth: 48, width: 48, height: 48, borderRadius: '50%', p: 0, color: 'text.primary', ...sx
  }}>
    {children}
  </Button>
);

export default Contact;
