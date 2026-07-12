import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, CircularProgress, 
  Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import {TrendingUp} from '@mui/icons-material';
import { useAnalytics } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminAnalytics: React.FC = () => {
  const [range, setRange] = useState('30d');
  const { data: analyticsRes, isLoading: loading } = useAnalytics(range);
  const data = analyticsRes?.data;

  if (loading && !data) return <AdminLayout><Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box></AdminLayout>;

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Range</InputLabel>
          <Select value={range} label="Range" onChange={(e) => setRange(e.target.value)}>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, border: '1px solid var(--color-outline)' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Total Revenue</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 700 }}>€{(data?.revenue ?? 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
           <Paper sx={{ p: 4, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-outline)' }} elevation={0}>
             <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary' }}>Detailed charts and time-series data visualization would be implemented here using a library like Recharts.</Typography>
           </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminAnalytics;
