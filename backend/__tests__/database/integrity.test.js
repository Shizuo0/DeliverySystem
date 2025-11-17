const db = require('../../config/database');

describe('Database Integrity Tests', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('Foreign Key Constraints', () => {
    test('Should reject pedido with invalid id_cliente', async () => {
      const query = `
        INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, status, valor_total, metodo_pagamento)
        VALUES (99999, 1, 1, 'Pendente', 50.00, 'PIX')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject pedido with invalid id_restaurante', async () => {
      const query = `
        INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, status, valor_total, metodo_pagamento)
        VALUES (1, 99999, 1, 'Pendente', 50.00, 'PIX')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject item_pedido with invalid id_pedido', async () => {
      const query = `
        INSERT INTO ItensPedido (id_pedido, id_item_cardapio, quantidade, preco_unitario_gravado)
        VALUES (99999, 1, 2, 25.00)
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject avaliacao with invalid id_pedido', async () => {
      const query = `
        INSERT INTO Avaliacoes (id_cliente, id_restaurante, id_pedido, nota, comentario)
        VALUES (1, 1, 99999, 5, 'Teste')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject endereco_cliente with invalid id_cliente', async () => {
      const query = `
        INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, bairro, cidade, estado, cep)
        VALUES (99999, 'Rua Teste', '123', 'Centro', 'Fortaleza', 'CE', '60000-000')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject item_cardapio with invalid id_restaurante', async () => {
      const query = `
        INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, preco, disponivel)
        VALUES (99999, 1, 'Item Teste', 10.00, TRUE)
      `;

      await expect(db.query(query)).rejects.toThrow();
    });
  });

  describe('Cascade Delete Behavior', () => {
    let testClienteId;
    let testRestauranteId;

    beforeEach(async () => {
      // Criar cliente de teste
      const [clienteResult] = await db.query(
        'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
        ['Cliente Teste Cascade', `test_cascade_${Date.now()}@test.com`, 'hash123', '(85) 99999-9999']
      );
      testClienteId = clienteResult.insertId;

      // Criar restaurante de teste
      const [restauranteResult] = await db.query(
        'INSERT INTO Restaurantes (nome, email_admin, senha_admin, tipo_cozinha, telefone, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Restaurante Teste Cascade', `test_cascade_rest_${Date.now()}@test.com`, 'hash123', 'Brasileira', '(85) 98888-8888', 'Aberto']
      );
      testRestauranteId = restauranteResult.insertId;
    });

    afterEach(async () => {
      // Limpar dados de teste
      await db.query('DELETE FROM Clientes WHERE id_cliente = ?', [testClienteId]);
      await db.query('DELETE FROM Restaurantes WHERE id_restaurante = ?', [testRestauranteId]);
    });

    test('Should cascade delete enderecos when cliente is deleted', async () => {
      // Criar endereço
      const [enderecoResult] = await db.query(
        'INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testClienteId, 'Rua Teste', '123', 'Centro', 'Fortaleza', 'CE', '60000-000']
      );
      const enderecoId = enderecoResult.insertId;

      // Deletar cliente
      await db.query('DELETE FROM Clientes WHERE id_cliente = ?', [testClienteId]);

      // Verificar se endereço foi deletado
      const [enderecos] = await db.query(
        'SELECT * FROM EnderecosClientes WHERE id_endereco_cliente = ?',
        [enderecoId]
      );
      expect(enderecos.length).toBe(0);
    });

    test('Should cascade delete itens_cardapio when restaurante is deleted', async () => {
      // Criar categoria
      const [categoriaResult] = await db.query(
        'INSERT INTO CategoriasCardapio (id_restaurante, nome_categoria) VALUES (?, ?)',
        [testRestauranteId, 'Categoria Teste']
      );
      const categoriaId = categoriaResult.insertId;

      // Criar item
      const [itemResult] = await db.query(
        'INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, preco, disponivel) VALUES (?, ?, ?, ?, ?)',
        [testRestauranteId, categoriaId, 'Item Teste', 10.00, true]
      );
      const itemId = itemResult.insertId;

      // Deletar restaurante
      await db.query('DELETE FROM Restaurantes WHERE id_restaurante = ?', [testRestauranteId]);

      // Verificar se item foi deletado
      const [itens] = await db.query(
        'SELECT * FROM ItensCardapio WHERE id_item_cardapio = ?',
        [itemId]
      );
      expect(itens.length).toBe(0);
    });
  });

  describe('Unique Constraints', () => {
    test('Should reject duplicate cliente email', async () => {
      const email = `unique_test_${Date.now()}@test.com`;
      
      await db.query(
        'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
        ['Cliente 1', email, 'hash123', '(85) 91111-1111']
      );

      const query = db.query(
        'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
        ['Cliente 2', email, 'hash456', '(85) 92222-2222']
      );

      await expect(query).rejects.toThrow();

      // Limpar
      await db.query('DELETE FROM Clientes WHERE email = ?', [email]);
    });

    test('Should reject duplicate restaurante email_admin', async () => {
      const email = `unique_rest_${Date.now()}@test.com`;
      
      await db.query(
        'INSERT INTO Restaurantes (nome, email_admin, senha_admin, tipo_cozinha, telefone, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Restaurante 1', email, 'hash123', 'Brasileira', '(85) 93333-3333', 'Aberto']
      );

      const query = db.query(
        'INSERT INTO Restaurantes (nome, email_admin, senha_admin, tipo_cozinha, telefone, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Restaurante 2', email, 'hash456', 'Italiana', '(85) 94444-4444', 'Fechado']
      );

      await expect(query).rejects.toThrow();

      // Limpar
      await db.query('DELETE FROM Restaurantes WHERE email_admin = ?', [email]);
    });

    test('Should reject duplicate entregador email', async () => {
      const email = `unique_ent_${Date.now()}@test.com`;
      
      await db.query(
        'INSERT INTO Entregadores (nome, email, senha, telefone, status) VALUES (?, ?, ?, ?, ?)',
        ['Entregador 1', email, 'hash123', '(85) 95555-5555', 'Offline']
      );

      const query = db.query(
        'INSERT INTO Entregadores (nome, email, senha, telefone, status) VALUES (?, ?, ?, ?, ?)',
        ['Entregador 2', email, 'hash456', '(85) 96666-6666', 'Online']
      );

      await expect(query).rejects.toThrow();

      // Limpar
      await db.query('DELETE FROM Entregadores WHERE email = ?', [email]);
    });
  });

  describe('Data Type Validation', () => {
    test('Should reject invalid ENUM value for pedido status', async () => {
      const query = `
        INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, status, valor_total, metodo_pagamento)
        VALUES (1, 1, 1, 'StatusInvalido', 50.00, 'PIX')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject invalid ENUM value for metodo_pagamento', async () => {
      const query = `
        INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, status, valor_total, metodo_pagamento)
        VALUES (1, 1, 1, 'Pendente', 50.00, 'MetodoInvalido')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject invalid ENUM value for entregador status', async () => {
      const query = `
        INSERT INTO Entregadores (nome, email, senha, telefone, status)
        VALUES ('Entregador Teste', 'test@test.com', 'hash123', '(85) 97777-7777', 'StatusInvalido')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject negative value for preco', async () => {
      const query = `
        INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, preco, disponivel)
        VALUES (1, 1, 'Item Teste', -10.00, TRUE)
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject invalid nota (outside 1-5 range)', async () => {
      const query = `
        INSERT INTO Avaliacoes (id_cliente, id_restaurante, id_pedido, nota, comentario)
        VALUES (1, 1, 1, 10, 'Teste')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });
  });

  describe('NOT NULL Constraints', () => {
    test('Should reject cliente without email', async () => {
      const query = `
        INSERT INTO Clientes (nome, senha, telefone)
        VALUES ('Cliente Teste', 'hash123', '(85) 98888-8888')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject pedido without status', async () => {
      const query = `
        INSERT INTO Pedidos (id_cliente, id_restaurante, id_endereco_cliente, valor_total, metodo_pagamento)
        VALUES (1, 1, 1, 50.00, 'PIX')
      `;

      await expect(db.query(query)).rejects.toThrow();
    });

    test('Should reject item_cardapio without preco', async () => {
      const query = `
        INSERT INTO ItensCardapio (id_restaurante, id_categoria, nome, disponivel)
        VALUES (1, 1, 'Item Teste', TRUE)
      `;

      await expect(db.query(query)).rejects.toThrow();
    });
  });

  describe('Transaction Integrity', () => {
    test('Should rollback on transaction error', async () => {
      const connection = await db.getConnection();
      
      try {
        await connection.beginTransaction();

        // Inserir cliente
        const [clienteResult] = await connection.query(
          'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
          ['Cliente Transacao', `trans_${Date.now()}@test.com`, 'hash123', '(85) 99999-9999']
        );
        const clienteId = clienteResult.insertId;

        // Tentar inserir endereço com FK inválida (deve falhar)
        await connection.query(
          'INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [99999, 'Rua Teste', '123', 'Centro', 'Fortaleza', 'CE', '60000-000']
        );

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        
        // Verificar se cliente NÃO foi inserido (rollback funcionou)
        const [clientes] = await connection.query(
          'SELECT * FROM Clientes WHERE email LIKE ?',
          [`trans_%@test.com`]
        );
        expect(clientes.length).toBe(0);
      } finally {
        connection.release();
      }
    });

    test('Should commit on successful transaction', async () => {
      const connection = await db.getConnection();
      const email = `trans_success_${Date.now()}@test.com`;
      let clienteId;
      
      try {
        await connection.beginTransaction();

        // Inserir cliente
        const [clienteResult] = await connection.query(
          'INSERT INTO Clientes (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
          ['Cliente Transacao Success', email, 'hash123', '(85) 99999-9999']
        );
        clienteId = clienteResult.insertId;

        // Inserir endereço válido
        await connection.query(
          'INSERT INTO EnderecosClientes (id_cliente, logradouro, numero, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [clienteId, 'Rua Teste', '123', 'Centro', 'Fortaleza', 'CE', '60000-000']
        );

        await connection.commit();

        // Verificar se ambos foram inseridos
        const [clientes] = await connection.query(
          'SELECT * FROM Clientes WHERE id_cliente = ?',
          [clienteId]
        );
        expect(clientes.length).toBe(1);

        const [enderecos] = await connection.query(
          'SELECT * FROM EnderecosClientes WHERE id_cliente = ?',
          [clienteId]
        );
        expect(enderecos.length).toBe(1);
      } finally {
        // Limpar
        if (clienteId) {
          await connection.query('DELETE FROM Clientes WHERE id_cliente = ?', [clienteId]);
        }
        connection.release();
      }
    });
  });
});
