const { db } = require('../config/database');

const livrosController = {
    // [GET] Listar todos os livros com filtros, ordenação e paginação
    getAllLivros: (req, res) => {
        try {
            let { search, genero, autor_id, sort_by, order, page, limit } = req.query;

            let query = `
                SELECT
                    livros.id, livros.titulo, livros.genero, livros.ano_publicacao, livros.preco, livros.estoque,
                    autores.id AS autorId, autores.nome AS autorNome, autores.nacionalidade AS autorNacionalidade
                FROM livros
                JOIN autores ON livros.autor_id = autores.id
            `;
            let params = [];
            let conditions = [];

            // 1. Filtros
            if (search) {
                conditions.push("(livros.titulo LIKE ? OR livros.genero LIKE ? OR autores.nome LIKE ?)");
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (genero) {
                conditions.push("livros.genero = ?");
                params.push(genero);
            }
            if (autor_id) {
                conditions.push("livros.autor_id = ?");
                params.push(parseInt(autor_id));
            }

            if (conditions.length > 0) {
                query += " WHERE " + conditions.join(" AND ");
            }

            // 2. Ordenação
            const allowedSortFields = ["titulo", "preco", "ano_publicacao", "estoque", "autorNome"];
            sort_by = allowedSortFields.includes(sort_by) ? sort_by : "livros.id";
            order = (order && order.toLowerCase() === "desc") ? "DESC" : "ASC";
            query += ` ORDER BY ${sort_by} ${order}`;

            // 3. Paginação
            page = parseInt(page) > 0 ? parseInt(page) : 1;
            limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
            const offset = (page - 1) * limit;

            // Contar total
            const countQuery = `SELECT COUNT(*) as count FROM livros JOIN autores ON livros.autor_id = autores.id ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`;
            const totalLivros = db.prepare(countQuery).get(params.slice(0, conditions.length)).count;

            query += " LIMIT ? OFFSET ?";
            params.push(limit, offset);

            const livros = db.prepare(query).all(params);

            res.status(200).json({
                page,
                limit,
                total: totalLivros,
                data: livros
            });
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao buscar livros.' });
        }
    },

    // [GET] Buscar livro por ID
    getLivroById: (req, res) => {
        try {
            const { id } = req.params;
            const livro = db.prepare(`
                SELECT
                    livros.id, livros.titulo, livros.genero, livros.ano_publicacao, livros.preco, livros.estoque,
                    autores.id AS autorId, autores.nome AS autorNome, autores.nacionalidade AS autorNacionalidade
                FROM livros
                JOIN autores ON livros.autor_id = autores.id
                WHERE livros.id = ?
            `).get(parseInt(id));

            if (livro) {
                res.status(200).json(livro);
            } else {
                res.status(404).json({ erro: 'Livro não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao buscar livro por ID:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao buscar livro.' });
        }
    },

    // [POST] Criar novo livro
    createLivro: (req, res) => {
        try {
            const { titulo, autor_id, genero, ano_publicacao, preco, estoque } = req.body;

            // Validações
            if (!titulo || !autor_id || preco === undefined) {
                return res.status(400).json({ erro: 'Campos obrigatórios (titulo, autor_id, preco) faltando.' });
            }
            if (typeof titulo !== 'string' || titulo.trim().length < 3) {
                return res.status(400).json({ erro: 'Título inválido. Deve ter pelo menos 3 caracteres.' });
            }
            if (typeof autor_id !== 'number' || autor_id <= 0) {
                return res.status(400).json({ erro: 'ID do autor inválido.' });
            }
            const autorExiste = db.prepare('SELECT id FROM autores WHERE id = ?').get(autor_id);
            if (!autorExiste) {
                return res.status(404).json({ erro: 'Autor não encontrado.' });
            }
            if (typeof preco !== 'number' || preco <= 0) {
                return res.status(400).json({ erro: 'Preço inválido. Deve ser um número positivo.' });
            }
            if (estoque !== undefined && (typeof estoque !== 'number' || estoque < 0)) {
                return res.status(400).json({ erro: 'Estoque inválido. Deve ser um número não negativo.' });
            }
            if (ano_publicacao !== undefined && (typeof ano_publicacao !== 'number' || ano_publicacao < 1000 || ano_publicacao > new Date().getFullYear())) {
                return res.status(400).json({ erro: 'Ano de publicação inválido.' });
            }

            const result = db.prepare(
                'INSERT INTO livros (titulo, autor_id, genero, ano_publicacao, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(titulo, autor_id, genero, ano_publicacao, preco, estoque || 0);

            const novoLivro = db.prepare(`
                SELECT
                    livros.id, livros.titulo, livros.genero, livros.ano_publicacao, livros.preco, livros.estoque,
                    autores.id AS autorId, autores.nome AS autorNome, autores.nacionalidade AS autorNacionalidade
                FROM livros
                JOIN autores ON livros.autor_id = autores.id
                WHERE livros.id = ?
            `).get(result.lastInsertRowid);
            
            res.status(201).json(novoLivro);
        } catch (error) {
            console.error('Erro ao criar livro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao criar livro.' });
        }
    },

    // [PUT] Atualizar livro
    updateLivro: (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, autor_id, genero, ano_publicacao, preco, estoque } = req.body;

            // Verificar se o livro existe
            const livroExiste = db.prepare('SELECT * FROM livros WHERE id = ?').get(parseInt(id));
            if (!livroExiste) {
                return res.status(404).json({ erro: 'Livro não encontrado.' });
            }

            // Validações
            if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim().length < 3)) {
                return res.status(400).json({ erro: 'Título inválido. Deve ter pelo menos 3 caracteres.' });
            }
            if (autor_id !== undefined) {
                if (typeof autor_id !== 'number' || autor_id <= 0) {
                    return res.status(400).json({ erro: 'ID do autor inválido.' });
                }
                const autorExiste = db.prepare('SELECT id FROM autores WHERE id = ?').get(autor_id);
                if (!autorExiste) {
                    return res.status(404).json({ erro: 'Autor não encontrado.' });
                }
            }
            if (preco !== undefined && (typeof preco !== 'number' || preco <= 0)) {
                return res.status(400).json({ erro: 'Preço inválido. Deve ser um número positivo.' });
            }
            if (estoque !== undefined && (typeof estoque !== 'number' || estoque < 0)) {
                return res.status(400).json({ erro: 'Estoque inválido. Deve ser um número não negativo.' });
            }
            if (ano_publicacao !== undefined && (typeof ano_publicacao !== 'number' || ano_publicacao < 1000 || ano_publicacao > new Date().getFullYear())) {
                return res.status(400).json({ erro: 'Ano de publicação inválido.' });
            }

            let updateFields = [];
            let updateParams = [];

            if (titulo !== undefined) { updateFields.push('titulo = ?'); updateParams.push(titulo); }
            if (autor_id !== undefined) { updateFields.push('autor_id = ?'); updateParams.push(autor_id); }
            if (genero !== undefined) { updateFields.push('genero = ?'); updateParams.push(genero); }
            if (ano_publicacao !== undefined) { updateFields.push('ano_publicacao = ?'); updateParams.push(ano_publicacao); }
            if (preco !== undefined) { updateFields.push('preco = ?'); updateParams.push(preco); }
            if (estoque !== undefined) { updateFields.push('estoque = ?'); updateParams.push(estoque); }

            if (updateFields.length === 0) {
                return res.status(400).json({ erro: 'Nenhum campo válido para atualização fornecido.' });
            }

            const updateQuery = `UPDATE livros SET ${updateFields.join(', ')} WHERE id = ?`;
            db.prepare(updateQuery).run(...updateParams, parseInt(id));

            const livroAtualizado = db.prepare(`
                SELECT
                    livros.id, livros.titulo, livros.genero, livros.ano_publicacao, livros.preco, livros.estoque,
                    autores.id AS autorId, autores.nome AS autorNome, autores.nacionalidade AS autorNacionalidade
                FROM livros
                JOIN autores ON livros.autor_id = autores.id
                WHERE livros.id = ?
            `).get(parseInt(id));
            
            res.status(200).json(livroAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar livro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao atualizar livro.' });
        }
    },

    // [DELETE] Deletar livro
    deleteLivro: (req, res) => {
        try {
            const { id } = req.params;

            const livroExiste = db.prepare('SELECT * FROM livros WHERE id = ?').get(parseInt(id));
            if (!livroExiste) {
                return res.status(404).json({ erro: 'Livro não encontrado.' });
            }

            db.prepare('DELETE FROM livros WHERE id = ?').run(parseInt(id));
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar livro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor ao deletar livro.' });
        }
    }
};

module.exports = livrosController;
