import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import KpiCard from '../components/KpiCard';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const Dashboard = () => {
    const [stats, setStats] = useState({ totalValue: 0, totalItems: 0, productCount: 0 });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, lowStockResponse] = await Promise.all([
                    api.get('/api/dashboard/stats'),
                    api.get('/api/dashboard/low-stock?threshold=5')
                ]);
                setStats(statsResponse.data);
                setLowStockProducts(lowStockResponse.data);
                setError(null);
            } catch (err) {
                setError("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pageStyle = {
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
        padding: '24px',
    };

    // ==========================================================
    // ESTILOS E EFEITOS APRIMORADOS AQUI
    // ==========================================================
    const cardStyle = {
        backgroundColor: '#ffffff',
        // Sombra inicial sutil para dar profundidade
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px', // Bordas um pouco mais arredondadas
        padding: '24px',
        height: '100%',
        border: '1px solid #e0e0e0', // Borda leve para definição
        
        // A mágica da interação acontece aqui:
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    };

    const cardHoverStyle = {
        // Efeito de "levantar" o card
        transform: 'translateY(-5px)',
        // Sombra mais pronunciada para destacar
        boxShadow: '0px 12px 25px rgba(0, 0, 0, 0.1)',
    };
    // ==========================================================

    if (loading) return <Box style={pageStyle}><CircularProgress /></Box>;
    if (error) return <Box style={pageStyle}><Typography color="error">{error}</Typography></Box>;

    return (
        <Box style={pageStyle}>
            <Typography variant="h4" component="h1" style={{ marginBottom: '32px', fontWeight: 700, color: '#111827' }}>
                Dashboard
            </Typography>
            
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    {/* Aplicamos o hover dinamicamente */}
                    <Paper 
                        style={cardStyle} 
                        sx={{ flex: '1 1 300px', '&:hover': cardHoverStyle }}
                    >
                       <KpiCard title="Valor Total em Estoque" value={formatCurrency(stats.totalValue)} icon={<MonetizationOnIcon sx={{ fontSize: 30, color: '#ffffff' }} />} />
                    </Paper>
                    <Paper 
                        style={cardStyle} 
                        sx={{ flex: '1 1 300px', '&:hover': cardHoverStyle }}
                    >
                        <KpiCard title="Quantidade de Itens" value={`${stats.totalItems} un.`} icon={<InventoryIcon sx={{ fontSize: 30, color: '#ffffff' }} />} />
                    </Paper>
                    <Paper 
                        style={cardStyle} 
                        sx={{ flex: '1 1 300px', '&:hover': cardHoverStyle }}
                    >
                        <KpiCard title="Produtos Cadastrados" value={stats.productCount} icon={<CategoryIcon sx={{ fontSize: 30, color: '#ffffff' }} />} />
                    </Paper>
                </Box>

                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    <Paper 
                        style={cardStyle} 
                        sx={{ flex: '1 1 100%', '&:hover': cardHoverStyle }}
                    >
                        <Typography variant="h6" style={{ color: '#111827', marginBottom: '8px' }}>
                            Produtos com Estoque Baixo
                        </Typography>
                        {lowStockProducts.length > 0 ? (
                            <List style={{ width: '100%' }}>
                                {lowStockProducts.map(product => (
                                    <ListItem key={product.id} disablePadding>
                                        <ListItemIcon style={{ minWidth: '40px' }}>
                                            <WarningAmberIcon color="warning" />
                                        </ListItemIcon>
                                        <ListItemText primary={product.nome} secondary={`Apenas ${product.quantidade} unidades restantes`} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box style={{ flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                                <Typography style={{ color: '#6B7280' }}>Nenhum produto com estoque baixo.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;