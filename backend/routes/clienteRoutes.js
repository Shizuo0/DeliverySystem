const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const enderecoClienteController = require('../controllers/enderecoClienteController');
const authMiddleware = require('../middlewares/authMiddleware');
const { updateProfileValidation, changePasswordValidation } = require('../validators/clienteValidator');
const { createEnderecoValidation, updateEnderecoValidation } = require('../validators/enderecoClienteValidator');
const validate = require('../middlewares/validate');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de perfil
router.get('/profile', clienteController.getProfile);
router.put('/profile', updateProfileValidation, validate, clienteController.updateProfile);
router.put('/change-password', changePasswordValidation, validate, clienteController.changePassword);
router.delete('/account', clienteController.deleteAccount);

// Rotas de endereços
router.post('/enderecos', createEnderecoValidation, validate, enderecoClienteController.create);
router.get('/enderecos', enderecoClienteController.list);
router.get('/enderecos/:id', enderecoClienteController.getById);
router.put('/enderecos/:id', updateEnderecoValidation, validate, enderecoClienteController.update);
router.delete('/enderecos/:id', enderecoClienteController.delete);

module.exports = router;
