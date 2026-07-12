import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack } from '@mui/material';
import { AccessTime, PersonOutline, ArrowForward } from '@mui/icons-material';
import Footer from '../components/Footer';

const BLOG_POSTS = [
  {
    id: 1,
    title: "The Art of Brewing the Perfect Cup of Chai",
    excerpt: "Discover the secrets behind the aromatic spices and the perfect balance of milk and tea in authentic Indian Chai.",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Brewing Guide",
    author: "Elena Smith",
    date: "March 12, 2024",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Health Benefits of Organic Green Tea",
    excerpt: "Why switching to organic green tea might be the best decision you make for your long-term wellness and energy.",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=1470",
    category: "Wellness",
    author: "David Chen",
    date: "March 10, 2024",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Tea Gardens of Darjeeling: A Visual Journey",
    excerpt: "Step into the mist-covered mountains of India and see where the 'Champagne of Teas' begins its journey.",
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80&w=1470",
    category: "Travel",
    author: "Sarah J.",
    date: "March 05, 2024",
    readTime: "12 min read"
  }
];

const Blog: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {/* Banner */}
      <Box sx={{
        width: '100%', height: '300px',
        bgcolor: 'var(--color-bg-variant)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center', px: 2
      }}>
        <Typography variant="h2" sx={{ fontFamily: '"Prosto One", sans-serif', mb: 2 }}>Our Blog</Typography>
        <Typography variant="h6" sx={{ fontFamily: 'Montserrat', fontWeight: 400, color: 'text.secondary', maxWidth: 600 }}>
          Exploring the world of tea, one steep at a time. Guides, stories, and the culture of brewing.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        {/* Featured Post */}
        <Box sx={{ mb: 10 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{
                width: '100%', aspectRatio: '16/9',
                backgroundImage: `url(${BLOG_POSTS[0].image})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)'
              }} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2.5}>
                <Chip label={BLOG_POSTS[0].category.toUpperCase()} size="small" color="primary" sx={{ width: 'fit-content', borderRadius: 0, fontWeight: 700 }} />
                <Typography variant="h3" sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '32px', lineHeight: 1.2 }}>
                  {BLOG_POSTS[0].title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '18px' }}>
                  {BLOG_POSTS[0].excerpt}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.muted' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOutline fontSize="small" />
                    <Typography variant="caption">{BLOG_POSTS[0].author}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" />
                    <Typography variant="caption">{BLOG_POSTS[0].readTime}</Typography>
                  </Box>
                </Box>
                <Button variant="outlined" color="primary" endIcon={<ArrowForward />} sx={{ width: 'fit-content', mt: 2 }}>
                  READ ARTICLE
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', mb: 6 }}>Recent Stories</Typography>

        <Grid container spacing={4}>
          {BLOG_POSTS.slice(1).map((post) => (
            <Grid key={post.id} size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{
                bgcolor: 'var(--color-bg-variant)', height: '100%',
                display: 'flex', flexDirection: 'column',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-outline)',
                overflow: 'hidden',
                '&:hover img': { transform: 'scale(1.05)' }
              }}>
                <Box sx={{ overflow: 'hidden', height: 260 }}>
                  <CardMedia
                    component="img"
                    height="260"
                    image={post.image}
                    alt={post.title}
                    sx={{ transition: 'transform 0.5s ease', objectFit: 'cover' }}
                  />
                </Box>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={2}>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5 }}>
                      {post.category.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px' }}>
                      {post.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 3 }}>
                      <Typography variant="caption" sx={{ color: 'text.muted' }}>{post.date} • {post.readTime}</Typography>
                      <Button color="primary" sx={{ fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}>READ MORE</Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Newsletter Section */}
        <Box sx={{
          mt: 12, p: { xs: 4, md: 8 },
          bgcolor: 'var(--color-bg-variant)',
          textAlign: 'center', borderRadius: 'var(--radius-lg)'
        }}>
          <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', mb: 2 }}>Join our tea community</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 500, mx: 'auto' }}>
            Get brewing tips, exclusive recipes, and early access to new collections directly in your inbox.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Box component="input" placeholder="Your email address" sx={{
              px: 3, py: 2, width: { xs: '100%', sm: 300 },
              bgcolor: 'background.default', border: '1px solid var(--color-outline)',
              color: 'text.primary', fontFamily: 'Montserrat', outline: 'none',
              '&:focus': { borderColor: 'primary.main' }
            }} />
            <Button variant="contained" color="primary" sx={{ px: 4, py: 2 }}>SUBSCRIBE</Button>
          </Stack>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Blog;
