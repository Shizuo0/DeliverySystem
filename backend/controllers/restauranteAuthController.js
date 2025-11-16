const restauranteAuthService = require('../services/restauranteAuthService');

class RestauranteAuthController {
  // Registrar novo restaurante
  async register(req, res, next) {
    try {
      const result = await restauranteAuthService.register(req.body);
      res.status(201).json({
        message: 'Restaurante registrado com sucesso',
        restaurante: result.restaurante,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  // Login de restaurante
  async login(req, res, next) {
    try {
      const result = await restauranteAuthService.login(req.body);
      res.json({
        message: 'Login realizado com sucesso',
        restaurante: result.restaurante,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestauranteAuthController();
