const express = require('express');
const router = express.Router();
const livrosController = require('../controllers/livrosController');
const { autenticar } = require('../middleware/auth');

// Rotas para Livros
router.get('/', livrosController.getAllLivros);
router.get('/:id', livrosController.getLivroById);
router.post('/', autenticar, livrosController.createLivro);
router.put('/:id', autenticar, livrosController.updateLivro);
router.delete('/:id', autenticar, livrosController.deleteLivro);

module.exports = router;
