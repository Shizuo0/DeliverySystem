const itemCardapioService = require('../services/itemCardapioService');

class ItemCardapioController {
  // Criar novo item no cardápio
  async create(req, res, next) {
    try {
      const item = await itemCardapioService.create(
        req.restauranteId,
        req.body
      );
      res.status(201).json({
        message: 'Item criado com sucesso',
        item
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar itens do cardápio do restaurante autenticado
  async list(req, res, next) {
    try {
      const itens = await itemCardapioService.listByRestaurante(
        req.restauranteId
      );
      res.json(itens);
    } catch (error) {
      next(error);
    }
  }

  // Listar apenas itens disponíveis do restaurante autenticado
  async listAvailable(req, res, next) {
    try {
      const itens = await itemCardapioService.listAvailableByRestaurante(
        req.restauranteId
      );
      res.json(itens);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar item do cardápio
  async update(req, res, next) {
    try {
      const item = await itemCardapioService.update(
        req.restauranteId,
        req.params.id,
        req.body
      );
      res.json({
        message: 'Item atualizado com sucesso',
        item
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar disponibilidade do item
  async updateDisponibilidade(req, res, next) {
    try {
      const item = await itemCardapioService.updateDisponibilidade(
        req.restauranteId,
        req.params.id,
        req.body.disponivel
      );
      res.json({
        message: 'Disponibilidade atualizada com sucesso',
        item
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar item do cardápio
  async delete(req, res, next) {
    try {
      await itemCardapioService.delete(req.restauranteId, req.params.id);
      res.json({
        message: 'Item deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter cardápio completo de um restaurante (público)
  async getCardapioCompleto(req, res, next) {
    try {
      const cardapio = await itemCardapioService.getCardapioCompleto(
        req.params.restauranteId
      );
      res.json(cardapio);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ItemCardapioController();
