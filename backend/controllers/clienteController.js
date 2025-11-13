const clienteService = require('../services/clienteService');

class ClienteController {
  // GET /api/clientes/profile
  async getProfile(req, res, next) {
    try {
      const cliente = await clienteService.getProfile(req.clienteId);

      res.json({
        message: 'Perfil obtido com sucesso',
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/clientes/profile
  async updateProfile(req, res, next) {
    try {
      const { nome, email, telefone } = req.body;

      const cliente = await clienteService.updateProfile(req.clienteId, {
        nome,
        email,
        telefone
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/clientes/change-password
  async changePassword(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      await clienteService.changePassword(req.clienteId, senhaAtual, novaSenha);

      res.json({
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/clientes/account
  async deleteAccount(req, res, next) {
    try {
      await clienteService.deleteAccount(req.clienteId);

      res.json({
        message: 'Conta deletada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClienteController();
