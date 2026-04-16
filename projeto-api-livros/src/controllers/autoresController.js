const { db } = require('../config/database');

const autoresController = {
    // [GET] Listar todos os autores
    getAllAutores: (req, res) => {
        try {
            const autores = db.prepare('SELECT * FROM autores').all();
            res.status(200).json(autores);
        } catch (error) {
            console.error('Erro ao buscar autores:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao buscar autores.' });
        }
    },

    // [GET] Buscar autor por ID
    getAutorById: (req, res) => {
        try {
            const { id } = req.params;
            const autor = db.prepare('SELECT * FROM autores WHERE id = ?').get(parseInt(id));

            if (autor) {
                res.status(200).json(autor);
            } else {
                res.status(404).json({ erro: 'Autor não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao buscar autor por ID:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao buscar autor.' });
        }
    },

    // [POST] Criar novo autor
    createAutor: (req, res) => {
        try {
            const { nome, nacionalidade, data_nascimento } = req.body;

            if (!nome) {
                return res.status(400).json({ erro: 'O nome do autor é obrigatório.' });
            }
            if (typeof nome !== 'string' || nome.trim().length < 3) {
                return res.status(400).json({ erro: 'Nome do autor inválido. Deve ter pelo menos 3 caracteres.' });
            }

            const result = db.prepare(
                'INSERT INTO autores (nome, nacionalidade, data_nascimento) VALUES (?, ?, ?)'
            ).run(nome, nacionalidade, data_nascimento);

            const novoAutor = db.prepare('SELECT * FROM autores WHERE id = ?').get(result.lastInsertRowid);
            res.status(201).json(novoAutor);
        } catch (error) {
            console.error('Erro ao criar autor:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao criar autor.' });
        }
    },

    // [PUT] Atualizar autor
    updateAutor: (req, res) => {
        try {
            const { id } = req.params;
            const { nome, nacionalidade, data_nascimento } = req.body;

            const autorExiste = db.prepare('SELECT * FROM autores WHERE id = ?').get(parseInt(id));
            if (!autorExiste) {
                return res.status(404).json({ erro: 'Autor não encontrado.' });
            }

            if (!nome && !nacionalidade && !data_nascimento) {
                return res.status(400).json({ erro: 'Nenhum dado para atualizar fornecido.' });
            }
            if (nome !== undefined && (typeof nome !== 'string' || nome.trim().length < 3)) {
                return res.status(400).json({ erro: 'Nome do autor inválido. Deve ter pelo menos 3 caracteres.' });
            }

            let updateFields = [];
            let updateParams = [];

            if (nome !== undefined) { updateFields.push('nome = ?'); updateParams.push(nome); }
            if (nacionalidade !== undefined) { updateFields.push('nacionalidade = ?'); updateParams.push(nacionalidade); }
            if (data_nascimento !== undefined) { updateFields.push('data_nascimento = ?'); updateParams.push(data_nascimento); }

            if (updateFields.length === 0) {
                return res.status(400).json({ erro: 'Nenhum campo válido para atualização fornecido.' });
            }

            const updateQuery = `UPDATE autores SET ${updateFields.join(', ')} WHERE id = ?`;
            db.prepare(updateQuery).run(...updateParams, parseInt(id));

            const autorAtualizado = db.prepare('SELECT * FROM autores WHERE id = ?').get(parseInt(id));
            res.status(200).json(autorAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar autor:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao atualizar autor.' });
        }
    },

    // [DELETE] Deletar autor
    deleteAutor: (req, res) => {
        try {
            const { id } = req.params;

            const autorExiste = db.prepare('SELECT * FROM autores WHERE id = ?').get(parseInt(id));
            if (!autorExiste) {
                return res.status(404).json({ erro: 'Autor não encontrado.' });
            }

            // Verificar se existem livros associados
            const livrosDoAutor = db.prepare('SELECT COUNT(*) as count FROM livros WHERE autor_id = ?').get(parseInt(id)).count;
            if (livrosDoAutor > 0) {
                return res.status(409).json({ erro: 'Não é possível deletar o autor, pois existem livros associados a ele.' });
            }

            db.prepare('DELETE FROM autores WHERE id = ?').run(parseInt(id));
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar autor:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao deletar autor.' });
        }
    }
};

module.exports = autoresController;
