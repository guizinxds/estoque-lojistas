const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura'; 

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Formato de token inválido.' });
        }
        
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userId = decodedToken.userId; 
        next(); 
    } catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
};