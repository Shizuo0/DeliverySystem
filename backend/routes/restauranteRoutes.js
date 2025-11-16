const express = require('express');
const router = express.Router();
const restauranteAuthController = require('../controllers/restauranteAuthController');
const restauranteController = require('../controllers/restauranteController');
const enderecoRestauranteController = require('../controllers/enderecoRestauranteController');
const categoriaCardapioController = require('../controllers/categoriaCardapioController');
const itemCardapioController = require('../controllers/itemCardapioController');
const restauranteAuthMiddleware = require('../middlewares/restauranteAuthMiddleware');
const validate = require('../middlewares/validate');
const {
  registerRestauranteValidation,
  loginRestauranteValidation,
  updateRestauranteValidation,
  changePasswordRestauranteValidation,
  updateStatusValidation
} = require('../validators/restauranteValidator');
const {
  createEnderecoRestauranteValidation,
  updateEnderecoRestauranteValidation
} = require('../validators/enderecoRestauranteValidator');
const {
  createCategoriaValidation,
  updateCategoriaValidation
} = require('../validators/categoriaCardapioValidator');
const {
  createItemCardapioValidation,
  updateItemCardapioValidation,
  updateDisponibilidadeValidation
} = require('../validators/itemCardapioValidator');

// ============= AUTENTICAÇÃO =============
router.post('/register', registerRestauranteValidation, validate, restauranteAuthController.register);
router.post('/login', loginRestauranteValidation, validate, restauranteAuthController.login);

// ============= PERFIL DO RESTAURANTE (Autenticado) =============
router.get('/perfil', restauranteAuthMiddleware, restauranteController.getProfile);
router.put('/perfil', restauranteAuthMiddleware, updateRestauranteValidation, validate, restauranteController.updateProfile);
router.delete('/perfil', restauranteAuthMiddleware, restauranteController.deleteAccount);
router.put('/senha', restauranteAuthMiddleware, changePasswordRestauranteValidation, validate, restauranteController.changePassword);
router.put('/status', restauranteAuthMiddleware, updateStatusValidation, validate, restauranteController.updateStatus);

// ============= ENDEREÇO DO RESTAURANTE (Autenticado) =============
router.post('/endereco', restauranteAuthMiddleware, createEnderecoRestauranteValidation, validate, enderecoRestauranteController.create);
router.get('/endereco', restauranteAuthMiddleware, enderecoRestauranteController.get);
router.put('/endereco', restauranteAuthMiddleware, updateEnderecoRestauranteValidation, validate, enderecoRestauranteController.update);
router.delete('/endereco', restauranteAuthMiddleware, enderecoRestauranteController.delete);

// ============= CATEGORIAS DO CARDÁPIO (Autenticado) =============
router.post('/categorias', restauranteAuthMiddleware, createCategoriaValidation, validate, categoriaCardapioController.create);
router.get('/categorias', restauranteAuthMiddleware, categoriaCardapioController.list);
router.put('/categorias/:id', restauranteAuthMiddleware, updateCategoriaValidation, validate, categoriaCardapioController.update);
router.delete('/categorias/:id', restauranteAuthMiddleware, categoriaCardapioController.delete);

// ============= ITENS DO CARDÁPIO (Autenticado) =============
router.post('/menu/itens', restauranteAuthMiddleware, createItemCardapioValidation, validate, itemCardapioController.create);
router.get('/menu/itens', restauranteAuthMiddleware, itemCardapioController.list);
router.get('/menu/itens/disponiveis', restauranteAuthMiddleware, itemCardapioController.listAvailable);
router.put('/menu/itens/:id', restauranteAuthMiddleware, updateItemCardapioValidation, validate, itemCardapioController.update);
router.put('/menu/itens/:id/disponibilidade', restauranteAuthMiddleware, updateDisponibilidadeValidation, validate, itemCardapioController.updateDisponibilidade);
router.delete('/menu/itens/:id', restauranteAuthMiddleware, itemCardapioController.delete);

// ============= ENDPOINTS PÚBLICOS =============
router.get('/', restauranteController.listAll); // Listar todos os restaurantes
router.get('/abertos', restauranteController.listOpen); // Listar apenas restaurantes abertos
router.get('/:id', restauranteController.getById); // Obter detalhes de um restaurante
router.get('/:restauranteId/cardapio', itemCardapioController.getCardapioCompleto); // Obter cardápio completo de um restaurante

module.exports = router;
