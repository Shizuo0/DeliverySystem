const { body } = require('express-validator');
const {
  isValidCNPJ,
  isValidNomeRestaurante,
  isValidUsername,
  isValidEmail,
  isValidTelefone,
  isValidDDD,
  isValidTipoCozinha,
  isValidDescricao,
  validateSenhaStrength,
  removeFormatting,
  TIPOS_COZINHA_VALIDOS
} = require('../utils/validationHelpers');

const registerRestauranteValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome do restaurante é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (!isValidNomeRestaurante(value)) {
        throw new Error('Nome do restaurante contém caracteres inválidos. Use apenas letras, números, espaços e caracteres como & . -');
      }
      return true;
    }),
  
  body('username')
    .trim()
    .notEmpty().withMessage('Username é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Username deve ter entre 3 e 100 caracteres')
    .custom((value) => {
      if (!isValidUsername(value)) {
        throw new Error('Username deve conter apenas letras, números e underscores (_)');
      }
      if (/^\d/.test(value)) {
        throw new Error('Username não pode começar com número');
      }
      if (/__/.test(value)) {
        throw new Error('Username não pode ter underscores consecutivos');
      }
      return true;
    }),
  
  body('email_admin')
    .trim()
    .notEmpty().withMessage('Email do administrador é obrigatório')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Formato de email inválido. Use um email válido como exemplo@dominio.com');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('senha_admin')
    .notEmpty().withMessage('Senha é obrigatória')
    .custom((value) => {
      const result = validateSenhaStrength(value);
      if (!result.valid) {
        throw new Error(result.message);
      }
      return true;
    }),
  
  body('tipo_cozinha')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tipo de cozinha deve ter no máximo 100 caracteres')
    .custom((value) => {
      if (value && !isValidTipoCozinha(value)) {
        throw new Error(`Tipo de cozinha inválido. Opções válidas: ${TIPOS_COZINHA_VALIDOS.join(', ')}`);
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
          throw new Error('Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)');
        }
        if (!isValidDDD(value)) {
          throw new Error('DDD inválido. Verifique o código de área');
        }
      }
      return true;
    }),

  body('cnpj')
    .trim()
    .notEmpty().withMessage('CNPJ é obrigatório')
    .customSanitizer(value => removeFormatting(value))
    .custom((value) => {
      if (value.length !== 14) {
        throw new Error('CNPJ deve conter exatamente 14 dígitos');
      }
      if (!isValidCNPJ(value)) {
        throw new Error('CNPJ inválido. Verifique os dígitos e tente novamente');
      }
      return true;
    })
];

const loginRestauranteValidation = [
  body('email_admin')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Formato de email inválido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('senha_admin')
    .notEmpty().withMessage('Senha é obrigatória')
];

const updateRestauranteValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Username deve ter entre 3 e 100 caracteres')
    .custom((value) => {
      if (!isValidUsername(value)) {
        throw new Error('Username deve conter apenas letras, números e underscores (_)');
      }
      if (/^\d/.test(value)) {
        throw new Error('Username não pode começar com número');
      }
      return true;
    }),
  
  body('email_admin')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidEmail(value)) {
        throw new Error('Formato de email inválido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('tipo_cozinha')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tipo de cozinha deve ter no máximo 100 caracteres')
    .custom((value) => {
      if (value && !isValidTipoCozinha(value)) {
        throw new Error(`Tipo de cozinha inválido. Opções válidas: ${TIPOS_COZINHA_VALIDOS.join(', ')}`);
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
    }),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres')
    .custom((value) => {
      if (value && !isValidDescricao(value)) {
        throw new Error('Descrição contém caracteres ou formatação não permitidos');
      }
      return true;
    }),
  
  body('tempo_entrega_estimado')
    .optional()
    .custom((value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Tempo de entrega deve ser um número positivo');
      }
      if (num > 180) {
        throw new Error('Tempo de entrega não pode exceder 180 minutos');
      }
      return true;
    }),
  
  body('taxa_entrega')
    .optional()
    .custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Taxa de entrega deve ser um número positivo');
      }
      if (num > 100) {
        throw new Error('Taxa de entrega não pode exceder R$ 100,00');
      }
      // Verificar casas decimais
      const decimal = num.toString().split('.')[1];
      if (decimal && decimal.length > 2) {
        throw new Error('Taxa de entrega deve ter no máximo 2 casas decimais');
      }
      return true;
    })
];

const changePasswordRestauranteValidation = [
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
      return true;
    })
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
