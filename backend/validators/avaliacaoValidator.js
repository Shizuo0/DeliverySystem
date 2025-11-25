const { body } = require('express-validator');

const createAvaliacaoValidation = [
  body('id_pedido')
    .notEmpty().withMessage('ID do pedido é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do pedido deve ser um número inteiro positivo'),
  
  body('nota')
    .notEmpty().withMessage('Nota é obrigatória')
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5 estrelas'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comentário deve ter no máximo 500 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Comentário contém caracteres não permitidos');
      }
      // Verificar palavras ofensivas básicas
      if (value && /<script|javascript:|onclick|onerror/i.test(value)) {
        throw new Error('Comentário contém conteúdo não permitido');
      }
      return true;
    })
];

const updateAvaliacaoValidation = [
  body('nota')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5 estrelas'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comentário deve ter no máximo 500 caracteres')
    .custom((value) => {
      if (value && /[<>{}[\]\\]/.test(value)) {
        throw new Error('Comentário contém caracteres não permitidos');
      }
      if (value && /<script|javascript:|onclick|onerror/i.test(value)) {
        throw new Error('Comentário contém conteúdo não permitido');
      }
      return true;
    })
];

module.exports = {
  createAvaliacaoValidation,
  updateAvaliacaoValidation
};
