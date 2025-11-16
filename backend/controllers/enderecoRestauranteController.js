const enderecoRestauranteService = require('../services/enderecoRestauranteService');

class EnderecoRestauranteController {
  // Criar endereço para o restaurante autenticado
  async create(req, res, next) {
    try {
      const endereco = await enderecoRestauranteService.create(
        req.restauranteId,
        req.body
      );
      res.status(201).json({
        message: 'Endereço cadastrado com sucesso',
        endereco
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter endereço do restaurante autenticado
  async get(req, res, next) {
    try {
      const endereco = await enderecoRestauranteService.getByRestaurante(
        req.restauranteId
      );
      res.json(endereco);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar endereço do restaurante autenticado
  async update(req, res, next) {
    try {
      const endereco = await enderecoRestauranteService.update(
        req.restauranteId,
        req.body
      );
      res.json({
        message: 'Endereço atualizado com sucesso',
        endereco
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar endereço do restaurante autenticado
  async delete(req, res, next) {
    try {
      await enderecoRestauranteService.delete(req.restauranteId);
      res.json({
        message: 'Endereço deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnderecoRestauranteController();
