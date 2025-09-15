import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; 

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

import htmlToPdfmake from "html-to-pdfmake";

// Imports do Material-UI para um formulário profissional e para o modal
import { Box, Typography, Paper, Grid, TextField, Button, CircularProgress, Alert, InputAdornment, MenuItem, FormControl, InputLabel, Select, Modal, Fade, Backdrop } from '@mui/material';


// A função gerarComprovante agora aceita os dados do cliente
const gerarComprovante = (vendaDetalhes) => {
    // Reconstruí a função de geração de PDF para ser mais clara e usar os novos dados
    const docDefinition = {
        content: [
            { text: 'Comprovante de Venda', style: 'header' },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: `Empresa: ${vendaDetalhes.nomeEmpresa}`, margin: [0, 10, 0, 0] },
            { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 5, 0, 0] },
            { text: `Cliente: ${vendaDetalhes.clienteNome || 'Não informado'}`, margin: [0, 5, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: 'Detalhes da Venda', style: 'subheader', margin: [0, 10, 0, 5] },
            { text: `Produto: ${vendaDetalhes.produtoNome}`, margin: [0, 5, 0, 0] },
            { text: `Quantidade: ${vendaDetalhes.quantidade}`, margin: [0, 5, 0, 0] },
            { text: `Preço Total: R$ ${vendaDetalhes.precoTotal.toFixed(2)}`, margin: [0, 5, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: 'Obrigado pela sua compra!', style: 'thanks', alignment: 'center', margin: [0, 10, 0, 0] }
        ],
        styles: {
            header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, bold: true },
            thanks: { italics: true }
        }
    };

    pdfMake.createPdf(docDefinition).open();
}

const RegistroVenda = () => {
    // Pegue a função de logout e o nome da empresa do contexto de autenticação
    const { logout, nomeEmpresa } = useAuth();
    
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
    
    // Novos estados para o modal e os dados do cliente
    const [openModal, setOpenModal] = useState(false);
    const [clienteNome, setClienteNome] = useState('');


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
            // Registre a venda no backend primeiro
            await api.post('/api/vendas', {
                produtoId: parseInt(formData.produtoId),
                quantidade: parseInt(formData.quantidade),
                precoTotal: parseFloat(formData.precoTotal)
            });
            
            // Se a venda foi registrada com sucesso, abra o modal
            setMessage('Venda registrada com sucesso!');
            setOpenModal(true);
            
            // Não resetamos o formulário aqui para que os dados fiquem no modal
            
        } catch (err){
            setError(err.response?.data?.error || 'Falha ao registrar a venda. Verifique os dados.');
            console.error('Erro ao registrar venda:', err);
        } finally{
            setSubmitting(false);
        }
    };
    
    // Nova função para gerar o comprovante após preencher o nome do cliente
    const handleGerarComprovante = async () => {
        const produtoVendido = produtos.find(p => p.id === parseInt(formData.produtoId));
        
        if (produtoVendido) {
            gerarComprovante({
                nomeEmpresa: nomeEmpresa, // Pega o nome da empresa do contexto
                produtoNome: produtoVendido.nome,
                quantidade: formData.quantidade,
                precoTotal: parseFloat(formData.precoTotal),
                clienteNome: clienteNome // Pega o nome do cliente do estado do componente
            });
        }
        
        // Agora você pode fechar o modal e resetar o formulário principal
        setOpenModal(false);
        setFormData({ produtoId: '', quantidade: 1, precoTotal: '0.00'});
        setClienteNome('');

        // E atualiza a lista de produtos
        try {
            const updatedProductsResponse = await api.get('/api/produtos');
            setProdutos(updatedProductsResponse.data);
        } catch (err) {
            console.error('Falha ao atualizar a lista de produtos:', err);
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

            {/* Modal para Informações do Cliente */}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px'
                    }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Informações do Cliente
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="cliente-nome"
                            label="Nome do Cliente"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={clienteNome}
                            onChange={(e) => setClienteNome(e.target.value)}
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setOpenModal(false)} sx={{ mr: 1 }}>Cancelar</Button>
                            <Button variant="contained" onClick={handleGerarComprovante} disabled={!clienteNome}>Gerar Comprovante</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default RegistroVenda;