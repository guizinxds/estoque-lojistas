import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

import {
    Box, Typography, Paper, Grid, TextField, Button,
    CircularProgress, Alert, InputAdornment, MenuItem,
    FormControl, InputLabel, Select, Modal, Fade, Backdrop, Input,
    Autocomplete 
} from '@mui/material';

import {IMaskInput} from 'react-imask';


function validateCPF(rawCpf) {
    if (!rawCpf) return false;
    const cpf = String(rawCpf).replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcDigit = (arr) => {
        const len = arr.length;
        let sum = 0;
        for (let i = 0; i < len; i++) {
            sum += parseInt(arr[i], 10) * (len + 1 - i);
        }
        const rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    };

    const digits = cpf.split("");
    const base9 = digits.slice(0, 9);
    const d1 = calcDigit(base9);
    const d2 = calcDigit([...base9, String(d1)]);
    return String(d1) === digits[9] && String(d2) === digits[10];
}

const gerarComprovante = (vendaDetalhes) => {
    const docDefinition = {
        content: [
            { text: 'Comprovante de Compra', style: 'header' },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: `Empresa: ${vendaDetalhes.nomeEmpresa}`, margin: [0, 10, 0, 0] },
            { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 5, 0, 0] },
            { text: `Cliente: ${vendaDetalhes.clienteNome || 'Não informado'}`, margin: [0, 5, 0, 0] },
            { text: `CPF: ${vendaDetalhes.clienteCpf || 'Não informado'}`, margin: [0, 5, 0, 0] },
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
};

const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="000.000.000-00"
            definitions={{ '#': /[1-9]/, }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const RegistroVenda = () => {
    const { nomeEmpresa } = useAuth();
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({ produto: null, quantidade: 1, precoTotal: '0.00' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [clienteNome, setClienteNome] = useState('');
    const [clienteCpf, setClienteCpf] = useState('');
    const [cpfError, setCpfError] = useState('');

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

        if (name === 'quantidade') {
            const selectedProduct = newFormData.produto;
            const quantidade = parseInt(newFormData.quantidade);
            if (selectedProduct && quantidade > 0) {
                newFormData.precoTotal = (selectedProduct.preco * quantidade).toFixed(2);
            } else {
                newFormData.precoTotal = '0.00';
            }
        }
        setFormData(newFormData);
    };

    // --- ⬇️ ALTERAÇÃO 1 ⬇️ ---
    // Esta função agora apenas abre o Modal.
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.produto) {
            setError('Por Favor, selecione um produto antes de continuar.');
            return;
        }
        setError('');
        setOpenModal(true);
    };

    // --- ⬇️ ALTERAÇÃO 2 ⬇️ ---
    // Esta função agora salva a venda e gera o comprovante.
    const handleGerarComprovante = async () => {
        setSubmitting(true);
        setMessage('');
        setError(''); // Limpa erros do formulário principal

        try {
            // 1. Salva a venda no banco com os dados do cliente
            await api.post('/api/vendas', {
                produtoId: formData.produto.id,
                quantidade: parseInt(formData.quantidade),
                precoTotal: parseFloat(formData.precoTotal),
                clienteNome: clienteNome,
                clienteCpf: clienteCpf.replace(/\D/g, '') // Envia CPF sem máscara
            });

            setMessage('Venda registrada com sucesso!');
            
            // 2. Gera o comprovante em PDF
            const produtoVendido = formData.produto;
            if (produtoVendido) {
                gerarComprovante({
                    nomeEmpresa,
                    produtoNome: produtoVendido.nome,
                    quantidade: formData.quantidade,
                    precoTotal: parseFloat(formData.precoTotal),
                    clienteNome,
                    clienteCpf // Envia CPF com máscara para o PDF
                });
            }
            
            // 3. Fecha o Modal e limpa o formulário
            setOpenModal(false);
            setFormData({ produto: null, quantidade: 1, precoTotal: '0.00' });
            setClienteNome('');
            setClienteCpf('');
            setCpfError('');

            // 4. Atualiza a lista de produtos
            const updatedProductsResponse = await api.get('/api/produtos');
            setProdutos(updatedProductsResponse.data);

        } catch (err) {
            // Em caso de erro, exibe a mensagem (pode ser no modal ou no form principal)
            setError(err.response?.data?.error || 'Falha ao registrar a venda. Verifique os dados.');
            console.error('Erro ao registrar venda:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCpfBlur = () => {
        const onlyDigits = clienteCpf.replace(/\D/g, '');
        if (onlyDigits.length === 0) return;
        if (!validateCPF(onlyDigits)) {
            setCpfError('CPF inválido');
        } else {
            setCpfError('');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Paper sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', borderRadius: '12px', p: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                    Registrar Venda
                </Typography>

                {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sx={{width: '40%' }}>
                            <Autocomplete
                                options={produtos}
                                value={formData.produto} 
                                getOptionLabel={(option) => `${option.nome} (Estoque: ${option.quantidade})`}
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setFormData({
                                            ...formData,
                                            produto: newValue, 
                                            precoTotal: (newValue.preco * formData.quantidade).toFixed(2),
                                        });
                                    } else {
                                        setFormData({ ...formData, produto: null, precoTotal: '0.00' });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Buscar Produto" 
                                        variant="outlined" 
                                        required 
                                    />
                                )}
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
                                disabled={submitting || !formData.produto} 
                                sx={{
                                    py: 1.5,
                                    fontWeight: 600,
                                    backgroundColor: '#28a745',
                                    '&:hover': { backgroundColor: '#1e7e34' },
                                    borderRadius: '8px'
                                }}
                            >
                                {/* O botão principal não precisa mais do spinner, pois ele só abre o modal */}
                                Registrar Venda
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
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openModal}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: 400,
                        bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px'
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
                        <TextField
                            id="cliente-cpf"
                            name="cliente-cpf"
                            label="CPF do Cliente"
                            variant="standard"
                            fullWidth
                            margin="dense"
                            value={clienteCpf}
                            onChange={(e) => setClienteCpf(e.target.value)}
                            onBlur={handleCpfBlur}
                            error={Boolean(cpfError)}
                            helperText={cpfError}
                            InputProps={{
                                inputComponent: TextMaskCustom,
                            }}
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setOpenModal(false)} sx={{ mr: 1 }}>Cancelar</Button>
                            <Button
                                variant="contained"
                                onClick={handleGerarComprovante}
                                disabled={!clienteNome || !validateCPF(clienteCpf) || submitting}
                            >
                                {/* --- ⬇️ ALTERAÇÃO 3 ⬇️ --- */}
                                {/* Adicionado o spinner de carregamento neste botão */}
                                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Finalizar e Gerar Comprovante'}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default RegistroVenda;