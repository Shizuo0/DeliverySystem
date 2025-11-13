const enderecoClienteService = require('../services/enderecoClienteService');

class EnderecoClienteController {
  // POST /api/clientes/enderecos
  async create(req, res, next) {
    try {
      const { logradouro, numero, complemento, bairro, cidade, estado, cep, nome_identificador } = req.body;

      const endereco = await enderecoClienteService.create(req.clienteId, {
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        nome_identificador
      });

      res.status(201).json({
        message: 'Endereço criado com sucesso',
        data: endereco
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/enderecos
  async list(req, res, next) {
    try {
      const enderecos = await enderecoClienteService.listByCliente(req.clienteId);

      res.json({
        message: 'Endereços obtidos com sucesso',
        data: enderecos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/enderecos/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const endereco = await enderecoClienteService.getById(parseInt(id), req.clienteId);

      res.json({
        message: 'Endereço obtido com sucesso',
        data: endereco
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/clientes/enderecos/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { logradouro, numero, complemento, bairro, cidade, estado, cep, nome_identificador } = req.body;

      const endereco = await enderecoClienteService.update(parseInt(id), req.clienteId, {
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        nome_identificador
      });

      res.json({
        message: 'Endereço atualizado com sucesso',
        data: endereco
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/clientes/enderecos/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await enderecoClienteService.delete(parseInt(id), req.clienteId);

      res.json({
        message: 'Endereço deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnderecoClienteController();
