import React from 'react';
import { Box, Typography } from '@mui/material';

// Versão ultra-simplificada que apenas exibe os dados
const KpiCard = ({ icon, title, value }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{
        mr: 2,
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#111827' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default KpiCard;