const express = require('express');
const router = express.Router();
const entregadorController = require('../controllers/entregadorController');
const validate = require('../middlewares/validate');
const {
  createEntregadorValidation,
  updateEntregadorValidation,
  updateStatusEntregadorValidation
} = require('../validators/entregadorValidator');

// ============= CRUD DE ENTREGADORES =============
// Criar entregador
router.post(
  '/',
  createEntregadorValidation,
  validate,
  entregadorController.create
);

// Listar todos os entregadores
router.get('/', entregadorController.listAll);

// Listar entregadores online
router.get('/online', entregadorController.listOnline);

// Listar entregadores por status (query param: ?status=Online)
router.get('/status', entregadorController.listByStatus);

// Obter entregador por ID
router.get('/:id', entregadorController.getById);

// Atualizar entregador
router.put(
  '/:id',
  updateEntregadorValidation,
  validate,
  entregadorController.update
);

// Atualizar status do entregador
router.put(
  '/:id/status',
  updateStatusEntregadorValidation,
  validate,
  entregadorController.updateStatus
);

// Deletar entregador
router.delete('/:id', entregadorController.delete);

module.exports = router;
