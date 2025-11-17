const avaliacaoService = require('../services/avaliacaoService');

class AvaliacaoController {
  // Criar avaliação (cliente autenticado)
  async create(req, res, next) {
    try {
      const avaliacao = await avaliacaoService.create(req.clienteId, req.body);
      res.status(201).json({
        message: 'Avaliação criada com sucesso',
        avaliacao
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter avaliação por ID
  async getById(req, res, next) {
    try {
      const avaliacao = await avaliacaoService.getById(parseInt(req.params.id));
      res.json(avaliacao);
    } catch (error) {
      next(error);
    }
  }

  // Obter avaliação por pedido
  async getByPedido(req, res, next) {
    try {
      const avaliacao = await avaliacaoService.getByPedido(parseInt(req.params.pedidoId));
      res.json(avaliacao);
    } catch (error) {
      next(error);
    }
  }

  // Listar avaliações do cliente autenticado
  async listByCliente(req, res, next) {
    try {
      const avaliacoes = await avaliacaoService.getByCliente(req.clienteId);
      res.json(avaliacoes);
    } catch (error) {
      next(error);
    }
  }

  // Listar avaliações do restaurante autenticado (feedback)
  async listByRestaurante(req, res, next) {
    try {
      const avaliacoes = await avaliacaoService.getByRestaurante(req.restauranteId);
      res.json(avaliacoes);
    } catch (error) {
      next(error);
    }
  }

  // Obter média de avaliações do restaurante
  async getRestauranteMedia(req, res, next) {
    try {
      const media = await avaliacaoService.getRestauranteMedia(req.restauranteId);
      res.json(media);
    } catch (error) {
      next(error);
    }
  }

  // Obter avaliações de um restaurante específico (público)
  async getByRestaurantePublic(req, res, next) {
    try {
      const avaliacoes = await avaliacaoService.getByRestaurante(
        parseInt(req.params.restauranteId)
      );
      res.json(avaliacoes);
    } catch (error) {
      next(error);
    }
  }

  // Obter média de um restaurante específico (público)
  async getRestauranteMediaPublic(req, res, next) {
    try {
      const media = await avaliacaoService.getRestauranteMedia(
        parseInt(req.params.restauranteId)
      );
      res.json(media);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar avaliação (cliente autenticado)
  async update(req, res, next) {
    try {
      const avaliacao = await avaliacaoService.update(
        parseInt(req.params.id),
        req.clienteId,
        req.body
      );
      res.json({
        message: 'Avaliação atualizada com sucesso',
        avaliacao
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar avaliação (cliente autenticado)
  async delete(req, res, next) {
    try {
      await avaliacaoService.delete(parseInt(req.params.id), req.clienteId);
      res.json({
        message: 'Avaliação deletada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AvaliacaoController();
