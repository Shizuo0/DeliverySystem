const restauranteService = require('../services/restauranteService');

class RestauranteController {
  // Obter perfil do restaurante autenticado
  async getProfile(req, res, next) {
    try {
      const restaurante = await restauranteService.getById(req.restauranteId);
      res.json(restaurante);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar perfil do restaurante autenticado
  async updateProfile(req, res, next) {
    try {
      const restaurante = await restauranteService.update(req.restauranteId, req.body);
      res.json({
        message: 'Perfil atualizado com sucesso',
        restaurante
      });
    } catch (error) {
      next(error);
    }
  }

  // Deletar conta do restaurante autenticado
  async deleteAccount(req, res, next) {
    try {
      await restauranteService.delete(req.restauranteId);
      res.json({
        message: 'Conta deletada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Alterar senha do restaurante autenticado
  async changePassword(req, res, next) {
    try {
      await restauranteService.changePassword(
        req.restauranteId,
        req.body.senhaAtual,
        req.body.novaSenha
      );
      res.json({
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar status operacional (Aberto/Fechado)
  async updateStatus(req, res, next) {
    try {
      const restaurante = await restauranteService.updateStatus(
        req.restauranteId,
        req.body.status
      );
      res.json({
        message: 'Status atualizado com sucesso',
        restaurante
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar todos os restaurantes (público)
  async listAll(req, res, next) {
    try {
      const restaurantes = await restauranteService.getAll();
      res.json(restaurantes);
    } catch (error) {
      next(error);
    }
  }

  // Listar apenas restaurantes abertos (público)
  async listOpen(req, res, next) {
    try {
      const restaurantes = await restauranteService.getOpen();
      res.json(restaurantes);
    } catch (error) {
      next(error);
    }
  }

  // Obter detalhes de um restaurante específico (público)
  async getById(req, res, next) {
    try {
      const data = await restauranteService.getRestauranteCompleto(req.params.id);
      // Retorna os dados do restaurante com o endereço aninhado ou null
      res.json({ ...data.restaurante, endereco: data.endereco });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestauranteController();
