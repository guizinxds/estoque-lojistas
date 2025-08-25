import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import { Box, Container, Typography, Paper, Grid, TextField, Button, CircularProgress, Alert, InputAdornment } from '@mui/material';

const CadastroProduto = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const dataToSend = { ...formData, nomeEmpresa: user.companyName };

            await api.post('/api/produtos', dataToSend);
            setSuccess('Produto cadastrado com sucesso! Redirecionando...');
            setTimeout(() => {
                navigate('/estoque');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao cadastrar o produto.');
            setLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="md">
                <Paper sx={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px',
                    p: 4,
                }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                        Cadastrar Novo Produto
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    name="nome"
                                    label="Nome do Produto"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={formData.nome}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="descricao"
                                    label="Descrição"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={formData.descricao}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="preco"
                                    label="Preço"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={formData.preco}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    }}
                                />
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
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{ 
                                        py: 1.5, 
                                        fontWeight: 600, 
                                        backgroundColor: '#007BFF',
                                        '&:hover': { backgroundColor: '#0056b3' },
                                        borderRadius: '8px'
                                    }}
                                >
                                    {loading ? <CircularProgress size={26} color="inherit" /> : 'Cadastrar Produto'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    
                    {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                </Paper>
            </Container>
        </Box>
    );
};

export default CadastroProduto;