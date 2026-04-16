require('dotenv').config();
const express = require('express');
const { setupDatabase } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Configurar banco de dados
setupDatabase();

// Importar rotas
const livrosRoutes = require('./src/routes/livros');
const autoresRoutes = require('./src/routes/autores');
const authRoutes = require('./src/routes/auth');

// Usar rotas
app.use('/api/livros', livrosRoutes);
app.use('/api/autores', autoresRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        mensagem: 'API REST de Livros funcionando!',
        versao: '1.0.0',
        endpoints: {
            livros: 'GET /api/livros',
            autores: 'GET /api/autores',
            auth: 'POST /api/auth/register ou POST /api/auth/login'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`API de Livros pronta para uso!`);
});
