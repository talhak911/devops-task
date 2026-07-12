import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Breadcrumbs, Link as MuiLink,
  Accordion, AccordionSummary, AccordionDetails,
  Switch, MenuItem, Select, type SelectChangeEvent,
  Checkbox, FormControlLabel, FormGroup, Button, Slider, Rating, Pagination
} from '@mui/material';
import { Add, Remove, ExpandMore, Star } from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { CircularProgress } from '@mui/material';

// Static Filter Data (Origin/Flavor/Caffeine are relatively constant for now)
const ORIGIN_OPTIONS = ['India', 'Japan', 'Iran', 'South Africa', 'China', 'Sri Lanka'];
const FLAVOR_OPTIONS = ['Spicy', 'Sweet', 'Citrus', 'Smooth', 'Fruity', 'Floral', 'Grassy', 'Minty', 'Bitter', 'Creamy'];
const CAFFEINE_OPTIONS = ['None', 'Low', 'Medium', 'High'];

// (Hardcoded products removed to use real data)

const FilterItem = ({
  label,
  options,
  selected,
  onChange,
  defaultExpanded
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (option: string) => void;
  defaultExpanded?: boolean
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded || false);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' },
        borderBottom: '1px solid var(--color-outline)',
        borderRadius: 0,
        m: 0
      }}
    >
      <AccordionSummary
        expandIcon={expanded ?
          <Remove sx={{ color: 'text.primary', fontSize: 20 }} /> :
          <Add sx={{ color: 'text.primary', fontSize: 20 }} />
        }
        sx={{
          px: 0,
          py: 0.5,
          minHeight: '48px',
          '& .MuiAccordionSummary-content': { m: 0, alignItems: 'center' }
        }}
      >
        <Typography sx={{
          fontFamily: 'Montserrat',
          fontWeight: 500,
          fontSize: '16px',
          letterSpacing: '0.15px',
          color: 'text.primary'
        }}>
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
        <FormGroup sx={{ gap: 1 }}>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(option)}
                  onChange={() => onChange(option)}
                  sx={{
                    p: 0.5,
                    color: 'text.primary',
                    '&.Mui-checked': { color: 'primary.main' },
                    '& .MuiSvgIcon-root': { fontSize: 18 }
                  }}
                />
              }
              label={
                <Typography sx={{
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.25px',
                  color: 'text.primary',
                  textTransform: 'capitalize'
                }}>
                  {option}
                </Typography>
              }
              sx={{ m: 0, gap: 1 }}
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );
};

const Collections: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIds = searchParams.getAll('category');
  const searchQuery = searchParams.get('q');

  const [sortBy, setSortBy] = useState('newest');

  // Advanced Filter state
  const [origin, setOrigin] = useState<string[]>([]);
  const [flavor, setFlavor] = useState<string[]>([]);
  const [caffeine, setCaffeine] = useState<string[]>([]);
  const [isOrganic, setIsOrganic] = useState(false);
  const [isVegan, setIsVegan] = useState(false);

  // Pagination & meta
  const [page, setPage] = useState(1);

  // Range/Rating
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [rating, setRating] = useState<number | null>(null);

  // Query Params for TanStack Query
  const productParams = {
    sort: sortBy,
    category: categoryIds.length > 0 ? categoryIds.join(",") : undefined,
    q: searchQuery || undefined,
    origin: origin.length > 0 ? origin.join(",") : undefined,
    flavor: flavor.length > 0 ? flavor.join(",") : undefined,
    caffeine: caffeine.length > 0 ? caffeine.join(",") : undefined,
    isOrganic: isOrganic ? true : undefined,
    isVegan: isVegan ? true : undefined,
    priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
    priceMax: priceRange[1] < 100 ? priceRange[1] : undefined,
    rating: rating || undefined,
    page,
    limit: 12
  };

  const { data: productsData, isLoading: productsLoading } = useProducts(productParams as any);
  const { data: categoriesData } = useCategories();

  const products = productsData?.data || [];
  // Using metadata from response (assuming current backend structure)
  const meta = (productsData as any)?.meta || { total: 0, totalPages: 1 };
  const allCategories = categoriesData?.data || [];
  const category = categoryIds.length === 1 ? allCategories.find((c: any) => c.slug === categoryIds[0]) : null;



  const handleToggle = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
    setPage(1);
  };

  const handleCategoryToggle = (slug: string) => {
    const current = searchParams.getAll('category');
    if (current.includes(slug)) {
      const updated = current.filter(s => s !== slug);
      searchParams.delete('category');
      updated.forEach(s => searchParams.append('category', s));
    } else {
      searchParams.append('category', slug);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setOrigin([]);
    setFlavor([]);
    setCaffeine([]);
    setIsOrganic(false);
    setIsVegan(false);
    setPriceRange([0, 100]);
    setRating(null);
    setPage(1);

    // Clear URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const hasFilters = origin.length > 0 || flavor.length > 0 || caffeine.length > 0 || isOrganic || isVegan || categoryIds.length > 0 || searchQuery || priceRange[0] > 0 || priceRange[1] < 100 || rating !== null;

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {/* Banner */}
      <Box sx={{
        width: '100%',
        height: '308px',
        backgroundImage: 'url("https://images.unsplash.com/photo-1579005162638-11c872e1586e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4, '& .MuiBreadcrumbs-separator': { mx: 1 } }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.1px' }}>
            HOME
          </MuiLink>
          <MuiLink component={Link} to="/collections" underline="hover" color="inherit" sx={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.1px' }}>
            COLLECTIONS
          </MuiLink>
          {categoryIds.length > 0 && (
            <Typography color="text.primary" sx={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.1px', textTransform: 'uppercase' }}>
              {categoryIds.length === 1 ? (category?.name || categoryIds[0].replace(/-/g, ' ')) : 'MULTIPLE COLLECTIONS'}
            </Typography>
          )}
          {searchQuery && (
            <Typography color="text.primary" sx={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.1px' }}>
              SEARCH RESULTS FOR "{searchQuery.toUpperCase()}"
            </Typography>
          )}
        </Breadcrumbs>

        <Grid container spacing={6}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 216 }}>
              {hasFilters && (
                <Button
                  onClick={clearFilters}
                  variant="text"
                  sx={{
                    alignSelf: 'flex-start',
                    mb: 2,
                    p: 0,
                    color: 'text.secondary',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat',
                    '&:hover': { bgcolor: 'transparent', color: 'primary.main', textDecoration: 'underline' }
                  }}
                >
                  CLEAR ALL FILTERS
                </Button>
              )}
              <FilterItem
                label="COLLECTIONS"
                options={allCategories.map(c => c.slug)}
                selected={categoryIds}
                onChange={handleCategoryToggle}
                defaultExpanded
              />
              <FilterItem
                label="ORIGIN"
                options={ORIGIN_OPTIONS}
                selected={origin}
                onChange={(v) => handleToggle(origin, setOrigin, v)}
              />
              <FilterItem
                label="FLAVOR"
                options={FLAVOR_OPTIONS}
                selected={flavor}
                onChange={(v) => handleToggle(flavor, setFlavor, v)}
              />
              <FilterItem
                label="CAFFEINE"
                options={CAFFEINE_OPTIONS}
                selected={caffeine}
                onChange={(v) => handleToggle(caffeine, setCaffeine, v)}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid var(--color-outline)' }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', letterSpacing: '0.15px' }}>
                  ORGANIC
                </Typography>
                <Switch
                  checked={isOrganic}
                  onChange={(e) => { setIsOrganic(e.target.checked); setPage(1); }}
                  sx={{
                    width: 42, height: 26, p: 0,
                    '& .MuiSwitch-switchBase': {
                      p: 0, m: 0.5, transitionDuration: '300ms',
                      '&.Mui-checked': {
                        transform: 'translateX(16px)', color: '#fff',
                        '& + .MuiSwitch-track': { bgcolor: 'primary.main', opacity: 1, border: 0 }
                      }
                    },
                    '& .MuiSwitch-thumb': { boxSizing: 'border-box', width: 18, height: 18 },
                    '& .MuiSwitch-track': { borderRadius: 13, bgcolor: 'transparent', border: '1px solid var(--color-primary)', opacity: 1 }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid var(--color-outline)' }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', letterSpacing: '0.15px' }}>
                  VEGAN
                </Typography>
                <Switch
                  checked={isVegan}
                  onChange={(e) => { setIsVegan(e.target.checked); setPage(1); }}
                  sx={{
                    width: 42, height: 26, p: 0,
                    '& .MuiSwitch-switchBase': {
                      p: 0, m: 0.5, transitionDuration: '300ms',
                      '&.Mui-checked': {
                        transform: 'translateX(16px)', color: '#fff',
                        '& + .MuiSwitch-track': { bgcolor: 'primary.main', opacity: 1, border: 0 }
                      }
                    },
                    '& .MuiSwitch-thumb': { boxSizing: 'border-box', width: 18, height: 18 },
                    '& .MuiSwitch-track': { borderRadius: 13, bgcolor: 'transparent', border: '1px solid var(--color-primary)', opacity: 1 }
                  }}
                />
              </Box>

              {/* Price Range */}
              <Box sx={{ py: 3, borderBottom: '1px solid var(--color-outline)' }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', mb: 4 }}>
                  PRICE RANGE
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, newValue) => setPriceRange(newValue as number[])}
                  onChangeCommitted={() => setPage(1)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  sx={{ color: 'primary.main', ml: 1, width: '90%' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography sx={{ fontSize: '13px', fontFamily: 'Montserrat' }}>€{priceRange[0]}</Typography>
                  <Typography sx={{ fontSize: '13px', fontFamily: 'Montserrat' }}>€{priceRange[1]}</Typography>
                </Box>
              </Box>

              {/* Rating */}
              <Box sx={{ py: 3, borderBottom: '1px solid var(--color-outline)' }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', mb: 2 }}>
                  MIN. RATING
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => { setRating(newValue); setPage(1); }}
                  emptyIcon={<Star style={{ opacity: 0.4 }} fontSize="inherit" />}
                />
              </Box>
            </Box>
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{
                fontFamily: 'Montserrat',
                fontWeight: 600,
                fontSize: { xs: '24px', md: '32px' },
                mb: 1,
                textTransform: 'uppercase'
              }}>
                {searchQuery ? `SEARCH: ${searchQuery}` : (categoryIds.length === 0 ? 'ALL COLLECTIONS' : (categoryIds.length === 1 ? (category?.name || categoryIds[0].replace(/-/g, ' ')) : 'MULTIPLE COLLECTIONS'))}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography sx={{ mr: 1, fontSize: '16px', fontWeight: 500, fontFamily: 'Montserrat', letterSpacing: '0.15px' }}>
                  SORT BY
                </Typography>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  variant="standard"
                  disableUnderline
                  IconComponent={ExpandMore}
                  sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: 500,
                    fontSize: '16px',
                    '& .MuiSelect-select': { py: 0, pr: '24px !important' }
                  }}
                >
                  <MenuItem value="newest">NEWEST</MenuItem>
                  <MenuItem value="price:asc">PRICE LOW TO HIGH</MenuItem>
                  <MenuItem value="price:desc">PRICE HIGH TO LOW</MenuItem>
                </Select>
              </Box>
            </Box>

            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={4} sx={{ rowGap: 6 }}>
                {products.length === 0 ? (
                  <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">No products found in this collection.</Typography>
                  </Box>
                ) : products.map((product) => (
                  <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box component={Link} to={`/product/${product.slug}`} sx={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{
                        width: '100%',
                        aspectRatio: '1/1',
                        backgroundImage: `url(${product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${product.images[0]}`) : 'https://placehold.co/600x600?text=No+Image'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mb: 2,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { transform: 'scale(1.02)' }
                      }} />
                      <Typography sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '24px',
                        color: 'text.primary',
                        mb: 0.5,
                        letterSpacing: '0.5px'
                      }}>
                        {product.title}
                      </Typography>
                      <Typography sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: 'text.secondary',
                        mb: 1,
                        lineHeight: '20px'
                      }}>
                        {product.categoryId?.name}
                      </Typography>
                      <Typography sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'text.primary',
                        letterSpacing: '0.15px'
                      }}>
                        €{((product.basePrice || 0) + (product.variants?.[0]?.priceDelta || 0)).toFixed(2)} {product.variants?.[0]?.label && `/ ${product.variants[0].label}`}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {!productsLoading && meta.totalPages > 1 && (
              <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
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
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default Collections;
