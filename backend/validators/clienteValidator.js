const { body } = require('express-validator');
const {
  isValidUsername,
  isValidEmail,
  isValidTelefone,
  isValidDDD,
  validateSenhaStrength,
  removeFormatting
} = require('../utils/validationHelpers');

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Username deve ter entre 3 e 100 caracteres')
    .custom((value) => {
      if (!isValidUsername(value)) {
        throw new Error('Username deve conter apenas letras, números e underscores (_). Espaços e caracteres especiais não são permitidos');
      }
      if (/^\d/.test(value)) {
        throw new Error('Username não pode começar com número');
      }
      if (/__/.test(value)) {
        throw new Error('Username não pode ter underscores consecutivos');
      }
      return true;
    }),
  
  body('email')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidEmail(value)) {
        throw new Error('Formato de email inválido. Use um email válido como exemplo@dominio.com');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('telefone')
    .optional()
    .trim()
    .customSanitizer(value => value ? removeFormatting(value) : value)
    .custom((value) => {
      if (value) {
        if (!isValidTelefone(value)) {
          throw new Error('Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)');
        }
        if (!isValidDDD(value)) {
          throw new Error('DDD inválido. Verifique o código de área');
        }
      }
      return true;
    })
];

const changePasswordValidation = [
  body('senhaAtual')
    .notEmpty().withMessage('Senha atual é obrigatória'),
  
  body('novaSenha')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .custom((value, { req }) => {
      const result = validateSenhaStrength(value);
      if (!result.valid) {
        throw new Error(result.message);
      }
      if (value === req.body.senhaAtual) {
        throw new Error('A nova senha deve ser diferente da senha atual');
      }
      // Não permitir senhas muito comuns
      const senhasComuns = ['123456', 'senha123', 'password', 'qwerty', 'abc123'];
      if (senhasComuns.includes(value.toLowerCase())) {
        throw new Error('Esta senha é muito comum. Escolha uma senha mais segura');
      }
      return true;
    })
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation
};
