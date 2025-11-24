const db = require('../config/database');

class PedidoRepository {
  // Criar novo pedido
  async create(pedidoData) {
    const query = `
      INSERT INTO Pedidos (
        id_cliente, id_restaurante, id_endereco_cliente, 
        valor_total, metodo_pagamento, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      pedidoData.id_cliente,
      pedidoData.id_restaurante,
      pedidoData.id_endereco_cliente,
      pedidoData.valor_total,
      pedidoData.metodo_pagamento,
      pedidoData.status || 'Pendente'
    ]);
    return result.insertId;
  }

  // Buscar pedido por ID
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        r.nome as restaurante_nome,
        r.telefone as restaurante_telefone,
        r.tipo_cozinha as restaurante_tipo_cozinha,
        e.nome as entregador_nome,
        ec.logradouro as end_logradouro,
        ec.numero as end_numero,
        ec.complemento as end_complemento,
        ec.bairro as end_bairro,
        ec.cidade as end_cidade,
        ec.estado as end_estado,
        ec.cep as end_cep,
        a.id_avaliacao
      FROM Pedidos p
      LEFT JOIN Clientes c ON p.id_cliente = c.id_cliente
      LEFT JOIN Restaurantes r ON p.id_restaurante = r.id_restaurante
      LEFT JOIN Entregadores e ON p.id_entregador = e.id_entregador
      LEFT JOIN EnderecosClientes ec ON p.id_endereco_cliente = ec.id_endereco_cliente
      LEFT JOIN Avaliacoes a ON p.id_pedido = a.id_pedido
      WHERE p.id_pedido = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Buscar pedidos por cliente
  async findByClienteId(clienteId) {
    const query = `
      SELECT 
        p.*,
        r.nome as restaurante_nome,
        e.nome as entregador_nome,
        a.id_avaliacao
      FROM Pedidos p
      LEFT JOIN Restaurantes r ON p.id_restaurante = r.id_restaurante
      LEFT JOIN Entregadores e ON p.id_entregador = e.id_entregador
      LEFT JOIN Avaliacoes a ON p.id_pedido = a.id_pedido
      WHERE p.id_cliente = ?
      ORDER BY p.data_hora DESC
    `;
    const [rows] = await db.execute(query, [clienteId]);
    return rows;
  }

  // Buscar pedidos por restaurante
  async findByRestauranteId(restauranteId) {
    const query = `
      SELECT 
        p.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as entregador_nome,
        ec.logradouro as end_logradouro,
        ec.numero as end_numero,
        ec.complemento as end_complemento,
        ec.bairro as end_bairro,
        ec.cidade as end_cidade,
        ec.estado as end_estado,
        ec.cep as end_cep
      FROM Pedidos p
      LEFT JOIN Clientes c ON p.id_cliente = c.id_cliente
      LEFT JOIN Entregadores e ON p.id_entregador = e.id_entregador
      LEFT JOIN EnderecosClientes ec ON p.id_endereco_cliente = ec.id_endereco_cliente
      WHERE p.id_restaurante = ?
      ORDER BY p.data_hora DESC
    `;
    const [rows] = await db.execute(query, [restauranteId]);
    return rows;
  }

  // Buscar pedidos por status e restaurante
  async findByRestauranteAndStatus(restauranteId, status) {
    const query = `
      SELECT 
        p.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as entregador_nome,
        ec.logradouro as end_logradouro,
        ec.numero as end_numero,
        ec.complemento as end_complemento,
        ec.bairro as end_bairro,
        ec.cidade as end_cidade,
        ec.estado as end_estado,
        ec.cep as end_cep
      FROM Pedidos p
      LEFT JOIN Clientes c ON p.id_cliente = c.id_cliente
      LEFT JOIN Entregadores e ON p.id_entregador = e.id_entregador
      LEFT JOIN EnderecosClientes ec ON p.id_endereco_cliente = ec.id_endereco_cliente
      WHERE p.id_restaurante = ? AND p.status = ?
      ORDER BY p.data_hora DESC
    `;
    const [rows] = await db.execute(query, [restauranteId, status]);
    return rows;
  }

  // Atualizar status do pedido
  async updateStatus(id, status) {
    const query = 'UPDATE Pedidos SET status = ? WHERE id_pedido = ?';
    const [result] = await db.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Atribuir entregador ao pedido
  async assignEntregador(id, entregadorId) {
    const query = 'UPDATE Pedidos SET id_entregador = ? WHERE id_pedido = ?';
    const [result] = await db.execute(query, [entregadorId, id]);
    return result.affectedRows > 0;
  }

  // Verificar se pedido pertence ao cliente
  async belongsToCliente(pedidoId, clienteId) {
    const query = 'SELECT id_pedido FROM Pedidos WHERE id_pedido = ? AND id_cliente = ?';
    const [rows] = await db.execute(query, [pedidoId, clienteId]);
    return rows.length > 0;
  }

  // Verificar se pedido pertence ao restaurante
  async belongsToRestaurante(pedidoId, restauranteId) {
    const query = 'SELECT id_pedido FROM Pedidos WHERE id_pedido = ? AND id_restaurante = ?';
    const [rows] = await db.execute(query, [pedidoId, restauranteId]);
    return rows.length > 0;
  }

  // Deletar pedido (apenas para casos específicos)
  async delete(id) {
    const query = 'DELETE FROM Pedidos WHERE id_pedido = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new PedidoRepository();
