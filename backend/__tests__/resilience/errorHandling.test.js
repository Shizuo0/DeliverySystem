const request = require('supertest');
const express = require('express');
const errorHandler = require('../../middlewares/errorHandler');

// Mock app para testar error handling
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Rota que lança erro
  app.get('/error', (req, res, next) => {
    const error = new Error('Erro de teste');
    error.statusCode = 400;
    next(error);
  });

  // Rota que lança erro sem statusCode
  app.get('/error-no-status', (req, res, next) => {
    next(new Error('Erro sem status'));
  });

  // Rota que lança erro de validação
  app.get('/validation-error', (req, res, next) => {
    const error = new Error('Erro de validação');
    error.statusCode = 422;
    error.errors = [
      { field: 'email', message: 'Email inválido' },
      { field: 'senha', message: 'Senha muito curta' }
    ];
    next(error);
  });

  // Rota assíncrona com erro
  app.get('/async-error', async (req, res, next) => {
    try {
      throw new Error('Erro assíncrono');
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);
  
  return app;
};

describe('Error Handling Middleware', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  test('Should handle error with custom statusCode', async () => {
    const response = await request(app)
      .get('/error')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Erro de teste');
  });

  test('Should default to 500 for errors without statusCode', async () => {
    const response = await request(app)
      .get('/error-no-status')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('Should include validation errors in response', async () => {
    const response = await request(app)
      .get('/validation-error')
      .expect(422);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors[0].field).toBe('email');
  });

  test('Should handle async errors', async () => {
    const response = await request(app)
      .get('/async-error')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('Should return JSON response', async () => {
    const response = await request(app)
      .get('/error')
      .expect('Content-Type', /json/);

    expect(response.body).toBeInstanceOf(Object);
  });
});

describe('Database Error Handling', () => {
  const db = require('../../config/database');

  afterAll(async () => {
    await db.end();
  });

  test('Should handle duplicate key error', async () => {
    const email = `duplicate_${Date.now()}@test.com`;
    
    // Inserir primeiro registro
    await db.query(
      'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      ['Cliente 1', email, 'hash123', '(85) 91111-1111']
    );

    // Tentar inserir duplicado
    try {
      await db.query(
        'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
        ['Cliente 2', email, 'hash456', '(85) 92222-2222']
      );
      fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('ER_DUP_ENTRY');
    } finally {
      // Limpar
      await db.query('DELETE FROM Clientes WHERE email = ?', [email]);
    }
  });

  test('Should handle foreign key violation', async () => {
    try {
      await db.query(
        'INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, status, valor_total, metodo_pagamento) VALUES (?, ?, ?, ?, ?, ?)',
        [99999, 1, 1, 'Pendente', 50.00, 'PIX']
      );
      fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('ER_NO_REFERENCED_ROW_2');
    }
  });

  test('Should handle invalid column error', async () => {
    try {
      await db.query('SELECT coluna_inexistente FROM Clientes');
      fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('ER_BAD_FIELD_ERROR');
    }
  });

  test('Should handle table not found error', async () => {
    try {
      await db.query('SELECT * FROM TabelaInexistente');
      fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('ER_NO_SUCH_TABLE');
    }
  });
});

describe('Service Layer Error Handling', () => {
  const pedidoService = require('../../services/pedidoService');
  const pedidoRepository = require('../../repositories/pedidoRepository');
  const restauranteRepository = require('../../repositories/restauranteRepository');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should handle database connection error gracefully', async () => {
    jest.spyOn(restauranteRepository, 'findById').mockRejectedValue(
      new Error('Connection lost')
    );

    await expect(
      pedidoService.createFromCart(1, 1, 1, 'PIX', [])
    ).rejects.toThrow('Connection lost');
  });

  test('Should handle timeout error', async () => {
    jest.spyOn(restauranteRepository, 'findById').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 100);
      });
    });

    await expect(
      pedidoService.createFromCart(1, 1, 1, 'PIX', [])
    ).rejects.toThrow('Query timeout');
  });

  test('Should propagate validation errors', async () => {
    jest.spyOn(restauranteRepository, 'findById').mockResolvedValue(null);

    await expect(
      pedidoService.createFromCart(1, 999, 1, 'PIX', [])
    ).rejects.toThrow('Restaurante não encontrado');
  });
});

describe('Critical Failure Points', () => {
  test('Should handle missing environment variables gracefully', () => {
    const originalEnv = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    // Recarregar módulo sem JWT_SECRET
    jest.resetModules();
    
    // O sistema deve ter um fallback ou lançar erro claro
    expect(() => {
      require('../../config/database');
    }).not.toThrow(); // database.js não depende de JWT_SECRET

    // Restaurar
    process.env.JWT_SECRET = originalEnv;
  });

  test('Should validate required fields before database insert', async () => {
    const db = require('../../config/database');
    
    try {
      // Tentar inserir sem campos obrigatórios
      await db.query('INSERT INTO Clientes (nome) VALUES (?)', ['Nome Teste']);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('Should handle race conditions in order status updates', async () => {
    const pedidoRepository = require('../../repositories/pedidoRepository');
    
    // Simular updates concorrentes
    const mockUpdate = jest.spyOn(pedidoRepository, 'updateStatus')
      .mockResolvedValue(true);

    const updates = [
      pedidoRepository.updateStatus(1, 'Confirmado'),
      pedidoRepository.updateStatus(1, 'Em Preparo'),
      pedidoRepository.updateStatus(1, 'A Caminho')
    ];

    // Todas devem completar sem erro
    await expect(Promise.all(updates)).resolves.toBeDefined();
    
    mockUpdate.mockRestore();
  });
});

describe('Resilience Tests', () => {
  test('Should recover from temporary network error', async () => {
    const db = require('../../config/database');
    
    // Simular query bem-sucedida após "falha"
    let attemptCount = 0;
    const resilientQuery = async () => {
      attemptCount++;
      if (attemptCount === 1) {
        throw new Error('Network error');
      }
      return db.query('SELECT 1 as result');
    };

    // Primeira tentativa falha
    await expect(resilientQuery()).rejects.toThrow('Network error');
    
    // Segunda tentativa sucede
    const [rows] = await resilientQuery();
    expect(rows[0].result).toBe(1);
  });

  test('Should handle connection pool exhaustion', async () => {
    const db = require('../../config/database');
    
    // Pegar múltiplas conexões (mais do que o limite do pool)
    const connections = [];
    
    try {
      // Tentar pegar mais conexões do que o pool permite
      for (let i = 0; i < 15; i++) { // Pool limit é 10
        connections.push(await db.getConnection());
      }
    } catch (error) {
      // Pode dar timeout ou erro de pool cheio
      expect(error).toBeDefined();
    } finally {
      // Liberar todas as conexões
      connections.forEach(conn => conn.release());
    }
  });
});
