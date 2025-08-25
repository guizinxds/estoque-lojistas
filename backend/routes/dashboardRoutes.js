const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const aggregations = await prisma.produto.aggregate({
            where: {
                userId: userId,
            },
            _count: {
                id: true,
            },
            _sum: {
                quantidade: true,
            },
        });
        
        const produtos = await prisma.produto.findMany({
            where: { userId: userId },
            select: { preco: true, quantidade: true }
        });

        const totalValue = produtos.reduce((acc, produto) => {
            const preco = parseFloat(produto.preco) || 0;
            const quantidade = parseInt(produto.quantidade, 10) || 0;
            return acc + (preco * quantidade);
        }, 0);

        const stats = {
            productCount: aggregations._count.id || 0,
            totalItems: aggregations._sum.quantidade || 0,
            totalValue: totalValue || 0,
        };

        res.json(stats);

    } catch (err) {
        console.error("Erro ao buscar estatísticas:", err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/low-stock', authMiddleware, async (req, res) => {
    const threshold = parseInt(req.query.threshold, 10) || 5;
    const userId = req.userId;

    try {
        const lowStockProducts = await prisma.produto.findMany({
            where: {
                userId: userId,
                quantidade: {
                    lte: threshold, 
                },
            },
            orderBy: {
                quantidade: 'asc',
            },
            take: 5,
            select: {
                id: true,
                nome: true,
                quantidade: true,
            }
        });
        
        res.json(lowStockProducts);

    } catch (err) {
        console.error("Erro ao buscar estoque baixo:", err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;