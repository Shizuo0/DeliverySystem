const { body } = require('express-validator');

const createEnderecoRestauranteValidation = [
  body('logradouro')
    .trim()
    .notEmpty().withMessage('Logradouro é obrigatório')
    .isLength({ max: 255 }).withMessage('Logradouro deve ter no máximo 255 caracteres'),
  
  body('numero')
    .trim()
    .notEmpty().withMessage('Número é obrigatório')
    .isLength({ max: 45 }).withMessage('Número deve ter no máximo 45 caracteres'),
  
  body('complemento')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Complemento deve ter no máximo 100 caracteres'),
  
  body('bairro')
    .trim()
    .notEmpty().withMessage('Bairro é obrigatório')
    .isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .trim()
    .notEmpty().withMessage('Cidade é obrigatória')
    .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .trim()
    .notEmpty().withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)')
    .isUppercase().withMessage('Estado deve estar em maiúsculas'),
  
  body('cep')
    .trim()
    .notEmpty().withMessage('CEP é obrigatório')
    .matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido. Use o formato XXXXX-XXX')
];

const updateEnderecoRestauranteValidation = [
  body('logradouro')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Logradouro deve ter no máximo 255 caracteres'),
  
  body('numero')
    .optional()
    .trim()
    .isLength({ max: 45 }).withMessage('Número deve ter no máximo 45 caracteres'),
  
  body('complemento')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Complemento deve ter no máximo 100 caracteres'),
  
  body('bairro')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)')
    .isUppercase().withMessage('Estado deve estar em maiúsculas'),
  
  body('cep')
    .optional()
    .trim()
    .matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido. Use o formato XXXXX-XXX')
];

module.exports = {
  createEnderecoRestauranteValidation,
  updateEnderecoRestauranteValidation
};
