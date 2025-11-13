const authService = require('../services/authService');
const clienteRepository = require('../repositories/clienteRepository');

const authMiddleware = async (req, res, next) => {
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
    const decoded = authService.verifyToken(token);

    // Verificar se cliente ainda existe
    const cliente = await clienteRepository.findById(decoded.id);
    if (!cliente) {
      return res.status(401).json({ 
        error: 'Cliente não encontrado' 
      });
    }

    // Adicionar dados do cliente à requisição
    req.clienteId = decoded.id;
    req.clienteEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
};

module.exports = authMiddleware;
