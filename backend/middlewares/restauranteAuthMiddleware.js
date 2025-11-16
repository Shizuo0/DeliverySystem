const restauranteAuthService = require('../services/restauranteAuthService');
const restauranteRepository = require('../repositories/restauranteRepository');

const restauranteAuthMiddleware = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido' 
      });
    }

    // Formato: Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Formato de token inválido' 
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = restauranteAuthService.verifyToken(token);

    // Verificar se é um token de restaurante
    if (decoded.tipo !== 'restaurante') {
      return res.status(403).json({ 
        error: 'Acesso negado. Token de restaurante requerido.' 
      });
    }

    // Verificar se restaurante ainda existe
    const restaurante = await restauranteRepository.findById(decoded.id);
    if (!restaurante) {
      return res.status(401).json({ 
        error: 'Restaurante não encontrado' 
      });
    }

    // Adicionar dados do restaurante à requisição
    req.restauranteId = decoded.id;
    req.restauranteEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
};

module.exports = restauranteAuthMiddleware;
