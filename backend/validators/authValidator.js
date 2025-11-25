const { body } = require('express-validator');
const { 
  isValidCPF, 
  isValidNome, 
  isValidTelefone, 
  isValidDDD,
  isValidEmail,
  isValidUsername,
  validateSenhaStrength,
  removeFormatting 
} = require('../utils/validationHelpers');

const registerValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome completo é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (!isValidNome(value)) {
        throw new Error('Nome deve conter apenas letras, espaços e acentos. Números e caracteres especiais não são permitidos');
      }
      // Verificar se tem pelo menos nome e sobrenome
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2) {
        throw new Error('Por favor, informe nome e sobrenome');
      }
      // Verificar se cada parte do nome tem pelo menos 2 caracteres
      if (parts.some(part => part.length < 2)) {
        throw new Error('Cada parte do nome deve ter pelo menos 2 caracteres');
      }
      return true;
    }),
  
  body('username')
    .trim()
    .notEmpty().withMessage('Username é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Username deve ter entre 3 e 100 caracteres')
    .custom((value) => {
      if (!isValidUsername(value)) {
        throw new Error('Username deve conter apenas letras, números e underscores (_). Espaços e caracteres especiais não são permitidos');
      }
      // Não pode começar com número
      if (/^\d/.test(value)) {
        throw new Error('Username não pode começar com número');
      }
      // Não pode ter underscores consecutivos
      if (/__/.test(value)) {
        throw new Error('Username não pode ter underscores consecutivos');
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
      // Não permitir senhas muito comuns
      const senhasComuns = ['123456', 'senha123', 'password', 'qwerty', 'abc123'];
      if (senhasComuns.includes(value.toLowerCase())) {
        throw new Error('Esta senha é muito comum. Escolha uma senha mais segura');
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
    }),

  body('cpf')
    .trim()
    .notEmpty().withMessage('CPF é obrigatório')
    .customSanitizer(value => removeFormatting(value))
    .custom((value) => {
      if (value.length !== 11) {
        throw new Error('CPF deve conter exatamente 11 dígitos');
      }
      if (!isValidCPF(value)) {
        throw new Error('CPF inválido. Verifique os dígitos e tente novamente');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Formato de email inválido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 1 }).withMessage('Senha não pode estar vazia')
];

module.exports = {
  registerValidation,
  loginValidation
};
