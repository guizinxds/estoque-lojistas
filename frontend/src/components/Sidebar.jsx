import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Exit from '@mui/icons-material/ExitToApp';


const openWidth = 240;
const closedWidth = 70;

const drawerWidth = 210; 

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Cadastrar Produto', icon: <AddCircleOutlineIcon />, path: '/cadastro' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/estoque' },
        { text: 'Registrar Venda', icon: <ReceiptIcon />, path: '/venda' },
        { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
        { text: 'Sair', icon: <Exit/>, path: '/login'},
    ];

    return (
        <Drawer
            variant="permanent"
            open={isOpen} // Controla o estado
            sx={{
                width: isOpen ? openWidth : closedWidth,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                transition: (theme) => theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                '& .MuiDrawer-paper': {
                    width: isOpen ? openWidth : closedWidth,
                    borderRight: '1px solid #e0e0e0',
                    overflowX: 'hidden', // Esconde o texto quando a sidebar encolhe
                    transition: (theme) => theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: '#111827', opacity: isOpen ? 1 : 0 }}>
                    Estoque 360
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            title={item.text} // Mostra o nome completo no hover quando fechada
                            sx={{
                                minHeight: 48,
                                justifyContent: isOpen ? 'initial' : 'center',
                                px: 2.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(0, 123, 255, 0.08)',
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                        color: '#007BFF',
                                    }
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} sx={{ opacity: isOpen ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;