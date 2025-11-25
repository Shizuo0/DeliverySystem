const { body } = require('express-validator');

const createCategoriaValidation = [
  body('nome_categoria')
    .trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome da categoria deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      // Verificar caracteres perigosos
      if (/[<>{}[\]\\]/.test(value)) {
        throw new Error('Nome da categoria contém caracteres não permitidos');
      }
      return true;
    })
];

const updateCategoriaValidation = [
  body('nome_categoria')
    .trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome da categoria deve ter entre 2 e 100 caracteres')
    .custom((value) => {
      // Verificar caracteres perigosos
      if (/[<>{}[\]\\]/.test(value)) {
        throw new Error('Nome da categoria contém caracteres não permitidos');
      }
      return true;
    })
];

module.exports = {
  createCategoriaValidation,
  updateCategoriaValidation
};
