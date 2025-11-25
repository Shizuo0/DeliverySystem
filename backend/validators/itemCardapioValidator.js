const { body } = require('express-validator');

const createItemCardapioValidation = [
  body('id_categoria')
    .notEmpty().withMessage('ID da categoria é obrigatório')
    .isInt({ min: 1 }).withMessage('ID da categoria deve ser um número inteiro positivo'),
  
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome do item é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      // Verificar caracteres perigosos
      if (/[<>{}[\]\\]/.test(value)) {
        throw new Error('Nome contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Descrição contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('preco')
    .notEmpty().withMessage('Preço é obrigatório')
    .isFloat({ min: 0.01, max: 9999.99 }).withMessage('Preço deve estar entre R$ 0,01 e R$ 9.999,99')
    .custom((value) => {
      // Verificar se tem no máximo 2 casas decimais
      const decimal = value.toString().split('.')[1];
      if (decimal && decimal.length > 2) {
        throw new Error('Preço deve ter no máximo 2 casas decimais');
      }
      return true;
    }),
  
  body('disponivel')
    .optional()
    .isBoolean().withMessage('Disponível deve ser true ou false')
];

const updateItemCardapioValidation = [
  body('id_categoria')
    .optional()
    .isInt({ min: 1 }).withMessage('ID da categoria deve ser um número inteiro positivo'),
  
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Nome contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Descrição contém caracteres não permitidos');
      }
      return true;
    }),
  
  body('preco')
    .optional()
    .isFloat({ min: 0.01, max: 9999.99 }).withMessage('Preço deve estar entre R$ 0,01 e R$ 9.999,99')
    .custom((value) => {
      // Verificar se tem no máximo 2 casas decimais
      const decimal = value.toString().split('.')[1];
      if (decimal && decimal.length > 2) {
        throw new Error('Preço deve ter no máximo 2 casas decimais');
      }
      return true;
    }),
  
  body('disponivel')
    .optional()
    .isBoolean().withMessage('Disponível deve ser true ou false')
];

const updateDisponibilidadeValidation = [
  body('disponivel')
    .notEmpty().withMessage('Disponível é obrigatório')
    .isBoolean().withMessage('Disponível deve ser true ou false')
];

module.exports = {
  createItemCardapioValidation,
  updateItemCardapioValidation,
  updateDisponibilidadeValidation
};
