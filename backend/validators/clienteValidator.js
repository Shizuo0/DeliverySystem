const { body } = require('express-validator');

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Username deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username deve conter apenas letras, números e underscores'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Telefone deve conter 10 ou 11 dígitos numéricos')
];

const changePasswordValidation = [
  body('senhaAtual')
    .notEmpty().withMessage('Senha atual é obrigatória'),
  
  body('novaSenha')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation
};
