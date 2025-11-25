const authService = require('../services/authService');

class AuthController {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { nome, username, email, senha, telefone, cpf } = req.body;

      const result = await authService.register({
        nome,
        username,
        email,
        senha,
        telefone,
        cpf
      });

      res.status(201).json({
        message: 'Cliente registrado com sucesso',
        data: {
          cliente: result.cliente,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      const result = await authService.login(email, senha);

      res.json({
        message: 'Login realizado com sucesso',
        data: {
          cliente: result.cliente,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      // No JWT, o logout é feito no client-side removendo o token
      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
