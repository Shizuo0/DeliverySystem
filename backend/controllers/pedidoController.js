const pedidoService = require('../services/pedidoService');

class PedidoController {
  // Criar pedido (cliente autenticado)
  async create(req, res, next) {
    try {
      const pedido = await pedidoService.createFromCart(req.clienteId, req.body);
      res.status(201).json({
        message: 'Pedido criado com sucesso',
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter pedido específico (cliente autenticado)
  async getById(req, res, next) {
    try {
      const pedido = await pedidoService.getById(
        parseInt(req.params.id),
        req.clienteId,
        'cliente'
      );
      res.json(pedido);
    } catch (error) {
      next(error);
    }
  }

  // Listar pedidos do cliente autenticado
  async listByCliente(req, res, next) {
    try {
      const pedidos = await pedidoService.getByCliente(req.clienteId);
      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  }

  // Cancelar pedido (cliente autenticado)
  async cancel(req, res, next) {
    try {
      const pedido = await pedidoService.cancelByCliente(
        parseInt(req.params.id),
        req.clienteId
      );
      res.json({
        message: 'Pedido cancelado com sucesso',
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  // Confirmar entrega (cliente autenticado)
  async confirmDelivery(req, res, next) {
    try {
      const pedido = await pedidoService.confirmDeliveryByCliente(
        parseInt(req.params.id),
        req.clienteId
      );
      res.json({
        message: 'Entrega confirmada com sucesso',
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter pedido específico (restaurante autenticado)
  async getByIdRestaurante(req, res, next) {
    try {
      const pedido = await pedidoService.getById(
        parseInt(req.params.id),
        req.restauranteId,
        'restaurante'
      );
      res.json(pedido);
    } catch (error) {
      next(error);
    }
  }

  // Listar pedidos do restaurante autenticado
  async listByRestaurante(req, res, next) {
    try {
      const status = req.query.status || null;
      const pedidos = await pedidoService.getByRestaurante(req.restauranteId, status);
      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar status do pedido (restaurante autenticado)
  async updateStatus(req, res, next) {
    try {
      const pedido = await pedidoService.updateStatus(
        parseInt(req.params.id),
        req.restauranteId,
        req.body.status
      );
      res.json({
        message: 'Status atualizado com sucesso',
        pedido
      });
    } catch (error) {
      next(error);
    }
  }

  // Atribuir entregador ao pedido (restaurante autenticado)
  async assignEntregador(req, res, next) {
    try {
      const pedido = await pedidoService.assignEntregador(
        parseInt(req.params.id),
        req.restauranteId,
        req.body.id_entregador
      );
      res.json({
        message: 'Entregador atribuído com sucesso',
        pedido
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PedidoController();
