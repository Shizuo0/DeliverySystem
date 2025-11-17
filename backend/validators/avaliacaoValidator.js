const { body } = require('express-validator');

const createAvaliacaoValidation = [
  body('id_pedido')
    .notEmpty().withMessage('ID do pedido é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do pedido deve ser um número inteiro positivo'),
  
  body('nota')
    .notEmpty().withMessage('Nota é obrigatória')
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comentário deve ter no máximo 1000 caracteres')
];

const updateAvaliacaoValidation = [
  body('nota')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comentário deve ter no máximo 1000 caracteres')
];

module.exports = {
  createAvaliacaoValidation,
  updateAvaliacaoValidation
};
