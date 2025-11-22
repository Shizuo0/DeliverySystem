const { body } = require('express-validator');

const createEntregadorValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  
  body('telefone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^\d{10,11}$/).withMessage('Telefone deve conter 10 ou 11 dígitos numéricos')
];

const updateEntregadorValidation = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('senha')
    .optional()
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Telefone deve conter 10 ou 11 dígitos numéricos')
];

const updateStatusEntregadorValidation = [
  body('status')
    .notEmpty().withMessage('Status é obrigatório')
    .isIn(['Online', 'Offline', 'Em Entrega']).withMessage('Status deve ser "Online", "Offline" ou "Em Entrega"')
];

module.exports = {
  createEntregadorValidation,
  updateEntregadorValidation,
  updateStatusEntregadorValidation
};
