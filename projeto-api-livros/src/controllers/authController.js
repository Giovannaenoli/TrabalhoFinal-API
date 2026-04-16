const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // [POST] /auth/register - Registrar novo usuário
    register: async (req, res) => {
        try {
            const { nome, email, senha } = req.body;

            // Validações
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Campos obrigatórios (nome, email, senha) faltando.' });
            }
            if (typeof nome !== 'string' || nome.trim().length < 3) {
                return res.status(400).json({ erro: 'Nome inválido. Deve ter pelo menos 3 caracteres.' });
            }
            if (typeof email !== 'string' || !email.includes('@')) {
                return res.status(400).json({ erro: 'Email inválido.' });
            }
            if (typeof senha !== 'string' || senha.length < 6) {
                return res.status(400).json({ erro: 'Senha inválida. Deve ter pelo menos 6 caracteres.' });
            }

            // Verificar se o email já existe
            const usuarioExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
            if (usuarioExiste) {
                return res.status(409).json({ erro: 'Email já cadastrado.' });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            // Inserir usuário no banco
            const result = db.prepare(
                'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)'
            ).run(nome, email, senhaHash, 'user');

            // Gerar token JWT
            const novoUsuario = db.prepare('SELECT id, nome, email, role FROM usuarios WHERE id = ?').get(result.lastInsertRowid);
            const token = jwt.sign(
                { userId: novoUsuario.id, email: novoUsuario.email, role: novoUsuario.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ 
                mensagem: 'Usuário registrado com sucesso!', 
                token, 
                usuario: novoUsuario 
            });
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao registrar usuário.' });
        }
    },

    // [POST] /auth/login - Logar usuário existente
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            // Validações
            if (!email || !senha) {
                return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
            }

            // Buscar usuário por email
            const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Email ou senha incorretos.' });
            }

            // Comparar senhas
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Email ou senha incorretos.' });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { userId: usuario.id, email: usuario.email, role: usuario.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({ 
                mensagem: 'Login bem-sucedido!', 
                token, 
                usuario: { 
                    id: usuario.id, 
                    nome: usuario.nome, 
                    email: usuario.email, 
                    role: usuario.role 
                } 
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao fazer login.' });
        }
    }
};

module.exports = authController;
