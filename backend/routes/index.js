const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const restauranteRoutes = require('./restauranteRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const entregadorRoutes = require('./entregadorRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');

// Usar rotas
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/restaurantes', restauranteRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/entregadores', entregadorRoutes);
router.use('/avaliacoes', avaliacaoRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
