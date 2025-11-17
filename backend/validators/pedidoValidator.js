const { body } = require('express-validator');

const createPedidoValidation = [
  body('id_restaurante')
    .notEmpty().withMessage('ID do restaurante é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do restaurante deve ser um número inteiro positivo'),
  
  body('id_endereco_cliente')
    .notEmpty().withMessage('ID do endereço de entrega é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do endereço deve ser um número inteiro positivo'),
  
  body('metodo_pagamento')
    .trim()
    .notEmpty().withMessage('Método de pagamento é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Método de pagamento deve ter entre 2 e 50 caracteres')
    .isIn(['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Vale-Refeição'])
    .withMessage('Método de pagamento inválido'),
  
  body('itens')
    .notEmpty().withMessage('Itens do pedido são obrigatórios')
    .isArray({ min: 1 }).withMessage('Deve haver pelo menos um item no pedido'),
  
  body('itens.*.id_item_cardapio')
    .notEmpty().withMessage('ID do item do cardápio é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do item deve ser um número inteiro positivo'),
  
  body('itens.*.quantidade')
    .notEmpty().withMessage('Quantidade é obrigatória')
    .isInt({ min: 1, max: 99 }).withMessage('Quantidade deve ser entre 1 e 99')
];

const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status é obrigatório')
    .isIn(['Pendente', 'Confirmado', 'Em Preparo', 'A Caminho', 'Entregue', 'Cancelado'])
    .withMessage('Status inválido')
];

module.exports = {
  createPedidoValidation,
  updateStatusValidation
};
