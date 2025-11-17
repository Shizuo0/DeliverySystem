const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const errorHandler = require('../../middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler);

// Mock do authService
jest.mock('../../services/authService');
const authService = require('../../services/authService');

describe('AuthController Integration Tests', () => {
  describe('POST /auth/register', () => {
    it('deve registrar cliente com dados válidos', async () => {
      const clienteData = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'senha123',
        telefone: '(85) 98765-4321'
      };

      authService.register.mockResolvedValue({
        cliente: { id_cliente: 1, ...clienteData },
        token: 'token123'
      });

      const response = await request(app)
        .post('/auth/register')
        .send(clienteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('cliente');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const invalidData = {
        nome: 'Te', // muito curto
        email: 'invalid-email',
        senha: '123' // muito curta
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const credentials = {
        email: 'test@example.com',
        senha: 'senha123'
      };

      authService.login.mockResolvedValue({
        cliente: { id_cliente: 1 },
        token: 'token123'
      });

      const response = await request(app)
        .post('/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
});
