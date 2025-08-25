import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './SideBar';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - 240px)` }}
      >
        
        {/* O <Outlet /> é onde as páginas (Dashboard, etc.) serão renderizadas */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;