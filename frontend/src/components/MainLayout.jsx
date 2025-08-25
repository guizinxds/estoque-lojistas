import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header'; 

const MainLayout = () => {
  const [open, setOpen] = useState(true);

  // Função para alternar o estado
  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8' }}>
      {/* Renderiza o Header e passa a função de toggle para ele */}
      <Header onToggleSidebar={handleToggleSidebar} />

      {/* Renderiza a Sidebar e passa o estado 'open' para ela */}
      <Sidebar isOpen={open} />

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${open ? 240 : 70}px)` }}
      >
        <Toolbar />
        
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;