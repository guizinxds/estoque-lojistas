require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const JWT_SECRET = 'sua-chave-secreta-muito-segura'; 

app.use(cors());
app.use(express.json());

const authMiddleware = require('./middleware/auth');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auth = require('./middleware/auth');



// Rota de Registro de Usuário
app.post('/auth/register', async (req, res) => {
    try {
        const { email, senha, nomeEmpresa } = req.body;
        
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = await prisma.usuario.create({
            data: {
                email,
                senha: hashedPassword,
                nomeEmpresa,
            },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
    } catch (error) {
        console.error('ERRO AO CADASTRAR USUÁRIO: ', error);
        res.status(500).json({ error: 'Falha ao cadastrar o usuário.' });
    }
});

// Rota de Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (passwordMatch) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, companyName: user.nomeEmpresa });
        }

        res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    } catch (error) {
        res.status(500).json({ error: 'Falha no login.' });
    }
});

// Registra as rotas da Dashboard com o prefixo /api/dashboard
app.use('/api/dashboard', dashboardRoutes);

// Rotas de Produtos (protegidas pelo middleware)
app.get('/api/produtos', authMiddleware, async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            where: { userId: req.userId }
        });
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao buscar produtos.' });
    }
});

app.post('/api/produtos', authMiddleware, async (req, res) => {
    try {
        const { nome, descricao, preco, quantidade, nomeEmpresa } = req.body;
        const novoProduto = await prisma.produto.create({
            data: {
                nome,
                descricao,
                preco: parseFloat(preco),
                quantidade: parseInt(quantidade, 10),
                nomeEmpresa,
                userId: req.userId,
            },
        });
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('ERRO AO CADASTRAR PRODUTO', error)

        res.status(500).json({ error: 'Falha ao cadastrar o produto.' });
    }
});

app.put('/api/produtos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, quantidade } = req.body;
        
        const produtoAtualizado = await prisma.produto.update({
            where: { id: parseInt(id), userId: req.userId },
            data: {
                nome,
                descricao,
                preco: parseFloat(preco),
                quantidade: parseInt(quantidade)
            }
        });
        res.status(200).json(produtoAtualizado);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao atualizar o produto.' });
    }
});

app.delete('/api/produtos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.produto.delete({
            where: { id: parseInt(id), userId: req.userId }
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Falha ao excluir o produto.' });
    }
});

// Rota de Registro de Venda
app.post('/api/vendas', authMiddleware, async (req, res) => {
    try {
        const { produtoId, quantidade, precoTotal, clienteNome, clienteCpf} = req.body;
        const produto = await prisma.produto.findUnique({
            where: { id: parseInt(produtoId), userId: req.userId }
        });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        if (produto.quantidade < parseInt(quantidade)) {
            return res.status(400).json({ error: 'Estoque insuficiente.' });
        }

        await prisma.$transaction([
            prisma.produto.update({
                where: { id: parseInt(produtoId), userId: req.userId },
                data: {
                    quantidade: produto.quantidade - parseInt(quantidade)
                }
            }),
            prisma.venda.create({
                data: {
                    produtoId: parseInt(produtoId),
                    quantidadeVendida: parseInt(quantidade),
                    precoTotal: parseFloat(precoTotal),
                    userId: req.userId,
                    clienteNome,
                    clienteCpf
                }
            })
        ]);
        res.status(201).json({ message: 'Venda registrada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao registrar a venda.' });
    }
});

// Rota de Relatório
app.get('/api/relatorios/mais-vendidos', authMiddleware, async (req, res) => {
    try {
        const produtosMaisVendidos = await prisma.venda.groupBy({
            by: ['produtoId'],
            _sum: {
                quantidadeVendida: true,
            },
            where: { userId: req.userId },
            orderBy: {
                _sum: {
                    quantidadeVendida: 'desc',
                },
            },
            take: 10,
        });

        const produtosComNomes = await Promise.all(
            produtosMaisVendidos.map(async (venda) => {
                const produto = await prisma.produto.findUnique({
                    where: { id: venda.produtoId },
                    select: { nome: true },
                });
                return {
                    nome: produto ? produto.nome : 'Produto não encontrado',
                    quantidadeVendida: venda._sum.quantidadeVendida,
                };
            })
        );
        
        res.status(200).json(produtosComNomes);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao gerar o relatório de mais vendidos.' });
    }
});


app.get('/api/relatorios/por-cpf/:cpf', authMiddleware, async (req, res) => {
    try{
        const {cpf} = req.params;
        const vendas = await prisma.venda.findMany({
            where: {
                userId: req.userId,
                clienteCpf: cpf
            },
            include: {
                produto: {
                    select: {
                        nome: true,
                        descricao: true
                    }
                }
            },
            orderBy: {
                dataVenda: 'desc'
            }
        });
        res.status(200).json(vendas);
    } catch(error){
        console.error('ERRO AO BUSCAR VENDAS POR CPF: ', error);
        res.status(500).json({error: 'Falha ao buscar as vendas.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});