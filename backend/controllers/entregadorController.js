const entregadorService = require('../services/entregadorService');

class EntregadorController {
  // Criar entregador
  async create(req, res, next) {
    try {
      const entregador = await entregadorService.create(req.body);
      res.status(201).json({
        message: 'Entregador cadastrado com sucesso',
        entregador
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter entregador por ID
  async getById(req, res, next) {
    try {
      const entregador = await entregadorService.getById(parseInt(req.params.id));
      res.json(entregador);
    } catch (error) {
      next(error);
    }
  }

  // Listar todos os entregadores
  async listAll(req, res, next) {
    try {
      const entregadores = await entregadorService.getAll();
      res.json(entregadores);
    } catch (error) {
      next(error);
    }
  }

  // Listar entregadores online
  async listOnline(req, res, next) {
    try {
      const entregadores = await entregadorService.getOnline();
      res.json(entregadores);
    } catch (error) {
      next(error);
    }
  }

  // Listar entregadores por status
  async listByStatus(req, res, next) {
    try {
      const status = req.query.status;
      if (!status) {
        return res.status(400).json({ error: 'Status não especificado' });
      }
      const entregadores = await entregadorService.getByStatus(status);
      res.json(entregadores);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar entregador
  async update(req, res, next) {
    try {
      const entregador = await entregadorService.update(
        parseInt(req.params.id),
        req.body
      );
      res.json({
        message: 'Entregador atualizado com sucesso',
        entregador
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar status
  async updateStatus(req, res, next) {
    try {
      const entregador = await entregadorService.updateStatus(
        parseInt(req.params.id),
        req.body.status
      );
      res.json({
        message: 'Status atualizado com sucesso',
        entregador
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar entregador
  async delete(req, res, next) {
    try {
      await entregadorService.delete(parseInt(req.params.id));
      res.json({
        message: 'Entregador deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntregadorController();
