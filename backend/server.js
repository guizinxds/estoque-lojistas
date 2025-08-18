const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const JWT_SECRET = 'sua-chave-secreta-muito-segura'; // Use uma string forte e única!

app.use(cors());
app.use(express.json());

// --- Autenticação com JWT e Hashing de Senha ---

// Rota de Cadastro de Usuário (com criptografia de senha)
app.post('/auth/register', async (req, res) => {
    try {
        const { email, senha, nomeEmpresa } = req.body;
        
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10); // Criptografa a senha

        const newUser = await prisma.usuario.create({
            data: {
                email,
                senha: hashedPassword, // Salva a senha criptografada
                nomeEmpresa,
            },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao cadastrar o usuário.' });
    }
});

// Rota de Login (com verificação de senha e geração de JWT)
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.senha); // Compara a senha

        if (passwordMatch) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, companyName: user.nomeEmpresa });
        }

        res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    } catch (error) {
        res.status(500).json({ error: 'Falha no login.' });
    }
});

// Middleware que protege as rotas e extrai o ID do token
app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
});

// --- Rotas Protegidas (filtradas por userId) ---

// Rotas de Produtos
app.get('/produtos', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            where: { userId: req.userId }
        });
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao buscar produtos.' });
    }
});

app.post('/produtos', async (req, res) => {
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
        res.status(500).json({ error: 'Falha ao cadastrar o produto.' });
    }
});

app.put('/produtos/:id', async (req, res) => {
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

app.delete('/produtos/:id', async (req, res) => {
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
app.post('/vendas', async (req, res) => {
    try {
        const { produtoId, quantidade, precoTotal } = req.body;
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
                    userId: req.userId
                }
            })
        ]);
        res.status(201).json({ message: 'Venda registrada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao registrar a venda.' });
    }
});

// Rota de Relatório
app.get('/relatorios/mais-vendidos', async (req, res) => {
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
                    nome: produto.nome,
                    quantidadeVendida: venda._sum.quantidadeVendida,
                };
            })
        );
        
        res.status(200).json(produtosComNomes);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao gerar o relatório de mais vendidos.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});