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
      // Verificar se contém pelo menos uma letra
      if (!/[a-zA-ZÀ-ÿ]/.test(value)) {
        throw new Error('Nome da categoria deve conter pelo menos uma letra');
      }
      // Não permitir apenas números e espaços
      if (/^[\d\s]+$/.test(value)) {
        throw new Error('Nome da categoria não pode conter apenas números');
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
      // Verificar se contém pelo menos uma letra
      if (!/[a-zA-ZÀ-ÿ]/.test(value)) {
        throw new Error('Nome da categoria deve conter pelo menos uma letra');
      }
      // Não permitir apenas números e espaços
      if (/^[\d\s]+$/.test(value)) {
        throw new Error('Nome da categoria não pode conter apenas números');
      }
      return true;
    })
];

module.exports = {
  createCategoriaValidation,
  updateCategoriaValidation
};
