const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const restauranteAuthMiddleware = require('../middlewares/restauranteAuthMiddleware');
const validate = require('../middlewares/validate');
const {
  createPedidoValidation,
  updateStatusValidation
} = require('../validators/pedidoValidator');
const { body } = require('express-validator');

const assignEntregadorValidation = [
  body('id_entregador')
    .notEmpty().withMessage('ID do entregador é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do entregador deve ser um número inteiro positivo')
];

// ============= ROTAS DE CLIENTES (Autenticadas) =============
// Criar novo pedido
router.post(
  '/cliente',
  authMiddleware,
  createPedidoValidation,
  validate,
  pedidoController.create
);

// Listar pedidos do cliente autenticado
router.get(
  '/cliente',
  authMiddleware,
  pedidoController.listByCliente
);

// Obter detalhes de um pedido específico
router.get(
  '/cliente/:id',
  authMiddleware,
  pedidoController.getById
);

// Cancelar pedido (apenas se Pendente)
router.put(
  '/cliente/:id/cancelar',
  authMiddleware,
  pedidoController.cancel
);

// ============= ROTAS DE RESTAURANTES (Autenticadas) =============
// Listar pedidos do restaurante autenticado (com filtro opcional por status)
router.get(
  '/restaurante',
  restauranteAuthMiddleware,
  pedidoController.listByRestaurante
);

// Obter detalhes de um pedido específico
router.get(
  '/restaurante/:id',
  restauranteAuthMiddleware,
  pedidoController.getByIdRestaurante
);

// Atualizar status do pedido
router.put(
  '/restaurante/:id/status',
  restauranteAuthMiddleware,
  updateStatusValidation,
  validate,
  pedidoController.updateStatus
);

// Atribuir entregador ao pedido
router.put(
  '/restaurante/:id/entregador',
  restauranteAuthMiddleware,
  assignEntregadorValidation,
  validate,
  pedidoController.assignEntregador
);

module.exports = router;
