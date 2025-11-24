const { body } = require('express-validator');

const registerRestauranteValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  
  body('email_admin')
    .trim()
    .notEmpty().withMessage('Email do administrador é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('senha_admin')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  
  body('tipo_cozinha')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tipo de cozinha deve ter no máximo 100 caracteres'),
  
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Telefone deve conter 10 ou 11 dígitos numéricos'),

  body('cnpj')
    .trim()
    .notEmpty().withMessage('CNPJ é obrigatório')
    .matches(/^\d{14}$/).withMessage('CNPJ deve conter 14 dígitos numéricos')
];

const loginRestauranteValidation = [
  body('email_admin')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('senha_admin')
    .notEmpty().withMessage('Senha é obrigatória')
];

const updateRestauranteValidation = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  
  body('email_admin')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('tipo_cozinha')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tipo de cozinha deve ter no máximo 100 caracteres'),
  
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Telefone deve conter 10 ou 11 dígitos numéricos'),

  body('cnpj')
    .optional()
    .trim()
    .matches(/^\d{14}$/).withMessage('CNPJ deve conter 14 dígitos numéricos'),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('tempo_entrega_estimado')
    .optional()
    .isInt({ min: 0 }).withMessage('Tempo de entrega deve ser um número inteiro positivo'),
  
  body('taxa_entrega')
    .optional()
    .isFloat({ min: 0 }).withMessage('Taxa de entrega deve ser um número positivo')
];

const changePasswordRestauranteValidation = [
  body('senhaAtual')
    .notEmpty().withMessage('Senha atual é obrigatória'),
  
  body('novaSenha')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status é obrigatório')
    .isIn(['Aberto', 'Fechado']).withMessage('Status deve ser "Aberto" ou "Fechado"')
];

module.exports = {
  registerRestauranteValidation,
  loginRestauranteValidation,
  updateRestauranteValidation,
  changePasswordRestauranteValidation,
  updateStatusValidation
};
