const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autoresController');
const { autenticar } = require('../middleware/auth');

// Rotas para Autores
router.get('/', autoresController.getAllAutores);
router.get('/:id', autoresController.getAutorById);
router.post('/', autenticar, autoresController.createAutor);
router.put('/:id', autenticar, autoresController.updateAutor);
router.delete('/:id', autenticar, autoresController.deleteAutor);

module.exports = router;
