const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const restauranteRoutes = require('./restauranteRoutes');

// Usar rotas
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/restaurantes', restauranteRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
