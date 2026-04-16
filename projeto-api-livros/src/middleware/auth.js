const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    try {
        // 1. Pegar token do header Authorization
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ erro: 'Token não fornecido.' });
        }

        // Formato esperado: Bearer <token>
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ erro: 'Token mal formatado. Use o formato Bearer <token>.' });
        }

        const token = parts[1];

        // 2. Verificar e decodificar token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ erro: 'Token inválido ou expirado.' });
            }

            // Adicionar userId e role ao objeto req para uso nas rotas
            req.userId = decoded.userId;
            req.userRole = decoded.role;
            next();
        });
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};

module.exports = { autenticar };
