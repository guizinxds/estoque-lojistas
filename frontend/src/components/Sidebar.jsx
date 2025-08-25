import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material';

// Importe os ícones que vamos usar
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';

const drawerWidth = 240; // Largura da sidebar

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/estoque' },
        { text: 'Cadastrar Produto', icon: <AddCircleOutlineIcon />, path: '/cadastro' },
        { text: 'Registrar Venda', icon: <ReceiptIcon />, path: '/venda' },
        { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff', // Fundo branco
                    borderRight: '1px solid #e0e0e0' // Borda sutil
                },
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: '#111827' }}>
                    Estoque 360
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path} // Destaca o item selecionado
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(0, 123, 255, 0.08)',
                                    color: '#007BFF',
                                    '& .MuiListItemIcon-root': {
                                        color: '#007BFF',
                                    }
                                },
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;