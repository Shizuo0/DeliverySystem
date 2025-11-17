const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const authMiddleware = require('../middlewares/authMiddleware');
const restauranteAuthMiddleware = require('../middlewares/restauranteAuthMiddleware');
const validate = require('../middlewares/validate');
const {
  createAvaliacaoValidation,
  updateAvaliacaoValidation
} = require('../validators/avaliacaoValidator');

// ============= ROTAS DE CLIENTES (Autenticadas) =============
// Criar avaliação
router.post(
  '/cliente',
  authMiddleware,
  createAvaliacaoValidation,
  validate,
  avaliacaoController.create
);

// Listar avaliações do cliente autenticado
router.get(
  '/cliente',
  authMiddleware,
  avaliacaoController.listByCliente
);

// Obter avaliação por ID
router.get(
  '/cliente/:id',
  authMiddleware,
  avaliacaoController.getById
);

// Atualizar avaliação
router.put(
  '/cliente/:id',
  authMiddleware,
  updateAvaliacaoValidation,
  validate,
  avaliacaoController.update
);

// Deletar avaliação
router.delete(
  '/cliente/:id',
  authMiddleware,
  avaliacaoController.delete
);

// ============= ROTAS DE RESTAURANTES (Autenticadas) =============
// Listar avaliações do restaurante autenticado (feedback)
router.get(
  '/restaurante',
  restauranteAuthMiddleware,
  avaliacaoController.listByRestaurante
);

// Obter média de avaliações do restaurante autenticado
router.get(
  '/restaurante/media',
  restauranteAuthMiddleware,
  avaliacaoController.getRestauranteMedia
);

// ============= ENDPOINTS PÚBLICOS =============
// Obter avaliação por pedido (público)
router.get('/pedido/:pedidoId', avaliacaoController.getByPedido);

// Obter avaliações de um restaurante específico (público)
router.get('/restaurante/:restauranteId', avaliacaoController.getByRestaurantePublic);

// Obter média de avaliações de um restaurante específico (público)
router.get('/restaurante/:restauranteId/media', avaliacaoController.getRestauranteMediaPublic);

module.exports = router;
