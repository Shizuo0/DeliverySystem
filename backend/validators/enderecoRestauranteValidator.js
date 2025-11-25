const { body } = require('express-validator');
const {
  isValidCEP,
  isValidEstado,
  isValidLogradouro,
  isValidNumeroEndereco,
  isValidCidade,
  isValidBairro,
  removeFormatting,
  ESTADOS_VALIDOS
} = require('../utils/validationHelpers');

const createEnderecoRestauranteValidation = [
  body('logradouro')
    .trim()
    .notEmpty().withMessage('Logradouro é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Logradouro deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (!isValidLogradouro(value)) {
        throw new Error('Logradouro deve conter pelo menos uma letra e não pode ter caracteres especiais como < > { } [ ]');
      }
      return true;
    }),
  
  body('numero')
    .trim()
    .notEmpty().withMessage('Número é obrigatório')
    .isLength({ max: 10 }).withMessage('Número deve ter no máximo 10 caracteres')
    .custom((value) => {
      if (!isValidNumeroEndereco(value)) {
        throw new Error('Número deve conter apenas dígitos, opcionalmente seguidos de uma letra (ex: 123, 45A), ou S/N para sem número');
      }
      return true;
    }),
  
  body('complemento')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Complemento deve ter no máximo 100 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Complemento contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('bairro')
    .trim()
    .notEmpty().withMessage('Bairro é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Bairro deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      if (!isValidBairro(value)) {
        throw new Error('Bairro contém caracteres inválidos. Use apenas letras, números, espaços e hífens');
      }
      return true;
    }),
  
  body('cidade')
    .trim()
    .notEmpty().withMessage('Cidade é obrigatória')
    .isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      if (!isValidCidade(value)) {
        throw new Error('Cidade deve conter apenas letras, espaços e acentos. Números não são permitidos');
      }
      return true;
    }),
  
  body('estado')
    .trim()
    .notEmpty().withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter exatamente 2 caracteres (UF)')
    .customSanitizer(value => value.toUpperCase())
    .custom((value) => {
      if (!isValidEstado(value)) {
        throw new Error(`Estado inválido. Use uma das siglas: ${ESTADOS_VALIDOS.join(', ')}`);
      }
      return true;
    }),
  
  body('cep')
    .trim()
    .notEmpty().withMessage('CEP é obrigatório')
    .customSanitizer(value => removeFormatting(value))
    .custom((value) => {
      if (value.length !== 8) {
        throw new Error('CEP deve conter exatamente 8 dígitos');
      }
      if (!isValidCEP(value)) {
        throw new Error('CEP inválido. Verifique o número e tente novamente');
      }
      return true;
    })
];

const updateEnderecoRestauranteValidation = [
  body('logradouro')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Logradouro deve ter entre 3 e 255 caracteres')
    .custom((value) => {
      if (value && !isValidLogradouro(value)) {
        throw new Error('Logradouro deve conter pelo menos uma letra e não pode ter caracteres especiais');
      }
      return true;
    }),
  
  body('numero')
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage('Número deve ter no máximo 10 caracteres')
    .custom((value) => {
      if (value && !isValidNumeroEndereco(value)) {
        throw new Error('Número deve conter apenas dígitos (ex: 123, 45A) ou S/N');
      }
      return true;
    }),
  
  body('complemento')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Complemento deve ter no máximo 100 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Complemento contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('bairro')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Bairro deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      if (value && !isValidBairro(value)) {
        throw new Error('Bairro contém caracteres inválidos');
      }
      return true;
    }),
  
  body('cidade')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      if (value && !isValidCidade(value)) {
        throw new Error('Cidade deve conter apenas letras');
      }
      return true;
    }),
  
  body('estado')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)')
    .customSanitizer(value => value ? value.toUpperCase() : value)
    .custom((value) => {
      if (value && !isValidEstado(value)) {
        throw new Error(`Estado inválido. Use uma das siglas: ${ESTADOS_VALIDOS.join(', ')}`);
      }
      return true;
    }),
  
  body('cep')
    .optional()
    .trim()
    .customSanitizer(value => value ? removeFormatting(value) : value)
    .custom((value) => {
      if (value) {
        if (value.length !== 8) {
          throw new Error('CEP deve conter exatamente 8 dígitos');
        }
        if (!isValidCEP(value)) {
          throw new Error('CEP inválido');
        }
      }
      return true;
    })
];

module.exports = {
  createEnderecoRestauranteValidation,
  updateEnderecoRestauranteValidation
};
