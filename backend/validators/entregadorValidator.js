const { body } = require('express-validator');
const {
  isValidNome,
  isValidEmail,
  isValidTelefone,
  isValidDDD,
  validateSenhaStrength,
  removeFormatting
} = require('../utils/validationHelpers');

const createEntregadorValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (!isValidNome(value)) {
        throw new Error('Nome deve conter apenas letras, espaços e acentos. Números e caracteres especiais não são permitidos');
      }
      // Verificar se tem pelo menos nome e sobrenome
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2) {
        throw new Error('Por favor, informe nome completo (nome e sobrenome)');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Formato de email inválido. Use um email válido como exemplo@dominio.com');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
    .custom((value) => {
      const result = validateSenhaStrength(value);
      if (!result.valid) {
        throw new Error(result.message);
      }
      return true;
    }),
  
  body('telefone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .customSanitizer(value => removeFormatting(value))
    .custom((value) => {
      if (!isValidTelefone(value)) {
        throw new Error('Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)');
      }
      if (!isValidDDD(value)) {
        throw new Error('DDD inválido. Verifique o código de área');
      }
      return true;
    })
];

const updateEntregadorValidation = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (value && !isValidNome(value)) {
        throw new Error('Nome deve conter apenas letras, espaços e acentos');
      }
      if (value) {
        const parts = value.trim().split(/\s+/);
        if (parts.length < 2) {
          throw new Error('Por favor, informe nome completo');
        }
      }
      return true;
    }),
  
  body('email')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidEmail(value)) {
        throw new Error('Formato de email inválido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('senha')
    .optional()
    .custom((value) => {
      if (value) {
        const result = validateSenhaStrength(value);
        if (!result.valid) {
          throw new Error(result.message);
        }
      }
      return true;
    }),
  
  body('telefone')
    .optional()
    .trim()
    .customSanitizer(value => value ? removeFormatting(value) : value)
    .custom((value) => {
      if (value) {
        if (!isValidTelefone(value)) {
          throw new Error('Telefone deve conter 10 ou 11 dígitos');
        }
        if (!isValidDDD(value)) {
          throw new Error('DDD inválido');
        }
      }
      return true;
    })
];

const updateStatusEntregadorValidation = [
  body('status')
    .notEmpty().withMessage('Status é obrigatório')
    .isIn(['Disponivel', 'Indisponivel', 'Em Entrega']).withMessage('Status inválido. Use: "Disponivel", "Indisponivel" ou "Em Entrega"')
];

module.exports = {
  createEntregadorValidation,
  updateEntregadorValidation,
  updateStatusEntregadorValidation
};
