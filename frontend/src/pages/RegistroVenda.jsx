import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Imports do Material-UI para um formulário profissional
import { Box, Typography, Paper, Grid, TextField, Button, CircularProgress, Alert, InputAdornment, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const RegistroVenda = () => {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
        produtoId: '',
        quantidade: 1,
        precoTotal: '0.00',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const response = await api.get('/api/produtos');
                setProdutos(response.data);
            } catch (err) {
                setError('Não foi possível carregar a lista de produtos.');
                console.error('Erro ao buscar produtos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProdutos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let newFormData = { ...formData, [name]: value };

        if (name === 'produtoId' || name === 'quantidade') {
            const selectedProduct = produtos.find(p => p.id === parseInt(newFormData.produtoId));
            const quantidade = parseInt(newFormData.quantidade);
            if (selectedProduct && quantidade > 0) {
                newFormData.precoTotal = (selectedProduct.preco * quantidade).toFixed(2);
            } else {
                newFormData.precoTotal = '0.00';
            }
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            await api.post('/api/vendas', {
                produtoId: parseInt(formData.produtoId),
                quantidade: parseInt(formData.quantidade),
                precoTotal: parseFloat(formData.precoTotal)
            });
            setMessage('Venda registrada com sucesso!');
            setFormData({ produtoId: '', quantidade: 1, precoTotal: '0.00' });
            // Atualiza a lista de produtos para refletir o novo estoque
            const response = await api.get('/api/produtos');
            setProdutos(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao registrar a venda. Verifique os dados.');
            console.error('Erro ao registrar venda:', err);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Paper sx={{ 
                backgroundColor: '#ffffff',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
                p: 4,
            }}>
                <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                    Registrar Venda
                </Typography>

                {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="produto-select-label">Produto</InputLabel>
                                <Select
                                    labelId="produto-select-label"
                                    id="produtoId"
                                    name="produtoId"
                                    value={formData.produtoId}
                                    label="Produto"
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="" disabled><em>Selecione um produto</em></MenuItem>
                                    {produtos.map(produto => (
                                        <MenuItem key={produto.id} value={produto.id}>
                                            {produto.nome} (Estoque: {produto.quantidade})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="quantidade"
                                label="Quantidade"
                                type="number"
                                variant="outlined"
                                fullWidth
                                required
                                value={formData.quantidade}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="precoTotal"
                                label="Preço Total"
                                type="number"
                                variant="outlined"
                                fullWidth
                                required
                                value={formData.precoTotal}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    readOnly: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={submitting || !formData.produtoId}
                                sx={{ 
                                    py: 1.5, 
                                    fontWeight: 600, 
                                    backgroundColor: '#28a745',
                                    '&:hover': { backgroundColor: '#1e7e34' },
                                    borderRadius: '8px'
                                }}
                            >
                                {submitting ? <CircularProgress size={26} color="inherit" /> : 'Registrar Venda'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                
                {message && <Alert severity="success" sx={{ mt: 3 }}>{message}</Alert>}

            </Paper>
        </Box>
    );
};

export default RegistroVenda;