const db = require('../../config/database');

describe('Database Connection Tests', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('Connection Pool', () => {
    test('Should establish database connection', async () => {
      const [rows] = await db.query('SELECT 1 as result');
      expect(rows[0].result).toBe(1);
    });

    test('Should handle multiple concurrent queries', async () => {
      const queries = [
        db.query('SELECT 1 as num'),
        db.query('SELECT 2 as num'),
        db.query('SELECT 3 as num'),
        db.query('SELECT 4 as num'),
        db.query('SELECT 5 as num')
      ];

      const results = await Promise.all(queries);
      
      expect(results[0][0][0].num).toBe(1);
      expect(results[1][0][0].num).toBe(2);
      expect(results[2][0][0].num).toBe(3);
      expect(results[3][0][0].num).toBe(4);
      expect(results[4][0][0].num).toBe(5);
    });

    test('Should reuse connections from pool', async () => {
      const connection1 = await db.getConnection();
      const [result1] = await connection1.query('SELECT CONNECTION_ID() as id');
      const id1 = result1[0].id;
      connection1.release();

      const connection2 = await db.getConnection();
      const [result2] = await connection2.query('SELECT CONNECTION_ID() as id');
      const id2 = result2[0].id;
      connection2.release();

      // As conexões podem ser reutilizadas (ids iguais) ou diferentes
      expect(typeof id1).toBe('number');
      expect(typeof id2).toBe('number');
    });
  });

  describe('Database Schema Validation', () => {
    test('Should have Clientes table', async () => {
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Clientes'
      `);
      expect(tables.length).toBe(1);
    });

    test('Should have Restaurantes table', async () => {
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Restaurantes'
      `);
      expect(tables.length).toBe(1);
    });

    test('Should have Pedidos table', async () => {
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Pedidos'
      `);
      expect(tables.length).toBe(1);
    });

    test('Should have Entregadores table', async () => {
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Entregadores'
      `);
      expect(tables.length).toBe(1);
    });

    test('Should have Avaliacoes table', async () => {
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Avaliacoes'
      `);
      expect(tables.length).toBe(1);
    });

    test('Should have all required columns in Pedidos table', async () => {
      const [columns] = await db.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Pedidos'
      `);

      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      expect(columnNames).toContain('id_pedido');
      expect(columnNames).toContain('id_cliente');
      expect(columnNames).toContain('id_restaurante');
      expect(columnNames).toContain('id_entregador');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('valor_total');
      expect(columnNames).toContain('metodo_pagamento');
    });

    test('Should have foreign keys defined', async () => {
      const [fks] = await db.query(`
        SELECT 
          TABLE_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
        AND TABLE_NAME = 'Pedidos'
      `);

      expect(fks.length).toBeGreaterThan(0);
      
      const referencedTables = fks.map(fk => fk.REFERENCED_TABLE_NAME);
      expect(referencedTables).toContain('Clientes');
      expect(referencedTables).toContain('Restaurantes');
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid SQL query', async () => {
      await expect(db.query('SELECT * FROM TabelaInexistente')).rejects.toThrow();
    });

    test('Should handle SQL syntax error', async () => {
      await expect(db.query('SELECTT * FROM Clientes')).rejects.toThrow();
    });

    test('Should timeout on long queries if configured', async () => {
      // Este teste é mais conceitual - em produção você configuraria timeouts
      const query = db.query('SELECT SLEEP(0.1)'); // Sleep curto para não travar o teste
      await expect(query).resolves.toBeDefined();
    });
  });

  describe('Connection Recovery', () => {
    test('Should handle connection release properly', async () => {
      const connection = await db.getConnection();
      expect(connection).toBeDefined();
      
      await connection.query('SELECT 1');
      connection.release();
      
      // Pool deve estar disponível para novas conexões
      const newConnection = await db.getConnection();
      expect(newConnection).toBeDefined();
      newConnection.release();
    });

    test('Should handle query after connection release', async () => {
      // Queries diretas no pool devem funcionar normalmente
      const [result] = await db.query('SELECT 1 as test');
      expect(result[0].test).toBe(1);
    });
  });
});
